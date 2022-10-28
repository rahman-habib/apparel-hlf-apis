const express = require("express");
const route = express.Router();
const { check, validationResult } = require('express-validator');
const newSupply = require("../app");
//Order Routes
route.post(
    "/create-packing/:id", [
    check("date", "date is required!").not().isEmpty(),
    check("workerId", "workerId is required!").not().isEmpty(),
    check("workerName", "workerName is required!").not().isEmpty(),
    check("packingState", "packingState is required!").not().isEmpty(),
    check("rfid", "rfid is required!").not().isEmpty(),
    
    
],
async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return res.status(400).json({errors:errors.array()});
    }
    
    try {
        await newSupply.sync();
        const qualitydata=newSupply.getQualityProcess(req.body.rfid);
        if(qualitydata.qualityState=="completed"){

        await newSupply.sync();
        const data=newSupply.getOrder(req.params.id);
       let order={
        orderId:data.orderId,
        email:data.email,
        brandName:data.brandName,
        product:data.product,
        materialRequirement:data.materialRequirement,
        date:req.body.date,
        workerId:req.body.workerId,
        workerName:req.body.workerName,
        packingState:req.body.packingState,
        rfid:req.body.rfid,
       };
       newSupply.createPackingProcess(order);
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
        date:req.body.date,
        workerId:req.body.workerId,
        workerName:req.body.workerName,
        rfid:req.body.rfid,
        packingState:req.body.packingState,
        txnId:txnId,
       };
       newSupply.appendTxIdPackingProcess(obj);
       return res.status(200).json({
        msg: "order saved in blockchain",
        txnid:txnId,
       });
    }
    else{
        return res.status(400).json({
            msg: "Please Complete Quality Process First Then Packing Process!",
           });
    }
    } catch (error) {
        console.log(error);
        return res.status(500).json({Error:error});
    }
   

}
);
route.get('/get-packing-process/:id',async(req,res)=>{
    if(req.params.id==null||req.params.id.trim().length<=0){
        return res.status(400).json({error: "Order Id is required"});
    }
    try {
        await newSupply.sync();
        const data=newSupply.getPackingProcess(req.params.id);
        console.log(data)
        return res.status(200).json({PackingProcess:data});
    } catch (error) {
        console.log(error)
        return res.status(500).json({Error:error});
    }
})
route.get('/get-packing-process-history/:id',async(req,res)=>{
    if(req.params.id==null||req.params.id.trim().length<=0){
        return res.status(400).json({error: "Order Id is required"});
    }
    try {
        await newSupply.sync();
        const data=newSupply.getPackingProcessHistory(req.params.id);
        console.log(data)
        return res.status(200).json({PackingProcess:data});
    } catch (error) {
        console.log(error)
        return res.status(500).json({Error:error});
    }
})
module.exports=route;