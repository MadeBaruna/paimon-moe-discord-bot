import { ApplicationCommandData, ButtonInteraction } from 'discord.js';

export default abstract class Button {
  static commands: ApplicationCommandData[] = [];
  static serverOnlyCommands: ApplicationCommandData[] = [];

  name: string;
  customId: string;

  constructor(config: { name: string; customId: string }) {
    this.name = config.name;
    this.customId = config.customId;
  }

  checkInteraction(interaction: ButtonInteraction): void {
    if (!interaction.customId.startsWith(this.customId)) return;
    void this.interact(interaction);
  }

  async interact(interaction: ButtonInteraction): Promise<void> {
    return await Promise.reject(new Error('not implemented'));
  }
}
