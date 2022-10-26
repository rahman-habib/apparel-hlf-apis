const Run=require('run-sdk')
const run=new Run({network:'mock'})

class SupplyChain extends Jig{

    init(){
        this.Orders=[];
        this.AnalysisAndDevelopment=[];
        this.Processes=[];
        this.CuttingProcess=[];
        this.StitchingProcess=[];
        this.QualityProcess=[];
        this.PackingProcess=[];
        this.RFID=[];
        this.SupplyFlow=[];
    }
    createOrder(order){
        try {
            console.log("order: ",order)
            this.Orders.push(order);
            return true;
        } catch (error) {
            return false;
        }
    }
    getOrderHistory(id){
        try {
            return this.Orders.filter((ord)=>ord.orderId==id);
        
        } catch (error) {
            return false;
        }

    }
    getOrder(id){
        try {
            let data=this.Orders.filter((ord)=>ord.orderId==id);
            data.reverse();
            return data[0];
        } catch (error) {
            return false;
        }
    }
    appendTxIdOrder(obj){
        this.Orders[this.Orders.length-1]=obj;
        return false;
    } 
    createAnalysisAndDevelopment(order){
        try {
            console.log("Analysis and Development")
            this.AnalysisAndDevelopment.push(order)
            return true;
        } catch (error) {
            return false;
        }
    }
    getAnalysisAndDevelopment(id){
        try {
            let data=this.AnalysisAndDevelopment.filter((ord)=>ord.orderId==id);
            data.reverse();
            return data[0];
        } catch (error) {
            return false;
        }
    }
    getAnalysisHistory(id){
        try {
            return this.AnalysisAndDevelopment.filter((ord)=>ord.orderId==id);
        } catch (error) {
            return false;
        }
    }
    appendTxIdAnalysis(obj){
        this.AnalysisAndDevelopment[this.AnalysisAndDevelopment.length-1]=obj;
        return true;
    }
    createProcesses(process){
        try {
            console.log("Processes: ",process);
            this.Processes.push(process);
            return true;
        } catch (error) {
            return false;
        }
    }
    getProcessesHistory(id){
        try {
            return this.Processes.filter((pro)=>pro.orderId==id);

        } catch (error) {
            return false;
        }
    }
    getProcesses(id){
        try {
            let data=this.Processes.filter((pro)=>pro.orderId==id);
            data.reverse();
            return data[0];
        } catch (error) {
            return false;
        }
    }
    appendTxIdProcesses(obj){
       try {
        this.Processes[this.Processes.length-1]=obj;
        return true
       } catch (error) {
        return false;
       }
    }
    createCuttingProcess(cp){
        try {
            console.log("Cutting Process: ",cp);
            this.CuttingProcess.push(cp);
            return true;
        } catch (error) {
            return false;
        }

    }
    getCuttingProcessHistory(id){
        try {
            return this.CuttingProcess.filter((cp)=>cp.orderId==id);
        } catch (error) {
            return false;
        }
    }
    getCuttingProcess(id){
        try {
            let data=this.CuttingProcess.filter((cp)=>cp.orderId==id);
            data.reverse();
            return data[0];
        } catch (error) {
            return false;
        }
    }
    appendTxIdCuttingProcess(obj){
        try {
            this.CuttingProcess[this.CuttingProcess.length-1]=obj;
            return true;
        } catch (error) {
            return false;
        }
    }
    createStitchingProcess(sp){
        try {
            console.log('Stitching Process: ',sp);
            this.StitchingProcess.push(sp);
            return true;
        } catch (error) {
            return false;
        }
    }
    getStitchingProcessHistory(id){
        try {
           return this.StitchingProcess.filter((sp)=>sp.orderId==id);

        } catch (error) {
            return false;
        }
    }
    getStitchingProcess(id){
        try {
            let data=this.StitchingProcess.filter((sp)=>sp.orderId==id);
            data.reverse();
            return data[0];
        } catch (error) {
            return false;
        }
    }
    appendTxIdStitchingProcess(obj){
        try {
            this.StitchingProcess[this.StitchingProcess.length-1]=obj;
            return true;
        } catch (error) {
            return false;
        }
    }
    createQualityProcess(qp){
        try {
            console.log("Quality Process: ",qp);
            this.QualityProcess.push(qp);
            return true;
        } catch (error) {
            return false;
        }
    }
    getQualityProcessHistory(id){
        try {
            return this.QualityProcess.filter((qp)=>qp.orderId==id);

        } catch (error) {
            return false;
        }
    }
    getQualityProcess(id){
        try {
            let data=this.QualityProcess.filter((qp)=>qp.orderId==id);
            data.reverse();
            return data[0];
        } catch (error) {
            return false;
        }
    }
    appendTxIdQualityProcess(obj){
        try {
            this.QualityProcess[this.QualityProcess.length-1]=obj;
            return true;
        } catch (error) {
            return false;
        }
    }
    createPackingProcess(pp){
        try {
            console.log("Packing Process: ",pp);
            this.PackingProcess.push(pp);
            return true;
        } catch (error) {
            return false;
        }
    }
    getPackingProcessHistory(id){
        try {
            return this.PackingProcess.filter((pp)=>pp.orderId==id);
        } catch (error) {
            return false;
        }
    }
    getPackingProcess(id){
        try {
            let data=this.PackingProcess.filter((pp)=>pp.orderId==id);
            data.reverse();
            return data[0];
        } catch (error) {
            return false;
        }
    }
    appendTxIdPackingProcess(obj){
        try {
            this.PackingProcess[this.PackingProcess.length-1]=obj;
            return true;
        } catch (error) {
            return false;
        }
    }
    createRfid(rd){
        try {
            console.log("RFID:",rd);
            this.RFID.push(rd);
            return true;
        } catch (error) {
            return false;
        }
    }
    getRfid(id){
        try {
            let data=this.RFID.filter((rd)=>rd.orderId==id);
            data.reverse();
            return data[0];
        } catch (error) {
            return false;
        }
    }
    getRfidHistory(id){
        try {
            return this.RFID.filter((rd)=>rd.orderId==id);
        } catch (error) {
            return false;
        }
    }
    appendTxIdRfid(obj){
        try {
            this.RFID[this.RFID.length-1]=obj;
            return true;
        } catch (error) {
            return false;
        }
    }
    createSupplyFlow(sf){
        try {
            console.log("supply Flow: ",sf);
            this.SupplyFlow.push(sf);
            return true;
        } catch (error) {
            return false;
        }
    }
    getSupplyFlowHistory(id){
        try {
            return this.SupplyFlow.filter((sf)=>sf.orderId==id);

        } catch (error) {
            return false;
        }
    }
    getSupplyFlow(id){
        try {
            let data=this.SupplyFlow.filter((sf)=>sf.orderId==id);
            data.reverse()
            return data[0];
        } catch (error) {
            return false;
        }
    }
    appendSupplyFlow(obj){
        try {
            this.SupplyFlow[this.SupplyFlow.length-1]=obj;
            return true;
        } catch (error) {
            return false;
        }
    }
  

}

module.exports=SupplyChain;