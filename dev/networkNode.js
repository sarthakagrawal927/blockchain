const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Logger = require("./lib/logger");
const { v4: uuidv4 } = require("uuid");
const BlockChain = require("./blockchain");
const fetch = require("node-fetch");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let bitcoin = new BlockChain();
const nodeAddress = uuidv4().split("-").join("");

app.get("/blockchain", (req, res) => {
  res.send(bitcoin);
});

app.get("/clear", (req, res) => {
  bitcoin = new BlockChain();
  res.send("success");
});

// add block

app.get("/mine", (req, res) => {
  const lastBlock = bitcoin.getLastBlock();
  let prevBlockHash = lastBlock["hash"];

  const currentBlockData = {
    transactions: bitcoin.pendingTransactions,
    index: lastBlock["index"] - 1,
  };

  const nonce = bitcoin.proofOfWork(prevBlockHash, currentBlockData);
  const blockHash = bitcoin.hashBlock(prevBlockHash, currentBlockData, nonce);

  // mining reward
  bitcoin.createNewTransaction(12.5, "REWARD", nodeAddress);

  const newBlock = bitcoin.createNewBlock(nonce, prevBlockHash, blockHash);
  res.json({ note: "New block success", block: newBlock });
});

// Add transaction

app.post("/transaction", (req, res) => {
  const { amount, sender, recipient } = req.body;
  const blockIdx = bitcoin.createNewTransaction(amount, sender, recipient);
  res.json({ note: `Transaction will be added in ${blockIdx}` });
});

// register the node and broadcast it to network

app.post("/register-and-broadcast-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;

  if (bitcoin.networkNodes.indexOf(newNodeUrl) === -1)
    bitcoin.networkNodes.push(newNodeUrl);

  let regNodePromises = [];

  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    regNodePromises.push(
      fetch(networkNodeUrl + "/register-node", {
        method: "POST",
        body: JSON.stringify({ newNodeUrl: newNodeUrl }),
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  Promise.all(regNodePromises)
    .then((data) => {
      return fetch(newNodeUrl + "/register-nodes-bulk", {
        method: "POST",
        body: JSON.stringify({
          allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl],
        }),
        headers: { "Content-Type": "application/json" },
      });
    })
    .then((data) => {
      res.json({ note: "New node registered successfullly" });
    });
});

// register the node to network

app.post("/register-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  if (
    bitcoin.networkNodes.indexOf(newNodeUrl) === -1 &&
    bitcoin.currentNodeUrl !== newNodeUrl
  )
    // new node url does not exist and it is not equal to currentNode
    bitcoin.networkNodes.push(newNodeUrl);

  res.json({ note: "new node registered successfully with node" });
});

// register nodes in bulk

app.post("/register-nodes-bulk", (req, res) => {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach((networkNodeUrl) => {
    if (
      bitcoin.networkNodes.indexOf(networkNodeUrl) === -1 &&
      bitcoin.currentNodeUrl !== networkNodeUrl
    )
      // new node url does not exist and it is not equal to currentNode

      bitcoin.networkNodes.push(networkNodeUrl);
  });

  res.json({ note: "bulk registration success" });
});

const port = process.argv[2];
app.listen(port, () => {
  Logger.info(`Listening on ${port}`);
});
