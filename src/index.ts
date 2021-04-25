import 'tsconfig-paths/register';
import dotenv from 'dotenv';

import { loadCommands, loadReactions } from './util';
import { client } from './client';

dotenv.config();

async function start(): Promise<void> {
  client.on('ready', () => {
    console.log('Paimon bot has started');
  });

  const commands = await loadCommands();
  client.on('message', (message) => {
    const text = message.content;
    if (text === null) return;

    for (const command of commands) {
      command.check(message);
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

  void client.login(process.env.DISCORD_TOKEN);
}

void start();
