const express = require('express');
const app = express();

// Render が自動で割り当てる PORT を優先的に使用します
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`🌐 サーバーがポート ${PORT} で起動したのだ`);
});
