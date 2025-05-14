import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHub from './pages/AppHub';

// 导入国际化配置
import './i18n.js'

// 加载状态组件
const LoadingComponent = () => (
  <div className="flex items-center justify-center h-screen bg-gray-900">
    <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<AppHub />} />
        {/* 其他页面路由 */}
      </Routes>
    </Router>
  </React.StrictMode>,
)
