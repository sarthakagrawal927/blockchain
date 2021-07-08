const sha256 = require("sha256");
const currentNodeUrl = process.argv[2];
const { v4: uuidv4 } = require("uuid");

function Blockchain() {
  this.chain = [];
  this.pendingTransactions = [];
  this.currentNodeUrl = "http://localhost:" + currentNodeUrl;
  this.networkNodes = [];
  this.createNewBlock(100, "0", "0");
}

Blockchain.prototype.createNewBlock = function (
  nonce,
  previousBlockHash,
  hash,
) {
  const newBlock = {
    index: this.chain?.length + 1,
    timestamp: Date.now(),
    transactions: this.pendingTransactions,
    nonce,
    hash, // hash current
    previousBlockHash,
  };

  this.pendingTransactions = [];
  this.chain.push(newBlock);
  return newBlock;
};

Blockchain.prototype.getLastBlock = function () {
  return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function (
  amount,
  sender,
  recipient,
) {
  const newTransaction = {
    amount,
    sender,
    recipient,
    transactionId: uuidv4().split("-").join(""),
  };
  return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransactiions = function (
  transactionObj,
) {
  this.pendingTransactions.push(transactionObj);
  return this.getLastBlock()["index"] + 1;
};

Blockchain.prototype.hashBlock = function (
  previousBlockHash,
  currentBlockData,
  nonce,
) {
  const dataAsString =
    previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
  const hash = sha256(dataAsString);
  return hash;
};

Blockchain.prototype.proofOfWork = function (
  previousBlockHash,
  currentBlockData,
) {
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  while (hash.substr(0, 4) !== "0000") {
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }
  return nonce;
};

module.exports = Blockchain;
