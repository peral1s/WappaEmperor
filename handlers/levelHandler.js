const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');
const { getLevelStats, getGuildLevelStats } = require('../db/database');

function getLevel(xp = 0) {
  const level = Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
  const currentFloor = (level - 1) ** 2 * 100;
  const nextFloor = level ** 2 * 100;
  return {
    level,
    current: Math.max(0, xp - currentFloor),
    required: nextFloor - currentFloor,
    progress: Math.max(0, Math.min(1, (xp - currentFloor) / (nextFloor - currentFloor)))
  };
}

function formatDuration(seconds = 0) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`;
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

async function createLevelCard(member, stats, allStats) {
  const canvas = createCanvas(1000, 400);
  const ctx = canvas.getContext('2d');

  const background = ctx.createLinearGradient(0, 0, 1000, 400);
  background.addColorStop(0, '#151522');
  background.addColorStop(0.55, '#24203e');
  background.addColorStop(1, '#35145f');
  ctx.fillStyle = background;
  roundedRect(ctx, 0, 0, 1000, 400, 28);

  // 背景の装飾
  ctx.save();
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 34; i++) {
    ctx.fillStyle = i % 2 ? '#b45cff' : '#39b8ff';
    ctx.beginPath();
    ctx.arc(600 + (i * 71) % 430, 25 + (i * 47) % 340, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // アバター
  const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
  const avatar = await loadImage(avatarUrl);
  ctx.save();
  ctx.beginPath();
  ctx.arc(125, 135, 104, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, 21, 31, 208, 208);
  ctx.restore();
  ctx.strokeStyle = '#d9b6ff';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(125, 135, 104, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px sans-serif';
  // Discordの表示名ではなく、英数字のユーザー名（例: ._pera）を表示する
  ctx.fillText(member.user.username, 270, 92, 680);
  ctx.fillStyle = '#c9c2dc';
  ctx.font = '22px sans-serif';
  ctx.fillText('SERVER LEVEL CARD', 273, 128);

  const messageXp = stats.messageXp || 0;
  const voiceXp = stats.voiceXp || 0;
  const messageLevel = getLevel(messageXp);
  const voiceLevel = getLevel(voiceXp);

  const messageRank = [...allStats].sort((a, b) => (b.messageXp || 0) - (a.messageXp || 0))
    .findIndex(item => item.userId === member.id) + 1;
  const voiceRank = [...allStats].sort((a, b) => (b.voiceXp || 0) - (a.voiceXp || 0))
    .findIndex(item => item.userId === member.id) + 1;

  function drawBar(y, icon, label, level, rank, total, colorA, colorB) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(icon, 270, y + 8);
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(label, 315, y - 18);
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(String(level.level), 315, y + 20);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#d8d3e6';
    ctx.fillText('LVL', 315, y - 2);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Rank: #${rank || '-'}`, 455, y - 18);
    ctx.textAlign = 'right';
    ctx.fillText(`Total: ${total.toLocaleString()}`, 960, y - 18);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#514b60';
    roundedRect(ctx, 445, y - 4, 515, 39, 19);
    const gradient = ctx.createLinearGradient(445, y, 960, y);
    gradient.addColorStop(0, colorA);
    gradient.addColorStop(1, colorB);
    ctx.fillStyle = gradient;
    if (level.progress > 0) roundedRect(ctx, 449, y, 507 * level.progress, 31, 15);

    ctx.fillStyle = '#ffffff';
    ctx.font = '17px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${level.current.toLocaleString()} / ${level.required.toLocaleString()} XP`, 702, y + 19);
    ctx.textAlign = 'left';
  }

  drawBar(190, '✉', 'MESSAGE LEVEL', messageLevel, messageRank, messageXp, '#7b5cff', '#d05bff');
  drawBar(300, '♫', 'VOICE LEVEL', voiceLevel, voiceRank, voiceXp, '#3b9fff', '#52e0d0');

  ctx.fillStyle = '#d8d3e6';
  ctx.font = '15px sans-serif';
  ctx.fillText(`Messages: ${(stats.messages || 0).toLocaleString()}   |   Voice: ${formatDuration(stats.voiceSeconds || 0)}`, 270, 370);

  return new AttachmentBuilder(await canvas.encode('png'), { name: 'level.png' });
}

async function showLevel(source, targetMember = source.member) {
  const guild = source.guild;
  if (!guild || !targetMember) {
    const payload = { content: '…サーバー内で使うのだ。' };
    return source.isChatInputCommand?.()
      ? source.reply({ ...payload, ephemeral: true })
      : source.reply(payload);
  }

  const isInteraction = typeof source.isChatInputCommand === 'function'
    && source.isChatInputCommand();

  if (isInteraction) {
    await source.deferReply();
  } else {
    await source.channel.sendTyping();
  }

  try {
    const [stats, allStats] = await Promise.all([
      getLevelStats(guild.id, targetMember.id),
      getGuildLevelStats(guild.id)
    ]);

    const card = await createLevelCard(targetMember, stats, allStats);
    return isInteraction
      ? source.editReply({ files: [card] })
      : source.reply({ files: [card], allowedMentions: { repliedUser: false } });
  } catch (error) {
    console.error('レベルカード生成エラー:', error);
    const payload = { content: '…レベルカードの生成に失敗したのだ。少し待ってから試すのだ。' };
    return isInteraction
      ? source.editReply(payload)
      : source.reply(payload);
  }
}

module.exports = { showLevel, getLevel };
