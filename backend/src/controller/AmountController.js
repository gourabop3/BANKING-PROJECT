const AmountService = require("../service/AmountService")

class AmountController{


    static addMoney = async(req,res)=>{
        const res_obj = await AmountService.addMoney(req.body,req.user)
        res.status(200).send(res_obj)
    }

    // Verify Razorpay payment and update balance.
    // If the request expects JSON (e.g., our Axios immediate-verification call), respond with JSON.
    // Otherwise, keep the existing redirect behaviour so that the normal Razorpay callback flow still works.
    static verifyPayment = async (req, res) => {
        try {
            const res_obj = await AmountService.verifyPayment(req.body, req.params.txn_id);

            // Safety check for undefined URL
            if (!res_obj || !res_obj.url) {
                console.error("No URL returned from AmountService.verifyPayment");
                return res.status(500).json({ 
                    success: false, 
                    error: "Payment processing failed - no redirect URL generated" 
                });
            }

            // Detect XHR / fetch / JSON requests via the Accept header or the X-Requested-With header
            const wantsJson = (req.get("Accept") || "").includes("application/json") || req.xhr;

            if (wantsJson) {
                // Determine if the service signalled an error via the redirect URL
                const hasError = typeof res_obj.url === "string" && res_obj.url.includes("?error=");

                return res.status(hasError ? 400 : 200).json({ success: !hasError, ...res_obj });
            }

            // Fallback to the original behaviour (useful when Razorpay performs a POST redirect in the browser)
            return res.redirect(res_obj.url);
        } catch (error) {
            console.error("Payment verification controller error:", error);
            return res.status(500).json({ success: false, error: error.message || "Payment verification failed" });
        }
    }
    
    static getAllTransactions = async(req,res)=>{
        const res_obj = await AmountService.getAllTransactions(req.user)
        res.status(200).send(res_obj)
    }
    
    static addNewAccount = async(req,res)=>{
        const res_obj = await AmountService.addNewAccount(req.user,req.body)
        res.status(201).send(res_obj)
    }

    // Debug methods for troubleshooting
    static debugTransaction = async(req,res)=>{
        try {
            const res_obj = await AmountService.debugTransaction(req.params.txn_id, req.user)
            res.status(200).send(res_obj)
        } catch (error) {
            res.status(500).send({error: error.message})
        }
    }

    // New method for checking transaction status
    static checkTransactionStatus = async(req,res)=>{
        try {
            const res_obj = await AmountService.checkTransactionStatus(req.params.txn_id, req.user)
            res.status(200).send(res_obj)
        } catch (error) {
            res.status(500).send({error: error.message})
        }
    }

    static debugAccount = async(req,res)=>{
        try {
            const res_obj = await AmountService.debugAccount(req.params.account_id, req.user)
            res.status(200).send(res_obj)
        } catch (error) {
            res.status(500).send({error: error.message})
        }
    }
}

module.exports = AmountController