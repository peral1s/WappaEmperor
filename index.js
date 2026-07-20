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

// ==========================================
// 返信データ配列群
// ==========================================
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
  '高校の部活に入らせてもらった時も先輩に「ガリくん」って言うガリガリくんの下位互換みたいな名前で呼ばれてた',
  'なんか給食のシチューに米じゃなくてパン出てる時ぐらいモヤモヤする',
  'あおとkannが合体したら青姦',
  'yougaいなゲイ',
  'オナリスト 〜シコの流儀〜',
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
  '収録10時からで今の午前寝落ち(4時)',
  '毛根はもう来んで',
  '毛根、もうこんだけしかないんか…',
  '水酸化物イオンの覚え方\n『おぉえっちじゃない…🙃』',
  'ちな臭素はBr-やからうんこと掛けてブリーwwwwで覚えれる',
  'うどんもえろもぶっかけが一番んだよな',
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
  '政府の陰謀\n政府の陰謀\nファイブ自慰\nファイブ自慰',
  '真のドパガキは早漏',
  '<@1388807489012633700>だから童帝誓ってもなんのデメリットも無いに決まってんだろ常識的に考えて',
  'まじギュンギュンギュン搾りすぎて乳\nどれだけ絞られる気なの？\nああ、君が非処女だなんてさぁ…\n理性持たない',
  'ドパガキ格付チェック中のGACKTのモノマネ\nﾝﾝﾝﾝﾝあアアアきぃぃんもちいいいあえええええええ',
  'https://cdn.discordapp.com/attachments/1193815699630592160/1512178331473154298/IMG_2862.jpg?ex=6a232551&is=6a21d3d1&hm=d0d855c65ed1572f3dc6dd6acb9072610aab66631e6f845ed4a6dd64a68d3ee2&'
];

const tomatoReplies = [
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
  '政府の陰謀\n政府の陰謀\nファイブ自慰\nファイブ自慰',
  'オナリスト 〜シコの流儀〜',
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

const hnnskReplies = [
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

const aoReplies = [
  'https://cdn.discordapp.com/attachments/1510191966942531746/1525782900627472384/IMG_4204.png?ex=6a54a38f&is=6a53520f&hm=7151eed0030aecaf44462453138fa115bfe911cdc9be85980e08fa6c075326eb&',
  '怒ったかんな？許さないかんな？\n# 瀬戸環奈',
  `怒ったかんな
許さないかんな
あそこパッカーンな`,
  '高校の部活に入らせてもらった時も先輩に「ガリくん」って言うガリガリくんの下位互換みたいな名前で呼ばれてた',
  'なんか給食のシチューに米じゃなくてパン出てる時くらいモヤモヤした',
  '俺が友達(男子)に告白しようとしてたのに観覧車に無理やり入ってきて奪われた',
  'あおとkannが合体したら青姦',
  '女性と一夜を過〜ごし〜たら〜\nゴムを忘れてました〜\n# 着床‼️‼️\n 子"埋め"大夫'
];

const adaReplies = [
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
  'そーいやRPGって得意？(唐探)',
  'https://plicy.net/GamePlay/180908'
];

const gyarutomatoReplies = [
  `第一話 悪癖
・私、彼氏いるので。
・やめてください！警察呼びますよ！`,
  `第二話 狡猾
・そんなつもりじゃ…ごめんなさい…
・え…お詫び…？それぐらいなら…`,
  `第三話 撮影
・やめて！そんなこと嫌してない！もう終わりでしょ！
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

const helloReplies = [
  '「カートゥーンポテチ、起動ッ！\nサクサク参上、悪いやつらは塩対応だぜ！」',
  '「オイル満タン！テンション全開！\nオレはカートゥーンポテチ！今日も世界をカリッと守る！」',
  '「ポテチだからってナメんなよ？\nこの一枚一枚に、正義が詰まってるんだ！」',
  '「警告。ポテチ泥棒を検知。\n――排除モード、パリパリ起動。」',
  '「やあもつ楽民！\n笑いと炭水化物を届けに来た、カートゥーンポテチだ！」',
  '「バリッと変形！\nスナック界最強ロボ、カートゥーンポテチ参上！！」',
  '「賞味期限？そんなものは超えてきた。\n未来から来たポテチ型ロボ、カートゥーンポテチだ。」',
  '「ポテチの魂、メカの力！\n合体ヒーロー・カートゥーンポテチ、オンステージ！」'
];

// ==========================================
// データベース関数
// ==========================================
async function getAllStats() {
  const docs = await statsCollection.find().toArray();
  const stats = {};
  for (const doc of docs) {
    stats[doc._id] = {
      id: doc._id,
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

// ==========================================
// Bot準備完了 & スラッシュコマンド登録
// ==========================================
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
        option.setName('user').setDescription('誰の記録を見たいのだ').setRequired(false)
      ),
    new SlashCommandBuilder().setName('rank').setDescription('和紙を呼び出したランキングを見れるのだ'),
    new SlashCommandBuilder().setName('luck').setDescription('和紙が応じたランキングを見れるのだ'),
    
    new SlashCommandBuilder().setName('tomato').setDescription('…的トマトの歴史なのだ'),
    new SlashCommandBuilder().setName('kiwi').setDescription('…和紙がきぅいの歌を歌うのだ'),
    new SlashCommandBuilder().setName('asa').setDescription('…忘れ去られし朝の歌を独唱するのだ'),
    new SlashCommandBuilder().setName('ao').setDescription('…あおの黒歴史図鑑なのだ'),
    
    new SlashCommandBuilder().setName('all').setDescription('…和紙の、歴史…なのだ'),
    new SlashCommandBuilder().setName('wappa').setDescription('…貴方RPG、興味ある？'),
    new SlashCommandBuilder().setName('cpc').setDescription('…カートゥーンポテチが起動するのだ'),
    new SlashCommandBuilder().setName('gal_tomato').setDescription('…ギャルトマト列伝なのだ 1%で真最終話!?'),

    // 【新規追加】記憶追加用コマンド群
    new SlashCommandBuilder().setName('addall').setDescription('…all（全体返信）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
    new SlashCommandBuilder().setName('addwappa').setDescription('…wappa（RPG）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
    new SlashCommandBuilder().setName('addtomato').setDescription('…tomatoに新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
    new SlashCommandBuilder().setName('addao').setDescription('…ao（黒歴史）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
    new SlashCommandBuilder().setName('addcpc').setDescription('…cpc（ポテチロボ）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
    new SlashCommandBuilder().setName('addgal_tomato').setDescription('…gal_tomato（ギャルトマト）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true))
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands }
  );

  console.log('スラッシュコマンド登録完了');
});

// ==========================================
// メッセージ監視（キーワード・自動応答）
// ==========================================
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  console.log(`チャンネル:${message.channel.name} ID:${message.channel.id}`);

  if (!message.guild) return;

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

  // 全体ランダム返信（1%）
  if (Math.random() < 0.01) {
    const luckyReply = replies[Math.floor(Math.random() * replies.length)];
    await message.reply(luckyReply);
    await updateUserStats(id, username, 'lucky'); 
    console.log(`🎉 全体LUCKY発動・記録: ${username}`);
  }

  // 和紙メンション処理
  if (!message.reference && message.mentions.users.has(client.user.id)) {
    const mainReply = replies[Math.floor(Math.random() * replies.length)];
    await message.channel.send(mainReply);
    await updateUserStats(id, username, 'mention');
    console.log(`✅ 和紙メンション: ${username}`);
  }
  
  // キーワード判定
  if (message.content.includes('のだ')) {
    message.channel.send('ずんだもんみたいな語尾やめるのだ');
  }

  if (message.content.includes('トマトの偉大さ')) {
    message.channel.send('そんなものないよおおおんwwwww');
  }

  if (message.content.includes('洋楽')) {
    message.channel.send('yougaく');
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
    message.channel.send('彼女を検出！！！！！！\n嫉嫉妬モード発動！！！！！\nンニィィィィィィィィィィィィィ');
  }

  const sexWords = ['セックス', 'サックス', 'シックス', 'ソックス', 'せっくす', 'sax', 'six', 'sex', 'sox', 'せくす', 'セクス', 'せくしー', 'セクシー'];
  if (sexWords.some(word => content.includes(word))) {
    message.channel.send('# セックスを検出‼️\n-# 汚い言葉が好きな人はちょっと…和紙達お紳士なので…');
  }

  const fellaWords = ['ふぇら', 'フェラ', 'フエラ', 'ふえら', 'fella'];
  if (fellaWords.some(word => content.includes(word))) {
    message.channel.send('フェラを検出‼️\n-# 汚い言葉が好きな人はちょっと…和紙達お紳士なので…');
  }
  
  if (message.content.includes('/はっぴぃ')) {
    message.channel.send('ﾄﾞﾗｺﾞｫﾝｯwﾎﾞｫｫﾙwｵﾚﾊﾀｲﾖｳw\nﾄﾞﾗｺﾞｫﾝｯwﾎﾞｫｫﾙwｵﾏｴﾊﾂｷw\nﾄｹｱｴﾊﾞｧwｷｨｾｪｷｨﾉｫﾊﾟﾜｧｧｧw\nｻｲｷｮｫﾉwﾌｭｰｼﾞｮﾝｯｯｯｯw');
  }

  if (message.content.includes('/6号')) {
    message.channel.send('よしかるを検出‼️');
  }

  if (message.content.includes('/レモブル')) {
    message.channel.send('6号を検出‼️');
  }

  if (message.content.includes('/よしかる')) {
    message.channel.send('レモブルを検出‼️');
  }

  if (content.includes('/flatbread')) {
    const reply = hnnskReplies[Math.floor(Math.random() * hnnskReplies.length)];
    message.channel.send(reply);
  }

  if (message.content.includes('/二ドアイ')) {
    message.channel.send('https://cdn.discordapp.com/attachments/1502569232574058637/1512178975886020710/quote_1503055273198354665.png?ex=6a2325ea&is=6a21d46a&hm=436269d39b10d87e66e299c4991816f7263fa0a450656d1271fcab11163fd1e0&');
  }
});

// ==========================================
// スラッシュコマンドの実行処理
// ==========================================
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const stats = await getAllStats();
  const { commandName } = interaction;

  if (commandName === 'log') {
    const target = interaction.options.getUser('user') || interaction.user;
    const data = stats[target.id];

    if (!data) {
      return interaction.reply({
        content: '…和紙をまだ呼び出していないのだ',
        ephemeral: true
      });
    }

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

  if (commandName === 'rank') {
    await interaction.deferReply();
    const ranking = Object.values(stats).sort((a, b) => b.mention - a.mention).slice(0, 5);
    const total = Object.values(stats).reduce((sum, u) => sum + u.mention, 0);
    const medals = ["🥇", "🥈", "🥉", "🏅", "🏅"];
    let text = `累計 **${total}**回 和紙を呼び出したのだ\n\n`;

    for (let i = 0; i < ranking.length; i++) {
      const u = ranking[i];
      let displayName = u.name;
      try {
        const member = await interaction.guild.members.fetch(u.id);
        if (member) displayName = member.displayName;
      } catch (err) {}
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

  if (commandName === 'luck') {
    await interaction.deferReply();
    const ranking = Object.values(stats).sort((a, b) => b.lucky - a.lucky).filter(u => u.lucky > 0).slice(0, 5);
    const total = Object.values(stats).reduce((sum, u) => sum + u.lucky, 0);
    const medals = ["🥇", "🥈", "🥉", "🏅", "🏅"];
    let text = `累計 **${total}**回 和紙が応じてあげたのだ\n\n`;

    for (let i = 0; i < ranking.length; i++) {
      const u = ranking[i];
      let displayName = u.name;
      try {
        const member = await interaction.guild.members.fetch(u.id);
        if (member) displayName = member.displayName;
      } catch (err) {}
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

  if (commandName === 'tomato') {
    const reply = tomatoReplies[Math.floor(Math.random() * tomatoReplies.length)];
    return interaction.reply({ content: reply });
  }

  if (commandName === 'kiwi') {
    return interaction.reply({ content: 'きぅいくってー\nあげりしゃすーwwwあげりしゃすーwww\nあげあげりしゃすーwww\nきぶんをあげるでりしゃすなきぅいーwww\nあげりしゃすーwww\nあげあげりしゃすーwww' });
  }

  if (commandName === 'asa') {
    return interaction.reply({ content: 'あーたーらしーいーあーさがっきったwww\nきぼーおのっあーさーだwww\nよろこーびにむねをひーらけwww\nおーぞーらあーおーげーwww\nらーじおーのーこーえにーwww\nすこやーかなーむーねをーwww\nこのかっおーるかっぜーにひらーけよwww\nそれいっちにっさーんwwwww' });
  }

  if (commandName === 'ao') {
    const reply = aoReplies[Math.floor(Math.random() * aoReplies.length)];
    return interaction.reply({ content: reply });
  }
  
  if (commandName === 'all') {
    const reply = replies[Math.floor(Math.random() * replies.length)];
    return interaction.reply({ content: reply });
  }
  
  if (commandName === 'wappa') {
    const reply = adaReplies[Math.floor(Math.random() * adaReplies.length)];
    return interaction.reply({ content: reply });
  }

  if (commandName === 'cpc') {
    const reply = helloReplies[Math.floor(Math.random() * helloReplies.length)];
    return interaction.reply({ content: reply });
  }

  if (commandName === 'gal_tomato') {
    // 1%の確率で発動する隠し演出
    if (Math.random() < 0.01) {
      await interaction.reply({ content: `真・最終話 童帝\n???「童帝と名乗るのは求める事すら捨てた者達のみ、邪念が有るなら消し去る事を極めてから申しなさい」\n\n全てを失ったジェヨンの元に、どこからともなく、一人の老人がジェヨンの前へ静かに降り立った。\n\n???「…もう一度、やり直す覚悟は…お有りかしら？」\n\nジェヨンは目を見開く。\n\n「あ、貴方は…」\n\n老人は穏やかに微笑み、こう言った。\n\n「和紙は生涯童帝を誓った漢,崩せる様な人は相当な人格者で無いと無理よ」\n\nそう言うと、老人は指を一度だけ鳴らした。\n\n次の瞬間、世界がきしむような音を立て、時間そのものが逆行を始める。\n\n???「あ、和紙はレズもせーへきにはなりません」\n\nそんなことを話している間に時間逆行は完了し\n気がつくと俺は、トマトと幸せに暮らしていたあの頃へ戻っていた。\n\n???「他者への幸福を邪魔する様な気持ちも捨てれる事こそが童帝の第一歩なのです」\n\n慢して少しだけ表情を険しくし、静かに続けた。\n\n「……その幸せを邪魔するような不届き者は――」\n\n老人は再び指を鳴らし、不敵に笑う。\n\n???「…和紙が犯す` });

      // 30秒後にメッセージを自動削除
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 30000);
      return;
    }

    const reply = gyarutomatoReplies[Math.floor(Math.random() * gyarutomatoReplies.length)];
    return interaction.reply({ content: reply });
  }

  // ==========================================
  // 【新規追加】記憶追加用コマンドの一括処理（ID制限付き）
  // ==========================================
  const addCommands = ['addall', 'addwappa', 'addtomato', 'addao', 'addcpc', 'addgal_tomato'];

  if (addCommands.includes(commandName)) {
    // 🔒 あなたのユーザーIDのみ実行を許可
    const allowedUsers = ['768022305279574067'];

    if (!allowedUsers.includes(interaction.user.id)) {
      return interaction.reply({ 
        content: '…貴方に和紙の記憶を弄る素質がないんだにょwww 出直してくるのだ', 
        ephemeral: true 
      });
    }

    const newWord = interaction.options.getString('word');
    let targetName = '';

    // コマンド名に応じて対応する配列に push する
    if (commandName === 'addall') {
      replies.push(newWord);
      targetName = '全体（all）';
    } else if (commandName === 'addwappa') {
      adaReplies.push(newWord);
      targetName = '和紙（wappa）';
    } else if (commandName === 'addtomato') {
      tomatoReplies.push(newWord);
      targetName = '的トマト（tomato）';
    } else if (commandName === 'addao') {
      aoReplies.push(newWord);
      targetName = 'あお（ao）';
    } else if (commandName === 'addcpc') {
      helloReplies.push(newWord);
      targetName = 'カートゥーンポテチ（cpc）';
    } else if (commandName === 'addgal_tomato') {
      gyarutomatoReplies.push(newWord);
      targetName = 'ギャルトマト列伝（gal_tomato）';
    }

    return interaction.reply({ 
      content: `…「${newWord}」を和紙の【${targetName}】の記憶に刻んだのだ。次から喋るかもしれないのだ` 
    });
  }
});

client.login(process.env.TOKEN);
