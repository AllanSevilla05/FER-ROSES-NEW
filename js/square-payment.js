// Square Payment Form integration
async function initializeSquarePayment() {
    try {
        const payments = Square.payments('YOUR_APPLICATION_ID', 'YOUR_LOCATION_ID');
        const card = await payments.card();
        await card.attach('#card-container');

        const form = document.getElementById('payment-form');
        
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            try {
                const result = await card.tokenize();
                if (result.status === 'OK') {
                    // Send the payment token to your server to complete the payment
                    await processPayment(result.token);
                }
            } catch (e) {
                console.error(e);
                showPaymentError('Payment failed. Please try again.');
            }
        });
    } catch (e) {
        console.error('Square payment form initialization failed:', e);
        showPaymentError('Failed to load payment form. Please refresh the page.');
    }
}

async function processPayment(token) {
    try {
        // Send payment token to your server
        const response = await fetch('/process-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token,
                amount: cart.getTotal() * 100, // Convert to cents
                currency: 'USD'
            })
        });

        const result = await response.json();
        
        if (result.success) {
            cart.processOrder();
        } else {
            showPaymentError('Payment failed. Please try again.');
        }
    } catch (e) {
        console.error('Payment processing failed:', e);
        showPaymentError('Payment failed. Please try again.');
    }
}

function showPaymentError(message) {
    const errorElement = document.getElementById('payment-errors');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}
