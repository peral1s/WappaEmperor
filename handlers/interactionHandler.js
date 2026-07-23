// handlers/interactionHandler.js の冒頭
const { EmbedBuilder } = require('discord.js');
const replyData = require('../data/replies');
const tarotCards = require('../data/tarot'); // 👈 これを追加！
const { getAllStats } = require('../db/database');

// ... 中略 ...

  // handleInteraction 関数の内部に追加（他の if (commandName === 'xxx') と並べて記述）

  if (commandName === 'tarot') {
    const card = tarotCards[Math.floor(Math.random() * tarotCards.length)];
    const isUpright = Math.random() >= 0.5; // 50%で正位置か逆位置
    const positionText = isUpright ? '【正位置】' : '【逆位置】';
    const meaning = isUpright ? card.upright : card.reversed;

    const embed = new EmbedBuilder()
      .setColor(isUpright ? 0x2ECC71 : 0xE74C3C) // 正位置なら緑、逆位置なら赤
      .setTitle(`${interaction.user.username}のタロット占い結果`)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(
`貴方が引いたカードは…

### **${card.name}** ${positionText}

> ${meaning}`
      )
      .setFooter({ text: '…信じるか信じないかは、貴方次第なのだ\nそーいや貴方、RPGって得意？' });

    return interaction.reply({ embeds: [embed] });
  }
