import fs from "fs";
import fetch from "node-fetch";

const BOT_OAUTH = process.env.BOT_OAUTH; // bot oauth token for performing actions
const COOKIE = process.env.COOKIE; // <--- change this to your cookie

const BOT_NAME = process.env.BOT_NAME; // bot username
const CHANNEL_NAME = process.env.CHANNEL_NAME; // name of the channel for the bot to be in
const CHANNEL_ID = process.env.CHANNEL_ID; // id of channel for the bot to be in
const BOT_ID = process.env.BOT_ID;



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