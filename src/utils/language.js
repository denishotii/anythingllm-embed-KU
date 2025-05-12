import { enLabels, deLabels } from './labels';

export const detectLanguage = () => {
  const path = window.location.pathname;
  return path.startsWith('/en/') ? 'en' : 'de';
};

export const getLanguageLabels = (language) => {
  return language === 'en' ? enLabels : deLabels;
}; 