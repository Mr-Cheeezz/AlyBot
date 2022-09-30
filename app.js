let chatByUser = {};

import "dotenv/config";

import fs, { lchown, link, readSync } from "fs";
import tmi from "tmi.js";
import fetch from "node-fetch";
import WebSocket from "ws";
import { setTimeout } from "timers/promises";
import stringSimilarity from "string-similarity";

import * as ROBLOX_FUNCTIONS from "./Functions/roblox.js";
import * as TWITCH_FUNCTIONS from "./Functions/twitch.js";
import * as RESPONSES from "./Functions/responses.js";

const alyId = 72121088 // roblox id for getting game and playtime

import buddyList, { wrapWebApi } from "spotify-buddylist";
import { join } from "path";
import { setEngine, setFips, verify } from "crypto";
import { get } from "http";
import { uptime } from "process";
import { match } from "assert";
import { platform } from "os";
import { time } from "console";
import { channel } from "diagnostics_channel";
import { resourceLimits } from "worker_threads";
import { clearScreenDown } from "readline";

const COOKIE = process.env.COOKIE; // roblo sec token

const CLIENT_ID = process.env.CLIENT_ID;
const TWITCH_ID = process.env.TWITCH_ID;

const BOT_OAUTH = process.env.BOT_OAUTH; // bot oauth token for performing actions
const BOT_NAME = process.env.BOT_NAME; // bot username
const BOT_ID = process.env.BOT_ID; // bot uid

const MAIN_OAUTH = process.env.MAIN_OAUTH;
const MAIN_NAME = process.env.MAIN_NAME;
const MAIN_ID = process.env.MAIN_ID;

const WAIT_REGISTER = 5 * 60 * 1000; // number of milliseconds, to wait before starting to get stream information

const CHANNEL_NAME = process.env.CHANNEL_NAME; // name of the channel for the bot to be in
const CHANNEL_ID = process.env.CHANNEL_ID; // uid of CHANNEL_NAME

let SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));
let STREAMS = JSON.parse(fs.readFileSync("./STREAMS.json"));
let WORDS = JSON.parse(fs.readFileSync("./KEYWORDS.json"));
let ACCOUNT = JSON.parse(fs.readFileSync("./Settings/ACCOUNT.json"));

const COOLDOWN = 90000 // keyword cooldown

var commandsList = ["!roblox", "!link"];

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: BOT_NAME,
    password: `OAuth:${BOT_OAUTH}`,
  },
  channels: [CHANNEL_NAME]
});

client.connect();

const BOT = '[🤖]:';

const bot = new tmi.Client({
  options: { debug: true },
  identity: {
    username: MAIN_NAME,
    password: `OAuth:${MAIN_OAUTH}`,
  },
  channels: [CHANNEL_NAME]
});

bot.connect();

client.on("connected", (channel, username, viewers, method) => {
  client.action(CHANNEL_NAME, `${BOT} Joined channel ${CHANNEL_NAME}. aly1263Minion`)
});
bot.on("connected", (channel, username, viewers, method) => {
  bot.action(CHANNEL_NAME, `Joined channel ${CHANNEL_NAME}. xqcCheer`)
});

const Sec = 1000
const Min = 60 * 1000

const JOIN_TIMER = 1 * 30 * Sec
const GAME_TIMER = 9 * Min
const SOICALS_TIMER = 7 * Min
setInterval(async () => {
    SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));

    const robloxGame = await ROBLOX_FUNCTIONS.getPresence(alyId).then((r)=>{return r.lastLocation});    

    if (SETTINGS.timers == true && SETTINGS.ks == false && (await TWITCH_FUNCTIONS.isLive()) == true) {
        var currentMode = SETTINGS.currentMode.replace(".on", "");
        currentMode = currentMode.replace("!", "");
    
        var timerCommands = SETTINGS.timer;
    
        for (const key in timerCommands) {
          if (key == currentMode) {
            if (robloxGame != 'Website') {
              client.say(CHANNEL_NAME, `/me ${BOT} ${timerCommands[key]}`);
            }
          }
        }
    }
}, JOIN_TIMER);

setInterval(async () => {
    SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));

    const game = await ROBLOX_FUNCTIONS.getPresence(alyId).then((r)=>{return r.lastLocation});
    const onlineStatus = await ROBLOX_FUNCTIONS.getLastOnline(alyId).then((r)=>{return r.diffTimeMinutes});

    if (SETTINGS.timers == true && SETTINGS.ks == false && (await TWITCH_FUNCTIONS.isLive()) == true) {

      if (onlineStatus > 30) {
        client.action(CHANNEL_NAME, `[🎮]: Aly is currently offline.`);
      }
      console.log("game")
      if (game != 'Website') {
        client.action(CHANNEL_NAME, `[🎮]: Aly is currently playing ${game}.`);
      } 
    }
}, GAME_TIMER);

setInterval(async () => {
    SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));
   
    if (SETTINGS.timers == true && SETTINGS.ks == false && (await TWITCH_FUNCTIONS.isLive()) == true) {
      var promo = [
        `!discord`,
        `!youtube`
      ];
  
      var soicalsTimer =
        promo[Math.floor(Math.random() * promo.length)];
      client.say(CHANNEL_NAME, `/me ${soicalsTimer}`);
    }
}, SOICALS_TIMER);

async function ksHandler(client, lowerMessage, twitchUsername, userstate) {
    if (lowerMessage == "!ks.on") {
      if (SETTINGS.ks == true) {
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Killswitch is already on.`
        );
      } else if (SETTINGS.ks == false) {
        SETTINGS.ks = true;
        fs.writeFileSync("./SETTINGS.json", JSON.stringify(SETTINGS));
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} @${CHANNEL_NAME}, Killswitch is on, the bot will not be actively moderating.`
        );
      }
    } else if (lowerMessage == "!ks.off") {
      if (SETTINGS.ks == false) {
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Killswitch is already off.`
        );
      } else if (SETTINGS.ks == true) {
        SETTINGS.ks = false;
        fs.writeFileSync("./SETTINGS.json", JSON.stringify(SETTINGS));
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} @${CHANNEL_NAME}, Killswitch is off, the bot will be actively moderating.`
        );
      }
    }
}

async function timerHandler(client, lowerMessage, twitchUsername, userstate) {
    if (lowerMessage == "!timers.on") {
      if (SETTINGS.timers == true) {
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Timers are already on.`
        );
      } else if (SETTINGS.timers == false) {
        SETTINGS.timers = true;
        fs.writeFileSync("./SETTINGS.json", JSON.stringify(SETTINGS));
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} @${CHANNEL_NAME}, Timers are now on.`
        );
      }
    } else if (lowerMessage == "!timers.off") {
      if (SETTINGS.timers == false) {
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Timers are already off.`
        );
      } else if (SETTINGS.timers == true) {
        SETTINGS.timers = false;
        fs.writeFileSync("./SETTINGS.json", JSON.stringify(SETTINGS));
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} @${CHANNEL_NAME}, Timers are now off.`
        );
      }
    }
}

async function keywordHandler(client, lowerMessage, twitchUsername, userstate) {
  if (lowerMessage == "!keywords.on") {
    if (SETTINGS.keywords == true) {
      return client.raw(
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :Keywords are already enabled.`
      );
    } else if (SETTINGS.timers == false) {
      SETTINGS.keywords = true;
      fs.writeFileSync("./SETTINGS.json", JSON.stringify(SETTINGS));
      return client.raw(
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :@${CHANNEL_NAME}, Keywords are now enabled.`
      );
    }
  } else if (lowerMessage == "!keywords.off") {
    if (SETTINGS.keywords == false) {
      return client.raw(
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :Keywords are already disabled.`
      );
    } else if (SETTINGS.keywords == true) {
      SETTINGS.keywords = false;
      fs.writeFileSync("./SETTINGS.json", JSON.stringify(SETTINGS));
      return client.raw (
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :@${CHANNEL_NAME}, Keywords are now disabled.`
      );
    }
  }
}

let shouldChangeLink = true;

async function newLinkHandler(client, message, twitchUsername, userstate) {
  message = message.trimStart();
  message = [] = message.split(" ");
  message = message[0];

  const isValidLink =
      message.includes("privateServerLinkCode") &&
      message.includes("roblox.com/games");
  const currentMode = SETTINGS.currentMode;

  if (isValidLink && shouldChangeLink == true) {
      SETTINGS.currentLink = message;
      if (currentMode == "!link.on") {
      } else {
        SETTINGS.currentMode = "!link.on";
      }
      fs.writeFileSync("./SETTINGS.json", JSON.stringify(SETTINGS));
      shouldChangeLink = false;
      await setTimeout(1 * 60 * 1000);
      shouldChangeLink = true;
  }
}
async function customModFunctions(client, message, twitchUsername, userstate) {
    var messageArray = ([] = message.toLowerCase().split(" "));

    if (messageArray[0] == "!robloxadd") {
        if (messageArray[1] == null) {
          return client.raw(
            `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Please specify a user to add.`
          );
        }
    
        const isValidUser = await ROBLOX_FUNCTIONS.isValidRobloxUser(
          messageArray[1]
        );
    
        if (!isValidUser.isValidUser)
          return client.raw(
            `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Not a valid username.`
          );
    
        const friend = await ROBLOX_FUNCTIONS.sendFriendRequest(isValidUser.userId);
    
        if (friend == "already") {
          const friends = await ROBLOX_FUNCTIONS.getCurrentUserFriends(3511204536);
    
          let alreadyFriend = false;
    
          friends.forEach(function (friend) {
            if (friend.id == isValidUser.userId) {
              alreadyFriend = true;
            }
          });
    
          if (alreadyFriend)
            return client.raw(
              `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} ${messageArray[1]} is already added.`
            );
    
          return client.raw(
            `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Already sent ${messageArray[1]} a friend request.`
          );
        } else if (friend != "success") {
          return client.raw(
            `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} [Error: Unknown Error Ocurred]`
          );
        }
    
        client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Sent a friend request to ${messageArray[1]}.`
        );
    }
}
async function joinHandler(
  message,
  twitchUsername,
  isModOrBroadcaster,
  twitchUserId
) {
  const currentMode = SETTINGS.currentMode;
  let responseLimit = 1;
  let responseCount = 0;

  if (SETTINGS.ks == true) return;
  if (SETTINGS.ks == false) {
    for (const wordSet in WORDS) {
      if (responseLimit == 0) {
        break;
      }
      if (WORDS[wordSet].some((word) => message.toLowerCase().includes(word))) {
        if (wordSet == "game") {
          RESPONSES.responses[wordSet](client, twitchUsername)
        } else {
          RESPONSES.responses[wordSet](client, twitchUsername, message);
        }
        responseLimit -= 1;
      }
    }
  }
}
async function updateMode(client, message, twitchUsername, userstate) {
    var messageArray = ([] = message.toLowerCase().split(" "));
  
    if (!messageArray[0].includes("!")) return;
    if (!messageArray[0].includes(".on")) return;
  
    var isValidMode = SETTINGS.validModes.includes(messageArray[0]);
    var isIgnoreMode = SETTINGS.ignoreModes.includes(messageArray[0]);
    var isSpecialMode = SETTINGS.specialModes.includes(messageArray[0]);
    var isCustomMode = SETTINGS.customModes.includes(messageArray[0]);
  
    if (isIgnoreMode || isSpecialMode || isCustomMode) return;
  
    if (!isValidMode)
      return client.raw(
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} ${message} is not a valid mode. Valid Modes: !join.on | !link.on | !1v1.on`
      );
    if (SETTINGS.currentMode == messageArray[0])
      return client.raw(
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} ${messageArray[0]} mode is already on.`
      );
    //     fetch("https://gql.twitch.tv/gql", {
    //     "headers": {
    //       "authorization": "OAuth bt29j37avjsigokzr3jq6bt0gscxu7",
    //       "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
    //     },
    //     "body": `[{"operationName":"EditBroadcastContext_ChannelTagsMutation","variables":{"input":{"contentID":"197407231","contentType":"USER","tagIDs":["6ea6bca4-4712-4ab9-a906-e3336a9d8039","ac763b17-7bea-4632-9eb4-d106689ff409","e90b5f6e-4c6e-4003-885b-4d0d5adeb580","8bbdb07d-df18-4f82-a928-04a9003e9a7e","64d9afa6-139a-48d5-ab4e-51d0a92b22de","52d7e4cc-633d-46f5-818c-bb59102d9549"],"authorID":"197407231"}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"4dd3764af06e728e1b4082b4dc17947dd51ab1aabbd8371ff49c01e440dfdfb1"}}},{"operationName":"EditBroadcastContext_BroadcastSettingsMutation","variables":{"input":{"broadcasterLanguage":"en","game":"Roblox","status":"dasas","userID":"197407231"}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"856e69184d9d3aa37529d1cec489a164807eff0c6264b20832d06b669ee80ea5"}}}]`,
    //     "method": "POST"
    //     })
  
    if (SETTINGS.currentMode == "!link.on") {
      SETTINGS.currentLink = null;
      // client.say(CHANNEL_NAME, "!delcom !link");
    }
    // if(SETTINGS.currentMode == '!ticket.on'){
    //   const result = await TWITCH_FUNCTIONS.pauseTicketRedemption(true)
    //   if(result){
    //     client.say(CHANNEL_NAME, `@${CHANNEL_NAME}, successfully paused ticket redemption.`)
    //   }else{
    //     client.say(CHANNEL_NAME, `@${CHANNEL_NAME}, error ocurred when trying to pause ticket redemption`)
    //   }
    // }
    // if(messageArray[0] == '!ticket.on'){
    //   const result = await TWITCH_FUNCTIONS.pauseTicketRedemption(false)
    //     client.say(CHANNEL_NAME, `@${twitchUsername}, ${result}`)
    //   if(result){
    //     client.say(CHANNEL_NAME, `@${CHANNEL_NAME}, successfully unpaused ticket redemption.`)
    //   }else{
    //     client.say(CHANNEL_NAME, `@${CHANNEL_NAME}, error ocurred when trying to unpause ticket redemption`)
    //   }
    // }
  
    client.raw(
      `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} @${CHANNEL_NAME}, ${messageArray[0]} mode is now on.`
    );
    SETTINGS.currentMode = messageArray[0];
  
    fs.writeFileSync("./SETTINGS.json", JSON.stringify(SETTINGS));
  
    SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));
}

async function newUserHandler(client, message, twitchUsername, isFirstMessage, userstate) {
    if (isFirstMessage) {
      var responses = [
        `${twitchUsername} Hello, welcome to the stream tibb12Waving!`,
        `${twitchUsername}, Welcome to the chat tibb12Waving!`,
        `Welcome, ${twitchUsername} to the stream tibb12Waving!`,
        `Hello, ${twitchUsername} tibb12Waving welcome to the stream!`,
        `Hey, ${twitchUsername}, Welcome to the stream tibb12Waving!`,
        `Everyone welcome ${twitchUsername} to the stream. Welcome @${twitchUsername} tibb12Waving!`,
        `Welcome tibb12Waving ${twitchUsername}, how are you doing!`,
        `tibb12Waving!!`,
        `tibb12Waving hi!!`,
        `Hey welcome tibb12Waving`,
        `tibb12Waving hello`,
        `Welcome! tibb12Waving tibb12Waving`,
        `tibb12Waving tibb12Waving`,
        `tibb12Waving`,
        `Welcome tibb12Love`,
        `Hi welcome`,
        `welcome to the stream tibb12Waving`,
        `hey bro welcome`,
        `Hello, welcome to the stream tibb12Waving !`,
        `Welcome to the chat tibb12Waving!`,
        `Hello welcome to the stream tibb12Waving`,
        `Hey welcome tibb12Waving`
      ];
  
        var randomGreeting =
        responses[Math.floor(Math.random() * responses.length)];
        await setTimeout(Math.floor(Math.random() * 15) * 1000)
        client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${randomGreeting}`);
    }
}

async function customUserFunctions(client, message, twitchUsername, userid, userstate) {
  var messageArray = ([] = message.toLowerCase().split(" "));

  if (messageArray[0] == "!cptotime") {
    if (messageArray[1] == undefined) {
      return client.raw(
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Please specify an amount of channel points to convert to farming time. If you want you can also specify what tier you want to check, for example !cptotime 1000 tier1`
      );
    } else if (isNaN(messageArray[1]) == true) {
      return client.raw(
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Number of channel points must be a number.`
      );
    } else {
      const cp = messageArray[1];

      if (
        messageArray[2] == "tier1" ||
        messageArray[2] == "tier2" ||
        messageArray[2] == "tier3" ||
        messageArray[2] == "nosub"
      ) {
        let tierToCheck = messageArray[2];

        const standardRate = 5.33333333;

        const t1Rate = 5.3333333 * 1.2;
        const t2Rate = 5.3333333 * 1.4;
        const t3Rate = 5.3333333 * 2;

        let rate;
        let sub;

        if (tierToCheck == "tier1") {
          rate = t1Rate;
          sub = "you had a Tier 1 sub";
        } else if (tierToCheck == "tier2") {
          rate = t2Rate;
          sub = "you had a Tier 2 sub";
        } else if (tierToCheck == "tier3") {
          rate = t3Rate;
          sub = "you had a Tier 3 sub";
        } else if (tierToCheck == "nosub") {
          rate = standardRate;
          sub = "you had no sub";
        }

        const test = cp / rate / (60 * 24 * 365);

        const cpToHours = ROBLOX_FUNCTIONS.timeToAgo(test);

        client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} If ${sub}, it would take ${
            cpToHours.timeString
          } to farm ${ROBLOX_FUNCTIONS.formatNumber(cp)} channel points.`
        );
      } else {
        const getSubStatus = await TWITCH_FUNCTIONS.getSubStatus(userid);

        const tier = getSubStatus.data;

        const standardRate = 5.33333333;

        const t1Rate = 5.3333333 * 1.2;
        const t2Rate = 5.3333333 * 1.4;
        const t3Rate = 5.3333333 * 2;

        let rate;
        let sub;

        if (tier.tier != null) {
          if (tier == 1000) {
            rate = t1Rate;
            sub = "you're a tier 1 sub";
          } else if (tier == 2000) {
            rate = t2Rate;
            sub = "you're a tier 2 sub";
          } else if (tier == 3000) {
            rate = t3Rate;
            sub = "you're a tier 3 sub";
          }
        } else {
          rate = standardRate;
          sub = "you dont have a sub";
        }

        const test = cp / rate / (60 * 24 * 365);

        const cpToHours = ROBLOX_FUNCTIONS.timeToAgo(test);

        client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Since ${sub}, it would take ${
            cpToHours.timeString
          } to farm ${ROBLOX_FUNCTIONS.formatNumber(cp)} channel points.`
        );

        return;
      }
    }
  } else if (messageArray[0] == "!whogiftedme") {
    const getSubStatus = await TWITCH_FUNCTIONS.getSubStatus(userid);

    const data = getSubStatus.data;

    // if (data.length != 0) {
    //   if (data[0].is_gift == false) {
    //     return client.say(
    //       CHANNEL_NAME,
    //       `@${twitchUsername}, you were not gifted a sub, you subscribed yourself.`
    //     );
    //   }
    // }
    const channelEmotes = await TWITCH_FUNCTIONS.getChannelEmotes(userid);
    const emoteData = channelEmotes.data;

    let emoteTable = {
      "Tier 1": [20],
      "Tier 2": [40],
      "Tier 3": [100],
    };

    for (let i = 0; i < emoteData.length; i++) {
      const emote = emoteData[i];

      const emoteTier = emote.tier;

      if (emoteTier == 1000) {
        emoteTable["Tier 1"].push(emote);
      } else if (emoteTier == 2000) {
        emoteTable["Tier 2"].push(emote);
      } else if (emoteTier == 3000) {
        emoteTable["Tier 3"].push(emote);
      }
    }

    if (data.length != 0) {
      const gifter = data[0].gifter_name;

      let tier;

      if (data[0].tier == 1000) {
        tier = "Tier 1";
      } else if (data[0].tier == 2000) {
        tier = "Tier 2";
      } else if (data[0].tier == 3000) {
        tier = "Tier 3";
      }

      function findItem(arr, randomEmote) {
        for (var i = 0; i < arr.length; ++i) {
          var obj = arr[i];
          if (obj.name == randomEmote) {
            return i;
          }
        }
        return -1;
      }
      var exemption1 = findItem(emoteData, "tibb12Howdy");
      emoteData.splice(exemption1, 1);

      const randomEmote1 =
        emoteData[Math.floor(Math.random() * emoteData.length)].name;
      var i = findItem(emoteData, randomEmote1);
      emoteData.splice(i, 1);
      const randomEmote2 =
        emoteData[Math.floor(Math.random() * emoteData.length)].name;
      var e = findItem(emoteData, randomEmote2);
      emoteData.splice(i, 1);
      const randomEmote3 =
        emoteData[Math.floor(Math.random() * emoteData.length)].name;

      return client.say(
        CHANNEL_NAME,
        `@${twitchUsername}, ${gifter} , gifted you a ${tier} sub. As a ${tier} sub you have access to ${emoteTable[tier].length} channel emotes and earn ${emoteTable[tier][0]}% more channel points. Here are three channel emotes you have with a ${tier} sub, ${randomEmote1} ${randomEmote2} ${randomEmote3}`
      );
    } else {
      return client.say(
        CHANNEL_NAME,
        `@${twitchUsername}, you don't currently have a sub.`
      );
    }
  }
}

client.on("message", async (
  channel,
  userstate,
  message,
  self,
  viewers,
  target
  ) => {
    if(self || !message.startsWith('!')) return;
    SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));
    const isFirstMessage = userstate["first-msg"];
    const twitchUserId = userstate["user-id"];
    const twitchUsername = userstate["username"];
    const isSubscriber = userstate["subscriber"];
    const subscriberMonths = (() => {
        if (isSubscriber) {
          return userstate["badge-info"].subscriber;
        } else {
          return null;
        }
      })();

    const isBroadcaster = 
    twitchUsername == CHANNEL_NAME;
    const isAdmin =
    twitchUserId == BOT_ID;
    const isMod = userstate["mod"];
    const hexNameColor = userstate.color;
    const ModOrBroadcaster = isMod || isBroadcaster;
    const lowerMessage = message.toLowerCase();
    const isVip = (() => {
        if (userstate["badges"] && userstate["badges"].vip == 1) {
          return true;
        } else {
          return false;
        }
    })();

    const args = message.slice(1).split(' ');
    const command = args.shift().toLowerCase();


    const robloxGame = await ROBLOX_FUNCTIONS.getPresence(alyId).then((r)=>{return r.lastLocation});
    const locationId = await ROBLOX_FUNCTIONS.getPresence(alyId).then((r)=>{return r.placeId});
    const onlineStatus = await ROBLOX_FUNCTIONS.getLastOnline(alyId).then((r)=>{return r.diffTimeMinutes});
    const playtime = await ROBLOX_FUNCTIONS.getLastOnline(alyId).then((r)=>{return r.timeString})

    if (SETTINGS.ks == false) {
      if (message.toLowerCase() == "!game" || message.toLowerCase() == "1game") {      
    
          if (onlineStatus > 30) {
            return client.raw(
              `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Aly is not playing anything right now.`);
          }
          console.log(robloxGame)
          if (robloxGame != 'Website') {
           client.raw(
            `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Aly is currently playing ${robloxGame}.`); 
          return
          }
      
          return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Aly is currently switching games.`); 
          }
          if (message.toLowerCase() == "!gamelink") {
            if (locationId == '8343259840') {
              return client.raw(
                `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Current game link -> roblox.com/games/4588604953`)};
            if (locationId == '6839171747') {
              return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Current game link -> roblox.com/games/6516141723`)};
      
            // if (SETTINGS.currentMode == "!link.on") {
            //   if (SETTINGS.currentLink != null) {
            //     return client.raw(
            //       `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Current game link -> ${SETTINGS.currentLink}`
            //     );
            //   }
            // }
            if (onlineStatus > 30) {
              return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Aly is currenly offline so there is no game link.`
              );
            }
            if (robloxGame != 'Website') {
              client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Current game link -> roblox.com/games/${locationId}`
              );
              return
            }
            return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Aly is currently switching games.`);
          }
          if (message.toLowerCase() == "!playtime" || message.toLowerCase() == "!gametime") {
            if (onlineStatus > 30) {
              return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Aly is not playing anything right now.`);
            }
      
            console.log(playtime)
            if (robloxGame != 'Website') {
              client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Aly has been playing ${robloxGame} for ${playtime}.`);
              return
            }
            
            return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Aly is currently switching games.`);
          }
          if (message.toLowerCase() == "!rstats" || message.toLowerCase() )
          if (SETTINGS.keywords == true) {
            const msg = message.toLowerCase();
            // const kwrd = message.toLowerCase().includes;
            const linkAllowed = isVip || ModOrBroadcaster || isAdmin
            // if (!isMod || !isBroadcaster || !isAdmin) {
            //   if (
            //       message.toLowerCase().includes("what game is this") ||
            //       message.toLowerCase().includes("what game r u") ||
            //       message.toLowerCase().includes("what game is that") ||
            //       message.toLowerCase().includes("game called") ||
            //       message.toLowerCase().includes("game name") ||
            //       message.toLowerCase().includes("what is this game")
            //   ) {
          
            //       if (onlineStatus > 30) {
            //           return client.raw(
            //             `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Aly is not playing anything right now.`);
            //         }
            //         console.log(robloxGame)
            //         if (robloxGame != 'Website') {
            //          client.raw(
            //           `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Aly is currently playing ${robloxGame}.`); 
            //         return
            //         }
                
            //         return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Aly is currently switching games.`);            
            //   }
            // }
            if (!linkAllowed) {
              if (message.toLowerCase().includes("***")) {
                  client.say(
                    CHANNEL_NAME,
                    `/me ${BOT} @${twitchUsername}, Do NOT send links.`
                );
              }
            }
          }
      }
    if (message.toLowerCase() == "!namecolor") {
      client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Your username hex code is ${hexNameColor}.`);
    }
    if (message.toLowerCase() == "!subage") {
      if (!isSubscriber) {
          client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} You are not currenty a sub.`);
      }
      if (isSubscriber) {
          client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} You are currently subscribed to ${CHANNEL_NAME} for ${subscriberMonths} months.`);
      }
    }
    if (
      message.toLowerCase() == "!commands" ||
      message.toLowerCase() == "!cmds" ||
      message.toLowerCase() == "!coms"
      ) {
          client.raw(
            `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Click here for commands: cmds.mrcheeezz.com`
          );
      }
    if (message.toLowerCase() == "!github") {
      client.say(CHANNEL_NAME, `${BOT} @${twitchUsername} The bots github -> github.com/mr-cheeezz/alybot`);
    }
    if (message.toLowerCase() == "!tf") {
      client.action(
        CHANNEL_NAME,
        `${BOT} Click here to get Jebaited -> tf.mrcheeezz.com`
      );
    }
    if (command === 'schedule') {
      client.raw(
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Join the discord to see alys schedue -> https://discord.gg/QgWPcxRVEt`
      );
    }
    var messageArray = ([] = message.toLowerCase().split(" "));
    if (messageArray[0] == "!join") {
      if (messageArray[1] == null) {
        client.action(CHANNEL_NAME, `${BOT} ${twitchUsername} -> Click here to play : roblox.com/users/${alyId} (${CHANNEL_NAME})`);
      } else
      client.action(CHANNEL_NAME, `${BOT} ${messageArray[1]} -> Click here to play : roblox.com/users/${alyId} (${CHANNEL_NAME})`);
     }
     if (message.toLowerCase() == "!rstats" || message.toLowerCase() == "!robloxstatus") {
      if (onlineStatus > 30) {
        client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Aly is currently offline, she has been offline for ${playtime}`);
      } else if (robloxGame == 'Website') {
        client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Aly is currently on the website.`);
      } else if (robloxGame != 'Website') {
        client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Aly is currently in game, she is playing ${robloxGame}.`);
      }
    }
    if (message.toLowerCase() == "!whispers") {
      client.say(CHANNEL_NAME, `@${twitchUsername} click here to check your whispers -> twitch.tv/popout/moderator/${twitchUsername}/whispers`)
    }
  if (SETTINGS.ks == false) {
      newUserHandler(client, message, twitchUsername, isFirstMessage, userstate);
      customUserFunctions(client, message, twitchUsername, twitchUserId, userstate);
  }
  if (isBroadcaster || isMod || isAdmin) {
      ksHandler(client, lowerMessage, twitchUsername, userstate);
      updateMode(client, message, twitchUsername, userstate);
      timerHandler(client, lowerMessage, twitchUsername, userstate);
      keywordHandler(client, lowerMessage, twitchUsername, userstate);
      customModFunctions(client, message, twitchUsername, userstate);
      newLinkHandler(client, message, twitchUsername, userstate);
  }
  if (isMod || isBroadcaster || isAdmin) {
      if (SETTINGS.ks == false) {
          if (message.toLowerCase() == "!currentmode") {
              SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));
              var currentMode = SETTINGS.currentMode.replace(".on", "");
              currentMode = currentMode.replace("!", "");
              
              client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} The bot is currently in ${currentMode} mode.`);
              return
          }
          if (message.toLowerCase() == "!validmodes") {
            client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Valid Modes: !join.on | !link.on | !1v1.on`);
          }
          if (lowerMessage == "!settings") {
            SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));
      
            if (SETTINGS.ks == false && SETTINGS.timers == true && SETTINGS.keywords == true) {
              client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :Current Settings: Killswitch - Off | Timers - On | Keywords - On`);
            } else if (SETTINGS.ks == false && SETTINGS.timers == false && SETTINGS.keywords == true) {
              client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :Current Settings: Killswitch - Off | Timers - Off | Keywords - On`);
            } else if (SETTINGS.ks == false && SETTINGS.timers == false && SETTINGS.keywords == false) {
              client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :Current Settings: Killswitch - Off | Timers - Off | Keywords - Off`);
            } else if (SETTINGS.ks == false && SETTINGS.timers == false && SETTINGS.keywords == false) {
              client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :Current Settings: Killswitch - Off | Timers - Off | Keywords - Off`);
            }
          }
      }
  }

  var keywords;

  var messageArray = ([] = message.split(" "));
  var isCommand = commandsList.includes(messageArray[0]);

  for (const wordSet in WORDS) {
    if (WORDS[wordSet].some((word) => message.toLowerCase().includes(word))) {
      keywords = true;
      continue;
    }
  }

  if (!ModOrBroadcaster && SETTINGS.keywords == true && SETTINGS.ks == false) {
    joinHandler(message, twitchUsername, ModOrBroadcaster, twitchUserId);
  }

  if (SETTINGS.ks && !ModOrBroadcaster) {
    return;
  }
});


async function liveUpHandler() {
  // TO DO = first person to go to stream gets free channel points
  client.say(
    `${CHANNEL_NAME}`,
    `${BOT} ${CHANNEL_NAME}, is now live. Logging will start ${
      WAIT_REGISTER / (60 * 1000)
    } minutes after this point to avoid false logging.`
  );
  await setTimeout(WAIT_REGISTER);
  if (await TWITCH_FUNCTIONS.isLive()) {
    client.say(
      `${CHANNEL_NAME}`,
      `${BOT} Logging now starts. There has been ${streamNumber} number of streams since logging started and this stream will be ${
        streamNumber + 1
      }`
    );
    const time = new Date();
    const startTime = time.getTime() - WAIT_REGISTER;
    streamNumber++;
    STREAMS[streamNumber] = STREAMS[1];
    STREAMS[streamNumber]["date"] = time;
    STREAMS[streamNumber]["day"] = time.getDay();
    STREAMS[streamNumber]["ISODate"] = time.toISOString();
    STREAMS[streamNumber]["streamStart"] = time.getTime();
    fs.writeFileSync("./STREAMS.json", JSON.stringify(STREAMS));
  } else {
    client.say(`${CHANNEL_NAME}`, "false log.");
  }
}

async function liveDownHandler() {
  if (await TWITCH_FUNCTIONS.isLive()) {
    await setTimeout(WAIT_REGISTER / 100);
    client.say(
      `${CHANNEL_NAME}`,
      `${BOT} ${CHANNEL_NAME}, is now offline. Logging has stopped.`
    );    
    const endTime = new Date().getTime();
    STREAMS[streamNumber]["streamEnd"] = endTime;
    STREAMS[streamNumber]["repeatLengthOffenders"] = {};
    STREAMS[streamNumber]["repeatSpamOffenders"] = {};
    fs.writeFileSync("./STREAMS.json", JSON.stringify(STREAMS));
  } else {
    client.say("false log.");
  }
}

var pubsub;
const myname = CHANNEL_NAME;

var ping = {};
ping.pinger = false;
ping.start = function () {
  if (ping.pinger) {
    clearInterval(ping.pinger);
  }
  ping.sendPing();

  ping.pinger = setInterval(function () {
    setTimeout(function () {
      ping.sendPing();
    }, Math.floor(Math.random() * 1000 + 1));
  }, 4 * 60 * 1000);
};
ping.sendPing = function () {
  try {
    pubsub.send(
      JSON.stringify({
        type: "PING",
      })
    );
    ping.awaitPong();
  } catch (e) {
    console.log(e);

    pubsub.close();
    StartListener();
  }
};
ping.awaitPong = function () {
  ping.pingtimeout = setTimeout(function () {
    console.log("WS Pong Timeout");
    pubsub.close();
    StartListener();
  }, 10000);
};

ping.gotPong = function () {
  clearTimeout(ping.pingtimeout);
};

var requestListen = function (topics, token) {
  let pck = {};
  pck.type = "LISTEN";
  pck.nonce = myname + "-" + new Date().getTime();

  pck.data = {};
  pck.data.topics = topics;
  if (token) {
    pck.data.auth_token = token;
  }

  pubsub.send(JSON.stringify(pck));
};

var StartListener = function () {
  pubsub = new WebSocket("wss://pubsub-edge.twitch.tv");
  pubsub
    .on("close", function () {
      console.log("Disconnected");
      StartListener();
    })
    .on("open", function () {
      ping.start();
      runAuth();
    });
  pubsub.on("message", async function (raw_data, flags) {
    SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));
    var PData = JSON.parse(raw_data);
    if (PData.type == "RECONNECT") {
      console.log("Reconnect");
      pubsub.close();
    } else if (PData.type == "PONG") {
      ping.gotPong();
    } else if (PData.type == "RESPONSE") {
      console.log(PData);
      console.log("RESPONSE: " + (PData.error ? PData.error : "OK"));
    } else if (PData.type == "MESSAGE") {
      PData = PData.data;
      const pubTopic = PData.topic;
      const pubMessage = PData.message;
      const serverTime = pubMessage.server_time;
      const type = JSON.parse(pubMessage).type;
      if (type == "stream-up") {
        // TO DO = first person to go to stream gets free channel points
        client.say(CHANNEL_NAME, `/followersoff`);
        liveUpHandler();
      } else if (type == "stream-down") {
        client.say(CHANNEL_NAME, `/followers`);
        liveDownHandler();
      } else if (type == "AD_POLL_CREATE") {
        TWITCH_FUNCTIONS.onMultiplayerAdStart();
      } else if (type == "AD_POLL_COMPLETE") {
        var adData = pubMessage.data.poll;
        TWITCH_FUNCTIONS.onMultiplayerAdEnd(adData);
      } else if (type == "moderation_action") {
        const followData = JSON.parse(pubMessage).data;
        const followChange = followData.moderation_action;

        if (followChange == "followers") {
          // follow only mode gets enabled
          if (
            SETTINGS.ks == false &&
            (await TWITCH_FUNCTIONS.isLive()) == true
          ) {
            await setTimeout(WAIT_UNTIL_FOC_OFF);
            client.say(CHANNEL_NAME, `/followersoff`);
          }
        } else if (followChange == "followersoff") {
          if (!SETTINGS.ks) {
          }
          // follow only mode gets disabled
        }
        if (JSON.parse(pubMessage).data.moderation_action == "untimeout") {
          const untimedoutUser = JSON.parse(pubMessage).data.target_user_login;
          FILTER_FUNCTIONS.onUntimedOut(untimedoutUser);
        }
      } else if (pubTopic == `stream-chat-room-v1.${CHANNEL_ID}`) {
        // // if(pubMessage.data.room.modes.followers_)
        // var modeData = JSON.parse(pubMessage).data.room.modes
        // if (modeData.emote_only_mode_enabled == true) {
        //   console.log('emote only enabled')
        // } else if (modeData.subscribers_only_mode_enabled == true) {
        //   console.log('sub only mode enabled')
        // }
      } else if (pubTopic == `ads.${CHANNEL_ID}`) {
        if (SETTINGS.ks == false) {
          client.say(
            CHANNEL_NAME,
            `${BOT} An ad has been ran, subscribe with prime for free and enjoy watching with 0 ads all month for free, !prime for more info EZY PogU .`
          );
        }
      } else if (pubTopic == `community-moments-channel-v1.${CHANNEL_ID}`) {
        if (SETTINGS.ks == false) {
          client.say(
            CHANNEL_NAME,
            `${BOT} A new moment PagMan everyone claim it while you can PogU .`
          )
        }
      } else if (
        type == "POLL_COMPLETE" ||
        type == "POLL_TERMINATE" ||
        type == "POLL_ARCHIVE"
      ) {
        // if (SETTINGS.ks == true) return
        const r = await TWITCH_FUNCTIONS.getLatestPollData();

        if (r == "error") return;

        if (type == "POLL_ARCHIVE") {
          const nodes = r.userNodes;

          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const username = node.user.login;
            const cp = node.tokens.communityPoints;

            const getSubStatus = await TWITCH_FUNCTIONS.getSubStatus(
              node.user.id
            );

            if (getSubStatus.data[0] == null) return;
            const tier = getSubStatus.data[0].tier;

            const standardRate = 5.33333333;

            const t1Rate = 5.3333333 * 1.2;
            const t2Rate = 5.3333333 * 1.4;
            const t3Rate = 5.3333333 * 2;

            let rate;
            let sub;

            if (tier == 1000) {
              rate = t1Rate;
              sub = "you're a tier 1 sub";
            } else if (tier == 2000) {
              rate = t2Rate;
              sub = "you're a tier 2 sub";
            } else if (tier == 3000) {
              rate = t3Rate;
              sub = "you're a tier 3 sub";
            } else {
              rate = standardRate;
              sub = "you dont have a sub";
            }

            const test = cp / rate / (60 * 24 * 365);

            const cpToHours = ROBLOX_FUNCTIONS.timeToAgo(test);

                        if (cp > 1000) {
                          client.say(
                            CHANNEL_NAME,
                            `@${username}, lost ${cp} channel points, since ${sub} thats ${cpToHours.timeString} of farming RIPBOZO`
                          );
                        }
          }
        } else if (type == "POLL_TERMINATE" || type == "POLL_COMPLETE") {
                    const nodes = r.userNodes;

                    for (let i = 0; i < nodes.length; i++) {
                      const node = nodes[i];
                      const username = node.user.login;
                      const cp = node.tokens.communityPoints;

                      console.log(JSON.stringify(r, null, 1));

                      let winning_choice_id;
                      let winning_choice_votes = 0;

                      r.choices.forEach(function (choice) {
                        if (choice.votes.total > winning_choice_votes) {
                          winning_choice_votes = choice.votes.total;
                          winning_choice_id = choice.id;
                        }
                      });

                      //

                      nodes.forEach(function (node) {
                        var packs = [];
                        node.choices.forEach(function (choice) {
                          if (choice.id != winning_choice_id) {
                            r.choices.forEach(function (mainChoice) {
                              if (mainChoice.id == choice.id) {
                                packs.push(mainChoice.title);
                              }
                            });
                          }
                        });
                      });

                      nodes.forEach(function (node) {
                        var choiceArray = {};

                        const user = node.user.login;

                        node.choices.forEach(function (choice) {
                          if (!choiceArray[choice.pollChoice.id]) {
                            choiceArray[choice.pollChoice.id] =
                              choice.tokens.communityPoints;
                          } else {
                            choiceArray[choice.pollChoice.id] =
                              choiceArray[choice.pollChoice.id] +
                              choice.tokens.communityPoints;
                          }
                        });

                        let mostVotedFor;
                        let mostedVoted = 0;
                        let mostVotedForName;
                        let total = 0;

                        for (const key in choiceArray) {
                          const amount = choiceArray[key];
                          total += amount;
                          if (amount > mostedVoted) {
                            mostVotedFor = key;
                          }
                        }

                        r.choices.forEach(function (mainChoice) {
                          console.log(mostVotedFor);
                          if (mainChoice.id == mostVotedFor) {
                            mostVotedForName = mainChoice.title;
                          }
                        });

                        console.log(
                          `${user} spent in total ${total} channel points, spending the most on ${mostVotedForName} which they spent ${choiceArray[mostVotedFor]} channel points on.`
                        );
                      });
                    }

          var polldata = r;
          var choices = polldata.choices;
          var userNodes = polldata.userNodes;

          const determineWinner = async () => {
            let winner_id = "";
            let winner_title = "";
            let winner_votes = 0;

            choices.forEach(function (choice, index) {
              const totalVotes = choice.votes.total;
              if (totalVotes > winner_votes) {
                winner_id = choice.id;
                winner_title = choice.title;
                winner_votes = totalVotes;
              }
            });

            return {
              winner_id: winner_id,
              winner_title: winner_title,
              winner_votes: winner_votes,
            };
          };

          const collateUserData = async () => {
            const userData = {};

            userNodes.forEach(function (node) {
              const userChoices = node.choices;

              const userId = node.user.id;
              const username = node.user.login;
              const displayName = node.user.displayName;

              userData[userId] = {
                username: username,
                displayName: displayName,
              };

              userChoices.forEach(function (userChoice) {
                userData[userId][userChoice.pollChoice.id] =
                  userChoice.tokens.communityPoints;
              });
            });

            return userData;
          };

          const collateUserLosses = async () => {
            const userData = await collateUserData();
            const winnerData = await determineWinner();

            const userLosses = {};

            for (const userId in userData) {
              userLosses[userId] = {
                biggestLoss: 0,
                biggestLossId: "",
                allLosses: {},
                votedForWinner: false,
                winnerLoss: 0,
                winnerId: winnerData.winner_id,
                username: userData[userId].username,
                displayName: userData[userId].displayName,
              };

              for (const choice in userData[userId]) {
                // console.log(choice)
                if (
                  userData[userId][choice] != userData[userId].username &&
                  userData[userId][choice] != userData[userId].displayName
                ) {
                  if (choice != winnerData.winner_id) {
                    // console.log(userData[userId][choice])
                    userLosses[userId]["allLosses"][choice] =
                      userData[userId][choice];
                  } else {
                    userLosses[userId]["votedForWinner"] = true;
                    userLosses[userId]["winnerLoss"] =
                      userData[userId][winnerData.winner_id];
                    // console.log(userData[userId][winnerData.winner_id])
                  }
                }
              }

              for (const user in userLosses) {
                for (const loss in userLosses[user]["allLosses"]) {
                  const biggestLoss = userLosses[user]["biggestLoss"];

                  if (userLosses[user]["allLosses"][loss] > biggestLoss) {
                    userLosses[user]["biggestLoss"] =
                      userLosses[user]["allLosses"][loss];
                    userLosses[user]["biggestLossId"] = loss;
                  }
                }
              }
            }
            return userLosses;
          };

          const choiceIdAndTitle = async () => {
            const choiceArray = {};
            const winnerData = await determineWinner();

            choices.forEach(function (choice) {
              if (choice.id != winnerData.winner_id) {
                choiceArray[choice.id] = choice.title;
              }
            });
            return choiceArray;
          };

          const processUserLosses = async () => {
            const userLosses = await collateUserLosses();
            const choiceArray = await choiceIdAndTitle();
            const userData2 = await collateUserData();

            const getSubStatus = await TWITCH_FUNCTIONS.getSubStatus(
              node.user.id
            );

            if (getSubStatus.data[0] == null) return;
            const tier = getSubStatus.data[0].tier;

            const standardRate = 5.33333333;

            const t1Rate = 5.3333333 * 1.2;
            const t2Rate = 5.3333333 * 1.4;
            const t3Rate = 5.3333333 * 2;

            let rate;
            let sub;

            if (tier == 1000) {
              rate = t1Rate;
              sub = "you're a tier 1 sub";
            } else if (tier == 2000) {
              rate = t2Rate;
              sub = "you're a tier 2 sub";
            } else if (tier == 3000) {
              rate = t3Rate;
              sub = "you're a tier 3 sub";
            } else {
              rate = standardRate;
              sub = "you dont have a sub";
            }

            const packs = {};

            const packLeaders = {};

            const messages = {};

            for (const choiceId in choiceArray) {
              packs[choiceId] = {};
              packLeaders[choiceId] = {};
            }

            for (const userId in userLosses) {
              const user = userLosses[userId];

              let overallLoss = 0;

              for (const loss in user.allLosses) {
                packs[loss][userId] = user.biggestLoss;
              }
            }

            for (const pack in packs) {
              let highestLoss = 0;
              let packLeader;
              let totalPackLoss = 0;

              for (const packMember in packs[pack]) {
                totalPackLoss += packs[pack][packMember];

                if (packs[pack][packMember] > highestLoss) {
                  highestLoss = packs[pack][packMember];
                  packLeader = packMember;
                }
              }

              packLeaders[pack] = {
                packLeader: packLeader,
                loss: highestLoss,
                totalPackLoss: totalPackLoss,
              };
            }
            // console.log(userLosses)
            // console.log(packs)
            // console.log(packLeaders)

            for (const pack in packLeaders) {
              if (packLeaders[pack].packLeader != undefined) {
                const leader = packLeaders[pack].packLeader;
                const loss = packLeaders[pack].loss;
                const totalLoss = packLeaders[pack].totalPackLoss;

                const username = userData2[leader].username;
                let totalLoss2 = 0;
                let tempLoss2 = 0;

                for (const userLoss in userLosses) {
                  for (const loss2 in userLosses[userLoss].allLosses) {
                    if (loss2 == pack) {
                      tempLoss2 += userLosses[userLoss].allLosses[loss2];
                    }
                  }
                }

                if (
                  totalLoss > 1000 &&
                  loss > 500 &&
                  tempLoss2 > userLosses[leader]["winnerLoss"] * 2
                ) {
                  for (const userLoss in userLosses) {
                    for (const loss2 in userLosses[userLoss].allLosses) {
                      if (loss2 == pack) {
                        totalLoss2 += userLosses[userLoss].allLosses[loss2];
                      }
                    }
                  }

                  messages[
                    pack
                  ] = `RIPBOZO ${choiceArray[pack]} pack -${totalLoss2} channel points, pack leader ${userLosses[leader].username} lost ${userLosses[leader]["allLosses"][pack]} channel points.`;
                }
              }
            }

            return messages;
          };

          const processedData = await processUserLosses();

          for (const message in processedData) {
            client.say(CHANNEL_NAME, `${processedData[message]}`);
          }
        }
      } else if (pubTopic == `predictions-channel-v1.${CHANNEL_ID}`) {
        if (type == "event-created") {
        } else if (type == "event-updated") {
          const event = JSON.parse(pubMessage).data.event;

          const status = event.status;

          if (status == "RESOLVED") {
            const winning_outcome_id = event.winning_outcome_id;
            const prediction_id = event.id;
            const predictionData =
              await TWITCH_FUNCTIONS.getLatestPredictionData();

            console.log(predictionData);
          }
        }
      } else if (pubTopic == `community-points-channel-v1.${CHANNEL_ID}`) {
        if (type == "reward-redeemed") {
          const wasteCP = "95f8445b-ba65-456c-a75c-78b1061367f6";
          const hydrate = "2a8b4bcd-6593-4ae0-bb14-3e8d815806d6";
          const bigBop = "36ea71d1-996d-4fff-aaff-be3df69ef306";
          // const emoteOnly = "";
          

          const redemptionId = JSON.parse(pubMessage).data.redemption.reward.id;

          const twitchUsername =
          JSON.parse(pubMessage).data.redemption.user.login;

          if (redemptionId == wasteCP) {
            // client.say(
            //   CHANNEL_NAME,
            //   `${BOT} ${twitchUsername} just wasted 700 channel points OMEGALUL RIPBOZO`
            // );
          }

          if (redemptionId == hydrate) {
            await setTimeout(1000 * 3)
            client.say(
              CHANNEL_NAME,
              `Hydrate xqcJuice`
            );
          }

          if (redemptionId == bigBop) {
            await setTimeout(1000 * 3)
            client.action(
              CHANNEL_NAME,
              `${BOT} ${twitchUsername} just BOP bopped the chat aly1263Bopper !`
            );
          }
        }
      }
    }
  });
};

var runAuth = function () {
  requestListen(
    [
      // `activity-feed-alerts-v2.${CHANNEL_ID}`,
      `ads.${CHANNEL_ID}`,
      // `ads-manager.${CHANNEL_ID}`,
      // `channel-ad-poll-update-events.${CHANNEL_ID}`,
      // `ad-property-refresh.${CHANNEL_ID}`,
      // `automod-levels-modification.${CHANNEL_ID}`,
      // `automod-queue.${CHANNEL_ID}`,
      `leaderboard-events-v1.${CHANNEL_ID}`,
      // `bits-campaigns-v1.${CHANNEL_ID}`,
      // `campaign-events.${CHANNEL_ID}`,
      // `user-campaign-events.${CHANNEL_ID}`,
      // `celebration-events-v1.${CHANNEL_ID}`,
      // `channel-bits-events-v1.${CHANNEL_ID}`,
      // `channel-bit-events-public.${CHANNEL_ID}`,
      // `channel-event-updates.${CHANNEL_ID}`,
      // `channel-squad-invites.${CHANNEL_ID}`,
      // `channel-squad-updates.${CHANNEL_ID}`,
      // `channel-subscribe-events-v1.${CHANNEL_ID}`,
      // `channel-cheer-events-public-v1.${CHANNEL_ID}`,
      // `broadcast-settings-update.${CHANNEL_ID}`,
      // `channel-drop-events.${CHANNEL_ID}`,
      // `channel-bounty-board-events.cta.${CHANNEL_ID}`,
      // `chatrooms-user-v1.505216805`,
      // `community-boost-events-v1.${CHANNEL_ID}`,
      `community-moments-channel-v1.${CHANNEL_ID}`,
      // `community-moments-user-v1.${CHANNEL_ID}`,
      // `community-points-broadcaster-v1.${CHANNEL_ID}`,
      `community-points-channel-v1.${CHANNEL_ID}`,
      // `community-points-user-v1.${CHANNEL_ID}`,
      `predictions-channel-v1.${CHANNEL_ID}`,
      // `predictions-user-v1.${CHANNEL_ID}`,
      // `creator-goals-events-v1.${CHANNEL_ID}`,
      // `dashboard-activity-feed.${CHANNEL_ID}`,
      // `dashboard-alert-status.${CHANNEL_ID}`,
      // `dashboard-multiplayer-ads-events.${CHANNEL_ID}`,
      // `emote-uploads.${CHANNEL_ID}`,
      // `emote-animations.${CHANNEL_ID}`,
      // `extension-control.upload.${CHANNEL_ID}`,
      // `follows.${CHANNEL_ID}`,
      // `friendship.${CHANNEL_ID}`,
      // `hype-train-events-v1.${CHANNEL_ID}`,
      // `user-image-update.${CHANNEL_ID}`,
      // `low-trust-users.${CHANNEL_ID}`,
      // `midnight-squid-recipient-v1.${CHANNEL_ID}`,
      // //`chat_moderator_actions.${CHANNEL_ID}`
      `chat_moderator_actions.${BOT_ID}.${CHANNEL_ID}`,
      // `moderator-actions.${CHANNEL_ID}`,
      // `multiview-chanlet-update.${CHANNEL_ID}`,
      // `channel-sub-gifts-v1.${CHANNEL_ID}`,
      // `onsite-notifications.${CHANNEL_ID}`,
      // `payout-onboarding-events.${CHANNEL_ID}`,
      `polls.${CHANNEL_ID}`,
      // `presence.${CHANNEL_ID}`,
      // `prime-gaming-offer.${CHANNEL_ID}`,
      // `channel-prime-gifting-status.${CHANNEL_ID}`,
      // `pv-watch-party-events.${CHANNEL_ID}`,
      // `private-callout.${CHANNEL_ID}`,
      // `purchase-fulfillment-events.${CHANNEL_ID}`,
      // `raid.${CHANNEL_ID}`,
      // `radio-events-v1.${CHANNEL_ID}`,
      // `rocket-boost-channel-v1.${CHANNEL_ID}`,
      // `squad-updates.${CHANNEL_ID}`,
      // `stream-change-v1.${CHANNEL_ID}`,
      // `stream-change-by-channel.${CHANNEL_ID}`,
      `stream-chat-room-v1.${CHANNEL_ID}`,
      // `subscribers-csv-v1.${CHANNEL_ID}`,
      `channel-unban-requests.${BOT_ID}.${CHANNEL_ID}`,
      // `user-unban-requests.${CHANNEL_ID}`,
      `upload.${CHANNEL_ID}`,
      // `user-bits-updates-v1.${CHANNEL_ID}`,
      // `user-commerce-events.${CHANNEL_ID}`,
      // `user-crate-events-v1.${CHANNEL_ID}`,
      // `user-drop-events.${CHANNEL_ID}`,
      // `user-moderation-notifications.${CHANNEL_ID}`,
      // `user-preferences-update-v1.${CHANNEL_ID}`,
      // `user-properties-update.${CHANNEL_ID}`,
      // `user-subscribe-events-v1.${CHANNEL_ID}`,
      `video-playback.${CHANNEL_ID}`,
      `video-playback-by-id.${CHANNEL_ID}`,
      // `video-thumbnail-processing.${CHANNEL_ID}`,
      `whispers.${BOT_ID}`,
    ],
    BOT_OAUTH
  );
};
//TIBB_TOKEN
StartListener();

client.on("raided", (channel, username, viewers, method) => { 
  if (SETTINGS.ks == false) {
      if (viewers >= 5) {
          client.say(CHANNEL_NAME, `/me ${BOT} Thank you so much @${username} for the raid of ${viewers}. aly1263Run`);
      }
  }
});

client.on("subgift", (channel, username, viewers, method) => {
  if (SETTINGS.ks == false) {
      client.say(CHANNEL_NAME, `/me ${BOT} @${username} thanks so much for gifting a sub to @${method}. aly1263Blink`);
      client.say(CHANNEL_NAME, `/me ${BOT} @${username} thanks so much for gifting a sub to @${method}. aly1263Blink`);
  }
});

client.on("cheer", (channel, username, viewers, method, userstate) => {
  if (SETTINGS.ks == false) {
      client.say(CHANNEL_NAME, `/me ${BOT} Thank you @${username} xqcL for the bits. aly1263Sheesh`);
  }
});

client.on("resub", (channel, username, viewers, method, months, month) => {
if (SETTINGS.ks == false) {
  client.say(CHANNEL_NAME, `/me ${BOT} Thanks for resubbing @${username}. aly1263Vibe`);
  client.say(CHANNEL_NAME, `/me ${BOT} Thanks for resubbing @${username}. aly1263Vibe`);
}
});

client.on("subscription", (channel, username, viewers, method) => {
  if (SETTINGS.ks == false) {
      client.say(CHANNEL_NAME, `/me ${BOT} Thanks for subbing @${username}. aly1263Vibe`);
      client.say(CHANNEL_NAME, `/me ${BOT} Thanks for subbing @${username}. aly1263Vibe`);
  }
});

client.on("hosting", async (channel, username, viewers, method, userstate) => {
  if (SETTINGS.ks == false) {
      client.say(CHANNEL_NAME, `/me ${BOT} Aly is now hosting ${username}. xqcEZ`);
      if ((await TWITCH_FUNCTIONS.isLive() == false)) {
          client.say(username, `Aly just hosted ${username}.`);
      }
      client.say(username, `KAPOW ALY RAID KAPOW`);
      await setTimeout(2 * 1000)
      client.say(username, `aly1263Raid ALY RAID aly1263Raid`);
      await setTimeout(3 * 1000)
      client.say(username, `KAPOW ALY RAID KAPOW`);
      await setTimeout(3 * 1000)
      client.say(username, `aly1263Raid ALY RAID aly1263Raid`);
  }
});

client.on("message", async (channel, userstate, message, self, viewers) => {
var messageArray = ([] = message.toLowerCase().split(" "));
  SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));
  const isMod = userstate["mod"];
  const twitchUserId = userstate["user-id"];
  const twitchUsername = userstate["username"];
  const isBroadcaster = 
  twitchUsername == CHANNEL_NAME.toLowerCase();
  const isAdmin =
  twitchUserId == BOT_ID;
  const msg = message.toLowerCase();
if (SETTINGS.ks == false) {
  if (msg == "!link" || msg == "!server" || msg == "!vip") {
    if (SETTINGS.currentMode == "!link.on") {
      client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Current Link -> ${SETTINGS.currentLink}`);
    } else {
      client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} There is not currently a link.`);
    }
  }
  if (isBroadcaster || isMod || isAdmin) {
    if (SETTINGS.currentMode == "!link.on") {
      if (SETTINGS.currentLink != null) {
        if (messageArray[0] == "!l" && messageArray[1] == null) {
          client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} Current Link -> ${SETTINGS.currentLink}`);
        }
        if (messageArray[0] == "!l" && messageArray[1] != null) {
          client.say(CHANNEL_NAME, `${BOT} ${messageArray[1]} Current Link -> ${SETTINGS.currentLink}`);
        }
      }
      if (SETTINGS.currentLink == null) {
        client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${BOT} There is not currently a link.`);
      }
    }
  }
}
});