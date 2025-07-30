// frontend/js/food_recognition.js

/**
 * Food Recognition Module
 * 
 * This module handles:
 * 1. Text-based food recognition
 * 2. Image-based food recognition with Keras
 * 3. Camera integration for taking food photos
 */

// API base URL - ensure this matches your backend server address
const RECOGNITION_API_BASE_URL = 'http://localhost:5000/api';

// DOM elements for image recognition
let imageUploadInput = null;
let cameraButton = null;
let previewContainer = null;
let previewImage = null;

// Initialize the food recognition features
function initFoodRecognition() {
    console.log('Initializing food recognition module...');
    
    // Add camera and image upload features to the DOM
    addImageRecognitionUI();
    
    // Set up event listeners
    setupEventListeners();
}

// Add image recognition UI elements to the page
function addImageRecognitionUI() {
    // Find the form element where we'll add our controls
    const foodForm = document.getElementById('food-form');
    
    if (!foodForm) {
        console.error('Food form not found in the DOM');
        return;
    }
    
    // Create elements for image upload and camera
    const imageRecognitionDiv = document.createElement('div');
    imageRecognitionDiv.className = 'mb-3 mt-3';
    imageRecognitionDiv.innerHTML = `
        <label class="form-label">Food Image Recognition</label>
        <div class="d-flex gap-2 mb-2">
            <button type="button" id="camera-button" class="btn btn-secondary flex-grow-1">
                <i class="fas fa-camera"></i> Take Photo
            </button>
            <label for="image-upload" class="btn btn-secondary mb-0 flex-grow-1">
                <i class="fas fa-upload"></i> Upload Image
            </label>
            <input type="file" id="image-upload" accept="image/*" class="d-none">
        </div>
        <div id="preview-container" class="d-none">
            <img id="preview-image" class="img-fluid rounded mb-2" alt="Food preview">
            <div class="d-flex gap-2">
                <button type="button" id="recognize-image-btn" class="btn btn-primary flex-grow-1">
                    Recognize Food
                </button>
                <button type="button" id="cancel-image-btn" class="btn btn-outline-secondary">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div id="recognition-results" class="mt-2 d-none">
            <div class="alert alert-info">
                <span id="recognition-message"></span>
            </div>
        </div>
    `;
    
    // Insert the elements before the submit button
    const submitButton = foodForm.querySelector('button[type="submit"]');
    foodForm.insertBefore(imageRecognitionDiv, submitButton);
    
    // Store references to the DOM elements
    imageUploadInput = document.getElementById('image-upload');
    cameraButton = document.getElementById('camera-button');
    previewContainer = document.getElementById('preview-container');
    previewImage = document.getElementById('preview-image');
}

// Set up event listeners for food recognition features
function setupEventListeners() {
    // Check if elements exist before adding listeners
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', handleImageUpload);
    }
    
    if (cameraButton) {
        cameraButton.addEventListener('click', activateCamera);
    }
    
    // Add event listeners for the recognize and cancel buttons
    const recognizeBtn = document.getElementById('recognize-image-btn');
    const cancelBtn = document.getElementById('cancel-image-btn');
    
    if (recognizeBtn) {
        recognizeBtn.addEventListener('click', recognizeFoodFromImage);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelImagePreview);
    }
}

// Handle image upload from file input
function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // Check if the file is an image
    if (!file.type.match('image.*')) {
        showToast('Please select an image file', 'error');
        return;
    }
    
    // Read and preview the image
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        previewContainer.classList.remove('d-none');
        
        // Store the image data for later use
        previewImage.dataset.imageData = e.target.result;
        
        // Hide recognition results if they were shown
        document.getElementById('recognition-results').classList.add('d-none');
    };
    
    reader.readAsDataURL(file);
}

// Activate device camera (if available)
function activateCamera() {
    // Check if the browser supports the camera API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('Camera access is not supported in your browser', 'error');
        return;
    }
    
    // Create a temporary video and canvas element for the camera
    const videoElement = document.createElement('video');
    const canvasElement = document.createElement('canvas');
    
    // Create a camera UI container
    const cameraContainer = document.createElement('div');
    cameraContainer.id = 'camera-container';
    cameraContainer.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-dark';
    cameraContainer.style.zIndex = '9999';
    
    // Add camera UI elements
    cameraContainer.innerHTML = `
        <div class="camera-view bg-black rounded overflow-hidden mb-3" style="width: 100%; max-width: 500px; height: 375px;">
            <!-- Video will be added here -->
        </div>
        <div class="d-flex gap-3">
            <button id="capture-btn" class="btn btn-lg btn-primary rounded-circle" style="width: 64px; height: 64px;">
                <i class="fas fa-camera"></i>
            </button>
            <button id="close-camera-btn" class="btn btn-lg btn-outline-light">
                Cancel
            </button>
        </div>
    `;
    
    // Add to document body
    document.body.appendChild(cameraContainer);
    
    // Add video element to camera view
    const cameraView = cameraContainer.querySelector('.camera-view');
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.style.objectFit = 'cover';
    cameraView.appendChild(videoElement);
    
    // Set up canvas for capturing images
    canvasElement.style.display = 'none';
    cameraContainer.appendChild(canvasElement);
    
    // Set up event listeners for camera UI
    const captureBtn = document.getElementById('capture-btn');
    const closeCameraBtn = document.getElementById('close-camera-btn');
    
    captureBtn.addEventListener('click', () => {
        // Capture the current video frame
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        canvasElement.getContext('2d').drawImage(videoElement, 0, 0);
        
        // Convert to base64 image
        const imageData = canvasElement.toDataURL('image/jpeg');
        
        // Set the preview image
        previewImage.src = imageData;
        previewContainer.classList.remove('d-none');
        previewImage.dataset.imageData = imageData;
        
        // Close the camera
        closeCamera(videoElement.srcObject);
        document.body.removeChild(cameraContainer);
        
        // Hide recognition results if they were shown
        document.getElementById('recognition-results').classList.add('d-none');
    });
    
    closeCameraBtn.addEventListener('click', () => {
        closeCamera(videoElement.srcObject);
        document.body.removeChild(cameraContainer);
    });
    
    // Access the camera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            videoElement.srcObject = stream;
            videoElement.play();
        })
        .catch(err => {
            document.body.removeChild(cameraContainer);
            showToast(`Camera error: ${err.message}`, 'error');
            console.error('Camera error:', err);
        });
}

// Close the camera stream
function closeCamera(stream) {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}

// Cancel image preview
function cancelImagePreview() {
    previewContainer.classList.add('d-none');
    previewImage.src = '';
    previewImage.dataset.imageData = '';
    imageUploadInput.value = '';
    
    // Hide recognition results if they were shown
    document.getElementById('recognition-results').classList.add('d-none');
}

// Show recognition results
function showRecognitionResults(message, type = 'info') {
    const resultsContainer = document.getElementById('recognition-results');
    const messageElement = document.getElementById('recognition-message');
    
    // Update message and styling
    messageElement.textContent = message;
    
    // Remove previous alert classes
    resultsContainer.querySelector('.alert').className = 'alert';
    
    // Add class based on type
    if (type === 'error') {
        resultsContainer.querySelector('.alert').classList.add('alert-danger');
    } else if (type === 'success') {
        resultsContainer.querySelector('.alert').classList.add('alert-success');
    } else {
        resultsContainer.querySelector('.alert').classList.add('alert-info');
    }
    
    // Show results container
    resultsContainer.classList.remove('d-none');
}

// Recognize food from the current image
function recognizeFoodFromImage() {
    const imageData = previewImage.dataset.imageData;
    
    if (!imageData) {
        showToast('No image to recognize', 'error');
        return;
    }
    
    // Show loading state
    document.body.style.cursor = 'wait';
    showRecognitionResults('Processing image...', 'info');
    
    // Make API request to recognize food from image
    fetch(`${RECOGNITION_API_BASE_URL}/recognize-food-image`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_data: imageData })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.foods && data.foods.length > 0) {
            // Fill in the food name field with the recognized food
            document.getElementById('food-name').value = data.foods[0];
            
            // Show recognition message
            showRecognitionResults(
                `Recognized: ${data.foods[0]} (${Math.round(data.confidence * 100)}% confidence)`, 
                'success'
            );
            
            // If we have nutrition info available, show it
            if (data.nutrition_info) {
                // Manually trigger a form submission to display nutrition info
                // We're doing this instead of directly updating the UI to reuse existing code
                setTimeout(() => {
                    document.getElementById('food-form').dispatchEvent(new Event('submit'));
                }, 500);
            }
        } else {
            showRecognitionResults(data.message || 'Could not recognize food in image', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showRecognitionResults('Error recognizing food', 'error');
    })
    .finally(() => {
        document.body.style.cursor = 'default';
    });
}

// Initialize the module when the DOM is loaded
document.addEventListener('DOMContentLoaded', initFoodRecognition);

// Export functions for use in other scripts
window.FoodRecognition = {
    recognizeFoodFromImage,
    activateCamera
};
