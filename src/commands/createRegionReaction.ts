import { Message, MessageEmbed } from 'discord.js';
import Command from '@bot/command';
import { updateMessages } from '@config';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'create roles reaction embed',
      command: 'reactionroles:region',
      permission: 'ADMINISTRATOR',
    });
  }

  async run(message: Message, args: string): Promise<void> {
    const embed = new MessageEmbed();
    embed.setTitle('Region Roles');
    embed.setDescription(
      'React below if you want to show others what server you play on\n\n' +
      '🇦 : Asia Server\n' +
      '🇺 : America Server\n' +
      '🇪 : Europe Server\n' +
      '🇹 : TW/HK/MO Server',
    );

    await message.delete();

    const sent = await message.channel.send(embed);
    await sent.react('🇦');
    await sent.react('🇺');
    await sent.react('🇪');
    await sent.react('🇹');

    await updateMessages('region', sent.id);
  }
}
