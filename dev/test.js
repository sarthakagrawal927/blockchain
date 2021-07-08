const Blockchain = require("./blockchain");

const bitcoin = new Blockchain();
const bc1 = {
  chain: [
    {
      index: 1,
      timestamp: 1625740478770,
      transactions: [],
      nonce: 100,
      hash: "0",
      previousBlockHash: "0",
    },
    {
      index: 2,
      timestamp: 1625740549042,
      transactions: [],
      nonce: 10456,
      hash: "0000e27f4d52a5d17d8d3eeaf93ab037e173d09412f018bf0da085bfd72d66c3",
      previousBlockHash: "0",
    },
    {
      index: 3,
      timestamp: 1625740555741,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "7d990ce4ccbc47ceb7f65be38295db43",
          transactionId: "17b9cc73fa164ac0a41f2ec7186a4263",
        },
      ],
      nonce: 83015,
      hash: "000079aa517ec8a72e3bba56e5cc22da1d1c52fbd2470823559ffac35bd8aa5c",
      previousBlockHash:
        "0000e27f4d52a5d17d8d3eeaf93ab037e173d09412f018bf0da085bfd72d66c3",
    },
    {
      index: 4,
      timestamp: 1625740560444,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "7d990ce4ccbc47ceb7f65be38295db43",
          transactionId: "c03405b5e6a44d09b53111762dc09439",
        },
      ],
      nonce: 6005,
      hash: "00003bff7c066d6eb9db7607dabce3a6025e25d122ea125cf2183da90afa5a69",
      previousBlockHash:
        "000079aa517ec8a72e3bba56e5cc22da1d1c52fbd2470823559ffac35bd8aa5c",
    },
    {
      index: 5,
      timestamp: 1625740603365,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "7d990ce4ccbc47ceb7f65be38295db43",
          transactionId: "b39a381ef3c041279fc97816aa0dd791",
        },
        {
          amount: 3,
          sender: "ale213123dasx",
          recipient: "saradasdasdhak",
          transactionId: "596fc1dc82b848a687266e868966f10d",
        },
        {
          amount: 32,
          sender: "ale213123dasx",
          recipient: "saradasdasdhak",
          transactionId: "893aad7486b440b994aa63478945832d",
        },
      ],
      nonce: 1622,
      hash: "00005794247e3eb53a5fc88b744dbaece45e168f8458f379edaddd7a608df483",
      previousBlockHash:
        "00003bff7c066d6eb9db7607dabce3a6025e25d122ea125cf2183da90afa5a69",
    },
    {
      index: 6,
      timestamp: 1625740612178,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "7d990ce4ccbc47ceb7f65be38295db43",
          transactionId: "4aa087ed8daf49b791cb5a868a8adb7f",
        },
      ],
      nonce: 18785,
      hash: "00000bf0f3c02edd8195319a9b701ccad8bdb9dbdb8aa423b4b6d0c21aef9f14",
      previousBlockHash:
        "00005794247e3eb53a5fc88b744dbaece45e168f8458f379edaddd7a608df483",
    },
    {
      index: 7,
      timestamp: 1625740612643,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "7d990ce4ccbc47ceb7f65be38295db43",
          transactionId: "b25422639566481a8d1d9dfa944afd17",
        },
      ],
      nonce: 12098,
      hash: "000089c6316f2f929417fa9b3d60474afb09ca6881c7a8a98f879d71a35d4461",
      previousBlockHash:
        "00000bf0f3c02edd8195319a9b701ccad8bdb9dbdb8aa423b4b6d0c21aef9f14",
    },
  ],
  pendingTransactions: [
    {
      amount: 12.5,
      sender: "00",
      recipient: "7d990ce4ccbc47ceb7f65be38295db43",
      transactionId: "f7e7f12306a54be5bd0d3d5496fb4043",
    },
  ],
  currentNodeUrl: "http://localhost:3001",
  networkNodes: [],
};

console.log(bitcoin.chainIsValid(bc1.chain));
