import 'tsconfig-paths/register';
import dotenv from 'dotenv';

import { loadCommands, loadReactions } from './util';
import { client } from './client';
import { onGuildMemberAdd } from './events/guildMemberAdd';
import { startTwitterCron } from 'cron/twitter';
import { onMessageCreate } from 'events/messageCreate';
import { onGuildMemberUpdate } from 'events/guildMemberUpdate';
import { getOwnerId } from '@config';

dotenv.config();

async function ready(): Promise<void> {
  await getOwnerId();

  const [commands, interactions, autocompletes, buttons] = await loadCommands();
  client.on('messageCreate', (message) => {
    const text = message.content;
    if (text === null) return;

    for (const command of commands) {
      command.check(message);
    }

    void onMessageCreate(message);
  });

  client.on('interactionCreate', (interaction) => {
    try {
      if (interaction.isCommand()) {
        for (const item of interactions) {
          item.checkInteraction(interaction);
        }
      } else if (interaction.isAutocomplete()) {
        for (const item of autocompletes) {
          void item.autocomplete(interaction);
        }
      } else if (interaction.isButton()) {
        for (const item of buttons) {
          item.checkInteraction(interaction);
        }
      }
    } catch (err) {
      console.log(err);
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

  client.on('guildMemberUpdate', (old, updated) => {
    void onGuildMemberUpdate(old, updated);
  });
}

async function start(): Promise<void> {
  client.on('ready', () => {
    console.log('Paimon bot has started');
    console.log(`Joined ${client.guilds.cache.size} servers`);
    void ready();
    startTwitterCron();
  });

  void client.login(process.env.DISCORD_TOKEN);
}

void start();
