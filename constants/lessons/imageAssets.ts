import type { ImageKey } from './types';

/**
 * Static imageKey → bundled-asset map. Metro requires `require()` calls to be
 * literal at compile time, so adding new images means editing this file.
 *
 * Drop image files into assets/images/ and add an entry like:
 *   'scene/living-room-greeting': require('../../assets/images/scene/living-room-greeting.png'),
 *
 * If a key is missing here, components fall back to the soft tinted placeholder.
 */
const IMAGE_ASSETS: Partial<Record<ImageKey, number>> = {
  // intentionally empty — images to be supplied later
};

export function resolveImage(imageKey: ImageKey | undefined): number | null {
  if (!imageKey) return null;
  return IMAGE_ASSETS[imageKey] ?? null;
}
