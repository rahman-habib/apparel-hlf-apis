const express = require("express");
const route = express.Router();
const { check, validationResult } = require('express-validator');
const newSupply = require("../app");
//Order Routes
route.post(
    "/create-stitching/:id", [
    check("date", "date is required!").not().isEmpty(),
    check("workerId", "workerId is required!").not().isEmpty(),
    check("workerName", "workerName is required!").not().isEmpty(),
    check("stitchingState", "stitchingState is required!").not().isEmpty(),
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
        const cuttingdata=newSupply.getCuttingProcess(req.body.rfid);
        if(cuttingdata.cuttingState=="completed"){


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
        stitchingState:req.body.stitchingState,
        rfid:req.body.rfid,
       };
       newSupply.createStitchingProcess(order);
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
        stitchingState:req.body.stitchingState,
        rfid:req.body.rfid,
        txnId:txnId,
       };
       newSupply.appendTxIdStitchingProcess(obj);
       return res.status(200).json({
        msg: "order saved in blockchain",
        txnid:txnId,
       });
    }
    else{
        return res.status(400).json({
            msg: "Please Complete Cutting Process First Then Stitching Process!",
           });
    }
    } catch (error) {
        console.log(error);
        return res.status(500).json({Error:error});
    }
   

}
);
route.get('/get-stitching-process/:id',async(req,res)=>{
    if(req.params.id==null||req.params.id.trim().length<=0){
        return res.status(400).json({error: "Order Id is required"});
    }
    try {
        await newSupply.sync();
        const data=newSupply.getStitchingProcess(req.params.id);
        console.log(data)
        return res.status(200).json({StitchingProcess:data});
    } catch (error) {
        console.log(error)
        return res.status(500).json({Error:error});
    }
})
route.get('/get-stitching-process-history/:id',async(req,res)=>{
    if(req.params.id==null||req.params.id.trim().length<=0){
        return res.status(400).json({error: "Order Id is required"});
    }
    try {
        await newSupply.sync();
        const data=newSupply.getStitchingProcessHistory(req.params.id);
        console.log(data)
        return res.status(200).json({StitchingProcess:data});
    } catch (error) {
        console.log(error)
        return res.status(500).json({Error:error});
    }
})
module.exports=route;