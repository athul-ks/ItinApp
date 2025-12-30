import { MountainIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PlanContents } from "./plan-contents";

export default function PlanPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center px-6 h-14 border-b">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif font-bold text-xl text-primary"
        >
          <MountainIcon className="h-6 w-6" />
          ItenApp
        </Link>
      </header>

      <main className="container flex-1 px-4 py-12 mx-auto max-w-3xl">
        <Suspense fallback={<PlanSkeleton />}>
          <PlanContents />
        </Suspense>
      </main>
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-3/5 rounded-md bg-muted" />
        <div className="h-6 w-4/5 rounded-md bg-muted" />
      </div>
      <div className="h-48 rounded-lg border border-dashed bg-muted/20" />
    </div>
  );
}
