import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import tushare as ts
import akshare as ak
from datetime import datetime, timedelta

class DataProcessor:
    def __init__(self, token):
        self.token = token
        ts.set_token(token)
        self.pro = ts.pro_api()
        self.scaler = MinMaxScaler()
    
    def get_stock_data(self, stock_code, start_date, end_date):
        """获取股票历史数据"""
        try:
            # 使用tushare获取基础行情数据
            df = self.pro.daily(ts_code=stock_code, start_date=start_date, end_date=end_date)
            
            # 使用akshare获取技术指标数据
            stock_code_ak = stock_code.split('.')[0]
            tech_df = ak.stock_zh_a_hist(symbol=stock_code_ak, period='daily',
                                        start_date=start_date, end_date=end_date,
                                        adjust='qfq')
            
            # 合并数据
            df = df.sort_values('trade_date')
            tech_df = tech_df.sort_values('日期')
            
            # 添加技术指标
            df = self._add_technical_indicators(df)
            
            return df
        except Exception as e:
            print(f"获取数据时出错: {e}")
            return None
    
    def _add_technical_indicators(self, df):
        """添加技术指标"""
        # 计算移动平均线
        df['MA5'] = df['close'].rolling(window=5).mean()
        df['MA10'] = df['close'].rolling(window=10).mean()
        df['MA20'] = df['close'].rolling(window=20).mean()
        
        # 计算MACD
        exp1 = df['close'].ewm(span=12, adjust=False).mean()
        exp2 = df['close'].ewm(span=26, adjust=False).mean()
        df['MACD'] = exp1 - exp2
        df['Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
        
        # 计算RSI
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        # 计算波动率
        df['Volatility'] = df['close'].rolling(window=20).std()
        
        return df
    
    def prepare_data(self, df, sequence_length=10):
        """准备模型训练数据"""
        # 选择特征
        features = ['open', 'high', 'low', 'close', 'vol', 
                   'MA5', 'MA10', 'MA20', 'MACD', 'Signal', 'RSI', 'Volatility']
        
        # 删除包含NaN的行
        df = df.dropna()
        
        # 准备特征数据
        X = df[features].values
        y = df['close'].values
        
        # 数据标准化
        X_scaled = self.scaler.fit_transform(X)
        
        # 创建序列数据
        X_sequences = []
        y_sequences = []
        
        for i in range(len(X_scaled) - sequence_length):
            X_sequences.append(X_scaled[i:(i + sequence_length)])
            y_sequences.append(y[i + sequence_length])
        
        return np.array(X_sequences), np.array(y_sequences)