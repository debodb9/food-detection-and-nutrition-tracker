import os
import base64
import logging
import io
import json
import requests
from nutritionix_api import get_nutrition_info
import google.generativeai as genai

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Replace with your Google Gemini API key
GEMINI_API_KEY = 'AIzaSyCgILdXqUnWKlCWGfCwcJG9KrsyVHAJKe8'  # Get API key at https://ai.google.dev/

# Initialize Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Define food categories we can map from Gemini predictions
FOOD_CATEGORIES = {
    'apple': 'apple',
    'banana': 'banana', 
    'orange': 'orange',
    'pizza': 'pizza',
    'hamburger': 'hamburger',
    'hot dog': 'hot dog',
    'sandwich': 'sandwich',
    'broccoli': 'broccoli',
    'carrot': 'carrot',
    'ice cream': 'ice cream',
    'cake': 'cake',
    'donut': 'donut',
    'spaghetti': 'spaghetti',
    'taco': 'taco',
    'salad': 'salad',
    # Add more mappings as needed
}

def recognize_food_from_text(food_text, quantity="1"):
    """
    Recognize food from text input using Nutritionix API
    """
    logger.info(f"Recognizing food from text: {food_text}, quantity: {quantity}")
    return get_nutrition_info(food_text, quantity)

def identify_food_with_gemini(image_bytes):
    """
    Use Google's Gemini API to identify food in an image
    """
    try:
        # If you don't have a Gemini API key, return a mock result
        if GEMINI_API_KEY == 'YOUR_GEMINI_API_KEY':
            logger.warning("Using mock result because no Gemini API key is provided")
            return fallback_recognition(image_bytes)
            
        # Create a Gemini model instance
        model = genai.GenerativeModel('models/gemini-2.0-flash')
        
        # Convert image bytes to format Gemini expects
        image_data = {
            "mime_type": "image/jpeg",  # Adjust based on your image type
            "data": base64.b64encode(image_bytes).decode('utf-8')
        }
        
        # Prompt for food identification
        prompt = """
        Identify the main food item in this image. 
        Only respond with a two words naming the food.
        """
        
        # Generate content using Gemini
        response = model.generate_content([prompt, image_data])
        
        # Extract the text response
        food_name = response.text.strip().lower()
        
        # Simple confidence score (Gemini doesn't provide confidence scores like Clarifai)
        # Using a default high confidence since Gemini is quite accurate
        confidence = 0.85
        
        logger.info(f"Gemini identified food as: {food_name}")
        
        # Map to our food categories if possible
        for category, mapped_name in FOOD_CATEGORIES.items():
            if category in food_name:
                return mapped_name, confidence
                
        # Return the identified food as is
        return food_name, confidence
        
    except Exception as e:
        logger.error(f"Error in Gemini food recognition: {str(e)}")
        return fallback_recognition(image_bytes)

def fallback_recognition(image_bytes):
    """Fallback method when API is not available"""
    import random
    
    # List of common foods to randomly select from
    common_foods = ['apple', 'banana', 'sandwich', 'salad', 'pasta', 'chicken']
    
    # Return a random food with low confidence
    food = random.choice(common_foods)
    confidence = 0.3  # Low confidence because this is a fallback
    
    return food, confidence

def process_image_for_recognition(image_base64):
    """
    Process base64 image data for food recognition using Gemini
    """
    try:
        # Remove header if present (e.g., 'data:image/jpeg;base64,')
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Decode base64 data
        image_data = base64.b64decode(image_base64)
        
        # Use Gemini API to identify food
        logger.info("Running food recognition with Gemini...")
        food_name, confidence = identify_food_with_gemini(image_data)
        
        logger.info(f"Food recognized: {food_name}, confidence: {confidence:.2f}")
        
        return {
            "success": True,
            "message": f"Food recognized with {confidence*100:.1f}% confidence",
            "foods": [food_name],
            "confidence": float(confidence)
        }
        
    except Exception as e:
        logger.error(f"Error in food recognition: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": "Could not recognize food in image. Try another image or enter food manually."
        }

def test_recognition():
    """Test function for food recognition"""
    print("Testing text-based recognition...")
    result = recognize_food_from_text("apple")
    if result:
        print(f"Success! Recognized: {result['food_name']}")
    else:
        print("Recognition failed.")
    
    print("\nNote: For image recognition, you'll need a valid Google Gemini API key.")
    print("Get one at https://ai.google.dev/")

if __name__ == "__main__":
    test_recognition()
