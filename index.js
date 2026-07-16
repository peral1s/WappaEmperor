const { MongoClient } = require('mongodb');
const express = require('express');

const mongo = new MongoClient(process.env.MONGODB_URI);
let statsCollection;

const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Render用
app.listen(process.env.PORT || 3000, () => {
  console.log('Web server started');
});

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const replies = [
  'https://cdn.discordapp.com/attachments/1502569232574058637/1506275221743730708/quote_1506271562817343629.png?ex=6a139a5e&is=6a1248de&hm=1c7b801d6573de0bcf727b1f0b5ce141229d4060a76fa53d91a6ce4999feb4ae&',
  '…で？',
  '…和紙が犯す',
  '<@1388807489012633700>もうなんでもいいので印象教えてください。(便乗蟋蟀)',
  `<@1286295306497032243>🍅(* ॑꒳ ॑*  )🍅ﾄﾏﾄﾊﾟﾗﾀﾞｲｽ「🍅ﾄｫ↓ﾒｪｲ↓ﾄｫ↑🍅(๑>∀<๑)」
🍅( '-' 🍅 )ﾄﾒｲﾄｩ（っ’-‘)╮ =͟͟͞͞🍅🍅🍅🍅🍅🍅🍅🍅(っ'-' )╮   =͟͟͞͞🍅ヽ( '-'ヽ)
🍅🍅🍅Ψ( 'ω'* )ﾄﾒｨﾄｩｽ
( ╮^o^)╮-｡･*･:≡🍅🍅🍅
(∩^o^)⊃━━━━━☆🍅.*･｡
とまとｫ(｢🍅･ω･)｢🍅
(つ🍅'▽')つ🍅
( ╮^o^)╮-｡･*･:≡🍅🍅🍅
🍅( ᐛ   )🍅ﾄﾏﾄﾊﾟｧｧｧｧｧｧｧｧｧｧｧｧｧｧｧｧｧｧｧｧﾗﾀﾞｲｽｩｩｩｩｩｩｩ`,
  'なんか給食のシチューに米じゃなくてパン出てる時ぐらいモヤモヤする',
  'あおとkannが合体したら青姦',
  'yougaいなゲイ',
  '女は漏らしてもろて',
  '今回は動画形式でいいかな、',
  '貴様誰zoy!?',
  '<@1388807489012633700>そーいやRPG得意？',
  '和紙のオリ？212cm128kgの漢と177cm70kgのおとなぁのおねぇさんよ',
  '和紙はそこまで思ってなかったから意外だなぁ',
  '<@1388807489012633700>童帝と名乗るのは求める事すら捨てた者達のみ、邪念が有るなら消し去る事を極めてから申しなさい',
  '和紙は生涯童帝を誓った漢,崩せる様な人は相当な人格者で無いと無理よ',
  'まだ求めるのは童貞、それすら捨てた者が童帝だ',
  '<@1388807489012633700>と言うか人の目を気にするのって何でぇ？和紙分からんからおせーて？',
  '<@1388807489012633700>あ、和紙はレズもせーへきにはなりません',
  '和紙のリミットは麺375、もやし200、チャーシュー2とサイコロチャーシュー4',
  '<@1388807489012633700>あ、そーだ和紙のRPGやりなさい()',
  '<@1388807489012633700>他者への幸福を邪魔する様な気持ちも捨てれる事こそが童帝の第一歩なのです',
  '<@1388807489012633700>と言うわけで、貴方って生涯童帝を誓ってますかな？',
  '素質がないんだにょwww',
  'お前で\n45\nる',
  'ユーキのは粘度高そう',
  'えー『手マンの謝罪、すまんて』とはよく言ったもので',
  '放て！レールガン！\nﾝﾋﾞｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰ✨',
  '怒ったかんな？許さないかんな？\n# 瀬戸環奈',
  '男というのはエロを求めた時、動体視力、精密動作性、その他なんか凄そうなやつを普段の250%の力で出せるようになるんやで',
  'バイトサボりは僕のせいだよ　でもこの胸騒ぎは君のせい',
  '射精し切ろうぜ‼️',
  'マキヒコを犯すってこと？😰',
  'おーほほ滑稽',
  'スピキの冷笑\nチョワーwww',
  'まぁ、人じゃないと疑われるくらいに変な感性持ってる部分は割と有る',
  'オマーンとか漫湖とか聞いたら失神しそう',
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
  '<:__:1504155267896442910>ドパすぎりゅうゥゥゥゥゥ',
  'もゥまぢ無理',
  '女性と一夜を過〜ごし〜たら〜\nゴムを忘れてました〜\n# 着床‼️‼️\n 子"埋め"大夫',
  '俺はゲイやぞ',
  'んにぃィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィ',
  '僕はガイじゃ',
  '朝の光の中でッｪｪｪ♪ah✨\n朝の光の中でッｪｪｪ♪ah✨ah✨ahahah✨\n光にAhhhhhhhhhhhhhh✨☀️',
  '# えっちだフォー！',
  'ケツから穿血\n穿ケツ',
  '収録10時からで今の今まで寝落ち(4時)',
  '毛根はもう来んで',
  '毛根、もうこんだけしかないんか…',
  '水酸化物イオンの覚え方\n『おぉえっちじゃない…🙃』',
  'ちな臭素はBr-やからうんこと掛けてブリーwwwwで覚えれる',
  'うどんもえろもぶっかけが一番なんだよな',
  'ぱちゅんぱちゅ だめつだめえつ 中に出せ',
  '小児科で小2を承認wwwwwww',
  '甘味、苦味、酸味、塩味、旨味、女神ってかwwww',
  '汚い結晶を見た時の反応\nえ、キショーwww',
  '性犯罪者になりたくない時は、男とやればええ',
  '朕は硬化なり',
  'アイタ・痔・エンド',
  '犬神に導かれるんや',
  'なんか給食のシチューに米じゃなくてパン出てる時くらいモヤモヤした',
  '俺が友達(男子)に告白しようとしてたのに観覧車に無理やり入ってきて奪われた',
  'そんなこといっちゃって\nでも身体は正直だね\n君の中指ガッチガチだよ…///♡',
  'よくわからんけど女と家電は叩けばなおる',
  '俺のエクスカリバーをみんなにぶっ刺すのが俺の使命',
  '# そして輝く✨ウルトラフォー✨\n# (フォー‼️)',
  'ﾊﾞﾅﾌﾞｦｲｼﾞﾒﾇﾝﾃﾞ…',
  '真のドパガキは早漏',
  '<@1388807489012633700>だから童帝誓ってもなんのデメリットも無いに決まってんだろ常識的に考えて',
  'まじギュンギュンギュン搾りすぎて乳\nどれだけ絞られる気なの？\nああ、君が非処女だなんてさぁ…\n理性持たない',
  'ドパガキ格付チェック中のGACKTのモノマネ\nﾝﾝﾝﾝﾝあアアアきぃぃんもちいいいあえええええええ',
  'https://cdn.discordapp.com/attachments/1193815699630592160/1512178331473154298/IMG_2862.jpg?ex=6a232551&is=6a21d3d1&hm=d0d855c65ed1572f3dc6dd6acb9072610aab66631e6f845ed4a6dd64a68d3ee2&'
];

async function getAllStats() {
  const docs = await statsCollection.find().toArray();
  const stats = {};
  for (const doc of docs) {
    stats[doc._id] = {
      id: doc._id, // サーバーから名前を引っ張るためにIDを保持
      name: doc.name,
      mention: doc.mention || 0,
      lucky: doc.lucky || 0
    };
  }
  return stats;
}

async function updateUserStats(userId, username, statsType) {
  const incData = {};
  if (statsType === 'mention') incData.mention = 1;
  if (statsType === 'lucky') incData.lucky = 1;

  const update = {
    $set: { name: username },
    $inc: incData
  };

  const result = await statsCollection.updateOne(
    { _id: userId },
    update,
    { upsert: true }
  );

  console.log(`統計更新: ${username} | ${statsType}+1 | matched: ${result.matchedCount}, upserted: ${result.upsertedCount}`);
}

client.once('ready', async () => {
  await mongo.connect();

  const db = mongo.db("discordbot");
  statsCollection = db.collection("stats");

  console.log("MongoDB接続完了");
  console.log('Bot起動！');

  const commands = [
    new SlashCommandBuilder()
      .setName('log')
      .setDescription('…貴方達の和紙への気持ちが見れるのだ')
      .addUserOption(option =>
        option
          .setName('user')
          .setDescription('誰の記録を見たいのだ')
          .setRequired(false)
      ),

    new SlashCommandBuilder()
      .setName('rank')
      .setDescription('和紙を呼び出したランキングを見れるのだ'),

    new SlashCommandBuilder()
      .setName('luck')
      .setDescription('和紙が応じたランキングを見れるのだ')
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands }
  );

  console.log('スラッシュコマンド登録完了');
});

client.on('messageCreate', async message => {

  if (message.author.bot) return;
  if (!message.guild) return; // DM対策

  // 初回送信でロール付与
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
  // 全体ランダム返信（1%）
  // ==========================================
  if (Math.random() < 0.01) {
    const luckyReply = replies[Math.floor(Math.random() * replies.length)];
    await message.reply(luckyReply);
    
    await updateUserStats(id, username, 'lucky'); 
    console.log(`🎉 全体LUCKY発動・記録: ${username}`);
  }

// ==========================================
// 和紙メンション処理
// ==========================================
if (
  !message.reference &&
  message.mentions.users.has(client.user.id)
) {

  const mainReply = replies[Math.floor(Math.random() * replies.length)];
  await message.channel.send(mainReply);

  await updateUserStats(id, username, 'mention');

  console.log(`✅ 和紙メンション: ${username}`);
}
  
  // ==========================================
  // キーワード判定
  // ==========================================
  if (message.content.includes('のだ')) {
    message.channel.send('ずんだもんみたいな語尾やめるのだ');
  }

  if (content.includes('/トマト')) {
    const TomatoReplies = [
      'https://cdn.discordapp.com/attachments/1193815699630592160/1512178331473154298/IMG_2862.jpg?ex=6a232551&is=6a21d3d1&hm=d0d855c65ed1572f3dc6dd6acb9072610aab66631e6f845ed4a6dd64a68d3ee2&',
      '俺のエクスカリバーをみんなにぶっ刺すのが俺の使命',
      '汚い結晶を見た時の反応\nえ、キショーwww',
      '甘味、苦味、酸味、塩味、旨味、女神ってかwwww',
      'ちな臭素はBr-やからうんこと掛けてブリーwwwwで覚えれる',
      '毛根、もうこんだけしかないんか…',
      'ケツから穿血\n穿ケツ',
      '収録10時からで今の今まで寝落ち(4時)',
      '俺はゲイやぞ',
      'んにぃィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィィ',
      'https://cdn.discordapp.com/attachments/1502569232574058637/1505454058033643590/quote_1500913065317761116.png?ex=6a13e959&is=6a1297d9&hm=02ee75162ec27416338b5b76cf3953297cfbc1c9c3323ca122c3e6f68eec3a33&',
      '膝ニーは訳したらニーニーになるんかwww',
      '今朝固めてwwwちょwwwおまwww朝勃ちやんけwww',
      '男というのはエロを求めた時、動体視力、精密動作性、その他なんか凄そうなやつを普段の250%の力で出せるようになるんやで',
      '素質がないんだにょwww',
      `🍅(* ॑꒳ ॑*  )🍅ﾄﾏﾄﾊﾟﾗﾀﾞｲｽ「🍅ﾄｫ↓ﾒｪｲ↓ﾄｫ↑🍅(๑>∀<๑)」
🍅( '-' 🍅 )ﾄﾒｲﾄｩ（っ’-‘)╮ =͟͟͞͞🍅🍅🍅🍅🍅🍅🍅🍅(っ'-' )╮   =͟͟͞͞🍅ヽ( '-'ヽ)
🍅🍅🍅Ψ( 'ω'* )ﾄﾒｨﾄｩｽ
( ╮^o^)╮-｡･*･:≡🍅🍅🍅
(∩^o^)⊃━━━━━☆🍅.*･｡
とまとｫ(｢🍅･ω･)｢🍅
(つ🍅'▽')つ🍅
( ╮^o^)╮-｡･*･:≡🍅🍅🍅
🍅( ᐛ   )🍅ﾄﾏﾄﾊﾟｧｧｧｧｧｧｧｧｧｧｧｧｧｧｧｧｧｧｧｧﾗﾀﾞｲｽｩｩｩｩｩｩｩ`,
'もうなんでもいいので印象教えてください。(便乗蟋蟀)',
'https://cdn.discordapp.com/attachments/1502569232574058637/1506275221743730708/quote_1506271562817343629.png?ex=6a139a5e&is=6a1248de&hm=1c7b801d6573de0bcf727b1f0b5ce141229d4060a76fa53d91a6ce4999feb4ae&'
    ];
    const reply = TomatoReplies[Math.floor(Math.random() * TomatoReplies.length)];
    message.channel.send(reply);
  }
  if (message.content.includes('トマトの偉大さ')) {
    message.channel.send('そんなものないよおおおんwwwww');
  }

  if (message.content.includes('https://cdn.discordapp.com/attachments/1502569232574058637/1506316376388800663/quote_1503055273198354665.png?ex=6a22e9f2&is=6a219872&hm=fe14d236e7056b520a64cfd96a1b709cb680ae68a9b4855fa77b288a1725b6f8&')) {
    message.channel.send('https://cdn.discordapp.com/attachments/1502569232574058637/1506316376841916497/quote_1506304004966055957.png?ex=6a22e9f2&is=6a219872&hm=46ffbe3e9910b0d684a694f32173590ad4fc35ad0c4dbd02ef0884ec1cea9e9f&');
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
    message.channel.send('日本の首都は京都');
  }

  if (message.content.includes('/6号')) {
    message.channel.send('よしかるを検出‼️');
  }

  if (message.content.includes('/はっぴぃ')) {
    message.channel.send('ﾄﾞﾗｺﾞｫﾝｯwﾎﾞｫｫﾙwｵﾚﾊﾀｲﾖｳw\nﾄﾞﾗｺﾞｫﾝｯwﾎﾞｫｫﾙwｵﾏｴﾊﾂｷw\nﾄｹｱｴﾊﾞｧwｷｨｾｪｷｨﾉｫﾊﾟﾜｧｧｧw\nｻｲｷｮｫﾉwﾌｭｰｼﾞｮﾝｯｯｯｯw');
  }

  if (message.content.includes('/レモブル')) {
    message.channel.send('6号を検出‼️');
  }

  if (message.content.includes('/よしかる')) {
    message.channel.send('レモブルを検出‼️');
  }

  if (message.content.includes('社不')) {
    message.channel.send('https://cdn.discordapp.com/attachments/1502569232574058637/1505454038391722055/quote_1505419785767485480.png?ex=6a13e954&is=6a1297d4&hm=4e2c37e9d6f8674c1f7cb5835d35f9e993b21194ecfd42461c226ffb4bf2fe50&');
  }

if (content.includes('/flatbread')) {
    const HnnskReplies = [
      '# そして輝く✨ウルトラフォー✨\n# (フォー‼️)',
      `＃今日のクソ知識
魔法少女まどか★マギカでイベントがあると災害が起こって
しまう
・まどマギ第10話放送後→東日本大震災発生
・完結編→熊本地震
・叛逆の物語の時→台風＋地震＋津波注意報
・再放送の時→震度6地震
まどマギ見てないけど（）`,
      'flatbald wwwwww'
    ];
    const reply = HnnskReplies[Math.floor(Math.random() * HnnskReplies.length)];
    message.channel.send(reply);
  }

    if (content.includes('ギャルトマト列伝')) {
      
      if (Math.random() < 0.01) {

    return message.channel.send(`真・最終話 童帝
???「童帝と名乗るのは求める事すら捨てた者達のみ、邪念が有るなら消し去る事を極めてから申しなさい」

全てを失ったジェヨンの元に、どこからともなく、一人の老人がジェヨンの前へ静かに降り立った。

???「…もう一度、やり直す覚悟は…お有りかしら？」

ジェヨンは目を見開く。

「あ、貴方は…」

老人は穏やかに微笑み、こう言った。

「和紙は生涯童帝を誓った漢,崩せる様な人は相当な人格者で無いと無理よ」

そう言うと、老人は指を一度だけ鳴らした。

次の瞬間、世界がきしむような音を立て、時間そのものが逆行を始める。

???「あ、和紙はレズもせーへきにはなりません」

そんなことを話している間に時間逆行は完了し
気がつくと俺は、トマトと幸せに暮らしていたあの頃へ戻っていた。

???「他者への幸福を邪魔する様な気持ちも捨てれる事こそが童帝の第一歩なのです」

そして少しだけ表情を険しくし、静かに続けた。

「……その幸せを邪魔するような不届き者は――」

老人は再び指を鳴らし、不敵に笑う。

???「…和紙が犯す」`);
}
    const GyarutomatoReplies = [
      `第一話 悪癖
・私、彼氏いるので。
・やめてください！警察呼びますよ！`,
      `第二話 狡猾
・そんなつもりじゃ…ごめんなさい…
・え…お詫び…？それぐらいなら…`,
      `第三話 撮影
・やめて！そんなこと許してない！もう終わりでしょ！
・いやあああああ！`,
      `第四話 脅迫
・卑怯…！私を脅すつもり…？
・ジェヨンくん、私負けないからね…！`,
      `第五話 間隙
・ジェヨンくん…こんなだったっけ…
・今日から私は自由だから！！`,
      `第六話 困惑
・ジェヨンくん…私…もう…
・私、なんであいつのとこ行ってるんだろ…`,
      `最終話 感激
・これが本当の愛だったんだ…♡
・ジェヨンく〜ん😄みってる〜❓`
      
    ];
    const reply = GyarutomatoReplies[Math.floor(Math.random() * GyarutomatoReplies.length)];
    message.channel.send(reply);
  }

  if (content.includes('/あお')) {
    const AoReplies = [
      'https://cdn.discordapp.com/attachments/1510191966942531746/1525782900627472384/IMG_4204.png?ex=6a54a38f&is=6a53520f&hm=7151eed0030aecaf44462453138fa115bfe911cdc9be85980e08fa6c075326eb&',
      '怒ったかんな？許さないかんな？\n# 瀬戸環奈',
      'なんか給食のシチューに米じゃなくてパン出てる時くらいモヤモヤした',
      '俺が友達(男子)に告白しようとしてたのに観覧車に無理やり入ってきて奪われた',
      'あおとkannが合体したら青姦',
      '女性と一夜を過〜ごし〜たら〜\nゴムを忘れてました〜\n# 着床‼️‼️\n 子"埋め"大夫'
    ];
    const reply = AoReplies[Math.floor(Math.random() * AoReplies.length)];
    message.channel.send(reply);
  }

  if (content.includes('<@1388807489012633700>')) {
    const AdaReplies = [
      'そーいやRPG得意？',
      '童帝と名乗るのは求める事すら捨てた者達のみ、邪念が有るなら消し去る事を極めてから申しなさい',
      '和紙のオリ？212cm128kgの漢と177cm70kgのおとなぁのおねぇさんよ',
      '和紙は生涯童帝を誓った漢,崩せる様な人は相当な人格者で無いと無理よ',
      'まだ求めるのは童貞、それすら捨てた者が童帝だ',
      'と言うか人の目を気にするのって何でぇ？和紙分からんからおせーて？',
      'あ、和紙はレズもせーへきにはなりません',
      '和紙のリミットは麺375、もやし200、チャーシュー2とサイコロチャーシュー4',
      'あ、そーだ和紙のRPGやりなさい()',
      'と言うわけで、貴方って生涯童帝を誓ってますかな？',
      '他者への幸福を邪魔する様な気持ちも捨てれる事こそが童帝の第一歩なのです',
      'まぁ、人じゃないと疑われるくらいに変な感性持ってる部分は割と有る',
      '貴様誰zoy!?',
      '…和紙が犯す',
      'RPGのアイデアでも考えて和紙に伝えたらどうですかね(鬼畜)',
      'こことは関係無いけど、RPGの調子どう？',
      'そーいや最近RPG進めてくれて嬉しいぞ',
      'そーいやRPG、真ラスボス倒せた？',
      'そいやRPGの調子どーや？',
      'やらない？和紙のRPG()',
      'そーいやRPG得意？(構文)',
      'RPGの調子と選んだ難易度も聞いとく',
      'rpgって得意？(恒例)',
      'それよりRPGせんか()',
      'どう最近？(RPG)',
      '和紙のRPGのリンク持ってこようか？',
      '和紙のRPGやれ()',
      '和紙のRPGのエンドコンテンツ、ヤバいって話しする…？()',
      'じゃあRPGやれるな！()',
      'そーいや、RPGの経験ってどんぐらい？',
      'そーいやRPGって得意？(唐突)',
      'https://plicy.net/GamePlay/180908'
    ];
    const reply = AdaReplies[Math.floor(Math.random() * AdaReplies.length)];
    message.channel.send(reply);
  }

  if (message.content.includes('彼女')) {
    message.channel.send('彼女を検出！！！！！！\n嫉嫉妬モード発動！！！！！\nンニィィィィィィィィィィィィィ');
  }

  if (message.content.includes('/二ドアイ')) {
    message.channel.send('https://cdn.discordapp.com/attachments/1502569232574058637/1512178975886020710/quote_1503055273198354665.png?ex=6a2325ea&is=6a21d46a&hm=436269d39b10d87e66e299c4991816f7263fa0a450656d1271fcab11163fd1e0&');
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
    const reply = helloReplies[Math.floor(Math.random() * helloReplies.length)];
    message.channel.send(reply);
  }

  const sexWords = [
    'セックス', 'サックス', 'シックス', 'ソックス', 'せっくす',
    'sax', 'six', 'sex', 'sox', 'せくす', 'セクス', 'せくしー', 'セクシー'
  ];

  if (sexWords.some(word => content.includes(word))) {
    message.channel.send('# セックスを検出‼️\n-# 汚い言葉が好きな人はちょっと…和紙達お紳士なので…');
  }

  const fellaWords = ['ふぇら', 'フェラ', 'フエラ', 'ふえら', 'fella'];

  if (fellaWords.some(word => content.includes(word))) {
    message.channel.send('フェラを検出‼️\n-# 汚い言葉が好きな人はちょっと…和紙達お紳士なので…');
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const stats = await getAllStats();

  if (interaction.commandName === 'log') {
    const target = interaction.options.getUser('user') || interaction.user;
    const data = stats[target.id];

    if (!data) {
      return interaction.reply({
        content: '…和紙をまだ呼び出していないのだ',
        ephemeral: true
      });
    }

    // コマンドが実行されたサーバー内での表示名を取得（なければアカウントのユーザー名）
    const member = interaction.guild.members.cache.get(target.id);
    const serverName = member ? member.displayName : target.username;

    const embed = new EmbedBuilder()
      .setColor(0x8B5A2B)
      .setTitle(`${serverName}の記録`)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(
`**和紙を呼び出した回数**
**${data.mention}**回

**和紙が応じた回数**
**${data.lucky}**回`
      )
      .setFooter({
        text: '…もっと和紙を呼び出すのだ\nあ〜せや、貴方RPGって得意？'
      });

    return interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'rank') {
    // タイムアウトを防ぐため、「考え中...」の状態を作る
    await interaction.deferReply();

    const ranking = Object.values(stats)
      .sort((a, b) => b.mention - a.mention)
      .slice(0, 5);

    const total = Object.values(stats).reduce((sum, u) => sum + u.mention, 0);

    const medals = ["🥇", "🥈", "🥉", "🏅", "🏅"];

    let text = `累計 **${total}**回 和紙を呼び出したのだ\n\n`;

    // サーバー内の表示名をリアルタイム取得するループ
    for (let i = 0; i < ranking.length; i++) {
      const u = ranking[i];
      let displayName = u.name; // 初期値はDB保存名

      try {
        const member = await interaction.guild.members.fetch(u.id);
        if (member) displayName = member.displayName; // 現在のサーバーでの名前に上書き
      } catch (err) {
        // ユーザーが脱退している場合などはそのまま
      }

      text += `**${medals[i]} 第${i + 1}位：${u.mention}回**\n${displayName}\n\n`;
    }

    const embed = new EmbedBuilder()
      .setColor(0x8B5A2B)
      .setTitle("和紙を呼び出したランキング")
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(text)
      .setFooter({ text: "…もっと和紙を呼び出すのだ" });

    return interaction.editReply({ embeds: [embed] });
  }

  if (interaction.commandName === 'luck') {
    // タイムアウトを防ぐため、「考え中...」の状態を作る
    await interaction.deferReply();

    const ranking = Object.values(stats)
      .sort((a, b) => b.lucky - a.lucky)
      .filter(u => u.lucky > 0)
      .slice(0, 5);

    const total = Object.values(stats).reduce((sum, u) => sum + u.lucky, 0);

    const medals = ["🥇", "🥈", "🥉", "🏅", "🏅"];

    let text = `累計 **${total}**回 和紙が応じてあげたのだ\n\n`;

    // サーバー内の表示名をリアルタイム取得するループ
    for (let i = 0; i < ranking.length; i++) {
      const u = ranking[i];
      let displayName = u.name; // 初期値はDB保存名

      try {
        const member = await interaction.guild.members.fetch(u.id);
        if (member) displayName = member.displayName; // 現在のサーバーでの名前に上書き
      } catch (err) {
        // ユーザーが脱退している場合などはそのまま
      }

      text += `**${medals[i]} 第${i + 1}位：${u.lucky}回**\n${displayName}\n\n`;
    }

    const embed = new EmbedBuilder()
      .setColor(0x8B5A2B)
      .setTitle("和紙が応じたランキング")
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(text)
      .setFooter({ text: "…日頃の行いが足りないのだ" });

    return interaction.editReply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
