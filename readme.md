## Zeppelin Basil

### Running the app locally

```
npm install && npm start
```

This will start a dev sever at `localhost:3000`. The application will connect to the ropsten network and link to a deployed version of `Basil.sol`. Make sure you're running metamask, that it is unlocked and pointing to the ropsten network.

### Running the app locally, on the development network

Same as "Running the spp locally" but modify `ACTIVE_NETWORK` in `src/js/constants.js` to `config.networks.development`.

Then start `ganache-cli --deterministic` and run `npm run deploy`. This will run the contracts deployment script on the local network. If you have problems with an account not being recognized, change the used account address in `package.json`'s deploy script.
