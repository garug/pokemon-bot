import { Message, User } from "discord.js";
import { currentInvites, InviteBattle } from "../invite-manager";

export default async function battle(m: Message) {
  if (m.mentions.users.size === 1) {
    const challenged = m.mentions.users.first() as User;
    const invite = new InviteBattle(m.author, challenged);
    const msg = `${m.author} call you to battle! [Access battle here](${process.env.FRONTEND_URL}/batalhas/${invite.id})`;
    currentInvites.push(invite);
    challenged.send(msg);
  } else if (m.mentions.users.size === 0) {
    m.channel.send("Need mention someone to battle");
  } else {
    m.channel.send("Need only one mention");
  }
}
