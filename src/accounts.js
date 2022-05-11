/**
 * Generate addresses from seed phrase
 * @param {*} mnemonic seed phrase
 * @param {*} count number of accounts
 * @returns Account [{address, privateKey}]
 */
function generateAddressesFromSeed(mnemonic, count) {
  const bip39 = require("bip39");
  const { hdkey } = require('ethereumjs-wallet');
  let seed = bip39.mnemonicToSeedSync(mnemonic);
  let hdwallet = hdkey.fromMasterSeed(seed);
  let wallet_hdpath = "m/44'/60'/0'/0/";
      
  let accounts = [];
  for (let i = 0; i < count; i++) {
    let wallet = hdwallet.derivePath(wallet_hdpath + i).getWallet();
    let address = "0x" + wallet.getAddress().toString("hex");
    let privateKey = wallet.getPrivateKey().toString("hex");
    accounts.push({ address: address, privateKey: privateKey });      
  }
      
  return accounts;    
}

module.exports = {
  generateAddressesFromSeed,
};