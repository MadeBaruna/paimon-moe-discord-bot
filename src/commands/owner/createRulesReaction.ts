import { Message, MessageEmbed } from 'discord.js';
import Command from '@bot/command';
import { updateMessages } from '@config';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'create rules reaction embed',
      command: 'reactionroles:rules',
      ownerOnly: true,
    });
  }

  async run(message: Message, args: string): Promise<void> {
    const embed = new MessageEmbed();
    embed.setDescription(
      'If you have read the rules and FAQ\n' +
        'Please react on the ✅ below to continue\n' +
        'Also please react on the announcement and region below',
    );

    await message.delete();

    const sent = await message.channel.send({ embeds: [embed] });
    await sent.react('✅');

    await updateMessages('rules', sent.id);
  }
}
