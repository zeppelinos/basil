import assertRevert from 'zos-lib/lib/helpers/assertRevert';

const should = require('chai').should();
const shouldBehaveLikeBasil = require('./Basil.behavior.js');

module.exports = function(owner, aWallet, someone, anotherone, tokenName, tokenSymbol) {

  shouldBehaveLikeBasil(owner, aWallet, someone, anotherone);

  describe('token', function() {

    it('is owned by the contract', async function() {
      (await this.token.owner()).should.be.eq(this.basil.address);
    });

    it('has the correct token name', async function() {
      (await this.token.name()).should.be.eq(tokenName);
    });

    it('has the correct token symbol', async function() {
      (await this.token.symbol()).should.be.eq(tokenSymbol);
    });

    it('is the token set in the donations contract', async function() {
      (await this.basil.token()).should.be.eq(this.token.address);
    });

  });

  describe('donate', function() {

    describe('when receiving a donation that is greater than zero', function() {

      beforeEach(async function() {
        this.donationValue = 1;
        this.donation = {from: someone, value: web3.toWei(this.donationValue, 'ether')};
        await this.basil.donate(5, 5, 5, this.donation);
      });

      it('increments token id', async function() {
        (await this.basil.numEmittedTokens()).toNumber().should.be.eq(this.donationValue);
      });

      it('mints tokens', async function() {
        (await this.token.balanceOf(someone)).toNumber().should.be.eq(this.donationValue);
      });

    });

  });
}
