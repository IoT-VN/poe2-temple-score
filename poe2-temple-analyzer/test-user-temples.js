const { analyzeTemple, decodeTempleData, extractShareData } = require('./dist/index.js');

const temples = [
  { id: 1, url: 'http://localhost:8080/#/atziri-temple?t=AyFKIUohSiJJIkp6gnFpMQAAMiJwOjESIgCYaEp6YSkpSSIAMiJxOhESMUoiIkl6YioRaXFKSiJxOXkpEXkiITF6YHBBKRIwSmlwOWEIYTkxIuoKAggDJDAAgAAAlHB47Pk', expected: 4 },
  { id: 2, url: 'http://localhost:8080/#/atziri-temple?t=ACFIIUghSCFIIUhgOWA5YDlgSCE5ESkRKRE5IUhgKQCYACkySCE5EjEAeRFpIUhgcGl6cClwSCE5eXpwMRJ6IUgyaXBhOXGASCIxOWEIQGkxIg', expected: 5 }
];

console.log('Testing user-provided temples:\n');

temples.forEach(t => {
  const shareData = extractShareData(t.url);
  const templeData = decodeTempleData(shareData);
  const result = analyzeTemple(templeData);
  const isCorrect = result.starRating === t.expected;
  console.log(`Temple ${t.id}: ${result.totalScore} pts → ${result.starRating}★ (expected ${t.expected}★) ${isCorrect ? '✓' : '✗'}`);
  console.log(`  T7: ${result.t7Rooms}, T6: ${result.t6Rooms}, Spymasters: ${result.spymasters}, Golems: ${result.golems}`);
  console.log(`  Snake: ${result.snakeScore}, Room: ${result.roomScore}, Quantity: ${result.quantityScore}`);
  console.log('');
});
