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
  '# 0.01%の超超超‼️低確率に当選したあなたに\n# ✨WappaEmperor✨\n# のご加護が有らんことを'
];

client.once('clientReady', () => {
  console.log('Bot起動！');
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // ランダム返信（1%）
  const random = Math.random();

  if (random < 0.0001) {

  const reply =
    replies[Math.floor(Math.random() * replies.length)];

  message.reply(reply);
  }

  if (message.content.includes('<@1507363518830346371>')) {

    const helloReplies = [
      'https://cdn.discordapp.com/attachments/1502569232574058637/1506275221743730708/quote_1506271562817343629.png?ex=6a139a5e&is=6a1248de&hm=1c7b801d6573de0bcf727b1f0b5ce141229d4060a76fa53d91a6ce4999feb4ae&',
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
      '射精し切ろうぜ‼️',
      '今朝固めてwwwちょwwwおまwww朝勃ちやんけwww',
      'なんとなく で殴れるほど 安い顔',
      '膝ニーは訳したらニーニーになるんかwww',
      'すもーる おーる おっけー？',
      'いぷさんが一番えろい',
      'だから彼女いないんだよ',
      'ちっ うっせーな 反省してまーす',
      '全力射精するので許して',
      'え…/// 死ね',
      'ざぁ〜こ♡',
      'この思考、熱血‼️☝️😎🔥',
      'https://cdn.discordapp.com/attachments/1502569232574058637/1505454058033643590/quote_1500913065317761116.png?ex=6a13e959&is=6a1297d9&hm=02ee75162ec27416338b5b76cf3953297cfbc1c9c3323ca122c3e6f68eec3a33&',
      'JKに 発情猛けし 王子様 奮い立てども 竿は童か',
      '<:__:1504155267896442910>ドパすぎりゅうぅぅぅぅぅ',
      'もゥまぢ無理'
    ];
    
  const reply =
    helloReplies[Math.floor(Math.random() * helloReplies.length)];

  message.channel.send(reply);
}

  if (message.content.includes('のだ')) {

    message.channel.send('ずんだもんみたいな語尾やめるのだ');

  }
    if (message.content.includes('トマトの偉大さ1')) {

      message.channel.send('トマトって偉大だよね。あのフォルムとか。話すことが多いからなにを話すか悩むな。じゃあとりあe');

  }
    if (message.content.includes('トマトの偉大さ2')) {

      message.channel.send('前回は字数制限でトマトの偉大さを語ることが阻止されたから今回は是非とも聞いてほしいな。初回だからとりa');

  }

    if (message.content.includes('トマトの偉大さ3')) {

    message.channel.send('字数少なすぎだろ！今回はちゃんと喋るからな！時間がないから簡潔にまとめるぞ！まずひとt');

  }
  
  if (message.content.includes('トマトの偉大さ4')) {

    message.channel.send('そんなものないよおおおおんwwwww');

  }
    if (message.content.includes('/きぅい')) {

      message.channel.send('きぅいくってー\nあげりしゃすーwwwあげりしゃすーwww\nあげあげりしゃすーwww\nきぶんをあげるでりしゃすなきぅいーwww\nあげりしゃすーwww\nあげあげりしゃすーwww');

  }
  
  if (message.content.includes('/あさ')) {

    message.channel.send('あーたーらしーいーあーさがっきったwww\nきぼーおのっあーさーだwww\nよろこーびにむねをひーらけwww\nおーぞーらあーおーげーwww\nらーじおーのーこーえにーwww\nすこやーかなーむーねをーwww\nこのかっおーるかっぜーにひらーけよwww\nそれいっちにっさーんwwwww');

  }
  
  if (message.content.includes('いぷしろん')) {

    message.channel.send('https://cdn.discordapp.com/attachments/1193815699630592160/1508109462924165201/IMG_2749.png?ex=6a1457e3&is=6a130663&hm=e877e89dd071fdfdea49ff3f69b2bd90092254af14079285fbc8af88187cada1&');

  }
  
  if (message.content.includes('冷蔵庫')) {

    message.channel.send('京都は日本の首都');

  }
  
  if (message.content.includes('社不')) {

    message.channel.send('https://cdn.discordapp.com/attachments/1502569232574058637/1505454038391722055/quote_1505419785767485480.png?ex=6a13e954&is=6a1297d4&hm=4e2c37e9d6f8674c1f7cb5835d35f9e993b21194ecfd42461c226ffb4bf2fe50&');

  }
  
  if (message.content.includes('Flatbread')) {

    message.channel.send('Flatbald wwwwwwwwwww');

  }

  if (message.content.includes('カートゥーンポテチ')) {

    const helloReplies = [
      '「カートゥーンポテチ、起動ッ！\nサクサク参上、悪いやつらは塩対応だぜ！」',
      '「オイル満タン！テンション全開！\nオレはカートゥーンポテチ！今日も世界をカリッと守る！」',
      '「ポテチだからってナメんなよ？\nこの一枚一枚に、正義が詰まってるんだ！」',
      '「警告。ポテチ泥棒を検知。\n――排除モード、パリパリ起動。」',
      '「やあもつ楽民！\n笑いと炭水化物を届けに来た、カートゥーンポテチだ！」',
      '「バリッと変形！\nスナック界最強ロボ、カートゥーンポテチ参上！！」',
      '「賞味期限？そんなものは超えてきた。\n未来から来たポテチ型ロボ、カートゥーンポテチだ。」',
      '「ポテトの魂、メカの力！\n合体ヒーロー・カートゥーンポテチ、オンステージ！」'
    ];
    
  const reply =
    helloReplies[Math.floor(Math.random() * helloReplies.length)];

  message.channel.send(reply);

  }
  
  const sexWords = [
    'セックス',
    'サックス',
    'シックス',
    'ソックス',
    'せっくす',
    'sax',
    'six',
    'sex',
    'sox',
    'せくす',
    'セクス',
    'せくしー',
    'セクシー',
    '6号'
  ];

  if (sexWords.some(word => content.includes(word))) {
    message.channel.send('https://cdn.discordapp.com/attachments/1193815699630592160/1508487079997345842/quote_1500917870383595641.png?ex=6a15b792&is=6a146612&hm=1cf87b362a621a7292a5e6bf03a873510af4124e8aa091c2df429e40c63c085a&');
  }

  // フェラ系検出
  const feraWords = [
    'ふぇら',
    'フェラ',
    'フエラ',
    'ふえら'
  ];

  if (feraWords.some(word => content.includes(word))) {
    message.channel.send('https://cdn.discordapp.com/attachments/1193815699630592160/1508487080274038784/quote_1500516328333901965.png?ex=6a15b792&is=6a146612&hm=100793dc956a0aa82e37efef009da54e62352903acd3a3ff64d12c04737a1736&');
  }
});

client.login(process.env.TOKEN);
