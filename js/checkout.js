// Initialize Stripe with the correct key
const stripe = Stripe('pk_test_51OPgDhLBvCUVxXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
const elements = stripe.elements();

// Create card Element and mount it
const card = elements.create('card', {
    style: {
        base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    }
});

card.mount('#card-element');

// Handle real-time validation errors
card.addEventListener('change', function(event) {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
        displayError.textContent = event.error.message;
    } else {
        displayError.textContent = '';
    }
});

// Load cart items and calculate totals
function loadCheckoutItems() {
    console.log('Loading checkout items...');
    
    const checkoutItems = document.getElementById('checkout-items');
    const subtotalElement = document.getElementById('checkout-subtotal');
    const shippingElement = document.getElementById('checkout-shipping');
    const taxElement = document.getElementById('checkout-tax');
    const totalElement = document.getElementById('checkout-total');
    const buttonTotalElement = document.getElementById('button-total');

    if (!window.cartManager) {
        console.error('Cart manager not initialized');
        window.location.href = 'cart.html';
        return;
    }

    const cart = window.cartManager.items;
    console.log('Cart items:', cart);
    
    if (!cart || cart.length === 0) {
        console.log('Cart is empty, redirecting to cart page');
        window.location.href = 'cart.html';
        return;
    }
    
    // Calculate subtotal with proper validation
    const subtotal = cart.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        const itemTotal = price * quantity;
        console.log(`Item: ${item.name}, Price: ${price}, Quantity: ${quantity}, Total: ${itemTotal}`);
        return sum + itemTotal;
    }, 0);
    
    console.log('Subtotal:', subtotal);
    
    // Set shipping rate (free shipping over $100)
    const shipping = subtotal > 100 ? 0 : 10;
    console.log('Shipping:', shipping);
    
    // Calculate tax (7% tax rate)
    const tax = subtotal * 0.07;
    console.log('Tax:', tax);
    
    // Calculate total
    const total = subtotal + shipping + tax;
    console.log('Total:', total);

    // Store totals for payment processing
    window.checkoutTotals = {
        subtotal,
        shipping,
        tax,
        total
    };

    // Update summary elements
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    if (buttonTotalElement) buttonTotalElement.textContent = `$${total.toFixed(2)}`;

    // Display cart items with error handling for images
    if (checkoutItems) {
        checkoutItems.innerHTML = cart.map(item => {
            const itemPrice = parseFloat(item.price) || 0;
            const itemQuantity = parseInt(item.quantity) || 0;
            const itemTotal = itemPrice * itemQuantity;
            
            return `
                <div class="checkout-item">
                    <img src="${item.image}" alt="${item.name}" 
                         onerror="this.src='images/placeholder.png'"
                         loading="lazy">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>Quantity: ${itemQuantity}</p>
                        <p>Price: $${itemPrice.toFixed(2)}</p>
                        <p>Subtotal: $${itemTotal.toFixed(2)}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Form validation with improved error messages
function validateForm() {
    const form = document.getElementById('payment-form');
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    const errorMessages = [];
    
    inputs.forEach(input => {
        const label = input.previousElementSibling?.textContent || input.name;
        if (!input.value.trim()) {
            input.classList.add('error');
            errorMessages.push(`${label} is required`);
            isValid = false;
        } else {
            input.classList.remove('error');
            
            // Additional validation
            if (input.type === 'email' && !isValidEmail(input.value)) {
                input.classList.add('error');
                errorMessages.push('Please enter a valid email address');
                isValid = false;
            }
            if (input.id === 'phone' && !isValidPhone(input.value)) {
                input.classList.add('error');
                errorMessages.push('Please enter a valid phone number');
                isValid = false;
            }
            if (input.id === 'zipCode' && !isValidZipCode(input.value)) {
                input.classList.add('error');
                errorMessages.push('Please enter a valid ZIP code');
                isValid = false;
            }
        }
    });
    
    if (!isValid) {
        showErrorMessage(errorMessages.join('<br>'));
    }
    
    return isValid;
}

// Validation helper functions
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^\d{10}$/.test(phone.replace(/\D/g, ''));
}

function isValidZipCode(zipCode) {
    return /^\d{5}(-\d{4})?$/.test(zipCode);
}

function showErrorMessage(message) {
    const errorDiv = document.getElementById('form-errors') || createErrorDiv();
    errorDiv.innerHTML = message;
    errorDiv.style.display = 'block';
    
    // Scroll to error message
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function createErrorDiv() {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'form-errors';
    errorDiv.className = 'error-message';
    const form = document.getElementById('payment-form');
    form.insertBefore(errorDiv, form.firstChild);
    return errorDiv;
}

// Phone number formatting
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    input.value = value;
}

// Handle form submission
const form = document.getElementById('payment-form');
form.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    try {
        // Get form data
        const formData = new FormData(form);
        const orderData = {
            customer: {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone')
            },
            shipping: {
                street: formData.get('street'),
                apartment: formData.get('apartment'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode')
            },
            instructions: formData.get('instructions'),
            items: window.cartManager.items,
            totals: window.checkoutTotals
        };

        // Here you would typically send the order to your server
        console.log('Order data:', orderData);

        // Clear cart after successful order
        window.cartManager.clearCart();

        // Show success message and redirect
        alert('Order placed successfully! We will contact you shortly to confirm your order.');
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Error processing order:', error);
        showErrorMessage('There was an error processing your order. Please try again.');
        
        submitButton.disabled = false;
        submitButton.innerHTML = 'Place Order <span class="total-amount" id="button-total">$' + 
            window.checkoutTotals.total.toFixed(2) + '</span>';
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Checkout page loaded');
    
    // Wait a bit for cart manager to initialize
    setTimeout(() => {
        loadCheckoutItems();
    }, 100);
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', () => {
        console.log('Cart updated, reloading checkout items');
        loadCheckoutItems();
    });
});
