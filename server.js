/**
 * Natureline Healthcare Services - Secure Backend Server Architecture
 */
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

const PORT = process.env.PORT || 5000;
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Admin route (before static middleware)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, 'order.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Secure Endpoint to Initialize Paystack Transaction
app.post('/api/initialize-payment', async (req, res) => {
    const { email } = req.body;
    const fixedAmountNaira = 35000;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Customer email parameters are mandatory.' });
    }

    try {
        const paystackResponse = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: fixedAmountNaira * 100,
                callback_url: 'https://natureline-healthcare.com/verify-payment'
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return res.status(200).json(paystackResponse.data);
    } catch (error) {
        console.error('Paystack Error Log:', error.response ? error.response.data : error.message);
        return res.status(500).json({ success: false, message: 'Internal payment processing engine fault.' });
    }
});

// Start listening safely
app.listen(PORT, () => {
    console.log(`Natureline Medical Secure Engine running optimally on port ${PORT}`);
});