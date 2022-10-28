const express = require("express");
const route = express.Router();
const { check, validationResult } = require('express-validator');
const newSupply = require("../app");
//Order Routes
route.post(
    "/create-supply/:id", [
    
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
        const dataanalysis=newSupply.getAnalysisAndDevelopment(req.params.id);
        if(dataanalysis.poState=="completed"){
        await newSupply.sync();
        const data=newSupply.getOrder(req.params.id);
        
        
       let order={
        orderId:data.orderId,
        date:req.body.date,
        vendorInfo:data.vendorInfo,
        brandName:data.brandName,
        product:data.product,
        manufactureInfo:dataanalysis.manufactureInfo,
        madeIn:dataanalysis.madeIn,
        materialRequirement:data.materialRequirement,
       };
       newSupply.createSupplyFlow(order);
       await newSupply.sync();
       console.log("owner: ",newSupply.owner);
       console.log("location: ",newSupply.location);
       console.log("origin: ",newSupply.origin);
       let txnId=newSupply.location.slice(0,-3);
       console.log("txnId: ",txnId)
       let obj={
        orderId:data.orderId,
        date:req.body.date,
        vendorInfo:data.vendorInfo,
        brandName:data.brandName,
        product:data.product,
        manufactureInfo:dataanalysis.manufactureInfo,
        madeIn:dataanalysis.madeIn,
        materialRequirement:data.materialRequirement,
        txnId:txnId,
       };
       newSupply.appendSupplyFlow(obj);
       return res.status(200).json({
        msg: "order saved in blockchain",
        txnid:txnId,
       });
    }
    else{
        return res.status(400).json({
            msg: "Please Complete PoNo First Then supply available!",
           });
    }
    } catch (error) {
        console.log(error);
        return res.status(500).json({Error:error});
    }
   

}
);
route.get('/get-supply/:id',async(req,res)=>{
    if(req.params.id==null||req.params.id.trim().length<=0){
        return res.status(400).json({error: "Order Id is required"});
    }
    try {
        await newSupply.sync();
        const data=newSupply.getSupplyFlow(req.params.id);
        console.log(data)
        return res.status(200).json({SupplyFlow:data});
    } catch (error) {
        console.log(error)
        return res.status(500).json({Error:error});
    }
})
route.get('/get-supply-history/:id',async(req,res)=>{
    if(req.params.id==null||req.params.id.trim().length<=0){
        return res.status(400).json({error: "Order Id is required"});
    }
    try {
        await newSupply.sync();
        const data=newSupply.getSupplyFlowHistory(req.params.id);
        console.log(data)
        return res.status(200).json({SupplyFlow:data});
    } catch (error) {
        console.log(error)
        return res.status(500).json({Error:error});
    }
})
module.exports=route;