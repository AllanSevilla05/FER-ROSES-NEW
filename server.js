require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client, Environment } = require('square');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

// Middleware
app.use(cors({
    origin: process.env.SITE_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());
app.use(express.static('.'));
app.use(errorHandler);

// Initialize Square client
const squareClient = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production' 
        ? Environment.Production 
        : Environment.Sandbox
});

// Initialize email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Email templates
const emailTemplates = {
    orderConfirmation: (order) => ({
        subject: `Order Confirmation - FER Roses #${order.id}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <img src="${process.env.SITE_URL}/img/logo.png" alt="FER Roses" style="max-width: 200px; margin: 20px 0;">
                <h1 style="color: #333;">Thank you for your order!</h1>
                <p>Dear ${order.customerName},</p>
                <p>We're excited to confirm your order #${order.id}.</p>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h2 style="color: #333; margin-top: 0;">Order Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid #ddd;">
                                <th style="text-align: left; padding: 10px;">Item</th>
                                <th style="text-align: right; padding: 10px;">Quantity</th>
                                <th style="text-align: right; padding: 10px;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr style="border-bottom: 1px solid #ddd;">
                                    <td style="padding: 10px;">${item.name}</td>
                                    <td style="text-align: right; padding: 10px;">${item.quantity}</td>
                                    <td style="text-align: right; padding: 10px;">$${(item.amount / 100).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                            <tr>
                                <td colspan="2" style="text-align: right; padding: 10px;"><strong>Total:</strong></td>
                                <td style="text-align: right; padding: 10px;"><strong>$${(order.total / 100).toFixed(2)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h2 style="color: #333; margin-top: 0;">Shipping Details</h2>
                    <p style="margin: 5px 0;">${order.shippingAddress.name}</p>
                    <p style="margin: 5px 0;">${order.shippingAddress.address1}</p>
                    ${order.shippingAddress.address2 ? `<p style="margin: 5px 0;">${order.shippingAddress.address2}</p>` : ''}
                    <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>
                </div>

                <p>We'll send you another email when your order ships.</p>
                
                <div style="margin: 30px 0; text-align: center;">
                    <a href="${process.env.SITE_URL}/order-tracking.html?id=${order.id}" 
                       style="background: #088178; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                        Track Your Order
                    </a>
                </div>

                <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">
                    <p style="color: #666; font-size: 14px;">
                        If you have any questions, please contact us at 
                        <a href="mailto:support@ferroses.com" style="color: #088178;">support@ferroses.com</a>
                    </p>
                </div>
            </div>
        `
    }),
    
    shippingConfirmation: (order, trackingInfo) => ({
        subject: `Your FER Roses Order #${order.id} Has Shipped!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <img src="${process.env.SITE_URL}/img/logo.png" alt="FER Roses" style="max-width: 200px; margin: 20px 0;">
                <h1 style="color: #333;">Your Order is on its Way!</h1>
                <p>Dear ${order.customerName},</p>
                <p>Great news! Your order #${order.id} has been shipped.</p>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h2 style="color: #333; margin-top: 0;">Tracking Information</h2>
                    <p><strong>Carrier:</strong> ${trackingInfo.carrier}</p>
                    <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
                    <a href="${trackingInfo.trackingUrl}" 
                       style="background: #088178; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
                        Track Package
                    </a>
                </div>

                <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h2 style="color: #333; margin-top: 0;">Estimated Delivery</h2>
                    <p>${trackingInfo.estimatedDelivery}</p>
                </div>

                <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">
                    <p style="color: #666; font-size: 14px;">
                        Need help? Contact us at 
                        <a href="mailto:support@ferroses.com" style="color: #088178;">support@ferroses.com</a>
                    </p>
                </div>
            </div>
        `
    })
};

// Create checkout session
app.post('/create-checkout', async (req, res) => {
    try {
        const { lineItems } = req.body;

        // Validate input
        if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
            return res.status(400).json({
                error: 'Invalid line items'
            });
        }

        // Validate each line item
        for (const item of lineItems) {
            if (!item.name || !item.quantity || !item.amount || !item.currency) {
                return res.status(400).json({
                    error: 'Invalid line item format'
                });
            }
        }

        // Create Square payment link
        const { result } = await squareClient.checkoutApi.createPaymentLink({
            order: {
                locationId: process.env.SQUARE_LOCATION_ID,
                lineItems: lineItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    basePriceMoney: {
                        amount: item.amount,
                        currency: item.currency
                    }
                }))
            },
            idempotencyKey: uuidv4(),
            checkoutOptions: {
                allowTipping: false,
                redirectUrl: `${process.env.SITE_URL}/order-confirmation.html`,
                merchantSupportsEmailReceipts: true,
                askForShippingAddress: true,
                customFields: [
                    {
                        title: 'Special Instructions',
                        type: 'TEXT'
                    }
                ],
                shippingFee: {
                    name: 'Standard Shipping',
                    fee: {
                        amount: 1000, // $10.00
                        currency: 'USD'
                    }
                }
            },
            prePopulatedData: {
                buyerEmail: req.body.email,
                buyerPhoneNumber: req.body.phone
            }
        });

        res.json({
            checkoutUrl: result.paymentLink.url,
            orderId: result.paymentLink.orderId
        });
    } catch (error) {
        console.error('Checkout Error:', error);
        
        // Handle specific Square API errors
        if (error.statusCode === 401) {
            return res.status(401).json({
                error: 'Authentication error with payment provider'
            });
        }
        
        if (error.statusCode === 400) {
            return res.status(400).json({
                error: 'Invalid request to payment provider'
            });
        }

        res.status(500).json({
            error: 'Failed to create checkout session'
        });
    }
});

// Webhook endpoint for Square events
app.post('/webhook/square', async (req, res) => {
    try {
        const event = req.body;

        switch (event.type) {
            case 'payment.successful': {
                const payment = event.data.object;
                const order = await squareClient.ordersApi.retrieveOrder(payment.orderId);
                
                // Send confirmation email
                const emailData = {
                    customerName: order.customer.givenName,
                    id: order.id,
                    items: order.lineItems,
                    total: payment.totalMoney.amount,
                    shippingAddress: order.fulfillments[0].shipmentDetails.recipient
                };
                
                const { subject, html } = emailTemplates.orderConfirmation(emailData);
                
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: order.customer.emailAddress,
                    subject,
                    html
                });
                
                break;
            }
            
            case 'order.shipping_updated': {
                const order = event.data.object;
                const tracking = order.fulfillments[0].shipmentDetails.trackingInfo;
                
                // Send shipping confirmation
                const emailData = {
                    customerName: order.customer.givenName,
                    id: order.id
                };
                
                const trackingInfo = {
                    carrier: tracking.carrier,
                    trackingNumber: tracking.trackingNumber,
                    trackingUrl: tracking.trackingUrl,
                    estimatedDelivery: new Date(tracking.expectedDeliveryDate).toLocaleDateString()
                };
                
                const { subject, html } = emailTemplates.shippingConfirmation(emailData, trackingInfo);
                
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: order.customer.emailAddress,
                    subject,
                    html
                });
                
                break;
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook Error:', error);
        res.sendStatus(500);
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
