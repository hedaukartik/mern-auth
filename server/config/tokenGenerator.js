const jwt = require("jsonwebtoken");

const tokenGenerator = (user) => {
	const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
	return token;
};

module.exports = tokenGenerator;;
