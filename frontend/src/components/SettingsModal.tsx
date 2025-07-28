import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@headlessui/react';

export type BrightnessMode = 'naked-eye' | 'bright' | 'faint' | 'all';

export interface StarSettings {
  brightnessMode: BrightnessMode;
  includeVelocity: boolean;
  includeDistance: boolean;
}

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: StarSettings;
  onApply: (s: StarSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose, settings, onApply }) => {
  const { t } = useTranslation();
  const [local, setLocal] = useState<StarSettings>(settings);

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  const brightnessOptions: { label: string; value: BrightnessMode }[] = [
    { label: t('settings.naked_eye'), value: 'naked-eye' },
    { label: t('settings.bright'), value: 'bright' },
    { label: t('settings.faint'), value: 'faint' },
    { label: t('settings.all'), value: 'all' },
  ];

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-40" aria-hidden="true" />
      <div className="relative w-[90vw] max-w-sm md:max-w-md bg-[#1e2236] rounded-xl p-4 text-white shadow-xl overflow-y-auto max-h-[600px]">
        <Dialog.Title className="text-lg font-bold mb-2">{t('settings.title')}</Dialog.Title>
        {/* Brightness */}
        <div className="mb-4">
          <p className="font-semibold mb-2">{t('settings.brightness')}</p>
          <div className="flex flex-col gap-1">
            {brightnessOptions.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="brightness"
                  value={opt.value}
                  checked={local.brightnessMode === opt.value}
                  onChange={() => setLocal({ ...local, brightnessMode: opt.value })}
                  className="form-radio text-yellow-400"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        {/* Toggles */}
        <div className="mb-4 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={local.includeVelocity}
              onChange={e => setLocal({ ...local, includeVelocity: e.target.checked })}
              className="form-checkbox text-sky-400"
            />
            {t('settings.include_velocity')}
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={local.includeDistance}
              onChange={e => setLocal({ ...local, includeDistance: e.target.checked })}
              className="form-checkbox text-purple-400"
            />
            {t('settings.include_distance')}
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button className="px-3 py-1 text-sm bg-gray-600 rounded-lg" onClick={onClose}>{t('common.cancel')}</button>
          <button className="px-3 py-1 text-sm bg-yellow-500 rounded-lg" onClick={handleApply}>{t('common.apply')}</button>
        </div>
      </div>
    </Dialog>
  );
};

export default SettingsModal;
