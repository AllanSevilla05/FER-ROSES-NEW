// Show notification
function showNotification(message, isToast = true) {
    const notification = document.createElement('div');
    notification.className = isToast ? 'toast-notification' : 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Trigger reflow
    notification.offsetHeight;

    // Show notification
    notification.classList.add('show');

    // Hide after 2 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Toggle wishlist
function toggleWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const index = wishlist.indexOf(productId);

    if (index === -1) {
        wishlist.push(productId);
        showNotification('Added to wishlist', true);
    } else {
        wishlist.splice(index, 1);
        showNotification('Removed from wishlist', true);
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistButtons();
}

// Update all wishlist buttons
function updateWishlistButtons() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    document.querySelectorAll('.add-to-wishlist').forEach(button => {
        const productId = button.dataset.productId;
        const icon = button.querySelector('i');
        
        if (wishlist.includes(productId)) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    });
}

// Initialize shop functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Shop page loaded');

    // Initialize cart manager if not already initialized
    if (!window.cartManager) {
        console.log('Creating cart manager');
        window.cartManager = new CartManager();
    }

    // Add click handlers for cart buttons
    document.querySelectorAll('.cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const productData = {
                id: button.dataset.id,
                name: button.dataset.name,
                price: parseFloat(button.dataset.price),
                image: button.dataset.image
            };

            console.log('Adding to cart:', productData);

            // Validate product data
            if (!productData.id || !productData.name || isNaN(productData.price) || !productData.image) {
                console.error('Invalid product data:', productData);
                showNotification('Error: Invalid product data');
                return;
            }

            // Add to cart
            window.cartManager.addItem(productData);
            showNotification('Added to cart successfully');
        });
    });

    // Add click handlers to wishlist buttons
    document.querySelectorAll('.add-to-wishlist').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = button.dataset.productId;
            toggleWishlist(productId);
        });
    });

    // Initialize wishlist
    updateWishlistButtons();
});

// Function to filter products
function filterProducts(category) {
    const products = document.querySelectorAll('.pro');
    products.forEach(product => {
        if (category === 'all' || product.dataset.category === category) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}
