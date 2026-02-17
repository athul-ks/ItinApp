import { Suspense } from 'react';

import { redirect } from 'next/navigation';

import { PlanContents } from './plan-contents';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PlanPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const destination = params.destination;

  if (!destination || typeof destination !== 'string' || destination.trim() === '') {
    redirect('/');
  }

  return (
    <main className="container mx-auto max-w-3xl flex-1 px-4 py-12">
      <Suspense fallback={<PlanSkeleton />}>
        <PlanContents />
      </Suspense>
    </main>
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
