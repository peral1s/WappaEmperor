const { 
  SlashCommandBuilder, 
  ApplicationIntegrationType, 
  InteractionContextType 
} = require('discord.js');

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

  // 💡 発言ログ抽出コマンド（日付ジャンプ・ユーザー指定対応版）
  new SlashCommandBuilder()
    .setName('harvest')
    .setDescription('…指定したユーザーの発言ログを遡ってテキストファイルで抽出するのだ')
    .addUserOption(opt =>
      opt.setName('user')
         .setDescription('抽出したいユーザー（指定しない場合のデフォルトは 和紙）')
         .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('date')
         .setDescription('いつの時点から遡るか指定（例: 2022-10-01, 2023-05 など）')
         .setRequired(false)
    )
    .addIntegerOption(opt => 
      opt.setName('limit')
         .setDescription('遡る最大メッセージ件数（デフォルト: 1000件 / 最大: 5000件）')
         .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('format')
         .setDescription('出力フォーマット（指定しない場合は日付付きログ）')
         .setRequired(false)
         .addChoices(
           { name: '発言テキストのみ（切り取り・コピペ用）', value: 'text' },
           { name: 'JS配列形式（replies.js直貼り用）', value: 'array' },
           { name: '日付付き詳細ログ', value: 'log' }
         )
    ),

  new SlashCommandBuilder().setName('addall').setDescription('…all（全体返信）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
  new SlashCommandBuilder().setName('addwappa').setDescription('…wappa（RPG）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
  new SlashCommandBuilder().setName('addtomato').setDescription('…tomatoに新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
  new SlashCommandBuilder().setName('addao').setDescription('…ao（黒歴史）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
  new SlashCommandBuilder().setName('addcpc').setDescription('…cpc（ポテチロボ）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true)),
  new SlashCommandBuilder().setName('addgal_tomato').setDescription('…gal_tomato（ギャルトマト）に新しい記憶を刻むのだ').addStringOption(opt => opt.setName('word').setDescription('追加したい言葉を入力').setRequired(true))
].map(cmd => {
  // 全コマンドにDM対応・ユーザーアプリ対応・コンテキスト設定を適用
  if (typeof cmd.setIntegrationTypes === 'function') {
    cmd.setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall
    ]);
  }
  if (typeof cmd.setContexts === 'function') {
    cmd.setContexts([
      InteractionContextType.Guild,
      InteractionContextType.BotDM,
      InteractionContextType.PrivateChannel
    ]);
  }
  cmd.setDMPermission(true);

  return cmd.toJSON();
});

module.exports = commands;
