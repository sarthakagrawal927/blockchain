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

Blockchain.prototype.chainIsValid = function (blockchain) {
  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const prevBlock = blockchain[i - 1];
    const blockHash = this.hashBlock(
      prevBlock.hash,
      {
        transactions: currentBlock.transactions,
        index: currentBlock.index,
      },
      currentBlock.nonce,
    );
    // console.log(i, blockHash);
    // if (blockHash.substr(0, 4) !== "0000") {
    //   console.log("inisde hashcheck");
    //   return false;
    // }
    if (currentBlock["previousBlockHash"] !== prevBlock["hash"]) return false;
  }

  const genesisBlock = blockchain[0];
  const correctNonce = genesisBlock.nonce === 100;
  const correctHash = genesisBlock.hash === "0";
  const correctPreviousHashBlock = genesisBlock.previousBlockHash === "0";
  const correctTransactions = genesisBlock.transactions.length === 0;
  return (
    correctNonce &&
    correctHash &&
    correctPreviousHashBlock &&
    correctTransactions
  );
};

Blockchain.prototype.getBlock = function (blockHash) {
  let correctBlock = null;
  this.chain.forEach((block) => {
    if (block.hash === blockHash) correctBlock = block;
  });

  return correctBlock;
};

Blockchain.prototype.getTransaction = function (transactionId) {
  let correctTransaction = null;
  let correctBlock = null;

  this.chain.forEach((block) => {
    block.transactions.forEach((transaction) => {
      if (transaction.transactionId === transactionId) {
        correctTransaction = transaction;
        correctBlock = block;
      }
    });
  });
  return {
    transaction: correctTransaction,
    block: correctBlock,
  };
};

Blockchain.prototype.getAddress = function (address) {
  let addressTransactions = [];
  this.chain.forEach((block) => {
    block.transactions.forEach((transaction) => {
      if (transaction.recipient === address || transaction.sender === address) {
        addressTransactions.push(transaction);
      }
    });
  });

  let balance = 0;
  addressTransactions.forEach((transaction) => {
    if (transaction.recipient === address) balance += transaction.amount;
    else balance -= transaction.amount;
  });

  return { addressBalance: balance, addressTransactions };
};

module.exports = Blockchain;
