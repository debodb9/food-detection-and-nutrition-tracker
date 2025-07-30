# backend/nutritionix_api.py
import requests
import os
import json

# Nutritionix API credentials
# You'll need to replace these with your actual API credentials from Nutritionix
NUTRITIONIX_APP_ID = os.environ.get('NUTRITIONIX_APP_ID')
NUTRITIONIX_API_KEY = os.environ.get('NUTRITIONIX_API_KEY')

def get_nutrition_info(food_name, quantity="1"):
    """
    Get nutrition information for a food item from Nutritionix API
    """
    endpoint = "https://trackapi.nutritionix.com/v2/natural/nutrients"
    
    headers = {
        'Content-Type': 'application/json',
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_API_KEY
    }
    
    # Format the query with quantity
    query = f"{quantity} {food_name}"
    
    payload = {
        'query': query,
        'timezone': 'US/Eastern'
    }
    
    try:
        response = requests.post(endpoint, headers=headers, json=payload)
        
        if response.status_code != 200:
            print(f"Error from Nutritionix API: {response.status_code}, {response.text}")
            return None
        
        data = response.json()
        
        # Process the response to extract relevant nutrition information
        if 'foods' in data and len(data['foods']) > 0:
            food_data = data['foods'][0]
            
            nutrition_info = {
                'food_name': food_data.get('food_name'),
                'serving_qty': food_data.get('serving_qty'),
                'serving_unit': food_data.get('serving_unit'),
                'serving_weight_grams': food_data.get('serving_weight_grams'),
                'calories': food_data.get('nf_calories'),
                'total_fat': food_data.get('nf_total_fat'),
                'saturated_fat': food_data.get('nf_saturated_fat'),
                'cholesterol': food_data.get('nf_cholesterol'),
                'sodium': food_data.get('nf_sodium'),
                'total_carbohydrate': food_data.get('nf_total_carbohydrate'),
                'dietary_fiber': food_data.get('nf_dietary_fiber'),
                'sugars': food_data.get('nf_sugars'),
                'protein': food_data.get('nf_protein'),
                'potassium': food_data.get('nf_potassium'),
                'p_percentage': food_data.get('nf_p'),
                'full_nutrients': food_data.get('full_nutrients', []),
                'photo': food_data.get('photo', {})
            }
            
            return nutrition_info
        else:
            print(f"No food data found for query: {query}")
            return None
    
    except Exception as e:
        print(f"Error getting nutrition info: {str(e)}")
        return None

# Example function for testing
def test_nutritionix_api():
    """Test function to verify API integration works"""
    test_food = "1 apple"
    print(f"Testing Nutritionix API with query: {test_food}")
    result = get_nutrition_info(test_food)
    
    if result:
        print(f"Success! Found nutrition data for {result['food_name']}")
        print(f"Calories: {result['calories']}")
    else:
        print("Failed to get nutrition data. Check your API credentials and connection.")

if __name__ == "__main__":
    # Run test function if script is executed directly
    test_nutritionix_api()