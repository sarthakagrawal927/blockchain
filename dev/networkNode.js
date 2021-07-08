const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Logger = require("./lib/logger");
const { v4: uuidv4 } = require("uuid");
const BlockChain = require("./blockchain");
const fetch = require("node-fetch");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);

let bitcoin = new BlockChain();
const nodeAddress = uuidv4().split("-").join("");

app.get("/", (req, res) => {
  res.json(bitcoin);
});

app.get("/blockchain", (req, res) => {
  res.json(bitcoin);
});

app.post("/blockchain", (req, res) => {
  res.json(bitcoin);
});

app.get("/clear", (req, res) => {
  bitcoin = new BlockChain();
  res.send("success");
});

// add block

app.get("/mine", (req, res) => {
  const lastBlock = bitcoin.getLastBlock();
  let previousBlockHash = lastBlock["hash"];

  const currentBlockData = {
    transactions: bitcoin.pendingTransactions,
    index: lastBlock["index"] - 1,
  };

  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = bitcoin.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce,
  );

  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

  let miningPromises = [];
  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    miningPromises.push(
      fetch(networkNodeUrl + "/receive-new-block", {
        method: "POST",
        body: JSON.stringify(newBlock),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
  });

  Promise.all(miningPromises).then((data) => {
    fetch(bitcoin.currentNodeUrl + "/transaction/broadcast", {
      method: "POST",
      body: JSON.stringify({
        amount: 12.5,
        sender: "00",
        recipient: nodeAddress,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((data) => {
      res.json({
        note: `Block has been added to all`,
        block: newBlock,
      });
    });
  });
});

app.post("/receive-new-block", (req, res) => {
  const newBlock = req.body;
  const lastBlock = bitcoin.getLastBlock();

  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock["index"] + 1 === newBlock["index"];

  if (correctHash && correctIndex) {
    bitcoin.chain.push(newBlock);
    bitcoin.pendingTransactions = [];
    res.json({
      note: `Block has been added accepted`,
      block: newBlock,
    });
  } else {
    res.json({
      note: `new block rejected`,
      block: newBlock,
    });
  }
});

// Add transaction

app.post("/transaction", (req, res) => {
  const newTransaction = req.body;
  const blockIdx = bitcoin.addTransactionToPendingTransactiions(newTransaction);
  res.json({
    note: `Transaction will be added in ${blockIdx}`,
  });
});

// adding transaction to all nodes

app.post("/transaction/broadcast", (req, res) => {
  const { amount, sender, recipient } = req.body;
  const newTransaction = bitcoin.createNewTransaction(
    amount,
    sender,
    recipient,
  );
  bitcoin.addTransactionToPendingTransactiions(newTransaction);
  let addTransactionPromises = [];
  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    addTransactionPromises.push(
      fetch(networkNodeUrl + "/transaction", {
        method: "POST",
        body: JSON.stringify(newTransaction),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
  });

  Promise.all(addTransactionPromises).then((data) => {
    res.json({
      note: `Transaction has been added to all`,
    });
  });
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
        body: JSON.stringify({
          newNodeUrl: newNodeUrl,
        }),
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
      });
    })
    .then((data) => {
      res.json({
        note: "New node registered successfullly",
      });
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

  res.json({
    note: "new node registered successfully with node",
  });
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

  res.json({
    note: "bulk registration success",
  });
});

app.get("/consensus", (req, res) => {
  let requestPromises = [];

  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    requestPromises.push(
      fetch(networkNodeUrl + "/bitcoin", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
    );
  });
  Promise.all(requestPromises).then((blockchains) => {
    const currentChainLength = bitcoin.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTransactions = null;
    console.log(blockchains);
    blockchains.forEach((blockchain) => {
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blochchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTransactions = blockchain.pendingTransactions;
      }
    });
    if (
      !newLongestChain ||
      (newLongestChain && !bitcoin.chainIsValid(newLongestChain))
    ) {
      res.json({ note: "no need to change", chain: bitcoin.chain });
    } else if (newLongestChain && bitcoin.chainIsValid(newLongestChain)) {
      bitcoin.chain = newLongestChain;
      bitcoin.pendingTransactions = newPendingTransactions;
      res.json({ note: "changed", chain: bitcoin.chain });
    }
  });
});

const port = process.argv[2];
app.listen(port, () => {
  Logger.info(`Listening on ${port}`);
});
