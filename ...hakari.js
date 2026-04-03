// Hakari.js — FULL VERSION (Stable, Clean, No Emojis)

// ===== PREMIUM =====
const premium_servers = ['1302906556299612192'];
const premium_users = ['1068696094197960774'];

function ispremium(message) {
  return (
    premium_servers.includes(message.guild.id) ||
    premium_users.includes(message.author.id)
  );
}

// ===== DEPENDENCIES =====
const fs = require('fs');
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

// ===== CRASH PROTECTION =====
process.on('uncaughtException', (err) =>
  console.error('Uncaught Exception:', err),
);
process.on('unhandledRejection', (err) =>
  console.error('Unhandled Rejection:', err),
);

// ===== LOAD STATS =====
let playerStats = {};
try {
  if (fs.existsSync('stats.json')) {
    const data = fs.readFileSync('stats.json', 'utf8');
    playerStats = data ? JSON.parse(data) : {};
  }
} catch {
  playerStats = {};
}

function saveStats() {
  fs.writeFileSync('stats.json', JSON.stringify(playerStats, null, 2));
}

function getPlayer(userId) {
  if (!playerStats[userId]) {
    playerStats[userId] = {
      rolls: 0,
      jackpots: 0,
      currentStreak: 0,
      bestStreak: 0,
      jackpotTurns: 0,
      pity: 0,
      jackpotMode: null,
    };
  }
  return playerStats[userId];
}

// ===== DISCORD CLIENT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const activeCaster = new Map();

// ===== READY EVENT =====
client.once('ready', () => {
  console.log(`LOGGED IN AS ${client.user.tag}`);
  console.log(`Connected to ${client.guilds.cache.size} guild(s).`);
});

// ===== SPIN LOGIC =====
function runSingleSpin(player, spinIndex) {
  let roll = Math.floor(Math.random() * 50) + 1;
  let boostPercent = 0;
  let color = 'Green';

  if (roll >= 26 && roll <= 41) {
    color = 'Red';
    boostPercent = 5;
  } else if (roll >= 42 && roll <= 49) {
    color = 'Gold';
    boostPercent = 10;
  } else if (roll === 50) {
    color = 'Rainbow';
    boostPercent = 100;
  }

  const scenarios = [
    { name: 'Transit Card Riichi', successThreshold: 47 },
    { name: 'Seat Struggle Riichi', successThreshold: 95 },
    { name: 'Potty Emergency Riichi', successThreshold: 120 },
    { name: 'Final Train Riichi', successThreshold: 239 },
  ];

  let scenario =
    scenarios[color === 'Rainbow' ? 3 : Math.floor(Math.random() * 4)];

  let adjustedThreshold = scenario.successThreshold;

  if (color !== 'Rainbow') {
    adjustedThreshold += Math.floor(
      (scenario.successThreshold * boostPercent) / 100,
    );
  }

  if (!(player.jackpotTurns > 0 && player.jackpotMode === 'fast')) {
    adjustedThreshold += Math.min(player.pity * 6, 40);
  }

  if (player.jackpotTurns > 0) {
    if (player.jackpotMode === 'probability') adjustedThreshold += 30;
    if (player.jackpotMode === 'fast') {
      adjustedThreshold = Math.floor(adjustedThreshold * 0.6);
      if (spinIndex === 1)
        adjustedThreshold = Math.floor(adjustedThreshold * 0.6);
    }
  }

  if (adjustedThreshold > 239) adjustedThreshold = 239;

  const jackpotRoll = Math.floor(Math.random() * 239) + 1;
  const jackpot = color === 'Rainbow' || jackpotRoll <= adjustedThreshold;

  return { roll, color, scenario, jackpot };
}

// ===== MESSAGE HANDLER =====
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    const content = message.content.toLowerCase();

    // DOMAIN
    if (content === '!h-domain') {
      activeCaster.set(message.guild.id, message.author.id);
      return message.channel.send(
        `Domain activated for <@${message.author.id}>!\nUse !h-endturn`,
      );
    }

    // END TURN
    if (content === '!h-endturn') {
      if (activeCaster.get(message.guild.id) !== message.author.id) return;

      const player = getPlayer(message.author.id);
      player.rolls++;

      if (player.jackpotTurns > 0) {
        player.jackpotMode = Math.random() < 0.65 ? 'probability' : 'fast';
      }

      const spins =
        player.jackpotTurns > 0 && player.jackpotMode === 'fast' ? 2 : 1;
      const results = [];

      for (let i = 0; i < spins; i++) {
        results.push(runSingleSpin(player, i));
      }

      let response = '';

      for (let i = 0; i < results.length; i++) {
        const spin = results[i];
        response += `Spin ${i + 1}: ${spin.roll} (${spin.color})\n`;
        response += `Scenario: ${spin.scenario.name}\n`;

        if (spin.jackpot) {
          player.jackpots++;
          player.currentStreak++;
          player.pity = 0;
          player.jackpotTurns = 4;
          if (player.currentStreak > player.bestStreak)
            player.bestStreak = player.currentStreak;
          response += `JACKPOT!\n`;
        } else {
          player.currentStreak = 0;
          if (!(player.jackpotTurns > 0 && player.jackpotMode === 'fast'))
            player.pity++;
          response += `No Jackpot...\n`;
        }

        response += `\n`;
      }

      if (player.jackpotTurns > 0) {
        player.jackpotTurns--;
        if (player.jackpotTurns === 0) {
          player.jackpotMode = null;
          response += `Jackpot ended.\n`;
        } else {
          if (player.jackpotMode === 'fast')
            response += `<@${message.author.id}> Fast Spins! (${player.jackpotTurns} turns)\n`;
          else
            response += `<@${message.author.id}> Probability Shifts! (${player.jackpotTurns} turns)\n`;
        }
      }

      saveStats();
      await message.channel.send(response);
      activeCaster.delete(message.guild.id);
    }

    // STATS
    if (content === '!h-stats') {
      if (!ispremium(message)) return message.reply('Premium only');
      const p = getPlayer(message.author.id);
      const winRate = p.rolls ? ((p.jackpots / p.rolls) * 100).toFixed(1) : 0;
      return message.reply(
        `Stats for ${message.author.username}:


Rolls: ${p.rolls}
Jackpots: ${p.jackpots}
Win Rate: ${winRate}%
Current Streak: ${p.currentStreak}
Best Streak: ${p.bestStreak}`,
      );
    }

    // TOP
    if (content === '!h-top') {
      if (!ispremium(message)) return message.reply('Premium only');
      const players = Object.entries(playerStats)
        .sort((a, b) => b[1].jackpots - a[1].jackpots)
        .slice(0, 5);

      if (!players.length) return message.reply('No data');

      let board = 'Top Players:\n\n';
      players.forEach(([userId, stats], i) => {
        board += `#${i + 1} <@${userId}> — ${stats.jackpots} jackpots\n`;
      });
      return message.channel.send(board);
    }
  } catch (err) {
    console.error('Command error:', err);
  }
});

// ===== LOGIN =====
client.login(process.env.DISCORD_TOKEN);
