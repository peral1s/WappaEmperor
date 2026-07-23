const { AttachmentBuilder } = require('discord.js');

async function handleHarvest(interaction) {
  const allowedUsers = ['768022305279574067']; // 実行許可ユーザー

  if (!allowedUsers.includes(interaction.user.id)) {
    return interaction.reply({ 
      content: '…貴方に和紙の記憶を収穫（抽出）する素質がないのだ', 
      ephemeral: true 
    });
  }

  await interaction.deferReply({ ephemeral: true });

  const targetUserId = '768022305279574067'; // YougaさんのID
  const scanLimit = Math.min(interaction.options.getInteger('limit') || 1000, 5000);
  const format = interaction.options.getString('format') || 'log';
  const channel = interaction.channel;

  let collectedMsgs = [];
  let lastMessageId;
  let scannedCount = 0;

  try {
    while (scannedCount < scanLimit) {
      const fetchAmount = Math.min(100, scanLimit - scannedCount);
      const options = { limit: fetchAmount };
      if (lastMessageId) options.before = lastMessageId;

      const fetchedMessages = await channel.messages.fetch(options);
      if (fetchedMessages.size === 0) break;

      scannedCount += fetchedMessages.size;

      fetchedMessages.forEach(msg => {
        if (msg.author.id === targetUserId && msg.content.trim().length > 0) {
          collectedMsgs.push(msg);
        }
      });

      lastMessageId = fetchedMessages.last().id;
    }

    if (collectedMsgs.length === 0) {
      return interaction.editReply({ 
        content: `…スキャンした **${scannedCount}** 件の中にYougaの発言は見つからなかったのだ` 
      });
    }

    // 古い順にソート
    collectedMsgs.reverse();

    let fileText = '';
    let fileName = `youga_${format}_${Date.now()}.txt`;

    // 💡 選んだフォーマットに応じて整形
    if (format === 'text') {
      // 純粋な発言テキストのみ（1行1メッセージ）
      fileText = collectedMsgs.map(m => m.content).join('\n');
    } else if (format === 'array') {
      // replies.js に直貼りできる JS配列形式
      const formattedLines = collectedMsgs.map(m => `  "${m.content.replace(/"/g, '\\"')}"`);
      fileText = `[\n${formattedLines.join(',\n')}\n]`;
      fileName = `youga_replies_${Date.now()}.js`;
    } else {
      // 日付付き詳細ログ
      fileText = collectedMsgs.map(m => {
        const dateStr = m.createdAt.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
        return `[${dateStr}] ${m.content}`;
      }).join('\n\n');
    }

    const buffer = Buffer.from(fileText, 'utf-8');
    const attachment = new AttachmentBuilder(buffer, { name: fileName });

    return interaction.editReply({
      content: `✅ **${scannedCount}** 件をスキャンし、Yougaの発言 **${collectedMsgs.length}** 件を【${format}】形式で抽出したのだ！`,
      files: [attachment]
    });

  } catch (error) {
    console.error('抽出エラー:', error);
    return interaction.editReply({ content: '…ログの抽出中にエラーが発生したのだ。' });
  }
}

module.exports = handleHarvest;
