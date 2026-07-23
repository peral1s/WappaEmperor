const { EmbedBuilder } = require('discord.js');
const replyData = require('../data/replies');
const { getAllStats } = require('../db/database');
const tarotCards = require('../data/tarot');
const handleHarvest = require('./harvestHandler'); // 💡 追加

async function handleInteraction(interaction, client) {
  if (!interaction.isCommand()) return;

  const stats = await getAllStats();
  const { commandName } = interaction;

  // 💡 harvest コマンドの呼び出し（切り離し対応）
  if (commandName === 'harvest') {
    return handleHarvest(interaction);
  }

  // --- 以下、既存のコマンド群（tarot, log, rank, luck 等） ---


  // タロット占い機能
  if (commandName === 'tarot') {
    const card = tarotCards[Math.floor(Math.random() * tarotCards.length)];
    const isUpright = Math.random() >= 0.5;
    const positionText = isUpright ? '【正位置】' : '【逆位置】';
    const meaning = isUpright ? card.upright : card.reversed;

    const embed = new EmbedBuilder()
      .setColor(isUpright ? 0x2ECC71 : 0xE74C3C)
      .setTitle(`🔮 ${interaction.user.username}のタロット占い結果`)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(
`引いたカードはこれやな…

### **${card.name}** ${positionText}

> ${meaning}`
      )
      .setFooter({ text: '和紙のRPG、興味ある？(定期)' });

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
