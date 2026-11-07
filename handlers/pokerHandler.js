const {
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, EmbedBuilder
} = require('discord.js');

const games = new Map();
const MAX_PLAYERS = 6;
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const rankValue = rank => RANKS.indexOf(rank) + 2;
const cardText = card => `${card.suit}${card.rank}`;

function makeDeck() {
  const deck = SUITS.flatMap(suit => RANKS.map(rank => ({ suit, rank })));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function drawCards(game, count) {
  const drawn = [];
  while (drawn.length < count) {
    if (game.deck.length === 0) {
      game.deck = game.discard.splice(0);
      for (let i = game.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [game.deck[i], game.deck[j]] = [game.deck[j], game.deck[i]];
      }
    }
    if (game.deck.length === 0) break;
    drawn.push(game.deck.pop());
  }
  return drawn;
}

function evaluate(cards) {
  const values = cards.map(c => rankValue(c.rank)).sort((a,b) => b-a);
  const counts = new Map();
  values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
  const groups = [...counts.entries()].sort((a,b) => b[1]-a[1] || b[0]-a[0]);
  const flush = cards.every(c => c.suit === cards[0].suit);
  const unique = [...new Set(values)].sort((a,b) => b-a);
  let straightHigh = 0;
  if (unique.length === 5 && unique[0] - unique[4] === 4) straightHigh = unique[0];
  if (unique.join(',') === '14,5,4,3,2') straightHigh = 5;

  if (flush && straightHigh === 14) return { rank: 9, name: 'ロイヤルフラッシュ', tie: [14] };
  if (flush && straightHigh) return { rank: 8, name: 'ストレートフラッシュ', tie: [straightHigh] };
  if (groups[0][1] === 4) return { rank: 7, name: 'フォーカード', tie: groups.map(x=>x[0]) };
  if (groups[0][1] === 3 && groups[1][1] === 2) return { rank: 6, name: 'フルハウス', tie: groups.map(x=>x[0]) };
  if (flush) return { rank: 5, name: 'フラッシュ', tie: values };
  if (straightHigh) return { rank: 4, name: 'ストレート', tie: [straightHigh] };
  if (groups[0][1] === 3) return { rank: 3, name: 'スリーカード', tie: groups.map(x=>x[0]) };
  if (groups[0][1] === 2 && groups[1][1] === 2) return { rank: 2, name: 'ツーペア', tie: groups.map(x=>x[0]) };
  if (groups[0][1] === 2) return { rank: 1, name: 'ワンペア', tie: groups.map(x=>x[0]) };
  return { rank: 0, name: 'ハイカード', tie: values };
}

function compareHands(a, b) {
  const x = evaluate(a), y = evaluate(b);
  if (x.rank !== y.rank) return x.rank - y.rank;
  for (let i = 0; i < Math.max(x.tie.length, y.tie.length); i++) {
    const diff = (x.tie[i] || 0) - (y.tie[i] || 0);
    if (diff) return diff;
  }
  return 0;
}

function lobbyComponents(id, hostId) {
  return [new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`poker_join:${id}`).setLabel('参加する').setEmoji('🃏').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`poker_start:${id}`).setLabel('ゲーム開始').setStyle(ButtonStyle.Primary)
  )];
}

function lobbyText(game) {
  const players = game.players.map(p => `• <@${p.id}>`).join('\n') || 'まだ参加者はいないのだ';
  return `🃏 **5カードドロー参加者募集！**\n主催者：<@${game.hostId}>\n\n${players}\n\n最大${MAX_PLAYERS}人・2人以上で開始できるのだ。手札は各自のDMにだけ送るぞい！`;
}

async function startPoker(interaction) {
  // 先に応答を確定させ、Discordの3秒タイムアウトを防ぐ
  if (!interaction.deferred && !interaction.replied) {
    await interaction.deferReply();
  }

  if (!interaction.guild) {
    return interaction.editReply({ content: 'サーバーのチャンネルで開始してほしいのだ。' });
  }

  const id = interaction.id;
  const game = {
    id,
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    hostId: interaction.user.id,
    players: [{ id: interaction.user.id, user: interaction.user, hand: [], selected: [], done: false }],
    phase: 'lobby',
    round: 1,
    discard: [],
    message: null
  };

  games.set(id, game);

  try {
    game.message = await interaction.editReply({
      content: lobbyText(game),
      components: lobbyComponents(id, game.hostId)
    });
  } catch (error) {
    games.delete(id);
    throw error;
  }
}

async function updateLobby(game) {
  if (game.message) await game.message.edit({ content: lobbyText(game), components: game.phase === 'lobby' ? lobbyComponents(game.id, game.hostId) : [] }).catch(()=>{});
}

function dmRows(game, player) {
  const select = new StringSelectMenuBuilder()
    .setCustomId(`poker_pick:${game.id}`)
    .setPlaceholder('交換したいカードを選択（最大5枚）')
    .setMinValues(0).setMaxValues(5)
    .addOptions(player.hand.map((card, i) => ({ label: `${i+1}枚目：${cardText(card)}`, value: String(i), description: '選択すると交換対象になるのだ' })));
  return [
    new ActionRowBuilder().addComponents(select),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`poker_exchange:${game.id}`).setLabel('このカードで確定').setEmoji('🔄').setStyle(ButtonStyle.Success)
    )
  ];
}

async function sendHand(game, player) {
  const embed = new EmbedBuilder().setColor(0x2E8B57)
    .setTitle(`🃏 貴方の手札（交換 ${game.round}/3回目）`)
    .setDescription(
      player.hand.map((card, i) => `**${i+1}.** ${cardText(card)}`).join('\n') +
      '\n\n交換するカードを選んで「このカードで確定」を押すのだ。最大5枚、交換は合計3回まで！0枚交換も可能ぞい。'
    )
    .setFooter({ text: 'この手札は貴方にしか見えないのだ' });
  await player.user.send({ embeds: [embed], components: dmRows(game, player) });
}

async function finishGame(game) {
  game.phase = 'finished';
  const sorted = game.players.map(p => ({ player: p, result: evaluate(p.hand) }))
    .sort((a,b) => compareHands(b.player.hand, a.player.hand));
  const best = sorted[0];
  const winners = sorted.filter(x => compareHands(x.player.hand, best.player.hand) === 0);
  const placeMarks = ['🥇', '🥈', '🥉', '❹', '❺', '❻'];
  const lines = sorted.map((x, i) => `${placeMarks[i] || `❹`} <@${x.player.id}> — **${x.result.name}**（${x.player.hand.map(cardText).join(' ')}）`).join('\n');
  const content = `🎉 **5カードドロー結果発表！**\n交換回数：${game.round}/3回\n\n${lines}\n\n${winners.length > 1 ? '引き分けなのだ！' : `優勝は <@${winners[0].player.id}> なのだ！`}\n\nそ〜いや、最後まで勝負を諦めぬとは見上げたものですぞ！……まぁ、次は和紙が勝つのだ。`;
  await game.message.edit({ content, components: [] }).catch(()=>{});
  for (const p of game.players) {
    p.user.send('ゲーム終了！対戦チャンネルで結果を確認するのだ。').catch(()=>{});
  }
  games.delete(game.id);
}

async function handlePokerInteraction(interaction) {
  const [action, id] = interaction.customId.split(':');
  const game = games.get(id);
  if (!game) return interaction.reply({ content: 'このゲームは終了したか、見つからないのだ。', ephemeral: true });

  if (action === 'poker_join') {
    if (game.phase !== 'lobby') return interaction.reply({ content: 'もう募集は終了したのだ。', ephemeral: true });
    if (game.players.some(p=>p.id===interaction.user.id)) return interaction.reply({ content: '既に参加しているのだ！', ephemeral: true });
    if (game.players.length >= MAX_PLAYERS) return interaction.reply({ content: '満員なのだ。', ephemeral: true });
    try { await interaction.user.send('5カードドローへの参加を確認したのだ！ゲーム開始後に手札を送るぞい。'); }
    catch { return interaction.reply({ content: 'DMを送れないため参加できないのだ。DiscordのサーバーDM設定を確認してほしいのだ。', ephemeral: true }); }
    game.players.push({ id: interaction.user.id, user: interaction.user, hand: [], selected: [], done: false });
    await interaction.reply({ content: '参加したのだ！手札が届くまで待つのだ。', ephemeral: true });
    return updateLobby(game);
  }

  if (action === 'poker_start') {
    if (interaction.user.id !== game.hostId) return interaction.reply({ content: '開始できるのは主催者だけなのだ。', ephemeral: true });
    if (game.phase !== 'lobby') return interaction.reply({ content: '既に開始しているのだ。', ephemeral: true });
    if (game.players.length < 2) return interaction.reply({ content: '2人以上集まってから開始するのだ。', ephemeral: true });
    const deck = makeDeck();
    for (const p of game.players) p.hand = deck.splice(0, 5);
    game.deck = deck;
    game.discard = [];
    game.phase = 'exchange';
    await interaction.update({ content: `🃏 **ゲーム開始！**\n参加者全員にDMで手札を送ったのだ。DMで交換するカードを選ぶのだ！\n交換完了：0/${game.players.length}`, components: [] });
    for (const p of game.players) {
      try { await sendHand(game, p); }
      catch {
        game.phase = 'cancelled';
        games.delete(game.id);
        return interaction.followUp({ content: `<@${p.id}> にDMを送れなかったためゲームを中止したのだ。全員の手札は無効にしたぞい。` });
      }
    }
    return;
  }

  if (action === 'poker_pick') {
    if (game.phase !== 'exchange' || interaction.guild) return interaction.reply({ content: 'この操作は手札が届いたDM内で行うのだ。', ephemeral: true });
    const player = game.players.find(p=>p.id===interaction.user.id);
    if (!player || player.done) return interaction.reply({ content: 'このゲームの参加者ではないか、既に交換を確定しているのだ。', ephemeral: true });
    player.selected = interaction.values.map(Number);
    return interaction.reply({ content: `${player.selected.length}枚を交換対象にしたのだ。最大5枚まで選べるぞい。`, ephemeral: true });
  }

  if (action === 'poker_exchange') {
    if (game.phase !== 'exchange' || interaction.guild) return interaction.reply({ content: 'この操作は手札が届いたDM内で行うのだ。', ephemeral: true });
    const player = game.players.find(p=>p.id===interaction.user.id);
    if (!player || player.done) return interaction.reply({ content: 'このゲームの参加者ではないか、既に確定済みなのだ。', ephemeral: true });
    const count = player.selected.length;
    const discarded = [];
    for (const index of [...player.selected].sort((a,b)=>b-a)) {
      discarded.push(player.hand.splice(index, 1)[0]);
    }
    game.discard.push(...discarded);
    player.hand.push(...drawCards(game, count));
    player.done = true;
    await interaction.update({ content: `第${game.round}回目の交換完了！新しい手札：**${player.hand.map(cardText).join(' ')}**\n他の参加者の確定を待つのだ。`, embeds: [], components: [] });
    const done = game.players.filter(p=>p.done).length;
    await game.message.edit({ content: `🃏 **第${game.round}/3回目の交換中…**\n交換完了：${done}/${game.players.length}人\n全員が確定すると次の交換に進むのだ！`, components: [] }).catch(()=>{});
    if (done === game.players.length) {
      if (game.round >= 3) return finishGame(game);
      game.round += 1;
      for (const p of game.players) {
        p.done = false;
        p.selected = [];
      }
      await game.message.edit({ content: `🃏 **第${game.round}/3回目の交換開始！**\n全員に新しい手札をDMで送ったのだ。今回も最大5枚まで交換できるぞい。\n交換完了：0/${game.players.length}人`, components: [] }).catch(()=>{});
      for (const p of game.players) {
        try {
          await sendHand(game, p);
        } catch {
          game.phase = 'cancelled';
          games.delete(game.id);
          await interaction.followUp({ content: `<@${p.id}> に次の手札をDMで送れなかったため、ゲームを中止したのだ。` }).catch(()=>{});
          return;
        }
      }
    }
  }
}

module.exports = { startPoker, handlePokerInteraction };
