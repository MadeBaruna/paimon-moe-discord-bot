import { Message, MessageEmbed } from 'discord.js';
import Command from '@bot/command';
import { updateMessages } from '@config';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'create roles reaction embed',
      command: 'reactionroles:worldlevel',
      permission: 'ADMINISTRATOR',
    });
  }

  async run(message: Message, args: string): Promise<void> {
    const embed = new MessageEmbed();
    embed.setTitle('World Level Roles');
    embed.setDescription(
      'React below if you want to show others what is your world level\n\n' +
      '1️⃣ : WL1\n' +
      '2️⃣ : WL2\n' +
      '3️⃣ : WL3\n' +
      '4️⃣ : WL4\n' +
      '5️⃣ : WL5\n' +
      '6️⃣ : WL6\n' +
      '7️⃣ : WL7\n' +
      '8️⃣ : WL8\n',
    );

    await message.delete();

    const sent = await message.channel.send(embed);
    await sent.react('1️⃣');
    await sent.react('2️⃣');
    await sent.react('3️⃣');
    await sent.react('4️⃣');
    await sent.react('5️⃣');
    await sent.react('6️⃣');
    await sent.react('7️⃣');
    await sent.react('8️⃣');

    await updateMessages('worldlevel', sent.id);
  }
}
