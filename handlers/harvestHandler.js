const { AttachmentBuilder } = require('discord.js');

// 💡 日付文字列から Discord の Snowflake ID を生成する関数
function dateToSnowflake(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  const DISCORD_EPOCH = 1420070400000n;
  const timestamp = BigInt(date.getTime());
  if (timestamp < DISCORD_EPOCH) return null;

  return ((timestamp - DISCORD_EPOCH) << 22n).toString();
}

async function handleHarvest(interaction) {
  // ==========================================
  // ⚙️ ID・権限設定
  // ==========================================
  const ALLOWED_USER_ID = '768022305279574067';   // 実行権限者（あなた専用）
  const DEFAULT_TARGET_ID = '1005698535603322881'; // デフォルト抽出対象（和紙）
  // ==========================================

  // 実行権限チェック
  if (interaction.user.id !== ALLOWED_USER_ID) {
    return interaction.reply({ 
      content: '…貴方に和紙の記憶を収穫（抽出）する素質がないのだ', 
      ephemeral: true 
    });
  }

  await interaction.deferReply({ ephemeral: true });

  // 抽出対象の判定
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
  const inputDate = interaction.options.getString('date');
  const channel = interaction.channel;

  // 💡 日付指定があれば、その時点の Snowflake ID を起点にする
  let lastMessageId = dateToSnowflake(inputDate);

  if (inputDate && !lastMessageId) {
    return interaction.editReply({
      content: '…日付の形式が正しくないのだ。（例: `2022-10-01` や `2023-05` 形式で入力するのだ）'
    });
  }

  let collectedMsgs = [];
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
        if (!msg.author.bot && msg.author.id === targetUserId && msg.content.trim().length > 0) {
          collectedMsgs.push(msg);
        }
      });

      lastMessageId = fetchedMessages.last().id;
    }

    if (collectedMsgs.length === 0) {
      const startMsg = inputDate ? `**${inputDate}** の時点から ` : '';
      return interaction.editReply({ 
        content: `…${startMsg}スキャンした **${scannedCount}** 件の中に、**${targetUser.username}**（ID: \`${targetUserId}\`）の発言は見つからなかったのだ` 
      });
    }

    // 古い順に並び替え
    collectedMsgs.reverse();

    let fileText = '';
    let fileName = `${targetUser.username}_${format}_${Date.now()}.txt`;

    if (format === 'text') {
      fileText = collectedMsgs.map(m => m.content).join('\n');
    } else if (format === 'array') {
      const formattedLines = collectedMsgs.map(m => `  "${m.content.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
      fileText = `[\n${formattedLines.join(',\n')}\n]`;
      fileName = `${targetUser.username}_replies_${Date.now()}.js`;
    } else {
      fileText = collectedMsgs.map(m => {
        const dateStr = m.createdAt.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
        return `[${dateStr}] ${m.content}`;
      }).join('\n\n');
    }

    // UTF-8 BOM付きにして文字化け防止
    const buffer = Buffer.from('\uFEFF' + fileText, 'utf-8');
    const attachment = new AttachmentBuilder(buffer, { name: fileName });

    const dateNotice = inputDate ? `（**${inputDate}** 時点から過去へ探索）` : '';
    return interaction.editReply({
      content: `✅ **${scannedCount}** 件中${dateNotice}から、**${targetUser.username}** の発言 **${collectedMsgs.length}** 件を正常に抽出したのだ！`,
      files: [attachment]
    });

  } catch (error) {
    console.error('抽出エラー:', error);
    return interaction.editReply({ content: '…過去ログの抽出中にエラーが発生したのだ。' });
  }
}

module.exports = handleHarvest;
