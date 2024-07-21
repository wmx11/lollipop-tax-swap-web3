const dotenv = require("dotenv");
const { Web3 } = require("web3");
const abi = require("./abi.json");

dotenv.config();

const web3 = new Web3({
  provider: "https://bsc-testnet-dataseed.bnbchain.org",
});

const TOKEN_ADDRESS = "0xcCb181807bb845FE2ca80828069A5f529202Aea9";
const TAX_SWAP_ADDRESS = "0x9B251326E4c3534185DCcD2C49Ee88e6503d7557";
const OWNER_ADDRESS = "0xb3A7Ab89c3a0e209b45338f1eCe30Dc246C0c4c0";

const token = new web3.eth.Contract(abi, TOKEN_ADDRESS);
const taxSwap = new web3.eth.Contract(abi, TAX_SWAP_ADDRESS);

const main = async () => {
  const balance = await token.methods.balanceOf(TAX_SWAP_ADDRESS).call();

  if (!balance) {
    console.log("No balance found. Sleeping.");
    return false;
  }

  const distributeFeesMethod = taxSwap.methods.distributeFees();
  const gas = await distributeFeesMethod.estimateGas({ from: OWNER_ADDRESS });
  const gasPrice = await web3.eth.getGasPrice();

  const tx = {
    from: OWNER_ADDRESS,
    to: TAX_SWAP_ADDRESS,
    data: distributeFeesMethod.encodeABI(),
    gas,
    gasPrice,
  };

  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    process.env.ACCOUNT
  );

  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log("Distribute fees called. Sleeping.");
  return receipt;
};

(async () => {
  await main();
})();
