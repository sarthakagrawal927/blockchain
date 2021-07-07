const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const morgan = require("morgan");
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms"),
);
const Logger = require("./lib/logger");

const { v4: uuidv4 } = require("uuid");
const nodeAddress = uuidv4().split("-").join("");

const BlockChain = require("./blockchain");
let bitcoin = new BlockChain();

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
  console.log(newBlock);
  res.json({ note: "New block success", block: newBlock });
});

// Add transaction

app.post("/transaction", (req, res) => {
  const { amount, sender, recipient } = req.body;
  const blockIdx = bitcoin.createNewTransaction(amount, sender, recipient);
  res.json({ note: `Transaction will be added in ${blockIdx}` });
});

app.listen(3000, () => {
  Logger.info("Listening on 3000");
});
