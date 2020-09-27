const express = require("express");
const router = express.Router();

const {
    signup,
    activation,
    signin,
    signout,
    googleController,
    facebookController,
    requireSignin,
} = require("../controllers/auth");

const { userSignupValidator } = require("../validator/index");

router.post("/signup", userSignupValidator, signup);
router.post("/activation", activation);
router.post("/signin", signin);
router.get("/signout", signout);
router.post("/googlelogin", googleController);
router.post("/facebooklogin", facebookController);

router.get("/hello", requireSignin, (req, res) => {
    res.send("Hello There");
});

module.exports = router;
