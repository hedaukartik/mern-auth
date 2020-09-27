const express = require("express");
const morgan = require("morgan"); //for development purpose to get the routes requested in console
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/connectDB");

//import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

//app
const app = express();

// Connect Database
connectDB();

//middlewares
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

//routes middleware
app.use("/api", authRoutes);
app.use("/api", userRoutes);

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
