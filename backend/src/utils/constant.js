// Convert to CommonJS exports so the constants can be loaded via `require()`
const Account_LIMIT = {
    saving: 0,
    current: 10,
};

const CARD_TYPE = {
    basic: {
        max: 10000,
        min: 1,
    },
    classic: {
        max: 50000,
        min: 1,
    },
    platinum: {
        max: 100000,
        min: 1,
    },
};

module.exports = { Account_LIMIT, CARD_TYPE };