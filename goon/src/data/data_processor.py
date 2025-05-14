import pandas as pd
import numpy as np
from typing import List, Dict, Optional
from sklearn.preprocessing import MinMaxScaler

class DataProcessor:
    def __init__(self):
        """初始化数据处理器"""
        self.scaler = MinMaxScaler()

    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """清洗数据，处理缺失值和异常值

        Args:
            df (pd.DataFrame): 原始数据

        Returns:
            pd.DataFrame: 清洗后的数据
        """
        # 删除重复行
        df = df.drop_duplicates()

        # 处理缺失值
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].mean())
        
        # 处理非数值型缺失值
        df = df.fillna(method='ffill')
        
        return df

    def calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """计算技术指标

        Args:
            df (pd.DataFrame): 股票数据

        Returns:
            pd.DataFrame: 添加技术指标后的数据
        """
        # 确保数据按时间排序
        df = df.sort_values('trade_date')

        # 计算移动平均线
        df['MA5'] = df['close'].rolling(window=5).mean()
        df['MA10'] = df['close'].rolling(window=10).mean()
        df['MA20'] = df['close'].rolling(window=20).mean()

        # 计算MACD
        exp1 = df['close'].ewm(span=12, adjust=False).mean()
        exp2 = df['close'].ewm(span=26, adjust=False).mean()
        df['MACD'] = exp1 - exp2
        df['Signal_Line'] = df['MACD'].ewm(span=9, adjust=False).mean()

        # 计算RSI
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))

        return df

    def normalize_features(self, df: pd.DataFrame, features: List[str]) -> pd.DataFrame:
        """对特征进行归一化

        Args:
            df (pd.DataFrame): 原始数据
            features (List[str]): 需要归一化的特征列表

        Returns:
            pd.DataFrame: 归一化后的数据
        """
        df_normalized = df.copy()
        df_normalized[features] = self.scaler.fit_transform(df[features])
        return df_normalized

    def prepare_time_series_data(
        self,
        df: pd.DataFrame,
        features: List[str],
        target: str,
        sequence_length: int
    ) -> tuple:
        """准备时间序列数据

        Args:
            df (pd.DataFrame): 原始数据
            features (List[str]): 特征列表
            target (str): 目标变量
            sequence_length (int): 序列长度

        Returns:
            tuple: (X, y) 训练数据和标签
        """
        data = df[features + [target]].values
        X, y = [], []

        for i in range(len(data) - sequence_length):
            X.append(data[i:(i + sequence_length), :-1])
            y.append(data[i + sequence_length, -1])

        return np.array(X), np.array(y)

    def split_train_test(self, df: pd.DataFrame, test_size: float = 0.2) -> tuple:
        """将数据集分割为训练集和测试集

        Args:
            df (pd.DataFrame): 原始数据
            test_size (float): 测试集比例

        Returns:
            tuple: (train_df, test_df) 训练集和测试集
        """
        train_size = int(len(df) * (1 - test_size))
        train_df = df[:train_size]
        test_df = df[train_size:]
        return train_df, test_df