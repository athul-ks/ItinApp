"use client";

import { useSearchParams } from "next/navigation";

export function PlanContents() {
  const destination = useSearchParams().get("destination");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trip to {destination}</h1>
        <p className="text-muted-foreground">
          Let&apos;s finalize the details for your trip.
        </p>
      </div>

      <div className="flex items-center justify-center p-12 border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
        Trip Wizard Component Loading...
      </div>
    </div>
  );
}
