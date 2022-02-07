const solc = require("solc");
const fs = require("fs");
const Web3 = require("web3");

let web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));

let fileContent = fs.readFileSync("demo.sol").toString();
// console.log(fileContent);

var input = {
  language: "Solidity",
  sources: {
    "demo.sol": {
      content: fileContent,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

var output = JSON.parse(solc.compile(JSON.stringify(input)));
// console.log(output);
var ABI = output.contracts["demo.sol"]["demo"].abi;
var byteCode = output.contracts["demo.sol"]["demo"].evm.bytecode.object;
// console.log({ ABI });
// console.log({ byteCode });

const contract = new web3.eth.Contract(ABI);
let defaultAccount;
web3.eth.getAccounts().then((acc) => {
  defaultAccount = acc[0];
  console.log({ defaultAccount });
  contract
    .deploy({ data: byteCode })
    .send({ from: defaultAccount, gas: 3000000 })
    .on("receipt", (receipt) => {
      console.log("-->", receipt.contractAddress);
    })
    .then((demoContract) => {
      demoContract.methods.x().call((err, data) => {
        console.log({ data });
      });
    });
});
