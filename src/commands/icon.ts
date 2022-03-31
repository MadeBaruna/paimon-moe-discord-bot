import {
  CommandInteraction,
  GuildEmoji,
  GuildEmojiManager,
  GuildMemberRoleManager,
  Message,
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
  Role,
} from 'discord.js';
import Command from '@bot/command';
import { characters } from '@data/characters';
import { emoji } from 'genshin/emoji';

export default class BoosterRoleIcon extends Command {
  cache: null | string = null;

  constructor() {
    super({
      name: 'Change your name icon (booster only)',
      command: 'icon',
      registerSlashCommand: true,
      onlyInPaimonMoeServer: true,
    });
  }

  async interact(interaction: CommandInteraction): Promise<void> {
    if ((interaction.member as GuildMember).premiumSince === null) {
      void interaction.reply({
        ephemeral: true,
        content: 'Sorry, this is for the server booster only!',
      });
    }

    try {
      const content = this.getContent('pyro', interaction.guild?.emojis);
      const message = (await interaction.reply({
        ...content,
        ephemeral: true,
        fetchReply: true,
      })) as Message;

      const collectorButton = message.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 5 * 60 * 1000,
      });

      collectorButton?.on('collect', async (i) => {
        const content = this.getContent(i.customId, i.guild?.emojis);
        try {
          void i.update({ ...content });
        } catch (err) {}
      });

      const collectorSelect = message.createMessageComponentCollector({
        componentType: 'SELECT_MENU',
        time: 5 * 60 * 1000,
      });

      collectorSelect?.on('collect', async (i) => {
        await i.deferReply({ ephemeral: true });

        const id = `Booster - ${i.values[0]}`;
        const role = i.guild?.roles.cache.find((e) => e.name === id) as Role;

        try {
          const removeRole = (
            i.member?.roles as GuildMemberRoleManager
          ).cache.find((e) => e.name.startsWith('Booster -'));
          if (removeRole !== undefined) {
            await (i.member?.roles as GuildMemberRoleManager).remove(
              removeRole,
            );
          }

          await (i.member?.roles as GuildMemberRoleManager).add(role);
          await i.followUp({ content: 'Changed your icon!', ephemeral: true });
        } catch (err) {
          console.error(err);
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  getContent(
    current: string,
    emojis?: GuildEmojiManager,
  ): {
    content: string;
    components: MessageActionRow[];
  } {
    const buttons1 = [
      new MessageButton({
        customId: 'pyro',
        emoji: emoji.pyro,
        style: 'SECONDARY',
        disabled: current === 'pyro',
      }),
      new MessageButton({
        customId: 'hydro',
        emoji: emoji.hydro,
        style: 'SECONDARY',
        disabled: current === 'hydro',
      }),
      new MessageButton({
        customId: 'anemo',
        emoji: emoji.anemo,
        style: 'SECONDARY',
        disabled: current === 'anemo',
      }),
    ];
    const buttons2 = [
      new MessageButton({
        customId: 'electro',
        emoji: emoji.electro,
        style: 'SECONDARY',
        disabled: current === 'electro',
      }),
      new MessageButton({
        customId: 'cryo',
        emoji: emoji.cryo,
        style: 'SECONDARY',
        disabled: current === 'cryo',
      }),
      new MessageButton({
        customId: 'geo',
        emoji: emoji.geo,
        style: 'SECONDARY',
        disabled: current === 'geo',
      }),
    ];

    const charEmojis: { [key: string]: GuildEmoji } = {};
    emojis?.cache.each((e) => {
      if (e.name === null) return;
      charEmojis[e.name] = e;
    });

    const options = Object.entries(characters)
      .filter((e) => e[1].element.id === current)
      .map((e) => ({
        label: e[1].name,
        value: e[1].name,
        emoji: charEmojis[e[0]],
      }));

    const menu = new MessageSelectMenu({
      placeholder: 'Choose your icon',
      custom_id: 'icon-select',
      options,
    });

    const row = new MessageActionRow().addComponents(menu);
    const rowButtons1 = new MessageActionRow().addComponents(buttons1);
    const rowButtons2 = new MessageActionRow().addComponents(buttons2);

    return {
      content: 'Select a character for your icon:',
      components: [row, rowButtons1, rowButtons2],
    };
  }
}
