const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const orderRouter = require("./routes/orderRoute");
const paymentRouter = require("./routes/paymentRoute");
const productRouter = require("./routes/productRoute");
const userRouter = require("./routes/userRoute");

const cors = require("cors");
const contractRouter = require("./routes/contractRoute");

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/contracts', contractRouter);
app.use('/api/web3', contractRouter);
app.use('/api/order', orderRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/product', productRouter);
app.use('/api/user', userRouter);

// deployment
__dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Server is Running! 🚀");
  });
}

module.exports = app;
