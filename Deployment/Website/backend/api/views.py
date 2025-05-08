from django.shortcuts import render

# Create your views here.

import base64
import io
from PIL import Image
import cv2 # Ensure OpenCV is imported
import numpy as np # Ensure numpy is imported
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt # Ensure csrf_exempt is imported
from django.utils.decorators import method_decorator
from django.views import View
import json
import math # Import math for calculations
import os # Add os import
from django.conf import settings # Add settings import
import csv # Import CSV module

from ultralytics import YOLO
import torch
import torch.nn as nn # Ensure nn is imported
import torch.nn.functional as F # Ensure F is imported
import torchvision.transforms as transforms
# from torchvision.models import resnet9 # Or your specific ResNet9 import if custom -- THIS LINE IS THE ISSUE

# Import for Google Generative AI
import google.generativeai as genai
from dotenv import load_dotenv
import re
import random
import uuid
import time

from core.models import UserProfile, Farm, Farmer
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# Load environment variables from .env file
load_dotenv()

# Configure the Google API key
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
else:
    print("GOOGLE_API_KEY not found in .env file. Please set it up.")

# --- Model Definitions from Notebook ---
def accuracy(outputs, labels):
    _, preds = torch.max(outputs, dim=1)
    return torch.tensor(torch.sum(preds == labels).item() / len(preds))

class ImageClassificationBase(nn.Module):
    def training_step(self, batch):
        images, labels = batch
        out = self(images)
        loss = F.cross_entropy(out, labels)
        return loss

    def validation_step(self, batch):
        images, labels = batch
        out = self(images)
        loss = F.cross_entropy(out, labels)
        acc = accuracy(out, labels)
        preds = torch.argmax(out, dim=1)
        return {
            "val_loss": loss.detach(),
            "val_accuracy": acc,
            "preds": preds.detach(),
            "labels": labels.detach()
        }

    def validation_epoch_end(self, outputs):
        batch_losses = [x["val_loss"] for x in outputs]
        batch_accuracy = [x["val_accuracy"] for x in outputs]
        epoch_loss = torch.stack(batch_losses).mean()
        epoch_accuracy = torch.stack(batch_accuracy).mean()
        return {"val_loss": epoch_loss, "val_accuracy": epoch_accuracy}

    def epoch_end(self, epoch, result):
        print("Epoch [{}], last_lr: {:.5f}, train_loss: {:.4f}, val_loss: {:.4f}, val_acc: {:.4f}".format(
            epoch, result['lrs'][-1], result['train_loss'], result['val_loss'], result['val_accuracy']))

def ConvBlock(in_channels, out_channels, pool=False):
    layers = [nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
             nn.BatchNorm2d(out_channels),
             nn.ReLU(inplace=True)]
    if pool:
        layers.append(nn.MaxPool2d(4))
    return nn.Sequential(*layers)

class ResNet9(ImageClassificationBase):
    def __init__(self, in_channels, num_diseases):
        super().__init__()
        self.conv1 = ConvBlock(in_channels, 64)
        self.conv2 = ConvBlock(64, 128, pool=True)
        self.res1 = nn.Sequential(ConvBlock(128, 128), ConvBlock(128, 128))
        self.conv3 = ConvBlock(128, 256, pool=True)
        self.conv4 = ConvBlock(256, 512, pool=True)
        self.res2 = nn.Sequential(ConvBlock(512, 512), ConvBlock(512, 512))
        self.classifier = nn.Sequential(nn.MaxPool2d(4),
                                       nn.Flatten(),
                                       nn.Linear(512, num_diseases))

    def forward(self, xb):
        out = self.conv1(xb)
        out = self.conv2(out)
        out = self.res1(out) + out
        out = self.conv3(out)
        out = self.conv4(out)
        out = self.res2(out) + out
        out = self.classifier(out)
        return out
# --- End Model Definitions ---

# --- Configuration ---
# Use a relative path based on the Django project's BASE_DIR
# Assuming BASE_DIR points to the 'backend' directory
MODEL_PATH = os.path.normpath(os.path.join(settings.BASE_DIR, '../../../Models/Farm Boundaries/yolov8l-seg.pt'))
# Path for the weed detection model
WEED_MODEL_PATH = os.path.normpath(os.path.join(settings.BASE_DIR, '../../../Models/Weed Detection/PIDS_weed_detection.pt'))
# Path for the disease detection model
DISEASE_MODEL_PATH = os.path.normpath(os.path.join(settings.BASE_DIR, '../../../Models/Disease Detection/diseases_model_fixed.pt'))

# Load the model (consider loading it once globally if performance is critical)
# For simplicity here, loading per request. Optimize later if needed.
try:
    model = YOLO(MODEL_PATH)
    print(f"Successfully loaded farm boundary model from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading farm boundary model: {e}")
    model = None # Handle cases where the model fails to load

# Load the weed detection model
try:
    weed_model = YOLO(WEED_MODEL_PATH)
    print(f"Successfully loaded weed detection model from {WEED_MODEL_PATH}")
except Exception as e:
    print(f"Error loading weed detection model: {e}")
    weed_model = None # Handle cases where the weed model fails to load

# Define disease classes (should be before model loading if num_classes is derived from it)
DISEASE_CLASSES = ['Pepper,_bell___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Apple___Apple_scab', 'Tomato___Target_Spot', 'Peach___healthy', 'Grape___Black_rot', 'Apple___healthy', 'Tomato___healthy', 'Tomato___Septoria_leaf_spot', 'Raspberry___healthy', 'Squash___Powdery_mildew', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Strawberry___healthy', 'Potato___Early_blight', 'Potato___Late_blight', 'Peach___Bacterial_spot', 'Potato___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Pepper,_bell___Bacterial_spot', 'Blueberry___healthy', 'Cherry_(including_sour)___healthy', 'Apple___Cedar_apple_rust', 'Strawberry___Leaf_scorch', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Tomato___Early_blight', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Corn_(maize)___healthy', 'Tomato___Leaf_Mold', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Corn_(maize)___Common_rust_', 'Tomato___Bacterial_spot', 'Corn_(maize)___Northern_Leaf_Blight', 'Grape___healthy', 'Apple___Black_rot', 'Grape___Esca_(Black_Measles)', 'Soybean___healthy', 'Tomato___Tomato_mosaic_virus', 'Tomato___Late_blight']

# Load the disease detection model
disease_model = None # Initialize as None
try:
    num_classes = len(DISEASE_CLASSES)
    # Instantiate the model architecture
    disease_model_instance = ResNet9(in_channels=3, num_diseases=num_classes)
    
    # Load the state dictionary
    state_dict = torch.load(DISEASE_MODEL_PATH, map_location=torch.device('cpu'))
    disease_model_instance.load_state_dict(state_dict)
    
    # Set the model to evaluation mode
    disease_model_instance.eval()
    
    disease_model = disease_model_instance # Assign the successfully loaded model
    print(f"Successfully loaded disease detection model state_dict from {DISEASE_MODEL_PATH}")
except Exception as e:
    print(f"Error loading disease detection model: {e}") # disease_model remains None

# --- Helper Function: Pixel Coordinates to Geo Coordinates ---
# IMPORTANT: This is a simplified linear interpolation assuming a flat Earth projection
# over the small area shown in the map view (like Web Mercator locally).
# Accuracy depends on zoom level and latitude. May need refinement.
def pixel_to_geo(px, py, img_width, img_height, bounds):
    """Converts pixel coordinates (from top-left) to geographic coordinates."""
    # bounds should be {'north': lat, 'south': lat, 'east': lng, 'west': lng}
    map_width_deg = bounds['east'] - bounds['west']
    map_height_deg = bounds['north'] - bounds['south']

    # Normalize pixel coordinates (0.0 to 1.0)
    norm_x = px / img_width
    norm_y = py / img_height

    # Calculate geo coordinates (Latitude decreases as Y increases)
    geo_lng = bounds['west'] + (norm_x * map_width_deg)
    geo_lat = bounds['north'] - (norm_y * map_height_deg) # Y is inverted (0 is top)

    return {'lat': geo_lat, 'lng': geo_lng}

# --- Helper Function: Calculate approximate area per pixel ---
def calculate_area_per_pixel(bounds, img_width, img_height):
    """Calculates approximate area in square meters per pixel."""
    R_EARTH = 6371000 # Earth radius in meters
    lat_north = math.radians(bounds['north'])
    lat_south = math.radians(bounds['south'])
    lon_east = math.radians(bounds['east'])
    lon_west = math.radians(bounds['west'])

    avg_lat = (lat_north + lat_south) / 2.0

    # Approx distance north-south and east-west in meters
    dist_ns = R_EARTH * (lat_north - lat_south)
    dist_ew = R_EARTH * (lon_east - lon_west) * math.cos(avg_lat)

    # Avoid division by zero if image dimensions are invalid
    if img_height <= 0 or img_width <= 0:
        return 0.0

    meters_per_pixel_y = dist_ns / img_height
    meters_per_pixel_x = dist_ew / img_width

    # Area per pixel in square meters
    area_sq_m_per_pixel = meters_per_pixel_x * meters_per_pixel_y
    return area_sq_m_per_pixel

# --- API View ---
@method_decorator(csrf_exempt, name='dispatch') # Disable CSRF for API endpoint for simplicity
class SegmentMapView(View):

    def post(self, request, *args, **kwargs):
        if not model:
             return JsonResponse({'error': 'Farm boundary model not loaded'}, status=500)

        try:
            data = json.loads(request.body)
            image_data_url = data.get('image')
            map_info = data.get('mapInfo')

            if not image_data_url or not map_info:
                return JsonResponse({'error': 'Missing image or mapInfo'}, status=400)

            bounds = map_info.get('bounds')
            zoom = map_info.get('zoom') # Zoom might be useful for coordinate refinement later
            if not bounds or not isinstance(bounds, dict):
                 return JsonResponse({'error': 'Invalid map bounds in mapInfo'}, status=400)


            # Decode Base64 Image
            header, encoded = image_data_url.split(',', 1)
            image_data = base64.b64decode(encoded)
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            img_np = np.array(image)
            img_height, img_width, _ = img_np.shape

            # Perform Inference
            results = model.predict(source=img_np, save=False, conf=0.5) # Adjust confidence as needed

            detected_polygons = []

            if results and results[0].masks:
                print(f"Detected {len(results[0].masks)} masks.")
                # Iterate through detected masks
                for mask_data in results[0].masks.xy: # Use .xy for polygon points
                    pixel_polygon = mask_data.astype(int).tolist() # List of [x, y]

                    if len(pixel_polygon) < 3: # Need at least 3 points for a polygon
                        continue

                    # Convert pixel coordinates to geo coordinates
                    geo_polygon_paths = []
                    for px, py in pixel_polygon:
                        # Clamp pixel values to image dimensions to avoid errors
                        px_clamped = max(0, min(px, img_width - 1))
                        py_clamped = max(0, min(py, img_height - 1))
                        geo_point = pixel_to_geo(px_clamped, py_clamped, img_width, img_height, bounds)
                        geo_polygon_paths.append(geo_point)

                    detected_polygons.append({
                        'paths': geo_polygon_paths
                        # Add score or class if needed: 'score': score, 'class': class_name
                    })
            else:
                 print("No masks detected in results.")


            return JsonResponse({'polygons': detected_polygons})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            print(f"Error during segmentation: {e}") # Log the error server-side
            return JsonResponse({'error': 'Internal server error during segmentation.'}, status=500)

# --- New View for Farm Boundary Detection --- 

@csrf_exempt # Disable CSRF for API endpoint for simplicity (use proper auth/CSRF in production)
def detect_farm_boundaries_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)
    
    if not model:
        return JsonResponse({'error': 'Farm boundary model not loaded. Check server logs.'}, status=500)

    try:
        data = json.loads(request.body)
        image_base64 = data.get('image_base64')
        bounds_data = data.get('bounds') # Expecting {"north_east": {"lat": y, "lng": x}, "south_west": {"lat": y, "lng": x}}

        if not image_base64 or not bounds_data:
            return JsonResponse({'error': 'Missing image_base64 or bounds'}, status=400)
        
        if not isinstance(bounds_data, dict) or 'north_east' not in bounds_data or 'south_west' not in bounds_data:
             return JsonResponse({'error': 'Invalid bounds format'}, status=400)
             
        ne = bounds_data['north_east']
        sw = bounds_data['south_west']
        if not all(k in ne for k in ('lat', 'lng')) or not all(k in sw for k in ('lat', 'lng')):
            return JsonResponse({'error': 'Invalid lat/lng in bounds'}, status=400)
            
        # Prepare bounds for helper function (adjusting names)
        bounds_for_helper = {
            'north': ne['lat'],
            'south': sw['lat'],
            'east': ne['lng'],
            'west': sw['lng']
        }

        # --- Decode Image ---
        try:
            header, encoded = image_base64.split(',', 1)
            image_data = base64.b64decode(encoded)
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            img_np = np.array(image)
            img_height, img_width, _ = img_np.shape
            print(f"Decoded image: {img_width}x{img_height}")
        except Exception as img_err:
            print(f"Error decoding image: {img_err}")
            return JsonResponse({'error': 'Failed to decode image data'}, status=400)
            
        # --- Perform Inference ---
        print("Running model inference...")
        try:
            # Increase confidence threshold to filter weaker detections
            # Add iou parameter and adjust confidence level
            results = model.predict(source=img_np, save=False, conf=0.5, iou=0.45)
        except Exception as pred_err:
            print(f"Error during model prediction: {pred_err}")
            return JsonResponse({'error': 'Error during model prediction'}, status=500)
            
        print(f"Inference complete. Results: {len(results) if results else 0}")
        
        # Calculate area per pixel once
        try:
            area_sq_m_per_pixel = calculate_area_per_pixel(bounds_for_helper, img_width, img_height)
            print(f"Approx area per pixel (sq m): {area_sq_m_per_pixel}")
        except Exception as area_calc_err:
            print(f"Error calculating area per pixel: {area_calc_err}")
            # Default to 0 or handle appropriately if calculation fails
            area_sq_m_per_pixel = 0.0

        # --- Process Results and Convert to GeoJSON ---
        geojson_features = []
        if results and results[0].masks:
            print(f"Detected {len(results[0].masks)} masks.")
            # Use .xy for polygon points (list of [x, y])
            for i, mask_xy in enumerate(results[0].masks.xy):
                pixel_polygon_raw = mask_xy.astype(np.int32) # Use int32 for OpenCV

                if len(pixel_polygon_raw) < 3: # Need at least 3 points for a valid polygon
                    print(f"Skipping mask {i}: Not enough points ({len(pixel_polygon_raw)})")
                    continue

                # --- Add Smoothing ---
                # Reshape for approxPolyDP: (N, 1, 2)
                contour = pixel_polygon_raw.reshape((-1, 1, 2))

                # Calculate epsilon for approximation (e.g., 1% of arc length)
                # Adjust the percentage (0.01) for more or less smoothing
                epsilon = 0.01 * cv2.arcLength(contour, True)
                smoothed_contour = cv2.approxPolyDP(contour, epsilon, True)

                # Reshape back to (N, 2) and convert to list for geo conversion
                pixel_polygon_smoothed = smoothed_contour.reshape((-1, 2)).tolist()

                if len(pixel_polygon_smoothed) < 3: # Check again after smoothing
                    print(f"Skipping mask {i}: Not enough points after smoothing ({len(pixel_polygon_smoothed)})")
                    continue
                # --- End Smoothing ---

                # --- Calculate Area ---
                area_hectares = 0.0
                size_category = "Unknown"
                if area_sq_m_per_pixel > 0:
                    pixel_area = cv2.contourArea(smoothed_contour)
                    area_sq_m = pixel_area * area_sq_m_per_pixel
                    area_hectares = round(area_sq_m / 10000.0, 2) # Convert to hectares, round to 2 decimal places

                    # --- Classify Size ---
                    # Adjust thresholds as needed
                    if area_hectares < 1:
                        size_category = "Hobby Farm (<1 Ha)"
                    elif area_hectares < 10:
                        size_category = "Standard Cultivation (1-10 Ha)"
                    elif area_hectares < 100:
                        size_category = "Large Estate (10-100 Ha)"
                    else:
                        size_category = "Major Operation (>100 Ha)"
                else:
                    print(f"Skipping area calculation for mask {i} due to invalid area_per_pixel.")
                # --- End Area Calculation & Classification ---


                # Convert *smoothed* pixel coordinates to geo coordinates (list of [lng, lat]) for GeoJSON
                geo_polygon_coords = []
                # Use the smoothed polygon for conversion
                for px, py in pixel_polygon_smoothed:
                    # Clamp pixel values to image dimensions
                    px_clamped = max(0, min(px, img_width - 1))
                    py_clamped = max(0, min(py, img_height - 1))

                    # Use the existing helper function
                    geo_point = pixel_to_geo(px_clamped, py_clamped, img_width, img_height, bounds_for_helper)
                    # GeoJSON uses [longitude, latitude]
                    geo_polygon_coords.append([geo_point['lng'], geo_point['lat']])

                # Ensure the polygon is closed for GeoJSON (first and last points are the same)
                if geo_polygon_coords and geo_polygon_coords[0] != geo_polygon_coords[-1]:
                    geo_polygon_coords.append(geo_polygon_coords[0])

                # Only add if we still have a valid polygon after closing
                if len(geo_polygon_coords) >= 4: # Need at least 4 points for a closed linear ring
                    feature = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [geo_polygon_coords] # GeoJSON requires an array of rings
                        },
                        "properties": {
                            "id": i, # Add an identifier if needed
                            "area_hectares": area_hectares,
                            "size_category": size_category,
                            "message": f"Detected a {size_category.split(' (')[0]}." # Example message
                        }
                    }
                    geojson_features.append(feature)
                else:
                    print(f"Skipping mask {i}: Not enough points for a closed GeoJSON polygon after smoothing ({len(geo_polygon_coords)})")

        print(f"Returning {len(geojson_features)} GeoJSON features.")
        # Return list of GeoJSON features (FeatureCollection is also common)
        return JsonResponse(geojson_features, safe=False)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON payload'}, status=400)
    except Exception as e:
        print(f"Unhandled error in detect_farm_boundaries_view: {e}") # Log unexpected errors
        import traceback
        traceback.print_exc() # Print full traceback for debugging
        return JsonResponse({'error': 'Internal server error.'}, status=500)

# --- New View for Weed Detection ---
@csrf_exempt
def detect_weeds_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)

    if not weed_model:
        return JsonResponse({'error': 'Weed detection model not loaded. Check server logs.'}, status=500)

    try:
        # Parse request data
        data = json.loads(request.body)
        image_base64 = data.get('image_base64')

        if not image_base64:
            return JsonResponse({'error': 'Missing image_base64'}, status=400)

        # Decode Image
        try:
            # Handle various image_base64 formats (with or without data:image prefix)
            if ',' in image_base64:
                header, encoded = image_base64.split(',', 1)
            else:
                encoded = image_base64
                
            image_data = base64.b64decode(encoded)
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            img_np = np.array(image)
            img_height, img_width, _ = img_np.shape
            print(f"Decoded image for weed detection: {img_width}x{img_height}")
        except Exception as img_err:
            print(f"Error decoding image for weed detection: {img_err}")
            traceback.print_exc()
            return JsonResponse({'error': f'Failed to decode image data: {str(img_err)}'}, status=400)

        # Perform Inference with error handling
        print("Running weed detection model inference...")
        try:
            # Use similar parameters as farm boundaries for consistency
            results = weed_model.predict(source=img_np, save=False, conf=0.5    , iou=0.45)
            print(f"Weed detection inference complete. Results: {len(results) if results else 0}")
        except Exception as pred_err:
            print(f"Error during weed model prediction: {pred_err}")
            traceback.print_exc()
            return JsonResponse({'error': f'Error during weed model prediction: {str(pred_err)}'}, status=500)

        # Process Results
        detected_weeds = []
        
        try:
            # Check if results exist and contain masks
            if not results or not results[0].masks:
                print("No weed masks detected in results.")
                return JsonResponse({'detected_weeds': []})
            
            # Process each mask/detection
            print(f"Detected {len(results[0].masks)} weed masks.")
            
            # Check if model has class names
            names = results[0].names if hasattr(results[0], 'names') else {}
            print(f"Model class names: {names}")
            
            # Process detections
            for i in range(len(results[0].masks.xy)):
                try:
                    # Get mask polygon
                    mask_xy = results[0].masks.xy[i]
                    pixel_polygon = mask_xy.astype(int).tolist()
                    
                    if len(pixel_polygon) < 3:  # Need at least 3 points for a polygon
                        print(f"Skipping mask {i}: not enough points ({len(pixel_polygon)})")
                        continue
                    
                    # Get classification info if available
                    class_id = -1
                    confidence = 0.0
                    
                    if results[0].boxes and i < len(results[0].boxes):
                        box = results[0].boxes[i]
                        class_id = int(box.cls.item()) if hasattr(box, 'cls') else -1
                        confidence = float(box.conf.item()) if hasattr(box, 'conf') else 0.0
                    
                    # Get class name
                    class_name = names.get(class_id, "Unknown") if class_id >= 0 else "Unknown"
                    
                    # Simple polygon smoothing (similar to farm boundaries)
                    # Reshape for approxPolyDP: (N, 1, 2)
                    if len(pixel_polygon) > 10:  # Only smooth if enough points
                        contour = np.array(pixel_polygon).reshape((-1, 1, 2)).astype(np.int32)
                        epsilon = 0.01 * cv2.arcLength(contour, True)
                        smoothed_contour = cv2.approxPolyDP(contour, epsilon, True)
                        pixel_polygon = smoothed_contour.reshape((-1, 2)).tolist()
                    
                    # Add to detected weeds
                    detected_weeds.append({
                        'id': i,
                        'class_name': class_name,
                        'confidence': round(confidence, 2),
                        'polygon_pixels': pixel_polygon
                    })
                    
                except Exception as detection_err:
                    print(f"Error processing detection {i}: {detection_err}")
                    continue  # Skip this detection but continue with others
            
            return JsonResponse({'detected_weeds': detected_weeds})
            
        except Exception as process_err:
            print(f"Error processing results: {process_err}")
            traceback.print_exc()
            return JsonResponse({'error': f'Error processing detection results: {str(process_err)}'}, status=500)

    except json.JSONDecodeError as json_err:
        return JsonResponse({'error': f'Invalid JSON payload: {str(json_err)}'}, status=400)
    except Exception as e:
        print(f"Unhandled error in detect_weeds_view: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': f'Internal server error during weed detection: {str(e)}'}, status=500)

# --- New View for Disease Detection ---
@method_decorator(csrf_exempt, name='dispatch')
class DetectDiseaseView(View):
    # Define the image transformations with larger input size to prevent dimension issues
    preprocess = transforms.Compose([
        transforms.Resize(256), # Resize to 256x256
        transforms.CenterCrop(224), # Crop to 224x224 from center
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]) # Standard normalization for ImageNet models
    ])

    def post(self, request, *args, **kwargs):
        if not disease_model: # Check if model loaded
            return JsonResponse({'error': 'Disease detection model not loaded or failed to initialize.'}, status=500)

        if request.method == 'POST' and request.FILES.get('image'):
            image_file = request.FILES['image']
            
            try:
                # Open the image using Pillow
                img = Image.open(image_file).convert('RGB')
                
                # Preprocess the image
                img_tensor = self.preprocess(img)
                img_tensor = img_tensor.unsqueeze(0)  # Add batch dimension

                # Make prediction
                with torch.no_grad():
                    outputs = disease_model(img_tensor) # Use the loaded model instance
                    _, predicted_idx = torch.max(outputs, 1)
                    predicted_class = DISEASE_CLASSES[predicted_idx.item()]
                    
                    # Get confidence score
                    probabilities = F.softmax(outputs, dim=1)
                    confidence = probabilities[0][predicted_idx.item()].item()

                return JsonResponse({
                    'predicted_class': predicted_class,
                    'confidence': confidence
                })

            except Exception as e:
                print(f"Error processing disease detection: {e}")
                return JsonResponse({'error': f'Error processing image: {str(e)}'}, status=500)
        
        return JsonResponse({'error': 'Invalid request'}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class TreatmentChatView(View):
    _knowledge_base_cache = None # Cache for the loaded knowledge base
    _conversation_context_cache = {} # Add cache for conversation contexts
    _topic_embeddings_cache = {} # Cache for topic-specific embeddings

    SYSTEM_INSTRUCTION = (
        "You are FarmWise AI, a friendly and practical agricultural assistant for farmers and gardeners."
        "\n\n"
        "YOUR ROLE AND VOICE:"
        "\n"
        "1. IDENTITY: You are a knowledgeable but casual farming assistant. Use conversational language that sounds natural and engaging. Be conversational, friendly and direct while still being informative. Never start responses with phrases like \"Here's some helpful information about...\" or other formulaic openings."
        "\n"
        "2. OUTPUT FORMAT: Write in a casual, conversational style as if chatting with a friend who's a farmer. Use short paragraphs and occasional bullet points. Vary your response style and always sound natural. Feel free to ask follow-up questions when appropriate."
        "\n"
        "3. CONVERSATION STYLE: Be friendly, practical, and conversational. Use a natural, flowing tone that builds rapport. Avoid academic or formal language. Use contractions and casual phrasing like \"you'll want to\" rather than \"it is recommended that one should\"."
        "\n\n"
        "HOW TO HANDLE DIFFERENT QUESTION TYPES:"
        "\n"
        "1. PLANT DISEASES & WEEDS: This is your primary strength."
        "\n"
        "   - USING PROVIDED CONTEXT: When knowledge base information is provided, use it as your primary source for answering, but COMPLETELY rewrite it in your own conversational style. Add your own insights and organize the information in a user-friendly way. Never say \"According to the information\" or reference the knowledge base."
        "\n"
        "   - FOLLOW-UP QUESTIONS: When the user asks a follow-up question, stay on the same topic and provide more specific details about your previous answer. DO NOT go searching for new information unrelated to the previous topic."
        "\n"
        "   - FORMATTING DISEASE/WEED ADVICE: Structure your responses in a conversational way, covering identification, treatment options, and prevention strategies naturally without formal headers."
        "\n"
        "2. SYMPTOM QUESTIONS: If a farmer describes symptoms without naming a disease, suggest possibilities in a casual way and mention the Disease Detection tool: \"That sounds like it could be X. You might want to try our Disease Detection feature to confirm - just upload a photo in the app.\""
        "\n"
        "3. TREATMENT AMOUNTS/TIMING: Be conversational but precise about application rates: \"You'll want about X amount per plant - a bit more or less is usually fine, but always check the product label.\""
        "\n"
        "4. NON-RAG RESPONSES: If no relevant context is provided but the question is agricultural, provide a general answer in a casual, helpful tone."
        "\n\n"
        "CONVERSATION HISTORY & CONTEXT:"
        "\n"
        "1. MEMORY: Use the conversation history naturally. If a farmer mentioned a crop or problem earlier, remember this context."
        "\n"
        "2. VARIATIONS: Provide slight variations in your responses if a farmer asks similar questions, while maintaining consistency in the core advice."
        "\n\n"
        "SAFETY CONSIDERATIONS:"
        "\n"
        "1. For chemical treatments, casually mention safety precautions: \"Just make sure to wear gloves when applying this, and keep it away from waterways.\""
        "\n"
        "2. When relevant, mention both organic and conventional options in a balanced way."
        "\n"
        "3. CRITICAL: When a user asks about plant nutrient deficiencies, provide ONLY information about those nutrient deficiencies, NOT about unrelated diseases."
    )

    def _extract_topic_from_message(self, message):
        """Extract the main agricultural topic from a message."""
        # Extract crops, nutrients, diseases or key agricultural concepts
        crops = ['corn', 'wheat', 'soybean', 'rice', 'potato', 'tomato', 'apple', 'citrus', 'barley', 'oats']
        nutrients = ['nitrogen', 'phosphorus', 'potassium', 'calcium', 'magnesium', 'sulfur', 'zinc', 'iron', 'manganese', 'boron']
        problems = ['deficiency', 'excess', 'disease', 'pest', 'weed', 'fungus', 'mold', 'rot', 'blight', 'mildew']
        
        message_lower = message.lower()
        
        # First check for nutrient deficiencies as a specific category
        for nutrient in nutrients:
            if nutrient in message_lower and 'deficiency' in message_lower:
                return f"{nutrient} deficiency"
        
        # Check for crop + problem combinations
        for crop in crops:
            if crop in message_lower:
                for problem in problems:
                    if problem in message_lower:
                        return f"{crop} {problem}"
                return crop  # If just the crop is mentioned
        
        # Check for standalone problems
        for problem in problems:
            if problem in message_lower:
                return problem
        
        # Extract nouns as fallback
        words = message.split()
        if len(words) >= 2:
            return " ".join(words[:2])  # Return first two words as topic
        return message[:20]  # Or truncated message
            
    def _load_knowledge_bases(self): 
        if TreatmentChatView._knowledge_base_cache is not None:
            return TreatmentChatView._knowledge_base_cache

        knowledge_documents = []
        
        # --- Load Disease CSV ---
        disease_csv_path = os.path.normpath(os.path.join(settings.BASE_DIR, '../../../Datasets/Treatment Dataset/cleaned_plant_diseases.csv'))
        try:
            with open(disease_csv_path, mode='r', encoding='utf-8') as file:
                reader = csv.reader(file, delimiter=';')
                header = next(reader) # Skip header
                for i, row in enumerate(reader):
                    if len(row) == 2:
                        name = row[0].strip()
                        content = row[1].strip()
                        keywords = [kw.strip().lower() for kw in name.split()] + ["treatment", "control", "disease"]
                        knowledge_documents.append({
                            "id": f"disease_doc_{i}",
                            "name": name,
                            "content": content,
                            "keywords": list(set(keywords)),
                            "type": "disease"
                        })
            print(f"Successfully loaded {len(knowledge_documents)} disease documents.")
        except FileNotFoundError:
            print(f"Error: Disease CSV file not found at {disease_csv_path}")
        except Exception as e:
            print(f"Error loading disease CSV: {e}")

        # --- Load Weed CSV ---
        weed_csv_path = os.path.normpath(os.path.join(settings.BASE_DIR, '../../../Datasets/Treatment Dataset/weed_treatments.csv'))
        initial_weed_doc_count = len(knowledge_documents)
        try:
            with open(weed_csv_path, mode='r', encoding='utf-8') as file:
                reader = csv.reader(file, delimiter=';')
                header = next(reader) # Skip header
                for i, row in enumerate(reader):
                    if len(row) >= 2: # Expecting at least Name and Treatment
                        name = row[0].strip()
                        content = row[1].strip()
                        # Description and Impact can be part of the content or keywords
                        description = row[2].strip() if len(row) > 2 else ""
                        impact = row[3].strip() if len(row) > 3 else ""
                        full_content = f"{content} Description: {description} Impact: {impact}".strip()
                        
                        keywords = [kw.strip().lower() for kw in name.split()] + ["weed", "control", "treatment", "herbicide"]
                        knowledge_documents.append({
                            "id": f"weed_doc_{i}",
                            "name": name,
                            "content": full_content,
                            "keywords": list(set(keywords)),
                            "type": "weed"
                        })
            print(f"Successfully loaded {len(knowledge_documents) - initial_weed_doc_count} weed documents.")
        except FileNotFoundError:
            print(f"Error: Weed CSV file not found at {weed_csv_path}")
        except Exception as e:
            print(f"Error loading weed CSV: {e}")
            
        # Fallback if no documents loaded
        if not knowledge_documents:
            print("No knowledge documents loaded. Using default general advice.")
            knowledge_documents = [{
                "id": "default_doc",
                "name": "General Agricultural Advice",
                "content": "For agricultural advice, please specify if you are asking about a plant disease or a weed. For plant diseases, good practices include removing infected parts, ensuring air circulation, and using appropriate treatments. For weeds, control methods include manual removal, mulching, and selective herbicides. Always consult local experts for specific recommendations.",
                "keywords": ["treatment", "control", "manage", "prevent", "disease", "plant", "care", "weed", "agriculture"],
                "type": "general"
            }]

        TreatmentChatView._knowledge_base_cache = knowledge_documents
        return knowledge_documents

    @property
    def knowledge_documents(self):
        return self._load_knowledge_bases() # Updated call

    def _retrieve_relevant_documents(self, query, top_k=3, topic_hints=None):
        """Enhanced document retrieval that considers topic context and handles nutrient deficiencies."""
        query_lower = query.lower()
        
        # Special handling for nutrient deficiency questions
        if any(nutrient in query_lower for nutrient in ['nitrogen', 'phosphorus', 'potassium']) and 'deficiency' in query_lower:
            # For nutrient deficiency questions, we should focus on nutritional issues, not diseases
            results = []
            # First try to find exact matches for the nutrient deficiency
            for doc in self.knowledge_documents:
                content_lower = doc['content'].lower()
                if (('nitrogen' in query_lower and 'nitrogen' in content_lower) or
                    ('phosphorus' in query_lower and 'phosphorus' in content_lower) or
                    ('potassium' in query_lower and 'potassium' in content_lower)) and 'deficiency' in content_lower:
                    results.append(doc)
            
            # If we found specific nutrient deficiency documents, return those
            if results:
                return results[:top_k]
            
            # Otherwise, look for general nutritional documents
            filtered_docs = [
                doc for doc in self.knowledge_documents
                if any(term in doc['content'].lower() for term in 
                      ['fertilizer', 'nutrition', 'nutrient', 'deficiency', 'fertility'])
            ]
            
            if filtered_docs:
                return filtered_docs[:top_k]
        
        # Existing document retrieval logic with keywords
        keywords = [word.lower() for word in query.split() if len(word) > 3]
        
        # If we have topic hints, add those keywords to improve retrieval
        if topic_hints:
            keywords.extend([word.lower() for word in topic_hints.split() if len(word) > 3])
        
        results = []
        for doc in self.knowledge_documents:
            # Calculate keyword matches
            content_lower = doc['content'].lower()
            name_lower = doc['name'].lower()
            
            keyword_score = sum(
                3 if keyword in name_lower else
                1 if keyword in content_lower else 0
                for keyword in keywords
            )
            
            if keyword_score > 0:
                results.append((doc, keyword_score))
        
        # Sort by score (descending)
        results.sort(key=lambda x: x[1], reverse=True)
        
        # Return top-k documents or fewer if not enough matches
        return [doc for doc, _ in results[:top_k]] if results else []

    def post(self, request, *args, **kwargs):
        if not GOOGLE_API_KEY:
            return JsonResponse({'error': 'Google API Key not configured on server.'}, status=500)

        try:
            data = json.loads(request.body)
            user_message = data.get('message', "").strip()
            history = data.get('history', [])
            session_id = data.get('session_id', str(uuid.uuid4()))  # Add session tracking

            if not user_message:
                return JsonResponse({'error': 'Missing message in request'}, status=400)

            # Store the current conversation context with more detailed information
            conversation_context = self._conversation_context_cache.get(session_id, {
                'last_topic': None,
                'last_query': None,
                'last_response': None,
                'query_count': 0,
                'relevant_documents': []
            })
            
            conversation_context['query_count'] += 1
            
            current_turn_user_entry = {"role": "user", "parts": [user_message]}

            # Skip further processing for non-agricultural queries
            if not self._is_agricultural_topic(user_message) and conversation_context['query_count'] > 1:
                print(f"❌ Query rejected as non-agricultural: '{user_message}'")
                ai_response_text = "I focus on farming topics. What agricultural question can I help with today?"
                current_turn_model_entry = {"role": "model", "parts": [ai_response_text]}
                history.append(current_turn_user_entry)
                history.append(current_turn_model_entry)
                
                return JsonResponse({
                    'ai_response': ai_response_text, 
                    'history': history,
                    'session_id': session_id
                })

            # Improved follow-up detection
            is_follow_up = self._is_follow_up_question(user_message, conversation_context)
            
            # Log the follow-up detection more clearly
            if is_follow_up and conversation_context['last_topic']:
                print(f"Detected follow-up question: '{user_message}'. Using previous context about '{conversation_context['last_topic']}'")
                
                # For simple clarifications, use the previous topic's retrieval context
                if conversation_context['relevant_documents']:
                    relevant_documents = conversation_context['relevant_documents']
                    topic_desc = conversation_context['last_topic']
                    
                    # For follow-ups, create a natural and more subtle continuation prompt
                    if "deficiency" in topic_desc.lower() and conversation_context['last_query']:
                        enhanced_user_message = f"""This is a follow-up to our conversation about {topic_desc}.

Question: {user_message}

Please continue the discussion about {topic_desc}."""
                    else:
                        enhanced_user_message = f"""This is related to our previous chat about {topic_desc}.

Question: {user_message}"""
                else:
                    # If we don't have previous documents, do a new search with the last topic
                    topic_hints = conversation_context['last_topic']
                    relevant_documents = self._retrieve_relevant_documents(
                        conversation_context['last_topic'],
                        top_k=3, 
                        topic_hints=topic_hints
                    )
                    enhanced_user_message = f"This relates to {conversation_context['last_topic']}. Question: {user_message}"
            else:
                # Extract the main topic from the query to store for future context
                extracted_topic = self._extract_topic_from_message(user_message)
                
                # For new questions, find relevant documents
                relevant_documents = self._retrieve_relevant_documents(user_message, top_k=3)
                enhanced_user_message = user_message
                
                # Update the conversation context with this new topic
                conversation_context['last_topic'] = extracted_topic

            # Update the conversation context
            conversation_context['last_query'] = user_message
            conversation_context['relevant_documents'] = relevant_documents
            self._conversation_context_cache[session_id] = conversation_context
            
            # Format the retrieved context into a readable string for the model prompt
            retrieved_context_str = ""
            for doc in relevant_documents:
                doc_name = doc['name']
                doc_content = doc['content']
                retrieved_context_str += f"Information about {doc_name}:\n{doc_content}\n\n"
            
            # Create a cleaner, more natural prompt for Gemini
            if is_follow_up:
                prompt_for_this_turn = f'''The user is asking a follow-up question: {user_message}

This relates to the previous topic: {conversation_context['last_topic']}

Relevant information:
{retrieved_context_str}

Respond in a friendly, conversational tone. Continue the natural flow of the conversation without using formulaic phrases like "Here's some helpful information about..." or "Based on the information...".'''
            elif retrieved_context_str:
                prompt_for_this_turn = f'''The user asks: {user_message}

Relevant information:
{retrieved_context_str}

Respond in a friendly, conversational tone without using formulaic phrases like "Here's some helpful information about..." or "Based on the information...". Just talk naturally about the topic, integrating the information in a casual, helpful way as if chatting with a friend who's a farmer.'''
            else:
                # No RAG context, still keep it natural
                prompt_for_this_turn = f'''The user asks: {user_message}

Respond in a friendly, conversational tone as if you're chatting with a farmer friend. Provide practical advice in a casual way.'''
            
            current_turn_user_entry["parts"] = [prompt_for_this_turn] 
            history.append(current_turn_user_entry)

            model_to_use = "gemini-2.0-flash"
            
            ai_response_text = None
            try:
                gemini_model = genai.GenerativeModel(
                    model_name=model_to_use,
                    safety_settings=[
                        {"category": "HARM_CATEGORY_HARMFUL_CONTENT", "threshold": "BLOCK_NONE"},
                        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
                    ],
                    system_instruction=self.SYSTEM_INSTRUCTION
                )
                chat_session = gemini_model.start_chat(history=history[:-1] if len(history) > 1 else []) 
                generation_config = genai.types.GenerationConfig(temperature=0.7, top_p=0.92, top_k=45, max_output_tokens=800)
                
                # Log the prompt we're sending to Gemini for debugging
                print(f"Sending to Gemini 2.0 Flash - User query: '{user_message}'")
                print(f"Is follow-up: {is_follow_up}")
                print(f"History entries: {len(history)} entries")
                if retrieved_context_str:
                    print(f"Retrieved RAG context length: {len(retrieved_context_str)} chars")
                else:
                    print("No RAG context retrieved")
                
                # Send message to Gemini
                response = chat_session.send_message(history[-1]["parts"], generation_config=generation_config)
                
                if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
                    ai_response_text = "".join(part.text for part in response.candidates[0].content.parts).strip()
                    print(f"Received valid response from Gemini ({len(ai_response_text)} chars)")
                    # Store the response in context for future reference
                    conversation_context['last_response'] = ai_response_text
                    self._conversation_context_cache[session_id] = conversation_context
                else: 
                    print("❌ Gemini returned empty or blocked response")
                    
                    block_reason_msg = "Response was empty or content generation was stopped."
                    finish_reason_name = "UNKNOWN"
                    if response.candidates and response.candidates[0].finish_reason:
                        finish_reason_name = response.candidates[0].finish_reason.name
                    
                    prompt_feedback_block_reason = None
                    if hasattr(response, 'prompt_feedback') and response.prompt_feedback and response.prompt_feedback.block_reason:
                        prompt_feedback_block_reason = response.prompt_feedback.block_reason.name
                        block_reason_msg = f"Blocked due to: {response.prompt_feedback.block_reason_message or prompt_feedback_block_reason}."
                    elif finish_reason_name != "STOP" and finish_reason_name != "MAX_TOKENS":
                        block_reason_msg = f"Content generation stopped due to: {finish_reason_name}."
                    
                    print(f"Gemini API issue: {block_reason_msg} For user message (pre-RAG): '{user_message}'")
                    
                    # Create a more natural fallback response instead of template-based ones
                    if retrieved_context_str:
                        # With fallback text but still maintaining a natural tone
                        ai_response_text = "I know a bit about this topic! " + self._create_natural_fallback_response(retrieved_context_str, user_message)
                    else:
                        # Generic fallback with no context
                        ai_response_text = "I'd love to help with your question about farming. Could you give me a bit more detail so I can provide better advice?"

            except Exception as e:
                print(f"Gemini API call exception: {str(e)} for user message: '{user_message}'")
                
                if retrieved_context_str:
                     # More natural fallback with context
                     ai_response_text = self._create_natural_fallback_response(retrieved_context_str, user_message)
                else:
                    ai_response_text = "I'd like to help with your farming question. Could you give me a bit more detail about what you're dealing with?"

            if not ai_response_text: 
                ai_response_text = "Sorry about that! My system had a hiccup. Could you try asking again? I really want to help with your farming question."

            # Store the response in the conversation history
            history.append({"role": "model", "parts": [ai_response_text]})
            
            # Return the response with session_id for continuity
            return JsonResponse({
                'ai_response': ai_response_text, 
                'history': history,
                'session_id': session_id
            })

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
        except Exception as e:
            print(f"Critical error in TreatmentChatView: {e}") 
            history_to_return = data.get('history', []) if 'data' in locals() else []
            if 'user_message' in locals() and not any(entry.get("role") == "user" and user_message in entry.get("parts", []) for entry in history_to_return):
                history_to_return.append({"role": "user", "parts": [user_message if 'user_message' in locals() else "Unknown query due to error"]})
            
            critical_fallback = "Sorry! I'm having a technical issue right now. Mind trying again in a moment? If it keeps happening, a quick refresh might fix things."
            history_to_return.append({"role": "model", "parts": [critical_fallback]})
            return JsonResponse({
                'ai_response': critical_fallback,
                'history': history_to_return
            }, status=500)
    
    def _create_natural_fallback_response(self, context_str, query):
        """Creates a more natural-sounding response from RAG context when the model fails."""
        # Extract key sentences from the context
        all_sentences = re.split(r'[.!?]', context_str)
        relevant_sentences = [s.strip() for s in all_sentences if len(s.strip()) > 20 and len(s.strip()) < 150]
        
        # Take a subset of sentences
        if len(relevant_sentences) > 5:
            # Use time-based but deterministic selection to add variety
            seed = int(time.time()) % 1000
            # Select sentences with different patterns based on the seed
            if seed % 3 == 0:
                selected_sentences = relevant_sentences[::3][:3]  # Every 3rd sentence
            elif seed % 3 == 1:
                selected_sentences = relevant_sentences[1::3][:3]  # Start with 2nd, then every 3rd
            else:
                selected_sentences = relevant_sentences[2::3][:3]  # Start with 3rd, then every 3rd
        else:
            selected_sentences = relevant_sentences[:3]
        
        # Create conversation starters that don't sound formulaic
        starters = [
            f"For {query.split()[0]} {query.split()[1] if len(query.split()) > 1 else ''}, ",
            "Let me share what I know. ",
            "I can help with that! ",
            "Great question. ",
            "I've got some tips for you. ",
            "This is something I know about. ",
            ""  # Sometimes no starter
        ]
        
        starter = starters[seed % len(starters)]
        
        # Join sentences with appropriate transitions
        transitions = ["", "Also, ", "Plus, ", "And ", "Remember that ", "One thing to note: "]
        response = starter
        
        for i, sentence in enumerate(selected_sentences[:3]):
            if i > 0:
                response += transitions[(seed + i) % len(transitions)]
            response += sentence + ". "
            
        # Add a follow-up question or suggestion
        follow_ups = [
            "Does that help with what you were asking?",
            "Anything specific about this you'd like to know more about?",
            "Let me know if you need more specific advice.",
            "What's your situation like?",
            ""  # Sometimes no follow-up
        ]
        
        if seed % 4 != 0:  # 75% chance to add a follow-up
            response += follow_ups[(seed + 2) % len(follow_ups)]
            
        return response

    # Improved helper method for follow-up detection
    def _is_follow_up_question(self, text, context):
        """Enhanced detection of follow-up questions with more precise patterns."""
        text = text.lower().strip()
        
        # Very short messages are almost always follow-ups
        if len(text.split()) <= 3:
            # Most definitive follow-up phrases
            strong_follow_up_phrases = [
                "why", "how", "what about", "can you", "tell me more", 
                "are you sure", "really", "explain", "elaborate",
                "details", "examples", "is that", "that's", "?", "??", "???"
            ]
            
            # Check for these strong patterns
            for phrase in strong_follow_up_phrases:
                if phrase in text or text.endswith('?'):
                    return True
        
        # Slightly longer but still clear follow-ups
        if len(text.split()) <= 6:
            medium_follow_up_phrases = [
                "why is that", "how does that", "what does that", 
                "can you explain", "tell me why", "how can i",
                "what should i", "is there more", "anything else",
                "i don't understand", "that doesn't", "that seems",
                "really", "are you certain", "are u sure"
            ]
            for phrase in medium_follow_up_phrases:
                if phrase in text:
                    return True
                
        # Check for reference to previous content
        if context.get('last_topic') and context.get('last_topic').lower() in text:
            return True
            
        return False
        
    def _is_agricultural_topic(self, text):
        """Improved version of is_agricultural_topic_strict to handle follow-ups better."""
        # First, check for identity questions which are handled separately
        identity_keywords = ['who are you', 'what is your name', 'your name', 'what can you do']
        if any(kw in text for kw in identity_keywords):
            return True

        # Non-agricultural terms that indicate the query is off-topic
        non_agri_terms = ['batman', 'superhero', 'movie', 'game', 'politics', 'celebrity', 'computer']
        if any(term in text for term in non_agri_terms):
            return False

        # Common agricultural terms - expanded list
        agricultural_terms = [
            # Basic farming terms
            'plant', 'crop', 'farm', 'soil', 'seed', 'disease', 'pest', 'weed', 
            'treatment', 'fertilizer', 'irrigation', 'agriculture', 'farming', 
            'harvest', 'cultivat', 'nutrient', 'fungus', 'insecticide', 'herbicide',
            'grow', 'garden', 'plant', 'field', 'spray', 'organic', 'chemical',
            
            # Common crops and plants
            'apple', 'corn', 'maize', 'wheat', 'rice', 'soy', 'bean', 'potato',
            'tomato', 'cucumber', 'pepper', 'onion', 'garlic', 'carrot',
            'lettuce', 'cabbage', 'broccoli', 'spinach', 'grape', 'vine',
            'orange', 'lemon', 'citrus', 'strawberr', 'raspberr', 'blueberr',
            'blackberr', 'melon', 'watermelon', 'squash', 'pumpkin',
            
            # Common diseases and pests
            'blight', 'rust', 'mildew', 'powdery', 'downy', 'rot', 'wilt',
            'spot', 'scab', 'mold', 'mould', 'mosaic', 'virus',
            'bacterial', 'fungal', 'fungus', 'insect', 'mite', 'aphid'
        ]
        
        # Very short texts (like "why?", "how?") should be allowed through
        # as they're likely follow-ups
        if len(text.split()) <= 3:
            return True
            
        # Check for common agricultural terms
        if any(term in text for term in agricultural_terms):
            return True
            
        # Check for follow-up patterns (questions, clarifications)
        if text.endswith('?') and len(text) < 30:
            return True
            
        # If we're not sure, allow the message as it might be a simple follow-up
        if len(text) < 15:
            return True
            
        return False

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_onboarding(request):
    """
    API endpoint for completing the user onboarding process.
    Creates or updates a Farm with the provided details and marks the user's profile as onboarding_completed.
    ---
    parameters:
        - name: farmName
          description: Name of the farm
          required: true
          type: string
          paramType: form
        - name: soilType
          description: Type of soil in the farm
          required: true
          type: string
          paramType: form
        - name: soilNitrogen
          description: Nitrogen content in soil (PPM)
          required: false
          type: number
          paramType: form
        - name: soilPhosphorus
          description: Phosphorus content in soil (PPM)
          required: false
          type: number
          paramType: form
        - name: soilPotassium
          description: Potassium content in soil (PPM)
          required: false
          type: number
          paramType: form
        - name: soilPh
          description: pH level of soil
          required: false
          type: number
          paramType: form
    responses:
        200:
            description: Farm created successfully
            schema:
                type: object
                properties:
                    success:
                        type: boolean
                    message:
                        type: string
                    farm:
                        type: object
        400:
            description: Validation error or missing required fields
        500:
            description: Server error
    """
    try:
        # Get the user profile
        user_profile = request.user.profile
        
        # Debug logging
        print("===== API COMPLETE ONBOARDING DEBUG =====")
        print(f"Request data: {request.data}")
        print(f"User: {request.user.username}, Profile: {user_profile}, Is farmer: {user_profile.is_farmer}")
        print(f"Has farmer profile: {hasattr(user_profile, 'farmer_profile')}")
        if hasattr(user_profile, 'farmer_profile'):
            print(f"Farmer profile: {user_profile.farmer_profile}")
        print("=========================================")
        
        # Get the farmer profile through the user profile
        try:
            farmer = user_profile.farmer_profile
        except Farmer.DoesNotExist:
            return Response(
                {"error": "User does not have a farmer profile"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extract data from request
        data = request.data
        
        # Required fields
        required_fields = ['farmName', 'soilType']
        for field in required_fields:
            if field not in data:
                return Response(
                    {"error": f"Missing required field: {field}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Validate NPK and pH values
        validation_errors = []
        
        # Constants for validation
        MAX_NITROGEN = 500
        MAX_PHOSPHORUS = 300
        MAX_POTASSIUM = 400
        MIN_PH = 0
        MAX_PH = 14
        
        # Validate nitrogen
        if 'soilNitrogen' in data and data['soilNitrogen'] is not None:
            try:
                nitrogen_value = float(data['soilNitrogen'])
                if nitrogen_value < 0:
                    validation_errors.append("Nitrogen value must be positive")
                elif nitrogen_value > MAX_NITROGEN:
                    validation_errors.append(f"Nitrogen value must be less than {MAX_NITROGEN} PPM")
            except (ValueError, TypeError):
                validation_errors.append("Nitrogen value must be a valid number")
        
        # Validate phosphorus
        if 'soilPhosphorus' in data and data['soilPhosphorus'] is not None:
            try:
                phosphorus_value = float(data['soilPhosphorus'])
                if phosphorus_value < 0:
                    validation_errors.append("Phosphorus value must be positive")
                elif phosphorus_value > MAX_PHOSPHORUS:
                    validation_errors.append(f"Phosphorus value must be less than {MAX_PHOSPHORUS} PPM")
            except (ValueError, TypeError):
                validation_errors.append("Phosphorus value must be a valid number")
        
        # Validate potassium
        if 'soilPotassium' in data and data['soilPotassium'] is not None:
            try:
                potassium_value = float(data['soilPotassium'])
                if potassium_value < 0:
                    validation_errors.append("Potassium value must be positive")
                elif potassium_value > MAX_POTASSIUM:
                    validation_errors.append(f"Potassium value must be less than {MAX_POTASSIUM} PPM")
            except (ValueError, TypeError):
                validation_errors.append("Potassium value must be a valid number")
        
        # Validate pH - must be within the pH scale (0-14)
        if 'soilPh' in data and data['soilPh'] is not None:
            try:
                ph_value = float(data['soilPh'])
                if ph_value < MIN_PH:
                    validation_errors.append(f"pH value must be at least {MIN_PH}")
                elif ph_value > MAX_PH:
                    validation_errors.append(f"pH value must be no greater than {MAX_PH}")
            except (ValueError, TypeError):
                validation_errors.append("pH value must be a valid number")
        
        # If there are validation errors, return them
        if validation_errors:
            return Response(
                {"error": "Validation failed", "details": validation_errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use transaction to ensure all operations succeed or fail together
        with transaction.atomic():
            # Create or update the farm
            farm_data = {
                'name': data.get('farmName'),
                'soil_type': data.get('soilType'),
                'address': data.get('farmAddress', ''),
                'irrigation_type': data.get('irrigationType', 'None'),
                'farming_method': data.get('farmingMethod', 'Conventional'),
                'has_water_access': data.get('hasWaterAccess', False),
                'has_road_access': data.get('hasRoadAccess', False),
                'has_electricity': data.get('hasElectricity', False),
            }
            
            # Handle optional numeric fields
            if 'soilNitrogen' in data and data['soilNitrogen']:
                farm_data['soil_nitrogen'] = data['soilNitrogen']
            if 'soilPhosphorus' in data and data['soilPhosphorus']:
                farm_data['soil_phosphorus'] = data['soilPhosphorus']
            if 'soilPotassium' in data and data['soilPotassium']:
                farm_data['soil_potassium'] = data['soilPotassium']
            if 'soilPh' in data and data['soilPh']:
                farm_data['soil_ph'] = data['soilPh']
            if 'storageCapacity' in data and data['storageCapacity']:
                farm_data['storage_capacity'] = data['storageCapacity']
            if 'yearEstablished' in data and data['yearEstablished']:
                farm_data['year_established'] = data['yearEstablished']
            
            # Handle farm boundary geojson if provided
            if 'farmBoundary' in data and data['farmBoundary']:
                farm_data['boundary_geojson'] = data['farmBoundary']
                # If area_hectares is in the properties, extract it
                if data['farmBoundary'].get('properties', {}).get('area_hectares'):
                    farm_data['size_hectares'] = data['farmBoundary']['properties']['area_hectares']
                    
                    # Set size category based on area
                    if farm_data['size_hectares'] < 10:
                        farm_data['size_category'] = 'S'  # Small
                    elif farm_data['size_hectares'] < 50:
                        farm_data['size_category'] = 'M'  # Medium
                    else:
                        farm_data['size_category'] = 'L'  # Large
            # Also check for 'boundary' field for consistency
            elif 'boundary' in data and data['boundary']:
                farm_data['boundary_geojson'] = data['boundary']
                # If area_hectares is in the properties, extract it
                if data['boundary'].get('properties', {}).get('area_hectares'):
                    farm_data['size_hectares'] = data['boundary']['properties']['area_hectares']
                    
                    # Set size category based on area
                    if farm_data['size_hectares'] < 10:
                        farm_data['size_category'] = 'S'  # Small
                    elif farm_data['size_hectares'] < 50:
                        farm_data['size_category'] = 'M'  # Medium
                    else:
                        farm_data['size_category'] = 'L'  # Large
            
            # Create or update farm
            farm, created = Farm.objects.update_or_create(
                owner=farmer,
                name=data.get('farmName'),
                defaults=farm_data
            )
            
            # Calculate estimated price
            farm.calculate_estimated_price()
            
            # Update user profile to mark onboarding as completed
            user_profile.onboarding_completed = True
            user_profile.save()
            
            return Response({
                "message": "Onboarding completed successfully",
                "farm_id": farm.id,
                "created": created
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )