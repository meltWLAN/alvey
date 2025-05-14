import tushare as ts
import akshare as ak
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional

class DataFetcher:
    def __init__(self, tushare_token: str):
        """初始化数据获取器

        Args:
            tushare_token (str): Tushare API的token
        """
        self.ts_api = ts.pro_api(tushare_token)

    def fetch_stock_daily(
        self,
        stock_code: str,
        start_date: str,
        end_date: str
    ) -> pd.DataFrame:
        """获取股票的日线数据

        Args:
            stock_code (str): 股票代码
            start_date (str): 开始日期，格式：YYYYMMDD
            end_date (str): 结束日期，格式：YYYYMMDD

        Returns:
            pd.DataFrame: 包含股票日线数据的DataFrame
        """
        try:
            df = self.ts_api.daily(
                ts_code=stock_code,
                start_date=start_date,
                end_date=end_date
            )
            return df
        except Exception as e:
            print(f"获取股票{stock_code}数据失败：{str(e)}")
            return pd.DataFrame()

    def fetch_stock_basic(self) -> pd.DataFrame:
        """获取股票基本信息

        Returns:
            pd.DataFrame: 包含股票基本信息的DataFrame
        """
        try:
            df = self.ts_api.stock_basic(
                exchange='',
                list_status='L'
            )
            return df
        except Exception as e:
            print(f"获取股票基本信息失败：{str(e)}")
            return pd.DataFrame()

    def fetch_financial_data(
        self,
        stock_code: str,
        start_date: str,
        end_date: str
    ) -> pd.DataFrame:
        """获取股票的财务数据

        Args:
            stock_code (str): 股票代码
            start_date (str): 开始日期，格式：YYYYMMDD
            end_date (str): 结束日期，格式：YYYYMMDD

        Returns:
            pd.DataFrame: 包含财务数据的DataFrame
        """
        try:
            df = self.ts_api.fina_indicator(
                ts_code=stock_code,
                start_date=start_date,
                end_date=end_date
            )
            return df
        except Exception as e:
            print(f"获取股票{stock_code}财务数据失败：{str(e)}")
            return pd.DataFrame()