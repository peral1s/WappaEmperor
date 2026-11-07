const { EmbedBuilder } = require('discord.js');

const zodiacSigns = [
  { name: 'おひつじ座', emoji: '♈' },
  { name: 'おうし座', emoji: '♉' },
  { name: 'ふたご座', emoji: '♊' },
  { name: 'かに座', emoji: '♋' },
  { name: 'しし座', emoji: '♌' },
  { name: 'おとめ座', emoji: '♍' },
  { name: 'てんびん座', emoji: '♎' },
  { name: 'さそり座', emoji: '♏' },
  { name: 'いて座', emoji: '♐' },
  { name: 'やぎ座', emoji: '♑' },
  { name: 'みずがめ座', emoji: '♒' },
  { name: 'うお座', emoji: '♓' }
];

const bloodTypes = ['A型', 'B型', 'O型', 'AB型'];

const dailyMessages = [
  '思い切った一歩が、思いがけない幸運を連れてくるのだ！',
  '貴方の気配りが誰かを救う日。さりげない優しさを忘れずにぞい。',
  '今日は直感を信じてよし。迷ったら心が弾む方を選ぶのだ。',
  '小さな発見が大きな成果につながりそう。周りをよく見てみるのだ。',
  '人との会話に幸運の種があるぞい。いつもより少し話してみなさい。',
  '積み重ねてきた努力が形になりそう。自分を褒めてやるのだ。',
  '新しいことを始めるのに良い日。完璧を待たずに動くのですぞ。',
  '焦らず一つずつ片付ければ大丈夫。和紙も見守っておるのだ。',
  '意外な人から良い知らせが届くかも。通知を見逃すでないぞい。',
  '今日は聞き役に回ると吉。相手の言葉に大事なヒントがあるのだ。',
  'いつもと違う道に幸運あり。少しだけ寄り道してみるのもよいぞ。',
  '休息も立派な作戦なのだ。無理をする前に一息つくのですぞ。',
  '気になっていたことに手をつける好機。最初の પાંચ分だけでも始めるのだ。',
  '丁寧な確認がトラブルを防ぐ日。送信ボタンを押す前に見直すぞい。',
  '笑顔が幸運を呼び込むのだ。まずは貴方からご機嫌でいなさい。',
  '欲しかった情報が見つかりそう。諦めずにもう一度探してみるのだ。',
  '協力すると運気上昇。ひとりで抱え込まず頼ってみるのですぞ。',
  '今日は整理整頓が吉。机も気持ちもすっきりさせるのだ。',
  '過去の経験が役に立つ日。以前の自分を信じて進むぞい。',
  '気負わなくてよいのだ。自然体の貴方が一番魅力的なのですぞ。',
  'ひらめきをメモしておくと吉。後で大きな助けになるかもしれん。',
  'いつもより早めの行動が幸運の鍵。余裕を持って出発するのだ。',
  '今日は挑戦が実を結びそう。失敗を恐れず試してみるぞい。',
  '身近な人への感謝を伝えると吉。言葉にするのが大切なのだ。',
  '一度立ち止まることで正解が見える日。急がば回れ、ですぞ。',
  '好きなことに触れる時間を作るのだ。心の充電を忘れるでないぞ。',
  '予想外の展開も楽しむが吉。柔軟に対応すれば問題ないのだ。',
  '細かな節約が後の余裕につながる日。財布の紐はほどほどにぞい。',
  '自分の考えを伝えると道が開けそう。遠慮しすぎなくてよいのだ。',
  '今日は早寝早起きが味方。生活リズムを整えてみるのですぞ。',
  '身の回りの変化に注目するのだ。幸運のきっかけはすぐそばにあるぞい。',
  '苦手なことも小分けにすれば進められる。まず一つだけ片付けるのだ。',
  '誰かの助言に耳を傾けると吉。意外な視点が見つかるかもしれん。',
  '今日は勝負どころ。準備してきたことを堂々と出すのですぞ！',
  '無理に答えを出さなくてもよい日。少し寝かせるのも賢い選択なのだ。',
  '思い出話に花が咲きそう。懐かしい人に連絡してみるのもよいぞ。',
  '丁寧な仕事が評価される日。最後のひと手間を惜しまないのだ。',
  '新しい視点を取り入れると吉。いつもの方法を少し変えてみるぞい。',
  '今日は自分のペースを守るのだ。周りと比べる必要はないのですぞ。',
  '小さな親切が巡り巡って返ってくる日。見返りを求めず動くのだ。',
  '予定に余白を作ると幸運あり。詰め込みすぎには注意するぞい。',
  '気になったことは調べてみるのだ。知識が貴方の武器になるぞ。',
  '今日は笑いが運気を上げる日。くだらない話も大切にするのですぞ。',
  '迷ったときは基本に戻るのだ。案外それが一番の近道かもしれん。',
  '頑張りすぎ注意報。今日は自分を甘やかす時間も必要なのだ。',
  '誠実な対応が信頼につながる日。約束はきっちり守るぞい。',
  '明日の準備を少し進めると吉。未来の貴方が感謝するのだ。',
  '貴方らしさを隠す必要はないぞい。そのままで進めばよいのだ。'
];

function getJapanDate() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function createDailyRanking(date) {
  // 日付から乱数を作るため、同じ日は全員同じランキングになる
  let seed = 2166136261;
  for (const char of date) {
    seed ^= char.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }

  const random = () => {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  const combinations = zodiacSigns.flatMap(sign =>
    bloodTypes.map(blood => ({
      sign: sign.name,
      emoji: sign.emoji,
      blood
    }))
  );

  for (let i = combinations.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [combinations[i], combinations[j]] = [combinations[j], combinations[i]];
  }

  return combinations.map((item, index) => ({
    ...item,
    rank: index + 1,
    message: dailyMessages[index]
  }));
}

async function handleHoroscope(interaction) {
  const sign = interaction.options.getString('zodiac');
  const blood = interaction.options.getString('blood');
  const date = getJapanDate();
  const ranking = createDailyRanking(date);
  const result = ranking.find(item => item.sign === sign && item.blood === blood);

  if (!result) {
    return interaction.reply({
      content: 'むむ……星の並びを読み取れなかったのだ。もう一度試すのですぞ。',
      ephemeral: true
    });
  }

  const rankColor = result.rank <= 5
    ? 0xF1C40F
    : result.rank <= 15
      ? 0x2ECC71
      : result.rank <= 30
        ? 0x3498DB
        : 0x7F8C8D;

  const rankLabel = result.rank <= 3
    ? '絶好調！'
    : result.rank <= 12
      ? 'かなり良い感じ'
      : result.rank <= 24
        ? 'まずまず'
        : result.rank <= 36
          ? '焦らずいこう'
          : '明日に期待なのだ';

  const embed = new EmbedBuilder()
    .setColor(rankColor)
    .setTitle('🔮 今日の星座×血液型占い')
    .setDescription(
      `**${date.replace(/-/g, '/')} の運勢なのだ**\n\n` +
      `# 第${result.rank}位\n` +
      `## ${result.emoji} ${result.sign} × ${result.blood}\n` +
      `**${rankLabel}**\n\n` +
      `**💬 ゆーがのひと言**\n> ${result.message}`
    )
    .setFooter({ text: '全48通りの日替わりランキングなのだ｜毎日0時（日本時間）更新' });

  return interaction.reply({ embeds: [embed] });
}

module.exports = { handleHoroscope, zodiacSigns, bloodTypes, createDailyRanking };
