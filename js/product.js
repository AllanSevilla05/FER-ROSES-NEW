// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// Product data structure
const products = {
    'luxury-arrangements-1': {
        id: 'luxury-arrangements-1',
        name: 'Luxury Arrangements',
        price: 150.00,
        description: 'Elegant and luxurious floral arrangement featuring premium roses and seasonal flowers.',
        images: [
            'Instagram Images/IMG_3328.jpg',
            'Instagram Images/IMG_3326.jpg',
            'Instagram Images/IMG_3327.jpg',
            'Instagram Images/IMG_3330.jpg'
        ],
        details: {
            flowers: ['Premium Roses', 'Hydrangeas', 'Seasonal Accents'],
            colors: ['Pink', 'White', 'Blush'],
            vaseIncluded: true,
            careInstructions: [
                'Keep in cool location away from direct sunlight',
                'Change water every 2-3 days',
                'Trim stems at an angle when changing water',
                'Remove wilted flowers to extend arrangement life'
            ],
            dimensions: '12" x 12" x 15"',
            occasion: ['Weddings', 'Anniversaries', 'Special Events'],
            lifespan: '7-10 days with proper care',
            extras: ['Flower food packet', 'Care instructions card', 'Personalized message card']
        }
    },
    'wedding-collections-1': {
        id: 'wedding-collections-1',
        name: 'Wedding Collections',
        price: 200.00,
        description: 'Beautiful wedding collection featuring elegant white and blush roses.',
        images: [
            'Instagram Images/IMG_3326.jpg',
            'Instagram Images/IMG_3328.jpg',
            'Instagram Images/IMG_3327.jpg',
            'Instagram Images/IMG_3331.jpg'
        ],
        details: {
            flowers: ['Premium White Roses', 'Pink Roses', 'Baby\'s Breath'],
            colors: ['White', 'Blush Pink', 'Light Pink'],
            vaseIncluded: true,
            careInstructions: [
                'Keep in cool location away from direct sunlight',
                'Change water every 2-3 days',
                'Trim stems at an angle when changing water',
                'Remove wilted flowers to extend arrangement life'
            ],
            dimensions: '12" x 12" x 15"',
            occasion: ['Weddings', 'Bridal Showers', 'Engagements'],
            lifespan: '7-10 days with proper care',
            extras: ['Flower food packet', 'Care instructions card', 'Personalized message card']
        }
    },
    'luxury-arrangement-1': {
        id: 'luxury-arrangement-1',
        name: 'Luxury Arrangement',
        price: 250.00,
        description: 'Premium luxury arrangement featuring a stunning mix of roses.',
        images: [
            'Instagram Images/IMG_3327.jpg',
            'Instagram Images/IMG_3328.jpg',
            'Instagram Images/IMG_3326.jpg',
            'Instagram Images/IMG_3330.jpg'
        ],
        details: {
            flowers: ['Premium Roses', 'Peonies', 'Hydrangeas'],
            colors: ['Red', 'Pink', 'White'],
            vaseIncluded: true,
            careInstructions: [
                'Keep in cool location away from direct sunlight',
                'Change water every 2-3 days',
                'Trim stems at an angle when changing water',
                'Remove wilted flowers to extend arrangement life'
            ],
            dimensions: '12" x 12" x 15"',
            occasion: ['Luxury Gifts', 'Special Celebrations'],
            lifespan: '7-10 days with proper care',
            extras: ['Premium vase', 'Flower food packet', 'Care instructions card']
        }
    },
    'premium-rose-box-1': {
        id: 'premium-rose-box-1',
        name: 'Premium Rose Box',
        price: 300.00,
        description: 'Exquisite rose box arrangement featuring premium long-lasting roses.',
        images: [
            'Instagram Images/IMG_3330.jpg',
            'Instagram Images/IMG_3328.jpg',
            'Instagram Images/IMG_3326.jpg',
            'Instagram Images/IMG_3327.jpg'
        ],
        details: {
            flowers: ['Premium Long-Lasting Roses'],
            colors: ['Red', 'Pink', 'White'],
            vaseIncluded: true,
            careInstructions: [
                'No water needed',
                'Keep away from direct sunlight',
                'Avoid excessive humidity',
                'Gently dust with soft brush if needed'
            ],
            dimensions: '12" x 12" x 15"',
            occasion: ['Anniversaries', 'Birthdays', 'Home Decor'],
            lifespan: 'Up to 1 year with proper care',
            extras: ['Luxury gift box', 'Care instructions card']
        }
    }
};

// Load product details
function loadProductDetails() {
    console.log('Loading product:', productId);
    if (!productId) {
        console.error('No product ID provided');
        showNotification('Product not found', true);
        return;
    }

    const product = products[productId];
    if (!product) {
        console.error('Product not found:', productId);
        showNotification('Product not found', true);
        return;
    }

    // Update product name
    document.getElementById('product-name').textContent = product.name;
    
    // Update product description
    document.getElementById('product-description').textContent = product.description;

    // Update main image
    const mainImg = document.getElementById('MainImg');
    if (mainImg && product.images.length > 0) {
        mainImg.src = product.images[0];
        mainImg.alt = product.name;
    }

    // Update small images
    const smallImgs = document.getElementsByClassName('small-img');
    for (let i = 0; i < smallImgs.length && i < product.images.length; i++) {
        smallImgs[i].src = product.images[i];
        smallImgs[i].alt = `${product.name} - View ${i + 1}`;
    }

    // Update product details
    const detailsContainer = document.querySelector('.product-details');
    if (detailsContainer && product.details) {
        detailsContainer.innerHTML = `
            <h3>Product Details</h3>
            <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
            <p><strong>Flowers:</strong> ${product.details.flowers.join(', ')}</p>
            <p><strong>Colors:</strong> ${product.details.colors.join(', ')}</p>
            <p><strong>Dimensions:</strong> ${product.details.dimensions}</p>
            <p><strong>Occasion:</strong> ${product.details.occasion.join(', ')}</p>
            <p><strong>Lifespan:</strong> ${product.details.lifespan}</p>
            <h4>Care Instructions:</h4>
            <ul>
                ${product.details.careInstructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ul>
            <p><strong>Includes:</strong> ${product.details.extras.join(', ')}</p>
        `;
    }
}

// Add to cart function
function addToCart() {
    if (!productId) {
        showNotification('Product not found', true);
        return;
    }

    const product = products[productId];
    if (!product) {
        showNotification('Product not found', true);
        return;
    }

    const quantity = parseInt(document.getElementById('quantity')?.value || 1);
    if (isNaN(quantity) || quantity < 1) {
        showNotification('Please enter a valid quantity', true);
        return;
    }

    try {
        if (window.cartManager) {
            cartManager.addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0],
                quantity: quantity
            });
            showNotification('Added to cart successfully');
        } else {
            console.error('Cart manager not found');
            showNotification('Error: Cart system not initialized', true);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding to cart: ' + error.message, true);
    }
}

// Update quantity
function updateQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return;

    let newQuantity = parseInt(quantityInput.value) + change;
    
    // Ensure quantity is between 1 and 10
    newQuantity = Math.max(1, Math.min(10, newQuantity));
    quantityInput.value = newQuantity;
}

// Show notification
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification${isError ? ' error' : ''}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, productId:', productId);
    loadProductDetails();

    // Initialize quantity input
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('change', (e) => {
            let value = parseInt(e.target.value);
            if (isNaN(value) || value < 1) value = 1;
            if (value > 10) value = 10;
            e.target.value = value;
        });
    }
});
