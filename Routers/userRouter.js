const router = require('express').Router();
const { signUp, verifyOtp, resendOtp } = require('../Controllers/userController');

router.route('/signup')
    .post(signUp);
router.route('/signup/verify')
    .post(verifyOtp);
router.route('/signup/resendOtp')
    .post(resendOtp);

module.exports = router