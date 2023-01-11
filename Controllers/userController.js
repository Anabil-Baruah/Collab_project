const bcrypt = require('bcrypt');
const _ = require('lodash');
const axios = require('axios');
const otpGen = require('otp-generator');
const fast2sms = require('fast-two-sms');
require('dotenv').config()
const { Vonage } = require('@vonage/server-sdk')

const vonage = new Vonage({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET
})

const { User } = require('../Models/userModels')
const { Otp } = require('../Models/otp')

module.exports.signUp = async (req, res) => {
    const user = await User.findOne({
        number: req.body.number
    });
    if (user)
        return res.status(400).send("user already exist");

    const OTP = otpGen.generate(6, {
        digits: true, alphabets: false, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
    });
    //--sending message ot user --//
    const from = "Vonage APIs"
    const to = `91${req.body.number}`
    const text = `Your one time password is : ${OTP} `
    async function sendSMS() {
        await vonage.sms.send({ to, from, text })
            .then(resp => { console.log('Message sent successfully'); console.log(resp); })
            .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
    }

    sendSMS();
    //-- --//
    console.log(OTP);
    const otp = new Otp({ number: req.body.number, otp: OTP })
    const salt = await bcrypt.genSalt(10);
    otp.otp = await bcrypt.hash(otp.otp, salt);
    const result = await otp.save();
    return res.status(200).send("otp send succesfully")
}
module.exports.verifyOtp = async (req, res) => {
    const otpHolder = await Otp.find({
        number: req.body.number
    });

    if (otpHolder.length === 0)
        return res.status(400).send("Your otp expired");
    const rightOtpFind = otpHolder[otpHolder.length - 1];
    const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp);

    if (rightOtpFind.number === req.body.number && validUser) {
        const user = new User(_.pick(req.body, ["number"]));
        const token = user.generateJWT();
        const result = await user.save();
        await Otp.deleteMany({
            number: rightOtpFind.number
        })
        return res.status(200).send({
            message: "user reg succesful",
            token,
            data: result
        })
    } else {
        return res.status(400).send("Otp was wrong");
    }
}

module.exports.resendOtp = async (req, res) => {
    try {
        const otpHolder = await Otp.find({
            number: req.body.number
        })

        const OTP = otpGen.generate(4, {
            digits: true, alphabets: false, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
        });
        console.log(OTP);
        //--sending message ot user --//
        const from = "Vonage APIs"
        const to = `91${req.body.number}`
        const text = `Your one time password is : ${OTP} `
        async function sendSMS() {
            await vonage.sms.send({ to, from, text })
                .then(resp => { console.log('Message sent successfully'); console.log(resp); })
                .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
        }

        sendSMS();
        //-- --//
        const otp = new Otp({ number: req.body.number, otp: OTP })
        const salt = await bcrypt.genSalt(10);
        otp.otp = await bcrypt.hash(otp.otp, salt);
        await Otp.updateOne({ number: req.body.number }, {
            $set: {
                otp: otp.otp
            }
        })
        const result = await otp.save();
        return res.status(200).send("otp send succesfully")

    } catch (error) {

    }
}