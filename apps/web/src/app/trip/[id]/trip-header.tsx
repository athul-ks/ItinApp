import Image from 'next/image';

import { TripOption } from '@/types/trpc';

type TripHeaderProps = {
  plan: TripOption;
  image: { url: string; alt: string; credit: { name: string; link: string } } | null;
};

export default function TripHeader({ plan, image }: TripHeaderProps) {
  return (
    <>
      {image && (
        <>
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/40 to-transparent" />
        </>
      )}

      <div className="relative z-20 px-6 pt-12 pb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            {plan.vibe} Vibe
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md md:text-4xl">
          {plan.title}
        </h1>
        <p className="mt-2 text-sm font-medium text-white/80">{plan.description}</p>
        <div className="mt-4 flex items-center gap-4 text-xs font-medium text-white/70">
          <span className="rounded bg-white/10 px-2 py-1">Est. {plan.totalCostEstimate}</span>
          <span>•</span>
          <span>{plan.itinerary.length} Days</span>
        </div>
      </div>
    </>
  );
}
