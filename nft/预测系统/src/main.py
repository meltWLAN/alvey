import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from dotenv import load_dotenv
from data_processor import DataProcessor
from models.model_trainer import ModelTrainer
import streamlit as st
import plotly.graph_objects as go

# 加载环境变量
load_dotenv()
TUSHARE_TOKEN = os.getenv('TUSHARE_TOKEN')

def plot_predictions(dates, actual, predicted, stock_code):
    """绘制预测结果图表"""
    fig = go.Figure()
    
    # 添加实际价格线
    fig.add_trace(go.Scatter(
        x=dates,
        y=actual,
        mode='lines',
        name='实际价格',
        line=dict(color='blue')
    ))
    
    # 添加预测价格线
    fig.add_trace(go.Scatter(
        x=dates,
        y=predicted,
        mode='lines',
        name='预测价格',
        line=dict(color='red')
    ))
    
    # 更新布局
    fig.update_layout(
        title=f'{stock_code} 股票价格预测',
        xaxis_title='日期',
        yaxis_title='价格',
        hovermode='x unified'
    )
    
    return fig

def main():
    st.title('股票价格预测系统')
    
    # 侧边栏配置
    st.sidebar.header('参数设置')
    stock_code = st.sidebar.text_input('股票代码（例如：000001.SZ）', '000001.SZ')
    
    # 日期选择
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    start_date = st.sidebar.date_input('开始日期', start_date)
    end_date = st.sidebar.date_input('结束日期', end_date)
    
    # 模型参数
    sequence_length = st.sidebar.slider('序列长度', 5, 30, 10)
    ensemble_weights = st.sidebar.slider('LSTM权重', 0.0, 1.0, 0.6)
    
    if st.sidebar.button('开始预测'):
        try:
            # 初始化数据处理器和模型训练器
            data_processor = DataProcessor(TUSHARE_TOKEN)
            model_trainer = ModelTrainer()
            
            # 获取数据
            df = data_processor.get_stock_data(
                stock_code,
                start_date.strftime('%Y%m%d'),
                end_date.strftime('%Y%m%d')
            )
            
            if df is None or len(df) == 0:
                st.error('获取数据失败，请检查股票代码和日期范围')
                return
            
            # 准备数据
            X, y = data_processor.prepare_data(df, sequence_length)
            
            # 划分训练集和测试集
            train_size = int(len(X) * 0.8)
            X_train, X_test = X[:train_size], X[train_size:]
            y_train, y_test = y[:train_size], y[train_size:]
            
            # 训练模型
            with st.spinner('正在训练模型...'):
                model_trainer.train_models(X_train, y_train)
            
            # 预测
            y_pred = model_trainer.predict(
                X_test,
                ensemble_weights=(ensemble_weights, 1-ensemble_weights)
            )
            
            # 评估模型
            metrics = model_trainer.evaluate(y_test, y_pred)
            
            # 显示评估指标
            st.subheader('模型评估指标')
            col1, col2, col3, col4 = st.columns(4)
            col1.metric('MSE', f"{metrics['mse']:.4f}")
            col2.metric('RMSE', f"{metrics['rmse']:.4f}")
            col3.metric('MAE', f"{metrics['mae']:.4f}")
            col4.metric('R²', f"{metrics['r2']:.4f}")
            
            # 绘制预测结果
            test_dates = df['trade_date'].values[train_size+sequence_length:]
            fig = plot_predictions(test_dates, y_test, y_pred, stock_code)
            st.plotly_chart(fig)
            
            # 交叉验证
            with st.spinner('正在进行交叉验证...'):
                cv_scores = model_trainer.cross_validate(X, y)
                
            st.subheader('交叉验证结果')
            st.write('平均评估指标：')
            st.json({
                key: f"{value:.4f}"
                for key, value in cv_scores.items()
            })
            
        except Exception as e:
            st.error(f'发生错误: {str(e)}')

if __name__ == '__main__':
    main()