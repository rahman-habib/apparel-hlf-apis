const express = require("express");
const route = express.Router();
const { check, validationResult } = require('express-validator');
const newSupply = require("../app");
//Order Routes
route.post(
    "/create-order", [
    check("orderId", "orderID is required!").not().isEmpty(),
    check("orderDate", "orderDate is required!").not().isEmpty(),
    check("vendorInfo", "vendorInfo is required!").not().isEmpty(),
    check("brandName", "brandName is required!").not().isEmpty(),
    check("styleNo", "styleNo is required!").not().isEmpty(),
    check("materialInfo", "materialInfo is required!").not().isEmpty(),
],
async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return res.status(400).json({errors:errors.array()});
    }
    
    try {
       let order={
        orderId:req.body.orderId,
        orderDate:req.body.orderDate,
        vendorInfo:req.body.vendorInfo,
        brandName:req.body.brandName,
        styleNo:req.body.styleNo,
        materialInfo:req.body.materialInfo,
       };
       newSupply.createOrder(order);
       await newSupply.sync();
       console.log("owner: ",newSupply.owner);
       console.log("location: ",newSupply.location);
       console.log("origin: ",newSupply.origin);
       let txnId=newSupply.location.slice(0,-3);
       console.log("txnId: ",txnId)
       let obj={
        orderId:req.body.orderId,
        orderDate:req.body.orderDate,
        vendorInfo:req.body.vendorInfo,
        brandName:req.body.brandName,
        styleNo:req.body.styleNo,
        materialInfo:req.body.materialInfo,
        txnId:txnId,
       };
       newSupply.appendTxIdOrder(obj);
       return res.status(200).json({
        msg: "order saved in blockchain",
        txnid:txnId,
       });
    } catch (error) {
        console.log(error);
        return res.status(500).json({Error:error});
    }
   

}
);
route.get('/get-order/:id',async(req,res)=>{
    if(req.params.id==null||req.params.id.trim().length<=0){
        return res.status(400).json({error: "Order Id is required"});
    }
    try {
        await newSupply.sync();
        const data=newSupply.getOrder(req.params.id);
        console.log(data)
        return res.status(200).json({OrderState:data});
    } catch (error) {
        console.log(error)
        return res.status(500).json({Error:error});
    }
})
route.get('/get-order-history/:id',async(req,res)=>{
    if(req.params.id==null||req.params.id.trim().length<=0){
        return res.status(400).json({error: "Order Id is required"});
    }
    try {
        await newSupply.sync();
        const data=newSupply.getOrderHistory(req.params.id);
        console.log(data)
        return res.status(200).json({OrderState:data});
    } catch (error) {
        console.log(error)
        return res.status(500).json({Error:error});
    }
})
module.exports=route;