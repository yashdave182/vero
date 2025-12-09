/**
 * Avatar Generator Utility
 * Generates unique Bitmoji-style avatars for each user using DiceBear Avatars API
 * Each user gets a consistent, unique avatar based on their user ID
 */

// Avatar styles available (Bitmoji-like styles)
const AVATAR_STYLES = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'avataaars-neutral',
  'big-smile',
  'bottts',
  'bottts-neutral',
  'fun-emoji',
  'lorelei',
  'lorelei-neutral',
  'micah',
  'miniavs',
  'notionists',
  'notionists-neutral',
  'open-peeps',
  'personas',
  'pixel-art',
  'pixel-art-neutral',
];

// Default style (most Bitmoji-like)
const DEFAULT_STYLE = 'avataaars';

// Background colors for variety
const BACKGROUND_COLORS = [
  'b6e3f4',
  'c0aede',
  'd1d4f9',
  'ffd5dc',
  'ffdfbf',
];

/**
 * Generates a consistent hash from a string (user ID)
 * @param {string} str - Input string to hash
 * @returns {number} - Hash value
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Selects a style based on user ID
 * @param {string} userId - User's unique ID
 * @returns {string} - Avatar style
 */
function selectStyleForUser(userId) {
  if (!userId) return DEFAULT_STYLE;
  const hash = simpleHash(userId);
  const index = hash % AVATAR_STYLES.length;
  return AVATAR_STYLES[index];
}

/**
 * Selects a background color based on user ID
 * @param {string} userId - User's unique ID
 * @returns {string} - Background color hex (without #)
 */
function selectBackgroundForUser(userId) {
  if (!userId) return BACKGROUND_COLORS[0];
  const hash = simpleHash(userId + 'bg');
  const index = hash % BACKGROUND_COLORS.length;
  return BACKGROUND_COLORS[index];
}

/**
 * Generates avatar URL using DiceBear API
 * @param {string} userId - User's unique identifier (UID)
 * @param {Object} options - Additional options
 * @param {string} options.seed - Custom seed (defaults to userId)
 * @param {string} options.style - Avatar style (defaults to user-specific style)
 * @param {number} options.size - Avatar size in pixels (default: 200)
 * @param {string} options.backgroundColor - Background color hex (without #)
 * @returns {string} - Avatar image URL
 */
export function generateAvatarUrl(userId, options = {}) {
  const seed = options.seed || userId || 'default';
  const style = options.style || selectStyleForUser(userId);
  const size = options.size || 200;
  const backgroundColor = options.backgroundColor || selectBackgroundForUser(userId);

  // Using DiceBear API v7
  const baseUrl = 'https://api.dicebear.com/7.x';

  // Build URL with parameters
  const params = new URLSearchParams({
    seed: seed,
    size: size.toString(),
    backgroundColor: backgroundColor,
    backgroundType: 'solid',
  });

  return `${baseUrl}/${style}/svg?${params.toString()}`;
}

/**
 * Generates avatar for a user with consistent styling
 * @param {Object} user - User object
 * @param {string} user.uid - User ID
 * @param {string} user.email - User email (fallback seed)
 * @param {string} user.displayName - User display name (fallback seed)
 * @returns {string} - Avatar image URL
 */
export function getUserAvatar(user) {
  if (!user) {
    return generateAvatarUrl('anonymous');
  }

  // Use UID as primary seed, fallback to email or displayName
  const seed = user.uid || user.email || user.displayName || 'default';

  return generateAvatarUrl(seed, {
    size: 200,
  });
}

/**
 * Generates a thumbnail version of the avatar
 * @param {string} userId - User's unique identifier
 * @param {number} size - Thumbnail size (default: 64)
 * @returns {string} - Avatar thumbnail URL
 */
export function getAvatarThumbnail(userId, size = 64) {
  return generateAvatarUrl(userId, { size });
}

/**
 * Generates avatar with custom style
 * @param {string} userId - User's unique identifier
 * @param {string} style - Avatar style name
 * @returns {string} - Avatar image URL
 */
export function getAvatarWithStyle(userId, style) {
  if (!AVATAR_STYLES.includes(style)) {
    console.warn(`Invalid avatar style: ${style}. Using default.`);
    return generateAvatarUrl(userId);
  }

  return generateAvatarUrl(userId, { style });
}

/**
 * Preloads avatar image for better performance
 * @param {string} url - Avatar URL to preload
 * @returns {Promise} - Resolves when image is loaded
 */
export function preloadAvatar(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Gets all available avatar styles
 * @returns {Array<string>} - Array of style names
 */
export function getAvailableStyles() {
  return [...AVATAR_STYLES];
}

/**
 * Generates multiple avatar options for user selection
 * @param {string} userId - User's unique identifier
 * @param {number} count - Number of options to generate (default: 6)
 * @returns {Array<Object>} - Array of avatar options with URL and style
 */
export function generateAvatarOptions(userId, count = 6) {
  const options = [];
  const selectedStyles = [];

  // Select diverse styles
  for (let i = 0; i < count && i < AVATAR_STYLES.length; i++) {
    const styleIndex = Math.floor((i * AVATAR_STYLES.length) / count);
    selectedStyles.push(AVATAR_STYLES[styleIndex]);
  }

  selectedStyles.forEach(style => {
    options.push({
      style,
      url: generateAvatarUrl(userId, { style }),
      thumbnail: generateAvatarUrl(userId, { style, size: 64 }),
    });
  });

  return options;
}

/**
 * Checks if a URL is a generated avatar
 * @param {string} url - URL to check
 * @returns {boolean} - True if URL is a generated avatar
 */
export function isGeneratedAvatar(url) {
  return url && url.includes('api.dicebear.com');
}

/**
 * Creates avatar data URL for offline usage or embedding
 * @param {string} userId - User's unique identifier
 * @returns {Promise<string>} - Data URL of the avatar
 */
export async function getAvatarDataUrl(userId) {
  const avatarUrl = generateAvatarUrl(userId);

  try {
    const response = await fetch(avatarUrl);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error generating avatar data URL:', error);
    throw error;
  }
}

export default {
  generateAvatarUrl,
  getUserAvatar,
  getAvatarThumbnail,
  getAvatarWithStyle,
  preloadAvatar,
  getAvailableStyles,
  generateAvatarOptions,
  isGeneratedAvatar,
  getAvatarDataUrl,
};
