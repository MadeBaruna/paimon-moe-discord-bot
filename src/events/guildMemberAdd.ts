import { GuildMember } from 'discord.js';
import { PAIMON_MOE_SERVER_ID } from 'config';

export async function onGuildMemberAdd(member: GuildMember): Promise<void> {
  if (member.guild.id === PAIMON_MOE_SERVER_ID) {
    member.guild.systemChannel?.send(
      `Welcome to paimon.moe, ${member.toString()}! Please read the <#820650147800809482> and <#829340541393043466> first, Thanks!`,
    );
  }
}
