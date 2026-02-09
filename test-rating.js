const CHARSET = '56ABCDEFGHIKMQRSTWYaceghjklnopwxy';
const charToVal = {};
CHARSET.split('').forEach((c, i) => charToVal[c] = i);

const ROOM_TYPE_IDS = {
  0: 'empty', 1: 'path', 2: 'entry', 3: 'boss', 4: 'corruption', 5: 'sacrifice',
  6: 'alchemy_lab', 7: 'armoury', 8: 'flesh_surgeon', 9: 'garrison',
  10: 'generator', 11: 'golem_works', 12: 'reward_currency', 13: 'smithy',
  14: 'synthflesh', 15: 'thaumaturge', 16: 'transcendent_barracks', 17: 'vault',
  18: 'viper_legion_barracks', 19: 'viper_spymaster', 20: 'commander',
  21: 'architect', 22: 'altar_of_sacrifice', 23: 'sacrificial_chamber',
  24: 'reward_room', 25: 'medallion_bonus', 26: 'medallion_reroll',
  27: 'medallion_levelup', 28: 'medallion_increase_max',
  29: 'medallion_prevent_delete', 30: 'medallion_increase_tokens', 31: 'unknown'
};

const ROOM_TYPES = {
  'alchemy_lab': { type: 'reward' }, 'armoury': { type: 'reward' },
  'corruption': { type: 'special' }, 'flesh_surgeon': { type: 'reward' },
  'garrison': { type: 'reward' }, 'generator': { type: 'reward' },
  'golem_works': { type: 'reward' }, 'reward_currency': { type: 'reward' },
  'smithy': { type: 'reward' }, 'synthflesh': { type: 'reward' },
  'thaumaturge': { type: 'reward' }, 'transcendent_barracks': { type: 'reward' },
  'vault': { type: 'reward' }, 'viper_legion_barracks': { type: 'reward' },
  'viper_spymaster': { type: 'reward' }, 'commander': { type: 'architect' },
  'architect': { type: 'architect' }, 'atziri': { type: 'boss' },
  'empty': { type: 'empty' }, 'path': { type: 'path' },
  'reward_room': { type: 'reward' },
  'medallion_bonus': { type: 'special' }, 'medallion_reroll': { type: 'special' },
  'medallion_levelup': { type: 'special' }, 'medallion_increase_max': { type: 'special' },
  'medallion_prevent_delete': { type: 'special' }, 'medallion_increase_tokens': { type: 'special' },
};

const encoded = process.argv[2] || 'AEghSCFIIjFoMSF6cHpwaTESEkhwcGpwanApKSFpeQCYAGoSEkgyMWkAAHAxMSE5EnB6gHppaEhgKREpESlwMSE5YDlhABF5EkghSCEIQCkRKQ';

const values = encoded.split('').map(c => charToVal[c]);
let bitString = '';
values.forEach(v => bitString += v.toString(2).padStart(5, '0'));

const grid = {};
let pos = 0;
while (pos + 16 <= bitString.length) {
  const x = parseInt(bitString.substring(pos, pos + 4), 2);
  const y = parseInt(bitString.substring(pos + 4, pos + 8), 2);
  const roomTypeId = parseInt(bitString.substring(pos + 8, pos + 13), 2);
  const tier = parseInt(bitString.substring(pos + 13, pos + 16), 2);
  pos += 16;
  
  if (x < 16 && y < 16) {
    const roomName = ROOM_TYPE_IDS[roomTypeId] || 'unknown';
    const key = x + ',' + y;
    grid[key] = { x, y, room: roomName, tier };
  }
}

// Analyze
const rooms = Object.values(grid);
let rewardRooms = 0, architectRooms = 0, bossRooms = 0, totalRooms = 0;
let entryPos = { x: 999, y: 999 };

rooms.forEach(room => {
  if (room.room === 'empty' || room.room === 'path') return;
  totalRooms++;
  const info = ROOM_TYPES[room.room] || { type: 'unknown' };
  if (info.type === 'reward') rewardRooms++;
  if (info.type === 'architect') architectRooms++;
  if (room.room === 'atziri') bossRooms++;
  if (room.y < entryPos.y) entryPos = { x: room.x, y: room.y };
});

const rewardDensity = totalRooms > 0 ? (rewardRooms / totalRooms) * 100 : 0;
console.log('Total Rooms:', totalRooms);
console.log('Reward Rooms:', rewardRooms);
console.log('Architects:', architectRooms);
console.log('Reward Density:', rewardDensity.toFixed(1) + '%');

// Calculate score
const rewardScore = Math.min(40, rewardDensity * 0.8);
const techScore = rewardDensity >= 50 ? 15 : 0;
const totalScore = Math.round(rewardScore + techScore);

let stars;
if (totalScore >= 90) stars = '5 stars - God Tier';
else if (totalScore >= 75) stars = '4.5 stars - Excellent';
else if (totalScore >= 60) stars = '4 stars - Very Good';
else if (totalScore >= 45) stars = '3.5 stars - Good';
else if (totalScore >= 30) stars = '3 stars - Average';
else stars = '2 stars - Below Average';

console.log('\nTotal Score:', totalScore);
console.log('Star Rating:', stars);
console.log('Reward Score:', Math.round(rewardScore), '/40');
console.log('Tech Score:', techScore, '/60');

