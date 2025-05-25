# FarmWise

## Overview
FarmWise is a comprehensive agricultural recommendation system powered by machine learning and deep learning technologies. Built with a modern tech stack featuring a Next.js frontend and Django backend, FarmWise provides data-driven insights to help farmers optimize their agricultural practices, increase productivity, and manage resources efficiently.

## Demo and Commercial Videos

### Commercial Video
<p align="center">
  <a href="https://youtu.be/Dbv44AOnYsQ" target="_blank">
    <img src="https://img.youtube.com/vi/Dbv44AOnYsQ/0.jpg" alt="FarmWise Commercial">
  </a>
</p>

Watch our commercial video to learn about FarmWise's vision and capabilities.

### Demo Video
<p align="center">
  <a href="https://youtu.be/bAqBds2t3mg" target="_blank">
    <img src="https://img.youtube.com/vi/bAqBds2t3mg/0.jpg" alt="FarmWise Demo">
  </a>
</p>

Watch our detailed demo to see FarmWise in action and explore its features.

## Features

### 1. Recommendation System
- **Crop Recommendation**: Suggests the best crops to plant based on soil conditions, weather, and historical data.
- **Yield Prediction**: Maximizes production by analyzing past trends and external factors.
- **Fertilizer Optimization**: Provides tailored fertilizer recommendations based on soil composition and crop requirements.
- **Irrigation Management**: Helps determine optimal irrigation schedules and amounts to conserve water while maximizing crop health.
- **Pesticide Use Guidance**: Predicts optimal pesticide application for better crop protection with minimal environmental impact.
- **Water Resource Management**: Monitors water resources and suggests efficient usage strategies based on crop needs and environmental conditions.

### 2. Plant Disease Identification & Treatment
- **AI-Powered Disease Detection**: Uses YOLOv8 deep learning models to accurately identify plant diseases from images.
- **Treatment Recommendations**: Suggests best treatment practices for identified plant diseases, including organic and chemical solutions.

### 3. Satellite Imagery Analysis
- **Crop Monitoring**: Utilizes satellite imagery to track crop health and growth patterns.
- **Land Use Classification**: Applies YOLOv8 object detection to analyze satellite images for land use classification.
- **Vegetation Index Tracking**: Calculates NDVI and other vegetation indices from satellite data to monitor crop vigor.
- **Environmental Monitoring**: Detects environmental stressors and potential issues using satellite imagery analysis.

### 4. Segmentation and Analytics
- **Farmer Segmentation**: Groups farmers based on their land use, production patterns, and financial status for targeted recommendations.
- **Land Use Analysis**: Uses machine learning techniques for land use classification and optimization.
- **Performance Tracking**: Monitors farm performance over time and suggests improvements based on historical data.

## Technology Stack
- **Frontend**: Next.js with TypeScript for a responsive and interactive user experience
- **Backend**: Django REST framework for robust API services
- **Machine Learning**: Decision Tree, Random Forest, and various TensorFlow models
- **Deep Learning**: YOLOv8 for object detection and Convolutional Neural Networks (CNNs) for image classification
- **Remote Sensing**: Processing and analysis of satellite imagery data
- **Deployment**: Containerized application for scalable and consistent deployment

## Project Structure
```
FarmWise/
├── Deployment/
│   ├── Mobile/         # Future mobile application (Flutter/Kotlin/Swift)
│   └── Website/        # Main web application
│       ├── backend/    # Django REST framework backend
│       └── farmwise/   # Next.js frontend
├── Models/
│   └── README.md       # ML/DL models (YOLOv8, etc.)
├── Datasets/
│   └── README.md       # Datasets for training and evaluation
├── Notebooks/
│   └── README.md       # Jupyter notebooks for analysis & experimentation
├── .gitignore          # Git ignore file
├── README.md           # Project overview (this file)
└── ...               # Configuration files (.idea, etc.)
```

## Installation and Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Deployment/backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Django server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Deployment/farmwise
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. For production build:
   ```bash
   npm run build
   npm run start
   ```

## Usage

1.  **Access the Frontend:** Once both the backend and frontend servers are running, open your web browser and navigate to `http://localhost:3000` (or the port specified by Next.js).
2.  **Explore Features:** Use the navigation menu to explore the various features like the dashboard, AI advisor, disease detection, mapping, etc.
3.  **Interact:** Follow the on-screen prompts to upload images, view recommendations, and analyze data.

## Contribution
Contributions are welcome! Feel free to submit issues and pull requests to improve FarmWise.

## License
This project is licensed under the MIT License.

