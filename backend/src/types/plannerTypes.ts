import { z } from 'zod';

export const CategoryEnum = z.enum([
  'MOVIE',
  'EVENT',
  'SPORTS',
  'ATTRACTION',
  'EXPERIENCE',
  'RESTAURANT',
  'HOTEL',
  'TRAVEL',
  'TRANSFER'
]);

export type MarketplaceCategory = z.infer<typeof CategoryEnum>;

export const PaceEnum = z.enum(['relaxed', 'moderate', 'packed']);
export type PaceOption = z.infer<typeof PaceEnum>;

export const PlannerRequestSchema = z.object({
  prompt: z.string().optional(),
  city: z.string().min(1, 'City is required').default('Kolkata'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  date: z.string().default(() => new Date().toISOString().split('T')[0]),
  startTime: z.string().default('09:00'),
  endTime: z.string().default('22:00'),
  budget: z.number().min(0, 'Budget cannot be negative').default(3000),
  currency: z.string().default('INR'),
  guests: z.number().min(1).default(1),
  adults: z.number().min(1).default(1),
  children: z.number().min(0).default(0),
  interests: z.array(z.string()).default([]),
  categories: z.array(CategoryEnum).default(['RESTAURANT', 'ATTRACTION', 'EXPERIENCE', 'EVENT', 'MOVIE', 'SPORTS']),
  foodPreferences: z.array(z.string()).optional(),
  activityPreferences: z.array(z.string()).optional(),
  transportPreference: z.string().optional(),
  pace: PaceEnum.default('moderate')
});

export type PlannerRequest = z.infer<typeof PlannerRequestSchema>;

export interface DayPlanItem {
  id: string;
  category: MarketplaceCategory;
  inventoryId: string;
  title: string;
  description?: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  durationMinutes: number;
  priceFrom: number;
  estimatedCost: number;
  distanceKm: number | null;
  travelTimeMinutes: number;
  location: string;
  city: string;
  latitude?: number;
  longitude?: number;
  availability: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  bookingUrl: string;
  rating?: number;
  image?: string;
  metadata?: Record<string, any>;
}

export interface DayPlan {
  id: string;
  city: string;
  date: string;
  budget: number;
  estimatedTotal: number;
  remainingBudget: number;
  currency: string;
  items: DayPlanItem[];
  warnings: string[];
  assumptions: string[];
  aiExplanation?: string;
  isFallback?: boolean;
}

export interface CandidateItem {
  inventoryId: string;
  category: MarketplaceCategory;
  title: string;
  description: string;
  city: string;
  location: string;
  latitude?: number;
  longitude?: number;
  priceFrom: number;
  currency: string;
  rating: number;
  reviewCount?: number;
  availability: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  image: string;
  metadata?: Record<string, any>;
}

export interface PlannerRegenerateRequest {
  currentPlan: DayPlan;
  modificationInstruction?: string;
  action?: 'REPLACE' | 'REMOVE' | 'MOVE' | 'CHANGE_CATEGORY' | 'REGENERATE_ALL' | 'MAKE_CHEAPER';
  targetItemId?: string;
  targetCategory?: MarketplaceCategory;
  targetTime?: string;
  updatedConstraints?: Partial<PlannerRequest>;
}
