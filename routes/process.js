const express = require("express");
const route = express.Router();
const { check, validationResult } = require('express-validator');
const newSupply = require("../app");
//Order Routes
route.post(
    "/create-process/:id", [
    check("processedBy", "processedBy is required!").not().isEmpty(),
    check("date", "date is required!").not().isEmpty(),
    
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
       let order={
        orderId:data.orderId,
        email:data.email,
        brandName:data.brandName,
        product:data.product,
        materialRequirement:data.materialRequirement,
        processedBy:req.body.processedBy,
        date:req.body.date,
       };
       newSupply.createProcesses(order);
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
        processedBy:req.body.processedBy,
        date:req.body.date,
        txnId:txnId,
       };
       newSupply.appendTxIdProcesses(obj);
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
route.get('/get-process/:id',async(req,res)=>{
    if(req.params.id==null||req.params.id.trim().length<=0){
        return res.status(400).json({error: "Order Id is required"});
    }
    try {
        await newSupply.sync();
        const data=newSupply.getProcesses(req.params.id);
        console.log(data)
        return res.status(200).json({ProcessState:data});
    } catch (error) {
        console.log(error)
        return res.status(500).json({Error:error});
    }
})
route.get('/get-process-history/:id',async(req,res)=>{
    if(req.params.id==null||req.params.id.trim().length<=0){
        return res.status(400).json({error: "Order Id is required"});
    }
    try {
        await newSupply.sync();
        const data=newSupply.getProcessesHistory(req.params.id);
        console.log(data)
        return res.status(200).json({ProcessState:data});
    } catch (error) {
        console.log(error)
        return res.status(500).json({Error:error});
    }
})
module.exports=route;