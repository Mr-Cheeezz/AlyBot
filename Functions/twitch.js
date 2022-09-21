import fs from "fs";
import fetch from "node-fetch";

const COOKIE = process.env.COOKIE; // <--- change this to your cookie

const BOT_NAME = process.env.BOT_NAME; // bot username
const BOT_OAUTH = process.env.BOT_OAUTH; // bot oauth token for performing actions
const BOT_ID = process.env.BOT_ID;

const CLIENT_ID = process.env.CLIENT_ID;

const ALY_TOKEN = process.env.ALY_TOKEN;

const CHANNEL_NAME = process.env.CHANNEL_NAME; // name of the channel for the bot to be in
const CHANNEL_ID = process.env.CHANNEL_ID; // id of channel for the bot to be in



import * as ROBLOX_FUNCTIONS from "./roblox.js";

export const getChatroomStatus = async () => {
  const r = await fetch("https://gql.twitch.tv/gql#origin=twilight", {
    headers: {
      "Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
      Authorization: `OAuth ${BOT_OAUTH}`,
    },
    body: `[{\"operationName\":\"ChatRoomState\",\"variables\":{\"login\":\"${BOT_NAME}\"},\"extensions\":{\"persistedQuery\":{\"version\":1,\"sha256Hash\":\"04cc4f104a120ea0d9f9d69be8791233f2188adf944406783f0c3a3e71aff8d2\"}}}]`,
    method: "POST",
  });
  const json = r.json();
  const states = json.then((json) => {
    return json.channel;
  });
};

export const isLive = async () => {
    const r = await fetch("https://gql.twitch.tv/gql", {
      headers: {
        authorization: `OAuth ${BOT_OAUTH}`,
        "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
      },
      body: `[{"operationName":"VideoPlayerStreamInfoOverlayChannel","variables":{"channel":"aly1263"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"a5f2e34d626a9f4f5c0204f910bab2194948a9502089be558bb6e779a9e1b3d2"}}}]`,
      method: "POST",
    });
  
    const json = await r.json().then((d) => {
      return d[0].data.user.stream;
    });
    const isLive = (() => {
      if (json == null) {
        return false;
      } else if (json != null) {
        return true;
      }
    })();
    return isLive;
};

export const getSubStatus = async (userId) => {
  const r = await fetch(
    `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${CHANNEL_ID}&user_id=${userId}`,
    {
      headers: {
        Authorization: "Bearer " + ALY_TOKEN,
        "Client-Id": CLIENT_ID,
      },
    }
  );

  const json = await r.json();

  return json;
};

export async function onMultiplayerAdStart() {
  var colours = ["BLUE", "PURPLE", "GREEN"];
  var randomColour = colours[Math.floor(Math.random() * colours.length)];

  fetch("https://gql.twitch.tv/gql", {
    headers: {
      authorization: `OAuth ${BOT_OAUTH}`,
      "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
    },
    body: `[{"operationName":"SendAnnouncementMessage","variables":{"input":{"channelID":"${CHANNEL_ID}","message":"VOTE IN THE MULTIPLAYER AD PogU EZY","color":"${randomColour}"}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"f9e37b572ceaca1475d8d50805ae64d6eb388faf758556b2719f44d64e5ba791"}}}]`,
    method: "POST",
  });
};

let POLLDATA = JSON.parse(fs.readFileSync("./POLLDATA.json"));

export const getLatestPollData = async () => {
  const r = await fetch("https://gql.twitch.tv/gql#origin=twilight", {
    headers: {
      "Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
      Authorization: "OAuth " + BOT_OAUTH,
    },
    body: `[{\"operationName\":\"AdminPollsPage\",\"variables\":{\"login\":\"${CHANNEL_NAME}\"},\"extensions\":{\"persistedQuery\":{\"version\":1,\"sha256Hash\":\"58b2740296aad07f9b75fdf069f61a79b305f4d6b93c3764be533d76532b37fa\"}}}]`,
    method: "POST",
  });

  let json = await r.json();

  json = json[0].data.channel.latestPoll;

  const dataBreakdown = async (choiceId) => {
    let r = await fetch(`https://gql.twitch.tv/gql`, {
      headers: {
        "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
        authorization: "OAuth " + BOT_OAUTH,
      },
      body: `[{\"operationName\":\"ChoiceBreakdown\",\"variables\":{\"login\":\"tibb12\",\"choiceID\":\"${choiceId}\",\"sort\":\"CHANNEL_POINTS\",\"id\":\"123\"},\"extensions\":{\"persistedQuery\":{\"version\":1,\"sha256Hash\":\"7451688887b68798527dbaa222b4408e456adf5283063bfae8f02db2289deee0\"}}}]`,
      method: "POST",
    });

    let json = await r.json();

    json = json[0].data.channel;

    return json;
  };

  const choices = json.choices;
  const archives = json.status;
  const title = json.title;
  const id = json.id;
  const duration = json.durationSeconds;
  const startedAt = json.startedAt;
  const endedAt = json.endedAt;
  const totalCp = json.tokens.communityPoints;
  const totalBits = json.tokens.bits;
  const totalVoters = json.totalVoters;
  const totalVotes = json.votes.total;

  const settings = json.settings;

  const bitVoteEnabled = settings.bitsVotes.isEnabled;

  const bitVoteCost = settings.bitsVotes.cost;

  const cpVoteEnabled = settings.communityPointsVotes.isEnabled;
  const cpVoteCost = settings.communityPointsVotes.cost;

  const multiChoiceEnabled = settings.multichoice.isEnabled;

  const dataArray = {};

  dataArray["id"] = id;
  dataArray["status"] = archives;
  dataArray["totalCp"] = totalCp;
  dataArray["duration"] = duration;
  dataArray["startedAt"] = startedAt;
  dataArray["endedAt"] = endedAt;
  dataArray["title"] = title;
  dataArray["totalBits"] = totalBits;
  dataArray["totalVoters"] = totalVoters;
  dataArray["totalVotes"] = totalVotes;
  dataArray["boughtVotes"] = totalVotes - totalVoters;
  dataArray["cpVote"] = cpVoteCost;
  dataArray["bitVote"] = bitVoteCost;
  dataArray["cpVoteEnabled"] = cpVoteEnabled;
  dataArray["bitVoteEnabled"] = bitVoteEnabled;
  dataArray["choices"] = choices;
  dataArray["multichoice"] = multiChoiceEnabled;
  dataArray["userNodes"] = [];
  // console.log(choices)
  


  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i];
    const choiceId = choice.id;

    const data = await dataBreakdown(choiceId);
    
    if(data.latestPoll.choice.voters == null) return 'error'
    
    const voters = data.latestPoll.choice.voters.nodes;

    if (voters.length != 0) {
      dataArray["userNodes"].push(voters[0].node);
    }
  }
  POLLDATA[id] = dataArray;
  fs.writeFileSync("./POLLDATA.json", JSON.stringify(POLLDATA, null, 1));
  POLLDATA = JSON.parse(fs.readFileSync("./POLLDATA.json"));
  return dataArray;
};