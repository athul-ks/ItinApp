import type { RouterOutputs } from '@/trpc/react';

export type Trip = RouterOutputs['trip']['getById'];
export type TripOption = RouterOutputs['trip']['generate']['tripData'][number];
export type DayPlan = TripOption['itinerary'][number];
export type DaySection = DayPlan['morning'];
