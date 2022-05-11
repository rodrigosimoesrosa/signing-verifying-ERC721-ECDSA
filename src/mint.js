const { generateAuthorization } = require("./ecdsa.js");
const { generateAddressesFromSeed } = require("./accounts.js");
const { getTimestamp } = require("./time/timestamp.js");
const mnemonic = require("./mnemonic.js");

/**
 * Local test
 */
console.log("Generating authorization for earn token...\n");
const accounts = generateAddressesFromSeed(mnemonic.mnemonic, 2);

accounts.forEach((account)=> {
    console.log(`ADDRESS ${account.address}`);
    console.log(`PRIVATE KEY ${account.privateKey}\n`);
});

console.log("\nPRIVATE KEYS GENERATED\n");

const TOKEN_REWARD_CONTRACT_ADDRESS = "0x345cA3e014Aaf5dcA488057592ee47305D9B3e10";
const CHAIN_ID = 1337;
const CLAIMER = accounts[1].address;

/**
 * Generate authorization
 */
function generate() {
    
    if (accounts.length > 0) {
        const firstAccount = accounts[0];
        const attributes = "0x020101010101"
        const authorizedAt = getTimestamp();
        const authorization = generateAuthorization(firstAccount, CLAIMER, attributes, authorizedAt, CHAIN_ID, TOKEN_REWARD_CONTRACT_ADDRESS);
        console.log("\nAUTHORIZER\n", firstAccount.address, "\n");
        console.log("\nCLAIMER\n", CLAIMER, "\n");
        console.log("\nATTRIBUTES\n", attributes, "\n");
        console.log("\nAUTHORIZED_AT\n", authorizedAt, "\n");
        console.log("\nCONTRACT\n", TOKEN_REWARD_CONTRACT_ADDRESS, "\n");
        console.log("\nAUTHORIZATION\n", authorization, "\n");
    }
}

generate();