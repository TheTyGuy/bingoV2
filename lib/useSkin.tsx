import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ACTIVE_SKIN } from '@/skin.config';
import { SKINS, isSkinId, type Skin } from '@/skins';

const PREVIEW_KEY = 'kabingo:skin-preview';
const SkinContext = createContext<Skin>(SKINS[ACTIVE_SKIN]);

/** Applies the active skin, or a ?skin=<id> preview that sticks for this browser tab. */
export function SkinProvider({ children }: { children: ReactNode }) {
  const [skin, setSkin] = useState<Skin>(SKINS[ACTIVE_SKIN]);

  useEffect(() => {
    let preview: string | null = null;
    try {
      const fromUrl = new URLSearchParams(window.location.search).get('skin');
      if (fromUrl === 'default') sessionStorage.removeItem(PREVIEW_KEY);
      else if (isSkinId(fromUrl)) sessionStorage.setItem(PREVIEW_KEY, fromUrl);
      preview = sessionStorage.getItem(PREVIEW_KEY);
    } catch {
      /* storage blocked: no preview */
    }
    const next = SKINS[isSkinId(preview) ? preview : ACTIVE_SKIN];
    document.documentElement.dataset.skin = next.id;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next.themeColor);
    setSkin(next);
  }, []);

  return <SkinContext.Provider value={skin}>{children}</SkinContext.Provider>;
}

export const useSkin = () => useContext(SkinContext);
