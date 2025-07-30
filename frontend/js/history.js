// frontend/js/history.js

// DOM Elements
const historyTableBody = document.getElementById('history-table-body');
const noHistoryMessage = document.getElementById('no-history');

// Load food history data
async function loadFoodHistory() {
    try {
        // Show loading state
        historyTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';
        
        // Make API request to get food history
        const response = await fetch(`${API_BASE_URL}/food-history`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to load food history');
        }
        
        const data = await response.json();
        
        // Display food history
        displayFoodHistory(data);
        
    } catch (error) {
        console.error('Error:', error);
        historyTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error loading history: ${error.message}</td></tr>`;
    }
}

// Display food history data
function displayFoodHistory(historyData) {
    // Clear table body
    historyTableBody.innerHTML = '';
    
    // Check if there is history data
    if (!historyData || historyData.length === 0) {
        noHistoryMessage.classList.remove('d-none');
        historyTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No food entries found</td></tr>';
        return;
    }
    
    // Hide no history message
    noHistoryMessage.classList.add('d-none');
    
    // Loop through history data and populate table
    historyData.forEach((entry, index) => {
        const nutrition = entry.nutrition_data;
        
        // Create table row
        const row = document.createElement('tr');
        
        // Add highlight animation to the most recent entry
        if (index === 0) {
            row.classList.add('highlight-row');
        }
        
        // Format date
        const date = new Date(entry.timestamp);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Set row content
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td><strong>${entry.food_name}</strong></td>
            <td>${entry.quantity}</td>
            <td><span class="badge bg-primary">${Math.round(nutrition.calories)}</span></td>
            <td>${nutrition.protein?.toFixed(1) || '0'}g</td>
            <td>${nutrition.total_carbohydrate?.toFixed(1) || '0'}g</td>
            <td>${nutrition.total_fat?.toFixed(1) || '0'}g</td>
        `;
        
        // Add row to table
        historyTableBody.appendChild(row);
    });
    
    // Add fade-in animation to new rows
    setTimeout(() => {
        const rows = historyTableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.style.animationDelay = `${index * 0.1}s`;
            row.classList.add('fade-in-up');
        });
    }, 100);
}

// Calculate daily nutrition totals
function calculateDailyTotals(historyData) {
    const totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    };
    
    // Get today's date
    const today = new Date().toLocaleDateString();
    
    // Filter for today's entries and sum up nutrition values
    historyData.forEach(entry => {
        const entryDate = new Date(entry.timestamp).toLocaleDateString();
        const nutrition = entry.nutrition_data;
        
        if (entryDate === today) {
            totals.calories += Number(nutrition.calories) || 0;
            totals.protein += Number(nutrition.protein) || 0;
            totals.carbs += Number(nutrition.total_carbohydrate) || 0;
            totals.fat += Number(nutrition.total_fat) || 0;
        }
    });
    
    return totals;
}

// Function to display daily nutrition summary
function displayDailySummary(historyData) {
    const totals = calculateDailyTotals(historyData);
    
    // Here you could add code to display the daily summary in a separate UI element
    console.log('Daily nutrition totals:', totals);
    
    return totals;
}

// Export functions for use in other scripts
window.FoodHistory = {
    loadHistory: loadFoodHistory,
    calculateDailyTotals: calculateDailyTotals,
    displayDailySummary: displayDailySummary
};