const BasilERC721 = artifacts.require('BasilERC721');
const MintableERC721Token = artifacts.require('MintableERC721Token');

const shouldBehaveLikeBasilWithTokens = require('./BasilWithTokens.behavior.js');

contract('BasilERC721', (accounts) => {

  beforeEach(async function() {
    this.owner = accounts[2];
    this.aWallet = accounts[3];
    this.someone = accounts[4];
    this.anotherone = accounts[5];
    this.tokenName = 'DonationToken';
    this.tokenSymbol = 'DON';
    this.basil = await BasilERC721.new();
    await this.basil.initialize(this.owner);
    this.token = await MintableERC721Token.new();
    await this.token.initialize(this.basil.address, this.tokenName, this.tokenSymbol);
    await this.basil.setToken(this.token.address, {from: this.owner});
  });

  shouldBehaveLikeBasilWithTokens();
});
