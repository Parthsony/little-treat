// Product data
const products = {
    vadapav: { name: 'Mumbai Style Vadapav', price: 30, emoji: '🍔' },
    dabeli: { name: 'Kutchi Dabeli', price: 35, emoji: '🌮' },
    sandwich: { name: 'Grilled Sandwich', price: 40, emoji: '🥪' },
    pavbhaji: { name: 'Pav Bhaji', price: 50, emoji: '🍛' },
    sabudanavada: { name: 'Farali Sabudana Vada', price: 45, emoji: '🥙' }
};

// Cart state
let cart = {
    vadapav: 0,
    dabeli: 0,
    sandwich: 0,
    pavbhaji: 0,
    sabudanavada: 0
};

let currentStep = 1;

// Generate time options for dropdown
function generateTimeOptions() {
    const timeSelect = document.getElementById('timeSelect');
    const startHour = 19; // 7:30 PM
    const startMinute = 30;
    const endHour = 21; // 9 PM
    
    // Add first slot at 7:30 PM
    const option730 = document.createElement('option');
    option730.value = '19:30';
    option730.textContent = '7:30 PM';
    timeSelect.appendChild(option730);
    
    // Add remaining slots from 8:00 PM to 9:00 PM
    for (let hour = 20; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const time12 = formatTo12Hour(hour, minute);
            
            const option = document.createElement('option');
            option.value = time24;
            option.textContent = time12;
            
            timeSelect.appendChild(option);
        }
    }
}

function formatTo12Hour(hour, minute) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

// Update quantity
function updateQuantity(productId, change) {
    cart[productId] = Math.max(0, cart[productId] + change);
    document.getElementById(`qty-${productId}`).textContent = cart[productId];
    updateTotalPrice();
}

// Calculate total
function calculateTotal() {
    let total = 0;
    for (let productId in cart) {
        total += cart[productId] * products[productId].price;
    }
    return total;
}

// Update total price display
function updateTotalPrice() {
    const total = calculateTotal();
    document.getElementById('totalPrice').textContent = `₹${total}`;
}

// Navigate to step
function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.progress-step').forEach(s => {
        s.classList.remove('active');
        s.classList.remove('completed');
    });

    // Show current step
    document.getElementById(`step${step}`).classList.add('active');
    document.getElementById(`step${step}-indicator`).classList.add('active');

    // Mark completed steps
    for (let i = 1; i < step; i++) {
        document.getElementById(`step${i}-indicator`).classList.add('completed');
    }

    currentStep = step;
}

// Proceed to address
function proceedToAddress() {
    const total = calculateTotal();
    if (total === 0) {
        alert('Please select at least one item to proceed!');
        return;
    }

    goToStep(2);
}

// Validate address form
function validateAddressForm() {
    let isValid = true;
    
    // Check if time is selected
    const timeSelect = document.getElementById('timeSelect');
    if (!timeSelect.value) {
        document.getElementById('timeError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('timeError').style.display = 'none';
    }
    
    // Check address fields
    const flatNumber = document.getElementById('flatNumber').value.trim();
    const apartmentName = document.getElementById('apartmentName').value.trim();
    
    if (!flatNumber || !apartmentName) {
        document.getElementById('addressError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('addressError').style.display = 'none';
    }
    
    return isValid;
}

// Proceed to confirm
function proceedToConfirm() {
    if (!validateAddressForm()) {
        return;
    }

    // Generate final order summary
    const total = calculateTotal();
    let summaryHTML = '';
    for (let productId in cart) {
        if (cart[productId] > 0) {
            const product = products[productId];
            const itemTotal = cart[productId] * product.price;
            summaryHTML += `
                <div class="summary-item">
                    <span>${product.emoji} ${product.name} x ${cart[productId]}</span>
                    <span>₹${itemTotal}</span>
                </div>
            `;
        }
    }
    document.getElementById('finalOrderSummary').innerHTML = `<div class="order-summary">${summaryHTML}</div>`;
    document.getElementById('finalTotalPrice').textContent = `₹${total}`;

    // Display address details
    const flatNumber = document.getElementById('flatNumber').value.trim();
    const apartmentName = document.getElementById('apartmentName').value.trim();
    const timeSelect = document.getElementById('timeSelect');
    const selectedTimeFormatted = timeSelect.options[timeSelect.selectedIndex].text;

    document.getElementById('finalAddress').innerHTML = `📍 ${flatNumber}, ${apartmentName}`;
    document.getElementById('finalTime').innerHTML = `🕐 ${selectedTimeFormatted}`;

    goToStep(3);
}

// Book order - send to WhatsApp
function bookOrder() {
    const flatNumber = document.getElementById('flatNumber').value.trim();
    const apartmentName = document.getElementById('apartmentName').value.trim();
    const timeSelect = document.getElementById('timeSelect');
    const selectedTimeFormatted = timeSelect.options[timeSelect.selectedIndex].text;
    const total = calculateTotal();

    let orderDetails = '';
    for (let productId in cart) {
        if (cart[productId] > 0) {
            const product = products[productId];
            orderDetails += `${product.emoji} ${product.name} x ${cart[productId]}\n`;
        }
    }

    const message = `🍽️ *Little Treat Home Foods - Order*

${orderDetails}
💰 *Total Amount:* ₹${total}

🕐 *Delivery Time:* ${selectedTimeFormatted}
📍 *Address:* ${flatNumber}, ${apartmentName}

Please confirm my order. Thank you! 😊`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/917874914422?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    generateTimeOptions();
    updateTotalPrice();
});
