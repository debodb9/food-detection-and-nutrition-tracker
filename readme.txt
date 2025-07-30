# Food Recognition and Nutrition Tracking App

This application allows users to enter food items, get nutritional information using the Nutritionix API, and track their food history with SQLite database integration. The app features a responsive frontend and robust backend integration.

## Features

- Food name input with quantity specification
- Nutritional analysis using Nutritionix API
- Food logging with timestamp
- View food history
- SQLite database for data persistence
- Responsive design
- Food recognition via text input
- Image upload and camera integration (placeholder functionality)

## Project Structure

```
food-nutrition-app/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── database.py         # Database setup and operations
│   ├── nutritionix_api.py  # Nutritionix API integration
│   └── food_recognition.py # Food recognition functionality (optional)
├── frontend/
│   ├── index.html          # Main application page
│   ├── css/
│   │   └── styles.css      # Application styling
│   └── js/
│       ├── app.js          # Main application logic
│       └── history.js      # Food history viewing functionality
└── database/
    └── food_history.db     # SQLite database
```

## Prerequisites

- Python 3.7+
- Flask
- SQLite
- Nutritionix API credentials (App ID and API Key)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd food-nutrition-app
```

### 2. Backend Setup

1. Set up a virtual environment (optional but recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

2. Install required packages:

```bash
pip install flask flask-cors requests
```

3. Get API credentials from Nutritionix:
   - Go to [Nutritionix Developer Portal](https://developer.nutritionix.com/)
   - Sign up for an account and create an application
   - Get your App ID and API Key

4. Set up environment variables for API credentials:

```bash
# On Linux/Mac
export NUTRITIONIX_APP_ID="your_app_id_here"
export NUTRITIONIX_API_KEY="your_api_key_here"

# On Windows (Command Prompt)
set NUTRITIONIX_APP_ID=your_app_id_here
set NUTRITIONIX_API_KEY=your_api_key_here

# On Windows (PowerShell)
$env:NUTRITIONIX_APP_ID="your_app_id_here"
$env:NUTRITIONIX_API_KEY="your_api_key_here"
```

Alternatively, edit `nutritionix_api.py` and replace the placeholder values directly.

### 3. Run the Backend Server

```bash
cd backend
python app.py
```

The Flask server will start at `http://localhost:5000`.

### 4. Frontend Setup

1. Open a new terminal window
2. Navigate to the frontend directory:

```bash
cd food-nutrition-app/frontend
```

3. Open `index.html` in your browser or serve it using a simple HTTP server:

```bash
# If you have Python installed:
python -m http.server 8080
```

Then access the application at `http://localhost:8080`.

## Using the Application

1. Enter a food name (e.g., "apple", "2 slices of pizza", "100g chicken breast")
2. Specify quantity if needed (default is 1)
3. Click "Get Nutrition Info"
4. Review the nutritional information
5. Click "Log This Food" to save it to your history
6. View your food history in the table below

## API Endpoints

- `POST /api/recognize-food`: Get nutrition information for a food item
- `POST /api/recognize-food-image`: Process image for food recognition
- `POST /api/log-food`: Log a food entry to the database
- `GET /api/food-history`: Get all food entries from the database

## Customization

- Edit `styles.css` to change the application's appearance
- Modify database schema in `database.py` to store additional information
- Extend the backend functionality in `app.py`

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Nutritionix API](https://www.nutritionix.com/business/api) for nutrition data
- [Bootstrap](https://getbootstrap.com/) for UI components
- [Font Awesome](https://fontawesome.com/) for icons