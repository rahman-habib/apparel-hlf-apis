const express = require('express');
const Run = require('run-sdk');
const SupplyChain = require('./supplychain');
//using Express methods
const app = express();
app.use(express.json({ extended: true }));
require("dotenv").config();

const run = new Run({
    network: "test",
    owner: process.env.OWNER,
    purse: process.env.PURSE,
})
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
app.listen(
    process.env.PORT,
    console.log(`Run at http//localhost:${process.env.PORT}`)
)