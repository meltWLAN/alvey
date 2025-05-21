import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaTimes } from 'react-icons/fa';

const AppFilter = ({
  searchTerm,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  categories
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      {/* 搜索栏 */}
      <div className="mb-6 relative">
        <div className="flex items-center bg-gray-800 rounded-lg px-4 py-3 border border-gray-700">
          <FaSearch className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            className="bg-transparent flex-grow text-white focus:outline-none"
            placeholder={t('appHub.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => onSearchChange('')}
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* 类别导航 */}
      <div className="flex overflow-x-auto pb-4 no-scrollbar">
        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.icon && <span className="mr-2">{category.icon}</span>}
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppFilter; 