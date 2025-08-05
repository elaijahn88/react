// Node.js Express example
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/api/pay', async (req, res) => {
  const { cardNumber, expiry, cvv } = req.body;

  try {
    const response = await axios.post('https://mtf.gateway.mastercard.com/api/rest/version/57/merchant/YOUR_MERCHANT_ID/session', {
      // sample request payload
      apiOperation: "PAY",
      sourceOfFunds: {
        provided: {
          card: {
            number: cardNumber,
            expiry: {
              month: expiry.split('/')[0],
              year: '20' + expiry.split('/')[1]
            },
            securityCode: cvv
          }
        }
      },
      transaction: {
        amount: "10.00",
        currency: "USD"
      }
    }, {
      auth: {
        username: 'merchant.YOUR_MERCHANT_ID',
        password: 'YOUR_API_PASSWORD'
      }
    });

    res.json({ success: true, data: response.data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
