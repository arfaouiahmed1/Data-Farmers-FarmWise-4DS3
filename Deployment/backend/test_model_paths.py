
import os
import sys
import pandas as pd

# Check if pandas and other libraries are available
print('Python version:', sys.version)
print('Pandas version:', pd.__version__)

try:
    import joblib
    print('Joblib version:', joblib.__version__)
except ImportError:
    print('Joblib not installed')

try:
    from sklearn import __version__ as sklearn_version
    print('Scikit-learn version:', sklearn_version)
except ImportError:
    print('Scikit-learn not installed')

# Print current working directory
print('Current working directory:', os.getcwd())

# Check model paths
model_paths = [
    r'C:\Users\ahmed\Desktop\PIDS\Data-Farmers-FarmWise-4DS3\Models\ml_models\crop_classifier.pkl',
    os.path.join('..', '..', '..', 'Models', 'ml_models', 'crop_classifier.pkl'),
    os.path.join('..', '..', 'Models', 'ml_models', 'crop_classifier.pkl'),
    os.path.join('..', 'Models', 'ml_models', 'crop_classifier.pkl'),
    os.path.join('Models', 'ml_models', 'crop_classifier.pkl')
]

print('Checking model paths...')
for path in model_paths:
    exists = os.path.exists(path)
    abs_path = os.path.abspath(path)
    print(f'Path: {path}')
    print(f'  Absolute: {abs_path}')
    print(f'  Exists: {exists}')

# If the model exists at the absolute path, test loading it
abs_path = r'C:\Users\ahmed\Desktop\PIDS\Data-Farmers-FarmWise-4DS3\Models\ml_models\crop_classifier.pkl'
if os.path.exists(abs_path):
    try:
        print(f'\\nAttempting to load model from {abs_path}...')
        model = joblib.load(abs_path)
        print('Model loaded successfully!')
        
        # Test a prediction
        test_data = {
            'N (kg/ha)': [50], 
            'P (kg/ha)': [50], 
            'K (kg/ha)': [50],
            'Temperature (°C)': [25], 
            'Humidity (%)': [60], 
            'pH': [7],
            'Rainfall (mm)': [50], 
            'Area (ha)': [1], 
            'Fertilizer (kg)': [100],
            'Pesticide (kg)': [10], 
            'Governorate': ['Tunis'], 
            'Irrigation': ['Drip'],
            'Fertilizer Plant': ['Urea'], 
            'Planting Season': ['spring'], 
            'Growing Season': ['summer'],
            'Harvest Season': ['autumn']
        }
        
        df_input = pd.DataFrame(test_data)
        prediction = model.predict(df_input)
        print('Test prediction result:', prediction)
        
    except Exception as e:
        print(f'Error loading model: {e}')

