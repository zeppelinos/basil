const Basil = artifacts.require('Basil');
const shouldBehaveLikeBasil = require('./Basil.behavior.js');

contract('Basil', ([_, owner, aWallet, someone, anotherone]) => {

  beforeEach(async function() {
    this.basil = await Basil.new();
    await this.basil.initialize(owner);
  });

  shouldBehaveLikeBasil(owner, aWallet, someone, anotherone);
});
