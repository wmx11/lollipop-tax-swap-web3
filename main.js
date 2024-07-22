const dotenv = require("dotenv");
const { Web3 } = require("web3");
const abi = require("./abi.json");

dotenv.config();

const web3 = new Web3({
  provider: "https://bsc-dataseed.bnbchain.org",
});

const TOKEN_ADDRESS = "0xAF4B52275C0d1a0f5b7BF9e3187120Ea30a79dD2";
const TAX_SWAP_ADDRESS = "0x90F9E45EcC8a3B158fa1FE1E8f5Cc005C7804241";
const OWNER_ADDRESS = "0xb77B8e2A7F3de960f37e1b93b9Bcc6f198EE401C";

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
  const run = async () => {
    await main();
    setTimeout(run, 1 * 60 * 60 * 1000);
  };

  run();
})();
