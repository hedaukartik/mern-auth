const express = require("express");
const router = express.Router();

const {
    signup,
    activation,
    signin,
    signout,
    googleController,
    facebookController,
    forgotPasswordController,
    requireSignin,
} = require("../controllers/auth");

const {
    userSignupValidator,
    userSignInValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
} = require("../validator/index");

router.post("/signup", userSignupValidator, signup);
router.post("/activation", activation);
router.post("/signin", userSignInValidator, signin);
router.get("/signout", signout);
router.post("/googlelogin", googleController);
router.post("/facebooklogin", facebookController);
router.put(
    "/forgotpassword",
    forgotPasswordValidator,
    forgotPasswordController
);

router.get("/hello", requireSignin, (req, res) => {
    res.send("Hello There");
});

module.exports = router;
