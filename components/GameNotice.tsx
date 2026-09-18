import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export type NoticeTone = 'info' | 'danger' | 'success' | 'warn';

export interface GameNoticeData {
  id: number;
  title: string;
  message: string;
  tone: NoticeTone;
  actionLabel?: string;
  onDismiss?: () => void;
}

interface GameNoticeProps {
  notice: GameNoticeData | null;
  onClose: () => void;
}

const GameNotice: React.FC<GameNoticeProps> = ({ notice, onClose }) => {
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!notice) return;
    buttonRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [notice, onClose]);

  if (!notice) return null;

  return (
    <div className="gameNoticeOverlay" role="presentation" onClick={onClose}>
      <div
        className={`gameNoticeModal gameNotice-${notice.tone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="game-notice-title"
        aria-describedby="game-notice-body"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="gameNoticeEyebrow">{t('notice.eyebrow')}</p>
        <h2 id="game-notice-title" className="gameNoticeTitle">
          {notice.title}
        </h2>
        <p id="game-notice-body" className="gameNoticeBody">
          {notice.message}
        </p>
        <button
          ref={buttonRef}
          type="button"
          className="gameNoticeAction"
          onClick={onClose}
        >
          {notice.actionLabel ?? t('notice.ok')}
        </button>
      </div>
    </div>
  );
};

export default GameNotice;
