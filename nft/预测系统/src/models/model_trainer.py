import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from xgboost import XGBRegressor
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

class ModelTrainer:
    def __init__(self):
        self.lstm_model = None
        self.xgb_model = None
        
    def build_lstm_model(self, input_shape):
        """构建LSTM模型"""
        model = Sequential([
            LSTM(100, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            Dense(25, activation='relu'),
            Dense(1)
        ])
        
        model.compile(optimizer=Adam(learning_rate=0.001),
                      loss='mse',
                      metrics=['mae'])
        
        return model
    
    def build_xgboost_model(self):
        """构建XGBoost模型"""
        return XGBRegressor(
            n_estimators=1000,
            learning_rate=0.01,
            max_depth=5,
            min_child_weight=1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )
    
    def train_models(self, X_train, y_train, validation_split=0.2):
        """训练LSTM和XGBoost模型"""
        # 训练LSTM模型
        self.lstm_model = self.build_lstm_model((X_train.shape[1], X_train.shape[2]))
        self.lstm_model.fit(
            X_train, y_train,
            epochs=50,
            batch_size=32,
            validation_split=validation_split,
            verbose=1
        )
        
        # 准备XGBoost的输入数据
        X_train_2d = X_train.reshape(X_train.shape[0], -1)
        
        # 训练XGBoost模型
        self.xgb_model = self.build_xgboost_model()
        self.xgb_model.fit(
            X_train_2d,
            y_train,
            eval_set=[(X_train_2d, y_train)],
            early_stopping_rounds=10,
            verbose=False
        )
    
    def predict(self, X_test, ensemble_weights=(0.6, 0.4)):
        """使用模型集成进行预测"""
        # LSTM预测
        lstm_pred = self.lstm_model.predict(X_test)
        
        # XGBoost预测
        X_test_2d = X_test.reshape(X_test.shape[0], -1)
        xgb_pred = self.xgb_model.predict(X_test_2d)
        
        # 集成预测结果
        ensemble_pred = (ensemble_weights[0] * lstm_pred.flatten() +
                        ensemble_weights[1] * xgb_pred)
        
        return ensemble_pred
    
    def evaluate(self, y_true, y_pred):
        """评估模型性能"""
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_true, y_pred)
        r2 = r2_score(y_true, y_pred)
        
        return {
            'mse': mse,
            'rmse': rmse,
            'mae': mae,
            'r2': r2
        }
    
    def cross_validate(self, X, y, n_splits=5):
        """使用时间序列交叉验证评估模型"""
        tscv = TimeSeriesSplit(n_splits=n_splits)
        cv_scores = []
        
        for train_idx, val_idx in tscv.split(X):
            X_train, X_val = X[train_idx], X[val_idx]
            y_train, y_val = y[train_idx], y[val_idx]
            
            # 训练模型
            self.train_models(X_train, y_train)
            
            # 预测和评估
            y_pred = self.predict(X_val)
            scores = self.evaluate(y_val, y_pred)
            cv_scores.append(scores)
        
        # 计算平均分数
        avg_scores = {}
        for metric in cv_scores[0].keys():
            avg_scores[metric] = np.mean([score[metric] for score in cv_scores])
        
        return avg_scores