const express = require('express');
//const Run = require('run-sdk');
const SupplyChain = require('./supplychain');
//using Express methods
const app = express();
app.use(express.json({ extended: true }));
require("dotenv").config();
app.use(function (req, res, next) {
    //  SAMPLE res.header("Access-Control-Allow-Origin", "http://192.168.1.100:8025"); // update to match the domain you will make the request from
    res.header("Access-Control-Expose-Headers", "cooljwt");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
  });

// const run = new Run({
//     network: "test",
//     owner: process.env.OWNER,
//     purse: process.env.PURSE,
// })
const newSupply = new SupplyChain();
module.exports = newSupply;
console.log("SupplyChain smartContract Initialized!");

//Default Route
app.get("/", (req, res) => {
    return res.json({
        BSV_Blockchain: "You are NOT AUTHORIZED! Please leave imidiately.",
    });
});
app.use("/api/order", require('./routes/order'));
app.use("/api/analysis", require('./routes/analysis'));
app.use("/api/process", require('./routes/process'));
app.use("/api/cutting", require('./routes/cuttingProcess'));
app.use("/api/stitching", require('./routes/stitching'));
app.use("/api/quality", require('./routes/quality'));
app.use("/api/packing", require('./routes/packing'));
app.use("/api/rfid", require('./routes/verify'));
app.use("/api/supply", require('./routes/supplyFlow'));
app.listen(
    process.env.PORT,
    console.log(`Run at http//localhost:${process.env.PORT}`)
)