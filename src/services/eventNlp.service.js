const natural = require('natural');

/* Initialize tokenizer */
const tokenizer = new natural.WordTokenizer();

/* Filter out common words */
const STOP_WORDS = new Set([
  'this', 'that', 'with', 'from', 'have', 'your', 'about', 'there', 'where', 'when', 'what',
  'will', 'would', 'could', 'should', 'into', 'onto', 'over', 'under', 'than', 'then', 'them',
  'they', 'their', 'ours', 'ourselves', 'you', 'yours', 'ours', 'just', 'some', 'more', 'very',
  'also', 'only', 'join', 'event', 'events', 'people', 'group', 'together', 'the', 'and', 'for',
  'are', 'was', 'were', 'been', 'to', 'of', 'in', 'on', 'at', 'is', 'it', 'a', 'an', 'or', 'as',
]);

/* Map keywords to event categories */
const CATEGORY_HINTS = {
  meetup: ['network', 'social', 'friends', 'community', 'hangout', 'meetup'],
  travel: ['trip', 'travel', 'explore', 'journey', 'backpacking', 'tour'],
  adventure: ['hiking', 'trek', 'climb', 'camp', 'rafting', 'adventure', 'trail'],
  cultural: ['culture', 'museum', 'heritage', 'festival', 'art', 'tradition'],
  food: ['food', 'eat', 'dinner', 'brunch', 'cafe', 'restaurant', 'cooking'],
  sports: ['sports', 'football', 'cricket', 'run', 'gym', 'fitness', 'yoga'],
  other: [],
};

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
  /* Use custom description if provided */
  const categoryKey = String(category || 'other').toLowerCase();
  
  if (description && description.trim().length >= 50) {
    return description.trim();
  }

  const intro = getRandomItem(CATEGORY_INTROS[categoryKey] || CATEGORY_INTROS.other);
  const vibe = getRandomItem(CATEGORY_VIBES[categoryKey] || CATEGORY_VIBES.other);
  const closing = getRandomItem(CLOSINGS);
  const capacityLine = getCapacityVibe(maxParticipants);

  let timelineInfo = '';
  if (date && time) {
    timelineInfo = `We're meeting on ${date} at ${time}. `;
  } else if (date) {
    timelineInfo = `Mark your calendar for ${date}. `;
  }

  let titleContext = '';
  if (title && title.length > 5) {
    titleContext = ` This is all about ${title.toLowerCase()}. `;
  }

  let capacityContext = '';
  if (capacityLine) {
    capacityContext = ` We're ${capacityLine}, so you'll really get to know everyone. `;
  }

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

/* Extract and stem tokens */
const normalizeTokens = (text = '') => {
  return tokenizer
    .tokenize(String(text || '').toLowerCase())
    .map((word) => natural.PorterStemmer.stem(word.replace(/[^a-z0-9]/g, '')))
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
};

/* Score event categories from preferences */
const buildJoinedCategoryWeights = (joinedEvents = []) => {
  const categoryCounts = joinedEvents.reduce((acc, event) => {
    const category = String(event.category || 'other').toLowerCase();
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const maxCount = Math.max(1, ...Object.values(categoryCounts));
  const weights = {};
  Object.keys(categoryCounts).forEach((category) => {
    weights[category] = categoryCounts[category] / maxCount;
  });

  return weights;
};

/* Extract keywords from user joined events */
const collectJoinedKeywords = (joinedEvents = []) => {
  const frequency = {};

  joinedEvents.forEach((event) => {
    const tokens = normalizeTokens(`${event.title || ''} ${event.description || ''}`);
    tokens.forEach((token) => {
      frequency[token] = (frequency[token] || 0) + 1;
    });
  });

  return new Set(
    Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([token]) => token)
  );
};

/* Get user interest tokens */
const collectInterestTokens = (userProfile = {}) => {
  const parts = [
    ...(userProfile.interests || []),
    ...(userProfile.travelStyles || []),
    userProfile.bio || '',
    userProfile.location || '',
  ];

  return new Set(normalizeTokens(parts.join(' ')));
};

const scoreCategoryFromInterests = (interestTokens, category) => {
  const hints = CATEGORY_HINTS[String(category || 'other').toLowerCase()] || [];
  if (!hints.length) return 0;

  const hintMatches = hints.reduce((count, hint) => {
    return count + (interestTokens.has(natural.PorterStemmer.stem(hint)) ? 1 : 0);
  }, 0);

  return Math.min(24, hintMatches * 8);
};

/* Score and recommend events */
const recommendEventsForUser = ({
  events = [],
  userProfile = {},
  userEmail = '',
  limit = 6,
} = {}) => {
  const normalizedEmail = String(userEmail || '').toLowerCase();
  const now = new Date();

  const joinedEvents = events.filter((event) => {
    const isCreator = String(event.createdByEmail || '').toLowerCase() === normalizedEmail;
    const isParticipant = (event.participants || []).some(
      (participant) => String(participant.userEmail || '').toLowerCase() === normalizedEmail
    );
    return isCreator || isParticipant;
  });

  const joinedIds = new Set(joinedEvents.map((event) => String(event._id)));
  const joinedCategoryWeights = buildJoinedCategoryWeights(joinedEvents);
  const joinedKeywords = collectJoinedKeywords(joinedEvents);
  const interestTokens = collectInterestTokens(userProfile);

  const candidates = events.filter((event) => {
    const eventId = String(event._id || '');
    const startTime = new Date(event.startTime);
    if (!eventId || joinedIds.has(eventId)) return false;
    if (Number.isNaN(startTime.getTime()) || startTime <= now) return false;
    return true;
  });

  const scored = candidates.map((event) => {
    const category = String(event.category || 'other').toLowerCase();
    const eventTokens = new Set(normalizeTokens(`${event.title || ''} ${event.description || ''}`));
    const reasons = [];
    let score = 0;

    const categoryPreference = joinedCategoryWeights[category] || 0;
    if (categoryPreference > 0) {
      const categoryScore = Math.round(categoryPreference * 36);
      score += categoryScore;
      reasons.push(`You often join ${category} events`);
    }

    const interestMatchCount = [...interestTokens].filter((token) => eventTokens.has(token)).length;
    if (interestMatchCount > 0) {
      const interestScore = Math.min(30, interestMatchCount * 6);
      score += interestScore;
      reasons.push('Matches your profile interests');
    }

    const keywordMatches = [...joinedKeywords].filter((token) => eventTokens.has(token)).length;
    if (keywordMatches > 0) {
      const historyScore = Math.min(24, keywordMatches * 4);
      score += historyScore;
      reasons.push('Similar to events you joined before');
    }

    const categoryFromInterestScore = scoreCategoryFromInterests(interestTokens, category);
    if (categoryFromInterestScore > 0) {
      score += categoryFromInterestScore;
      reasons.push('Category aligns with your interests');
    }

    const startTime = new Date(event.startTime);
    const daysUntil = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntil >= 0 && daysUntil <= 14) {
      score += 8;
      reasons.push('Happening soon');
    }

    if (score === 0) {
      score = 8;
      reasons.push('New event you have not joined yet');
    }

    return {
      event,
      score,
      reason: reasons[0] || 'Recommended for you',
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

module.exports = {
  generateHumanDescription,
  improveEventDraft,
  recommendEventsForUser,
};
