const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const startServer = require('./server');
const { connectDB } = require('./db/database');
const commands = require('./config/commands');
const handleMessage = require('./handlers/messageHandler');
const handleInteraction = require('./handlers/interactionHandler');

// Expressサーバー開始
startServer();

// Discord Clientセットアップ
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Bot起動処理
client.once('ready', async () => {
  await connectDB();
  console.log('Bot起動！');

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('スラッシュコマンド登録完了');
  } catch (err) {
    console.error('スラッシュコマンド登録失敗:', err);
  }
});

// イベントリスナーの登録
client.on('messageCreate', (message) => handleMessage(message, client));
client.on('interactionCreate', (interaction) => handleInteraction(interaction, client));

// ログイン
client.login(process.env.TOKEN);
