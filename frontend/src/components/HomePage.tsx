import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

interface HomePageProps {
  onNavigate: (mode: 'aboveYou' | 'specialStar') => void;
  onAbout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onAbout }) => {
  const { t, i18n } = useTranslation();
  const [showLanguages, setShowLanguages] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLanguages(false);
  };
  return (
    <div className="fixed inset-0 min-h-screen h-screen w-full bg-[#181B2A] flex flex-col items-center justify-start overflow-y-auto px-2">
      <div className="text-center">
        <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-white mb-2 px-2 leading-tight break-words">{t('home.title')}</h1>
        <div className="text-[10px] sm:text-xs md:text-base text-gray-300 mb-5 max-w-xs sm:max-w-2xl mx-auto px-3">
          <p>{t('home.subtitle1')}</p>
          <p><Trans i18nKey="home.subtitle2">But the one <span style={{background: 'linear-gradient(90deg, #6ec1e4 40%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 600}}>right above</span> you right now?</Trans></p>
          <p><Trans i18nKey="home.subtitle3">Or the one <span style={{background: 'linear-gradient(90deg, #6ec1e4 40%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 600}}>right above</span> you when you where born?</Trans></p>
          <p>{t('home.subtitle4')}</p>
          <p>{t('home.subtitle5')}</p>
        </div>
        <div className="flex flex-col items-center gap-3 mb-6 w-full px-4 mt-3">
          <button
            className="action-btn w-full max-w-[95vw] sm:max-w-xs font-bold rounded-xl border-none shadow-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-60 leading-none whitespace-nowrap truncate overflow-hidden block"
            style={{ background: 'linear-gradient(90deg, #fde047 0%, #ec4899 100%)', lineHeight: '1', padding: '1rem', boxSizing: 'border-box' }}
            onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #ec4899 0%, #fde047 100%)')}
            onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #fde047 0%, #ec4899 100%)')}
            onClick={() => onNavigate('aboveYou')}
          >
            {t('home.button_above_you')}
          </button>
          <button
            className="action-btn w-full max-w-[95vw] sm:max-w-xs font-bold rounded-xl border-none shadow-md text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 leading-none whitespace-nowrap truncate overflow-hidden block"
            style={{ background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)', lineHeight: '1', padding: '1rem', boxSizing: 'border-box'}}
            onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #a855f7 0%, #38bdf8 100%)')}
            onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)')}
            onClick={() => onNavigate('specialStar')}
          >
            {t('home.button_special_star')}
          </button>
          <div className="w-full max-w-[95vw] sm:max-w-xs flex flex-row justify-center items-center gap-1 mt-2 relative">
            <button
              className="secondary-button w-1/2 text-[8px] sm:text-[10px] py-2 leading-none truncate"
              onClick={onAbout}
              aria-label="About"
            >
              {t('home.button_about')}
            </button>
            <button
              className="secondary-button w-1/2 text-[8px] sm:text-[10px] py-2 leading-none truncate"
              onClick={() => setShowLanguages(!showLanguages)}
              aria-label="Language"
            >
              {t('home.button_language')}
            </button>
            {showLanguages && (
              <div className="absolute bottom-full mb-2 flex flex-col items-center gap-1 p-2 bg-[rgba(30,34,54,0.95)] rounded-lg">
                <button onClick={() => changeLanguage('en')} aria-label="English" className="w-6 h-4"><img src="/flags/en.png" alt="English flag" className="w-full h-full object-cover rounded-sm" /></button>
                <button onClick={() => changeLanguage('ca')} aria-label="Catalan" className="w-6 h-4"><img src="/flags/ca.png" alt="Catalan flag" className="w-full h-full object-cover rounded-sm" /></button>
                <button onClick={() => changeLanguage('es')} aria-label="Spanish" className="w-6 h-4"><img src="/flags/es.png" alt="Spanish flag" className="w-full h-full object-cover rounded-sm" /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
