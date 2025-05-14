import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaStar, FaUsers, FaChartLine, FaExternalLinkAlt } from 'react-icons/fa';

const AppCard = ({ app, onLaunch }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden hover:bg-gray-700/50 transition-all border border-gray-700/50">
      {/* 应用头部 */}
      <div className="p-4 flex items-center">
        <div className="w-12 h-12 flex-shrink-0 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
          {app.logo ? (
            <img src={app.logo} alt={app.name} className="w-8 h-8" />
          ) : (
            <span className="text-2xl">{app.icon}</span>
          )}
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-lg">{app.name}</h3>
          <p className="text-sm text-gray-300 line-clamp-1">
            {t(app.descriptionKey)}
          </p>
        </div>
      </div>

      {/* 应用统计 */}
      <div className="px-4 py-2 bg-gray-900/50 flex items-center justify-between text-sm">
        {app.userCount && (
          <div className="flex items-center text-gray-400">
            <FaUsers className="mr-1" />
            {app.userCount}
          </div>
        )}
        {app.tvl && (
          <div className="flex items-center text-gray-400">
            <FaChartLine className="mr-1" />
            {app.tvl}
          </div>
        )}
        {app.rating && (
          <div className="flex items-center text-yellow-400">
            <FaStar className="mr-1" />
            {app.rating}
          </div>
        )}
      </div>

      {/* 应用标签 */}
      {app.tags && app.tags.length > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-2">
          {app.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 启动按钮 */}
      <div className="p-4 border-t border-gray-700/50">
        <button
          onClick={() => onLaunch(app)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
        >
          <FaExternalLinkAlt className="mr-2" size={12} />
          {t('appHub.launch')}
        </button>
      </div>
    </div>
  );
};

export default AppCard; 