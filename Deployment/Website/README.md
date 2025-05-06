# FarmWise Project

This project consists of a Next.js frontend and a Django backend.

## Running the Development Servers

### Backend (Django)

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Ensure your virtual environment is set up and dependencies are installed (`.\venv\Scripts\activate; pip install -r requirements.txt`)
3.  Run the Django development server using the virtual environment's Python:
    ```bash
    .\venv\Scripts\python.exe manage.py runserver
    ```
    The backend should be running on `http://127.0.0.1:8000/`.

### Frontend (Next.js)

1.  Navigate to the frontend directory:
    ```bash
    cd farmwise
    ```
2.  Install dependencies if you haven't already:
    ```bash
    npm install
    ```
3.  Run the Next.js development server:
    ```bash
    npm run dev
    ```
    The frontend should be running on `http://localhost:3000/`. 