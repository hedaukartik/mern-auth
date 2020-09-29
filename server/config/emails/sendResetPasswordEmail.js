const sendResetPasswordEmail = (userEmail, token) => {
	const emailData = {
		from: process.env.EMAIL_FROM,
		to: userEmail,
		subject: `Password Reset link`,
		html: `
              <h1>Please use the following link to reset your password</h1>
              <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
              <hr />
              <p>This email may contain sensetive information</p>
              <p>${process.env.CLIENT_URL}</p>
          `,
	};
	return emailData;
};

module.exports = sendResetPasswordEmail;
