import { client } from 'client';
import fs from 'fs/promises';
import path from 'path';

export const prefix = process.env.DISCORD_COMMAND_PREFIX ?? '/';
export const ownerId = client.application?.owner?.id ?? '';
export let messages: { [key: string]: string } = {};

const messagePath = path.resolve(__dirname, 'messages.json');

async function readMessages(): Promise<void> {
  let result;
  try {
    result = await fs.readFile(messagePath, 'utf-8');
    messages = JSON.parse(result);
  } catch (err) {
    await fs.writeFile(messagePath, '{}');
  }
}

export async function updateMessages(
  key: string,
  value: string,
): Promise<void> {
  messages[key] = value;
  await fs.writeFile(messagePath, JSON.stringify(messages, null, 2));
}

void readMessages();
