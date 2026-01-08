'use client';

import { Coins } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { Skeleton } from '@itinapp/ui/components/skeleton';

export function CreditBadge() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Skeleton className="h-9 w-24 rounded-full" />;
  }

  if (!session?.user) return null;

  const credits = session.user.credits;
  const isLow = credits === 0;

  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        isLow ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 bg-white text-gray-700'
      }`}
    >
      <Coins className={`h-4 w-4 ${isLow ? 'text-red-500' : 'text-yellow-500'}`} />
      <span>
        {credits} {credits === 1 ? 'Credit' : 'Credits'}
      </span>
    </div>
  );
}
