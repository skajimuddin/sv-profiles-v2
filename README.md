# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# SV Profiles Application

This application is built with React and Vite, featuring a complete e-commerce system with Razorpay payment integration.

## Features
- Product browsing and filtering
- Shopping cart functionality
- User authentication
- Admin product management
- Razorpay payment integration

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_RAZORPAY_KEY_SECRET=your_razorpay_secret_key
VITE_CURRENCY=INR
VITE_APP_NAME=SV Profiles
VITE_RAZORPAY_THEME_COLOR=#D4AF37
```

> **Important:** Never expose your Razorpay secret key on the client side. The secret key should only be used in secure server-side code for verifying payment signatures.

## Razorpay Integration

The application uses the Razorpay payment gateway for processing payments. Key integration points are:

1. **Loading the SDK**: The SDK is dynamically loaded only when needed via `razorpayLoader.js`
2. **Payment Flow**:
   - The user adds products to cart
   - The checkout page collects user details and prepares the order
   - Order summary page handles the payment via Razorpay
   - Upon successful payment, the order is created in the database
   
3. **Testing**: Use Razorpay test credentials for development
   - Card number: 4111 1111 1111 1111
   - Expiry: Any future date
   - CVV: Any 3-digit number
   - Name: Any name

## Server-side Verification

For production use, implement server-side verification of payment signatures using the Razorpay secret key. This ensures the payment data has not been tampered with:

```javascript
// Server-side code (Node.js example)
const crypto = require('crypto');

const verifyPayment = (orderId, paymentId, signature) => {
  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(orderId + '|' + paymentId)
    .digest('hex');
  
  return generated === signature;
};
```

## Development

To run the application in development mode:

```bash
npm install
npm run dev
```

## Building for Production

```bash
npm run build
```

## Deployment

This application is configured for deployment on Netlify.

The `netlify.toml` file contains the necessary configuration for handling client-side routing and build settings.
