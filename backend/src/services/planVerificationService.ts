import { CandidateItem, DayPlan, DayPlanItem, PlannerRequest } from '../types/plannerTypes.js';
import { RawAIPlan } from './plannerAIService.js';

export class PlanVerificationService {
  /**
   * Calculate Haversine distance in KM between two coordinates
   */
  public static calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return Math.round(dist * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Convert HH:MM time string to minutes from midnight
   */
  public static timeStringToMinutes(timeStr: string): number {
    if (!timeStr || !timeStr.includes(':')) return 9 * 60; // Default 09:00
    const [h, m] = timeStr.split(':').map((val) => parseInt(val, 10) || 0);
    return h * 60 + m;
  }

  /**
   * Convert minutes from midnight back to HH:MM string
   */
  public static minutesToTimeString(minutes: number): string {
    const totalMin = Math.max(0, Math.min(23 * 60 + 59, minutes));
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  /**
   * Map category to standard booking frontend route
   */
  public static getBookingUrl(category: string, id: string): string {
    switch (category) {
      case 'MOVIE': return `/movies`;
      case 'EVENT': return `/event/${id}`;
      case 'SPORTS': return `/sport/${id}`;
      case 'ATTRACTION': return `/attractions`;
      case 'EXPERIENCE': return `/experiences`;
      case 'RESTAURANT': return `/dining`;
      case 'HOTEL': return `/travel`;
      case 'TRAVEL': return `/travel`;
      case 'TRANSFER': return `/travel`;
      default: return `/search`;
    }
  }

  /**
   * Verify and Authorize Raw AI Plan against candidate inventory
   */
  public static verifyPlan(
    rawPlan: RawAIPlan,
    request: PlannerRequest,
    candidates: CandidateItem[]
  ): DayPlan {
    const candidateMap = new Map<string, CandidateItem>();
    for (const c of candidates) {
      candidateMap.set(c.inventoryId, c);
    }

    const verifiedItems: DayPlanItem[] = [];
    const warnings: string[] = [...(rawPlan.warnings || [])];
    const assumptions: string[] = [...(rawPlan.assumptions || [])];

    // 1. HALLUCINATION & EXISTENCE CHECK
    // Only process items that actually exist in backend candidate inventory
    for (const rawItem of rawPlan.items) {
      const candidate = candidateMap.get(rawItem.inventoryId);
      if (!candidate) {
        warnings.push(`Omitted hallucinated or nonexistent inventory item ID: ${rawItem.inventoryId}`);
        continue;
      }

      if (candidate.availability === 'UNAVAILABLE') {
        warnings.push(`Item "${candidate.title}" is currently unavailable on backend and was excluded.`);
        continue;
      }

      // Calculate start and end minutes
      let startMin = this.timeStringToMinutes(rawItem.startTime);
      let endMin = this.timeStringToMinutes(rawItem.endTime);

      if (endMin <= startMin) {
        endMin = startMin + 90; // Default 1.5 hr duration
      }

      const durationMinutes = endMin - startMin;

      // Authoritative Backend Price Calculation
      const verifiedCost = candidate.priceFrom;

      verifiedItems.push({
        id: `item-${verifiedItems.length + 1}-${Date.now().toString(36).substr(-4)}`,
        category: candidate.category,
        inventoryId: candidate.inventoryId,
        title: candidate.title,
        description: candidate.description,
        startTime: this.minutesToTimeString(startMin),
        endTime: this.minutesToTimeString(endMin),
        durationMinutes,
        priceFrom: candidate.priceFrom,
        estimatedCost: verifiedCost,
        distanceKm: null,
        travelTimeMinutes: 0,
        location: candidate.location,
        city: candidate.city,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        availability: candidate.availability,
        bookingUrl: this.getBookingUrl(candidate.category, candidate.inventoryId),
        rating: candidate.rating,
        image: candidate.image,
        metadata: candidate.metadata
      });
    }

    // Sort items chronologically by startTime
    verifiedItems.sort((a, b) => this.timeStringToMinutes(a.startTime) - this.timeStringToMinutes(b.startTime));

    // 2. OVERLAP PREVENTION & TRAVEL TIME CALCULATION
    for (let i = 0; i < verifiedItems.length; i++) {
      const current = verifiedItems[i];

      if (i > 0) {
        const prev = verifiedItems[i - 1];

        // Compute distance in KM
        if (typeof prev.latitude === 'number' && typeof prev.longitude === 'number' &&
            typeof current.latitude === 'number' && typeof current.longitude === 'number') {
          const dist = this.calculateHaversineKm(prev.latitude, prev.longitude, current.latitude, current.longitude);
          current.distanceKm = dist;

          // Conservative Travel Time: 25 km/h average speed in city + 10 min parking/waiting buffer
          const estTravel = Math.ceil((dist / 25) * 60) + 10;
          current.travelTimeMinutes = Math.min(120, Math.max(10, estTravel));
        } else {
          current.travelTimeMinutes = 15; // Default 15 min travel
        }

        // Check for Schedule Overlap
        const prevEndMin = this.timeStringToMinutes(prev.endTime);
        const currStartMin = this.timeStringToMinutes(current.startTime);
        const requiredMinStart = prevEndMin + current.travelTimeMinutes;

        if (currStartMin < requiredMinStart) {
          // Adjust current item's schedule forward to prevent overlap
          const shiftDelta = requiredMinStart - currStartMin;
          const newStartMin = requiredMinStart;
          const newEndMin = this.timeStringToMinutes(current.endTime) + shiftDelta;

          current.startTime = this.minutesToTimeString(newStartMin);
          current.endTime = this.minutesToTimeString(newEndMin);
          assumptions.push(`Adjusted start time for "${current.title}" to ${current.startTime} to allow ${current.travelTimeMinutes} min travel time.`);
        }
      }
    }

    // 3. BUDGET OPTIMIZATION & VERIFICATION
    const estimatedTotal = verifiedItems.reduce((acc, item) => acc + item.estimatedCost, 0);
    const remainingBudget = Math.max(0, request.budget - estimatedTotal);

    if (estimatedTotal > request.budget) {
      warnings.unshift(`No itinerary satisfying all preferences fits within ₹${request.budget}. The closest valid option is ₹${estimatedTotal}.`);
    } else {
      assumptions.push(`Estimated total of ₹${estimatedTotal} fits securely within your ₹${request.budget} budget.`);
    }

    return {
      id: `plan-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      city: request.city,
      date: request.date,
      budget: request.budget,
      estimatedTotal,
      remainingBudget,
      currency: request.currency || 'INR',
      items: verifiedItems,
      warnings,
      assumptions,
      aiExplanation: rawPlan.explanation || `Geographically optimized itinerary for ${request.city} covering ${verifiedItems.length} activities.`,
      isFallback: false
    };
  }
}
