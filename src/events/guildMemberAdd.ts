import { GuildMember } from 'discord.js';

export async function onGuildMemberAdd(member: GuildMember): Promise<void> {
  if (member.guild.id === '820601523125747712') {
    member.guild.systemChannel?.send(
      `Welcome to paimon.moe, ${member.toString()}! Please read the <#820650147800809482> and <#829340541393043466> first, Thanks!`,
    );
  }
}
