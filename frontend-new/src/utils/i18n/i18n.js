import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// 导入语言文件
import en from './locales/en.json';
import zh from './locales/zh.json';

// 资源配置
const resources = {
  en: {
    translation: en
  },
  zh: {
    translation: zh
  }
};

i18n
  // 加载语言文件的http后端
  .use(Backend)
  // 语言检测功能
  .use(LanguageDetector)
  // 将i18n实例传递给react-i18next
  .use(initReactI18next)
  // 初始化i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // 常用命名空间，可以用来组织translations
    ns: ['translation'],
    defaultNS: 'translation',
    
    interpolation: {
      escapeValue: false, // 不需要转义，React已经处理了
      formatSeparator: ',',
    },
    
    // 检测用户语言首选项
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
    
    react: {
      useSuspense: true, // false在服务器端渲染时
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
      skipTranslationOnMissingKey: false,
    }
  });

export default i18n; 