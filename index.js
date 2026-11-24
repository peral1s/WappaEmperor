// 環境変数チェック
if (!process.env.TOKEN) {
  console.error("❌ エラー: TOKEN が設定されていません！");
  process.exit(1);
}

const express = require('express');
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { connectDB, startVoiceSession, endVoiceSession, getMusicStatusName, getMusicStatusSong, getMusicStatusSongs, getLatestMusicStatusSong, removeMusicStatusSong, setMusicStatusSong, getMusicStatusTargetChannel } = require('./db/database');
const commands = require('./config/commands');
const handleMessage = require('./handlers/messageHandler');
const handleInteraction = require('./handlers/interactionHandler');

// Jockie Music BotのユーザーID（ユーザー名では判定しない）
const JOCKIE_MUSIC_BOT_IDS = new Set([
  '412347780841865216',
  '412347553141751808',
  '412347257233604609'
]);

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

// 3体のJockieのうち、最後に曲を更新したbotの曲だけを表示する
async function refreshGuildMusicStatus(guild, extraChannelIds = []) {
  const records = await getMusicStatusSongs(guild.id);
  const activeRecords = records.filter((record) => {
    const voiceState = guild.voiceStates.cache.get(record.botId);
    return voiceState?.channelId === record.channelId;
  });
  activeRecords.sort(
    (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
  );

  const latest = activeRecords[0] || null;
  const manualChannelId = await getMusicStatusTargetChannel(guild.id);
  const manualName = await getMusicStatusName(guild.id);
  const channelIds = new Set([
    ...records.map((record) => record.channelId),
    ...extraChannelIds.filter(Boolean),
    manualChannelId
  ].filter(Boolean));

  for (const channelId of channelIds) {
    const channel = guild.channels.cache.get(channelId);
    if (!channel) continue;

    const hasHumans = channel.members?.some((member) => !member.user.bot) || false;
    const left = channelId === manualChannelId && hasHumans ? manualName : '';
    const right = latest?.channelId === channelId ? latest.song : '';
    const status = [left, right].filter(Boolean).join('┊︎').slice(0, 500);

    await client.rest.put(`/channels/${channelId}/voice-status`, {
      body: { status: status || null }
    });
  }

  return latest;
}

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

// Jockie Music 3体の再生通知を記録し、全体で最新の1曲だけを表示
client.on('messageCreate', async (message) => {
  try {
    if (!message.guild || !JOCKIE_MUSIC_BOT_IDS.has(message.author.id)) return;

    const embed = message.embeds.find((item) =>
      item.author?.name?.toLowerCase().includes('started playing') &&
      item.fields?.some((field) => field.name?.trim().toLowerCase() === 'playing')
    );
    if (!embed) return;

    const playingField = embed.fields.find(
      (field) => field.name?.trim().toLowerCase() === 'playing'
    );
    if (!playingField?.value) return;

    const rawPlayingText = playingField.value.trim();
    const labelStart = rawPlayingText.indexOf('[');
    const labelEnd = rawPlayingText.lastIndexOf('](');
    const playingLabel =
      labelStart === 0 && labelEnd > labelStart
        ? rawPlayingText.slice(labelStart + 1, labelEnd)
        : rawPlayingText;

    const playingText = playingLabel
      .replaceAll('**', '')
      .replaceAll('*', '')
      .replaceAll('\n', ' ')
      .replaceAll('\r', ' ')
      .trim()
      .split(' ')
      .filter(Boolean)
      .join(' ');

    if (!playingText.toLowerCase().includes(' by ')) {
      console.log('JockieのPlaying欄は曲情報形式ではないためスキップ:', playingText);
      return;
    }

    const jockieVoiceState = message.guild.voiceStates.cache.get(message.author.id);
    const jockieChannelId = jockieVoiceState?.channelId;
    if (!jockieChannelId) return;

    const previousRecords = await getMusicStatusSongs(message.guild.id);
    const previousRecord = previousRecords.find(
      (record) => record.botId === message.author.id
    );

    await setMusicStatusSong(
      message.guild.id,
      message.author.id,
      jockieChannelId,
      playingText
    );

    await refreshGuildMusicStatus(
      message.guild,
      [previousRecord?.channelId, jockieChannelId]
    );

    console.log(`Jockie最新曲を更新: ${playingText} | bot: ${message.author.id} | VC: ${jockieChannelId}`);
  } catch (error) {
    console.error('Jockie曲情報・VCステータス更新エラー:', error);
  }
});

// VC滞在時間の集計
client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    const member = newState.member || oldState.member;
    if (!member) return;

    // Jockieが退出・移動したら、そのbotの曲を候補から外して次に新しい曲へ切り替える
    const isJockieMusic = JOCKIE_MUSIC_BOT_IDS.has(member.id);
    const leftVoiceChannel =
      oldState.channelId && oldState.channelId !== newState.channelId;

    if (isJockieMusic && leftVoiceChannel) {
      try {
        const records = await getMusicStatusSongs(oldState.guild.id);
        const previousRecord = records.find((record) => record.botId === member.id);

        if (newState.channelId && previousRecord) {
          // VC移動なら再生中の曲を新しいVCへ引き継ぐ。完全退出なら候補から外す
          await setMusicStatusSong(
            oldState.guild.id,
            member.id,
            newState.channelId,
            previousRecord.song
          );
        } else {
          await removeMusicStatusSong(oldState.guild.id, member.id);
        }

        await refreshGuildMusicStatus(oldState.guild, [oldState.channelId, newState.channelId]);
        console.log(`Jockie退出・移動: 最新曲候補を再計算 | bot: ${member.id}`);
      } catch (error) {
        console.error('Jockie退出時の曲切り替えに失敗:', error);
      }
    }

    // 人間が最後の1人としてVCを退出したら、/status由来の左側だけを消す
    if (!member.user.bot && oldState.channelId && oldState.channelId !== newState.channelId) {
      const oldChannel = oldState.guild.channels.cache.get(oldState.channelId);
      const hasHumanMembers = oldChannel
        ? oldChannel.members.some((voiceMember) => !voiceMember.user.bot)
        : oldState.guild.voiceStates.cache.some(
            (voiceState) =>
              voiceState.channelId === oldState.channelId &&
              voiceState.member &&
              !voiceState.member.user.bot
          );

      if (!hasHumanMembers) {
        try {
          const statusChannelId = await getMusicStatusTargetChannel(oldState.guild.id);
          if (oldState.channelId === statusChannelId) {
            await refreshGuildMusicStatus(oldState.guild, [oldState.channelId]);
            console.log(`VC無人: 左側の手動ステータスを削除: ${oldState.channelId}`);
          }
        } catch (error) {
          console.error('左側ステータスの削除に失敗:', error);
        }
      }
    }

    // ここから下のVC滞在時間集計は従来どおり人間メンバーのみ対象
    if (member.user.bot) return;

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
