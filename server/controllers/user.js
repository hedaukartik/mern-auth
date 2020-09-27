const user = require('../models/user');

exports.userById = (req, res, next, id) => {
    user.findById(id).exec((err, user) => {
        if(err || !user){
            return res.status(400).json({
                 error: "User Not Found"
            });
        }
        req.profile = user;
        next();
    })
}