const sendActivationEmail = (user, token) => {
    const emailData = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Account activation link",
        html: `
            <h1>Please Click on link to activate</h1>
            <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
            </hr>
            <p>This email contains sensitive information</p>
            <p>${process.env.CLIENT_URL}</p>
        `,
    };
    return emailData;
};

module.exports = sendActivationEmail;
