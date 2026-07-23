const { EmbedBuilder } = require('discord.js');

// 🔮 タロットカード大アルカナ全22種（固有名詞なし・和紙リアル口調）
const tarotCards = [
  {
    name: '0. 愚者 (The Fool)',
    upright: '「夢なんて見ませんぜ、覚えてないなら無いのと同じ」…あ〜…うん、そうねぇ。気ままに行くのが一番よ、知らんけど。',
    reversed: '「わりぃ、やっぱ戻れねぇかもしれへん」とか言い出しそうね。迷走してるなら大人しく引き返しなさいな。'
  },
  {
    name: 'I. 魔術師 (The Magician)',
    upright: 'プログラミングやら何やらで何でも作る勢いかしら。自分の持ってる技術フル活用しときなさいとも言っとく。',
    reversed: '便利機能に頼りすぎて素の感覚消えてないかしら…？自分の本当の技術を見直しときなさい。'
  },
  {
    name: 'II. 女教皇 (The High Priestess)',
    upright: '可能な限り全ての意見を理解したいのよね。静かに観察して冷静に見極めるのが一番なのだ。',
    reversed: '深く考えすぎて頭爆発しそうねぇ。客観的に見れなくなったらおしまいよ。'
  },
  {
    name: 'III. 女帝 (The Empress)',
    upright: '「食事は娯楽、腹一杯が幸福！」ねぇ。結局美味しいものを腹一杯食べておけば満足なのよ。',
    reversed: '「準備するの、面倒すぎひん？」とか怠けてるわね。楽ばっか求めてたら美味い飯もお預けかしら。'
  },
  {
    name: 'IV. 皇帝 (The Emperor)',
    upright: '凄まじい実力者のごとき圧倒的パワーかしら。覚悟持って引っ張っていきなさい。',
    reversed: '「連帯責任のシステムって割とどうなの…」とか思われてるわよ。無理な押し付けは人が離れるのだ。'
  },
  {
    name: 'V. 法皇 (The Hierophant)',
    upright: '「周りの皆は一人一人大切だぜぇ！！」ねぇ。管理人なんて優しさ有ってなんぼなのです。',
    reversed: '「差が分からなかった…何が違うんだ」ってすれ違ってるわね。盲信するのは危ないかしら。'
  },
  {
    name: 'VI. 恋人 (The Lovers)',
    upright: '「私と言う遊び相手が出来ますぞ」って感じかしら。最高の選択ができる時よ。',
    reversed: '「趣味合いそうで何か合わない」すれ違いねぇ。無理に決めず様子見ときなさい。'
  },
  {
    name: 'VII. 戦車 (The Chariot)',
    upright: '圧倒的な勢いで爆進かしら。大技ぶち込んで勝利掴めば良いのよ。',
    reversed: '勢い余って暴走してるわね…あ〜…うん、一回水でも飲んで落ち着きなさい。'
  },
  {
    name: 'VIII. 力 (Strength)',
    upright: '「全てに耐性持っとるかな」という屈強さね。耐え抜けばこちらの勝ちよ。',
    reversed: '心に疲れこそあれど、流石に根負けしそうかしら。無理せず一回ログアウトしときなさい。'
  },
  {
    name: 'IX. 隠者 (The Hermit)',
    upright: '中二病っぽい技名とか考えながら部屋でパソコンに向かう時間かしら。「用がないなら失せろ」で集中するのよ。',
    reversed: '孤独に深入りしすぎて怪しい世界に入ってない…？引き際意識しときなさいとも言っとく。'
  },
  {
    name: 'X. 運命の輪 (Wheel of Fortune)',
    upright: '何の打ち合わせもなく全員が同じ選択するレベルの奇跡的なタイミングねぇ。乗っときなさい。',
    reversed: '帰る時間から見ても間に合わない悪タイミングかしら。無理せず明日に回すのが賢いのだ。'
  },
  {
    name: 'XI. 正義 (Justice)',
    upright: '「中立からしちゃあどちらも分からねぇ」の精神ね。客観的に判断するのが一番よ。',
    reversed: '不健全な対応で混乱してるわね。「辞めるやもしれん」となる前に見直しなさい。'
  },
  {
    name: 'XII. 吊るされた男 (The Hanged Man)',
    upright: '長い修行で力を蓄えるような耐えの時期ね。耐え抜けば化けるかしら。',
    reversed: '連続戦のボスラッシュみたいな不毛な苦行にハマってない…？無駄な縛りはやめときなさい。'
  },
  {
    name: 'XIII. 死神 (Death)',
    upright: '古い場所は捨てて全部壊すようなバッサリ完全リセットね。次行きなさい。',
    reversed: '過去の失敗とか引きずってない…？そう簡単にくたばらないし、過去は捨てなさい。'
  },
  {
    name: 'XIV. 節制 (Temperance)',
    upright: 'どんな環境にも完璧に馴染める状態かしら。調和が取れてるわよ。',
    reversed: '「自問自答の喧嘩でもしてるんか…？」って迷走してるわね。精神落ち着かせなさいな。'
  },
  {
    name: 'XV. 悪魔 (The Devil)',
    upright: '邪心の塊みたいな誘惑に注意かしら。無法地帯のノリには近づかないことね。',
    reversed: '悪い習慣や依存からスッと抜け出せる時よ。'
  },
  {
    name: 'XVI. 塔 (The Tower)',
    upright: '「…勝ったのかこれ…？」って呆然とするような大波乱かしら。覚悟しときなさい。',
    reversed: 'ギリギリのところで起死回生の回避かしらね。'
  },
  {
    name: 'XVII. 星 (The Star)',
    upright: '「自分を特別と思ってない」からこそ輝くのよ。飾り気のない素の自分で勝負しなさい。',
    reversed: '「夢がデカ過ぎるッピ」になってない…？身近な目標から確実にこなしなさいな。'
  },
  {
    name: 'XVIII. 月 (The Moon)',
    upright: '変質な奴に見られるような不透明な運気ねぇ。勘違いされないよう気をつけなさい。',
    reversed: '変な思想の誤解が晴れるみたいに、真意が見えてくる時かしら。'
  },
  {
    name: 'XIX. 太陽 (The Sun)',
    upright: '強敵をアッサリ倒した時みたいな圧倒的爽快感ね！一気に進めば良いのよ。',
    reversed: '北国の冬みたいに冷え込んでるわねぇ。おとなしくスマホでもいじっときなさい。'
  },
  {
    name: 'XX. 審判 (Judgement)',
    upright: '「お前がお前を信じれなくてどうする！！」で復活の時ね。一度諦めた事に再挑戦しなさい。',
    reversed: '「お前達が要因だ…」とか後悔ばっかしてても意味ないわよ。前見なさいな。'
  },
  {
    name: 'XXI. 世界 (The World)',
    upright: '強敵を倒した達成感と共に眠れる最高のマイルストーンね。文句なしよ。',
    reversed: '正直やり込み要素の出来が悪いと感じる物足りなさかしら。妥協せずやり切りなさい。'
  }
];

async function handleTarot(interaction) {
  const card = tarotCards[Math.floor(Math.random() * tarotCards.length)];
  const isUpright = Math.random() >= 0.5;

  const positionText = isUpright ? '【表（正位置）ね】' : '【裏（逆位置）かしら】';
  const meaning = isUpright ? card.upright : card.reversed;

  // 💡 フッター（固有名詞なし・リアル口調）
  const footers = [
    '…心に疲れこそあれど痛みをあまり抱かないのが和紙よ',
    '…食事は娯楽、腹一杯が幸福なのよ',
    '…凄まじい実力者の話をしてるのよ',
    '…和紙、３年の修行で凄いやつになるわ',
    '…まあ適応能力みたいなものかしらね',
    '…和紙、変な絡みとかしてないよな…？',
    '…他者への幸福を邪魔する様な気持ちも捨てれる事こそが第一歩なのです',
    '…和紙はどうだろ、王子じゃなくてただの王なのかしら',
    '…起死回生を狙ってますとも言っとく',
    '…そもそも和紙に個別権限なんて渡してどうしたいのだ',
    '…お前がお前を信じれなくてどうする！！',
    '…和紙は生涯誓った漢、崩せる様な人は相当な人格者でないと無理よ',
    '…あ〜…うん、そうねぇ'
  ];
  const randomFooter = footers[Math.floor(Math.random() * footers.length)];

  const embed = new EmbedBuilder()
    .setColor(isUpright ? 0x2ECC71 : 0xE74C3C)
    .setTitle(`🔮 ${interaction.user.username} の運命を和紙が占ってあげるわよ`)
    .setThumbnail(interaction.client.user.displayAvatarURL())
    .setDescription(
`和紙が引き当てたカードはこれかしら…

### **${card.name}** ${positionText}

> ${meaning}`
    )
    .setFooter({ text: randomFooter });

  return interaction.reply({ embeds: [embed] });
}

module.exports = handleTarot;
