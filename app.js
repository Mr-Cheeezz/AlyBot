let chatByUser = {};

import "dotenv/config";

import fs, { link, readSync } from "fs";
import tmi from "tmi.js";
import fetch from "node-fetch";
import WebSocket from "ws";
import { setTimeout } from "timers/promises";
import stringSimilarity from "string-similarity";

import * as ROBLOX_FUNCTIONS from "./Functions/roblox.js";
import * as TWITCH_FUNCTIONS from "./Functions/twitch.js";

const alyId = 72121088

import { join } from "path";
import { setEngine, verify } from "crypto";
import { get } from "http";
import { uptime } from "process";
import { match } from "assert";
import { platform } from "os";
import { time } from "console";
import { channel } from "diagnostics_channel";
import { resourceLimits } from "worker_threads";

const COOKIE = process.env.COOKIE;

const BOT_OAUTH = process.env.BOT_OAUTH;
const BOT_NAME = process.env.BOT_NAME;

const CHANNEL_NAME = process.env.CHANNEL_NAME;
const CHANNEL_ID = process.env.CHANNEL_ID;

let SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));

const client = new tmi.Client({
    options: { debug: true },
    identity: {
      username: BOT_NAME,
      password: `OAuth:${BOT_OAUTH}`,
    },
    channels: [CHANNEL_NAME]
  });
  
client.connect();

client.on("connected", (channel, username, viewers, method) => {
    client.say(CHANNEL_NAME, `/me [🤖]: Joined channel ${CHANNEL_NAME}. aly1263Minion`)
});

setInterval(async () => {
    SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));

    if (SETTINGS.ks == false && (await TWITCH_FUNCTIONS.isLive()) == true) {
        client.say(CHANNEL_NAME, `/me [🤖]: type !roblox to join aly`)
    }
}, 7 * 60 * 1000);

setInterval(async () => {
    SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));

    const robloxGame = await ROBLOX_FUNCTIONS.getPresence(alyId).then((r)=>{return r.lastLocation})

    if (SETTINGS.ks == false && (await TWITCH_FUNCTIONS.isLive()) == true) {
        // client.say(CHANNEL_NAME, `/me [🤖]: Aly is currently playing ${robloxGame}`)
    }
}, 5 * 60 * 1000);

setInterval(async () => {
    SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));
   
    if (SETTINGS.ks == false && (await TWITCH_FUNCTIONS.isLive()) == true) {
      var promo = [
        `!discord`,
        `!youtube`
      ];
  
      var soicalsTimer =
        promo[Math.floor(Math.random() * promo.length)];
      // client.say(CHANNEL_NAME, `/me ${soicalsTimer}`);
    }
}, 30 * 7 * 1000);

client.on("message", async (channel, userstate, message, self, viewers) => {

    const messageId = userstate["id"];
    const twitchUserId = userstate["user-id"];
    const twitchUsername = userstate["username"];
    const twitchDisplayName = userstate["display-name"];

      if (message.toLowerCase() == "!game" || message.toLowerCase() == "1game") {
      const robloxGame = await ROBLOX_FUNCTIONS.getPresence(alyId).then((r)=>{return r.lastLocation})
      const locationId = await ROBLOX_FUNCTIONS.getPresence(alyId).then((r)=>{return r.placeId})
      const onlineStatus = await ROBLOX_FUNCTIONS.getLastOnline(alyId).then((r)=>{return r.diffTimeMinutes})
  
  
      if (onlineStatus > 30) {
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is not playing anything right now.`);
      }
      console.log(robloxGame)
      if (robloxGame != 'Website') {
       client.raw(
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is currently playing ${robloxGame}.`); 
      return
      }
  
      return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is currently switching games.`); 
      }
});

client.on("message", async (channel, userstate, message, self, viewers) => {
   
    if (
        message.toLowerCase().includes("what game is this") ||
        message.toLowerCase().includes("what game r u") ||
        message.toLowerCase().includes("what game is that") ||
        message.toLowerCase().includes("game called") ||
        message.toLowerCase().includes("game name") ||
		message.toLowerCase().includes("what is this game")
    ) {
        const robloxGame = await ROBLOX_FUNCTIONS.getPresence(alyId).then((r)=>{return r.lastLocation})
        const locationId = await ROBLOX_FUNCTIONS.getPresence(alyId).then((r)=>{return r.placeId})
        const onlineStatus = await ROBLOX_FUNCTIONS.getLastOnline(alyId).then((r)=>{return r.diffTimeMinutes})

        if (onlineStatus > 30) {
            return client.raw(
              `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is not playing anything right now.`);
          }
          console.log(robloxGame)
          if (robloxGame != 'Website') {
           client.raw(
            `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is currently playing ${robloxGame}.`); 
          return
          }
      
          return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is currently switching games.`);
        
    }
});

client.on("message", async (channel, userstate, message, self, viewers) => {
    const twitchUsername = userstate["username"];
   
    if (
        message.toLowerCase().includes("can i join") ||
        message.toLowerCase().includes("how to play") ||
        message.toLowerCase().includes("how do i join") ||
        message.toLowerCase().includes("can i play") ||
        message.toLowerCase().includes("can i join you") ||
        message.toLowerCase().includes("how do we join") ||
        message.toLowerCase().includes("how do I join") ||
        message.toLowerCase().includes("how to join")
    ) {
        client.say(CHANNEL_NAME, `!roblox @${twitchUsername}`);
    }

    if (message.includes("***")) {
        client.say(CHANNEL_NAME, `/me [🤖]: @${twitchUsername}, Do NOT send links.`);
    }

    if (
        message.toLowerCase().includes("can you add me") ||
        message.toLowerCase().includes("can you friend me") ||
        message.toLowerCase().includes("how to be friend") ||
        message.toLowerCase().includes("pls add me") ||
        message.toLowerCase().includes("ad me") ||
        message.toLowerCase().includes("please friend me") ||
        message.toLowerCase().includes("accept my friend request") ||
        message.toLowerCase().includes("pls friend me") ||
        message.toLowerCase().includes("send you a friend request")
    ) {
        client.say(CHANNEL_NAME, `!add @${twitchUsername}`);
    }

    if (
        message.toLowerCase().includes("what time is it")
    ) {
        client.say(CHANNEL_NAME, `!time @${twitchUsername}`);
    }

    if (
        message.toLowerCase() == "!commands" ||
        message.toLowerCase() == "!cmds"
        ) {
            client.raw(
                `/me [🤖]: Current Commands: !game - Current Game aly is playing.`
            )
        }
    if (
        message.toLowerCase().includes("what song is this") ||
        message.toLowerCase().includes("song name") ||
        message.toLowerCase().includes("what is this song") ||
        message.toLowerCase().includes("what is this music") 
    ) {
        client.say(CHANNEL_NAME, `!song @${twitchUsername}`)
    }
});

client.on("raided", (channel, username, viewers, method) => { 
    if (viewers > 4) {
    client.say(CHANNEL_NAME, `/me [🤖]: Thank you so much @${username} for the raid of ${viewers}. aly1263Run`);
    }
});

client.on("subgift", (channel, username, viewers, method) => {
    client.say(CHANNEL_NAME, `/me [🤖]: @${username} thanks so much for gifting a sub to @${method}. aly1263Blink`);
    client.say(CHANNEL_NAME, `/me [🤖]: @${username} thanks so much for gifting a sub to @${method}. aly1263Blink`);
});

client.on("cheer", (channel, username, viewers, method, userstate) => {
    var Bits = userstate.bits
    client.say(CHANNEL_NAME, `/me [🤖]: Thank you @${username} xqcL for the ${Bits} bits. aly1263Sheesh`);
});

client.on("resub", (channel, username, viewers, method) => {
    client.say(CHANNEL_NAME, `/me [🤖]: Thanks for resubbing @${username}. aly1263Vibe`);
    client.say(CHANNEL_NAME, `/me [🤖]: Thanks for resubbing @${username}. aly1263Vibe`);
});

client.on("subscription", (channel, username, viewers, method) => {
    client.say(CHANNEL_NAME, `/me [🤖]: Thanks for subbing @${username}. aly1263Vibe`);
    client.say(CHANNEL_NAME, `/me [🤖]: Thanks for subbing @${username}. aly1263Vibe`);
});

client.on("hosting", async (channel, username, viewers, method, userstate) => {
    client.say(CHANNEL_NAME, `/me [🤖]: Aly is now hosting ${username}. xqcEZ`);
    if ((await TWITCH_FUNCTIONS.isLive() == false)) {
        client.say(username, `Aly just hosted ${username}.`);
    }
    client.say(username, `KAPOW ALY RAID KAPOW`);
    await setTimeout(1 * 1000)
    client.say(username, `aly1263Raid ALY RAID aly1263Raid`);
    await setTimeout(1 * 1000)
    client.say(username, `KAPOW ALY RAID KAPOW`);
    await setTimeout(1 * 1000)
    client.say(username, `aly1263Raid ALY RAID aly1263Raid`);
});