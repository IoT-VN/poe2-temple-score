const { analyzeTemple, decodeTempleData, extractShareData, evaluateTemple } = require('./dist/index.js');

// Test with a high-quality temple
const templeUrl = 'http://localhost:8080/#/atziri-temple?t=AyFKIUohSiJJIkp6gnFpMQAAMiJwOjESIgCYaEp6YSkpSSIAMiJxOhESMUoiIkl6YioRaXFKSiJxOXkpEXkiITF6YHBBKRIwSmlwOWEIYTkxIuoKAggDJDAAgAAAlHB47Pk';

console.log('════════════════════════════════════════════════════════════════');
console.log('          COMPREHENSIVE TEMPLE EVALUATION SYSTEM');
console.log('════════════════════════════════════════��═══════════════════════\n');

const shareData = extractShareData(templeUrl);
const templeData = decodeTempleData(shareData);

// Basic analysis
console.log('📊 BASIC ANALYSIS');
console.log('─'.repeat(60));
const analysis = analyzeTemple(templeData);
console.log(`Total Score: ${analysis.totalScore} pts`);
console.log(`Star Rating: ${'★'.repeat(analysis.starRating)}${'☆'.repeat(5 - analysis.starRating)} (${analysis.starRating}/5)`);
console.log(`Rooms: ${analysis.roomCount} | Rewards: ${analysis.rewardRooms}`);
console.log(`T7: ${analysis.t7Rooms} | T6: ${analysis.t6Rooms}`);
console.log(`Spymasters: ${analysis.spymasters} | Golems: ${analysis.golems}\n`);

// Comprehensive evaluation
console.log('🔗 CHAINED ROOM BONUSES');
console.log('─'.repeat(60));
const evaluation = evaluateTemple(templeData);

if (evaluation.chainedBonuses.length > 0) {
  evaluation.chainedBonuses.forEach((bonus, i) => {
    console.log(`${i + 1}. ${bonus.description}`);
    console.log(`   Multiplier: ${bonus.multiplier.toFixed(2)}x`);
    console.log(`   Rooms: ${bonus.rooms.length} affected\n`);
  });
} else {
  console.log('No significant chained room bonuses detected\n');
}

console.log('📚 STACKED ROOM BONUSES (with Diminishing Returns)');
console.log('─'.repeat(60));
if (evaluation.stackedBonuses.length > 0) {
  evaluation.stackedBonuses.forEach((bonus) => {
    console.log(`${bonus.roomType}:`);
    console.log(`   Count: ${bonus.count}`);
    console.log(`   Base Value: ${bonus.baseValue}`);
    console.log(`   Actual Value: ${bonus.actualValue}`);
    console.log(`   Diminishing Returns: -${bonus.diminishingReturn}%\n`);
  });
} else {
  console.log('No stacked valuable rooms detected\n');
}

console.log('👹 MONSTER SCALING');
console.log('─'.repeat(60));
const ms = evaluation.monsterScaling;
console.log(`Average Tier: T${ms.averageTier.toFixed(1)}`);
console.log(`Difficulty: ${ms.difficulty}`);
console.log(`Monster Density: ${ms.monsterDensity}%`);
console.log(`Rare Monster Chance: ${ms.rareMonsterChance}%`);
console.log(`Boss Present: ${ms.bossPresent ? '✓ Yes' : '✗ No'}\n`);

console.log('💰 LOOT MODIFIERS');
console.log('─'.repeat(60));
const loot = evaluation.lootModifiers;
console.log(`Currency Multiplier: ${loot.currencyMultiplier}x`);
console.log(`Rare Item Chance: ${loot.rareItemChance}%`);
console.log(`Unique Item Chance: ${loot.uniqueItemChance}%`);
console.log(`Corruption Available: ${loot.corruptionAvailable ? '✓ Yes' : '✗ No'}`);
console.log(`Sacrifice Value: ${loot.sacrificeValue} points\n`);

console.log('🌾 FARMING ASSESSMENT');
console.log('─'.repeat(60));
const farm = evaluation.farmingAssessment;
console.log(`Currency Farming: ${farm.currencyFarming}`);
console.log(`Rare Monster Farming: ${farm.rareMonsterFarming}`);
console.log(`Item Farming: ${farm.itemFarming}`);
console.log(`Overall: ${farm.overallSuitability}\n`);

console.log('⚖️  RISK vs REWARD ANALYSIS');
console.log('─'.repeat(60));
const rr = evaluation.riskReward;
console.log(`Risk Level: ${rr.riskLevel}`);
console.log(`Reward Potential: ${rr.rewardPotential}`);
console.log(`Time Investment: ${rr.timeInvestment}`);
console.log(`Recommendation: ${rr.recommendation}\n`);

console.log('════════════════════════════════════════════════════════════════');
