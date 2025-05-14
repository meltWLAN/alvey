import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple, Any
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

class ModelTrainer:
    def __init__(self):
        """初始化模型训练器"""
        self.lstm_model = None
        self.xgb_model = None

    def build_lstm_model(
        self,
        input_shape: Tuple[int, int],
        output_dim: int = 1
    ) -> Sequential:
        """构建LSTM模型

        Args:
            input_shape (Tuple[int, int]): 输入数据形状 (sequence_length, features)
            output_dim (int): 输出维度

        Returns:
            Sequential: 构建好的LSTM模型
        """
        model = Sequential([
            LSTM(units=50, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(units=50, return_sequences=False),
            Dropout(0.2),
            Dense(units=25),
            Dense(units=output_dim)
        ])

        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )

        return model

    def train_lstm(
        self,
        X: np.ndarray,
        y: np.ndarray,
        validation_split: float = 0.2,
        epochs: int = 100,
        batch_size: int = 32
    ) -> Dict[str, Any]:
        """训练LSTM模型

        Args:
            X (np.ndarray): 训练数据
            y (np.ndarray): 目标变量
            validation_split (float): 验证集比例
            epochs (int): 训练轮数
            batch_size (int): 批次大小

        Returns:
            Dict[str, Any]: 训练历史
        """
        if self.lstm_model is None:
            self.lstm_model = self.build_lstm_model(
                input_shape=(X.shape[1], X.shape[2])
            )

        history = self.lstm_model.fit(
            X, y,
            validation_split=validation_split,
            epochs=epochs,
            batch_size=batch_size,
            verbose=1
        )

        return history.history

    def train_xgboost(
        self,
        X: np.ndarray,
        y: np.ndarray,
        test_size: float = 0.2
    ) -> Dict[str, float]:
        """训练XGBoost模型

        Args:
            X (np.ndarray): 训练数据
            y (np.ndarray): 目标变量
            test_size (float): 测试集比例

        Returns:
            Dict[str, float]: 模型评估指标
        """
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )

        self.xgb_model = XGBRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )

        self.xgb_model.fit(X_train, y_train)

        # 模型评估
        y_pred = self.xgb_model.predict(X_test)
        metrics = {
            'mse': mean_squared_error(y_test, y_pred),
            'mae': mean_absolute_error(y_test, y_pred),
            'r2': r2_score(y_test, y_pred)
        }

        return metrics

    def evaluate_model(self, X_test: np.ndarray, y_test: np.ndarray, model_type: str = 'lstm') -> Dict[str, float]:
        """评估模型性能

        Args:
            X_test (np.ndarray): 测试数据
            y_test (np.ndarray): 真实标签
            model_type (str): 模型类型，'lstm'或'xgb'

        Returns:
            Dict[str, float]: 评估指标
        """
        if model_type == 'lstm' and self.lstm_model is not None:
            y_pred = self.lstm_model.predict(X_test)
        elif model_type == 'xgb' and self.xgb_model is not None:
            y_pred = self.xgb_model.predict(X_test)
        else:
            raise ValueError(f"模型{model_type}未训练")

        return {
            'mse': mean_squared_error(y_test, y_pred),
            'mae': mean_absolute_error(y_test, y_pred),
            'r2': r2_score(y_test, y_pred)
        }

    def save_models(self, lstm_path: str, xgb_path: str):
        """保存训练好的模型

        Args:
            lstm_path (str): LSTM模型保存路径
            xgb_path (str): XGBoost模型保存路径
        """
        if self.lstm_model is not None:
            self.lstm_model.save(lstm_path)
        
        if self.xgb_model is not None:
            joblib.dump(self.xgb_model, xgb_path)

    def predict_lstm(
        self,
        X: np.ndarray
    ) -> np.ndarray:
        """使用LSTM模型进行预测

        Args:
            X (np.ndarray): 输入数据

        Returns:
            np.ndarray: 预测结果
        """
        if self.lstm_model is None:
            raise ValueError("LSTM模型尚未训练")
        return self.lstm_model.predict(X)

    def predict_xgboost(
        self,
        X: np.ndarray
    ) -> np.ndarray:
        """使用XGBoost模型进行预测

        Args:
            X (np.ndarray): 输入数据

        Returns:
            np.ndarray: 预测结果
        """
        if self.xgb_model is None:
            raise ValueError("XGBoost模型尚未训练")
        return self.xgb_model.predict(X)