const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || '@@adminjwt';

const AdminAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] || '';
        if (!authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'Admin login required');
        }
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, ADMIN_JWT_SECRET);
        if (!payload.isAdmin) {
            throw new ApiError(403, 'Not an admin');
        }
        req.admin = true;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = AdminAuthMiddleware;