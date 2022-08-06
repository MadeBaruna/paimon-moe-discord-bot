import {
  CommandInteraction,
  Message,
  // MessageActionRow,
  // MessageButton,
  // MessageEmbed,
  // TextBasedChannel,
} from 'discord.js';
import Command from '@bot/command';
// import { getLevel } from 'libs/calculateLevel';
import { emoji } from 'genshin/emoji';
import { redis } from 'redis';
import { PAIMON_MOE_SERVER_ID } from '@config';

// const available = ['✌️', '✊', '🖐️'];
// const scissor = new MessageButton({
//   customId: '0',
//   label: '',
//   emoji: '✌️',
//   style: 'SECONDARY',
// });
// const rock = new MessageButton({
//   customId: '1',
//   label: '',
//   emoji: '✊',
//   style: 'SECONDARY',
// });
// const paper = new MessageButton({
//   customId: '2',
//   label: '',
//   emoji: '🖐️',
//   style: 'SECONDARY',
// });
// const gameButtons = new MessageActionRow().addComponents(rock, paper, scissor);

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

  getNextResult(): number {
    return Math.floor(Math.random() * 3);
  }

  async interact(interaction: CommandInteraction): Promise<void> {
    try {
      // const rollUsed =
      //   (await redis.get(
      //     `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.roll`,
      //   )) ?? 0;
      // const { level } = await getLevel(interaction.user.id);
      // const rollLeft = level - Number(rollUsed);

      const ticketOwned =
        (await redis.get(
          `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.ticket`,
        )) ?? 0;

      // const button = new MessageButton({
      //   customId: 'giveaway-roll',
      //   label: 'Roll Ticket',
      //   emoji: '926787193861709834',
      //   style: 'PRIMARY',
      // });

      // const row = new MessageActionRow().addComponents(button);
      // let buttonRow = [row];
      const giveawayMessage = `\nCurrently you have joined the giveaway with **${ticketOwned}** ${emoji.ticket}`;
      // if (ticketOwned === 0 && rollLeft > 0) {
      //   giveawayMessage =
      //     '\nGet a ticket to join the giveaway by pressing the roll ticket button below!';
      // } else if (ticketOwned === 0 && rollLeft === 0) {
      //   giveawayMessage =
      //     "\nYou don't have any more roll to join the giveaway, increase your level to get a roll! Use `/level` command to see your level.";
      // }

      // if (rollLeft === 0) {
      //   buttonRow = [];
      // }

      await interaction.reply({
        fetchReply: true,
        ephemeral: true,
        content: giveawayMessage,
        // components: buttonRow,
      });

      //   const collector = (message as Message).createMessageComponentCollector({
      //     componentType: 'BUTTON',
      //     time: 10 * 60 * 1000,
      //   });

      //   collector?.on('collect', async (i) => {
      //     if (i.customId.startsWith('giveaway-roll')) {
      //       const rollUsed =
      //         (await redis.get(
      //           `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.roll`,
      //         )) ?? 0;
      //       const { level } = await getLevel(interaction.user.id);
      //       const rollLeft = level - Number(rollUsed);

      //       if (rollLeft === 0) {
      //         try {
      //           void i.reply("You don't have any more roll!");
      //         } catch (err) {}
      //         return;
      //       }

      //       try {
      //         await i.update({
      //           content: 'Rock, Paper, or Scissors?',
      //           components: [gameButtons],
      //         });
      //       } catch (err) {}
      //     } else {
      //       const rollUsed =
      //         (await redis.get(
      //           `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.roll`,
      //         )) ?? 0;
      //       const { level } = await getLevel(interaction.user.id);
      //       const rollLeftBefore = level - Number(rollUsed);
      //       if (rollLeftBefore === 0) {
      //         try {
      //           void i.reply("You don't have any more roll!");
      //           return;
      //         } catch (err) {}
      //       }

      //       const rollUsedAfter = await redis.incr(
      //         `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.roll`,
      //       );
      //       const rollLeft = level - rollUsedAfter;
      //       if (rollLeft === 0) {
      //         buttonRow = [];
      //       }

      //       const result = this.getNextResult();
      //       const player = Number(i.customId);
      //       let text = `${available[player]} x ${available[result]}\n\n`;
      //       let win = false;

      //       if (player === result) {
      //         const totalTicket = await redis.incr(
      //           `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.ticket`,
      //         );
      //         text += `Draw! Well you still got a TICKET ${emoji.ticket}!\n`;
      //         text += `Roll left: **${rollLeft}**\nTotal Ticket: **${totalTicket}** ${emoji.ticket}`;

      //         win = true;
      //       } else if (
      //         (player === 2 && result === 1) ||
      //         (player === 1 && result === 0) ||
      //         (player === 0 && result === 2)
      //       ) {
      //         const totalTicket = await redis.incr(
      //           `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.ticket`,
      //         );
      //         text += `You beat me! Here is your TICKET ${emoji.ticket}!\n`;
      //         text += `Roll left: **${rollLeft}**\nTotal Ticket: **${totalTicket}** ${emoji.ticket}`;

      //         win = true;
      //       } else {
      //         const totalTicket =
      //           (await redis.get(
      //             `discord:${PAIMON_MOE_SERVER_ID}:${interaction.user.id}:giveaway.ticket`,
      //           )) ?? 0;
      //         text += 'Haha I win, better luck next time!\n';
      //         text += `Roll left: **${rollLeft}**\nTotal Ticket: **${totalTicket}** ${emoji.ticket}`;
      //       }

      //       try {
      //         await i.update({
      //           content: text,
      //           components: buttonRow,
      //         });
      //       } catch (err) {}

      //       if (win) {
      //         const totalTicketGlobal = await redis.incr(
      //           `discord:${PAIMON_MOE_SERVER_ID}:giveaway.ticket`,
      //         );

      //         // update main ticket counter
      //         if (this.ticketCounterMessage === null) {
      //           const channels = await i.guild?.channels.fetch();
      //           if (channels !== undefined) {
      //             for (const [, ch] of channels) {
      //               if (ch.type === 'GUILD_TEXT') {
      //                 try {
      //                   const msg = await (ch as TextBasedChannel).messages.fetch(
      //                     messages.giveawaycounter,
      //                   );
      //                   this.ticketCounterMessage = msg;
      //                 } catch (err) {}
      //               }
      //             }
      //           }
      //         }

      //         try {
      //           const embed = new MessageEmbed();
      //           embed.setTitle('5x Blessing of the Welkin Moon Giveaway');
      //           embed.setDescription(
      //             `${emoji.ticket} Ticket Count: **${totalTicketGlobal}**\n\nType \`/giveaway\` on <#844910701839122432> to join the giveaway!`,
      //           );
      //           embed.setColor('BLUE');
      //           this.ticketCounterMessage?.edit({ embeds: [embed] });
      //         } catch (err) {}
      //       }
      //     }
      //   });

      //   collector?.on('end', async (i) => {
      //     try {
      //       void i.first()?.update({
      //         content: i.first()?.message.content,
      //         components: [
      //           new MessageActionRow().addComponents(
      //             new MessageButton({
      //               customId: 'giveaway-stop',
      //               label: 'type /giveaway again to refresh',
      //               style: 'SECONDARY',
      //               disabled: true,
      //             }),
      //           ),
      //         ],
      //       });
      //     } catch (err) {}
      //   });
    } catch (err) {
      console.error(err);
    }
  }
}
