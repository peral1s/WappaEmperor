// 環境変数チェック
if (!process.env.TOKEN) {
  console.error("❌ エラー: TOKEN が設定されていません！");
  process.exit(1);
}

const express = require('express');
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { connectDB, startVoiceSession, endVoiceSession, getMusicStatusName, getMusicStatusSong, removeMusicStatusSong, setMusicStatusSong, getMusicStatusTargetChannel } = require('./db/database');
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

// Jockie Musicの再生通知から曲情報を読み取り、VCステータスを更新
client.on('messageCreate', async (message) => {
  try {
    if (!message.guild || !JOCKIE_MUSIC_BOT_IDS.has(message.author.id)) return;

    // Jockieの「Started playing」Embedだけを対象にする
    const embed = message.embeds.find((item) =>
      item.author?.name?.toLowerCase().includes('started playing') &&
      item.fields?.some((field) => field.name?.trim().toLowerCase() === 'playing')
    );
    if (!embed) return;

    const playingField = embed.fields.find(
      (field) => field.name?.trim().toLowerCase() === 'playing'
    );
    if (!playingField?.value) return;

    // DiscordのMarkdownリンクから、リンク先URLではなく表示文字列を取り出す
    // 正規表現を使わず、Markdownの [表示文字列](URL) を処理する
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

    const byIndex = playingText.toLowerCase().lastIndexOf(' by ');
    if (byIndex <= 0) {
      console.log('JockieのPlaying欄は曲情報形式ではないためスキップ:', playingText);
      return;
    }

    const title = playingText.slice(0, byIndex).trim();
    const artist = playingText.slice(byIndex + 4).trim();

    // 曲情報の出所としてJockieの参加VCを記録
    const jockieVoiceState = message.guild.voiceStates.cache.get(message.author.id);
    const jockieChannelId = jockieVoiceState?.channelId;
    if (!jockieChannelId) {
      console.log('Jockieの参加VCを特定できません:', message.author.tag);
      return;
    }

    // 最新曲を保存。曲情報の表示先はJockie自身が参加しているVC
    await setMusicStatusSong(message.guild.id, jockieChannelId, playingText);

    // 左側の名前用VCとJockieのVCが同じ場合だけ、同じステータス内に左右を並べる
    const statusChannelId = await getMusicStatusTargetChannel(message.guild.id);
    const statusName = await getMusicStatusName(message.guild.id);
    const statusChannel = message.guild.channels.cache.get(statusChannelId);
    const hasHumanMembers = statusChannel?.members?.some((member) => !member.user.bot) || false;
    const status = (statusChannelId === jockieChannelId && hasHumanMembers
      ? [statusName, playingText]
      : [playingText])
      .filter(Boolean)
      .join('┊︎')
      .slice(0, 500);

    const targetVoiceChannel = message.guild.channels.cache.get(jockieChannelId);
    if (!targetVoiceChannel) {
      console.log('Jockieの参加VCがサーバー内に見つかりません:', jockieChannelId);
      return;
    }

    await client.rest.put(`/channels/${jockieChannelId}/voice-status`, {
      body: { status }
    });
    console.log(
      `Jockie側VCステータス更新成功: ${status} | チャンネル: ${targetVoiceChannel.name} (${jockieChannelId})`
    );
  } catch (error) {
    console.error('Jockie曲情報・VCステータス更新エラー:', error);
  }
});

// VC滞在時間の集計
client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    const member = newState.member || oldState.member;
    if (!member) return;

    // Jockie MusicがVCから退出、または別のVCへ移動したら元のVCステータスを消す
    const isJockieMusic = JOCKIE_MUSIC_BOT_IDS.has(member.id);
    const leftVoiceChannel =
      oldState.channelId && oldState.channelId !== newState.channelId;

    if (isJockieMusic && leftVoiceChannel) {
      try {
        const statusChannelId = await getMusicStatusTargetChannel(oldState.guild.id);
        await removeMusicStatusSong(oldState.guild.id, oldState.channelId);

        if (oldState.channelId === statusChannelId) {
          // 同じVCなら曲情報を削除。人が残っている場合だけ左側を維持
          const oldChannel = oldState.guild.channels.cache.get(oldState.channelId);
          const hasHumanMembers = oldChannel?.members?.some((voiceMember) => !voiceMember.user.bot) || false;
          const statusName = hasHumanMembers
            ? await getMusicStatusName(oldState.guild.id)
            : '';
          await client.rest.put(`/channels/${oldState.channelId}/voice-status`, {
            body: { status: statusName || null }
          });
          console.log(`Jockie退出: 曲情報を削除し、左側のみ${statusName ? '維持' : '削除'}: ${oldState.channelId}`);
        } else {
          // 別VCならJockie側だけを消し、/status側のVCには触れない
          await client.rest.put(`/channels/${oldState.channelId}/voice-status`, {
            body: { status: null }
          });
          console.log(`Jockie退出: Jockie側VCステータスをクリア: ${oldState.channelId}`);
        }
      } catch (error) {
        console.error('VCステータスのクリアに失敗:', error);
      }
    }

    // 人間が最後の1人としてVCを退出したら、/status由来の左側だけを消す
    // Jockie由来の右側（曲情報）はここでは変更しない
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

          // /statusを実行した人のVCだけを対象にする
          if (oldState.channelId === statusChannelId) {
            const music = await getMusicStatusSong(oldState.guild.id, oldState.channelId);
            const rightSide = music?.song || null;

            await client.rest.put(`/channels/${oldState.channelId}/voice-status`, {
              body: { status: rightSide || null }
            });
            console.log(
              `VC無人: 左側の手動ステータスだけを削除${rightSide ? '（Jockieの曲情報は維持）' : ''}: ${oldState.channelId}`
            );
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
