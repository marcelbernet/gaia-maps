import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@headlessui/react';

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string | React.ReactNode;
}

const InfoModal: React.FC<InfoModalProps> = ({ open, onClose, title = 'Info', message }) => {
  const { t } = useTranslation();
  return (
  <Dialog open={open} onClose={onClose} className="fixed inset-0 z-40 flex items-center justify-center">
    <div className="fixed inset-0 bg-black bg-opacity-40" aria-hidden="true" />
    <div className="relative w-[90vw] max-w-sm md:max-w-md bg-[#1e2236] rounded-xl p-4 text-white shadow-xl overflow-y-auto max-h-[600px]">
      <Dialog.Title className="text-lg font-bold mb-2">{title}</Dialog.Title>
      <div className="text-sm whitespace-pre-line leading-relaxed">
        {message}
      </div>
      <div className="flex justify-end mt-4">
        <button className="px-3 py-1 text-sm bg-yellow-500 rounded-lg" onClick={onClose}>{t('common.got_it')}</button>
      </div>
    </div>
  </Dialog>
  );
};

export default InfoModal;
