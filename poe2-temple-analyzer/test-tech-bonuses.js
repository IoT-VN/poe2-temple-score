const { analyzeTemple, decodeTempleData, extractShareData } = require('./dist/index.js');

// Test temple with potential tech bonuses
const templeUrl = 'https://sulozor.github.io/#/atziri-temple?t=ACFIIUghSCFIIUhgOWA5YDlgSCE5ESkRKRE5IUhgKQCYACkySCE5EjEAeRFpIUhgcGl6cClwSCE5eXpwMRJ6IUgyaXBhOXGASCIxOWEIQGkxIg';

console.log('Testing Tech Bonus Percentage Calculations:\n');

const shareData = extractShareData(templeUrl);
const templeData = decodeTempleData(shareData);
const result = analyzeTemple(templeData);

console.log(`Temple Score: ${result.totalScore} pts → ${result.starRating}★\n`);
console.log('Active Tech Bonuses:');
console.log('═'.repeat(60));

if (result.techBonuses && result.techBonuses.length > 0) {
  result.techBonuses.forEach((bonus) => {
    if (bonus.detected) {
      const indicator = '✨';
      const percentage = bonus.percentage > 0 ? ` [+${bonus.percentage}% of total]` : '';
      console.log(`${indicator} ${bonus.name}: ${bonus.description}${percentage}`);
      console.log(`   Score: +${bonus.score} points`);
      if (bonus.rooms && bonus.rooms.length > 0) {
        console.log(`   Rooms: ${bonus.rooms.length} affected`);
      }
      console.log('');
    }
  });
}

console.log('Summary:');
console.log(`Total Tech Score: +${result.techScore} points`);
if (result.techScore > 0) {
  console.log(`Contribution: ${Math.round((result.techScore / result.totalScore) * 100)}% of total score`);
}

console.log('\nTech Status:');
console.log(`  Russian Tech: ${result.hasRussianTech ? '✓' : '✗'}`);
console.log(`  Roman Road: ${result.hasRomanRoad ? '✓' : '✗'}`);
console.log(`  Double Triple: ${result.hasDoubleTriple ? '✓' : '✗'}`);
