import numpy as np
import pandas as pd
from typing import List, Dict, Optional
from tensorflow.keras.models import load_model
from xgboost import XGBRegressor
import joblib

class StockPredictor:
    def __init__(self):
        """初始化预测器"""
        self.lstm_model = None
        self.xgb_model = None

    def load_models(self, lstm_path: str, xgb_path: str):
        """加载预训练模型

        Args:
            lstm_path (str): LSTM模型路径
            xgb_path (str): XGBoost模型路径
        """
        try:
            self.lstm_model = load_model(lstm_path)
            self.xgb_model = joblib.load(xgb_path)
        except Exception as e:
            print(f"加载模型失败：{str(e)}")

    def predict_lstm(self, X: np.ndarray) -> np.ndarray:
        """使用LSTM模型进行预测

        Args:
            X (np.ndarray): 输入数据，形状为 (samples, sequence_length, features)

        Returns:
            np.ndarray: 预测结果
        """
        if self.lstm_model is None:
            raise ValueError("LSTM模型未加载")
        return self.lstm_model.predict(X)

    def predict_xgboost(self, X: np.ndarray) -> np.ndarray:
        """使用XGBoost模型进行预测

        Args:
            X (np.ndarray): 输入数据

        Returns:
            np.ndarray: 预测结果
        """
        if self.xgb_model is None:
            raise ValueError("XGBoost模型未加载")
        return self.xgb_model.predict(X)

    def ensemble_predict(self, X_lstm: np.ndarray, X_xgb: np.ndarray, weights: Optional[List[float]] = None) -> np.ndarray:
        """集成预测

        Args:
            X_lstm (np.ndarray): LSTM模型的输入数据
            X_xgb (np.ndarray): XGBoost模型的输入数据
            weights (Optional[List[float]]): 模型权重，默认为[0.5, 0.5]

        Returns:
            np.ndarray: 集成预测结果
        """
        if weights is None:
            weights = [0.5, 0.5]

        lstm_pred = self.predict_lstm(X_lstm)
        xgb_pred = self.predict_xgboost(X_xgb)

        return weights[0] * lstm_pred + weights[1] * xgb_pred

    def predict_next_day(self, 
                        current_data: pd.DataFrame,
                        sequence_length: int,
                        features: List[str]) -> Dict[str, float]:
        """预测下一个交易日的股票价格

        Args:
            current_data (pd.DataFrame): 当前的股票数据
            sequence_length (int): 序列长度
            features (List[str]): 特征列表

        Returns:
            Dict[str, float]: 预测结果，包含不同模型的预测值
        """
        # 准备LSTM输入数据
        lstm_input = current_data[features].values[-sequence_length:]
        lstm_input = lstm_input.reshape(1, sequence_length, len(features))

        # 准备XGBoost输入数据
        xgb_input = current_data[features].values[-1:]

        # 单个模型预测
        lstm_prediction = self.predict_lstm(lstm_input)[0][0]
        xgb_prediction = self.predict_xgboost(xgb_input)[0]

        # 集成预测
        ensemble_prediction = self.ensemble_predict(
            lstm_input,
            xgb_input,
            weights=[0.6, 0.4]  # 可以根据模型表现调整权重
        )[0][0]

        return {
            'lstm_prediction': float(lstm_prediction),
            'xgb_prediction': float(xgb_prediction),
            'ensemble_prediction': float(ensemble_prediction)
        }