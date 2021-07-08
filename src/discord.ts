import { Client, TextChannel } from "discord.js";

const client = new Client();

export function useClient() {
  return client;
}

export function useChannel() {
  return client.channels.cache.get("855838535503970344") as TextChannel;
}

client.login(process.env.DISCORD_TOKEN);
