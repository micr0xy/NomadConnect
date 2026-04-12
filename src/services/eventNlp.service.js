// Human-like event description generator with natural language patterns
const natural = require('natural');

const tokenizer = new natural.WordTokenizer();

const CATEGORY_INTROS = {
  meetup: [
    "Let's grab some time to hang out and meet new people!",
    "Come meet some friendly faces and have a great time.",
    "Join us for a casual hangout with cool people.",
    "Wanna meet up and chill with like-minded folks?",
    "Let's connect and share stories over a good time.",
  ],
  travel: [
    "Ready for an adventure? Join us exploring some amazing spots!",
    "Let's discover cool places together and make some memories.",
    "Traveling with friends is always better. Come along!",
    "You in for some spontaneous exploring?",
    "Adventure awaits! Let's explore together.",
  ],
  adventure: [
    "If you're up for some excitement, this is for you!",
    "Looking for something thrilling? We've got you covered.",
    "Let's do something fun and get our adrenaline pumping!",
    "Ready to try something new and adventurous?",
    "Come push your limits and have the time of your life!",
  ],
  cultural: [
    "Interested in diving into some cool cultural experiences?",
    "Let's explore culture, art, and traditions together.",
    "Come celebrate and learn about different cultures with us.",
    "If you love learning about new cultures, you'll love this!",
    "Let's appreciate what makes different cultures amazing.",
  ],
  food: [
    "Foodies unite! Come enjoy some amazing food with us.",
    "Let's eat good food and meet great people.",
    "If you love eating and hanging out, this one's for you.",
    "Come discover some tasty stuff with us!",
    "Food brings people together. Let's make it happen!",
  ],
  sports: [
    "Sports and fun! Come join the action.",
    "Let's get active and have some competitive fun.",
    "Whether you're pro or just for fun, join us!",
    "Come play, compete, and make some friends.",
    "Sports is more fun with a group. Let's go!",
  ],
  other: [
    "Got something fun planned and want more people?",
    "Let's get together and make something awesome happen.",
    "Come hang out and see what happens!",
    "Open to new experiences? Let's connect!",
    "Let's create a fun memory together.",
  ],
};

const CATEGORY_VIBES = {
  meetup: [
    "chill and relaxed",
    "friendly and welcoming",
    "casual and fun",
    "laid-back atmosphere",
  ],
  travel: [
    "exciting and exploratory",
    "adventurous vibes",
    "discovery-focused",
    "wanderlust-driven",
  ],
  adventure: [
    "thrilling and action-packed",
    "exciting and bold",
    "high-energy fun",
    "adrenaline-fueled",
  ],
  cultural: [
    "educational and enriching",
    "thoughtful and respectful",
    "culturally open-minded",
    "appreciation-focused",
  ],
  food: [
    "delicious and social",
    "foodie-friendly",
    "tasty and fun",
    "savory experience",
  ],
  sports: [
    "active and competitive",
    "fitness-focused",
    "team-oriented",
    "skill-building",
  ],
  other: [
    "unique and special",
    "one-of-a-kind",
    "interesting and fun",
    "memorable",
  ],
};

const CLOSINGS = [
  "See you there! 👋",
  "Hope to see you! 🙂",
  "Can't wait to meet you!",
  "Looking forward to it!",
  "Let's make it awesome together!",
  "Who's in? 🎉",
  "Hope you can make it!",
  "Be there or be square!",
  "Let's have a blast!",
  "See you soon! 😊",
];

const CAPACITY_LINES = {
  small: "keeping it intimate with a small group",
  medium: "good number of people to keep things fun",
  large: "bringing together a bigger crowd of adventurers",
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const extractCategoryKeywords = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  const words = tokenizer.tokenize(text);
  const keywords = words
    .filter((w) => w.length > 3 && !['that', 'this', 'what', 'when', 'where', 'and', 'the', 'for'].includes(w))
    .slice(0, 3);
  return keywords;
};

const getCapacityVibe = (maxParticipants) => {
  if (!maxParticipants) return '';
  if (maxParticipants <= 5) return CAPACITY_LINES.small;
  if (maxParticipants <= 15) return CAPACITY_LINES.medium;
  return CAPACITY_LINES.large;
};

const generateHumanDescription = ({
  title = '',
  category = 'other',
  description = '',
  maxParticipants = null,
  date = '',
  time = '',
} = {}) => {
  const categoryKey = String(category || 'other').toLowerCase();
  
  // Use existing description if good enough
  if (description && description.trim().length >= 50) {
    return description.trim();
  }

  // Build natural description from scratch
  const intro = getRandomItem(CATEGORY_INTROS[categoryKey] || CATEGORY_INTROS.other);
  const vibe = getRandomItem(CATEGORY_VIBES[categoryKey] || CATEGORY_VIBES.other);
  const closing = getRandomItem(CLOSINGS);
  const capacityLine = getCapacityVibe(maxParticipants);

  // Build timeline info naturally
  let timelineInfo = '';
  if (date && time) {
    timelineInfo = `We're meeting on ${date} at ${time}. `;
  } else if (date) {
    timelineInfo = `Mark your calendar for ${date}. `;
  }

  // Optional: mention title keywords if title is descriptive
  let titleContext = '';
  if (title && title.length > 5) {
    titleContext = ` This is all about ${title.toLowerCase()}. `;
  }

  // Capacity context
  let capacityContext = '';
  if (capacityLine) {
    capacityContext = ` We're ${capacityLine}, so you'll really get to know everyone. `;
  }

  // Combine into natural paragraph
  const fullDescription = `${intro}${titleContext} The vibe is ${vibe}. ${timelineInfo}${capacityContext}${closing}`;

  return fullDescription.replace(/\s+/g, ' ').trim();
};

const improveEventDraft = ({
  title = '',
  description = '',
  category = 'other',
  maxParticipants = null,
  date = '',
  time = '',
} = {}) => {
  const improvedDesc = generateHumanDescription({
    title,
    category,
    description,
    maxParticipants,
    date,
    time,
  });

  return {
    title: title.trim() || 'Fun Event',
    description: improvedDesc,
    suggestions: [],
  };
};

module.exports = {
  generateHumanDescription,
  improveEventDraft,
};
