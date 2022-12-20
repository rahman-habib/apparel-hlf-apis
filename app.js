//Importing Modules
const fs = require("fs");
const path = require("path");
const http = require("http");
var bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
var express = require("express");
var app = express();

//Use Methods
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
//Fabric Network
const { Gateway, Wallets } = require("fabric-network");

//LoadNetWork
loadNetwork = (channel, contractName) => {
    return new Promise(async (res, rej) => {
        const ccpPath = path.resolve(
          __dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json'
        );
        const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get("appUser");
        if (!identity) {
            console.log(
                'An identity for the user "appUser" does not exist in the wallet'
            );
            console.log("Run the registerUser.js application before retrying");
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: "appUser",
            discovery: { enabled: true, asLocalhost: true },
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channel);

        // Get the contract from the network.
        const contract = network.getContract(contractName);

        res(contract);
    });
};


//------------------Invoice API Endpoints------------------

//Query All orders
app.get("/api/query-all-orders", async (req, res) => {
    try {
        loadNetwork("mychannel", "basic").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "QueryAllOrders"
                );
                let data = JSON.parse(result.toString());
                return res.status(200).send(data);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
    }
});

//Query Single order
app.get("/api/query-order/:orderId?", async (req, res) => {
    if (
        req.params.orderId == null ||
        req.params.orderId.trim().length <= 0
    ) {
        return res.status(400).json({ error: "order ID is required!" });
    }
    try {
        loadNetwork("mychannel", "basic").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "QueryOrder",
                    req.params.orderId
                );
                console.log(
                    `Transaction has been evaluated, result is: ${result}`
                );
                let data = JSON.parse(result.toString());
                return res.status(200).send(data);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
    }
});

//CreateOrder
app.post(
    "/api/create-order",
    [
        check("Accept", "Accept is required!").not().isEmpty(),
        check("ShipAddress", "ShipAddress is required!").not().isEmpty(),
        check("brandName", "brandName is required!").not().isEmpty(),
        check("id", "id is required!").not().isEmpty(),
        check("orderDate", "orderDate is required!").not().isEmpty(),
        check("phoneNumber", "phoneNumber is required!").not().isEmpty(),
        check("email", "email is required!").not().isEmpty(),
        check("manufacturer", "manufacturer is required!").not().isEmpty(),
        check("materialReqirement", "materialReqirement is required!").not().isEmpty(),
        check("orderId", "orderId is required!").not().isEmpty(),
        check("orderValue", "orderValue is required!").not().isEmpty(),
        check("product", "product is required!").not().isEmpty(),
        check("productQuantity", "productQuantity is required!").not().isEmpty(),
        check("productStyleNo", "productStyleNo is required!").not().isEmpty(),
        check("productUrl", "productUrl is required!").not().isEmpty(),
        check("prductCodes", "prductCodes is required!").not().isEmpty(),
        check("username", "username is required!").not().isEmpty(),
        
    ],
    async (req, res) => {
        console.log("Create Endpoint!");
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            loadNetwork("mychannel", "basic").then(async (contract) => {
                try {
                    await contract.submitTransaction(
                        "CreateOrder",
                        req.body.orderId,
                        req.body.orderValue,
                        req.body.product,
                        req.body.productQuantity,
                        req.body.productStyleNo,
                        req.body.productUrl,
                        req.body.manufacturer,
                        req.body.id,
                        req.body.email,
                        req.body.brandName,
                        req.body.ShipAddress,
                        JSON.stringify(req.body.prductCodes),
                        req.body.orderDate,
                        req.body.phoneNumber,
                        req.body.username,
                        req.body.Accept,
                        JSON.stringify(req.body.materialReqirement),
                    );
                    console.log("Transaction has been submitted");
                    return res.status(200).send("Submited");
                } catch (error) {
                    console.error(`Failed to evaluate transaction: ${error}`);
                    return res.status(400).json({
                        error: `Failed to evaluate transaction: ${error.message}`,
                    });
                }
            });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    }
);

// order process
app.post("/api/order-process/:orderId?", 
[
    check("Cutting", "Cutting is required!").not().isEmpty(),
    check("Stiching", "Stiching is required!").not().isEmpty(),
    check("Quality", "Quality is required!").not().isEmpty(),
    check("Packing", "Packing is required!").not().isEmpty(),
    check("inProductionDate", "inProductionDate is required!").not().isEmpty(),
    check("StartProductionDate", "StartProductionDate is required!").not().isEmpty(),
],
async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
  if (
      req.params.orderId == null ||
      req.params.orderId.trim().length <= 0
  ) {
      return res.status(400).json({ error: "order ID is required!" });
  }
  try {
      loadNetwork("mychannel", "basic").then(async (contract) => {
          try {
               await contract.submitTransaction(
                  "ProcessOrder",
                  req.params.orderId,
                  req.body.Cutting,
                  req.body.Packing,
                  req.body.Quality,
                  req.body.Stiching,
                  req.body.inProductionDate,
                  req.body.StartProductionDate,
              );

              console.log("Transaction has been submitted");
              return res.status(200).send("Submited");
          } catch (error) {
              console.error(`Failed to evaluate transaction: ${error}`);
              return res.status(400).json({
                  error: `Failed to evaluate transaction: ${error.message}`,
              });
          }
      });
  } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);
      return res.status(400).json({ error: error });
  }
});

// order Cutting
app.post("/api/order-Cutting/:orderId?", 
[
    check("CuttingDate", "CuttingDate is required!").not().isEmpty(),
   
],
async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
  if (
      req.params.orderId == null ||
      req.params.orderId.trim().length <= 0
  ) {
      return res.status(400).json({ error: "order ID is required!" });
  }
  try {
      loadNetwork("mychannel", "basic").then(async (contract) => {
          try {
               await contract.submitTransaction(
                  "CuttingOrder",
                  req.params.orderId,
                  req.body.CuttingDate, 
              );

              console.log("Transaction has been submitted");
              return res.status(200).send("Submited");
          } catch (error) {
              console.error(`Failed to evaluate transaction: ${error}`);
              return res.status(400).json({
                  error: `Failed to evaluate transaction: ${error.message}`,
              });
          }
      });
  } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);
      return res.status(400).json({ error: error });
  }
});
// order Stiching
app.post("/api/order-stiching/:orderId?", 
[
    check("StichingDate", "StichingDate is required!").not().isEmpty(),
   
],
async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
  if (
      req.params.orderId == null ||
      req.params.orderId.trim().length <= 0
  ) {
      return res.status(400).json({ error: "order ID is required!" });
  }
  try {
      loadNetwork("mychannel", "basic").then(async (contract) => {
          try {
               await contract.submitTransaction(
                  "StichingOrder",
                  req.params.orderId,
                  req.body.StichingDate, 
              );

              console.log("Transaction has been submitted");
              return res.status(200).send("Submited");
          } catch (error) {
              console.error(`Failed to evaluate transaction: ${error}`);
              return res.status(400).json({
                  error: `Failed to evaluate transaction: ${error.message}`,
              });
          }
      });
  } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);
      return res.status(400).json({ error: error });
  }
});
// order Quality
app.post("/api/order-quality/:orderId?", 
[
    check("QualityDate", "QualityDate is required!").not().isEmpty(),
   
],
async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
  if (
      req.params.orderId == null ||
      req.params.orderId.trim().length <= 0
  ) {
      return res.status(400).json({ error: "order ID is required!" });
  }
  try {
      loadNetwork("mychannel", "basic").then(async (contract) => {
          try {
               await contract.submitTransaction(
                  "QualityOrder",
                  req.params.orderId,
                  req.body.QualityDate, 
              );

              console.log("Transaction has been submitted");
              return res.status(200).send("Submited");
          } catch (error) {
              console.error(`Failed to evaluate transaction: ${error}`);
              return res.status(400).json({
                  error: `Failed to evaluate transaction: ${error.message}`,
              });
          }
      });
  } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);
      return res.status(400).json({ error: error });
  }
});
// order Packing
app.post("/api/order-packing/:orderId?", 
[
    check("PackingDate", "PackingDate is required!").not().isEmpty(),
    check("Delivered", "Delivered is required!").not().isEmpty(),
    check("DeliveredDate", "DeliveredDate is required!").not().isEmpty(),
   
],
async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
  if (
      req.params.orderId == null ||
      req.params.orderId.trim().length <= 0
  ) {
      return res.status(400).json({ error: "order ID is required!" });
  }
  try {
      loadNetwork("mychannel", "basic").then(async (contract) => {
          try {
               await contract.submitTransaction(
                  "PackingOrder",
                  req.params.orderId,
                  req.body.PackingDate, 
                  req.body.Delivered, 
                  req.body.DeliveredDate, 
              );

              console.log("Transaction has been submitted");
              return res.status(200).send("Submited");
          } catch (error) {
              console.error(`Failed to evaluate transaction: ${error}`);
              return res.status(400).json({
                  error: `Failed to evaluate transaction: ${error.message}`,
              });
          }
      });
  } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);
      return res.status(400).json({ error: error });
  }
});
// order Material data
app.post("/api/order-material/:orderId?", 
[
    check("OrderedMaterialData", "OrderedMaterialData is required!").not().isEmpty(),
   
],
async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
  if (
      req.params.orderId == null ||
      req.params.orderId.trim().length <= 0
  ) {
      return res.status(400).json({ error: "order ID is required!" });
  }
  try {
      loadNetwork("mychannel", "basic").then(async (contract) => {
          try {
               await contract.submitTransaction(
                  "OrderMaterialData",
                  req.params.orderId,
                  JSON.stringify(req.body.OrderedMaterialData), 
              );

              console.log("Transaction has been submitted");
              return res.status(200).send("Submited");
          } catch (error) {
              console.error(`Failed to evaluate transaction: ${error}`);
              return res.status(400).json({
                  error: `Failed to evaluate transaction: ${error.message}`,
              });
          }
      });
  } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);
      return res.status(400).json({ error: error });
  }
});

//Query order History
app.get("/api/query-order-history/:orderId?", async (req, res) => {
    if (
        req.params.orderId == null ||
        req.params.orderId.trim().length <= 0
    ) {
        return res.status(400).json({ error: "order ID is required!" });
    }
    try {
        loadNetwork("mychannel", "basic").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "GetHistoryOrder",
                    req.params.orderId
                );
                console.log(
                    `Transaction has been evaluated, result is: ${result}`
                );
                let data = JSON.parse(result.toString());
                let record=[]
                    for(let i=0;i<data.length;i++){
                        record.push(JSON.parse(data[i].Record))
                    }               
                return res.status(200).send(record);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
    }
});
  
//Update Event
app.post(
    "/api/update-invoice",
    [
        check("invoiceID", "invoiceID is required!").not().isEmpty(),
        check("version", "version is required!").not().isEmpty(),
        check("invoiceHash", "invoiceHash is required!").not().isEmpty(),
        check("updatedBy", "updatedBy is required!").not().isEmpty(),
        check("updatedDate", "updatedDate is required!").not().isEmpty(),
        check("updateDetail", "updateDetail is required!").not().isEmpty(),
        check("status", "Status is required!").not().isEmpty(),
        check("balanceDue", "balanceDue is required!").not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let invoiceID = `${req.body.invoiceID}-${req.body.version}`;
        try {
            loadNetwork("invoice", "invoice").then(async (contract) => {
                try {
                    await contract.submitTransaction(
                        "UpdateInvoice",
                        invoiceID,
                        req.body.invoiceHash,
                        req.body.status,
                        req.body.balanceDue,
                        req.body.updatedBy,
                        req.body.updatedDate,
                        req.body.updateDetail
                    );
                    console.log("Transaction has been updated");
                    return res.status(200).send("Updated");
                } catch (error) {
                    console.error(`Failed to evaluate transaction: ${error}`);
                    return res.status(400).json({
                        error: `Failed to evaluate transaction: ${error.message}`,
                    });
                }
            });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    }
);

//Receive Invoice
app.post(
    "/api/receive-invoice",
    [
        check("InvoiceID", "invoiceID is required!").not().isEmpty(),
        check("Version", "version is required!").not().isEmpty(),
        check("InvoiceHash", "InvoiceHash is required!").not().isEmpty(),
        check("ReceiveDate", "ReceiveDate is required!").not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let invoiceID = `${req.body.InvoiceID}-${req.body.Version}`;
        try {
            loadNetwork("invoice", "invoice").then(async (contract) => {
                try {
                    await contract.submitTransaction(
                        "ReceiveInvoice",
                        invoiceID,
                        req.body.InvoiceHash,
                        req.body.ReceiveDate
                    );
                    console.log("Transaction has been updated");
                    return res.status(200).send("Updated");
                } catch (error) {
                    console.error(`Failed to evaluate transaction: ${error}`);
                    return res.status(400).json({
                        error: `Failed to evaluate transaction: ${error.message}`,
                    });
                }
            });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    }
);

//Initiate Invoice
app.post(
    "/api/initiate-invoice",
    [
        check("InvoiceID", "invoiceID is required!").not().isEmpty(),
        check("Version", "version is required!").not().isEmpty(),
        check("InvoiceHash", "InvoiceHash is required!").not().isEmpty(),
        check("InitiateDate", "InitiateDate is required!").not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let invoiceID = `${req.body.InvoiceID}-${req.body.Version}`;
        try {
            loadNetwork("invoice", "invoice").then(async (contract) => {
                try {
                    await contract.submitTransaction(
                        "InitiateInvoice",
                        invoiceID,
                        req.body.InvoiceHash,
                        req.body.InitiateDate
                    );
                    console.log("Transaction has been updated");
                    return res.status(200).send("Updated");
                } catch (error) {
                    console.error(`Failed to evaluate transaction: ${error}`);
                    return res.status(400).json({
                        error: `Failed to evaluate transaction: ${error.message}`,
                    });
                }
            });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    }
);

//Review Invoice
app.post(
    "/api/review-invoice",
    [
        check("InvoiceID", "invoiceID is required!").not().isEmpty(),
        check("Version", "version is required!").not().isEmpty(),
        check("InvoiceHash", "InvoiceHash is required!").not().isEmpty(),
        check("ReviewDate", "ReviewDate is required!").not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let invoiceID = `${req.body.InvoiceID}-${req.body.Version}`;
        console.log("Review Invoice Endpoint Hit!");
        try {
            loadNetwork("invoice", "invoice").then(async (contract) => {
                try {
                    await contract.submitTransaction(
                        "ReviewInvoice",
                        invoiceID,
                        req.body.InvoiceHash,
                        req.body.ReviewDate
                    );
                    console.log("Transaction has been updated");
                    res.status(200).send("Updated");
                } catch (error) {
                    console.error(`Failed to evaluate transaction: ${error}`);
                    return res.status(400).json({
                        error: `Failed to evaluate transaction: ${error.message}`,
                    });
                }
            });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    }
);

//Approve Invoice
app.post(
    "/api/approve-invoice",
    [
        check("InvoiceID", "invoiceID is required!").not().isEmpty(),
        check("Version", "version is required!").not().isEmpty(),
        check("InvoiceHash", "InvoiceHash is required!").not().isEmpty(),
        check("ApproveDate", "ApproveDate is required!").not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let invoiceID = `${req.body.InvoiceID}-${req.body.Version}`;
        try {
            loadNetwork("invoice", "invoice").then(async (contract) => {
                try {
                    await contract.submitTransaction(
                        "ApproveInvoice",
                        invoiceID,
                        req.body.InvoiceHash,
                        req.body.ApproveDate
                    );
                    console.log("Transaction has been updated");
                    return res.status(200).send("Updated");
                } catch (error) {
                    console.error(`Failed to evaluate transaction: ${error}`);
                    return res.status(400).json({
                        error: `Failed to evaluate transaction: ${error.message}`,
                    });
                }
            });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    }
);

//Pay Invoice
app.post(
    "/api/pay-invoice",
    [
        check("InvoiceID", "InvoiceID is required!").not().isEmpty(),
        check("Version", "Version is required!").not().isEmpty(),
        check("InvoiceHash", "InvoiceHash is required!").not().isEmpty(),
        check("PayDate", "PayDate is required!").not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let invoiceID = `${req.body.InvoiceID}-${req.body.Version}`;
        try {
            loadNetwork("invoice", "invoice").then(async (contract) => {
                try {
                    await contract.submitTransaction(
                        "PayInvoice",
                        invoiceID,
                        req.body.InvoiceHash,
                        req.body.PayDate
                    );
                    console.log("Transaction has been updated");
                    return res.status(200).send("Updated");
                } catch (error) {
                    console.error(`Failed to evaluate transaction: ${error}`);
                    return res.status(400).json({
                        error: `Failed to evaluate transaction: ${error.message}`,
                    });
                }
            });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    }
);

//------------------Workflow API Endpoints------------------

//Query All WorkFlows
app.get("/api/workflows", async (req, res) => {
    try {
        loadNetwork("invoice", "workflow").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "queryAllWorkflows"
                );
                let data = JSON.parse(result.toString());
                return res.status(200).send(data);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
        //
    }
});

//Query Single WorkFlow
app.get("/api/query-workflow/:workflow_id?", async (req, res) => {
    if (
        req.params.workflow_id == null ||
        req.params.workflow_id.trim().length <= 0
    ) {
        return res.status(400).json({ error: "Workflow ID is required!" });
    }
    try {
        loadNetwork("invoice", "workflow").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "QueryWorkflow",
                    req.params.workflow_id
                );
                console.log(
                    `Transaction has been evaluated, result is: ${result}`
                );
                let data = JSON.parse(result.toString());
                return res.status(200).send(data);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
    }
});

//Query WorkFlow History
app.get("/api/workflow-history/:workflow_id?", async (req, res) => {
    if (
        req.params.workflow_id == null ||
        req.params.workflow_id.trim().length <= 0
    ) {
        return res.status(400).json({ error: "Workflow ID is required!" });
    }
    try {
        loadNetwork("invoice", "workflow").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "GetHistoryWorkflow",
                    req.params.workflow_id
                );
                console.log(
                    `Transaction has been evaluated, result is: ${result}`
                );
                let data = JSON.parse(result.toString());
                return res.status(200).send(data);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
    }
});

//Create Workflow
app.post(
    "/api/create-workflow",
    [
        check("WorkflowName", "WorkflowName is required!").not().isEmpty(),
        check("WorkflowHash", "WorkflowHash is required!").not().isEmpty(),
        check("WorkflowID", "WorkflowID is required!").not().isEmpty(),
        check("OrganizationID", "OrganizationID is required!").not().isEmpty(),
        check("OrganizationName", "OrganizationName is required!")
            .not()
            .isEmpty(),
        check("CompanyID", "CompanyID is required!").not().isEmpty(),
        check("CompanyName", "CompanyName is required!").not().isEmpty(),
        check("TenantID", "TenantID is required!").not().isEmpty(),
        check("ReferenceTicket", "ReferenceTicket is required!")
            .not()
            .isEmpty(),
        check("ReviewStepsCount", "ReviewStepsCount is required!")
            .not()
            .isEmpty(),
        check("ActionStepsCount", "ActionStepsCount is required!")
            .not()
            .isEmpty(),
        check("CreatedBy", "CreatedBy is required!").not().isEmpty(),
        check("CreatedDate", "CreatedDate is required!").not().isEmpty(),
        check("UpdatedBy", "UpdatedBy is required!").not().isEmpty(),
        check("UpdatedDate", "UpdatedDate is required!").not().isEmpty(),
        check("Comments", "Comments is required!").not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            loadNetwork("invoice", "workflow").then(async (contract) => {
                try {
                    await contract.submitTransaction(
                        "CreateWorkflow",
                        req.body.WorkflowName,
                        req.body.WorkflowHash,
                        req.body.WorkflowID,
                        req.body.OrganizationID,
                        req.body.OrganizationName,
                        req.body.CompanyID,
                        req.body.CompanyName,
                        req.body.TenantID,
                        req.body.ReferenceTicket,
                        req.body.ReviewStepsCount,
                        req.body.ActionStepsCount,
                        req.body.CreatedBy,
                        req.body.CreatedDate,
                        req.body.UpdatedBy,
                        req.body.UpdatedDate,
                        req.body.Comments
                    );
                    console.log("Workflow has been created");
                    return res.status(200).send("Submited");
                } catch (error) {
                    console.error(`Failed to evaluate transaction: ${error}`);
                    return res.status(400).json({
                        error: `Failed to evaluate transaction: ${error.message}`,
                    });
                }
            });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    }
);
//Update Workflow
app.post(
    "/api/update-workflow",
    [
        check("WorkflowID", "WorkflowID is required!").not().isEmpty(),
        check("ReviewStepsCount", "ReviewStepsCount is required!")
            .not()
            .isEmpty(),
        check("ActionStepsCount", "ActionStepsCount is required!")
            .not()
            .isEmpty(),
        check("UpdatedBy", "UpdatedBy is required!").not().isEmpty(),
        check("UpdatedDate", "UpdatedDate is required!").not().isEmpty(),
        check("WorkflowHash", "WorkflowHash is required!").not().isEmpty(),
        check("comments", "comments is required!").not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            loadNetwork("invoice", "workflow").then(async (contract) => {
                try {
                    await contract.submitTransaction(
                        "UpdateWorkflow",
                        req.body.WorkflowID,
                        req.body.ReviewStepsCount,
                        req.body.ActionStepsCount,
                        req.body.UpdatedBy,
                        req.body.UpdatedDate,
                        req.body.WorkflowHash,
                        req.body.comments
                    );
                    console.log("Transaction has been updated");
                    return res.status(200).send("Updated");
                } catch (error) {
                    console.error(`Failed to evaluate transaction: ${error}`);
                    return res.status(400).json({
                        error: `Failed to evaluate transaction: ${error.message}`,
                    });
                }
            });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    }
);

//------------------Invoice Workflow API Endpoints------------------

//Query All Invoice WorkFlows
app.get("/api/invoice-workflows", async function (req, res) {
    try {
        loadNetwork("invoice", "invoiceWorkflow").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "QueryAllInvoiceWorkflows"
                );
                let data = JSON.parse(result.toString());
                return res.status(200).send(data);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        return res.status(400).json({ error: error });
    }
});

//Query Single Invoice WorkFlow
app.get("/api/query-invoice-workflow/:invoice_id?", async (req, res) => {
    if (
        req.params.invoice_id == null ||
        req.params.invoice_id.trim().length <= 0
    ) {
        return res.status(400).json({ error: "Invoice ID is required!" });
    }
    try {
        loadNetwork("invoice", "invoiceWorkflow").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "QueryInvoiceWorkflow",
                    req.params.invoice_id
                );

                var data = JSON.parse(result.toString());
                console.log(data);
                return res.status(200).send(data);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
    }
});

//Query Invoice WorkFlow History
app.get("/api/invoice-workflow-history/:invoice_id?", async (req, res) => {
    if (
        req.params.invoice_id == null ||
        req.params.invoice_id.trim().length <= 0
    ) {
        return res.status(400).json({ error: "Invoice ID is required!" });
    }
    try {
        loadNetwork("invoice", "invoiceWorkflow").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "GetHistoryInvoiceWorkflow",
                    req.params.invoice_id
                );

                var data = JSON.parse(result.toString());
                console.log(data);
                return res.status(200).send(data);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
    }
});

//Create Invoice Workflow
app.post(
    "/api/create-invoice-workflow",
    [
        check("InvoiceID", "InvoiceID is required!").not().isEmpty(),
        check("Version", "Version is required!").not().isEmpty(),
        check("WorkflowID", "WorkflowID is required!").not().isEmpty(),
        check("InvoiceHash", "InvoiceHash is required!").not().isEmpty(),
        check("EventFor", "EventFor is required!").not().isEmpty(),
        check("Event", "Event is required!").not().isEmpty(),
        check("InitBy", "InitBy is required!").not().isEmpty(),
        check("EventStatus", "EventStatus is required!").not().isEmpty(),
        check("EventInitDate", "EventInitDate is required!").not().isEmpty(),
        check("EventComments", "EventComments is required!").not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let invoiceID = `${req.body.InvoiceID}-${req.body.Version}`;
        console.log("Create Invoice Workflow Endpoint Hit!");
        console.log(req.body);
        try {
            loadNetwork("invoice", "invoiceWorkflow").then(async (contract) => {
                try {
                    await contract.submitTransaction(
                        "CreateInvoiceWorkflow",
                        invoiceID,
                        req.body.WorkflowID,
                        req.body.InvoiceHash,
                        req.body.EventFor,
                        req.body.Event,
                        req.body.InitBy,
                        req.body.EventStatus,
                        req.body.EventInitDate,
                        req.body.EventComments
                    );
                    console.log("InvoiceWorkflow has been created");
                    return res.status(200).send("Submited");
                } catch (error) {
                    console.error(`Failed to evaluate transaction: ${error}`);
                    return res.status(400).json({
                        error: `Failed to evaluate transaction: ${error.message}`,
                    });
                }
            });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    }
);
//Update Invoice Workflow
app.post(
    "/api/update-invoice-workflow",
    [
        check("InvoiceID", "InvoiceID is required!").not().isEmpty(),
        check("Version", "Version is required!").not().isEmpty(),
        check("WorkflowID", "WorkflowID is required!").not().isEmpty(),
        check("InvoiceHash", "InvoiceHash is required!").not().isEmpty(),
        check("EventFor", "EventFor is required!").not().isEmpty(),
        check("Event", "Event is required!").not().isEmpty(),
        check("InitBy", "InitBy is required!").not().isEmpty(),
        check("EventStatus", "EventStatus is required!").not().isEmpty(),
        check("EventInitDate", "EventInitDate is required!").not().isEmpty(),
        check("EventComments", "EventComments is required!").not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        console.log("Update Invoice Workflow Endpoint Hit!");
        let invoiceID = `${req.body.InvoiceID}-${req.body.Version}`;
        try {
            loadNetwork("invoice", "invoiceWorkflow").then(async (contract) => {
                try {
                    await contract.submitTransaction(
                        "UpdateInvoiceWorkflow",
                        invoiceID,
                        req.body.WorkflowID,
                        req.body.InvoiceHash,
                        req.body.EventFor,
                        req.body.Event,
                        req.body.InitBy,
                        req.body.EventStatus,
                        req.body.EventInitDate,
                        req.body.EventComments
                    );
                    console.log(
                        "InvoiceWorkflow has been updated for event: " +
                            req.body.Event +
                            " with status: " +
                            req.body.EventStatus
                    );
                    return res.status(200).send("Updated");
                } catch (error) {
                    console.error(`Failed to evaluate transaction: ${error}`);
                    return res.status(400).json({
                        error: `Failed to evaluate transaction: ${error.message}`,
                    });
                }
            });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    }
);

//------------------Payment API Endpoints------------------

//Query All Payments
app.get("/api/payments", async (req, res) => {
    try {
        loadNetwork("invoice", "payment").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "QueryAllPayments"
                );
                let data = JSON.parse(result.toString());
                return res.status(200).send(data);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
        //
    }
});

//Query Single Payment
app.get("/api/query-payment/:invoice_id?", async (req, res) => {
    if (
        req.params.invoice_id == null ||
        req.params.invoice_id.trim().length <= 0
    ) {
        return res.status(400).json({ error: "Payment ID is required!" });
    }
    try {
        loadNetwork("invoice", "payment").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "QueryPayment",
                    req.params.invoice_id
                );
                console.log(
                    `Transaction has been evaluated, result is: ${result}`
                );
                let data = JSON.parse(result.toString());
                return res.status(200).send(data);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
    }
});

//Query Payment History
app.get("/api/payment-history/:invoice_id?", async (req, res) => {
    if (
        req.params.invoice_id == null ||
        req.params.invoice_id.trim().length <= 0
    ) {
        return res.status(400).json({ error: "Invoice ID is required!" });
    }
    try {
        loadNetwork("invoice", "payment").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "GetPaymentHistory",
                    req.params.invoice_id
                );

                let data = JSON.parse(result.toString());
                return res.status(200).send(data);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
    }
});

//Make Payment
app.post(
    "/api/make-payment",
    [
        check("InvoiceID", "InvoiceID is required!").not().isEmpty(),
        check("Version", "Version is required!").not().isEmpty(),
        check("PaymentID", "PaymentID is required!").not().isEmpty(),
        check("PaidAmt", "PaidAmt is required!").not().isEmpty(),
        check("PaymentStatus", "PaymentStatus is required!").not().isEmpty(),
        check("Date", "Date is required!").not().isEmpty(),
        check("PaymentType", "PaymentType is required!").not().isEmpty(),
        check("TransactionBy", "TransactionBy is required!").not().isEmpty(),
        check("UpdatedBy", "UpdatedBy is required!").not().isEmpty(),
        check("UpdatedDate", "UpdatedDate is required!").not().isEmpty(),
        check("UpdateDetail", "UpdateDetail is required!").not().isEmpty(),
        check("BalanceDue", "BalanceDue is required!").not().isEmpty(),
        check("TenantID", "TenantID is required!").not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let invoiceID = `${req.body.InvoiceID}-${req.body.Version}`;
        try {
            loadNetwork("invoice", "payment").then(async (contract) => {
                try {
                    const payInvoice = await contract.submitTransaction(
                        "MakePayment",
                        req.body.PaymentID,
                        invoiceID,
                        req.body.PaidAmt,
                        req.body.PaymentStatus,
                        req.body.Date,
                        req.body.PaymentType,
                        req.body.TransactionBy,
                        req.body.UpdatedBy,
                        req.body.UpdatedDate,
                        req.body.UpdateDetail,
                        req.body.BalanceDue,
                        req.body.TenantID
                    );
                    if (payInvoice) {
                        try {
                            loadNetwork("invoice", "invoice").then(
                                async (contract) => {
                                    try {
                                        await contract.submitTransaction(
                                            "UpdateBalance",
                                            invoiceID,
                                            req.body.BalanceDue
                                        );
                                        console.log(
                                            "Invoice balanceDue updated!"
                                        );
                                        return res
                                            .status(200)
                                            .send(
                                                "Payment Made & Invoice balanceDue updated!"
                                            );
                                    } catch (error) {
                                        console.error(
                                            `Failed to evaluate transaction: ${error}`
                                        );
                                        return res.status(400).json({
                                            error: `Failed to evaluate transaction: ${error.message}`,
                                        });
                                    }
                                }
                            );
                        } catch (error) {
                            console.error(
                                `Failed to evaluate transaction: ${error}`
                            );
                            return res.status(400).json({
                                error: `Failed to evaluate transaction: ${error.message}`,
                            });
                        }
                    } else {
                        return res
                            .status(400)
                            .json({ error: "Invoice not paid!" });
                    }
                } catch (error) {
                    console.error(`Failed to evaluate transaction: ${error}`);
                    return res.status(400).json({
                        error: `Failed to evaluate transaction: ${error.message}`,
                    });
                }
            });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    }
);

//Update Existing Payment
app.post(
    "/api/update-payment",
    [
        check("InvoiceID", "InvoiceID is required!").not().isEmpty(),
        check("Version", "Version is required!").not().isEmpty(),
        check("PaymentID", "PaymentID is required!").not().isEmpty(),
        check("PaidAmt", "PaidAmt is required!").not().isEmpty(),
        check("PaymentStatus", "PaymentStatus is required!").not().isEmpty(),
        check("PaymentType", "PaymentType is required!").not().isEmpty(),
        check("TransactionBy", "TransactionBy is required!").not().isEmpty(),
        check("UpdatedBy", "UpdatedBy is required!").not().isEmpty(),
        check("UpdatedDate", "UpdatedDate is required!").not().isEmpty(),
        check("UpdateDetail", "UpdateDetail is required!").not().isEmpty(),
        check("BalanceDue", "BalanceDue is required!").not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let invoiceID = `${req.body.InvoiceID}-${req.body.Version}`;
        try {
            loadNetwork("invoice", "payment").then(async (contract) => {
                try {
                    const payInvoice = await contract.submitTransaction(
                        "UpdatePayment",
                        req.body.PaymentID,
                        invoiceID,
                        req.body.PaidAmt,
                        req.body.PaymentStatus,
                        req.body.PaymentType,
                        req.body.TransactionBy,
                        req.body.UpdatedBy,
                        req.body.UpdatedDate,
                        req.body.UpdateDetail,
                        req.body.BalanceDue
                    );
                    if (payInvoice) {
                        try {
                            loadNetwork("invoice", "invoice").then(
                                async (contract) => {
                                    try {
                                        await contract.submitTransaction(
                                            "UpdateBalance",
                                            invoiceID,
                                            req.body.BalanceDue
                                        );
                                        console.log(
                                            "Invoice Balance Due updated!"
                                        );
                                        return res
                                            .status(200)
                                            .send(
                                                "Payment & Invoice Balance Due updated!"
                                            );
                                    } catch (error) {
                                        console.error(
                                            `Failed to submit transaction: ${error}`
                                        );
                                        return res.status(400).json({
                                            error: `Failed to submit transaction: ${error.message}`,
                                        });
                                    }
                                }
                            );
                        } catch (error) {
                            console.error(`Blockchain network error: ${error}`);
                            return res.status(400).json({
                                error: `Blockchain network error: ${error.message}`,
                            });
                        }
                    } else {
                        return res
                            .status(400)
                            .json({ error: "Payment Updation Failed!" });
                    }
                } catch (error) {
                    console.error(`Failed to evaluate transaction: ${error}`);
                    return res.status(400).json({
                        error: `Failed to evaluate transaction: ${error.message}`,
                    });
                }
            });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    }
);

// ------------------Test Function - JUST IGNORE------------------

//Get Invoice
// app.post("/api/invoice-payment", async (req, res) => {
//     try {
//         loadNetwork("invoice", "payment").then(async (contract) => {
//             await contract.evaluateTransaction(
//                 "getInvoice",
//                 req.body.InvoiceID
//             );
//             console.log("Transaction has been updated");
//             // console.log(contract);
//             // var data = JSON.parse(contract.toString());
//             let temp = [];
//             // contract.forEach((e) => {
//             //     console.log("Element: ", e);
//             //     console.log(
//             //         "---------------------------------------------------------"
//             //     );
//             // });
//             console.log(contract.discoveryService);
//             res.send(contract.discoveryService);
//         });
//     } catch (error) {
//         return res.status(400).json({ error: error });
//     }
// });

//Starting Server...
const server = http.createServer(app);
const port = 9910;
server.listen(port);
console.debug("Blockchain server listening on port " + port);