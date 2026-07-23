require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const handleMessage = require('./handlers/messageHandler');
const handleInteraction = require('./handlers/interactionHandler');

// 1. Expressサーバー起動（Renderなどの常時稼働用）
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`🌐 サーバーがポート ${PORT} で起動したのだ`);
});

// 2. Discordクライアントの初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// エラーでBotがクラッシュしないための安全対策
client.on('error', error => {
  console.error('Discordクライアントエラー:', error);
});

process.on('unhandledRejection', error => {
  console.error('未処理のPromise拒否:', error);
});

// Bot起動時の処理
client.once('ready', () => {
  console.log(`✨ ログイン成功のだ: ${client.user.tag}`);
});

// メッセージ受信時の処理
client.on('messageCreate', async message => {
  await handleMessage(message, client);
});

// スラッシュコマンドなどのインタラクション処理
client.on('interactionCreate', async interaction => {
  await handleInteraction(interaction, client);
});

// ログイン
client.login(process.env.DISCORD_TOKEN);
