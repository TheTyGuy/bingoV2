import type { SkinId } from './skins';

/**
 * The skin everyone sees. Change this one line and push to swap the look.
 * Options: 'classic' | 'fall' | 'twilight'  (see skins/index.ts)
 *
 * Any page can also preview another skin by adding ?skin=<id> to its address;
 * ?skin=default goes back to this one.
 */
export const ACTIVE_SKIN: SkinId = 'fall';
