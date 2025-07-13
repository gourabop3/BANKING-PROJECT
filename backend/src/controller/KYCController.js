const KYCService = require('../service/KYCService');

class KYCController {
  static async apply(req, res, next) {
    try {
      const obj = await KYCService.applyForKYC(req.user, req.body);
      res.status(201).send(obj);
    } catch (err) {
      next(err);
    }
  }

  static async status(req, res, next) {
    try {
      const obj = await KYCService.getStatus(req.user);
      res.status(200).send(obj);
    } catch (err) {
      next(err);
    }
  }

  // admin endpoints
  static async listPending(req, res, next) {
    try {
      const list = await KYCService.listPending();
      res.status(200).send(list);
    } catch (err) {
      next(err);
    }
  }

  static async approve(req, res, next) {
    try {
      const obj = await KYCService.approve(req.params.id);
      res.status(200).send(obj);
    } catch (err) {
      next(err);
    }
  }

  static async reject(req, res, next) {
    try {
      const obj = await KYCService.reject(req.params.id, req.body.reason);
      res.status(200).send(obj);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = KYCController;