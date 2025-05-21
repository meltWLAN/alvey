import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入翻译文件
import translationEN from './locales/en.json';
import translationZH from './locales/zh.json';

// 配置i18next
i18n
  .use(initReactI18next) // 将i18n实例传递给react-i18next
  .init({
    resources: {
      en: {
        translation: translationEN
      },
      zh: {
        translation: translationZH
      }
    },
    lng: 'zh', // 默认语言
    fallbackLng: 'en', // 如果当前语言的翻译缺失，回退到这个语言
    interpolation: {
      escapeValue: false // 不转义HTML内容
    },
    react: {
      useSuspense: false // 禁用Suspense，避免一些问题
    }
  });

export default i18n; 