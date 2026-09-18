import React from 'react';
import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '@/i18n';

const LanguageToggle: React.FC = () => {
  const { t, i18n } = useTranslation();
  const current = i18n.language?.startsWith('en') ? 'en' : 'sv';

  return (
    <div className="langToggle" role="group" aria-label={t('lang.label')}>
      <button
        type="button"
        className={`langToggleBtn${current === 'sv' ? ' is-active' : ''}`}
        onClick={() => setAppLanguage('sv')}
        aria-pressed={current === 'sv'}
      >
        {t('lang.sv')}
      </button>
      <button
        type="button"
        className={`langToggleBtn${current === 'en' ? ' is-active' : ''}`}
        onClick={() => setAppLanguage('en')}
        aria-pressed={current === 'en'}
      >
        {t('lang.en')}
      </button>
    </div>
  );
};

export default LanguageToggle;
