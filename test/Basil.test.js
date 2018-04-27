const Basil = artifacts.require('Basil');
const shouldBehaveLikeBasil = require('./Basil.behavior.js');

contract.only('Basil', (accounts) => {

  beforeEach(async function() {
    this.owner = accounts[2];
    this.aWallet = accounts[3];
    this.someone = accounts[4];
    this.anotherone = accounts[5];
    this.basil = await Basil.new();
    await this.basil.initialize(this.owner);
  });

  shouldBehaveLikeBasil();
});

