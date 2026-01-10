import { getServerAuthSession } from '@itinapp/auth';

export const auth = async () => {
  return await getServerAuthSession();
};
