import assertRevert from 'zos-lib/lib/helpers/assertRevert';

module.exports = function(owner, aWallet, someone, anotherone) {

  describe('donate', function () {

    describe('when there are no donations', function () {

      beforeEach(function() {
        this.donor = someone;
      });

      describe('when the donation is zero', function () {
        const firstDonation = 0;
        const R = 5;
        const G = 5;
        const B = 5;

        it('reverts', async function () {
          await assertRevert(this.basil.donate(R, G, B, { from: this.donor, value: firstDonation }));
        });
      });

      describe('when the donation is greater than zero', function () {
        const firstDonation = 20;

        describe('when the given R value are invalid', function () {
          const R = 256;
          const G = 5;
          const B = 5;

          it('reverts', async function () {
            await assertRevert(this.basil.donate(R, G, B, { from: this.donor, value: firstDonation }));
          });
        });

        describe('when the given G value are invalid', function () {
          const R = 5;
          const G = 256;
          const B = 5;

          it('reverts', async function () {
            await assertRevert(this.basil.donate(R, G, B, { from: this.donor, value: firstDonation }));
          });
        });

        describe('when the given B value are invalid', function () {
          const R = 5;
          const G = 5;
          const B = 256;

          it('reverts', async function () {
            await assertRevert(this.basil.donate(R, G, B, { from: this.donor, value: firstDonation }));
          });
        });

        describe('when the given RGB values are valid', function () {
          const R = 5;
          const G = 5;
          const B = 5;

          it('becomes the highest donation', async function () {
            await this.basil.donate(R, G, B, { from: this.donor, value: firstDonation });

            const r = await this.basil.r();
            assert(r.eq(R));

            const g = await this.basil.g();
            assert(g.eq(G));

            const b = await this.basil.b();
            assert(b.eq(B));

            const highestDonation = await this.basil.highestDonation();
            assert(highestDonation.eq(firstDonation));
          });

          it('emits a new donation event', async function () {
            const { logs } = await this.basil.donate(R, G, B, { from: this.donor, value: firstDonation });

            assert.equal(logs.length, 1);
            assert.equal(logs[0].event, 'NewDonation');
            assert.equal(logs[0].args.donor, this.donor);
            assert.equal(logs[0].args.value, firstDonation);
            assert.equal(logs[0].args.r, R);
            assert.equal(logs[0].args.g, G);
            assert.equal(logs[0].args.b, B);
          });
        });
      });
    });

    describe('when there was a donation before', function () {

      const firstDonation = 20;
      
      beforeEach(function() {
        this.donor = someone;
      });

      beforeEach(async function () {
        await this.basil.donate(10, 10, 10, { from: this.donor, value: firstDonation });
      });

      describe('when another donor appears', function () {

        beforeEach(function() {
          this.anotherDonor = anotherone;
        });

        describe('when the new donation is less than the previous one', function () {
          const secondDonation = 1;

          it('reverts', async function () {
            await assertRevert(this.basil.sendTransaction({ from: this.anotherDonor, value: secondDonation }));
          });
        });

        describe('when the new donation is equal to the previous one', function () {
          const secondDonation = 20;

          it('reverts', async function () {
            await assertRevert(this.basil.sendTransaction({ from: this.anotherDonor, value: secondDonation }))
          });
        });

        describe('when the new donation is greater than the previous one', function () {
          const secondDonation = 30;


          describe('when the given R value are invalid', function () {
            const R = 256;
            const G = 5;
            const B = 5;

            it('reverts', async function () {
              await assertRevert(this.basil.donate(R, G, B, { from: this.anotherDonor, value: secondDonation }));
            });
          });

          describe('when the given G value are invalid', function () {
            const R = 5;
            const G = 256;
            const B = 5;

            it('reverts', async function () {
              await assertRevert(this.basil.donate(R, G, B, { from: this.anotherDonor, value: secondDonation }));
            });
          });

          describe('when the given B value are invalid', function () {
            const R = 5;
            const G = 5;
            const B = 256;

            it('reverts', async function () {
              await assertRevert(this.basil.donate(R, G, B, { from: this.anotherDonor, value: secondDonation }));
            });
          });

          describe('when the given RGB values are valid', function () {
            const R = 255;
            const G = 255;
            const B = 255;

            it('becomes the highest donation', async function () {
              await this.basil.donate(R, G, B, { from: this.anotherDonor, value: secondDonation });

              const highestDonation = await this.basil.highestDonation();
              assert(highestDonation.eq(secondDonation));

              const r = await this.basil.r();
              assert(r.eq(R));

              const g = await this.basil.g();
              assert(g.eq(G));

              const b = await this.basil.b();
              assert(b.eq(B));
            });

            it('emits a new donation event', async function () {;
                                                                const { logs } = await this.basil.donate(R, G, B, { from: this.anotherDonor, value: secondDonation });

              assert.equal(logs.length, 1);
              assert.equal(logs[0].event, 'NewDonation');
              assert.equal(logs[0].args.donor, this.anotherDonor);
              assert.equal(logs[0].args.value, secondDonation);
              assert.equal(logs[0].args.r, R);
              assert.equal(logs[0].args.g, G);
              assert.equal(logs[0].args.b, B);
                                                                });
          });
        });
      });
    });
  });

  describe('withdraw', function () {

    describe('when the sender is not the owner', function () {

      beforeEach(function() {
        this.from = anotherone;
        this.wallet = aWallet;
      });

      it('reverts', async function () {
        await assertRevert(this.basil.withdraw(this.wallet, { from: this.from }));
      });
    });

    describe('when there was a donation before', function () {

      beforeEach(function() {
        this.from = owner;
      });

      describe('when the requested wallet is the zero address', function () {

        beforeEach(function() {
          this.wallet = 0x0;
        });

        it('reverts', async function () {
          await assertRevert(this.basil.withdraw(this.wallet, { from: this.from }));
        });
      });

      describe('when the requested wallet is not the zero address', function () {

        beforeEach(function() {
          this.wallet = aWallet;
        });

        describe('when there were no funds', function () {
          it('reverts', async function () {
            await assertRevert(this.basil.withdraw(this.wallet, { from: this.from }));
          });
        });

        describe('when there were some funds', function () {

          beforeEach(function() {
            this.donor = someone;
            this.donation = 999;
          });

          beforeEach(async function () {
            await this.basil.donate(255, 255, 255, { from: this.donor, value: this.donation });
          });

          it('transfers all the contract funds to the requested wallet', async function () {
            const previousWalletBalance = await web3.eth.getBalance(this.wallet);
            const previousContractBalance = await web3.eth.getBalance(this.basil.address);

            assert(previousContractBalance.eq(this.donation));
            await this.basil.withdraw(this.wallet, { from: this.from });

            const newWalletBalance = await web3.eth.getBalance(this.wallet);
            assert(newWalletBalance.eq(previousWalletBalance.plus(this.donation)));

            const newContractBalance = await web3.eth.getBalance(this.basil.address);
            assert(newContractBalance.eq(0));
          });
        });
      });
    });
  });
}
