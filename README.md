    FarmWise

Overview

FarmWise is a machine learning and deep learning-based agricultural recommendation system. It provides data-driven insights to help farmers optimize crop selection, yield, fertilizer use, irrigation, pesticide application, and water management. Additionally, it includes plant disease identification and treatment recommendations, along with land and farmer segmentation.

Features

1. Recommendation System

Crop Recommendation: Suggests the best crops to plant based on soil conditions, weather, and historical data.

Dataset: Crop Recommendation Dataset - Kaggle

Yield Recommendation: Maximizes production by analyzing past trends and external factors.

Datasets:

Agriculture Dataset - Karnataka

Crop Yield Dataset

Fertilizer Recommendation: Provides optimized fertilizer recommendations.

Model: Fertilizer Recommendation using TensorFlow

Irrigation Recommendation: Helps determine optimal irrigation schedules and amounts.

Datasets:

Agriculture Dataset - Karnataka

Irrigation Scheduling Dataset

Pesticide Use Recommendation: Predicts optimal pesticide application for better crop protection.

Datasets:

Agridata Pesticides

Pesticide Use Dataset - Kaggle

Water Usage Analysis: Monitors water resources and suggests efficient usage strategies.

Datasets:

Pluviometry Data

Water Resource Data by Region

Stress Hydrique

2. Plant Disease Identification & Treatment

Plant Disease Detection: Uses deep learning models to identify plant diseases from images.

Datasets:

Plant Disease Classification - Kaggle

Plant Disease Dataset - Kaggle

PlantDoc Dataset

Plant Disease - Roboflow

Treatment Recommendation: Suggests best treatment practices for identified plant diseases.

3. Segmentation

Farmer Segmentation: Groups farmers based on their land use, production patterns, and financial status.

Land Segmentation: Uses machine learning techniques for land use classification and analysis.

Technology Stack

Machine Learning Models: Decision Tree, Random Forest, TensorFlow models

Deep Learning Models: Convolutional Neural Networks (CNNs) for plant disease classification

Deployment: Streamlit API for user-friendly interaction

Data Storage: Kaggle datasets, public agricultural databases

Installation

Clone the repository:

git clone https://github.com/yourusername/farmwise.git
cd farmwise

Create a virtual environment:

conda create --name farmwise_env python=3.8
conda activate farmwise_env

Install dependencies:

pip install -r requirements.txt

Run the application:

streamlit run app.py

Contribution

Contributions are welcome! Feel free to submit issues and pull requests to improve FarmWise.

License

This project is licensed under the MIT License.