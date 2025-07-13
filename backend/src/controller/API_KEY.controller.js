const APIKEYService = require("../service/APIKEYService")

class APIKEYController{
    static GenerateAPIKeys = async(req,res)=>{
        const res_obj = await APIKEYService.GenerateAPIKeys(req.user)
        res.status(200).send(res_obj)
    }
    static GetAPIKeys = async(req,res)=>{
        const res_obj = await APIKEYService.GetUserAPIKeys(req.user)
        res.status(200).send(res_obj)
    }

    // New professional API methods
    static UpdateWebhookConfig = async(req,res)=>{
        try {
            const res_obj = await APIKEYService.UpdateWebhookConfig(req.user, req.body)
            res.status(200).send(res_obj)
        } catch (error) {
            res.status(error.statusCode || 500).send({
                msg: error.message || 'Failed to update webhook configuration'
            })
        }
    }

    static SwitchEnvironment = async(req,res)=>{
        try {
            const { environment } = req.body
            const res_obj = await APIKEYService.SwitchEnvironment(req.user, environment)
            res.status(200).send(res_obj)
        } catch (error) {
            res.status(error.statusCode || 500).send({
                msg: error.message || 'Failed to switch environment'
            })
        }
    }

    static UpdateRateLimits = async(req,res)=>{
        try {
            const res_obj = await APIKEYService.UpdateRateLimits(req.user, req.body)
            res.status(200).send(res_obj)
        } catch (error) {
            res.status(error.statusCode || 500).send({
                msg: error.message || 'Failed to update rate limits'
            })
        }
    }

    static RecordAPIUsage = async(req,res)=>{
        try {
            const { api_hash, success } = req.body
            await APIKEYService.RecordAPIUsage(api_hash, success)
            res.status(200).send({ msg: 'Usage recorded successfully' })
        } catch (error) {
            // Don't expose errors for usage tracking
            res.status(200).send({ msg: 'Usage tracking completed' })
        }
    }
}

module.exports = APIKEYController