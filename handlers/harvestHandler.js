const { AttachmentBuilder } = require('discord.js');

async function handleHarvest(interaction) {
  // 💡 実行権限チェック（YougaさんのID）
  const YOUGA_ID = '1005698535603322881';
  const allowedUsers = [YOUGA_ID];

  if (!allowedUsers.includes(interaction.user.id)) {
    return interaction.reply({ 
      content: '…貴方に和紙の記憶を収穫（抽出）する素質がないのだ', 
      ephemeral: true 
    });
  }

  await interaction.deferReply({ ephemeral: true });

  // 💡 対象ユーザーの取得（コマンドで指定されていなければYougaさんを対象にする）
  const targetUser = interaction.options.getUser('user') || await interaction.client.users.fetch(YOUGA_ID);
  const targetUserId = targetUser.id;

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
        // Bot以外の発言で、指定ID（1005698535603322881）の発言のみ抽出
        if (!msg.author.bot && msg.author.id === targetUserId && msg.content.trim().length > 0) {
          collectedMsgs.push(msg);
        }
      });

      lastMessageId = fetchedMessages.last().id;
    }

    if (collectedMsgs.length === 0) {
      return interaction.editReply({ 
        content: `…スキャンした **${scannedCount}** 件の中に、**${targetUser.username}**（ID: \`${targetUserId}\`）の発言は見つからなかったのだ` 
      });
    }

    // 古い順に並び替え
    collectedMsgs.reverse();

    let fileText = '';
    let fileName = `${targetUser.username}_${format}_${Date.now()}.txt`;

    if (format === 'text') {
      // 発言テキストのみ
      fileText = collectedMsgs.map(m => m.content).join('\n');
    } else if (format === 'array') {
      // JS配列形式
      const formattedLines = collectedMsgs.map(m => `  "${m.content.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
      fileText = `[\n${formattedLines.join(',\n')}\n]`;
      fileName = `${targetUser.username}_replies_${Date.now()}.js`;
    } else {
      // 日付付き詳細ログ
      fileText = collectedMsgs.map(m => {
        const dateStr = m.createdAt.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
        return `[${dateStr}] ${m.content}`;
      }).join('\n\n');
    }

    // UTF-8 BOM付きにして文字化けを完全防止
    const buffer = Buffer.from('\uFEFF' + fileText, 'utf-8');
    const attachment = new AttachmentBuilder(buffer, { name: fileName });

    return interaction.editReply({
      content: `✅ **${scannedCount}** 件中から、**${targetUser.username}** の発言 **${collectedMsgs.length}** 件を正常に抽出したのだ！`,
      files: [attachment]
    });

  } catch (error) {
    console.error('抽出エラー:', error);
    return interaction.editReply({ content: '…過去ログの抽出中にエラーが発生したのだ。Botに「メッセージ履歴を読む」権限があるか確認するのだ。' });
  }
}

module.exports = handleHarvest;
