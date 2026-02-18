import { logger } from '@itinapp/api';
import { env } from '@itinapp/env';

export async function startHeartbeat() {
  const url = env.BETTER_STACK_HEARTBEAT_URL;
  await ping(url);
  setInterval(
    async () => {
      await ping(url);
    },
    4 * 60 * 1000
  );
}

async function ping(url: string) {
  try {
    const res = await fetch(url);
    if (res.ok) {
      console.log('Heartbeat sent to Better Stack');
    } else {
      logger.error('Heartbeat endpoint returned an error', {
        status: res.status,
        statusText: res.statusText,
      });
    }
  } catch (error) {
    logger.error('Heartbeat failed to send (Network Error)', { error });
  }
}
