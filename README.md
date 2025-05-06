# FarmWise

## Overview
FarmWise is a machine learning-based agricultural system focused on land price prediction. It provides data-driven insights to help users understand land valuation based on various factors.

## Features
### 1. Land Price Prediction
- **Price Prediction Model**: Predicts land prices based on historical data and relevant features using various regression models.
  - Notebooks: `Notebooks/price prediction/version finale.ipynb`
  - Models: `Models/price prediction models/` (Contains saved models, e.g., a .pkl or .joblib file for the best performing regressor)
  - Datasets: `Datasets/price predection/` (Likely contains `data1.csv` or similar used in the notebook)
  - Deployment: `Deployment/land price prediction/`

## Technology Stack
- **Machine Learning Models**: Scikit-learn (Linear Regression, Ridge, Lasso, RandomForestRegressor, GradientBoostingRegressor), XGBoost
- **Data Processing**: Pandas, NumPy
- **Deployment**: FastAPI, Uvicorn
- **Development Environment**: Jupyter Notebook

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/farmwise.git
   cd farmwise
   ```
2. Navigate to the deployment directory:
   ```bash
   cd Deployment/land price prediction
   ```
3. Create a virtual environment (Python 3.8+ recommended):
   ```bash
   python -m venv env
   # On Windows
   .\env\Scripts\activate
   # On macOS/Linux
   source env/bin/activate
   ```
   Alternatively, using Conda:
   ```bash
   conda create --name farmwise_env python=3.8
   conda activate farmwise_env
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the application (from the `Deployment/land price prediction` directory):
   ```bash
   uvicorn main:app --reload
   ```
   The application will typically be available at `http://127.0.0.1:8000`.

## Contribution
Contributions are welcome! Feel free to submit issues and pull requests to improve FarmWise.

## License
This project is licensed under the MIT License.

