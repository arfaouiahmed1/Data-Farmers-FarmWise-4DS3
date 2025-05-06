# Models

This directory contains the trained machine learning models used in the FarmWise project.

## Files
- `model.pkl` - Serialized recommendation model

## Model Details
The recommendation system uses several approaches:
- Cosine similarity for crop recommendations
- Balanced recommendation system for:
  - Crop-based recommendations
  - Season-based recommendations
  - Irrigation-based recommendations
  - Case-by-case mixed recommendations

## Features Used
- Soil parameters (N, P, K, pH)
- Environmental conditions (temperature, humidity, rainfall)
- Seasonal information
- Irrigation methods
- Geographic location (gouvernerats)

## Usage
Models are loaded and used by the recommendation system to provide:
- Similar crop suggestions
- Season-appropriate recommendations
- Irrigation method matching
- Combined feature-based recommendations