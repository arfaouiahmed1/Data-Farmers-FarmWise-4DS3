"""
Test script to directly test the crop classification API endpoint
"""
import requests
import json
import os
import sys

# Get token from command line or use a default for testing
token = sys.argv[1] if len(sys.argv) > 1 else "dummy_token"

print("NOTE: This script is for testing purposes only.")
print("If you are using a dummy token, you will get a 401 Unauthorized error.")
print("This is normal and helps verify that the API is returning JSON responses instead of HTML error pages.")

# Test data for crop classification
test_data = {
    "farm": 1,
    "soil_n": 50,
    "soil_p": 50,
    "soil_k": 50,
    "temperature": 25,
    "humidity": 60,
    "ph": 7,
    "rainfall": 50,
    "area": 1,
    "fertilizer_amount": 100,
    "pesticide_amount": 10,
    "governorate": "Tunis",
    "district": "",
    "irrigation": "Drip",
    "fertilizer_type": "Urea",
    "planting_season": "spring",
    "growing_season": "summer",
    "harvest_season": "autumn"
}

# Headers for authentication
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Token {token}"
}

# URL for the API endpoint
url = "http://localhost:8000/api/crop-classification/"

print(f"\nTesting API endpoint: {url}")
print(f"Headers: {headers}")
print(f"Data: {json.dumps(test_data, indent=2)}")

# Make the API request
try:
    response = requests.post(url, json=test_data, headers=headers)
    
    print(f"\nResponse status code: {response.status_code}")
    
    # Try to get JSON response
    try:
        print(f"Response data: {json.dumps(response.json(), indent=2)}")
    except json.JSONDecodeError:
        print(f"Raw response (not JSON): {response.text}")
    
    if response.status_code == 401:
        print("\nAuthentication error. Please check your token.")
    elif response.status_code == 404:
        print("\nAPI endpoint not found. Please check the URL.")
    elif response.status_code >= 500:
        print("\nServer error. Check the Django logs for more information.")
        
except Exception as e:
    print(f"\nError making request: {e}")
