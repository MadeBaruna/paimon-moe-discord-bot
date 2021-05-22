import { GuildMember } from 'discord.js';

export async function onGuildMemberAdd(member: GuildMember): Promise<void> {
  member.guild.systemChannel?.send(
    `Welcome to paimon.moe, ${member.toString()}! Please read the <#820650147800809482> and <#829340541393043466> first, Thanks!`,
  );
}
