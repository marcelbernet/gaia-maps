import React from 'react';
import { useTranslation } from 'react-i18next';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181B2A] rounded-lg shadow-xl w-full max-w-[85vw] xs:max-w-xs sm:max-w-sm mx-auto p-2 sm:p-5 border border-gray-700">
        <h2 className="text-base sm:text-2xl font-bold text-white mb-4">{t('about_modal.title')}</h2>
        <div className="text-xs sm:text-sm text-gray-300 space-y-3">
          <p>{t('about_modal.p1')}</p>
          <p>{t('about_modal.p2')}</p>
          <p>{t('about_modal.p3')}</p>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-transparent text-white font-semibold py-2 px-4 border border-white rounded hover:bg-white hover:text-black transition-colors duration-200"
          >
            {t('about_modal.close_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
