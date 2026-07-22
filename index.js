const { Client, GatewayIntentBits } = require('discord.js');
const handleMessage = require('./handlers/messageHandler');

// Express サーバー（Render スリープ対策用）
require('./server');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('ready', () => {
  console.log(`🤖 ログイン成功: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  await handleMessage(message, client);
});

if (!process.env.DISCORD_TOKEN) {
  console.error('❌ エラー: DISCORD_TOKEN が設定されていません。');
} else {
  client.login(process.env.DISCORD_TOKEN);
}
