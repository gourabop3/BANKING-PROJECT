const mongoose= require("mongoose")

const schema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    api_hash:{
        type:String,
        required:true
    },
    api_secret:{
        type:String,
        required:true
    },
    payment_gateway_key:{
        type:String,
        required:false
    },
    merchant_id:{
        type:String,
        required:false
    },
    // Enhanced Professional Features
    environment: {
        type: String,
        enum: ['test', 'live'],
        default: 'test'
    },
    permissions: {
        payment_processing: { type: Boolean, default: true },
        refund_processing: { type: Boolean, default: true },
        webhook_access: { type: Boolean, default: true },
        analytics_access: { type: Boolean, default: true }
    },
    rate_limits: {
        requests_per_minute: { type: Number, default: 1000 },
        requests_per_day: { type: Number, default: 10000 },
        requests_per_month: { type: Number, default: 300000 }
    },
    usage_analytics: {
        total_requests: { type: Number, default: 0 },
        successful_requests: { type: Number, default: 0 },
        failed_requests: { type: Number, default: 0 },
        last_used: { type: Date, default: null },
        daily_usage: [{
            date: { type: Date, default: Date.now },
            requests: { type: Number, default: 0 },
            successful: { type: Number, default: 0 },
            failed: { type: Number, default: 0 }
        }]
    },
    webhook_config: {
        url: { type: String, default: null },
        secret: { type: String, default: null },
        events: {
            payment_success: { type: Boolean, default: true },
            payment_failed: { type: Boolean, default: true },
            refund_processed: { type: Boolean, default: true }
        },
        is_active: { type: Boolean, default: false }
    },
    security_settings: {
        ip_whitelist: [String],
        allowed_domains: [String],
        require_https: { type: Boolean, default: true }
    },
    isOnWorking:{
        type:Boolean,
        default:true
    },
    number_of_regenerate:{
        type:Number,
        default:0   
    },
    expires_at: {
        type: Date,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from creation
    }
},{
    timestamps:true
})

// Add indexes for better performance
schema.index({ user: 1, isOnWorking: 1 })
schema.index({ api_hash: 1 })
schema.index({ merchant_id: 1 })
schema.index({ environment: 1 })

const model = mongoose.model('api-keys',schema)

exports.APIKEYModel = model