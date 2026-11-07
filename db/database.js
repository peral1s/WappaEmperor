const { MongoClient } = require('mongodb');

let mongo;
let statsCollection;
let disabledChannelsCollection;
let customRepliesCollection;
let replyUndoActionsCollection;
let levelStatsCollection;
let voiceSessionsCollection;

// MongoDB接続
async function connectDB() {
  if (mongo) return;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI が設定されていません');
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  await client.connect();

  const db = client.db('discordbot');

  mongo = client;
  statsCollection = db.collection('stats');
  disabledChannelsCollection = db.collection('disabledChannels');
  customRepliesCollection = db.collection('customReplies');
  replyUndoActionsCollection = db.collection('replyUndoActions');

  levelStatsCollection = db.collection('levelStats');
  voiceSessionsCollection = db.collection('voiceSessions');
  await replyUndoActionsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  console.log('MongoDB接続完了');
}

// 全ユーザーの統計取得
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

// ユーザー統計更新
async function updateUserStats(userId, username, statsType) {
  const incData = {};

  if (statsType === 'mention') {
    incData.mention = 1;
  }

  if (statsType === 'lucky') {
    incData.lucky = 1;
  }

  const update = {
    $set: {
      name: username
    },
    $inc: incData
  };

  const result = await statsCollection.updateOne(
    { _id: userId },
    update,
    { upsert: true }
  );

  console.log(
    `統計更新: ${username} | ${statsType}+1 | matched: ${result.matchedCount}, upserted: ${result.upsertedCount}`
  );
}



// ==========================================
// レベル統計（サーバーごと）
// ==========================================
async function recordLevelMessage(guildId, userId, username) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 60 * 1000);
  const _id = `${guildId}:${userId}`;

  await levelStatsCollection.updateOne(
    { _id },
    { $set: { guildId, userId, name: username }, $inc: { messages: 1 } },
    { upsert: true }
  );

  // 連投しても経験値は1分に1回だけ加算
  await levelStatsCollection.updateOne(
    {
      _id,
      $or: [
        { lastMessageXpAt: { $exists: false } },
        { lastMessageXpAt: { $lte: cutoff } }
      ]
    },
    { $inc: { messageXp: 10 }, $set: { lastMessageXpAt: now } }
  );
}

async function startVoiceSession(guildId, userId, username, channelId) {
  const _id = `${guildId}:${userId}`;
  const result = await voiceSessionsCollection.updateOne(
    { _id },
    {
      $setOnInsert: {
        guildId, userId, username, channelId, startedAt: new Date()
      }
    },
    { upsert: true }
  );
  if (result.upsertedCount > 0) {
    console.log(`VCセッション開始保存: ${username} / ${channelId}`);
  }
}

async function endVoiceSession(guildId, userId) {
  const _id = `${guildId}:${userId}`;
  const session = await voiceSessionsCollection.findOne({ _id });
  if (!session) return;

  await voiceSessionsCollection.deleteOne({ _id });
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000));
  if (seconds <= 0) return;

  const current = await levelStatsCollection.findOne({ _id });
  const previousSeconds = current?.voiceSeconds || 0;
  const xpGained = Math.floor((previousSeconds + seconds) / 60) - Math.floor(previousSeconds / 60);

  await levelStatsCollection.updateOne(
    { _id },
    {
      $set: { guildId, userId, name: session.username },
      $inc: { voiceSeconds: seconds, voiceXp: xpGained }
    },
    { upsert: true }
  );
  console.log(`VC滞在時間保存: ${session.username} | ${seconds}秒 | +${xpGained} XP`);
}

async function getLevelStats(guildId, userId) {
  const all = await getGuildLevelStats(guildId);
  return all.find(item => item.userId === userId) || {
    guildId, userId, name: '', messages: 0, messageXp: 0, voiceSeconds: 0, voiceXp: 0
  };
}

async function getGuildLevelStats(guildId) {
  const docs = await levelStatsCollection.find({ guildId }).toArray();
  const byUser = new Map(docs.map(doc => [doc.userId, doc]));
  const sessions = await voiceSessionsCollection.find({ guildId }).toArray();
  const now = Date.now();

  for (const session of sessions) {
    const seconds = Math.max(0, Math.floor((now - new Date(session.startedAt).getTime()) / 1000));
    const stats = byUser.get(session.userId) || {
      guildId, userId: session.userId, name: session.username,
      messages: 0, messageXp: 0, voiceSeconds: 0, voiceXp: 0
    };
    const previousSeconds = stats.voiceSeconds || 0;
    stats.voiceSeconds = previousSeconds + seconds;
    stats.voiceXp = (stats.voiceXp || 0)
      + Math.floor(stats.voiceSeconds / 60) - Math.floor(previousSeconds / 60);
    byUser.set(session.userId, stats);
  }

  return [...byUser.values()];
}

// 無効チャンネル追加
async function addDisabledChannel(channelId) {
  await disabledChannelsCollection.updateOne(
    { _id: channelId },
    { $set: { channelId } },
    { upsert: true }
  );
}

// チャンネルが無効か確認
async function isChannelDisabled(channelId) {
  if (!disabledChannelsCollection) return false;

  const found = await disabledChannelsCollection.findOne({
    _id: channelId
  });

  return !!found;
}

// 無効チャンネル解除
async function removeDisabledChannel(channelId) {
  await disabledChannelsCollection.deleteOne({
    _id: channelId
  });
}

// カスタム返信追加
async function addCustomReply(category, text) {
  if (!customRepliesCollection) {
    throw new Error('MongoDBに接続されていません');
  }

  const doc = { category, text, createdAt: new Date() };
  const result = await customRepliesCollection.insertOne(doc);
  console.log(`カスタム返信追加: ${category} | ${text}`);
  return { ...doc, _id: result.insertedId };
}

// カスタム返信削除（同じカテゴリー・文章の登録をすべて削除）
async function removeCustomReply(category, text) {
  if (!customRepliesCollection) {
    throw new Error('MongoDBに接続されていません');
  }

  const result = await customRepliesCollection.deleteMany({ category, text });
  console.log(`カスタム返信削除: ${category} | ${text} | deleted: ${result.deletedCount}`);
  return result.deletedCount;
}

// 取り消し可能な削除（削除前のドキュメントを返す）
async function removeCustomReplyForUndo(category, text) {
  if (!customRepliesCollection) throw new Error('MongoDBに接続されていません');
  const docs = await customRepliesCollection.find({ category, text }).toArray();
  if (docs.length > 0) {
    await customRepliesCollection.deleteMany({ _id: { $in: docs.map(doc => doc._id) } });
  }
  console.log(`カスタム返信削除: ${category} | ${text} | deleted: ${docs.length}`);
  return docs;
}

// 取り消し操作をMongoDBに保存（24時間有効）
async function createReplyUndoAction(userId, action, docs) {
  if (!replyUndoActionsCollection) throw new Error('MongoDBに接続されていません');
  const token = require('crypto').randomUUID();
  await replyUndoActionsCollection.insertOne({
    _id: token,
    userId,
    action,
    docs,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });
  return token;
}

// 追加・削除を取り消す
async function undoReplyAction(token, userId) {
  if (!replyUndoActionsCollection || !customRepliesCollection) {
    throw new Error('MongoDBに接続されていません');
  }
  const actionDoc = await replyUndoActionsCollection.findOne({ _id: token, userId });
  if (!actionDoc) return null;

  if (actionDoc.action === 'add') {
    await customRepliesCollection.deleteMany({
      _id: { $in: actionDoc.docs.map(doc => doc._id) }
    });
  } else if (actionDoc.action === 'remove') {
    if (actionDoc.docs.length > 0) {
      await customRepliesCollection.insertMany(actionDoc.docs);
    }
  } else {
    return null;
  }

  await replyUndoActionsCollection.deleteOne({ _id: token, userId });
  return actionDoc.action;
}

// カスタム返信取得
async function getCustomReplies(category) {
  if (!customRepliesCollection) {
    throw new Error('MongoDBに接続されていません');
  }

  const docs = await customRepliesCollection
    .find({ category })
    .sort({ _id: 1 })
    .toArray();

  return docs.map(doc => doc.text);
}

module.exports = {
  connectDB,
  getAllStats,
  updateUserStats,
  recordLevelMessage,
  startVoiceSession,
  endVoiceSession,
  getLevelStats,
  getGuildLevelStats,
  addDisabledChannel,
  isChannelDisabled,
  removeDisabledChannel,
  addCustomReply,
  removeCustomReply,
  removeCustomReplyForUndo,
  createReplyUndoAction,
  undoReplyAction,
  getCustomReplies
};
