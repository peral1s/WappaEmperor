const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log('Bot起動！');
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const random = Math.random();

  // 20%の確率で送信
  if (random < 0.05) {
    message.channel.send('…で？');
  }
});

client.login(process.env.TOKEN);
