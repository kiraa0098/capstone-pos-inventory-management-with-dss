import sys
import json
import pandas as pd

temp_file_path = sys.argv[1]

with open(temp_file_path, 'r') as f:
    sales_data = json.load(f)

forecast_results = {}
window_size = 30  # Define the window size for the 30-day forecast

for product_id, product_sales in sales_data.items():
    df = pd.DataFrame(product_sales)
    df['ds'] = pd.to_datetime(df['ds'])
    df = df[df['ds'] >= (pd.Timestamp.now() - pd.Timedelta(days=30))]  # Only last 30 days
    df = df.groupby('ds').sum().asfreq('D', fill_value=0)

    # Calculate the SMA for the last 30 days
    df['sma'] = df['y'].rolling(window=window_size, min_periods=1).mean()
    
    if not df['sma'].empty:
        sma_forecast = df['sma'].iloc[-1] * window_size  # Project total demand for the next 'window_size' days
    else:
        sma_forecast = 0  # Fallback if there are no values
    
    forecast_results[product_id] = {
        "product_name": product_sales[0]['product_name'],
        "lead_time_demand": sma_forecast,
    }


# Output the forecast results in JSON format
print(json.dumps(forecast_results))
