import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  initGameStorage,
  markSplashSeen,
  type GameStorageState,
} from '@/lib/storage';

const SPLASH_MS = 2800;

interface SplashScreenProps {
  onReady: (storage: GameStorageState) => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onReady }) => {
  const { t } = useTranslation();
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const [phase, setPhase] = useState<'checking' | 'show' | 'done'>('checking');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const storage = initGameStorage();

    if (storage.splashSeen) {
      setPhase('done');
      onReadyRef.current(storage);
      return;
    }

    setPhase('show');
    const started = Date.now();
    const tick = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - started) / SPLASH_MS) * 100);
      setProgress(pct);
    }, 50);

    const done = window.setTimeout(() => {
      markSplashSeen();
      setPhase('done');
      onReadyRef.current({ ...storage, splashSeen: true });
    }, SPLASH_MS);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, []);

  if (phase !== 'show') return null;

  return (
    <div className="splashScreen" role="status" aria-live="polite">
      <div className="splashCabinet">
        <p className="splashEyebrow">{t('splash.eyebrow')}</p>
        <img
          className="splashLogo"
          src="/chemquest/text.gif"
          alt={t('splash.title')}
        />
        <h1 className="splashTitle">{t('splash.title')}</h1>
        <p className="splashTagline">{t('splash.tagline')}</p>

        <div className="splashLoader" aria-hidden="true">
          <div className="splashLoaderTrack">
            <div
              className="splashLoaderFill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="splashLoaderLabel">{t('splash.loading')}</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
export { SPLASH_MS };
