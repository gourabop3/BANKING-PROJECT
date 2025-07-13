// Bank API Configuration
// Replace these with your actual bank's API details

const bankConfig = {
    // Your bank's API base URL
    BANK_API_URL: process.env.BANK_API_URL || 'https://your-bank-api.com/api/v1',
    
    // Your bank API credentials
    BANK_API_KEY: process.env.BANK_API_KEY || 'your-bank-api-key',
    BANK_CLIENT_ID: process.env.BANK_CLIENT_ID || 'your-bank-client-id',
    BANK_CLIENT_SECRET: process.env.BANK_CLIENT_SECRET || 'your-bank-client-secret',
    
    // Bank API endpoints
    endpoints: {
        // Debit money from customer account
        DEBIT: '/payments/debit',
        
        // Credit money to your account  
        CREDIT: '/payments/credit',
        
        // Check transaction status
        STATUS: '/payments/status',
        
        // Process refund
        REFUND: '/payments/refund',
        
        // Account verification
        VERIFY_ACCOUNT: '/accounts/verify'
    },
    
    // Bank-specific settings
    settings: {
        // Currency supported by your bank
        currency: 'INR',
        
        // Timeout for bank API calls (milliseconds)
        timeout: 30000,
        
        // Retry attempts for failed calls
        retryAttempts: 3,
        
        // Your bank's webhook secret for verifying callbacks
        webhookSecret: process.env.BANK_WEBHOOK_SECRET || 'your-bank-webhook-secret'
    }
};

// Examples for different banks/payment processors:

// For ICICI Bank API
const iciciBankConfig = {
    BANK_API_URL: 'https://apigwuat.icicibank.com:8443',
    endpoints: {
        DEBIT: '/iciciapi/api/v1/payments/debit',
        STATUS: '/iciciapi/api/v1/payments/status'
    }
};

// For HDFC Bank API  
const hdfcBankConfig = {
    BANK_API_URL: 'https://api.hdfcbank.com/v1',
    endpoints: {
        DEBIT: '/payments/immediate-payment',
        STATUS: '/payments/transaction-status'
    }
};

// For SBI Bank API
const sbiBankConfig = {
    BANK_API_URL: 'https://api.onlinesbi.com/v1',
    endpoints: {
        DEBIT: '/retail/fund-transfer',
        STATUS: '/retail/transaction-inquiry'
    }
};

// For international payment processors:

// Stripe Configuration
const stripeConfig = {
    BANK_API_URL: 'https://api.stripe.com/v1',
    BANK_API_KEY: process.env.STRIPE_SECRET_KEY,
    endpoints: {
        DEBIT: '/payment_intents',
        STATUS: '/payment_intents',
        REFUND: '/refunds'
    }
};

// Razorpay Configuration  
const razorpayConfig = {
    BANK_API_URL: 'https://api.razorpay.com/v1',
    BANK_API_KEY: process.env.RAZORPAY_KEY_ID,
    BANK_CLIENT_SECRET: process.env.RAZORPAY_KEY_SECRET,
    endpoints: {
        DEBIT: '/payments',
        STATUS: '/payments',
        REFUND: '/payments/{id}/refund'
    }
};

module.exports = {
    bankConfig,
    iciciBankConfig,
    hdfcBankConfig, 
    sbiBankConfig,
    stripeConfig,
    razorpayConfig
};