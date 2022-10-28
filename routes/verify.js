const express = require("express");
const route = express.Router();
const { check, validationResult } = require('express-validator');
const newSupply = require("../app");
//Order Routes
route.post(
    "/create-rfid/:id", [
    check("rfid", "rfid is required!").not().isEmpty(),
    check("brandName", "brandNAme is required!").not().isEmpty(),
    check("product", "product is required!").not().isEmpty(),
    check("madeIn", "madeIn is required!").not().isEmpty(),
    
],
async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return res.status(400).json({errors:errors.array()});
    }
    
    try {
        await newSupply.sync();
        const data=newSupply.getOrder(req.params.id);
        await newSupply.sync();
        const dataanalysis=newSupply.getAnalysisAndDevelopment(req.params.id);
       let order={
        brandName:data.brandName,
        product:data.product,
      
        madeIn:dataanalysis.madeIn,
        rfid:req.body.rfid,
       };
       newSupply.createRfid(order);
       await newSupply.sync();
       console.log("owner: ",newSupply.owner);
       console.log("location: ",newSupply.location);
       console.log("origin: ",newSupply.origin);
       let txnId=newSupply.location.slice(0,-3);
       console.log("txnId: ",txnId)
       let obj={
        orderId:data.orderId,
        email:data.email,
        brandName:data.brandName,
        product:data.product,
        materialRequirement:data.materialRequirement,
        madeIn:dataanalysis.madeIn,
        rfid:req.body.rfid,
        txnId:txnId,
       };
       newSupply.appendTxIdRfid(obj);
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
route.get('/get-rfid/:id',async(req,res)=>{
    if(req.params.id==null||req.params.id.trim().length<=0){
        return res.status(400).json({error: "Order Id is required"});
    }
    try {
        await newSupply.sync();
        const data=newSupply.getRfid(req.params.id);
        console.log(data)
        return res.status(200).json({RFID:data});
    } catch (error) {
        console.log(error)
        return res.status(500).json({Error:error});
    }
})
route.get('/get-rfid-history/:id',async(req,res)=>{
    if(req.params.id==null||req.params.id.trim().length<=0){
        return res.status(400).json({error: "Order Id is required"});
    }
    try {
        await newSupply.sync();
        const data=newSupply.getRfidHistory(req.params.id);
        console.log(data)
        return res.status(200).json({RFID:data});
    } catch (error) {
        console.log(error)
        return res.status(500).json({Error:error});
    }
})
module.exports=route;