# **AlyBot**
***a bot for [aly1263](https://twitch.tv/aly1263)***

[//]: <> (TODO: Make a install guide.)

## **NPM**


### Building Bot

```bash
git clone https://github.com/Mr-Cheeezz/AlyBot.git
```

### Packages

```bash
sudo npm install dotenv fs node-fetch string-similarity tmi.js ws
```

### Running Bot

```bash
sudo npm install -g pm2 && sudo npm install nodemon -g
```

### Starting Bot

```bash
cd AlyBot && pm2 start app.js && cd ..
```

**OR**

```bash
cd AlyBot && nodemon app.js && cd ..
```

***

## **ENV**

**Create a file called `.env`** 

*(Put the following content in the `.env`)*

```javascript
ROBLOSEC = '[YOUR .ROBLOSECURITY COOKIE]' // change this to your roblox cookie

BOT_OAUTH = '[OAUTH OF ACCOUNT FOR BOT TO BE ON]' // bot oauth token for performing actions
BOT_NAME = '[LOGIN USERNAME OF BOT ACCOUNT]' // bot username
BOT_ID = '[UID OF BOT ACCOUNT TO BE ON]' // bot id

CHANNEL_NAME = '[NAME OF CHANNEL FOR BOT TO BE IN]' // name of the channel for the bot to be in
CHANNEL_ID = '[ID OF CHANNEL FOR BOT TO BE IN]' // id of channel for the bot to be in
```
