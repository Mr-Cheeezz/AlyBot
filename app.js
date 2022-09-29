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
import * as RESPONSES from "./Functions/responses.js";

const alyId = 72121088 // roblox id for getting game and playtime

import { join } from "path";
import { setEngine, verify } from "crypto";
import { get } from "http";
import { uptime } from "process";
import { match } from "assert";
import { platform } from "os";
import { time } from "console";
import { channel } from "diagnostics_channel";
import { resourceLimits } from "worker_threads";

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
  client.action(CHANNEL_NAME, `[🤖]: Joined channel ${CHANNEL_NAME}. aly1263Minion`)
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
              client.say(CHANNEL_NAME, `/me [🤖]: ${timerCommands[key]}`);
            }
          }
        }
    }
}, JOIN_TIMER);

setInterval(async () => {
    SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));

    const robloxGame = await ROBLOX_FUNCTIONS.getPresence(alyId).then((r)=>{return r.lastLocation});
    const onlineStatus = await ROBLOX_FUNCTIONS.getLastOnline(alyId).then((r)=>{return r.diffTimeMinutes});

    if (SETTINGS.timers == true && SETTINGS.ks == false && (await TWITCH_FUNCTIONS.isLive()) == true) {

      if (onlineStatus > 30) {
        client.say(CHANNEL_NAME, `/me [🎮]: Aly is currently offline.`);
      }
      console.log("game")

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
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Killswitch is already on.`
        );
      } else if (SETTINGS.ks == false) {
        SETTINGS.ks = true;
        fs.writeFileSync("./SETTINGS.json", JSON.stringify(SETTINGS));
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: @${CHANNEL_NAME}, Killswitch is on, the bot will not be actively moderating.`
        );
      }
    } else if (lowerMessage == "!ks.off") {
      if (SETTINGS.ks == false) {
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Killswitch is already off.`
        );
      } else if (SETTINGS.ks == true) {
        SETTINGS.ks = false;
        fs.writeFileSync("./SETTINGS.json", JSON.stringify(SETTINGS));
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: @${CHANNEL_NAME}, Killswitch is off, the bot will be actively moderating.`
        );
      }
    }
}

async function timerHandler(client, lowerMessage, twitchUsername, userstate) {
    if (lowerMessage == "!timers.on") {
      if (SETTINGS.timers == true) {
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Timers are already on.`
        );
      } else if (SETTINGS.timers == false) {
        SETTINGS.timers = true;
        fs.writeFileSync("./SETTINGS.json", JSON.stringify(SETTINGS));
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: @${CHANNEL_NAME}, Timers are now on.`
        );
      }
    } else if (lowerMessage == "!timers.off") {
      if (SETTINGS.timers == false) {
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Timers are already off.`
        );
      } else if (SETTINGS.timers == true) {
        SETTINGS.timers = false;
        fs.writeFileSync("./SETTINGS.json", JSON.stringify(SETTINGS));
        return client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: @${CHANNEL_NAME}, Timers are now off.`
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
            `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Please specify a user to add.`
          );
        }
    
        const isValidUser = await ROBLOX_FUNCTIONS.isValidRobloxUser(
          messageArray[1]
        );
    
        if (!isValidUser.isValidUser)
          return client.raw(
            `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Not a valid username.`
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
              `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: ${messageArray[1]} is already added.`
            );
    
          return client.raw(
            `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Already sent ${messageArray[1]} a friend request.`
          );
        } else if (friend != "success") {
          return client.raw(
            `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: [Error: Unknown Error Ocurred]`
          );
        }
    
        client.raw(
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Sent a friend request to ${messageArray[1]}.`
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
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: ${message} is not a valid mode. Valid Modes: !join.on | !link.on | !1v1.on`
      );
    if (SETTINGS.currentMode == messageArray[0])
      return client.raw(
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: ${messageArray[0]} mode is already on.`
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
      `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: @${CHANNEL_NAME}, ${messageArray[0]} mode is now on.`
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
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Please specify an amount of channel points to convert to farming time. If you want you can also specify what tier you want to check, for example !cptotime 1000 tier1`
      );
    } else if (isNaN(messageArray[1]) == true) {
      return client.raw(
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Number of channel points must be a number.`
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
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: If ${sub}, it would take ${
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
          `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Since ${sub}, it would take ${
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
    if (self) return;
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
          if (message.toLowerCase() == "!gamelink") {
            if (locationId == '8343259840') {
              return client.raw(
                `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Current game link -> roblox.com/games/4588604953`)};
            if (locationId == '6839171747') {
              return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Current game link -> roblox.com/games/6516141723`)};
      
            // if (SETTINGS.currentMode == "!link.on") {
            //   if (SETTINGS.currentLink != null) {
            //     return client.raw(
            //       `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Current game link -> ${SETTINGS.currentLink}`
            //     );
            //   }
            // }
            if (onlineStatus > 30) {
              return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is currenly offline so there is no game link.`
              );
            }
            if (robloxGame != 'Website') {
              client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Current game link -> roblox.com/games/${locationId}`
              );
              return
            }
            return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is currently switching games.`);
          }
          if (message.toLowerCase() == "!playtime" || message.toLowerCase() == "!gametime") {
            if (onlineStatus > 30) {
              return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is not playing anything right now.`);
            }
      
            console.log(playtime)
            if (robloxGame != 'Website') {
              client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly has been playing ${robloxGame} for ${playtime}.`);
              return
            }
            
            return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is currently switching games.`);
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
            //             `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is not playing anything right now.`);
            //         }
            //         console.log(robloxGame)
            //         if (robloxGame != 'Website') {
            //          client.raw(
            //           `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is currently playing ${robloxGame}.`); 
            //         return
            //         }
                
            //         return client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is currently switching games.`);            
            //   }
            // }
            if (!linkAllowed) {
              if (message.toLowerCase().includes("***")) {
                  client.say(
                    CHANNEL_NAME,
                    `/me [🤖]: @${twitchUsername}, Do NOT send links.`
                );
              }
            }
          }
      }
    if (message.toLowerCase() == "!namecolor") {
      client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Your username hex code is ${hexNameColor}.`);
    }
    if (message.toLowerCase() == "!subage") {
      if (!isSubscriber) {
          client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: You are not currenty a sub.`);
      }
      if (isSubscriber) {
          client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: You are currently subscribed to ${CHANNEL_NAME} for ${subscriberMonths} months.`);
      }
    }
    if (
      message.toLowerCase() == "!commands" ||
      message.toLowerCase() == "!cmds" ||
      message.toLowerCase() == "!coms"
      ) {
          client.raw(
            `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Click here for commands: cmds.mrcheeezz.com`
          );
      }
    if (message.toLowerCase() == "!github") {
      client.say(CHANNEL_NAME, `[🤖]:@${twitchUsername} The bots github -> github.com/mr-cheeezz/alybot`);
    }
    if (message.toLowerCase() == "!tf") {
      client.say(
        CHANNEL_NAME,
        `/me [🤖]: Click here to get Jebaited -> tf.mrcheeezz.com`
      );
    }
    var messageArray = ([] = message.toLowerCase().split(" "));
    if (messageArray[0] == "!join") {
      if (messageArray[1] == null) {
        client.say(CHANNEL_NAME, `/me [🤖]: ${twitchUsername} -> Click here to play : roblox.com/users/${alyId} (${CHANNEL_NAME})`);
      } else
      client.say(CHANNEL_NAME, `/me [🤖]: ${messageArray[1]} -> Click here to play : roblox.com/users/${alyId} (${CHANNEL_NAME})`);
     }
     if (message.toLowerCase() == "!rstats" || message.toLowerCase() == "!robloxstatus") {
      if (onlineStatus > 30) {
        client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is currently offline, she has been offline for ${playtime}`);
      } else if (robloxGame == 'Website') {
        client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is currently on the website.`);
      } else if (robloxGame != 'Website') {
        client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Aly is currently in game, she is playing ${robloxGame}.`);
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
              
              client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: The bot is currently in ${currentMode} mode.`);
              return
          }
          if (message.toLowerCase() == "!validmodes") {
            client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Valid Modes: !join.on | !link.on | !1v1.on`);
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

client.on("raided", (channel, username, viewers, method) => { 
  if (SETTINGS.ks == false) {
      if (viewers >= 5) {
          client.say(CHANNEL_NAME, `/me [🤖]: Thank you so much @${username} for the raid of ${viewers}. aly1263Run`);
      }
  }
});

client.on("subgift", (channel, username, viewers, method) => {
  if (SETTINGS.ks == false) {
      client.say(CHANNEL_NAME, `/me [🤖]: @${username} thanks so much for gifting a sub to @${method}. aly1263Blink`);
      client.say(CHANNEL_NAME, `/me [🤖]: @${username} thanks so much for gifting a sub to @${method}. aly1263Blink`);
  }
});

client.on("cheer", (channel, username, viewers, method, userstate) => {
  if (SETTINGS.ks == false) {
      client.say(CHANNEL_NAME, `/me [🤖]: Thank you @${username} xqcL for the bits. aly1263Sheesh`);
  }
});

client.on("resub", (channel, username, viewers, method, months, month) => {
if (SETTINGS.ks == false) {
  client.say(CHANNEL_NAME, `/me [🤖]: Thanks for resubbing @${username}. aly1263Vibe`);
  client.say(CHANNEL_NAME, `/me [🤖]: Thanks for resubbing @${username}. aly1263Vibe`);
}
});

client.on("subscription", (channel, username, viewers, method) => {
  if (SETTINGS.ks == false) {
      client.say(CHANNEL_NAME, `/me [🤖]: Thanks for subbing @${username}. aly1263Vibe`);
      client.say(CHANNEL_NAME, `/me [🤖]: Thanks for subbing @${username}. aly1263Vibe`);
  }
});

client.on("hosting", async (channel, username, viewers, method, userstate) => {
  if (SETTINGS.ks == false) {
      client.say(CHANNEL_NAME, `/me [🤖]: Aly is now hosting ${username}. xqcEZ`);
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
      client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Current Link -> ${SETTINGS.currentLink}`);
    } else {
      client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: There is not currently a link.`);
    }
  }
  if (isBroadcaster || isMod || isAdmin) {
    if (SETTINGS.currentMode == "!link.on") {
      if (SETTINGS.currentLink != null) {
        if (messageArray[0] == "!l" && messageArray[1] == null) {
          client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Current Link -> ${SETTINGS.currentLink}`);
        }
        if (messageArray[0] == "!l" && messageArray[1] != null) {
          client.say(CHANNEL_NAME, `[🤖]: ${messageArray[1]} Current Link -> ${SETTINGS.currentLink}`);
        }
      }
      if (SETTINGS.currentLink == null) {
        client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: There is not currently a link.`);
      }
    }
  }
}
});