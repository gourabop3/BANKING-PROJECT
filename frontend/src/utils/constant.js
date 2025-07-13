export const checkout_url ="https://checkout.razorpay.com/v1/checkout.js"

export const razorpayCallBackUrl = txn_id => {
  const base = process.env.NEXT_PUBLIC_BASE_URI?.replace(/\/$/, "") || "";
  // Guarantee the API prefix /api/v1 is present exactly once
  const apiBase = base.endsWith("/api/v1") ? base : `${base}/api/v1`;
  return `${apiBase}/amount/payment/${txn_id}`;
};

export const onlyInputNumber = (e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')

export const txn_type ={
    "fix_deposit":{
        name:"Fix Deposit",
        "color":"text-purple-400 font-medium",
        "bg-color":"bg-purple-100",
        "desc":"a fix amount you add"
    },
    "credit":{
        name:"Credit",

        "color":"text-green-400 font-medium",
        "desc":"How much money you credit",
        "bg-color":"bg-green-200",
    },
    "debit":{
        name:"Debit",

        "color":"text-red-400 font-medium",
        "desc":"How much money you widrawl",
        "bg-color":"bg-red-100",
    },
    "recharge":{
        name:"Recharge",
        "color":"text-blue-400 font-medium",
        "desc":"Mobile recharge and bill payments",
        "bg-color":"bg-blue-100",
    }
}

export const ruppes_symbol =`₹`



export const CARD_TYPE={
    'basic':{
        max:10000,
        min:1,
        message:"You Can only Withdrawal 10,000 RS at a Time"
    },
    'classic':{
        max:50000,
        min:1,
        message:"You Can only Withdrawal 50,000 RS at a Time"

    },
    'platinum':{
        max:100000,
        min:1,
        message:"You Can only Withdrawal 1,00,000 RS at a Time"
        
    }
}