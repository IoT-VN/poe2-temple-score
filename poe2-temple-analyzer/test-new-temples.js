const { analyzeTemple, decodeTempleData, extractShareData } = require('./dist/index.js');

const temples = [
  { id: 1, url: 'https://sulozor.github.io/#/atziri-temple?t=ACFIIUghSCFIIUhgOWA5YDlgSCE5ESkRKRE5IUhgKQCYACkySCE5EjEAeRFpIUhgcGl6cClwSCE5eXpwMRJ6IUgyaXBhOXGASCIxOWEIQGkxIg', expected: 5 },
  { id: 2, url: 'https://sulozor.github.io/#/atziri-temple?t=ADAiSCIwIkgiMCIiMCJIIgAAIkhIMRIpMACYSCIiaXkRIkgAIjAwcHApESIxMCIieWoAKRJpIkhIaXAAOTFxSCIiMQAIYXqAIjFpcEEIYXBpMQ', expected: 1 },
  { id: 3, url: 'https://sulozor.github.io/#/atziri-temple?t=AyFKIUohSiJJIkp6gnFpMQAAMiJwOjESIgCYaEp6YSkpSSIAMiJxOhESMUoiIkl6YioRaXFKSiJxOXkpEXkiITF6YHBBKRIwSmlwOWEIYTkxIuoKAggDJDAAgAAAlHB47Pk', expected: 4 },
  { id: 4, url: 'https://sulozor.github.io/#/atziri-temple?t=AyIxIkkiMSJJIklJIjEiSQAAMSIiEioSIgCYIjEyKgAqMSIASSJqEnoSMkkiIklyKnFqanExMSKBEjFwaXkiIjF6eTlhMSJJSWlwcEEIYTkxIohGAAAIJIAAwKpWcrjp5r0', expected: 1 },
  { id: 5, url: 'https://sulozor.github.io/#/atziri-temple?t=ACJIIUghSCFIIjB6gHFpMQAAMCJwESkRIgCYIkh6KQApSCIASCFwEXkSMTAiIUh6KXBpaXBISCFwEjExInkiIUhpeTlhSCIwSCIxcEEIYTkxIg', expected: 3 },
  { id: 6, url: 'https://sulozor.github.io/#/atziri-temple?t=AEghSCFIIjFoMSF6cHpwaTESEkhwcGpwanApKSFpeQCYAGoSEkgyMWkAAHAxMSE5EnB6gHppaEhgKREpESlwMSE5YDlhABF5EkghSCEIQCkRKQ', expected: 5 }
];

console.log('Testing new set of 6 temples:\n');

let correct = 0;
temples.forEach(temple => {
  const shareData = extractShareData(temple.url);
  if (!shareData) {
    console.log(`Temple ${temple.id}: Failed to extract share data`);
    return;
  }

  const templeData = decodeTempleData(shareData);
  if (!templeData) {
    console.log(`Temple ${temple.id}: Failed to decode`);
    return;
  }

  const result = analyzeTemple(templeData);
  const isCorrect = result.starRating === temple.expected;
  if (isCorrect) correct++;

  console.log(`Temple ${temple.id}: ${result.totalScore} pts → ${result.starRating}★ (expected ${temple.expected}★) ${isCorrect ? '✓' : '✗'}`);
  console.log(`  Snake: ${result.snakeScore}, Room: ${result.roomScore}, Quantity: ${result.quantityScore}`);
  console.log(`  T7: ${result.t7Rooms}, T6: ${result.t6Rooms}, Spymasters: ${result.spymasters}, Golems: ${result.golems}`);
  console.log(`  Rooms: ${result.roomCount}, Rewards: ${result.rewardRooms}\n`);
});

console.log(`Results: ${correct}/6 correct (${Math.round(correct/6*100)}%)`);
