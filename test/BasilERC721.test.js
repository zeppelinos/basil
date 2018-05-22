const encodeCall = require('zos-lib/lib/helpers/encodeCall').default

const BasilERC721 = artifacts.require('BasilERC721');
const MintableERC721Token = artifacts.require('MintableERC721Token');

const shouldBehaveLikeBasilWithTokens = require('./BasilWithTokens.behavior.js');

contract('BasilERC721', ([_, owner, aWallet, someone, anotherone]) => {

  const tokenName = 'DonationToken';
  const tokenSymbol = 'DON';

  beforeEach(async function() {

    this.basil = await BasilERC721.new();
    await this.basil.initialize(owner);

    this.token = await MintableERC721Token.new();
    // Note: truffle can't handle function overloading here, so 
    // we're using zos instead to make the call to initialize
    // wait this.token.initialize(this.basil.address, tokenName, tokenSymbol, {});
    const callData = encodeCall(
      "initialize", 
      ['address', 'string', 'string'],
      [this.basil.address, tokenName, tokenSymbol]
    );
    await web3.eth.sendTransaction({
      from: owner,
      to: this.token.address,
      gas: 3000000,
      data: callData
    })
    await this.basil.setToken(this.token.address, {from: owner});
  });

  shouldBehaveLikeBasilWithTokens(owner, aWallet, someone, anotherone, tokenName, tokenSymbol);
});
