const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(3000);

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
  'あ、そーだ和紙のRPGやりなさい()',
  '他者への幸福を邪魔する様な気持ちも捨てれる事こそが童帝の第一歩なのです',
  '<@1286295306497032243>と言うわけで、貴方って生涯童帝を誓ってますかな？',
  'だから童帝誓っても何のデメリットも無いに決まってんだろ常識的に考えて'
];

client.once('clientReady', () => {
  console.log('Bot起動！');
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const random = Math.random();

  // 20%で返信
  if (random < 0.05) {

    // ランダムなセリフ選択
    const reply =
      replies[Math.floor(Math.random() * replies.length)];

    message.channel.send(reply);
  }
});

client.login(process.env.TOKEN);
