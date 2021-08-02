import fs from 'fs/promises';
import path from 'path';
import Command from '@bot/command';
import Reaction from '@bot/reaction';
import { client } from 'client';

export async function loadCommands(): Promise<[Command[], Command[]]> {
  const commands: Command[] = [];
  const interactions: Command[] = [];

  const files = await fs.readdir(path.resolve(__dirname, 'commands'));
  for (const file of files) {
    if (!file.endsWith('.ts')) continue;

    const imported = await import(`@command/${file}`);
    const ImportedCommand = imported.default;

    const command = new ImportedCommand();

    if ((command as Command).registerSlashCommand === true) {
      interactions.push(command);
    } else {
      commands.push(command);
    }
  }

  const ownerOnlyFiles = await fs.readdir(
    path.resolve(__dirname, 'commands/owner'),
  );
  for (const file of ownerOnlyFiles) {
    if (!file.endsWith('.ts')) continue;

    const imported = await import(`@command/owner/${file}`);
    const Command = imported.default;
    commands.push(new Command());
  }

  try {
    await client.application?.commands.set(Command.commands);
    console.log('Slash commands registered');
  } catch (err) {
    console.error(err);
  }

  return [commands, interactions];
}

export async function loadReactions(): Promise<Reaction[]> {
  const reactions: Reaction[] = [];

  const files = await fs.readdir(path.resolve(__dirname, 'reactions'));
  for (const file of files) {
    const imported = await import(`@reaction/${file}`);
    const Reaction = imported.default;
    reactions.push(new Reaction());
  }

  return reactions;
}
