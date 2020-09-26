const User = require("../models/user");
const jwt = require("jsonwebtoken"); //to generate signed token
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");
const expressJwt = require("express-jwt"); //for authorization cehck
const { errorHandler } = require("../helpers/dbErrorHandler");
const sendActivationEmailData = require("../config/sendActivationEmail");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.MAIL_API_KEY);

exports.signup = (req, res) => {
    const { email } = req.body;
    User.findOne({ email }).exec((err, user) => {
        //check if user exists
        if (err || !user) {
            return res.status(400).json({
                error: "User with that email does not exist. Please signup",
            });
        }
        //generate token
        const token = jwt.sign(
            { _id: user._id },
            process.env.JWT_ACCOUNT_ACTIVATION,
            {
                expiresIn: "15m",
            }
        );
        //email data sending
        const emailData = sendActivationEmailData(user, token);
        //send mail
        sgMail
            .send(emailData)
            .then((sent) => {
                return res.json({
                    message: `Email has been sent to ${user.email}`,
                });
            })
            .catch((err) => {
                return res.status(400).json({
                    err,
                });
            });
    });
};

exports.signin = (req, res) => {
    //find the user based on email

    const { email, password } = req.body;
    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User with that email does not exist. Please signup",
            });
        }

        //if user is found make sure the email and password match
        //create authenticate mehtod in user model
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: "Email and password dont match",
            });
        }
        //generate a signed token with user id and secret
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        //persist the token as 't' in cookie with expiry date
        res.cookie("t", token, { expire: new Date() + 9999 }); //secs
        //return response with user and token to  frontend client

        const { _id, name, email, role } = user;
        return res.json({
            token,
            user: { _id, email, name, role },
        });
    });
};

exports.signout = (req, res) => {
    res.clearCookie("t");

    res.json({
        message: "Signout success",
    });
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!user) {
        return res.status(403).json({
            error: "Access denied",
        });
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: "Admin resource! Access denied",
        });
    }
    next();
};
