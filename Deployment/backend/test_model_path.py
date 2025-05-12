
import os
import joblib
try:
    # Absolute path test
    abs_path = 'C:/Users/ahmed/Desktop/PIDS/Data-Farmers-FarmWise-4DS3/Models/ml_models/crop_classifier.pkl'
    print(f'Testing absolute path: {abs_path}')
    print(f'File exists: {os.path.exists(abs_path)}')
    model = joblib.load(abs_path)
    print('Model loaded successfully from absolute path!')
    
    # Relative path test - as used in the code
    rel_path = os.path.join('..', '..', 'Models', 'ml_models', 'crop_classifier.pkl')
    current_dir = os.getcwd()
    print(f'Current directory: {current_dir}')
    full_rel_path = os.path.abspath(rel_path)
    print(f'Full relative path resolves to: {full_rel_path}')
    print(f'File exists: {os.path.exists(rel_path)}')
    
    if os.path.exists(rel_path):
        model = joblib.load(rel_path)
        print('Model loaded successfully from relative path!')
    else:
        print('Relative path failed, file not found')
except Exception as e:
    print(f'Error: {e}')

