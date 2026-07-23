const { AttachmentBuilder } = require('discord.js');

async function handleHarvest(interaction) {
  // ==========================================
  // ⚙️ ID・権限設定
  // ==========================================
  // 1. 実行可能者（あなた専用）
  const ALLOWED_USER_ID = '768022305279574067';

  // 2. デフォルトの抽出対象（和紙）
  const DEFAULT_TARGET_ID = '1005698535603322881';
  // ==========================================

  // 実行権限チェック（実行可能者以外は弾く）
  if (interaction.user.id !== ALLOWED_USER_ID) {
    return interaction.reply({ 
      content: '…貴方に和紙の記憶を収穫（抽出）する素質がないのだ', 
      ephemeral: true 
    });
  }

  await interaction.deferReply({ ephemeral: true });

  // 💡 抽出対象のユーザーを取得（選択されていなければデフォルトで 和紙）
  const selectedUser = interaction.options.getUser('user');
  let targetUser;

  if (selectedUser) {
    targetUser = selectedUser;
  } else {
    try {
      targetUser = await interaction.client.users.fetch(DEFAULT_TARGET_ID);
    } catch (e) {
      targetUser = { id: DEFAULT_TARGET_ID, username: '和紙' };
    }
  }

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
        // Bot以外の発言 ＆ 抽出対象ユーザー（指定なしなら和紙）の発言のみピックアップ
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

    // UTF-8 BOM付きにして文字化け防止
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
