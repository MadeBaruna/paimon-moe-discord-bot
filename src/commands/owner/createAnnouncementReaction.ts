import { Message, MessageEmbed } from 'discord.js';
import Command from '@bot/command';
import { updateMessages } from '@config';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'create roles reaction embed',
      command: 'reactionroles:announcement',
      ownerOnly: true,
    });
  }

  async run(message: Message, args: string): Promise<void> {
    const embed = new MessageEmbed();
    embed.setTitle('Announcement Roles');
    embed.setDescription(
      'React below if you want to be notified with:\n\n' +
        '📢 : Announcement about paimon.moe updates\n' +
        '🔔 : New dev feed on Twitter',
    );

    await message.delete();

    const sent = await message.channel.send({ embeds: [embed] });
    await sent.react('📢');
    await sent.react('🔔');

    await updateMessages('announcement', sent.id);
  }
}
