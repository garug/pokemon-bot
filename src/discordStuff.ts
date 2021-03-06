import { Client, Intents, TextChannel } from "discord.js";
import axios from "axios";
import qs from "qs";

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

export function useClient() {
  return client;
}

export function useChannel() {
  return client.channels.cache.get("855838535503970344") as TextChannel;
}

client.login(process.env.DISCORD_TOKEN).then(() => {
  console.log("Logged in!");
});

async function defaultRequest(obj: any, url?: string) {
  url = url ? url : "https://discord.com/api/oauth2/token";
  obj = {
    ...obj,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    client_id: process.env.DISCORD_CLIENT_ID,
  };

  return axios.post(url, qs.stringify(obj), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

export async function generateToken(code: string) {
  const obj = {
    code,
    grant_type: "authorization_code",
    redirect_uri: `${process.env.FRONTEND_URL}/oauth`,
    scope: "identify",
  };

  const request = await defaultRequest(obj);

  return request.data;
}

export async function refreshToken(refresh_token: string) {
  const obj = {
    refresh_token,
    grant_type: "refresh_token",
  };

  const request = await defaultRequest(obj);

  return request.data;
}

export async function revokeToken(token: string) {
  const obj = {
    token,
  };

  const url = "https://discord.com/api/oauth2/token/revoke";

  await defaultRequest(obj, url);
}
