import { Request, Response } from 'express';
import { PlannerRequestSchema, DayPlan, PlannerRegenerateRequest } from '../types/plannerTypes.js';
import { CandidateRetrievalService } from '../services/candidateRetrievalService.js';
import { GeminiPlannerAIService, FallbackPlannerAIService } from '../services/plannerAIService.js';
import { PlanVerificationService } from '../services/planVerificationService.js';

export class PlannerController {
  private static aiService = new GeminiPlannerAIService();

  /**
   * POST /api/planner/parse-prompt
   * Parse natural language text into a structured PlannerRequest object
   */
  public static async parsePrompt(req: Request, res: Response) {
    try {
      const { prompt, defaultCity } = req.body || {};
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing required string field "prompt"'
        });
      }

      const parsedRequest = await PlannerController.aiService.parseNaturalLanguage(
        prompt,
        defaultCity || 'Kolkata'
      );

      return res.json({
        success: true,
        request: parsedRequest
      });
    } catch (err: any) {
      console.error('[PlannerController.parsePrompt] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse natural language request: ' + (err?.message || 'Internal error')
      });
    }
  }

  /**
   * POST /api/planner/generate
   * Main AI Day Planner Generation Endpoint
   */
  public static async generatePlan(req: Request, res: Response) {
    try {
      let rawBody = req.body || {};

      // If user passed a raw natural language prompt in req.body.prompt, parse it first
      if (rawBody.prompt && typeof rawBody.prompt === 'string' && (!rawBody.city || !rawBody.budget)) {
        const parsed = await PlannerController.aiService.parseNaturalLanguage(
          rawBody.prompt,
          rawBody.city || 'Kolkata'
        );
        rawBody = { ...parsed, ...rawBody };
      }

      // Input Validation & Sanitization via Zod
      const parseResult = PlannerRequestSchema.safeParse(rawBody);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid planner request format',
          details: parseResult.error.format()
        });
      }

      const plannerRequest = parseResult.data;

      // Sanitization: Ensure positive budget
      if (plannerRequest.budget < 0) {
        return res.status(400).json({
          success: false,
          error: 'Budget cannot be negative'
        });
      }

      // Step 1: Candidate Inventory Retrieval (Bounded marketplace search)
      const candidates = await CandidateRetrievalService.getCandidates(plannerRequest, 35);

      // Step 2: AI Proposal Generation (Gemini or Fallback)
      let rawAIPlan;
      try {
        rawAIPlan = await PlannerController.aiService.generateDayPlan(plannerRequest, candidates);
      } catch (e: any) {
        console.warn('[PlannerController] Gemini generation failed, switching to Fallback:', e?.message);
        rawAIPlan = FallbackPlannerAIService.generateDeterministicPlan(plannerRequest, candidates);
      }

      // Step 3: Authoritative Backend Verification & Overlap/Price Enforcement
      const verifiedDayPlan = PlanVerificationService.verifyPlan(rawAIPlan, plannerRequest, candidates);

      return res.json({
        success: true,
        plan: verifiedDayPlan,
        candidateCount: candidates.length
      });
    } catch (err: any) {
      console.error('[PlannerController.generatePlan] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate itinerary plan: ' + (err?.message || 'Internal error')
      });
    }
  }

  /**
   * POST /api/planner/regenerate
   * Regenerate or modify an existing itinerary plan
   */
  public static async regeneratePlan(req: Request, res: Response) {
    try {
      const {
        currentPlan,
        modificationInstruction,
        action,
        targetItemId,
        targetCategory,
        targetTime,
        updatedConstraints
      } = (req.body || {}) as PlannerRegenerateRequest;

      if (!currentPlan || !currentPlan.city) {
        return res.status(400).json({
          success: false,
          error: 'Missing valid currentPlan object'
        });
      }

      // Construct base request
      const baseRequest = PlannerRequestSchema.parse({
        city: currentPlan.city,
        date: currentPlan.date,
        budget: updatedConstraints?.budget ?? currentPlan.budget,
        currency: currentPlan.currency,
        ...(updatedConstraints || {})
      });

      // Retrieve candidates
      const candidates = await CandidateRetrievalService.getCandidates(baseRequest, 40);

      let rawAIPlan;

      // Handle targeted item modifications
      if (action === 'REMOVE' && targetItemId) {
        // Remove target item and re-verify remaining
        const remainingItems = currentPlan.items
          .filter((item) => item.id !== targetItemId && item.inventoryId !== targetItemId)
          .map((item) => ({
            inventoryId: item.inventoryId,
            startTime: item.startTime,
            endTime: item.endTime,
            estimatedCost: item.estimatedCost
          }));

        rawAIPlan = {
          items: remainingItems,
          explanation: `Removed item from your itinerary and updated travel sequence.`,
          assumptions: [],
          warnings: []
        };
      } else if (action === 'REPLACE' && targetItemId) {
        // Replace target item with another top candidate of same/new category
        const targetItem = currentPlan.items.find((i) => i.id === targetItemId || i.inventoryId === targetItemId);
        const reqCategory = targetCategory || targetItem?.category || 'ATTRACTION';

        const usedIds = new Set(currentPlan.items.map((i) => i.inventoryId));
        const replacement = candidates.find(
          (c) => c.category === reqCategory && !usedIds.has(c.inventoryId)
        ) || candidates.find((c) => !usedIds.has(c.inventoryId));

        const updatedItems = currentPlan.items.map((item) => {
          if (item.id === targetItemId || item.inventoryId === targetItemId) {
            return {
              inventoryId: replacement ? replacement.inventoryId : item.inventoryId,
              startTime: item.startTime,
              endTime: item.endTime,
              estimatedCost: replacement ? replacement.priceFrom : item.estimatedCost
            };
          }
          return {
            inventoryId: item.inventoryId,
            startTime: item.startTime,
            endTime: item.endTime,
            estimatedCost: item.estimatedCost
          };
        });

        rawAIPlan = {
          items: updatedItems,
          explanation: `Replaced item with ${replacement ? replacement.title : 'alternative option'}.`,
          assumptions: [],
          warnings: []
        };
      } else if (action === 'MOVE' && targetItemId && targetTime) {
        // Shift item start time
        const updatedItems = currentPlan.items.map((item) => {
          if (item.id === targetItemId || item.inventoryId === targetItemId) {
            const startMin = PlanVerificationService.timeStringToMinutes(targetTime);
            const duration = item.durationMinutes || 90;
            const endMin = startMin + duration;
            return {
              inventoryId: item.inventoryId,
              startTime: PlanVerificationService.minutesToTimeString(startMin),
              endTime: PlanVerificationService.minutesToTimeString(endMin),
              estimatedCost: item.estimatedCost
            };
          }
          return {
            inventoryId: item.inventoryId,
            startTime: item.startTime,
            endTime: item.endTime,
            estimatedCost: item.estimatedCost
          };
        });

        rawAIPlan = {
          items: updatedItems,
          explanation: `Updated time slot for target activity.`,
          assumptions: [],
          warnings: []
        };
      } else if (action === 'MAKE_CHEAPER' || (modificationInstruction && modificationInstruction.toLowerCase().includes('cheap'))) {
        // Filter candidates to lower cost tier
        const cheaperBudget = Math.max(500, Math.round(baseRequest.budget * 0.75));
        baseRequest.budget = cheaperBudget;
        rawAIPlan = FallbackPlannerAIService.generateDeterministicPlan(baseRequest, candidates);
      } else {
        // Full AI Regeneration with instructions
        try {
          rawAIPlan = await PlannerController.aiService.generateDayPlan(baseRequest, candidates);
        } catch (e) {
          rawAIPlan = FallbackPlannerAIService.generateDeterministicPlan(baseRequest, candidates);
        }
      }

      // Re-verify plan authoritatively
      const verifiedPlan = PlanVerificationService.verifyPlan(rawAIPlan, baseRequest, candidates);

      return res.json({
        success: true,
        plan: verifiedPlan
      });
    } catch (err: any) {
      console.error('[PlannerController.regeneratePlan] Error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to regenerate plan: ' + (err?.message || 'Internal error')
      });
    }
  }
}
