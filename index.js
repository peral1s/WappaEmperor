const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Render用
app.listen(process.env.PORT || 3000, () => {
  console.log('Web server started');
});

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const replies = [
  '…で？',
  '…和紙が犯す',
  '貴様誰zoy!?',
  'そーいやRPG得意？',
  '和紙のオリ？212cm128kgの漢と177cm70kgのおとなぁのおねぇさんよ',
  '和紙はそこまで思ってなかったから意外だなぁ',
  '<@1286295306497032243>あ、そーだ和紙のRPGやりなさい()',
  '他者への幸福を邪魔する様な気持ちも捨てれる事こそが童帝の第一歩なのです',
  '<@1286295306497032243>と言うわけで、貴方って生涯童帝を誓ってますかな？',
  '素質がないんだにょwww',
  'お前で 45 る',
  '男というのはエロを求めた時、動体視力、精密動作性、その他なんか凄そうなやつを普段の250%の力で出せるようになるんやで',
  'バイトサボりは僕のせいだよ　でもこの胸騒ぎは君のせい',
  'flatbald',
  '今朝固めてwwwちょwwwおまwww朝勃ちやんけwww',
  'なんとなく で殴れるほど 安い顔',
  '膝ニーは訳したらニーニーになるんかwww',
  'すもーる おーる おっけー？',
  'いぷさんが一番えろい',
  'だから彼女いないんだよ',
  'ちっ うっせーな 反省してまーす',
  '全力で謝るので許して',
  'え…/// 死ね',
  'ざぁ〜こ♡',
  'この思考、熱血‼️☝️😎🔥',
  'ずんだもんみたいな語尾やめるのだ',
  'JKに 発情猛けし 王子様 奮い立てども 竿は童か',
  '<:__:1504155267896442910>ドパすぎりゅうぅぅぅぅぅ',
  'もゥまぢ無理'
];

client.once('clientReady', () => {
  console.log('Bot起動！');
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // ランダム返信（1%）
  const random = Math.random();

  if (random < 0.01) {
    const reply =
      replies[Math.floor(Math.random() * replies.length)];

    message.channel.send(reply);
  }

  // セックス系検出
  const sexWords = [
    'セックス',
    'サックス',
    'シックス',
    'ソックス',
    'せっくす',
    'sax',
    'six',
    'sex',
    'sox'
  ];

  if (sexWords.some(word => content.includes(word))) {
    message.channel.send('セックスを検出‼️');
  }

  // フェラ系検出
  const feraWords = [
    'ふぇら',
    'フェラ'
  ];

  if (feraWords.some(word => content.includes(word))) {
    message.channel.send('フェラを検出‼️');
  }
});

client.login(process.env.TOKEN);
