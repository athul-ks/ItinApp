import { NextResponse } from 'next/server';

import { prisma } from '@itinapp/db';

export const dynamic = 'force-dynamic'; // CRITICAL: Cron jobs must not be cached!

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stuckTrips = await prisma.trip.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: fifteenMinutesAgo, gt: twentyFourHoursAgo },
      },
    });

    const results = await Promise.allSettled(
      stuckTrips.map(async (trip) => {
        return prisma.$transaction([
          prisma.trip.update({
            where: { id: trip.id },
            data: { status: 'FAILED' },
          }),
          prisma.user.update({
            where: { id: trip.userId },
            data: { credits: { increment: 1 } },
          }),
        ]);
      })
    );

    return NextResponse.json({ success: true, processed: stuckTrips.length, results });
  } catch (error) {
    console.error('Cron failed:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
