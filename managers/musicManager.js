process.on('warning', (warning) => {
  if (warning.name === 'TimeoutNegativeWarning') return;
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未処理の非同期エラーをキャッチしました:', reason);
});

const {
  joinVoiceChannel,
  VoiceConnectionStatus
} = require('@discordjs/voice');

// サーバーごとの接続状態を保持
const guildConnections = new Map();

// ボイスチャンネル参加・管理コマンド
async function handleMusicCommands(message) {
  const content = message.content.trim();
  const guildId = message.guild.id;
  const voiceChannel = message.member?.voice?.channel;

  // 🚪 w!join (ボイスチャンネルに参加)
  if (content === 'w!join') {
    if (!voiceChannel) {
      return message.reply('…まず貴方がボイスチャンネルに入るのだ');
    }

    try {
      let connection = guildConnections.get(guildId);

      if (!connection) {
        connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: guildId,
          adapterCreator: message.guild.voiceAdapterCreator,
          selfDeaf: true
        });

        connection.on(VoiceConnectionStatus.Disconnected, () => {
          try {
            connection.destroy();
          } catch (e) {}
          guildConnections.delete(guildId);
        });

        guildConnections.set(guildId, connection);
      }

      return message.reply(`…ボイスチャンネルに参加したのだ: ${voiceChannel.name}`);
    } catch (err) {
      console.error('VC接続エラー:', err);
      return message.reply('…ボイスチャンネルへの接続に失敗したのだ');
    }
  }

  // 🚪 w!dc (ボイスチャンネルから退出)
  if (content === 'w!dc') {
    const connection = guildConnections.get(guildId);
    if (!connection) {
      return message.reply('…ボイスチャンネルに参加していないのだ');
    }

    try {
      connection.destroy();
    } catch (e) {}
    guildConnections.delete(guildId);

    return message.reply('…ボイスチャンネルから退出したのだ');
  }
}

module.exports = { handleMusicCommands };
