# FarmWise - Agricultural Recommendation System

## Project Overview
FarmWise is an intelligent agricultural recommendation system that helps farmers make data-driven decisions about crop selection, irrigation methods, and seasonal planning. The system uses machine learning techniques and balanced recommendation approaches to provide personalized suggestions based on multiple factors including soil conditions, climate, and geographical location.

## Project Structure
```
├── Datasets/
│   └── crop_datasets/
│       ├── crop_data_ready_V1.csv
│       ├── crop_data_ready_V2.csv
│       ├── crop_data_ready_V4.csv
│       ├── crop_data_ready_V5.csv
│       ├── crop_data_ready_V6.csv
│       ├── crop_data_ready_V7.csv
│       ├── crop_data_ready_V8.csv
│       └── README.md
├── Deployment/
│   ├── Crop/
│   │   └── README.md
│   └── template.html
├── Models/
│   └── Crop/
│       ├── model.pkl
│       └── README.md
└── Notebooks/
    └── Recommendation/
        ├── Recommandation_1_0.ipynb
        ├── Recommandation_2_0.ipynb
        ├── Recommandation_3_0.ipynb
        ├── Recommandation_4_0.ipynb
        ├── Recommandation_5_0.ipynb
        ├── Recommandation_6_0.ipynb
        └── README.md
```

## Features

### 1. Multi-Factor Recommendation System
- Crop recommendations based on soil and environmental conditions
- Season-appropriate crop suggestions
- Irrigation method optimization
- Geographic-specific recommendations
- Case-by-case analysis for balanced suggestions

### 2. Data Processing
- Comprehensive soil parameter analysis (N, P, K, pH)
- Environmental condition tracking
- Seasonal pattern recognition
- Regional agricultural data integration
- Multiple dataset versions with progressive improvements

### 3. Model Implementation
- Crop-specific model implementations
- Cosine similarity-based recommendations
- Balanced recommendation algorithms
- Multiple recommendation approaches:
  - Crop-based
  - Season-based
  - Irrigation-based
  - Mixed recommendations

## Technology Stack
- **Python** - Core programming language
- **Pandas & NumPy** - Data processing
- **Scikit-learn** - Machine learning implementations
- **Streamlit** - Web interface deployment
- **Jupyter Notebooks** - Development and analysis

## Installation & Usage

1. Clone the repository:
```bash
git clone <repository-url>
cd FarmWise
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
streamlit run Deployment/Crop/app.py
```

## Development Process
The development process is documented in the Notebooks/Recommendation directory:

1. Initial Data Exploration (Recommandation_1_0.ipynb)
   - Data preprocessing and initial cleaning
   - Basic feature analysis

2. Enhanced Data Processing (Recommandation_2_0.ipynb)
   - Advanced feature engineering
   - Data cleaning improvements

3. Model Development (Recommandation_3_0.ipynb)
   - Initial model implementation
   - Basic recommendation system setup

4. System Optimization (Recommandation_4_0.ipynb)
   - Model performance improvements
   - Algorithm refinement

5. Final Implementation (Recommandation_5_0.ipynb)
   - System integration
   - Performance optimization

6. Testing and Validation (Recommandation_6_0.ipynb)
   - System evaluation
   - Final testing and validation

## Dataset Versions
The system uses progressively improved datasets (V1 through V8) with enhancements in:
- Data cleaning
- Feature engineering
- Seasonal information
- Irrigation data
- Geographic coverage

## Contributors
- List of contributors

## License
This project is licensed under the MIT License - see the LICENSE file for details.

