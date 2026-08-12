import { DayPlan, PlannerRequest } from '../types';

export class PlannerService {
  /**
   * Parse natural language text prompt into structured PlannerRequest
   */
  static async parsePrompt(prompt: string, defaultCity = 'Kolkata'): Promise<PlannerRequest> {
    try {
      const res = await fetch('/api/planner/parse-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, defaultCity })
      });
      const data = await res.json();
      if (data.success && data.request) {
        return data.request;
      }
      throw new Error(data.error || 'Failed to parse prompt');
    } catch (e: any) {
      console.warn('[PlannerService.parsePrompt] Error:', e?.message);
      // Client-side fallback request
      return {
        prompt,
        city: defaultCity,
        budget: 3000,
        guests: 1,
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '22:00',
        pace: 'moderate',
        interests: ['food', 'culture']
      };
    }
  }

  /**
   * Generate an AI Day Plan
   */
  static async generatePlan(request: PlannerRequest): Promise<DayPlan> {
    const res = await fetch('/api/planner/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.plan) {
      throw new Error(data.error || 'Failed to generate itinerary plan');
    }

    return data.plan;
  }

  /**
   * Regenerate or modify an existing plan
   */
  static async regeneratePlan(
    currentPlan: DayPlan,
    options: {
      modificationInstruction?: string;
      action?: 'REPLACE' | 'REMOVE' | 'MOVE' | 'CHANGE_CATEGORY' | 'REGENERATE_ALL' | 'MAKE_CHEAPER';
      targetItemId?: string;
      targetCategory?: string;
      targetTime?: string;
      updatedConstraints?: Partial<PlannerRequest>;
    }
  ): Promise<DayPlan> {
    const res = await fetch('/api/planner/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPlan,
        ...options
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.plan) {
      throw new Error(data.error || 'Failed to modify or regenerate plan');
    }

    return data.plan;
  }
}
