import { Suspense } from 'react';

import { MountainIcon } from 'lucide-react';
import Link from 'next/link';

import { PlanContents } from './plan-contents';

export default function PlanPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b px-6">
        <Link
          href="/"
          className="text-primary flex items-center gap-2 font-serif text-xl font-bold"
        >
          <MountainIcon className="h-6 w-6" />
          ItinApp
        </Link>
      </header>

      <main className="container mx-auto max-w-3xl flex-1 px-4 py-12">
        <Suspense fallback={<PlanSkeleton />}>
          <PlanContents />
        </Suspense>
      </main>
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="bg-muted h-8 w-3/5 rounded-md" />
        <div className="bg-muted h-6 w-4/5 rounded-md" />
      </div>
      <div className="bg-muted/20 h-48 rounded-lg border border-dashed" />
    </div>
  );
}
