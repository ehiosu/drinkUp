export type GameInfo = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  minPlayers: number;
  maxPlayers: number;
  needsAI?: boolean;
};

export const games: GameInfo[] = [
  {
    id: "truth-or-drink",
    name: "Truth or Drink",
    description: "Answer the question honestly... or take a drink",
    icon: "🍷",
    color: "from-rose-500 to-pink-600",
    minPlayers: 2,
    maxPlayers: 20,
  },
  {
    id: "never-have-i-ever",
    name: "Never Have I Ever",
    description: "Drink if you've done it!",
    icon: "🙈",
    color: "from-violet-500 to-purple-600",
    minPlayers: 2,
    maxPlayers: 20,
  },
  {
    id: "most-likely-to",
    name: "Most Likely To",
    description: "Vote on who's most likely to... losers drink!",
    icon: "👑",
    color: "from-amber-500 to-orange-600",
    minPlayers: 3,
    maxPlayers: 20,
  },
  {
    id: "kings-cup",
    name: "Kings Cup",
    description: "Draw cards, follow rules, don't break the king's cup!",
    icon: "🃏",
    color: "from-emerald-500 to-green-600",
    minPlayers: 2,
    maxPlayers: 10,
  },
  {
    id: "spin-the-bottle",
    name: "Spin the Bottle",
    description: "Spin and face your fate - dare or drink!",
    icon: "🍾",
    color: "from-cyan-500 to-blue-600",
    minPlayers: 3,
    maxPlayers: 20,
  },
  {
    id: "would-you-rather",
    name: "Would You Rather",
    description: "Choose wisely... minority drinks!",
    icon: "🤔",
    color: "from-red-500 to-rose-600",
    minPlayers: 2,
    maxPlayers: 20,
  },
  {
    id: "guess-the",
    name: "Guess The...",
    description: "3 hints. Wrong guess = drink. Can you figure it out?",
    icon: "🔍",
    color: "from-yellow-500 to-amber-600",
    minPlayers: 2,
    maxPlayers: 20,
    needsAI: true,
  },
  {
    id: "countdown",
    name: "Countdown",
    description: "Name X things in Y seconds... or drink!",
    icon: "⏱️",
    color: "from-fuchsia-500 to-pink-600",
    minPlayers: 2,
    maxPlayers: 20,
    needsAI: true,
  },
  {
    id: "low-card",
    name: "Low Card",
    description: "Draw a card. The lowest take a shot!",
    icon: "🎴",
    color: "from-sky-500 to-indigo-600",
    minPlayers: 2,
    maxPlayers: 10,
  },
  {
    id: "guess-it",
    name: "Guess It",
    description: "Everyone guesses. Wrong = take a shot!",
    icon: "🎯",
    color: "from-lime-500 to-emerald-600",
    minPlayers: 2,
    maxPlayers: 20,
    needsAI: true,
  },
];

export const truthOrDrinkQuestions = [
  "What's the most embarrassing thing you've done while drunk?",
  "Have you ever sent a text you immediately regretted?",
  "What's your most unpopular opinion?",
  "Have you ever pretended to like a gift you hated?",
  "What's the biggest lie you've told to get out of plans?",
  "Have you ever stalked an ex on social media?",
  "What's the weirdest thing you've Googled?",
  "Have you ever had a crush on a friend's partner?",
  "What's the most childish thing you still do?",
  "Have you ever blamed a fart on someone else?",
  "What's the worst date you've ever been on?",
  "Have you ever re-gifted a present?",
  "What's the most embarrassing song on your playlist?",
  "Have you ever lied on your resume?",
  "What's your guilty pleasure TV show?",
  "Have you ever pretended to be sick to skip work/school?",
  "What's the pettiest reason you've stopped talking to someone?",
  "Have you ever eaten food off the floor?",
  "What's the longest you've gone without showering?",
  "Have you ever faked being good at something?",
  "What's the most money you've wasted on something stupid?",
  "Have you ever snooped through someone's phone?",
  "What's your biggest insecurity?",
  "Have you ever been caught in a lie?",
  "What's the worst advice you've ever given?",
];

export const neverHaveIEverStatements = [
  "Never have I ever ghosted someone",
  "Never have I ever drunk texted an ex",
  "Never have I ever been kicked out of a bar",
  "Never have I ever lied about my age",
  "Never have I ever eaten an entire pizza by myself",
  "Never have I ever gone skinny dipping",
  "Never have I ever been on TV",
  "Never have I ever called in sick to binge a show",
  "Never have I ever cried during a movie",
  "Never have I ever had a one-night stand",
  "Never have I ever been in a car accident",
  "Never have I ever broken a bone",
  "Never have I ever traveled alone",
  "Never have I ever danced on a table",
  "Never have I ever been arrested",
  "Never have I ever stolen something",
  "Never have I ever kissed a stranger",
  "Never have I ever gotten a tattoo",
  "Never have I ever been to a nude beach",
  "Never have I ever regifted something",
  "Never have I ever pretended to like someone's cooking",
  "Never have I ever forgotten someone's name mid-conversation",
  "Never have I ever walked into a glass door",
  "Never have I ever faked an accent",
  "Never have I ever been on a blind date",
];

export const mostLikelyToPrompts = [
  "Most likely to become famous",
  "Most likely to survive a zombie apocalypse",
  "Most likely to get lost in their own city",
  "Most likely to become a millionaire",
  "Most likely to go viral on social media",
  "Most likely to cry at a commercial",
  "Most likely to forget their own birthday",
  "Most likely to win a reality TV show",
  "Most likely to sleep through an earthquake",
  "Most likely to accidentally start a fire",
  "Most likely to marry a celebrity",
  "Most likely to get banned from a buffet",
  "Most likely to show up to the wrong wedding",
  "Most likely to text the wrong person something embarrassing",
  "Most likely to eat something off the ground",
  "Most likely to get into a fight with an animal",
  "Most likely to become president",
  "Most likely to be late to their own funeral",
  "Most likely to still use a flip phone",
  "Most likely to win a hot dog eating contest",
];

export const wouldYouRatherQuestions = [
  {
    optionA: "Only be able to whisper",
    optionB: "Only be able to shout",
  },
  {
    optionA: "Have no internet for a month",
    optionB: "Have no phone for a month",
  },
  {
    optionA: "Always be 10 minutes late",
    optionB: "Always be 20 minutes early",
  },
  {
    optionA: "Have hiccups forever",
    optionB: "Always feel like you need to sneeze",
  },
  {
    optionA: "Be able to fly but only 2 feet off the ground",
    optionB: "Be invisible but only when no one is looking",
  },
  {
    optionA: "Speak every language fluently",
    optionB: "Play every instrument perfectly",
  },
  {
    optionA: "Have a rewind button for your life",
    optionB: "Have a pause button for your life",
  },
  {
    optionA: "Only eat pizza for a year",
    optionB: "Never eat pizza again",
  },
  {
    optionA: "Be famous but broke",
    optionB: "Be rich but unknown",
  },
  {
    optionA: "Have a personal chef",
    optionB: "Have a personal chauffeur",
  },
  {
    optionA: "Know how you die",
    optionB: "Know when you die",
  },
  {
    optionA: "Live without music",
    optionB: "Live without movies",
  },
  {
    optionA: "Always have to say everything on your mind",
    optionB: "Never speak again",
  },
  {
    optionA: "Be able to talk to animals",
    optionB: "Be able to read minds",
  },
  {
    optionA: "Have unlimited money",
    optionB: "Have unlimited time",
  },
];

// ---- Low Card ----
export type PlayingCard = {
  value: string;
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank: number; // 2..14 (Ace high)
};

export function generateStandardDeck(): PlayingCard[] {
  const suits: PlayingCard["suit"][] = [
    "hearts",
    "diamonds",
    "clubs",
    "spades",
  ];
  const values = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];

  const deck: PlayingCard[] = [];
  for (const suit of suits) {
    values.forEach((value, i) => {
      deck.push({ value, suit, rank: i + 2 });
    });
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

// ---- Guess It ----
export type GuessItQuestion = {
  question: string;
  answer: string;
};

export const guessItQuestions: GuessItQuestion[] = [
  { question: "Guess the year the first iPhone was released", answer: "2007" },
  { question: "Guess how many bones are in the adult human body", answer: "206" },
  { question: "Guess the boiling point of water in Fahrenheit", answer: "212°F" },
  { question: "Guess how many keys are on a standard piano", answer: "88" },
  { question: "Guess the number of players on a soccer team (on the field)", answer: "11" },
  { question: "Guess the year the Titanic sank", answer: "1912" },
  { question: "Guess how many hearts an octopus has", answer: "3" },
  { question: "Guess the tallest mountain on Earth (name)", answer: "Mount Everest" },
  { question: "Guess how many continents there are", answer: "7" },
  { question: "Guess the chemical symbol for gold", answer: "Au" },
  { question: "Guess the number of strings on a standard guitar", answer: "6" },
  { question: "Guess the year the Berlin Wall fell", answer: "1989" },
  { question: "Guess how many sides a hexagon has", answer: "6" },
  { question: "Guess the largest planet in our solar system", answer: "Jupiter" },
  { question: "Guess how many minutes are in a full day", answer: "1440" },
  { question: "Guess the speed of light (km/s, rounded)", answer: "~300,000 km/s" },
  { question: "Guess the number of legs on a spider", answer: "8" },
  { question: "Guess the year the World Wide Web was invented", answer: "1989" },
  { question: "Guess how many colors are in a rainbow", answer: "7" },
  { question: "Guess the smallest prime number", answer: "2" },
];

export type KingsCupCard = {
  value: string;
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rule: string;
  description: string;
};

export function generateDeck(): KingsCupCard[] {
  const suits: KingsCupCard["suit"][] = [
    "hearts",
    "diamonds",
    "clubs",
    "spades",
  ];
  const values = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  const rules: Record<string, { rule: string; description: string }> = {
    A: {
      rule: "Waterfall",
      description:
        "Everyone starts drinking. You can't stop until the person before you stops.",
    },
    "2": {
      rule: "You",
      description: "Pick someone to drink.",
    },
    "3": {
      rule: "Me",
      description: "You drink!",
    },
    "4": {
      rule: "Floor",
      description:
        "Last person to touch the floor drinks.",
    },
    "5": {
      rule: "Guys",
      description: "All guys drink.",
    },
    "6": {
      rule: "Chicks",
      description: "All girls drink.",
    },
    "7": {
      rule: "Heaven",
      description:
        "Last person to raise their hand drinks.",
    },
    "8": {
      rule: "Mate",
      description:
        "Pick a drinking buddy. They drink when you drink for the rest of the game.",
    },
    "9": {
      rule: "Rhyme",
      description:
        "Say a word. Go around and rhyme. First person who can't, drinks.",
    },
    "10": {
      rule: "Categories",
      description:
        "Pick a category. Go around naming things. First person who can't, drinks.",
    },
    J: {
      rule: "Make a Rule",
      description:
        "Create a rule that everyone must follow. Anyone who breaks it drinks.",
    },
    Q: {
      rule: "Question Master",
      description:
        "You're the Question Master. Anyone who answers your questions must drink.",
    },
    K: {
      rule: "King's Cup",
      description:
        "Pour some of your drink into the King's Cup. The 4th King drinks it all!",
    },
  };

  const deck: KingsCupCard[] = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        value,
        suit,
        rule: rules[value].rule,
        description: rules[value].description,
      });
    }
  }

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}
