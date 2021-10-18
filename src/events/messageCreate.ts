import { Message } from 'discord.js';
import { PAIMON_MOE_SERVER_ID } from 'config';
import { redis } from 'redis';

export async function onMessageCreate(message: Message): Promise<void> {
  if (message?.guildId !== PAIMON_MOE_SERVER_ID) return;
  if (message.member === null) return;

  try {
    const inIgnoredChannel = await redis.hexists(
      `discord:${PAIMON_MOE_SERVER_ID}:ignored`,
      message.channelId,
    );
    if (inIgnoredChannel === 1) return;

    await redis.zincrby(
      `discord:${PAIMON_MOE_SERVER_ID}`,
      1,
      message.member.id,
    );
  } catch (err) {
    console.error(err);
  }
}
