import { FORTUNE_TYPES } from './constants';

/**
 * Implements the two-stage probability model for drawing a fortune,
 * identical to the backend logic.
 * @returns {string} A fortune value (e.g., '大吉').
 */
export const drawFortuneLocally = () => {
  // Destructure for easier access
  const { S_KICHI, DAI_KICHI, KICHI, CHU_KICHI, SHO_KICHI, KYO, DAI_KYO } = FORTUNE_TYPES;

  const goodFortunes = [S_KICHI, DAI_KICHI, KICHI, CHU_KICHI, SHO_KICHI];
  const badFortunes = [KYO, DAI_KYO];

  // First stage: 80% chance for a good fortune pool
  if (Math.random() <= 0.8) {
    // Second stage: Equal chance within the good pool
    const index = Math.floor(Math.random() * goodFortunes.length);
    return goodFortunes[index];
  } else {
    // Second stage: Equal chance within the bad pool
    const index = Math.floor(Math.random() * badFortunes.length);
    return badFortunes[index];
  }
};