import * as prodConfig from './constants';
import * as localConfig from './constants.local';

// 环境类型
export const ENVIRONMENTS = {
  PRODUCTION: 'production',
  LOCAL: 'local'
};

// 从localStorage获取当前环境，默认为生产环境
const getCurrentEnvironment = () => {
  return localStorage.getItem('metaversex_environment') || ENVIRONMENTS.PRODUCTION;
};

// 设置当前环境
export const setEnvironment = (environment) => {
  if (Object.values(ENVIRONMENTS).includes(environment)) {
    localStorage.setItem('metaversex_environment', environment);
    // 刷新页面以应用新环境
    window.location.reload();
  } else {
    console.error('Invalid environment:', environment);
  }
};

// 切换环境
export const toggleEnvironment = () => {
  const currentEnv = getCurrentEnvironment();
  const newEnv = currentEnv === ENVIRONMENTS.PRODUCTION ? 
    ENVIRONMENTS.LOCAL : ENVIRONMENTS.PRODUCTION;
  setEnvironment(newEnv);
};

// 获取当前环境的配置
export const getConfig = () => {
  const currentEnv = getCurrentEnvironment();
  return currentEnv === ENVIRONMENTS.LOCAL ? localConfig : prodConfig;
};

// 获取当前环境名称
export const getEnvironmentName = () => {
  const currentEnv = getCurrentEnvironment();
  return currentEnv === ENVIRONMENTS.LOCAL ? '本地测试环境' : '正式环境';
};

// 导出当前配置，方便直接导入使用
export const { NETWORK, CONTRACT_ADDRESSES, UPLOAD_LIMITS, SUPPORTED_FORMATS, SPACE_TYPES, SPACE_SIZES, DEFAULT_NFT_METADATA } = getConfig(); 