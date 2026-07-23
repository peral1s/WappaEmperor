const { EmbedBuilder } = require('discord.js');
const replyData = require('../data/replies');
const { getAllStats } = require('../db/database');
const handleHarvest = require('./harvestHandler');

// 🔮 タロットカード大アルカナ全22種
const tarotCards = [
  { name: '0. 愚者 (The Fool)', upright: '「夢なんて見ませんぜ、覚えてないなら無いのと同じ」…あ〜…うん、そうねぇ。気ままに行くのが一番よ、知らんけど。', reversed: '「わりぃ、やっぱ戻れねぇかもしれへん」とか言い出しそうね。迷走してるなら大人しく引き返しなさいな。' },
  { name: 'I. 魔術師 (The Magician)', upright: '自分のできる事やら得意な技術で何でも生み出せる勢いかしら。手持ちの手段をフル活用しときなさいとも言っとく。', reversed: '便利機能や他人に頼りすぎて素の感覚消えてないかしら…？自分の本当の実力を見直しときなさい。' },
  { name: 'II. 女教皇 (The High Priestess)', upright: '可能な限り全ての意見を理解したいのよね。静かに観察して冷静に見極めるのが一番なのだ。', reversed: '深く考えすぎて頭爆発しそうねぇ。「作品と思って見れん」くなったらおしまいよ。' },
  { name: 'III. 女帝 (The Empress)', upright: '「食事は娯楽、腹一杯が幸福！」ねぇ。美味しいものを腹一杯食べておけば満足なのよ。', reversed: '「準備するの、面倒すぎひん？」とか怠けてるわね。楽ばっか求めてたら美味い飯もお預けかしら。' },
  { name: 'IV. 皇帝 (The Emperor)', upright: '圧倒的な貫禄とパワーかしら。自信持って周りを引っ張っていきなさい、大丈夫だと思うけど。', reversed: '「連帯責任のシステムって割とどうなの…」とか思われてるわよ。無理な押し付けは人が離れるのだ。' },
  { name: 'V. 法皇 (The Hierophant)', upright: '「周りの皆は一人一人大切だぜぇ！！」ねぇ。管理人なんて優しさ有ってなんぼなのです。', reversed: '「差が分からなかった…何が違うんだ」ってすれ違ってるわね。型にはまりすぎたり盲信するのは危ないかしら。' },
  { name: 'VI. 恋人 (The Lovers)', upright: '「私と言う遊び相手が出来ますぞ」って感じで最高の選択ができるタイミングね。直感で選びなさい。', reversed: '「趣味合いそうで何か合わない」すれ違いねぇ。無理に決めず様子見ときなさい。' },
  { name: 'VII. 戦車 (The Chariot)', upright: '圧倒的な勢いで爆進かしら。迷わず突っ込んで勝利掴めば良いのよ。', reversed: '焦って暴走しちゃいそうねぇ。…あ〜…うん、一回水でも飲んで落ち着きなさい。' },
  { name: 'VIII. 力 (Strength)', upright: '「全てに耐性持っとるかな」という屈強さね。心に疲れこそあれど、耐え抜けばこちらの勝ちよ。', reversed: '心に疲れが溜まって流石に根負けしそうかしら。無理せず一回ログアウトしときなさい。' },
  { name: 'IX. 隠者 (The Hermit)', upright: '部屋でパソコンに向かって考え事する時間かしら。「用がないなら失せろ」で集中するのよ。', reversed: '孤独に深入りしすぎて怪しい世界に入ってない…？引き際意識しときなさいとも言っとく。' },
  { name: 'X. 運命の輪 (Wheel of Fortune)', upright: '何の打ち合わせもなく全員が同じ選択するレベルの奇跡的なタイミングねぇ。乗っときなさい！', reversed: '帰る時間から見てもタイミングが噛み合わんのかなぁ。流れが悪いし、出直した方が賢いのだ。' },
  { name: 'XI. 正義 (Justice)', upright: '「中立からしちゃあどちらも分からねぇ」の精神ね。感情に流されず客観的に判断するのが一番よ。', reversed: '不健全な対応で混乱してるわね。「辞めるやもしれん」となる前に見直しなさい。' },
  { name: 'XII. 吊るされた男 (The Hanged Man)', upright: '３年修行して力を蓄えるような耐えの時期ね。じっくり耐え抜けば化けるかしら。', reversed: '不毛な苦行にハマしてない…？無駄な縛りはやめときなさい、苦しいだけよ。' },
  { name: 'XIII. 死神 (Death)', upright: '古い場所は捨ててバッサリ完全リセットね。そう簡単にくたばらないし、次行きなさい。', reversed: '過去の失敗とか引きずってない…？過去は切るのが一番よ、引きずってても意味ないのだ。' },
  { name: 'XIV. 節制 (Temperance)', upright: 'どんな環境にも完璧に馴染める状態かしら。全体の調和が取れてて良い感じよ。', reversed: '「自問自答の喧嘩でもしてるんか…？」って迷走してるわね。精神落ち着かせなさいな。' },
  { name: 'XV. 悪魔 (The Devil)', upright: '邪心の塊みたいな誘惑に注意かしら。無法地帯のノリには近づかないことね。', reversed: '悪い習慣や依存からスッと抜け出せる時よ。和紙に任せなさい、全部解決したる。' },
  { name: 'XVI. 塔 (The Tower)', upright: '「…勝ったのかこれ…？」って呆然とするような大波乱かしら。覚悟しときなさい。', reversed: 'ギリギリのところで壊滅回避かしらね。参ってるなら和紙のオリキャラに相談してみる？' },
  { name: 'XVII. 星 (The Star)', upright: '「自分を特別と思ってない」からこそ輝くのよ。飾り気のない素の自分で勝負しなさい。', reversed: '「夢がデカ過ぎるッピ」になってない…？高望みせず身近な目標から確実にこなしなさいな。' },
  { name: 'XVIII. 月 (The Moon)', upright: '変質な奴に見られるような不透明な運気ねぇ。勘違いされないよう気をつけなさい。', reversed: '変な思想の誤解が晴れるみたいに、不透明だった霧が晴れて真意が見えてくる時かしら。' },
  { name: 'XIX. 太陽 (The Sun)', upright: '強敵をアッサリ倒した時みたいな圧倒的爽快感ね！こんな時間まで起きててよく活動出来るなってくらい絶好調よ。', reversed: '北国の冬みたいに冷え込んでるわねぇ。おとなしくスマホでもいじっときなさい。' },
  { name: 'XX. 審判 (Judgement)', upright: '「お前がお前を信じれなくてどうする！！」で復活の時ね。一度諦めた事に再挑戦しなさい。', reversed: '「お前達が要因だ…」とか後悔ばっかしてても意味ないわよ。前見なさいな。' },
  { name: 'XXI. 世界 (The World)', upright: '達成感と共に眠れる最高のマイルストーンね。文句なしのコンディションかしら。', reversed: '物足りなさで足踏みしてんのかなぁ。詰まってるなら和紙に送りなさい、全部潰したる。' }
];

async function handleInteraction(interaction, client) {
  if (!interaction.isCommand()) return;

  const stats = await getAllStats();
  const { commandName } = interaction;

  // harvest コマンド
  if (commandName === 'harvest') {
    return handleHarvest(interaction);
  }

  // tarot コマンド（インライン化）
  if (commandName === 'tarot') {
    const card = tarotCards[Math.floor(Math.random() * tarotCards.length)];
    const isUpright = Math.random() >= 0.5;
    const positionText = isUpright ? '【表（正位置）ね】' : '【裏（逆位置）かしら】';
    const meaning = isUpright ? card.upright : card.reversed;

    const footers = [
      '…何かあったら和紙に言いなさい、全部潰したる。',
      '…心に疲れこそあれど痛みをあまり抱かないのが和紙よ',
      '…食事は娯楽、腹一杯が幸福なのよ',
      '…和紙、変な絡みとかしてないよな…？',
      '…他者への幸福を邪魔する様な気持ちも捨てれる事こそが第一歩なのです',
      '…和紙はどうだろ、王子じゃなくてただの王なのかしら',
      '…起死回生を狙ってますとも言っとく',
      '…そもそも和紙に個別権限なんて渡してどうしたいのだ',
      '…お前がお前を信じれなくてどうする！！',
      '…あ〜…うん、そうねぇ',
      '…和紙に任せなさい、全部解決したる。'
    ];
    const randomFooter = footers[Math.floor(Math.random() * footers.length)];

    const embed = new EmbedBuilder()
      .setColor(isUpright ? 0x2ECC71 : 0xE74C3C)
      .setTitle(`🔮 ${interaction.user.username} の運命を和紙が占ってあげるわよ`)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(
`和紙が引き当てたカードはこれかしら…

### **${card.name}** ${positionText}

> ${meaning}`
      )
      .setFooter({ text: randomFooter });

    return interaction.reply({ embeds: [embed] });
  }

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
    const reply = replyData.tomatoReplies[Math.floor(Math.random() * replyData.tomatoReplies.length)];
    return interaction.reply({ content: reply });
  }

  if (commandName === 'kiwi') {
    return interaction.reply({ content: 'きぅいくってー\nあげりしゃすーwwwあげりしゃすーwww\nあげあげりしゃすーwww\nきぶんをあげるでりしゃすなきぅいーwww\nあげりしゃすーwww\nあげあげりしゃすーwww' });
  }

  if (commandName === 'asa') {
    return interaction.reply({ content: 'あーたーらしーいーあーさがっきったwww\nきぼーおのっあーさーだwww\nよろこーびにむねをひーらけwww\nおーぞーらあーおーげーwww\nらーじおーのーこーえにーwww\nすこやーかなーむーねをーwww\nこのかっおーるかっぜーにひらーけよwww\nそれいっちにっさーんwwwww' });
  }

  if (commandName === 'ao') {
    const reply = replyData.aoReplies[Math.floor(Math.random() * replyData.aoReplies.length)];
    return interaction.reply({ content: reply });
  }
  
  if (commandName === 'all') {
    const reply = replyData.replies[Math.floor(Math.random() * replyData.replies.length)];
    return interaction.reply({ content: reply });
  }
  
  if (commandName === 'wappa') {
    const reply = replyData.adaReplies[Math.floor(Math.random() * replyData.adaReplies.length)];
    return interaction.reply({ content: reply });
  }

  if (commandName === 'cpc') {
    const reply = replyData.helloReplies[Math.floor(Math.random() * replyData.helloReplies.length)];
    return interaction.reply({ content: reply });
  }

  if (commandName === 'gal_tomato') {
    if (Math.random() < 0.01) {
      await interaction.reply({ content: `真・最終話 童帝\n???「童帝と名乗るのは求める事すら捨てた者達のみ、邪念が有るなら消し去る事を極めてから申しなさい」\n\n全てを失ったジェヨンの元に、どこからともなく、一人の老人がジェヨンの前へ静かに降り立った。\n\n???「…もう一度、やり直す覚悟は…お有りかしら？」\n\nジェヨンは目を見開く。\n\n「あ、貴方は…」\n\n老人は穏やかに微笑み、こう言った。\n\n「和紙は生涯童帝を誓った漢,崩せる様な人は相当な人格者で無いと無理よ」\n\nそう言うと、老人は指を鳴らした。\n\n次の瞬間、世界がきしむような音を立て、時間そのものが逆行を始める。\n\n???「あ、和紙はレズもせーへきにはなりません」\n\nそんなことを話している間に時間逆行は完了し\n気がつくと俺は、トマトと幸せに暮らしていたあの頃へ戻っていた。\n\n???「他者への幸福を邪魔する様な気持ちも捨てれる事こそが童帝の第一歩なのです」\n\n慢して少しだけ表情を険しくし、静かに続けた。\n\n「……その幸せを邪魔するような不届き者は――」\n\n老人は再び指を鳴らし、不敵に笑う。\n\n???「…和紙が犯す」` });

      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 30000);
      return;
    }

    const reply = replyData.gyarutomatoReplies[Math.floor(Math.random() * replyData.gyarutomatoReplies.length)];
    return interaction.reply({ content: reply });
  }

  // 記憶追加用コマンドの一括処理
  const addCommands = ['addall', 'addwappa', 'addtomato', 'addao', 'addcpc', 'addgal_tomato'];

  if (addCommands.includes(commandName)) {
    const allowedUsers = ['768022305279574067'];

    if (!allowedUsers.includes(interaction.user.id)) {
      return interaction.reply({ 
        content: '…貴方に和紙の記憶を弄る素質がないんだにょwww 出直してくるのだ', 
        ephemeral: true 
      });
    }

    const newWord = interaction.options.getString('word');
    let targetName = '';

    if (commandName === 'addall') {
      replyData.replies.push(newWord);
      targetName = '全体（all）';
    } else if (commandName === 'addwappa') {
      replyData.adaReplies.push(newWord);
      targetName = '和紙（wappa）';
    } else if (commandName === 'addtomato') {
      replyData.tomatoReplies.push(newWord);
      targetName = '的トマト（tomato）';
    } else if (commandName === 'addao') {
      replyData.aoReplies.push(newWord);
      targetName = 'あお（ao）';
    } else if (commandName === 'addcpc') {
      replyData.helloReplies.push(newWord);
      targetName = 'カートゥーンポテチ（cpc）';
    } else if (commandName === 'addgal_tomato') {
      replyData.gyarutomatoReplies.push(newWord);
      targetName = 'ギャルトマト列伝（gal_tomato）';
    }

    return interaction.reply({ 
      content: `…「${newWord}」を和紙の【${targetName}】の記憶に刻んだのだ。次から喋るかもしれないのだ` 
    });
  }
}

module.exports = handleInteraction;
