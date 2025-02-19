# FarmWise

## Overview
FarmWise is a machine learning and deep learning-based agricultural recommendation system. It provides data-driven insights to help farmers optimize crop selection, yield, fertilizer use, irrigation, pesticide application, and water management. Additionally, it includes plant disease identification and treatment recommendations, along with land and farmer segmentation.

## Features
### 1. Recommendation System
- **Crop Recommendation**: Suggests the best crops to plant based on soil conditions, weather, and historical data.
  - Dataset: [Crop Recommendation Dataset - Kaggle](https://www.kaggle.com/datasets/imtkaggleteam/agriculture-dataset-karnatak)

- **Yield Recommendation**: Maximizes production by analyzing past trends and external factors.
  - Datasets:
    - [Agriculture Dataset - Karnataka](https://www.kaggle.com/datasets/imtkaggleteam/agriculture-dataset-karnataka)
    - [Crop Yield Dataset](https://www.kaggle.com/datasets/govindaramsriram/crop-yield-of-a-farm)

- **Fertilizer Recommendation**: Provides optimized fertilizer recommendations.
  - Model: Fertilizer Recommendation using TensorFlow

- **Irrigation Recommendation**: Helps determine optimal irrigation schedules and amounts.
  - Datasets:
    - [Agriculture Dataset - Karnataka](https://www.kaggle.com/datasets/imtkaggleteam/agriculture-dataset-karnataka)
    - [Irrigation Scheduling Dataset](https://www.kaggle.com/datasets/pusainstitute/cropirrigationscheduling)

- **Pesticide Use Recommendation**: Predicts optimal pesticide application for better crop protection.
  - Datasets:
    - [Agridata Pesticides](https://catalog.agridata.tn/fr/dataset/pesticides)
    - [Pesticide Use Dataset - Kaggle](https://www.kaggle.com/datasets/rushikeshhiray/pesticide-use-overtime)

- **Water Usage Analysis**: Monitors water resources and suggests efficient usage strategies.
  - Datasets:
    - [Pluviometry Data](https://catalog.agridata.tn/fr/dataset/pluviometriques-journalieres-observees)
    - [Water Resource Data by Region](https://catalog.agridata.tn/fr/dataset/repartition-des-ressources-en-eaux-selon-la-nappe-moyenne)
    - [Stress Hydrique](https://catalog.agridata.tn/fr/dataset/niveau-de-stress-hydrique)

### 2. Plant Disease Identification & Treatment
- **Plant Disease Detection**: Uses deep learning models to identify plant diseases from images.
  - Datasets:
    - [Plant Disease Classification - Kaggle](http://kaggle.com/code/vad13irt/plant-disease-classification)
    - [Plant Disease Dataset - Kaggle](https://www.kaggle.com/datasets/emmarex/plantdisease)
    - [PlantDoc Dataset](https://github.com/pratikkayal/PlantDoc-Dataset)
    - [Plant Disease - Roboflow](https://universe.roboflow.com/learning-eri4b/plant-disease-tmyq8)
  
- **Treatment Recommendation**: Suggests best treatment practices for identified plant diseases.

### 3. Segmentation
- **Farmer Segmentation**: Groups farmers based on their land use, production patterns, and financial status.
- **Land Segmentation**: Uses machine learning techniques for land use classification and analysis.

## Technology Stack
- **Machine Learning Models**: Decision Tree, Random Forest, TensorFlow models
- **Deep Learning Models**: Convolutional Neural Networks (CNNs) for plant disease classification
- **Deployment**: Streamlit API for user-friendly interaction
- **Data Storage**: Kaggle datasets, public agricultural databases

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/farmwise.git
   cd farmwise
   ```
2. Create a virtual environment:
   ```bash
   conda create --name farmwise_env python=3.8
   conda activate farmwise_env
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the application:
   ```bash
   streamlit run app.py
   ```

## Contribution
Contributions are welcome! Feel free to submit issues and pull requests to improve FarmWise.

## License
This project is licensed under the MIT License.

