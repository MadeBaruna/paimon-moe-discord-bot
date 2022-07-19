import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { PAIMON_MOE_SERVER_ID } from 'config';
import { redis } from 'redis';
import { chatExp } from '@data/chatExp';
import { emoji } from 'genshin/emoji';

export async function onMessageCreate(message: Message): Promise<void> {
  if (message?.guildId !== PAIMON_MOE_SERVER_ID) return;
  if (message.member === null) return;
  if (message.member.user.bot) return;

  try {
    const haveStickyEnabled = await redis.hexists(
      `discord:${PAIMON_MOE_SERVER_ID}:sticky`,
      message.channelId,
    );
    if (haveStickyEnabled === 1) {
      void sendStickyMessage(message);
    }

    const inIgnoredChannel = await redis.hexists(
      `discord:${PAIMON_MOE_SERVER_ID}:ignored`,
      message.channelId,
    );
    if (inIgnoredChannel === 1) return;

    const isCooldown = await redis.get(
      `discord:${PAIMON_MOE_SERVER_ID}:${message.member.id}`,
    );
    if (isCooldown !== null) return;

    const currentExp = await redis.zincrby(
      `discord:${PAIMON_MOE_SERVER_ID}`,
      1,
      message.member.id,
    );
    // check level up
    const newLevel = chatExp[currentExp];
    if (newLevel !== undefined) {
      await redis.set(
        `discord:${PAIMON_MOE_SERVER_ID}:${message.member.id}:level`,
        newLevel,
      );
      await message.channel.send(
        `${
          emoji.up
        } ${message.author.toString()} has leveled up to **LEVEL ${newLevel}** ${
          emoji.exp
        }`,
      );
    }

    await redis.set(
      `discord:${PAIMON_MOE_SERVER_ID}:${message.member.id}`,
      1,
      'EX',
      20,
    );
  } catch (err) {
    console.error(err);
  }
}

async function sendStickyMessage(message: Message): Promise<void> {
  const sticky = (await redis.hget(
    `discord:${PAIMON_MOE_SERVER_ID}:sticky`,
    message.channel.id,
  )) as string;
  const source = sticky.split(',');
  const channelId = source[0];
  const messageId = source[1];

  const guild = message.guild;
  const sourceChannel = (await guild?.channels.fetch(channelId)) as TextChannel;
  const sourceMessage = await sourceChannel.messages.fetch(messageId);

  const lastMsg = await redis.get(
    `discord:${PAIMON_MOE_SERVER_ID}:sticky:${message.channel.id}`,
  );
  if (lastMsg !== null) {
    await (await message.channel.messages.fetch(lastMsg)).delete();
  }

  const embed = new MessageEmbed();
  embed.setDescription(sourceMessage.content);
  const sent = await message.channel.send({ embeds: [embed] });

  await redis.set(
    `discord:${PAIMON_MOE_SERVER_ID}:sticky:${message.channel.id}`,
    sent.id,
  );
}
