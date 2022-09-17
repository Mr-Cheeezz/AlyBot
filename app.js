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
const BOT_ID = process.env.BOT_ID;

const CHANNEL_NAME = process.env.CHANNEL_NAME;
const CHANNEL_ID = process.env.CHANNEL_ID;

let SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));
let STREAMS = JSON.parse(fs.readFileSync("./STREAMS.json"));


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
    // client.say(CHANNEL_NAME, `/me [🤖]: Joined channel ${CHANNEL_NAME}. aly1263Minion`)
});

setInterval(async () => {
    SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));

    if (SETTINGS.timers == true && SETTINGS.ks == false && (await TWITCH_FUNCTIONS.isLive()) == true) {
        var currentMode = SETTINGS.currentMode.replace(".on", "");
        currentMode = currentMode.replace("!", "");
    
        var timerCommands = SETTINGS.timer;
    
        for (const key in timerCommands) {
          if (key == currentMode) {
            client.say(CHANNEL_NAME, `/me [🤖]: ${timerCommands[key]}`);
          }
        }
    }
}, 9 * 30 * 1000);

setInterval(async () => {
    SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));

    const robloxGame = await ROBLOX_FUNCTIONS.getPresence(alyId).then((r)=>{return r.lastLocation})

    if (SETTINGS.timers == true && SETTINGS.ks == false && (await TWITCH_FUNCTIONS.isLive()) == true) {
        client.say(CHANNEL_NAME, `/me [🤖]: Aly is currently playing ${robloxGame}`)
    }
}, 9 * 60 * 1000);

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
}, 60 * 7 * 1000);

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
    if (lowerMessage == "!timer.on") {
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
    } else if (lowerMessage == "!timer.off") {
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
        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: ${message} is not a valid mode. Valid Modes: !join.on, !link.on !1v1.on, !ticket.on, !gamble.on`
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
        `tibb12Wave`,
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
        await setTimeout(Math.floor(Math.random() * 10) * 1000)
        client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :${randomGreeting}`);
    }
}


client.on("message", async (channel, userstate, message, self, viewers) => {
    SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));
    const isFirstMessage = userstate["first-msg"];
    const twitchUsername = userstate["username"];
    const isSubscriber = userstate["subscriber"];
    const subscriberMonths = (() => {
        if (isSubscriber) {
          return userstate["badge-info"].subscriber;
        } else {
          return null;
        }
      })();
    const isBroadcaster = "aly1263"
    const twitchUserId = userstate["user-id"];
    const hexNameColor = userstate.color;
    const lowerMessage = message.toLowerCase();
    const isVip = (() => {
        if (userstate["badges"] && userstate["badges"].vip == 1) {
          return true;
        } else {
          return false;
        }
      })();

      const isMod = userstate["mod"];

      const robloxGame = await ROBLOX_FUNCTIONS.getPresence(alyId).then((r)=>{return r.lastLocation})
      const locationId = await ROBLOX_FUNCTIONS.getPresence(alyId).then((r)=>{return r.placeId})
      const onlineStatus = await ROBLOX_FUNCTIONS.getLastOnline(alyId).then((r)=>{return r.diffTimeMinutes})

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
        if (!isMod || !isBroadcaster) {
            if (
                message.toLowerCase().includes("what game is this") ||
                message.toLowerCase().includes("what game r u") ||
                message.toLowerCase().includes("what game is that") ||
                message.toLowerCase().includes("game called") ||
                message.toLowerCase().includes("game name") ||
                message.toLowerCase().includes("what is this game")
            ) {
        
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
        }
  
      if (message.includes("***")) {
        if (!isMod || !isVip || !isBroadcaster) {
            client.say(CHANNEL_NAME, `/me [🤖]: @${twitchUsername}, Do NOT send links.`);
        }
      }

      if (!isMod || !isVip || !isBroadcaster) {
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
            client.say(CHANNEL_NAME, `/me !add @${twitchUsername}`);
        }
      }

      if (!isMod) {
        if (
            message.toLowerCase().includes("what time is it")
        ) {
            client.say(CHANNEL_NAME, `/me !time @${twitchUsername}`);
        }
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
          client.say(CHANNEL_NAME, `/me !song @${twitchUsername}`)
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
    }
    if (SETTINGS.ks == false) {
        newUserHandler(client, message, twitchUsername, isFirstMessage, userstate);
    }
    if (isBroadcaster || isMod || twitchUserId == BOT_ID) {
        ksHandler(client, lowerMessage, twitchUsername, userstate);
        updateMode(client, message, twitchUsername, userstate);
        timerHandler(client, lowerMessage, twitchUsername, userstate);
        customModFunctions(client, message, twitchUsername, userstate);
        newLinkHandler(client, message, twitchUsername, userstate);
    }
    if (isMod || isBroadcaster || twitchUserId == BOT_ID) {
        if (SETTINGS.ks == false) {
            if (message.toLowerCase() == "!currentmode") {
                SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));
                var currentMode = SETTINGS.currentMode.replace(".on", "");
                currentMode = currentMode.replace("!", "");

                if (SETTINGS.currentMode == "!join.on") {
                    return client.raw(
                        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: The bot is currently in join mode.`
                    );
                }
                if (SETTINGS.currentMode == "!link.on") {
                    return client.raw(
                        `@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: The bot is currently in link mode.`
                    );
                }
                client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: The bot is currently in ${SETTINGS.currentMode} mode.`);
                return
            }
        }
    }
});

client.on("raided", (channel, username, viewers, method) => { 
    if (SETTINGS.ks == false) {
        if (viewers > 4) {
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
    var Bits = userstate.bits
    if (SETTINGS.ks == false) {
        client.say(CHANNEL_NAME, `/me [🤖]: Thank you @${username} xqcL for the ${Bits} bits. aly1263Sheesh`);
    }
});

client.on("resub", (channel, username, viewers, method, months) => {
    if (SETTINGS.ks == false) {
        client.say(CHANNEL_NAME, `/me [🤖]: Thanks for resubbing for ${months} @${username}. aly1263Vibe`);
        client.say(CHANNEL_NAME, `/me [🤖]: Thanks for resubbing for ${months} @${username}. aly1263Vibe`);
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
    SETTINGS = JSON.parse(fs.readFileSync("./SETTINGS.json"));
    if (message.toLowerCase() == "!link") {
        if (SETTINGS.currentMode == "!link.on") {
            client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: Current Link -> ${SETTINGS.currentLink}`);
        } else {
            client.raw(`@client-nonce=${userstate['client-nonce']};reply-parent-msg-id=${userstate['id']} PRIVMSG #${CHANNEL_NAME} :[🤖]: [Error: There is not currently a link]`);
        }
    }
});
async function liveUpHandler() {
    // TO DO = first person to go to stream gets free channel points
    client.say(
      `${CHANNEL_NAME}`,
      `${CHANNEL_NAME}, is now live. Logging will start ${
        WAIT_REGISTER / (60 * 1000)
      } minutes after this point to avoid false logging.`
    );
    await setTimeout(WAIT_REGISTER);
    if (await TWITCH_FUNCTIONS.isLive()) {
      client.say(
        `${CHANNEL_NAME}`,
        `Logging now starts. There has been ${streamNumber} number of streams since logging started and this stream will be ${
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
        `${CHANNEL_NAME}, is now offline. Logging has stopped.`
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
        } else if (type == "viewcount") {
          STREAMS[streamNumber]["averageViewersPer30Seconds"] =
            pubMessage.viewers;
          const sum = 0;
          for (const key in STREAMS[streamNumber]["averageViewersPer30Seconds"]) {
            sum += STREAMS[key];
          }
          STREAMS[streamNumber]["averageviewers"] =
            sum / Object.keys(STREAMS).length;
          fs.writeFileSync("./STREAMS.json", JSON.stringify(STREAMS));
        } else if (type == "AD_POLL_CREATE") {
          TWITCH_FUNCTIONS.onMultiplayerAdStart();
        } else if (type == "AD_POLL_COMPLETE") {
          var adData = pubMessage.data.poll;
          TWITCH_FUNCTIONS.onMultiplayerAdEnd(adData);
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
              `An ad has been ran, subscribe with prime for free and enjoy watching with 0 ads all month for free, !prime for more info EZY PogU .`
            );
          }
          
        } else if (pubTopic == `ads-manager.${CHANNEL_ID}`) {
            if (SETTINGS.ks == false) {
              client.say(
                CHANNEL_NAME,
                `An ad has been ran, subscribe with prime for free and enjoy watching with 0 ads all month for free, !prime for more info EZY PogU .`
              );
            }
        } else if (pubTopic == `hype-train-events-v1.${CHANNEL_ID}`) {
          if (SETTINGS.ks == false) {
            client.say(
              CHANNEL_NAME,
              `A HYPE TRAIN PagMan [test message]`
            )
          }
        } else if (pubTopic == `community-moments-channel-v1.${CHANNEL_ID}`) {
          if (SETTINGS.ks == false) {
            client.say(
              CHANNEL_NAME,
              `A new moment tibb12Tabbman everyone claim it while you can tibb12Pog .`
            )
          }
        }
    });
};

var runAuth = function () {
    requestListen(
      [
        // `activity-feed-alerts-v2.${CHANNEL_ID}`,
        `ads.${CHANNEL_ID}`,
        `ads-manager.${CHANNEL_ID}`,
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
        `hype-train-events-v1.${CHANNEL_ID}`,
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