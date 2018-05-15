## Zeppelin Basil

This is a sample Dapp built on top of *ZOS* (ZeppelinOS). It presents a basic contract `Basil.sol` and then uses an `AppManager` from ZOS to upgrade the contract to `BasilERC721.sol` using a proxy that preserves the original contract's state, while mutating its logic. The upgraded contract also makes use of ZOS' on-chain standard library, connecting to a proxy of the `MintableERC721Token` implementation of the `openzeppelin-zos` release.

As for functionality, the Dapp allows users to change the light color of a Basil plant, using an Arduino and an RGB wifi light bulb. The upgraded contract also emits an ERC721 non fungible token to the user.

Please see [docs.zeppelinos.org](https://docs.zeppelinos.org/docs/basil.html) for more information.
