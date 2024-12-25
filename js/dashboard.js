class Dashboard {
    constructor() {
        this.orders = [];
        this.preferences = {
            emailNotifications: true,
            orderUpdates: true
        };
        this.bindEvents();
        this.loadOrders();
    }

    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadPreferences();
            this.setupPreferenceListeners();
        });
    }

    async loadOrders() {
        try {
            const response = await fetch('/api/orders');
            const { orders } = await response.json();
            this.orders = orders;
            this.renderOrders();
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    renderOrders() {
        const ordersContainer = document.getElementById('recent-orders');
        if (!ordersContainer) return;

        if (this.orders.length === 0) {
            ordersContainer.innerHTML = '<p class="no-orders">No recent orders</p>';
            return;
        }

        ordersContainer.innerHTML = this.orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <h3>Order #${order.id}</h3>
                    <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="order-details">
                    <div class="order-status">
                        <span class="status-label">Status:</span>
                        <span class="status-value ${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                    <div class="order-total">
                        <span class="total-label">Total:</span>
                        <span class="total-value">$${order.total}</span>
                    </div>
                </div>
                <div class="order-actions">
                    <button onclick="dashboard.trackOrder('${order.id}')">Track Order</button>
                    <button onclick="dashboard.viewOrderDetails('${order.id}')">View Details</button>
                </div>
            </div>
        `).join('');
    }

    async trackOrder(orderId = null) {
        try {
            const id = orderId || document.getElementById('order-id').value;
            if (!id) {
                alert('Please enter an order ID');
                return;
            }

            const response = await fetch(`/api/order/${id}/track`);
            const { tracking } = await response.json();

            const trackingResult = document.getElementById('tracking-result');
            if (trackingResult) {
                trackingResult.innerHTML = `
                    <div class="tracking-info">
                        <h3>Order #${id}</h3>
                        <div class="tracking-timeline">
                            ${this.renderTrackingSteps(tracking.steps)}
                        </div>
                        <div class="delivery-estimate">
                            <p>Estimated Delivery: ${tracking.estimatedDelivery}</p>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error tracking order:', error);
            alert('Error tracking order. Please try again.');
        }
    }

    renderTrackingSteps(steps) {
        return steps.map(step => `
            <div class="tracking-step ${step.completed ? 'completed' : ''}">
                <div class="step-icon">
                    <i class="fas ${this.getStepIcon(step.type)}"></i>
                </div>
                <div class="step-info">
                    <h4>${step.title}</h4>
                    <p>${step.description}</p>
                    <span class="step-time">${new Date(step.timestamp).toLocaleString()}</span>
                </div>
            </div>
        `).join('');
    }

    getStepIcon(type) {
        const icons = {
            'order_placed': 'fa-shopping-cart',
            'processing': 'fa-cog',
            'in_transit': 'fa-truck',
            'delivered': 'fa-check-circle'
        };
        return icons[type] || 'fa-circle';
    }

    async viewOrderDetails(orderId) {
        try {
            const response = await fetch(`/api/order/${orderId}`);
            const { order } = await response.json();
            
            // Create modal with order details
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Order Details</h2>
                    <div class="order-info">
                        <p><strong>Order ID:</strong> ${order.id}</p>
                        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                        <p><strong>Total:</strong> $${order.total}</p>
                    </div>
                    <div class="order-items">
                        <h3>Items</h3>
                        ${order.items.map(item => `
                            <div class="order-item">
                                <img src="${item.imageUrl}" alt="${item.name}">
                                <div class="item-details">
                                    <h4>${item.name}</h4>
                                    <p>Quantity: ${item.quantity}</p>
                                    <p>Price: $${item.price}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Close modal functionality
            const closeBtn = modal.querySelector('.close');
            closeBtn.onclick = () => modal.remove();
            window.onclick = (event) => {
                if (event.target === modal) modal.remove();
            };
        } catch (error) {
            console.error('Error viewing order details:', error);
            alert('Error loading order details. Please try again.');
        }
    }

    loadPreferences() {
        const savedPreferences = localStorage.getItem('dashboard_preferences');
        if (savedPreferences) {
            this.preferences = JSON.parse(savedPreferences);
            this.updatePreferenceToggles();
        }
    }

    setupPreferenceListeners() {
        const emailToggle = document.getElementById('email-notifications');
        const orderToggle = document.getElementById('order-updates');

        if (emailToggle) {
            emailToggle.addEventListener('change', (e) => {
                this.preferences.emailNotifications = e.target.checked;
                this.savePreferences();
            });
        }

        if (orderToggle) {
            orderToggle.addEventListener('change', (e) => {
                this.preferences.orderUpdates = e.target.checked;
                this.savePreferences();
            });
        }
    }

    updatePreferenceToggles() {
        const emailToggle = document.getElementById('email-notifications');
        const orderToggle = document.getElementById('order-updates');

        if (emailToggle) {
            emailToggle.checked = this.preferences.emailNotifications;
        }

        if (orderToggle) {
            orderToggle.checked = this.preferences.orderUpdates;
        }
    }

    savePreferences() {
        localStorage.setItem('dashboard_preferences', JSON.stringify(this.preferences));
        this.updatePreferences();
    }

    async updatePreferences() {
        try {
            await fetch('/api/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.preferences)
            });
        } catch (error) {
            console.error('Error updating preferences:', error);
        }
    }
}

// Initialize dashboard
const dashboard = new Dashboard();
