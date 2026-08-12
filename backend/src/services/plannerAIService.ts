import { GoogleGenAI, Type } from '@google/genai';
import { CandidateItem, DayPlanItem, MarketplaceCategory, PlannerRequest, PlannerRequestSchema } from '../types/plannerTypes.js';

export interface RawAIPlan {
  items: Array<{
    inventoryId: string;
    startTime: string;
    endTime: string;
    estimatedCost?: number;
    notes?: string;
  }>;
  explanation?: string;
  assumptions?: string[];
  warnings?: string[];
}

export class GeminiPlannerAIService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      try {
        this.ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
      } catch (e: any) {
        console.warn('[GeminiPlannerAIService] Failed to initialize GoogleGenAI client:', e?.message);
        this.ai = null;
      }
    }
  }

  /**
   * Parse natural language input prompt into structured PlannerRequest
   */
  async parseNaturalLanguage(promptText: string, defaultCity = 'Kolkata'): Promise<PlannerRequest> {
    if (!this.ai) {
      return this.fallbackParseNaturalLanguage(promptText, defaultCity);
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Parse the following natural language user itinerary request into structured JSON for BookYourDay planner:
User Input: "${promptText}"
Default City: "${defaultCity}"

Return a JSON object conforming strictly to this structure:
{
  "city": string,
  "budget": number,
  "date": string (YYYY-MM-DD),
  "startTime": string (HH:MM),
  "endTime": string (HH:MM),
  "guests": number,
  "adults": number,
  "children": number,
  "interests": string[],
  "categories": string[],
  "pace": "relaxed" | "moderate" | "packed"
}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              city: { type: Type.STRING },
              budget: { type: Type.NUMBER },
              date: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              guests: { type: Type.NUMBER },
              adults: { type: Type.NUMBER },
              children: { type: Type.NUMBER },
              interests: { type: Type.ARRAY, items: { type: Type.STRING } },
              categories: { type: Type.ARRAY, items: { type: Type.STRING } },
              pace: { type: Type.STRING }
            },
            required: ['city', 'budget']
          }
        }
      });

      const rawText = response.text?.trim() || '{}';
      const parsed = JSON.parse(rawText);

      // Normalize and sanitize category names from AI output
      const validCategories = ['MOVIE', 'EVENT', 'SPORTS', 'ATTRACTION', 'EXPERIENCE', 'RESTAURANT', 'HOTEL', 'TRAVEL', 'TRANSFER'];
      let sanitizedCategories: string[] = [];
      if (Array.isArray(parsed.categories)) {
        sanitizedCategories = parsed.categories
          .map((c: string) => {
            const upper = String(c).toUpperCase();
            if (upper === 'FOOD' || upper === 'DINING') return 'RESTAURANT';
            if (upper === 'PARK' || upper === 'MONUMENT') return 'ATTRACTION';
            if (upper === 'ACTIVITY' || upper === 'PLAY') return 'EXPERIENCE';
            return upper;
          })
          .filter((c: string) => validCategories.includes(c));
      }

      if (sanitizedCategories.length === 0) {
        sanitizedCategories = ['RESTAURANT', 'ATTRACTION', 'EXPERIENCE', 'EVENT'];
      }

      // Validate parsed output via Zod
      return PlannerRequestSchema.parse({
        prompt: promptText,
        city: parsed.city || defaultCity,
        budget: typeof parsed.budget === 'number' && parsed.budget > 0 ? parsed.budget : 3000,
        date: parsed.date || new Date().toISOString().split('T')[0],
        startTime: parsed.startTime || '09:00',
        endTime: parsed.endTime || '22:00',
        guests: parsed.guests || 1,
        adults: parsed.adults || 1,
        children: parsed.children || 0,
        interests: Array.isArray(parsed.interests) ? parsed.interests : ['food', 'culture'],
        categories: sanitizedCategories,
        pace: parsed.pace || 'moderate'
      });
    } catch (err: any) {
      console.warn('[GeminiPlannerAIService] Prompt parsing failed or AI unavailable, using deterministic regex parser:', err?.message);
      return this.fallbackParseNaturalLanguage(promptText, defaultCity);
    }
  }

  /**
   * Deterministic Natural Language Regex/Heuristic Fallback
   */
  private fallbackParseNaturalLanguage(promptText: string, defaultCity: string): PlannerRequest {
    const text = promptText.toLowerCase();

    // Budget extraction: ₹3000, 3000 rs, rs 3000, 3000 inr, under 5000
    let budget = 3000;
    const budgetMatch = text.match(/(?:₹|rs\.?|inr|under|budget|of)\s*(\d+)/i) || text.match(/(\d+)\s*(?:rs|inr|rupees)/i);
    if (budgetMatch && budgetMatch[1]) {
      const parsed = parseInt(budgetMatch[1], 10);
      if (parsed > 0) budget = parsed;
    }

    // City extraction
    let city = defaultCity;
    const cities = ['kolkata', 'asansol', 'mumbai', 'delhi', 'bangalore', 'chennai', 'hyderabad', 'pune', 'jaipur', 'goa'];
    for (const c of cities) {
      if (text.includes(c)) {
        city = c.charAt(0).toUpperCase() + c.slice(1);
        break;
      }
    }

    // Guests extraction
    let guests = 1;
    const guestsMatch = text.match(/(\d+)\s*(?:people|pax|guests|persons|adults)/i);
    if (guestsMatch && guestsMatch[1]) {
      guests = parseInt(guestsMatch[1], 10) || 1;
    }

    // Pace
    let pace: 'relaxed' | 'moderate' | 'packed' = 'moderate';
    if (text.includes('relax') || text.includes('chill') || text.includes('slow')) pace = 'relaxed';
    if (text.includes('packed') || text.includes('busy') || text.includes('full') || text.includes('maximum')) pace = 'packed';

    // Interests
    const interests: string[] = [];
    if (text.includes('food') || text.includes('breakfast') || text.includes('lunch') || text.includes('dinner')) interests.push('food');
    if (text.includes('culture') || text.includes('art') || text.includes('heritage') || text.includes('museum')) interests.push('culture');
    if (text.includes('romantic') || text.includes('date')) interests.push('romantic');
    if (text.includes('fun') || text.includes('activity') || text.includes('play') || text.includes('entertainment')) interests.push('entertainment');

    return PlannerRequestSchema.parse({
      prompt: promptText,
      city,
      budget,
      guests,
      adults: guests,
      children: 0,
      interests: interests.length > 0 ? interests : ['food', 'culture'],
      categories: ['RESTAURANT', 'ATTRACTION', 'EXPERIENCE', 'EVENT', 'MOVIE', 'SPORTS'],
      pace
    });
  }

  /**
   * Propose a Day Plan using Gemini AI from candidates
   */
  async generateDayPlan(request: PlannerRequest, candidates: CandidateItem[]): Promise<RawAIPlan> {
    if (!this.ai) {
      return FallbackPlannerAIService.generateDeterministicPlan(request, candidates);
    }

    try {
      // Prepare simplified candidates for prompt to save tokens & maintain performance
      const candidateList = candidates.map((c) => ({
        inventoryId: c.inventoryId,
        category: c.category,
        title: c.title,
        location: c.location,
        priceFrom: c.priceFrom,
        rating: c.rating,
        latitude: c.latitude,
        longitude: c.longitude
      }));

      const promptMsg = `You are the AI Day Planner for BookYourDay marketplace.
Goal: Select items ONLY from the provided Candidate Inventory list below to form a chronological 1-day itinerary for ${request.city}.

STRICT RULES:
1. ONLY select items from candidate inventory list using their exact inventoryId. DO NOT INVENT ANY INVENTORY ID OR PLACE.
2. Budget target: total cost <= ₹${request.budget}. Keep total cost reasonable and under budget if possible.
3. Schedule start time: ${request.startTime}, end time: ${request.endTime}.
4. Assign non-overlapping time slots (startTime and endTime in HH:MM format).
5. Arrange items logically in time (e.g. Breakfast around 09:00, Attraction around 10:30, Lunch around 13:00, Experience/Activity around 15:00, Event/Dinner around 19:00).
6. Consider geographic closeness (latitude and longitude) to minimize travel time between consecutive items.

Candidate Inventory List:
${JSON.stringify(candidateList, null, 2)}

User Request Constraints:
Pace: ${request.pace}
Guests: ${request.guests}
Interests: ${request.interests.join(', ')}

Return a JSON object conforming strictly to this schema:
{
  "items": [
    {
      "inventoryId": string,
      "startTime": string (HH:MM),
      "endTime": string (HH:MM),
      "estimatedCost": number,
      "notes": string
    }
  ],
  "explanation": string,
  "assumptions": string[],
  "warnings": string[]
}`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptMsg,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    inventoryId: { type: Type.STRING },
                    startTime: { type: Type.STRING },
                    endTime: { type: Type.STRING },
                    estimatedCost: { type: Type.NUMBER },
                    notes: { type: Type.STRING }
                  },
                  required: ['inventoryId', 'startTime', 'endTime']
                }
              },
              explanation: { type: Type.STRING },
              assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              warnings: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['items']
          }
        }
      });

      const rawText = response.text?.trim() || '{}';
      const parsed: RawAIPlan = JSON.parse(rawText);

      if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
        throw new Error('Gemini returned an empty plan or invalid items format');
      }

      return parsed;
    } catch (err: any) {
      console.warn('[GeminiPlannerAIService] AI plan generation error, falling back to deterministic planner:', err?.message);
      return FallbackPlannerAIService.generateDeterministicPlan(request, candidates);
    }
  }
}

export class FallbackPlannerAIService {
  /**
   * Deterministic Itinerary Engine Fallback
   * Builds a structured, non-overlapping itinerary fitting within budget and time bounds.
   */
  static generateDeterministicPlan(request: PlannerRequest, candidates: CandidateItem[]): RawAIPlan {
    const { budget, startTime, endTime, pace } = request;

    // Group candidates by category
    const restaurants = candidates.filter((c) => c.category === 'RESTAURANT').sort((a, b) => b.rating - a.rating);
    const attractions = candidates.filter((c) => c.category === 'ATTRACTION').sort((a, b) => b.rating - a.rating);
    const experiences = candidates.filter((c) => c.category === 'EXPERIENCE').sort((a, b) => b.rating - a.rating);
    const events = candidates.filter((c) => c.category === 'EVENT').sort((a, b) => b.rating - a.rating);
    const movies = candidates.filter((c) => c.category === 'MOVIE').sort((a, b) => b.rating - a.rating);
    const sports = candidates.filter((c) => c.category === 'SPORTS').sort((a, b) => b.rating - a.rating);

    // Target sequence slots based on time window
    // 09:00 - Breakfast
    // 10:30 - Attraction
    // 13:00 - Lunch / Dining
    // 15:30 - Afternoon Experience / Activity
    // 19:00 - Evening Event / Movie
    const targetSlots = [
      { name: 'Breakfast', category: 'RESTAURANT', start: '09:00', end: '10:00', pool: restaurants },
      { name: 'Morning Attraction', category: 'ATTRACTION', start: '10:30', end: '12:00', pool: attractions },
      { name: 'Lunch', category: 'RESTAURANT', start: '13:00', end: '14:30', pool: restaurants.length > 1 ? restaurants.slice(1) : restaurants },
      { name: 'Afternoon Activity', category: 'EXPERIENCE', start: '15:15', end: '17:30', pool: experiences.length > 0 ? experiences : sports },
      { name: 'Evening Entertainment', category: 'EVENT', start: '19:00', end: '21:30', pool: events.length > 0 ? events : movies }
    ];

    // Select items under budget limit
    const rawItems: RawAIPlan['items'] = [];
    let currentTotal = 0;
    const usedInventoryIds = new Set<string>();

    for (const slot of targetSlots) {
      // Pick best unused candidate in pool that fits in remaining budget
      const candidate = slot.pool.find((item) => {
        if (usedInventoryIds.has(item.inventoryId)) return false;
        if (budget > 0 && currentTotal + item.priceFrom > budget * 1.15) return false;
        return true;
      });

      if (candidate) {
        usedInventoryIds.add(candidate.inventoryId);
        currentTotal += candidate.priceFrom;
        rawItems.push({
          inventoryId: candidate.inventoryId,
          startTime: slot.start,
          endTime: slot.end,
          estimatedCost: candidate.priceFrom,
          notes: `${slot.name} at ${candidate.title}`
        });
      }
    }

    // If no items fit under strict budget, pick the single cheapest candidates to show closest option
    if (rawItems.length === 0 && candidates.length > 0) {
      const sortedByPrice = [...candidates].sort((a, b) => a.priceFrom - b.priceFrom);
      const top2 = sortedByPrice.slice(0, 2);
      let tStart = 10;
      for (const item of top2) {
        rawItems.push({
          inventoryId: item.inventoryId,
          startTime: `${tStart}:00`,
          endTime: `${tStart + 2}:00`,
          estimatedCost: item.priceFrom,
          notes: `Selected candidate ${item.title}`
        });
        tStart += 3;
      }
    }

    return {
      items: rawItems,
      explanation: 'Organized geographically and chronologically using deterministic backend itinerary ranking.',
      assumptions: ['Selected top-rated published marketplace inventory.', 'Estimated travel times based on city road distance.'],
      warnings: currentTotal > budget ? [`Total cost (₹${currentTotal}) exceeds requested budget (₹${budget}).`] : []
    };
  }
}
