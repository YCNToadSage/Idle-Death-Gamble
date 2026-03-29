# Idle-Death-Gamble
repo for JJK RP discord bot that simulates Kinji Hakari's gambling system from Jujutsu Kaisen with stat and leaderboard commands, as well as dynamic rolls.

# Features

# Domain activation (!h-domain)
- starts IDG sequence.
- locks user as caster per server.

# Turn-based rolling (!h-endturn)
- Ends your turn and triggers a gamble roll
- only usable for active caster
- automatically resets after usage
 
# Roll System
- Random roll from 1-50
- Determines color and the boost its tied with, and the scenario selection
  - Green (no boost)
  - Red (5% boost)
  - Gold (10% boost)
  - Rainbow (Guarunteed jackpot)
 
# Scenario System
Each scenario has its own success threshold that scales difficulty and adds variation to outcomes.
- Transit Card Riichi
- Seat Struggle Riichi
- Potty Emergency Riichi
- Friday Night Final Train Riichi

# Jackpot
Jackpot chance is influenced by:
- base scenario threshold
- Roll-based boost %
- Pity system
  - +12 threshold per failed roll
  - guarunteed jackpot after 4 misses in a row
- Active Jackpot bonus (chain effect)
  - When active, +75 bonus to future rolls for a duration 

# Stats (!h-stats)
persistent player data is stored in stats.json 
- Number of rolls
- Number of jackpot hits
- Win rate
- Current streak
- Best streak
- Pity counter

# Leaderboard (!h-top)
Premium
- Global top 5 players
- Ranked by total jackpots
- Displays rolls and jackpot count

# Premium System
- Supports premium servers and users

# Anti crash protection
- Handles uncaught exceptions
- Prevents bot shutdown
