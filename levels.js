// Définition partagée des 3 niveaux de lecture (utilisée par generate.js et exposée au frontend via /api/levels)
const LEVELS = [
  { key: 'debutant', emoji: '📖', name: 'Je commence', ageRange: '5-6 ans', minWords: 5, maxWords: 15, stars: 3 },
  { key: 'intermediaire', emoji: '📚', name: 'Je lis bien', ageRange: '7-9 ans', minWords: 20, maxWords: 40, stars: 4 },
  { key: 'expert', emoji: '🎓', name: 'Je maîtrise', ageRange: '10-12 ans', minWords: 80, maxWords: 100, stars: 5 }
];

const CONGRATS_MESSAGES = {
  debutant: 'Bravo ! Tu es un super lecteur ! 🌟',
  intermediaire: 'Excellent travail ! Tu lis de mieux en mieux ! 🏅',
  expert: 'Impressionnant, tu maîtrises la lecture ! 🏆'
};

module.exports = { LEVELS, CONGRATS_MESSAGES };
