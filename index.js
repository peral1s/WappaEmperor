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

  if (
    message.content.includes('?') ||
    message.content.includes('？')
  ) {
    message.channel.send('…で？');
  }
});

client.login(process.env.TOKEN);
