# FarmWise Backend

This is the backend service for the FarmWise application, built with Django Rest Framework.

## Project Structure

- **farmwise_backend/**: Main project settings
- **core/**: User management and authentication
  - User registration, login, profile management
  - User CRUD operations
- **api/**: Integration with machine learning models and farm data
  - Disease detection
  - Weed detection
  - Farm boundaries
  - Treatment recommendations
  - Other ML model integrations

## Setup Instructions

1. Create and activate a virtual environment:
   ```
   python -m venv .venv
   .venv\Scripts\activate  # On Windows
   source .venv/bin/activate  # On macOS/Linux
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```
   python manage.py migrate
   ```

4. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

5. Run the development server:
   ```
   python manage.py runserver
   ```

## API Endpoints

### Core App

- **Authentication**: 
  - POST `/core/register/` - Register a new user
  - POST `/core/login/` - Log in and get token
  
- **User Profile**:
  - GET `/core/profile/` - Get current user profile
  - PUT `/core/profile/` - Update current user profile
  
- **Users** (Admin only):
  - GET `/core/users/` - List all users
  - GET `/core/users/{id}/` - Get specific user
  - PUT `/core/users/{id}/` - Update specific user
  - DELETE `/core/users/{id}/` - Delete specific user

### API App

- **Farm Boundaries**:
  - POST `/api/detect-farm-boundaries/` - Detect farm boundaries from satellite imagery
  
- **Weed Detection**:
  - POST `/api/detect-weeds/` - Detect weeds in farm images
  
- **Disease Detection**:
  - POST `/api/detect-disease/` - Detect diseases in crop images
  
- **Treatment Recommendation**:
  - POST `/api/chat-treatment/` - Get treatment recommendations for detected issues 