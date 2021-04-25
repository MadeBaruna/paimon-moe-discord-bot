import fs from 'fs/promises';
import path from 'path';
import Command from '@bot/command';
import Reaction from '@bot/reaction';

export async function loadCommands(): Promise<Command[]> {
  const commands: Command[] = [];

  const files = await fs.readdir(path.resolve(__dirname, 'commands'));
  for (const file of files) {
    const imported = await import(`@command/${file}`);
    const Command = imported.default;
    commands.push(new Command());
  }

  return commands;
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