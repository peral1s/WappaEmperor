const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔴 ここを追加：クライアント側でエラーが発生してもBotがクラッシュしないようにする
client.on('error', error => {
  console.error('Discordクライアントエラー:', error);
});

// 🔴 ここを追加：処理しきれなかった非同期エラーのクラッシュ防止
process.on('unhandledRejection', error => {
  console.error('未処理のPromise拒否:', error);
});

// ボットのログイン処理など...
client.login(process.env.DISCORD_TOKEN);
