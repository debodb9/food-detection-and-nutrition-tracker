# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from database import setup_db, add_food_entry, get_food_history
from nutritionix_api import get_nutrition_info
from food_recognition import recognize_food_from_text, process_image_for_recognition
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize database
setup_db()

@app.route('/api/recognize-food', methods=['POST'])
def recognize_food():
    """
    Endpoint to recognize food from text input and get nutrition information
    """
    try:
        data = request.get_json()
        food_name = data.get('food_name')
        quantity = data.get('quantity', '1')
        
        if not food_name:
            return jsonify({'error': 'No food name provided'}), 400
            
        # Get nutrition info from Nutritionix API
        nutrition_info = get_nutrition_info(food_name, quantity)
        
        if not nutrition_info:
            return jsonify({'error': 'Could not get nutrition information'}), 404
            
        return jsonify(nutrition_info)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/log-food', methods=['POST'])
def log_food():
    """
    Endpoint to log food entry to database
    """
    try:
        data = request.get_json()
        food_name = data.get('food_name')
        quantity = data.get('quantity', '1')
        nutrition_data = data.get('nutrition_data')
        
        if not food_name or not nutrition_data:
            return jsonify({'error': 'Missing required data'}), 400
            
        # Add food entry to database
        add_food_entry(food_name, quantity, json.dumps(nutrition_data))
        
        return jsonify({'success': True, 'message': f'{food_name} logged successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/food-history', methods=['GET'])
def food_history():
    """
    Endpoint to get food history from database
    """
    try:
        # Get all food entries from database
        history = get_food_history()
        
        return jsonify(history)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Update to the /api/recognize-food-image endpoint in app.py

@app.route('/api/recognize-food-image', methods=['POST'])
def recognize_food_image():
    """
    Endpoint to recognize food from an uploaded image using Keras
    """
    try:
        data = request.get_json()
        image_data = data.get('image_data', '')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Process the image for food recognition
        recognition_result = process_image_for_recognition(image_data)
        
        if not recognition_result['success']:
            return jsonify({
                'success': False,
                'error': recognition_result.get('error', 'Failed to process image')
            }), 500
        
        # If we successfully recognized a food item, get nutrition info
        if recognition_result['success'] and recognition_result.get('foods'):
            food_name = recognition_result['foods'][0]
            
            # Get nutrition info for recognized food
            nutrition_info = get_nutrition_info(food_name)
            
            if nutrition_info:
                recognition_result['nutrition_info'] = nutrition_info
        
        return jsonify(recognition_result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)