import {
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextBasedChannel,
} from 'discord.js';
import Command from '@bot/command';
import { getLevel } from 'libs/calculateLevel';
import { emoji } from 'genshin/emoji';
import { redis } from 'redis';
import { messages, PAIMON_MOE_SERVER_ID } from '@config';

export default class Giveaway extends Command {
  ticketCounterMessage: Message | null = null;

  constructor() {
    super({
      name: 'Check current giveaway',
      command: 'giveaway',
      registerSlashCommand: true,
      onlyInPaimonMoeServer: true,
    });
  }

  async interact(interaction: CommandInteraction): Promise<void> {
    try {
      const rollUsed =
        (await redis.get(
          `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.roll`,
        )) ?? 0;
      const { level } = await getLevel(interaction.user.id);
      const rollLeft = level - Number(rollUsed);

      const ticketOwned =
        (await redis.get(
          `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.ticket`,
        )) ?? 0;

      const button = new MessageButton({
        customId: 'giveaway-roll',
        label: 'Roll Ticket',
        emoji: '926787193861709834',
        style: 'PRIMARY',
      });

      const row = new MessageActionRow().addComponents(button);
      let buttonRow = [row];
      let giveawayMessage = `\nCurrently you have joined the giveaway with **${ticketOwned}** ${emoji.ticket}`;
      if (ticketOwned === 0 && rollLeft > 0) {
        giveawayMessage =
          '\nGet a ticket to join the giveaway by pressing the roll ticket button below!';
      } else if (ticketOwned === 0 && rollLeft === 0) {
        giveawayMessage =
          "\nYou don't have any more roll to join the giveaway, increase your level to get a roll! Use `/level` command to see your level.";
      }

      if (rollLeft === 0) {
        buttonRow = [];
      }

      const message = await interaction.reply({
        fetchReply: true,
        ephemeral: true,
        content: `You have **${rollLeft} ROLL** to use!${giveawayMessage}`,
        components: buttonRow,
      });

      const collector = (message as Message).createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10 * 60 * 1000,
      });

      collector?.on('collect', async (i) => {
        if (!i.customId.startsWith('giveaway-roll')) return;

        const rollUsed =
          (await redis.get(
            `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.roll`,
          )) ?? 0;
        const { level } = await getLevel(interaction.user.id);
        let rollLeft = level - Number(rollUsed);

        if (rollLeft === 0) {
          void i.reply("You don't have any more roll!");
          return;
        }

        const rollUsedAfter = await redis.incr(
          `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.roll`,
        );
        rollLeft = level - rollUsedAfter;
        if (rollLeft === 0) {
          buttonRow = [];
        }

        const win = Math.random() > 0.5;
        if (win) {
          const totalTicket = await redis.incr(
            `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.ticket`,
          );
          const totalTicketGlobal = await redis.incr(
            `discord:${PAIMON_MOE_SERVER_ID}:giveaway.ticket`,
          );
          await i.update({
            content: `Yay! You got a TICKET ${emoji.ticket}\nRoll left: **${rollLeft}**\nTotal Ticket: **${totalTicket}** ${emoji.ticket}`,
            components: buttonRow,
          });

          // update main ticket counter
          if (this.ticketCounterMessage === null) {
            const channels = await i.guild?.channels.fetch();
            if (channels !== undefined) {
              for (const [, ch] of channels) {
                if (ch.type === 'GUILD_TEXT') {
                  try {
                    const msg = await (ch as TextBasedChannel).messages.fetch(
                      messages.giveawaycounter,
                    );
                    this.ticketCounterMessage = msg;
                  } catch (err) {}
                }
              }
            }
          }

          try {
            const embed = new MessageEmbed();
            embed.setTitle('5x Blessing of the Welkin Moon Giveaway');
            embed.setDescription(
              `${emoji.ticket} Ticket Count: **${totalTicketGlobal}**\n\nType \`/giveaway\` on <#844910701839122432> to join the giveaway!`,
            );
            embed.setColor('BLUE');
            this.ticketCounterMessage?.edit({ embeds: [embed] });
          } catch (err) {}
        } else {
          const totalTicket =
            (await redis.get(
              `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.ticket`,
            )) ?? 0;
          await i.update({
            content: `Oops, better luck next time!\nRoll left: **${rollLeft}**\nTotal Ticket: **${totalTicket}**${emoji.ticket}`,
            components: buttonRow,
          });
        }
      });

      collector?.on('end', async (i) => {
        void i.first()?.update({
          content: i.first()?.message.content,
          components: [
            new MessageActionRow().addComponents(
              new MessageButton({
                customId: 'giveaway-stop',
                label: 'type /giveaway again to refresh',
                style: 'SECONDARY',
                disabled: true,
              }),
            ),
          ],
        });
      });
    } catch (err) {
      console.error(err);
    }
  }
}
