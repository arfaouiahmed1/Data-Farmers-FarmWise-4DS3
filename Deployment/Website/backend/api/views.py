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

from ultralytics import YOLO

# --- Configuration ---
# Use a relative path based on the Django project's BASE_DIR
# Assuming BASE_DIR points to the 'backend' directory
MODEL_PATH = os.path.normpath(os.path.join(settings.BASE_DIR, '../../../Models/Farm Boundaries/yolov8l-seg.pt'))
# Load the model (consider loading it once globally if performance is critical)
# For simplicity here, loading per request. Optimize later if needed.
try:
    model = YOLO(MODEL_PATH)
    print(f"Successfully loaded model from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None # Handle cases where the model fails to load

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
             return JsonResponse({'error': 'Model not loaded'}, status=500)

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
        return JsonResponse({'error': 'Model not loaded. Check server logs.'}, status=500)

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
