// 🔊 音声変換エンジン(FFmpeg)のパスを明示的に設定（無音化防止）
try {
  process.env.FFMPEG_PATH = require('ffmpeg-static');
} catch (e) {
  console.warn('FFmpegの読み込み警告:', e.message);
}

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus
} = require('@discordjs/voice');
const play = require('play-dl');

// 🍪 YouTube Cookie の読み込み設定
if (process.env.YOUTUBE_COOKIE) {
  try {
    play.setToken({
      youtube: {
        cookie: process.env.YOUTUBE_COOKIE
      }
    });
  } catch (err) {
    console.error('Cookie設定エラー:', err);
  }
}

// ☁️ SoundCloud Client ID の自動初期化
play.getFreeClientID().then((clientID) => {
  play.setToken({
    soundcloud: {
      client_id: clientID
    }
  });
  console.log('✅ SoundCloud Client ID を自動取得したのだ');
}).catch((err) => {
  console.warn('⚠️ SoundCloud Client ID 取得スキップ:', err.message);
});

// サーバー（Guild）ごとの音楽キューと再生状態を保存
const guildQueues = new Map();

function getGuildQueue(guildId) {
  if (!guildQueues.has(guildId)) {
    guildQueues.set(guildId, {
      connection: null,
      player: null,
      queue: [],
      history: [],
      currentTrack: null,
      loopMode: 'off', // 'off' | 'song' (単曲) | 'queue' (全曲)
      isSkippingBack: false
    });
  }
  return guildQueues.get(guildId);
}

// 🎵 音声再生処理
async function playTrack(guildId, messageChannel) {
  const serverQueue = getGuildQueue(guildId);

  // ループ設定と曲の進行制御
  if (!serverQueue.isSkippingBack) {
    if (serverQueue.loopMode === 'song' && serverQueue.currentTrack) {
      // 1曲ループ
    } else {
      if (serverQueue.currentTrack && serverQueue.loopMode === 'queue') {
        serverQueue.queue.push(serverQueue.currentTrack);
      } else if (serverQueue.currentTrack) {
        serverQueue.history.push(serverQueue.currentTrack);
      }

      if (serverQueue.queue.length > 0) {
        serverQueue.currentTrack = serverQueue.queue.shift();
      } else {
        serverQueue.currentTrack = null;
        if (messageChannel) {
          messageChannel.send('…キューの曲がすべて終わったのだ。早く次の曲を入れなさい');
        }
        return;
      }
    }
  } else {
    serverQueue.isSkippingBack = false;
  }

  if (!serverQueue.currentTrack) return;

  const track = serverQueue.currentTrack;

  try {
    // 接続状態の確認（Readyになるまで待機）
    if (serverQueue.connection) {
      try {
        await entersState(serverQueue.connection, VoiceConnectionStatus.Ready, 10_000);
      } catch (e) {
        console.error('VC接続タイムアウト:', e);
      }
    }

    // 各サイトの音声ストリームを取得
    const stream = await play.stream(track.url);

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    if (!serverQueue.player) {
      serverQueue.player = createAudioPlayer();

      serverQueue.player.on(AudioPlayerStatus.Idle, () => {
        playTrack(guildId, messageChannel);
      });

      serverQueue.player.on('error', err => {
        console.error('再生エラー:', err);
        if (messageChannel) {
          messageChannel.send(`…「${serverQueue.currentTrack?.title}」の再生中にエラーが発生したのだ\n\`\`\`\n${err.message || err}\n\`\`\``);
        }
        playTrack(guildId, messageChannel);
      });

      serverQueue.connection.subscribe(serverQueue.player);
    }

    serverQueue.player.play(resource);
    messageChannel.send(`🎶 **再生中:** ${track.title}\n${track.url}`);
  } catch (err) {
    console.error('ストリームエラー:', err);
    if (messageChannel) {
      messageChannel.send(`…「${track.title}」の読み込みに失敗したのだ\n\`\`\`\n${err.message || err}\n\`\`\``);
    }
    playTrack(guildId, messageChannel);
  }
}

// 🎼 音楽コマンド判定・制御
async function handleMusicCommands(message) {
  const content = message.content.trim();
  const guildId = message.guild.id;
  const voiceChannel = message.member?.voice?.channel;

  // 🎵 w!p <URL または 検索キーワード>
  if (content.startsWith('w!p ')) {
    const query = content.slice(4).trim();
    if (!voiceChannel) return message.reply('…まず貴方がボイスチャンネルに入るのだ');
    if (!query) return message.reply('…URLまたは曲名を指定するのだ');

    const serverQueue = getGuildQueue(guildId);

    if (!serverQueue.connection) {
      serverQueue.connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guildId,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: true
      });
    }

    try {
      const tracksToAdd = [];
      const validation = await play.validate(query);

      // 🟠 SoundCloud の場合
      if (validation && validation.startsWith('so_')) {
        const scData = await play.soundcloud(query);
        if (validation === 'so_track') {
          tracksToAdd.push({
            title: scData.name,
            url: scData.url,
            requestedBy: message.author.username
          });
        } else if (validation === 'so_playlist') {
          const scTracks = await scData.all_tracks();
          scTracks.forEach(t => tracksToAdd.push({
            title: t.name,
            url: t.url,
            requestedBy: message.author.username
          }));
        }
      }
      // 🟢 Spotify の場合
      else if (validation && validation.startsWith('sp_')) {
        if (play.is_expired()) {
          await play.refreshToken();
        }
        const spotifyData = await play.spotify(query);

        if (validation === 'sp_track') {
          const searched = await play.search(`${spotifyData.name} ${spotifyData.artists[0]?.name || ''}`, {
            limit: 1,
            source: { soundcloud: 'tracks' }
          });
          if (searched.length > 0) {
            tracksToAdd.push({
              title: spotifyData.name,
              url: searched[0].url,
              requestedBy: message.author.username
            });
          }
        }
      }
      // 🟡 YouTube または 検索キーワードの場合
      else {
        if (validation === 'yt_video') {
          try {
            const info = await play.video_info(query);
            tracksToAdd.push({
              title: info.video_details.title,
              url: info.video_details.url,
              requestedBy: message.author.username
            });
          } catch (e) {
            console.warn('YouTube取得失敗。SoundCloudで代替検索します:', e.message);
            const searched = await play.search(query, { limit: 1, source: { soundcloud: 'tracks' } });
            if (searched.length > 0) {
              tracksToAdd.push({
                title: searched[0].name,
                url: searched[0].url,
                requestedBy: message.author.username
              });
            } else {
              throw e;
            }
          }
        } else {
          const searched = await play.search(query, {
            limit: 1,
            source: { soundcloud: 'tracks' }
          });
          if (searched.length > 0) {
            tracksToAdd.push({
              title: searched[0].name,
              url: searched[0].url,
              requestedBy: message.author.username
            });
          } else {
            return message.reply('…曲が見つからなかったのだ');
          }
        }
      }

      if (tracksToAdd.length === 0) {
        return message.reply('…曲情報の取得に失敗したのだ');
      }

      serverQueue.queue.push(...tracksToAdd);

      if (tracksToAdd.length === 1) {
        if (!serverQueue.currentTrack) {
          playTrack(guildId, message.channel);
        } else {
          message.reply(`…**${tracksToAdd[0].title}**をキューに追加したのだ`);
        }
      } else {
        message.reply(`…**${tracksToAdd.length}曲**をキューに追加したのだ`);
        if (!serverQueue.currentTrack) {
          playTrack(guildId, message.channel);
        }
      }
      return;

    } catch (err) {
      console.error('動画情報取得エラー:', err);
      return message.reply(`…曲情報の取得に失敗したのだ\n\`\`\`\n${err.message || err}\n\`\`\``);
    }
  }

  const serverQueue = getGuildQueue(guildId);
  if (!serverQueue.connection) return;

  // ⏭️ w!s (スキップ)
  if (content === 'w!s') {
    if (!serverQueue.currentTrack) return message.reply('…再生中の曲がないのだ');
    message.reply('…スキップしたのだ');
    if (serverQueue.loopMode === 'song') serverQueue.loopMode = 'off';
    serverQueue.player?.stop();
    return;
  }

  // ⏭️ w!st <番号>
  if (content.startsWith('w!st ')) {
    const num = parseInt(content.slice(5).trim());
    if (isNaN(num) || num < 1 || num > serverQueue.queue.length) {
      return message.reply(`…有効なキュー番号を入力するのだ (1〜${serverQueue.queue.length})`);
    }

    const skippedTracks = serverQueue.queue.splice(0, num - 1);
    if (serverQueue.currentTrack) serverQueue.history.push(serverQueue.currentTrack);
    serverQueue.history.push(...skippedTracks);

    message.reply(`… ${num} 番目の曲までスキップするのだ`);
    if (serverQueue.loopMode === 'song') serverQueue.loopMode = 'off';
    serverQueue.player?.stop();
    return;
  }

  // ⏮️ w!back
  if (content === 'w!back') {
    if (serverQueue.history.length === 0) return message.reply('…前の曲の履歴がないのだ');

    const previousTrack = serverQueue.history.pop();
    if (serverQueue.currentTrack) {
      serverQueue.queue.unshift(serverQueue.currentTrack);
    }

    serverQueue.currentTrack = previousTrack;
    serverQueue.isSkippingBack = true;
    message.reply(`…前の曲に戻るのだ: **${previousTrack.title}**`);
    serverQueue.player?.stop();
    return;
  }

  // 🎧 w!now
  if (content === 'w!now') {
    if (!serverQueue.currentTrack) return message.reply('…現在再生中の曲はないのだ');
    return message.reply(`🎵 **現在再生中:** ${serverQueue.currentTrack.title}\n🔗 ${serverQueue.currentTrack.url}`);
  }

  // 📜 w!q
  if (content === 'w!q') {
    if (!serverQueue.currentTrack && serverQueue.queue.length === 0) {
      return message.reply('…キューは空っぽなのだ');
    }

    let qText = `**🎶 現在再生中:** ${serverQueue.currentTrack ? serverQueue.currentTrack.title : 'なし'}\n\n**📜 キュー一覧:**\n`;

    if (serverQueue.queue.length === 0) {
      qText += '（…次に再生する曲が有りません）';
    } else {
      serverQueue.queue.slice(0, 10).forEach((t, i) => {
        qText += `**${i + 1}.** ${t.title} (追加: ${t.requestedBy})\n`;
      });
      if (serverQueue.queue.length > 10) {
        qText += `…他 ${serverQueue.queue.length - 10} 曲`;
      }
    }

    qText += `\n\nモード: **${serverQueue.loopMode === 'song' ? 'ループ再生' : serverQueue.loopMode === 'queue' ? '全曲リピート' : '通常'}**`;

    return message.reply(qText);
  }

  // ⏸️ w!pause / ⏩ w!resume
  if (content === 'w!pause') {
    if (serverQueue.player && serverQueue.player.pause()) {
      return message.reply('…一時停止したのだ');
    }
  }

  if (content === 'w!resume') {
    if (serverQueue.player && serverQueue.player.unpause()) {
      return message.reply('…再開したのだ');
    }
  }

  // 🔁 w!loop
  if (content === 'w!loop') {
    serverQueue.loopMode = serverQueue.loopMode === 'song' ? 'off' : 'song';
    return message.reply(`…ループ再生を **${serverQueue.loopMode === 'song' ? '有効' : '無効'}** にしたのだ`);
  }

  // 🔂 w!rq
  if (content === 'w!rq') {
    serverQueue.loopMode = serverQueue.loopMode === 'queue' ? 'off' : 'queue';
    return message.reply(`…リピートキューを **${serverQueue.loopMode === 'queue' ? '有効' : '無効'}** にしたのだ`);
  }

  // 🚪 w!dc
  if (content === 'w!dc') {
    serverQueue.connection.destroy();
    guildQueues.delete(guildId);
    return message.reply('…ボイスチャンネルから退出したのだ');
  }
}

module.exports = { handleMusicCommands };
