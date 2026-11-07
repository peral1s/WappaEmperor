const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const replyData = require('../data/replies');

const {
  getAllStats,
  addDisabledChannel,
  removeDisabledChannel,
  addCustomReply,
  removeCustomReply,
  getCustomReplies,
  removeCustomReplyForUndo,
  createReplyUndoAction,
  undoReplyAction
} = require('../db/database');

const handleHarvest = require('./harvestHandler');
const handleTarot = require('../data/tarot');
const { createFortune } = require('../data/fortuneGenerator');
const { handleHoroscope } = require('../data/horoscope');
const { startPoker, handlePokerInteraction } = require('./pokerHandler');

// 返信カテゴリーと元データの対応
const replyCategories = {
  all: 'replies',
  tomato: 'tomatoReplies',
  ao: 'aoReplies',
  wappa: 'adaReplies',
  mgm: 'megamiReplies',
  cpc: 'helloReplies',
  gal_tomato: 'gyarutomatoReplies'
};

// DBの追加文章と元の返信文章を合体させる
async function getReplyList(category) {
  const originalReplies = replyData[category] || [];
  const customReplies = await getCustomReplies(category);

  return [...originalReplies, ...customReplies];
}

// ランダム返信を取得
async function getRandomReply(category) {
  const replies = await getReplyList(category);

  if (replies.length === 0) {
    return '…まだ記憶がないのだ';
  }

  return replies[Math.floor(Math.random() * replies.length)];
}

async function handleReplyButtons(interaction) {
  const [action, token, ownerId] = interaction.customId.split(':');

  if (action === 'reply_delete') {
    if (interaction.user.id !== token) {
      return interaction.reply({ content: 'この操作を実行した本人だけが使えるのだ。', ephemeral: true });
    }
    await interaction.deferUpdate();
    return interaction.message.delete().catch(() => {});
  }

  if (action === 'reply_undo') {
    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: 'この操作を実行した本人だけが使えるのだ。', ephemeral: true });
    }

    const result = await undoReplyAction(token, ownerId);
    if (!result) {
      return interaction.reply({ content: '…この操作は既に取り消されたか、有効期限が切れているのだ。', ephemeral: true });
    }

    const deleteRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`reply_delete:${ownerId}`)
        .setLabel('このメッセージを削除')
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Secondary)
    );

    return interaction.update({
      content: result === 'add'
        ? '↩️ 追加した記憶を取り消したのだ。'
        : '↩️ 削除した記憶を復元したのだ。',
      components: [deleteRow]
    });
  }
}

function createReplyActionRow(token, userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`reply_undo:${token}:${userId}`)
      .setLabel('操作を取り消す')
      .setEmoji('↩️')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`reply_delete:${userId}`)
      .setLabel('このメッセージを削除')
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Secondary)
  );
}

async function handleInteraction(interaction, client) {
  if ((interaction.isButton() || interaction.isStringSelectMenu()) && interaction.customId.startsWith('poker_')) return handlePokerInteraction(interaction);
  if (interaction.isButton()) return handleReplyButtons(interaction);
  // /rem... の入力候補をMongoDBから取得
  if (interaction.isAutocomplete()) {
    const autocompleteCategories = {
      remall: 'replies',
      remwappa: 'adaReplies',
      remtomato: 'tomatoReplies',
      remao: 'aoReplies',
      remcpc: 'helloReplies',
      remmgm: 'megamiReplies',
      remgal_tomato: 'gyarutomatoReplies'
    };

    const category = autocompleteCategories[interaction.commandName];
    if (!category) return interaction.respond([]);

    const allowedUsers = ['768022305279574067'];
    if (!allowedUsers.includes(interaction.user.id)) {
      return interaction.respond([]);
    }

    const focused = interaction.options.getFocused();
    const customReplies = await getCustomReplies(category);
    const normalized = focused.toLocaleLowerCase();
    const choices = [...new Set(customReplies)]
      .filter(word => word.toLocaleLowerCase().includes(normalized))
      .filter(word => word.length <= 100)
      .slice(0, 25)
      .map(word => ({ name: word, value: word }));

    return interaction.respond(choices);
  }

  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  // 🛑 出現無効化コマンド (/leave)
  if (commandName === 'leave') {
    const targetChannel = interaction.options.getChannel('channel');

    if (!targetChannel) {
      return interaction.reply({
        content: '…チャンネルを指定するのだ',
        ephemeral: true
      });
    }

    await addDisabledChannel(targetChannel.id);

    return interaction.reply({
      content: `…**<#${targetChannel.id}>** では今後和紙が出現しないように設定したのだ。…和紙、嫌われてるんかなぁ`
    });
  }

  // 🟢 出現再有効化コマンド (/unleave)
  if (commandName === 'unleave') {
    const targetChannel = interaction.options.getChannel('channel');

    if (!targetChannel) {
      return interaction.reply({
        content: '…チャンネルを指定するのだ',
        ephemeral: true
      });
    }

    await removeDisabledChannel(targetChannel.id);

    return interaction.reply({
      content: `…**<#${targetChannel.id}>** で再び和紙が出現するように設定したのだ！`
    });
  }

  // 5カードドロー
  if (commandName === 'poker') return startPoker(interaction);

  // 発言ログ抽出
  if (commandName === 'harvest') {
    return handleHarvest(interaction);
  }

  // タロット占い
  if (commandName === 'tarot') {
    return handleTarot(interaction, client);
  }

  // 星座×血液型の今日の運勢
  if (commandName === 'horo') {
    return handleHoroscope(interaction);
  }

  // 和紙のおみくじ・恋みくじ
  if (commandName === 'omikuji' || commandName === 'koi') {
    const isLove = commandName === 'koi';
    const fortune = createFortune(isLove);
    const avatarUrl = interaction.client?.user?.displayAvatarURL() ||
      (client && client.user ? client.user.displayAvatarURL() : '');

    // タイトル左端に絵文字を固定し、運勢名は太字、本文はタロット同様の引用線で表示
    const quotedDescription = fortune.description
      .split('\n\n')
      .map(paragraph => `> ${paragraph.replace(/\n/g, '\n> ')}`)
      .join('\n> \n');

    const embed = new EmbedBuilder()
      .setColor(fortune.color)
      .setTitle(`${isLove ? '💗' : '🥠'} ${interaction.user.username}の運勢`)
      .setThumbnail(avatarUrl)
      .setDescription(`# ${fortune.name}\n\n${quotedDescription}`)
      .setFooter({ text: fortune.footer });

    return interaction.reply({ embeds: [embed] });
  }

  // 1. log コマンド
  if (commandName === 'log') {
    await interaction.deferReply();

    const stats = (await getAllStats()) || {};

    const target =
      interaction.options.getUser('user') || interaction.user;

    const data = stats[target.id];

    if (!data) {
      return interaction.editReply({
        content: '…和紙をまだ呼び出していないのだ'
      });
    }

    let serverName = target.username;

    if (interaction.guild) {
      const member = interaction.guild.members.cache.get(target.id);
      if (member) serverName = member.displayName;
    }

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

    return interaction.editReply({ embeds: [embed] });
  }

  // 2. rank コマンド
  if (commandName === 'rank') {
    await interaction.deferReply();

    const stats = (await getAllStats()) || {};

    const ranking = Object.values(stats)
      .sort((a, b) => b.mention - a.mention)
      .slice(0, 5);

    const total = Object.values(stats).reduce(
      (sum, u) => sum + u.mention,
      0
    );

    const medals = ['🥇', '🥈', '🥉', '🏅', '🏅'];

    let text = `累計 **${total}**回 和紙を呼び出したのだ\n\n`;

    for (let i = 0; i < ranking.length; i++) {
      const u = ranking[i];

      let displayName = u.name;

      if (interaction.guild) {
        try {
          const member = await interaction.guild.members.fetch(u.id);
          if (member) displayName = member.displayName;
        } catch (err) {}
      }

      text += `**${medals[i]} 第${i + 1}位：${u.mention}回**\n${displayName}\n\n`;
    }

    const embed = new EmbedBuilder()
      .setColor(0x8B5A2B)
      .setTitle('和紙を呼び出したランキング')
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(text)
      .setFooter({
        text: '…もっと和紙を呼び出すのだ'
      });

    return interaction.editReply({ embeds: [embed] });
  }

  // 3. luck コマンド
  if (commandName === 'luck') {
    await interaction.deferReply();

    const stats = (await getAllStats()) || {};

    const ranking = Object.values(stats)
      .sort((a, b) => b.lucky - a.lucky)
      .filter(u => u.lucky > 0)
      .slice(0, 5);

    const total = Object.values(stats).reduce(
      (sum, u) => sum + u.lucky,
      0
    );

    const medals = ['🥇', '🥈', '🥉', '🏅', '🏅'];

    let text = `累計 **${total}**回 和紙が応じてあげたのだ\n\n`;

    for (let i = 0; i < ranking.length; i++) {
      const u = ranking[i];

      let displayName = u.name;

      if (interaction.guild) {
        try {
          const member = await interaction.guild.members.fetch(u.id);
          if (member) displayName = member.displayName;
        } catch (err) {}
      }

      text += `**${medals[i]} 第${i + 1}位：${u.lucky}回**\n${displayName}\n\n`;
    }

    const embed = new EmbedBuilder()
      .setColor(0x8B5A2B)
      .setTitle('和紙が応じたランキング')
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(text)
      .setFooter({
        text: '…日頃の行いが足りないのだ'
      });

    return interaction.editReply({ embeds: [embed] });
  }

  // tomato
  if (commandName === 'tomato') {
    return interaction.reply({
      content: await getRandomReply('tomatoReplies')
    });
  }

  // kiwi
  if (commandName === 'kiwi') {
    return interaction.reply({
      content: 'きぅいくってー\nあげりしゃすーwwwあげりしゃすーwww\nあげあげりしゃすーwww\nきぶんをあげるでりしゃすなきぅいーwww\nあげりしゃすーwww\nあげあげりしゃすーwww'
    });
  }

  // asa
  if (commandName === 'asa') {
    return interaction.reply({
      content: 'あーたーらしーいーあーさがっきったwww\nきぼーおのっあーさーだwww\nよろこーびにむねをひーらけwww\nおーぞーらあーおーげーwww\nらーじおーのーこーえにーwww\nすこやーかなーむーねをーwww\nこのかっおーるかっぜーにひらーけよwww\nそれいっちにっさーんwwwww'
    });
  }

  // ao
  if (commandName === 'ao') {
    return interaction.reply({
      content: await getRandomReply('aoReplies')
    });
  }

  // all
  if (commandName === 'all') {
    return interaction.reply({
      content: await getRandomReply('replies')
    });
  }

  // wappa
  if (commandName === 'wappa') {
    return interaction.reply({
      content: await getRandomReply('adaReplies')
    });
  }

  // mgm
  if (commandName === 'mgm') {
    return interaction.reply({
      content: await getRandomReply('megamiReplies')
    });
  }

  // cpc
  if (commandName === 'cpc') {
    return interaction.reply({
      content: await getRandomReply('helloReplies')
    });
  }

  // gal_tomato
  if (commandName === 'gal_tomato') {
    // 1%の確率で真・最終話
    if (Math.random() < 0.01) {
      await interaction.reply({
        content: `真・最終話 童帝
???「童帝と名乗るのは求める事すら捨てた者達のみ、邪念が有るなら消し去る事を極めてから申しなさい」

全てを失ったジェヨンの元に、どこからともなく、一人の老人がジェヨンの前へ静かに降り立った。

???「…もう一度、やり直す覚悟は…お有りかしら？」

ジェヨンは目を見開く。

「あ、貴方は…」

老人は穏やかに微笑み、こう言った。

「和紙は生涯童帝を誓った漢,崩せる様な人は相当な人格者で無いと無理よ」

そう言うと、老人は指を鳴らした。

次の瞬間、世界がきしむような音を立て、時間そのものが逆行を始める。

???「あ、和紙はレズもせーへきにはなりません」

そんなことを話している間に時間逆行は完了し
気がつくと俺は、トマトと幸せに暮らしていたあの頃へ戻っていた。

???「他者への幸福を邪魔する様な気持ちも捨てれる事こそが童帝の第一歩なのです」

そして少しだけ表情を険しくし、静かに続けた。

「……その幸せを邪魔するような不届き者は――」

老人は再び指を鳴らし、不敵に笑う。

???「…和紙が犯す`
      });

      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 30000);

      return;
    }

    return interaction.reply({
      content: await getRandomReply('gyarutomatoReplies')
    });
  }

  // 記憶追加用コマンド
  const addCommands = {
    addall: {
      category: 'replies',
      name: '全体（all）'
    },
    addwappa: {
      category: 'adaReplies',
      name: '和紙（wappa）'
    },
    addtomato: {
      category: 'tomatoReplies',
      name: '的トマト（tomato）'
    },
    addao: {
      category: 'aoReplies',
      name: 'あお（ao）'
    },
    addcpc: {
      category: 'helloReplies',
      name: 'カートゥーンポテチ（cpc）'
    },
    addmgm: {
      category: 'megamiReplies',
      name: '女神（mgm）'
    },
    addgal_tomato: {
      category: 'gyarutomatoReplies',
      name: 'ギャルトマト列伝（gal_tomato）'
    }
  };

  // 記憶削除用コマンド
  const remCommands = {
    remall: { category: 'replies', name: '全体（all）' },
    remwappa: { category: 'adaReplies', name: '和紙（wappa）' },
    remtomato: { category: 'tomatoReplies', name: '的トマト（tomato）' },
    remao: { category: 'aoReplies', name: 'あお（ao）' },
    remcpc: { category: 'helloReplies', name: 'カートゥーンポテチ（cpc）' },
    remmgm: { category: 'megamiReplies', name: '女神（mgm）' },
    remgal_tomato: { category: 'gyarutomatoReplies', name: 'ギャルトマト列伝（gal_tomato）' }
  };

  const remCommand = remCommands[commandName];

  if (remCommand) {
    const allowedUsers = ['768022305279574067'];

    if (!allowedUsers.includes(interaction.user.id)) {
      return interaction.reply({
        content: '…貴方に和紙の記憶を弄る素質がないんだにょwww 出直してくるのだ',
        ephemeral: true
      });
    }

    const word = interaction.options.getString('word');

    if (!word || !word.trim()) {
      return interaction.reply({
        content: '…空っぽの記憶は消せないのだ',
        ephemeral: true
      });
    }

    const removedDocs = await removeCustomReplyForUndo(remCommand.category, word);

    if (removedDocs.length === 0) {
      return interaction.reply({
        content: `…「${word}」は和紙の【${remCommand.name}】の記憶に見つからなかったのだ。`,
        ephemeral: true
      });
    }

    const token = await createReplyUndoAction(interaction.user.id, 'remove', removedDocs);
    return interaction.reply({
      content: `…「${word}」を和紙の【${remCommand.name}】の記憶から${removedDocs.length}件消したのだ。`,
      components: [createReplyActionRow(token, interaction.user.id)]
    });
  }

  const addCommand = addCommands[commandName];

  if (addCommand) {
    const allowedUsers = ['768022305279574067'];

    if (!allowedUsers.includes(interaction.user.id)) {
      return interaction.reply({
        content: '…貴方に和紙の記憶を弄る素質がないんだにょwww 出直してくるのだ',
        ephemeral: true
      });
    }

    const newWord = interaction.options.getString('word');

    if (!newWord || !newWord.trim()) {
      return interaction.reply({
        content: '…空っぽの記憶は刻めないのだ',
        ephemeral: true
      });
    }

    // MongoDBに保存し、取り消し用の情報も保存
    const insertedDoc = await addCustomReply(addCommand.category, newWord);
    const token = await createReplyUndoAction(interaction.user.id, 'add', [insertedDoc]);

    return interaction.reply({
      content: `…「${newWord}」を和紙の【${addCommand.name}】の記憶に刻んだのだ。次から喋るかもしれないのだ`,
      components: [createReplyActionRow(token, interaction.user.id)]
    });
  }
}

module.exports = handleInteraction;
