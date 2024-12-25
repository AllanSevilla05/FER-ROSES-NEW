class SquareCheckout {
    constructor() {
        // These will be set by the server
        this.appId = null;
        this.locationId = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            const response = await fetch('/api/square-config');
            const { appId, locationId } = await response.json();
            this.appId = appId;
            this.locationId = locationId;
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize Square:', error);
            throw new Error('Failed to initialize Square checkout');
        }
    }

    async initiateCheckout(cartItems) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            if (!cartItems || Object.keys(cartItems).length === 0) {
                throw new Error('Cart is empty');
            }

            // Create line items for Square
            const lineItems = Object.values(cartItems).map(item => ({
                name: item.name,
                quantity: item.quantity.toString(),
                base_price_money: {
                    amount: parseInt(parseFloat(item.price) * 100), // Convert to cents
                    currency: 'USD'
                }
            }));

            // Create order request
            const orderRequest = {
                idempotency_key: this.generateIdempotencyKey(),
                cart_items: lineItems
            };

            // Call server endpoint to create checkout
            const response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderRequest)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create checkout session');
            }

            const { checkoutUrl } = await response.json();
            
            // Save cart to localStorage for order confirmation
            localStorage.setItem('pending_order', JSON.stringify({
                items: cartItems,
                timestamp: new Date().toISOString()
            }));

            // Redirect to Square Checkout
            window.location.href = checkoutUrl;

        } catch (error) {
            console.error('Checkout error:', error);
            this.handleCheckoutError(error);
        }
    }

    generateIdempotencyKey() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    handleCheckoutError(error) {
        let message = 'There was an error initiating checkout. Please try again.';
        
        if (error.message === 'Cart is empty') {
            message = 'Please add items to your cart before checking out.';
        } else if (error.message.includes('Square')) {
            message = 'Payment service is temporarily unavailable. Please try again later.';
        }

        // Show error in a modal
        this.showErrorModal(message);
    }

    showErrorModal(message) {
        const modal = document.createElement('div');
        modal.className = 'error-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Checkout Error</h2>
                <p>${message}</p>
                <button class="normal">OK</button>
            </div>
        `;

        // Add modal to page
        document.body.appendChild(modal);

        // Close modal functionality
        const closeBtn = modal.querySelector('.close');
        const okBtn = modal.querySelector('button');
        const closeModal = () => modal.remove();

        closeBtn.onclick = closeModal;
        okBtn.onclick = closeModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }

    async initializeSquare() {
        try {
            const response = await fetch('/api/square-config');
            const { appId, locationId } = await response.json();

            const payments = Square.payments(appId, locationId);
            const card = await payments.card();
            await card.attach('#square-payment-container');

            const checkoutButton = document.getElementById('checkout-button');
            
            if (checkoutButton) {
                checkoutButton.addEventListener('click', async () => {
                    try {
                        checkoutButton.disabled = true;
                        checkoutButton.innerHTML = `
                            <div class="spinner"></div>
                            Processing...
                        `;

                        const result = await card.tokenize();
                        if (result.status === 'OK') {
                            // Create line items from cart
                            const lineItems = cart.items.map(item => ({
                                name: item.name,
                                quantity: item.quantity.toString(),
                                amount: Math.round(item.price * 100), // Convert to cents
                                currency: 'USD'
                            }));

                            // Create order
                            const response = await fetch('/create-payment', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    sourceId: result.token,
                                    lineItems,
                                    amount: cart.calculateTotal() * 100, // Convert to cents
                                    currency: 'USD'
                                })
                            });

                            if (!response.ok) {
                                throw new Error('Payment failed');
                            }

                            const { orderId } = await response.json();
                            
                            // Clear cart
                            cart.clearCart();
                            
                            // Redirect to success page
                            window.location.href = `/order-confirmation.html?orderId=${orderId}`;
                        }
                    } catch (error) {
                        console.error('Payment Error:', error);
                        checkoutButton.disabled = false;
                        checkoutButton.innerHTML = `
                            <img src="img/square-logo.png" alt="Square" class="square-logo">
                            Proceed to Checkout
                        `;
                        alert('Payment failed. Please try again.');
                    }
                });
            }
        } catch (error) {
            console.error('Square Initialization Error:', error);
        }
    }
}

// Initialize Square when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const squareCheckout = new SquareCheckout();
    await squareCheckout.initializeSquare();
});
