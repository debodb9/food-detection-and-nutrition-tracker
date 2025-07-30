// frontend/js/app.js

// API base URL - change this to match your backend server address
const API_BASE_URL = 'http://localhost:5000/api';

// Current nutrition data
let currentNutritionData = null;

// DOM Elements
const foodForm = document.getElementById('food-form');
const foodNameInput = document.getElementById('food-name');
const foodQuantityInput = document.getElementById('food-quantity');
const nutritionResults = document.getElementById('nutrition-results');
const foodImage = document.getElementById('food-image');
const foodTitle = document.getElementById('food-title');
const foodServing = document.getElementById('food-serving');
const caloriesElem = document.getElementById('calories');
const totalFatElem = document.getElementById('total-fat');
const saturatedFatElem = document.getElementById('saturated-fat');
const cholesterolElem = document.getElementById('cholesterol');
const sodiumElem = document.getElementById('sodium');
const totalCarbsElem = document.getElementById('total-carbs');
const dietaryFiberElem = document.getElementById('dietary-fiber');
const sugarsElem = document.getElementById('sugars');
const proteinElem = document.getElementById('protein');
const logFoodBtn = document.getElementById('log-food-btn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Initialize Bootstrap toast
const toastElement = new bootstrap.Toast(toast);

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load food history when page loads
    loadFoodHistory();
    
    // Add form submit event listener
    foodForm.addEventListener('submit', handleFoodFormSubmit);
    
    // Add log food button event listener
    logFoodBtn.addEventListener('click', handleLogFood);
    
    // Add refresh history button event listener
    document.getElementById('refresh-history').addEventListener('click', loadFoodHistory);
});

// Handle food form submission
async function handleFoodFormSubmit(event) {
    event.preventDefault();
    
    const foodName = foodNameInput.value.trim();
    const quantity = foodQuantityInput.value.trim() || '1';
    
    if (!foodName) {
        showToast('Please enter a food name', 'error');
        return;
    }
    
    try {
        // Show loading state
        nutritionResults.classList.add('d-none');
        document.body.style.cursor = 'wait';
        
        // Make API request to get nutrition info
        const response = await fetch(`${API_BASE_URL}/recognize-food`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ food_name: foodName, quantity: quantity })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get nutrition information');
        }
        
        const data = await response.json();
        
        // Update UI with nutrition data
        displayNutritionInfo(data);
        
        // Store current nutrition data
        currentNutritionData = data;
        
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message || 'An error occurred', 'error');
    } finally {
        document.body.style.cursor = 'default';
    }
}

// Display nutrition information
function displayNutritionInfo(data) {
    if (!data) {
        showToast('No nutrition data found', 'error');
        return;
    }
    
    // Display food image if available
    if (data.photo && data.photo.thumb) {
        foodImage.src = data.photo.thumb;
        foodImage.alt = data.food_name;
    } else {
        foodImage.src = 'https://via.placeholder.com/150?text=No+Image';
        foodImage.alt = 'No Image Available';
    }
    
    // Set food name and serving
    foodTitle.textContent = data.food_name;
    foodServing.textContent = `${data.serving_qty} ${data.serving_unit} (${data.serving_weight_grams}g)`;
    
    // Set nutrition values
    caloriesElem.textContent = Math.round(data.calories);
    totalFatElem.textContent = data.total_fat?.toFixed(1) || '0';
    saturatedFatElem.textContent = data.saturated_fat?.toFixed(1) || '0';
    cholesterolElem.textContent = Math.round(data.cholesterol) || '0';
    sodiumElem.textContent = Math.round(data.sodium) || '0';
    totalCarbsElem.textContent = data.total_carbohydrate?.toFixed(1) || '0';
    dietaryFiberElem.textContent = data.dietary_fiber?.toFixed(1) || '0';
    sugarsElem.textContent = data.sugars?.toFixed(1) || '0';
    proteinElem.textContent = data.protein?.toFixed(1) || '0';
    
    // Show nutrition results
    nutritionResults.classList.remove('d-none');
}

// Handle logging food
async function handleLogFood() {
    if (!currentNutritionData) {
        showToast('No food data to log', 'error');
        return;
    }
    
    try {
        // Get values from form
        const foodName = currentNutritionData.food_name;
        const quantity = `${currentNutritionData.serving_qty} ${currentNutritionData.serving_unit}`;
        
        // Make API request to log food
        const response = await fetch(`${API_BASE_URL}/log-food`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                food_name: foodName,
                quantity: quantity,
                nutrition_data: currentNutritionData
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to log food');
        }
        
        const data = await response.json();
        
        // Show success message
        showToast(data.message || 'Food logged successfully!', 'success');
        
        // Reload food history
        loadFoodHistory();
        
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message || 'An error occurred', 'error');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    // Remove previous color classes
    toast.classList.remove('bg-success', 'bg-danger', 'text-white');
    
    // Add color based on type
    if (type === 'error') {
        toast.classList.add('bg-danger', 'text-white');
    } else {
        toast.classList.add('bg-success', 'text-white');
    }
    
    // Show toast
    toastElement.show();
}