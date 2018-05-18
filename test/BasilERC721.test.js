const BasilERC721 = artifacts.require('BasilERC721');
const MintableERC721Token = artifacts.require('MintableERC721Token');

const shouldBehaveLikeBasilWithTokens = require('./BasilWithTokens.behavior.js');

contract('BasilERC721', ([_, owner, aWallet, someone, anotherone]) => {

  const tokenName = 'DonationToken';
  const tokenSymbol = 'DON';

  beforeEach(async function() {
    this.basil = await BasilERC721.new();
    this.token = await MintableERC721Token.new();
    await this.token.initialize(this.basil.address, tokenName, tokenSymbol);
    await this.basil.initialize(owner, this.token.address);
  });

  shouldBehaveLikeBasilWithTokens(owner, aWallet, someone, anotherone, tokenName, tokenSymbol);
});
