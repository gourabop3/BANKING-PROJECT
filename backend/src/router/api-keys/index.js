const express = require("express")
const AuthMiddleware = require("../../middleware/AuthMiddleware")
const APIKEYController = require("../../controller/API_KEY.controller")

const router = express.Router()

// Generate API keys directly without email verification
router.route('/generate')
.post(AuthMiddleware,APIKEYController.GenerateAPIKeys)

router.route('/get-keys')
.get(AuthMiddleware,APIKEYController.GetAPIKeys)

// New professional API endpoints
router.route('/webhook/config')
.put(AuthMiddleware,APIKEYController.UpdateWebhookConfig)

router.route('/environment/switch')
.put(AuthMiddleware,APIKEYController.SwitchEnvironment)

router.route('/rate-limits/update')
.put(AuthMiddleware,APIKEYController.UpdateRateLimits)

router.route('/usage/record')
.post(APIKEYController.RecordAPIUsage) // No auth middleware for usage tracking

module.exports = router