import fs from 'fs/promises';
import path from 'path';
import Command from '@bot/command';
import Reaction from '@bot/reaction';
import { client } from 'client';
import { PAIMON_MOE_SERVER_ID } from '@config';
import Button from '@bot/button';

export async function loadCommands(): Promise<
  [Command[], Command[], Command[], Button[]]
> {
  const commands: Command[] = [];
  const interactions: Command[] = [];
  const autocompletes: Command[] = [];
  const buttons: Button[] = [];

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

    if ((command as Command).hasAutocomplete === true) {
      autocompletes.push(command);
    }
  }

  const buttonFiles = await fs.readdir(path.resolve(__dirname, 'buttons'));
  for (const file of buttonFiles) {
    if (!file.endsWith('.ts')) continue;

    const imported = await import(`@button/${file}`);
    const ImportedButton = imported.default;

    const button = new ImportedButton();

    buttons.push(button);
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
    await client.guilds.cache
      .get(PAIMON_MOE_SERVER_ID)
      ?.commands.set(Command.serverOnlyCommands);
    console.log('Server only slash commands registered');
  } catch (err) {
    console.error(err);
  }

  return [commands, interactions, autocompletes, buttons];
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
