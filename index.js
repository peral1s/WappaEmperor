// 環境変数チェック
if (!process.env.TOKEN) {
  console.error("❌ エラー: TOKEN が設定されていません！");
  process.exit(1);
}

const express = require('express');
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { connectDB, startVoiceSession, endVoiceSession } = require('./db/database');
const commands = require('./config/commands');
const handleMessage = require('./handlers/messageHandler');
const handleInteraction = require('./handlers/interactionHandler');

// --- 🌐 Webサーバー起動（Render対策） ---
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

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

  // Bot再起動時、すでにVCにいるメンバーのセッションも復元する
  for (const guild of client.guilds.cache.values()) {
    for (const state of guild.voiceStates.cache.values()) {
      if (!state.channelId || !state.member || state.member.user.bot) continue;
      try {
        await startVoiceSession(
          guild.id,
          state.id,
          state.member.displayName || state.member.user.username,
          state.channelId
        );
        console.log(`VCセッション確認: ${state.member.user.username} / ${state.channelId}`);
      } catch (error) {
        console.error('VCセッション復元エラー:', error);
      }
    }
  }
});

// イベント割り当て
client.on('messageCreate', (message) => {
  handleMessage(message, client).catch((error) => {
    console.error('メッセージ処理エラー:', error);
  });
});

// VC滞在時間の集計
client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    const guildId = newState.guild.id;
    const userId = member.id;
    const oldChannelId = oldState.channelId;
    const newChannelId = newState.channelId;

    if (oldChannelId === newChannelId) return;

    console.log(`VC状態変化: ${member.user.username} | ${oldChannelId || '未接続'} -> ${newChannelId || '退出'}`);

    if (oldChannelId) {
      await endVoiceSession(guildId, userId);
    }

    if (newChannelId) {
      await startVoiceSession(
        guildId,
        userId,
        member.displayName || member.user.username,
        newChannelId
      );
    }
  } catch (error) {
    console.error('VC滞在時間の集計エラー:', error);
  }
});

client.on('interactionCreate', (interaction) => {
  handleInteraction(interaction, client).catch((error) => {
    console.error('インタラクション処理エラー:', error);
  });
});

// --- Bot起動 ---
async function startBot() {
  try {
    // MongoDB接続を先に完了させる
    await connectDB();
    console.log('MongoDB接続完了');

    // DB接続後にDiscordへログイン
    await client.login(process.env.TOKEN);

  } catch (error) {
    console.error('Bot起動失敗:', error);
    process.exit(1);
  }
}

startBot();
