const encodeCall = require('zos-lib/lib/helpers/encodeCall').default

const BasilERC721 = artifacts.require('BasilERC721');
const MintableERC721Token = artifacts.require('MintableERC721Token');

const shouldBehaveLikeBasilWithTokens = require('./BasilWithTokens.behavior.js');

contract.only('BasilERC721', ([_, owner, aWallet, someone, anotherone]) => {

  const tokenName = 'BSLToken';
  const tokenSymbol = 'BSL';

  beforeEach(async function() {

    this.basil = await BasilERC721.new();
    await this.basil.initialize(owner);

    this.token = await MintableERC721Token.new();
    // Note: truffle can't handle function overloading here, so 
    // we're using zos instead to make the call to initialize
    // wait this.token.initialize(this.basil.address, tokenName, tokenSymbol, {});
    const data = encodeCall(
      "initialize", 
      ['address', 'string', 'string'],
      [this.basil.address, tokenName, tokenSymbol]
    );
    await this.token.sendTransaction({data});
    await this.basil.setToken(this.token.address, {from: owner});
  });

  shouldBehaveLikeBasilWithTokens(owner, aWallet, someone, anotherone, tokenName, tokenSymbol);
});
