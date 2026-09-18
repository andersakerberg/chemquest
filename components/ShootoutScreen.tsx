import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const MAX_HP = 50;

interface ShootoutScreenProps {
  yourHp: number;
  copHp: number;
  combatLog: string[];
  onFire: () => void;
  onRun: () => void;
}

const HpBar: React.FC<{ label: string; hp: number; side: 'hero' | 'cop' }> = ({
  label,
  hp,
  side,
}) => {
  const pct = Math.max(0, Math.min(100, Math.round((hp / MAX_HP) * 100)));
  return (
    <div className={`shootHp shootHp-${side}`}>
      <div className="shootHpTop">
        <span>{label}</span>
        <span>
          {Math.max(0, hp)}/{MAX_HP}
        </span>
      </div>
      <div className="shootHpTrack">
        <div className="shootHpFill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const ShootoutScreen: React.FC<ShootoutScreenProps> = ({
  yourHp,
  copHp,
  combatLog,
  onFire,
  onRun,
}) => {
  const { t } = useTranslation();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [combatLog]);

  return (
    <div className="shootScreen">
      <div className="shootCabinet">
        <header className="shootHeader">
          <p className="shootEyebrow">{t('shoot.eyebrow')}</p>
          <h1 className="shootTitle">{t('shoot.title')}</h1>
          <p className="shootSubtitle">{t('shoot.subtitle')}</p>
        </header>

        <div className="shootArena">
          <div className="shootFighter shootHero">
            <HpBar label={t('shoot.you')} hp={yourHp} side="hero" />
            <div className="shootSpriteFrame">
              <img
                src="/chemquest/dealer.svg"
                alt={t('shoot.dealer')}
                className="shootSprite shootSprite-dealer"
              />
            </div>
            <p className="shootTag">{t('shoot.dealer')}</p>
          </div>

          <div className="shootVersus" aria-hidden="true">
            <span>VS</span>
          </div>

          <div className="shootFighter shootCop">
            <HpBar label={t('shoot.cop')} hp={copHp} side="cop" />
            <div className="shootSpriteFrame">
              <img
                src="/chemquest/cop.svg"
                alt={t('shoot.cop')}
                className="shootSprite shootSprite-cop"
              />
            </div>
            <p className="shootTag">{t('shoot.theLaw')}</p>
          </div>
        </div>

        <div className="shootLog" ref={logRef} aria-live="polite">
          {combatLog.length === 0 ? (
            <p className="shootLogLine shootLogEmpty">{t('shoot.logEmpty')}</p>
          ) : (
            combatLog.map((line, index) => (
              <p key={`${index}-${line}`} className="shootLogLine">
                {'> '}
                {line}
              </p>
            ))
          )}
        </div>

        <div className="shootActions">
          <button type="button" className="shootBtn shootFire" onClick={onFire}>
            <span className="shootBtnMain">{t('shoot.fire')}</span>
            <span className="shootBtnSub">{t('shoot.fireSub')}</span>
          </button>
          <button type="button" className="shootBtn shootRun" onClick={onRun}>
            <span className="shootBtnMain">{t('shoot.run')}</span>
            <span className="shootBtnSub">{t('shoot.runSub')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShootoutScreen;
export { MAX_HP };
