
require("@nomicfoundation/hardhat-toolbox");

// ce module n'est pas nécessaire à partir du moment où nous n'avons pas vérifié les smart contract dans cette Dapp.
// require("@nomicfoundation/hardhat-verify");

// Les 2 éléments ci-dessous sont requis ppour passer les variable d'environnement blockchain
const dotenv = require("dotenv");
dotenv.config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// require('@nomiclabs/hardhat-ethers');
//require("@nomiclabs/hardhat-waffle");

const { PrivateKey } = require('./secret.json');

module.exports = {
   defaultNetwork: 'core_testnet',

   networks: {
      hardhat: {
      },
      core_testnet: {
         url: 'https://rpc.test.btcs.network',
         accounts: [PrivateKey],
         chainId: 1115,
      }
   },
   solidity: {
      compilers: [
        {
           version: '0.8.24',
           settings: {
            evmVersion: 'paris',
            optimizer: {
                 enabled: true,
                 runs: 200,
              },
           },
        },
      ],
   },
   paths: {
      sources: './contracts',
      cache: './cache',
      artifacts: './artifacts',
   },
   mocha: {
      timeout: 20000,
   },
};