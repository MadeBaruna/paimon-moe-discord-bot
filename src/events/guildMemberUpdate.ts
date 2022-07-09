import { GuildMember, PartialGuildMember } from 'discord.js';
import { PAIMON_MOE_SERVER_ID } from 'config';

export async function onGuildMemberUpdate(
  old: PartialGuildMember | GuildMember,
  member: GuildMember,
): Promise<void> {
  if (member.guild.id === PAIMON_MOE_SERVER_ID) {
    if (!old.pending || member.pending) return;

    const role = member.guild.roles.cache.find((e) => e.name === 'Traveler');
    if (role === undefined) return;
    void member.roles.add(role);
  }
}
