# Zeppelin Basil _(basil)_

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> Sample Dapp built on top of ZeppelinOS

This project presents a basic contract `Basil.sol` and then uses `zos` to upgrade the contract to `BasilERC721.sol` using a proxy that preserves the original contract's state, while mutating its logic. The upgraded contract also makes use of ZeppelinOS' on-chain standard library, connecting to a proxy of the `MintableERC721Token` implementation of the `openzeppelin-zos` release.

As for functionality, the Dapp allows users to change the light color of a Basil plant, using an Arduino and an RGB wifi light bulb. The upgraded contract also emits an ERC721 non fungible token to the user.

Please see [docs.zeppelinos.org](https://docs.zeppelinos.org/docs/basil.html) for information.

## Install

To execute the app locally, run:

```
npm install && npx truffle compile && npm start
```

This will start a dev sever at `localhost:3000`. The application will connect to the ropsten network and link to a deployed version of Basil.

## Usage

Install the MetaMask extension on your browser and open `localhost:3000`. Make sure that your account is unlocked and pointing to the ropsten network.

## Develop

To execute the app locally on the development network, first set the value of `ACTIVE_NETWORK` in `src/js/constants.js` to `config.networks.development`.

Then, run the same commands from the install section.

Next, start the ganache personal blockchain with:

```
ganache-cli --deterministic
```

Finally, deploy the contracts to this blockchain running:

```
npm run deploy
```

If you have problems with an account not being recognized, change the used account address in `package.json`'s deploy script.
