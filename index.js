// 環境変数チェック
if (!process.env.TOKEN) {
  console.error("❌ エラー: TOKEN が設定されていません！");
  process.exit(1);
}

const express = require('express');
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { connectDB } = require('./db/database');
const commands = require('./config/commands');
const handleMessage = require('./handlers/messageHandler');
const handleInteraction = require('./handlers/interactionHandler');

// --- 🌐 Webサーバー起動（Render対策） ---
const app = express();
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(process.env.PORT || 3000, () => {
  console.log('Web server started');
});

// Botクライアント初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// 🛡️ クラッシュ防止エラーハンドラ
client.on('error', (error) => {
  console.error('Discord Clientエラー:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('未処理のPromiseエラー:', error);
});

// Bot起動イベント
client.once('ready', async () => {
  await connectDB();
  console.log('Bot起動！');

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('スラッシュコマンド登録完了');
  } catch (err) {
    console.error('スラッシュコマンド登録失敗:', err);
  }
});

// イベント割り当て
client.on('messageCreate', (message) => handleMessage(message, client));
client.on('interactionCreate', (interaction) => handleInteraction(interaction, client));

// ログイン
client.login(process.env.TOKEN);
