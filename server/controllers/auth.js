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
    const { name, email, password } = req.body;
    User.findOne({ email }).exec((err, user) => {
        //check if user exists
        if (user) {
            return res.status(400).json({
                error: "User with that email already exists.",
            });
        }
        //generate token
        const token = jwt.sign(
            {
                name,
                email,
                password,
            },
            process.env.JWT_ACCOUNT_ACTIVATION,
            {
                expiresIn: "5m",
            }
        );
        //email data sending
        const emailData = sendActivationEmailData(email, token);
        //send mail
        sgMail
            .send(emailData)
            .then((sent) => {
                return res.json({
                    message: `Email has been sent to ${email}`,
                });
            })
            .catch((err) => {
                return res.status(400).json({
                    success: false,
                    errors: errorHandler(err),
                });
            });
    });
};

exports.activation = (req, res) => {
    const { token } = req.body;
    if (token) {
        //verify the token is valid or not or expired
        jwt.verify(
            token,
            process.env.JWT_ACCOUNT_ACTIVATION,
            (err, decoded) => {
                if (err) {
                    return res.status(401).json({
                        error: "Expired Token. Signup again.",
                    });
                } else {
                    //if valid save to database
                    //get name email password from token
                    const { name, email, password } = jwt.decode(token);
                    const user = new User({
                        name,
                        email,
                        password,
                    });
                    user.save((err, user) => {
                        if (err) {
                            return res.status(401).json({
                                error: errorHandler(err),
                            });
                        } else {
                            return res.status(200).json({
                                success: true,
                                message: "Signup Success",
                            });
                        }
                    });
                }
            }
        );
    } else {
        return res.status(401).json({
            error: "Something went wrong. Please try again.",
        });
    }
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
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d", //token valid for 7days and you can set remember me in front and set it for 30days
        });
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

const client = new OAuth2Client(process.env.GOOGLE_CLIENT);
// Google Login
exports.googleController = (req, res) => {
    const { idToken } = req.body;

    client
        .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT })
        .then((response) => {
            // console.log('GOOGLE LOGIN RESPONSE',response)
            const { email_verified, name, email } = response.payload;
            if (email_verified) {
                User.findOne({ email }).exec((err, user) => {
                    if (user) {
                        const token = jwt.sign(
                            { _id: user._id },
                            process.env.JWT_SECRET,
                            {
                                expiresIn: "7d",
                            }
                        );
                        const { _id, email, name, role } = user;
                        return res.json({
                            token,
                            user: { _id, email, name, role },
                        });
                    } else {
                        let password = email + process.env.JWT_SECRET;
                        user = new User({ name, email, password });
                        user.save((err, data) => {
                            if (err) {
                                console.log(
                                    "ERROR GOOGLE LOGIN ON USER SAVE",
                                    err
                                );
                                return res.status(400).json({
                                    error: "User signup failed with google",
                                });
                            }
                            const token = jwt.sign(
                                { _id: data._id },
                                process.env.JWT_SECRET,
                                { expiresIn: "7d" }
                            );
                            const { _id, email, name, role } = data;
                            return res.json({
                                token,
                                user: { _id, email, name, role },
                            });
                        });
                    }
                });
            } else {
                return res.status(400).json({
                    error: "Google login failed. Try again",
                });
            }
        });
};

exports.facebookController = (req, res) => {
    console.log("FACEBOOK LOGIN REQ BODY", req.body);
    const { userID, accessToken } = req.body;

    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

    return (
        fetch(url, {
            method: "GET",
        })
            .then((response) => response.json())
            // .then(response => console.log(response))
            .then((response) => {
                const { email, name } = response;
                User.findOne({ email }).exec((err, user) => {
                    if (user) {
                        const token = jwt.sign(
                            { _id: user._id },
                            process.env.JWT_SECRET,
                            {
                                expiresIn: "7d",
                            }
                        );
                        const { _id, email, name, role } = user;
                        return res.json({
                            token,
                            user: { _id, email, name, role },
                        });
                    } else {
                        let password = email + process.env.JWT_SECRET;
                        user = new User({ name, email, password });
                        user.save((err, data) => {
                            if (err) {
                                console.log(
                                    "ERROR FACEBOOK LOGIN ON USER SAVE",
                                    err
                                );
                                return res.status(400).json({
                                    error: "User signup failed with facebook",
                                });
                            }
                            const token = jwt.sign(
                                { _id: data._id },
                                process.env.JWT_SECRET,
                                { expiresIn: "7d" }
                            );
                            const { _id, email, name, role } = data;
                            return res.json({
                                token,
                                user: { _id, email, name, role },
                            });
                        });
                    }
                });
            })
            .catch((error) => {
                res.json({
                    error: "Facebook login failed. Try later",
                });
            })
    );
};

exports.forgotPasswordController = (req, res) => {
    const { email } = req.body;
    User.findOne(
        {
            email,
        },
        (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: "User with that email does not exist",
                });
            }

            const token = jwt.sign(
                {
                    _id: user._id,
                },
                process.env.JWT_RESET_PASSWORD,
                {
                    expiresIn: "10m",
                }
            );

            const emailData = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: `Password Reset link`,
                html: `
                      <h1>Please use the following link to reset your password</h1>
                      <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                      <hr />
                      <p>This email may contain sensetive information</p>
                      <p>${process.env.CLIENT_URL}</p>
                  `,
            };

            return user.updateOne(
                {
                    resetPasswordLink: token,
                },
                (err, success) => {
                    if (err) {
                        console.log("RESET PASSWORD LINK ERROR", err);
                        return res.status(400).json({
                            error:
                                "Database connection error on user password forgot request",
                        });
                    } else {
                        sgMail
                            .send(emailData)
                            .then((sent) => {
                                // console.log('SIGNUP EMAIL SENT', sent)
                                return res.json({
                                    message: `Email has been sent to ${email}. Follow the instruction to activate your account`,
                                });
                            })
                            .catch((err) => {
                                // console.log('SIGNUP EMAIL SENT ERROR', err)
                                return res.json({
                                    message: err.message,
                                });
                            });
                    }
                }
            );
        }
    );
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
