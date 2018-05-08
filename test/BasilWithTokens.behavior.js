import assertRevert from 'zos-lib/lib/helpers/assertRevert';

const should = require('chai').should();
const shouldBehaveLikeBasil = require('./Basil.behavior.js');

module.exports = function() {

  shouldBehaveLikeBasil();

  describe('token', function() {

    it('is owned by the contract', async function() {
      (await this.token.owner()).should.be.eq(this.basil.address);
    });

    it('has the correct token name', async function() {
      (await this.token.name()).should.be.eq(this.tokenName);
    });

    it('has the correct token symbol', async function() {
      (await this.token.symbol()).should.be.eq(this.tokenSymbol);
    });

    it('cannot be set a second time', async function() {
      await assertRevert(
        this.basil.setToken(this.token.address, {from: this.owner})
      );
    });

    it('is the token set in the donations contract', async function() {
      (await this.basil.token()).should.be.eq(this.token.address);
    });

  });

  describe('donate', function() {

    describe('when receiving a donation that is greater than zero', function() {

      beforeEach(async function() {
        this.donationValue = 1;
        this.donation = {from: this.someone, value: web3.toWei(this.donationValue, 'ether')};
        await this.basil.donate(5, 5, 5, this.donation);
      });

      it('increments token id', async function() {
        (await this.basil.numEmittedTokens()).toNumber().should.be.eq(this.donationValue);
      });

      it('mints tokens', async function() {
        (await this.token.balanceOf(this.someone)).toNumber().should.be.eq(this.donationValue);
      });

    });

  });
}
