const { UserModel } = require("../models/User.model")
const ApiError = require("../utils/ApiError")
const {default:random} = require("random-int")
const jwt = require("jsonwebtoken")
const NodeMailerService = require("../utils/NodeMail")
const { APIKEYModel } = require("../models/api_key.model")
const crypto = require("crypto")

const api_key_Jwt_secret = process.env.EMAIL_VERIFIED_HASH_API || "!@&*@#$%^&*#$%^&*"

class APIKEYService{

    static GenerateAPIKeys = async(user)=>{
        try {
            const userd = await UserModel.findById(user)
            if(!userd){
                throw new ApiError(404,"User Not Found")
            }

            // Check for existing active API key and deactivate it
            const existAPIDoc = await APIKEYModel.findOne({user: user, isOnWorking: true})
            if(existAPIDoc){
                await APIKEYModel.findByIdAndUpdate(existAPIDoc._id, {
                    isOnWorking: false
                })
            }

            // Generate new API credentials for payment gateway
            const apiSecret = crypto.randomBytes(32).toString('hex') // 64 character secret
            const apiHash = crypto.createHmac('sha256', apiSecret)
                .update(`${userd._id}-${userd.email}-${Date.now()}`)
                .digest('hex');

            // Generate payment gateway compatible keys
            const paymentGatewayKey = `pg_${crypto.randomBytes(16).toString('hex')}`
            const merchantId = `merchant_${crypto.randomBytes(8).toString('hex')}`
            
            // Generate webhook secret
            const webhookSecret = crypto.randomBytes(24).toString('hex')

            console.log("Generated API credentials for user:", userd._id);
                        
            // Save new API key with enhanced professional features
            const newAPIKey = await APIKEYModel.create({
                api_secret: apiSecret,
                api_hash: apiHash,
                payment_gateway_key: paymentGatewayKey,
                merchant_id: merchantId,
                environment: 'test', // Start with test environment
                webhook_config: {
                    secret: webhookSecret
                },
                number_of_regenerate: (existAPIDoc?.number_of_regenerate || 0) + 1,
                user: userd._id
            })

            // Update user's API key reference
            await UserModel.findByIdAndUpdate(userd._id, {
                api_key_id: newAPIKey._id
            })

            return {
                msg: "API credentials generated successfully for payment gateway!",
                api_hash: apiHash,
                api_secret: apiSecret,
                payment_gateway_key: paymentGatewayKey,
                merchant_id: merchantId,
                environment: 'test',
                webhook_secret: webhookSecret,
                note: "These credentials are for payment gateway integration. Store them securely."
            }
        } catch (error) {
            console.error("Error generating API keys:", error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, "API key generation failed")
        }
    }



    // Enhanced method to get user's active API keys with professional features
    static GetUserAPIKeys = async(user) => {
        try {
            const userd = await UserModel.findById(user)
            if(!userd){
                throw new ApiError(404,"User Not Found")
            }

            const apiKey = await APIKEYModel.findOne({user: user, isOnWorking: true})
            
            if (!apiKey) {
                return {
                    msg: "No active API keys found",
                    hasAPIKey: false
                }
            }

            // Calculate today's usage
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const todayUsage = apiKey.usage_analytics.daily_usage.find(
                usage => usage.date.toDateString() === today.toDateString()
            )

            return {
                msg: "API keys retrieved successfully",
                hasAPIKey: true,
                api_hash: apiKey.api_hash,
                api_secret: apiKey.api_secret,
                payment_gateway_key: apiKey.payment_gateway_key,
                merchant_id: apiKey.merchant_id,
                environment: apiKey.environment,
                permissions: apiKey.permissions,
                rate_limits: apiKey.rate_limits,
                usage_analytics: {
                    total_requests: apiKey.usage_analytics.total_requests,
                    successful_requests: apiKey.usage_analytics.successful_requests,
                    failed_requests: apiKey.usage_analytics.failed_requests,
                    success_rate: apiKey.usage_analytics.total_requests > 0 
                        ? ((apiKey.usage_analytics.successful_requests / apiKey.usage_analytics.total_requests) * 100).toFixed(1)
                        : '100.0',
                    today_requests: todayUsage ? todayUsage.requests : 0,
                    last_used: apiKey.usage_analytics.last_used
                },
                webhook_config: {
                    url: apiKey.webhook_config.url,
                    events: apiKey.webhook_config.events,
                    is_active: apiKey.webhook_config.is_active
                },
                security_settings: apiKey.security_settings,
                created_at: apiKey.createdAt,
                expires_at: apiKey.expires_at,
                regenerated_count: apiKey.number_of_regenerate
            }
        } catch (error) {
            console.error("Error retrieving API keys:", error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, "Failed to retrieve API keys")
        }
    }

    // New method to update webhook configuration
    static UpdateWebhookConfig = async(user, webhookData) => {
        try {
            const apiKey = await APIKEYModel.findOne({user: user, isOnWorking: true})
            if (!apiKey) {
                throw new ApiError(404, "No active API keys found")
            }

            const updatedApiKey = await APIKEYModel.findByIdAndUpdate(
                apiKey._id,
                {
                    'webhook_config.url': webhookData.url,
                    'webhook_config.events': webhookData.events || apiKey.webhook_config.events,
                    'webhook_config.is_active': webhookData.url ? true : false
                },
                { new: true }
            )

            return {
                msg: "Webhook configuration updated successfully",
                webhook_config: updatedApiKey.webhook_config
            }
        } catch (error) {
            console.error("Error updating webhook config:", error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, "Failed to update webhook configuration")
        }
    }

    // New method to switch environment (test/live)
    static SwitchEnvironment = async(user, environment) => {
        try {
            if (!['test', 'live'].includes(environment)) {
                throw new ApiError(400, "Invalid environment. Must be 'test' or 'live'")
            }

            const apiKey = await APIKEYModel.findOne({user: user, isOnWorking: true})
            if (!apiKey) {
                throw new ApiError(404, "No active API keys found")
            }

            await APIKEYModel.findByIdAndUpdate(apiKey._id, { environment })

            return {
                msg: `Environment switched to ${environment} successfully`,
                environment: environment
            }
        } catch (error) {
            console.error("Error switching environment:", error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, "Failed to switch environment")
        }
    }

    // New method to update rate limits
    static UpdateRateLimits = async(user, rateLimits) => {
        try {
            const apiKey = await APIKEYModel.findOne({user: user, isOnWorking: true})
            if (!apiKey) {
                throw new ApiError(404, "No active API keys found")
            }

            await APIKEYModel.findByIdAndUpdate(
                apiKey._id,
                { rate_limits: rateLimits }
            )

            return {
                msg: "Rate limits updated successfully",
                rate_limits: rateLimits
            }
        } catch (error) {
            console.error("Error updating rate limits:", error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, "Failed to update rate limits")
        }
    }

    // New method to record API usage
    static RecordAPIUsage = async(apiHash, success = true) => {
        try {
            const apiKey = await APIKEYModel.findOne({api_hash: apiHash, isOnWorking: true})
            if (!apiKey) {
                return // Silently fail if API key not found for usage tracking
            }

            const today = new Date()
            today.setHours(0, 0, 0, 0)

            // Update total usage
            const updateFields = {
                'usage_analytics.total_requests': apiKey.usage_analytics.total_requests + 1,
                'usage_analytics.last_used': new Date()
            }

            if (success) {
                updateFields['usage_analytics.successful_requests'] = apiKey.usage_analytics.successful_requests + 1
            } else {
                updateFields['usage_analytics.failed_requests'] = apiKey.usage_analytics.failed_requests + 1
            }

            // Check if today's usage entry exists
            const todayUsageIndex = apiKey.usage_analytics.daily_usage.findIndex(
                usage => usage.date.toDateString() === today.toDateString()
            )

            if (todayUsageIndex >= 0) {
                // Update existing day's usage
                updateFields[`usage_analytics.daily_usage.${todayUsageIndex}.requests`] = 
                    apiKey.usage_analytics.daily_usage[todayUsageIndex].requests + 1
                
                if (success) {
                    updateFields[`usage_analytics.daily_usage.${todayUsageIndex}.successful`] = 
                        apiKey.usage_analytics.daily_usage[todayUsageIndex].successful + 1
                } else {
                    updateFields[`usage_analytics.daily_usage.${todayUsageIndex}.failed`] = 
                        apiKey.usage_analytics.daily_usage[todayUsageIndex].failed + 1
                }
            } else {
                // Add new day's usage
                const newDayUsage = {
                    date: today,
                    requests: 1,
                    successful: success ? 1 : 0,
                    failed: success ? 0 : 1
                }
                updateFields['$push'] = { 'usage_analytics.daily_usage': newDayUsage }
            }

            await APIKEYModel.findByIdAndUpdate(apiKey._id, updateFields)

        } catch (error) {
            console.error("Error recording API usage:", error);
            // Don't throw error for usage tracking to avoid affecting main API flow
        }
    }

}
module.exports = APIKEYService