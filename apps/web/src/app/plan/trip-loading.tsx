'use client';

import { useEffect, useState } from 'react';

import { BedDouble, CalendarCheck, Map, Sparkles, Utensils } from 'lucide-react';

import { Card, CardContent } from '@itinapp/ui/components/card';
import { Progress } from '@itinapp/ui/components/progress';

const LOADING_STEPS = [
  { message: 'Analyzing destination vibe...', icon: Map },
  { message: 'Scouting top-rated restaurants...', icon: Utensils },
  { message: 'Checking accommodation prices...', icon: BedDouble },
  { message: 'Optimizing travel routes...', icon: CalendarCheck },
  { message: 'Finalizing your 3 options...', icon: Sparkles },
];

export function TripLoading({ destination }: { destination: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + Math.random() * 5));
    }, 1500);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  const CurrentIcon = LOADING_STEPS[currentStep].icon;

  return (
    <div className="animate-in fade-in zoom-in w-full max-w-2xl duration-500">
      <div className="mb-8 text-center">
        <span className="text-primary animate-pulse text-sm font-bold tracking-widest uppercase">
          Building Itinerary
        </span>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Curating {destination}</h1>
        <p className="text-muted-foreground mt-2">
          Our AI is building your perfect trip. Please wait...
        </p>
      </div>

      <Card className="border shadow-xl">
        <CardContent className="space-y-10 p-12">
          <div className="flex justify-center">
            <div className="bg-primary/10 relative rounded-full p-6">
              <CurrentIcon className="text-primary h-16 w-16 animate-pulse transition-all duration-500" />
              <div className="border-primary/20 border-t-primary absolute inset-0 animate-spin rounded-full border-4" />
            </div>
          </div>

          <div className="mx-auto max-w-md space-y-4 text-center">
            <h3 className="min-h-7 text-xl font-semibold transition-all duration-300">
              {LOADING_STEPS[currentStep].message}
            </h3>

            <div className="space-y-2">
              <Progress value={progress} className="h-3 w-full" />
              <p className="text-muted-foreground text-right text-xs">{Math.round(progress)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
