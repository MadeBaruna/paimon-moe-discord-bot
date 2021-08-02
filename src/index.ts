import 'tsconfig-paths/register';
import dotenv from 'dotenv';

import { loadCommands, loadReactions } from './util';
import { client } from './client';
import { onGuildMemberAdd } from './events/guildMemberAdd';
import { startTwitterCron } from 'cron/twitter';

dotenv.config();

async function ready(): Promise<void> {
  const [commands, interactions] = await loadCommands();
  client.on('messageCreate', (message) => {
    const text = message.content;
    if (text === null) return;

    for (const command of commands) {
      command.check(message);
    }
  });

  client.on('interactionCreate', (interaction) => {
    if (interaction.isCommand()) {
      for (const item of interactions) {
        item.checkInteraction(interaction);
      }
    }
  });

  const reactions = await loadReactions();
  client.on('messageReactionAdd', (react, user) => {
    for (const reaction of reactions) {
      void reaction.check(react, user, 'add');
    }
  });
  client.on('messageReactionRemove', (react, user) => {
    for (const reaction of reactions) {
      void reaction.check(react, user, 'remove');
    }
  });

  client.on('guildMemberAdd', (member) => {
    void onGuildMemberAdd(member);
  });
}

async function start(): Promise<void> {
  client.on('ready', () => {
    console.log('Paimon bot has started');
    void ready();
    startTwitterCron();
  });

  void client.login(process.env.DISCORD_TOKEN);
}

void start();
