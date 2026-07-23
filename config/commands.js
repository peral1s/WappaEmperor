const { SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('log')
    .setDescription('…貴方達の和紙への気持ちが見れるのだ')
    .addUserOption(option =>
      option.setName('user').setDescription('誰の記録を見たいのだ').setRequired(false)
    ),
  new SlashCommandBuilder().setName('rank').setDescription('和紙を呼び出したランキングが見れるのだ'),
  new SlashCommandBuilder().setName('luck').setDescription('和紙が応じたランキングが見れるのだ'),
  
  new SlashCommandBuilder().setName('tomato').setDescription('…的トマトの歴史なのだ'),
  new SlashCommandBuilder().setName('kiwi').setDescription('…和紙がきぅいの歌を歌うのだ'),
  new SlashCommandBuilder().setName('asa').setDescription('…忘れ去られし朝の歌を独唱するのだ'),
  new SlashCommandBuilder().setName('ao').setDescription('…あおの黒歴史図鑑なのだ'),
  new SlashCommandBuilder().setName('tarot').setDescription('…和紙のタロット占いなのだ'),

  new SlashCommandBuilder().setName('all').setDescription('…和紙の、歴史…なのだ'),
  new SlashCommandBuilder().setName('wappa').setDescription('…貴方RPG、興味ある？'),
  new SlashCommandBuilder().setName('cpc').setDescription('…カートゥーンポテチが起動するのだ'),
  new SlashCommandBuilder().setName('gal_tomato').setDescription('…ギャルトマト列伝なのだ 1%で真最終話!?'),

  new SlashCommandBuilder().setName('addall').setDescription('…all（全体返信）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
  new SlashCommandBuilder().setName('addwappa').setDescription('…wappa（RPG）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
  new SlashCommandBuilder().setName('addtomato').setDescription('…tomatoに新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
  new SlashCommandBuilder().setName('addao').setDescription('…ao（黒歴史）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
  new SlashCommandBuilder().setName('addcpc').setDescription('…cpc（ポテチロボ）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
  new SlashCommandBuilder().setName('addgal_tomato').setDescription('…gal_tomato（ギャルトマト）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true))
].map(cmd => cmd.toJSON());

module.exports = commands;

