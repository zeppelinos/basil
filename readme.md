## Zeppelin Basil

This is a sample Dapp built on top of *ZOS* (ZeppelinOS). It presents a basic contract `Basil.sol` and then uses an `AppManager` from ZOS to upgrade the contract to `BasilERC721.sol` using a proxy that preserves the original contract's state, while mutating its logic. The upgraded contract also makes use of ZOS' on-chain standard library, connecting to a proxy of the `MintableERC721Token` implementation of the `openzeppelin-zos` release.

As for functionality, the Dapp allows users to change the light color of a Basil plant, using an Arduino and an RGB wifi light bulb. The upgraded contract also emits an ERC721 non fungible token to the user.

Please see [docs.zeppelinos.org](https://docs.zeppelinos.org/docs/basil.html) for information.

### Running the app locally

```
npm install && npx truffle compile && npm start
```

This will start a dev sever at `localhost:3000`. The application will connect to the ropsten network and link to a deployed version of `Basil.sol`. Make sure you're running metamask, that it is unlocked and pointing to the ropsten network.

### Running the app locally, on the development network

Same as "Running the spp locally" but modify `ACTIVE_NETWORK` in `src/js/constants.js` to `config.networks.development`.

Then start `ganache-cli --deterministic` and run `npm run deploy`. This will run the contracts deployment script on the local network. If you have problems with an account not being recognized, change the used account address in `package.json`'s deploy script.
