  // 💡 発言ログ抽出コマンド
  new SlashCommandBuilder()
    .setName('harvest')
    .setDescription('…指定したユーザーの発言ログを遡ってテキストファイルで抽出するのだ')
    .addUserOption(opt =>
      opt.setName('user')
         .setDescription('抽出したいユーザー（指定しない場合のデフォルトは和紙の片割れよ）')
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
