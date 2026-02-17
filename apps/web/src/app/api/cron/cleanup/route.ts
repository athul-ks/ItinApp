import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

import { flushLogs, logger, normalizeError } from '@itinapp/api';
import { prisma } from '@itinapp/db';

export const dynamic = 'force-dynamic'; // CRITICAL: Cron jobs must not be cached!

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    logger.info('Cron job started');

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

    logger.info('Cron job finished');
    await flushLogs();
    return NextResponse.json({ success: true, processed: stuckTrips.length, results });
  } catch (error) {
    logger.error('Cron job failed', { ...normalizeError(error) });
    Sentry.captureException(error);
    await Promise.all([flushLogs(), Sentry.flush(2000)]);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
