import { PAIMON_MOE_SERVER_ID } from '@config';
import { chatExp } from '@data/chatExp';
import { redis } from 'redis';

export async function getLevel(
  user: string,
): Promise<{ currentExp: number; level: number }> {
  const currentLevel = await redis.get(
    `discord:${PAIMON_MOE_SERVER_ID}:${user}:level`,
  );
  const currentExpStr = await redis.zscore(
    `discord:${PAIMON_MOE_SERVER_ID}`,
    user,
  );
  const currentExp = Number(currentExpStr) ?? 0;
  if (currentLevel !== null) {
    return {
      level: Number(currentLevel),
      currentExp,
    };
  }

  const closest = Math.floor(currentExp / 20);
  let closestExp = closest * 20;
  let level = chatExp[closestExp];
  while (level === undefined) {
    closestExp -= 20;
    level = chatExp[closestExp];
  }

  await redis.set(`discord:${PAIMON_MOE_SERVER_ID}:${user}:level`, level);

  return {
    currentExp,
    level,
  };
}
