import crypto from "crypto";

/**
 * Generate a unique gift card code
 * Format: XXXX-XXXX-XXXX-XXXX (16 characters)
 */
export function generateGiftCardCode(): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars: 0, O, I, 1
  const segments = 4;
  const segmentLength = 4;
  const code: string[] = [];

  for (let i = 0; i < segments; i++) {
    let segment = "";
    for (let j = 0; j < segmentLength; j++) {
      const randomIndex = crypto.randomInt(0, characters.length);
      segment += characters[randomIndex];
    }
    code.push(segment);
  }

  return code.join("-");
}

/**
 * Validate gift card code format
 */
export function isValidGiftCardCodeFormat(code: string): boolean {
  // Format: XXXX-XXXX-XXXX-XXXX
  const pattern = /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
  return pattern.test(code);
}