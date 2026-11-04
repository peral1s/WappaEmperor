
const replyData = require('../data/replies');
const {
  updateUserStats,
  isChannelDisabled,
  getCustomReplies
} = require('../db/database');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

async function handleMessage(message, client) {
  if (message.author.bot) return;

  // 🚫 出現除外チャンネルの場合は処理を中断
  if (await isChannelDisabled(message.channel.id)) return;

  if (!message.guild) return;

  // ==========================================
  // ボイスチャンネル参加・退出機能
  // ==========================================
  if (message.content.toLowerCase() === 'w!join') {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply('…貴方、ボイスチャンネルに入っていないのだ');
    }

    try {
      joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      return message.channel.send(`…**${voiceChannel.name}** に参加したのだ`);
    } catch (error) {
      console.error('VC参加エラー:', error);
      return message.reply('…ボイスチャンネルへの参加に失敗したのだ');
    }
  }

  if (message.content.toLowerCase() === 'w!dc') {
    const connection = getVoiceConnection(message.guild.id);

    if (!connection) {
      return message.reply('…和紙はどこのボイスチャンネルにも参加していないのだ');
    }

    connection.destroy();
    return message.channel.send('…ボイスチャンネルから退出したのだ');
  }

  // ==========================================
  // 初回送信でロール付与
  // ==========================================
  if (message.channel.id === '1401415423785832468') {
    const role = message.guild.roles.cache.get('1510205076730548305');

    if (role && !message.member.roles.cache.has(role.id)) {
      try {
        await message.member.roles.add(role);
        console.log('ロール付与成功');
      } catch (err) {
        console.error('ロール付与失敗:', err);
      }
    }
  }

  const content = message.content.toLowerCase();
  const id = message.author.id;
  const username = message.author.username;

  // ==========================================
  // MongoDBの追加文章 + 元々の返信文章
  // ==========================================
  let combinedReplies;

  async function getAllReplies() {
    if (!combinedReplies) {
      const customReplies = await getCustomReplies('replies');

      combinedReplies = [
        ...(replyData.replies || []),
        ...customReplies
      ];
    }

    return combinedReplies;
  }

  // ==========================================
  // 全体ランダム返信（1%）
  // ==========================================
  if (Math.random() < 0.01) {
    const replies = await getAllReplies();

    if (replies.length > 0) {
      const luckyReply = replies[Math.floor(Math.random() * replies.length)];

      await message.reply(luckyReply);
      await updateUserStats(id, username, 'lucky');

      console.log(`🎉 全体LUCKY発動・記録: ${username}`);
    }
  }

  // ==========================================
  // 和紙メンション処理
  // ==========================================
  if (!message.reference && message.mentions.users.has(client.user.id)) {
    const replies = await getAllReplies();

    if (replies.length > 0) {
      const mainReply = replies[Math.floor(Math.random() * replies.length)];

      await message.channel.send(mainReply);
      await updateUserStats(id, username, 'mention');

      console.log(`✅ 和紙メンション: ${username}`);
    }
  }

  // ==========================================
  // キーワード判定
  // ==========================================
  if (message.content.includes('のだ')) {
    message.channel.send('ずんだもんみたいな語尾やめるのだ');
  }

  if (message.content.includes('トマトの偉大さ')) {
    message.channel.send('## そんなものないよおおおんwwwww');
  }

  if (message.content.includes('洋楽')) {
    message.channel.send('yougaく');
  }

  if (message.content.includes('溶岩')) {
    message.channel.send('yougaん');
  }

  if (message.content.includes('神の旅　ああ神の旅　神の旅')) {
    message.channel.send('# あっぱれ！');
  }

  if (message.content.includes('洋菓子')) {
    message.channel.send('yougaし');
  }

  if (message.content.includes('洋傘')) {
    message.channel.send('yougaさ');
  }

  if (message.content.includes('有害')) {
    message.channel.send('yougaい');
  }

  if (message.content.includes('優雅')) {
    message.channel.send('# youga');
  }

  if (message.content.includes('夕方')) {
    message.channel.send('yougaた');
  }

  if (message.content.includes('いぷしろん')) {
    message.channel.send('https://cdn.discordapp.com/attachments/1193815699630592160/1508109462924165201/IMG_2749.png?ex=6a1457e3&is=6a130663&hm=e877e89dd071fdfdea49ff3f69b2bd90092254af14079285fbc8af88187cada1&');
  }

  if (message.content.includes('冷蔵庫')) {
    message.channel.send('日本の首都は京都');
  }

  if (message.content.includes('社不')) {
    message.channel.send('https://cdn.discordapp.com/attachments/1502569232574058637/1505454038391722055/quote_1505419785767485480.png?ex=6a13e954&is=6a1297d4&hm=4e2c37e9d6f8674c1f7cb5835d35f9e993b21194ecfd42461c226ffb4bf2fe50&');
  }

  if (message.content.includes('彼女')) {
    message.channel.send('# 彼女を検出‼️‼️‼️\n嫉妬モード発動‼️‼️‼️\nンニィィィィィィィィィィ‼️‼️');
  }

  const sexWords = [
    'セックス', 'サックス', 'シックス', 'ソックス',
    'せっくす', 'sax', 'six', 'sex', 'sox',
    'せくす', 'セクス', 'せくしー', 'セクシー'
  ];

  if (sexWords.some(word => content.includes(word))) {
    message.channel.send('# セックスを検出‼️\n-# 汚い言葉が好きな人はちょっと…和紙達お紳士なので…');
  }

  const fellaWords = ['ふぇら', 'フェラ', 'フエラ', 'ふえら', 'fella'];

  if (fellaWords.some(word => content.includes(word))) {
    message.channel.send('# フェラを検出‼️\n-# 汚い言葉が好きな人はちょっと…和紙達お紳士なので…');
  }

  if (message.content.includes('6号')) {
    message.channel.send('よしかるを検出‼️');
  }

  if (message.content.includes('レモブル')) {
    message.channel.send('6号を検出‼️');
  }

  if (message.content.includes('よしかる')) {
    message.channel.send('レモブルを検出‼️');
  }

  // ==========================================
  // /flatbread
  // ==========================================
  if (content.includes('/flatbread')) {
    const replies = replyData.hnnskReplies || [];

    if (replies.length > 0) {
      const reply = replies[Math.floor(Math.random() * replies.length)];
      message.channel.send(reply);
    }
  }

  if (message.content.includes('二ドアイ')) {
    message.channel.send('https://cdn.discordapp.com/attachments/1502569232574058637/1512178975886020710/quote_1503055273198354665.png?ex=6a2325ea&is=6a21d46a&hm=436269d39b10d87e66e299c4991816f7263fa0a450656d1271fcab11163fd1e0&');
  }
}

module.exports = handleMessage;
