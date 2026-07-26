const { MongoClient } = require('mongodb');

let statsCollection;
let disabledChannelsCollection;

async function connectDB() {
  const mongo = new MongoClient(process.env.MONGODB_URI);
  await mongo.connect();
  const db = mongo.db("discordbot");
  statsCollection = db.collection("stats");
  disabledChannelsCollection = db.collection("disabledChannels");
  console.log("MongoDB接続完了");
}

async function getAllStats() {
  const docs = await statsCollection.find().toArray();
  const stats = {};
  for (const doc of docs) {
    stats[doc._id] = {
      id: doc._id,
      name: doc.name,
      mention: doc.mention || 0,
      lucky: doc.lucky || 0
    };
  }
  return stats;
}

async function updateUserStats(userId, username, statsType) {
  const incData = {};
  if (statsType === 'mention') incData.mention = 1;
  if (statsType === 'lucky') incData.lucky = 1;

  const update = {
    $set: { name: username },
    $inc: incData
  };

  const result = await statsCollection.updateOne(
    { _id: userId },
    update,
    { upsert: true }
  );

  console.log(`統計更新: ${username} | ${statsType}+1 | matched: ${result.matchedCount}, upserted: ${result.upsertedCount}`);
}

// 🚫 除外チャンネルの追加
async function addDisabledChannel(channelId) {
  await disabledChannelsCollection.updateOne(
    { _id: channelId },
    { $set: { channelId } },
    { upsert: true }
  );
}

// 🛑 チャンネルが出現除外されているかの判定
async function isChannelDisabled(channelId) {
  if (!disabledChannelsCollection) return false;
  const found = await disabledChannelsCollection.findOne({ _id: channelId });
  return !!found;
}

// 🔄 除外解除用（今後の拡張用）
async function removeDisabledChannel(channelId) {
  await disabledChannelsCollection.deleteOne({ _id: channelId });
}

module.exports = {
  connectDB,
  getAllStats,
  updateUserStats,
  addDisabledChannel,
  isChannelDisabled,
  removeDisabledChannel
};
