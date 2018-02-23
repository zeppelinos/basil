const abi = require('ethereumjs-abi')
import assertRevert from "./helpers/assertRevert";

const Basil_V0 = artifacts.require('Basil_V0');
const BasilProxy = artifacts.require('BasilProxy');

contract('Basil', ([_, proxyOwner, owner, aWallet, someone, anotherone]) => {
  beforeEach(async function () {
    const basil_v0 = await Basil_V0.new()
    const proxy = await BasilProxy.new({ from: proxyOwner })

    const methodId = abi.methodID('initialize', ['address']).toString('hex');
    const params = abi.rawEncode(['address'], [owner]).toString('hex');
    const initializeData = '0x' + methodId + params;

    await proxy.upgradeToAndCall('0', basil_v0.address, initializeData, { from: proxyOwner })
    this.basil = Basil_V0.at(proxy.address)
  })

  describe('donate', function () {

    describe('when there are no donations', function () {
      const donor = someone

      describe('when the donation is zero', function () {
        const firstDonation = 0
        const R = 5
        const G = 5
        const B = 5

        it('reverts', async function () {
          await assertRevert(this.basil.donate(R, G, B, { from: donor, value: firstDonation }))
        })
      })

      describe('when the donation is greater than zero', function () {
        const firstDonation = 2

        describe('when the given R value are invalid', function () {
          const R = 256
          const G = 5
          const B = 5

          it('reverts', async function () {
            await assertRevert(this.basil.donate(R, G, B, { from: donor, value: firstDonation }))
          })
        })

        describe('when the given G value are invalid', function () {
          const R = 5
          const G = 256
          const B = 5

          it('reverts', async function () {
            await assertRevert(this.basil.donate(R, G, B, { from: donor, value: firstDonation }))
          })
        })

        describe('when the given B value are invalid', function () {
          const R = 5
          const G = 5
          const B = 256

          it('reverts', async function () {
            await assertRevert(this.basil.donate(R, G, B, { from: donor, value: firstDonation }))
          })
        })

        describe('when the given RGB values are valid', function () {
          const R = 5
          const G = 5
          const B = 5

          it('becomes the highest donation', async function () {
            await this.basil.donate(R, G, B, { from: donor, value: firstDonation })

            const highestDonation = await this.basil.highestDonation()
            assert(highestDonation.eq(firstDonation))

            const r = await this.basil.r()
            assert(r.eq(R))

            const g = await this.basil.g()
            assert(g.eq(G))

            const b = await this.basil.b()
            assert(b.eq(B))
          })

          it('emits a new donation event', async function () {
            const { logs } = await this.basil.donate(R, G, B, { from: donor, value: firstDonation })

            assert.equal(logs.length, 1);
            assert.equal(logs[0].event, 'NewDonation');
            assert.equal(logs[0].args.donor, donor);
            assert.equal(logs[0].args.value, firstDonation);
            assert.equal(logs[0].args.r, R);
            assert.equal(logs[0].args.g, G);
            assert.equal(logs[0].args.b, B);
          })
        })
      })
    })

    describe('when there was a donation before', function () {
      const donor = someone
      const firstDonation = 2

      beforeEach(async function () {
        await this.basil.donate(10, 10, 10, { from: donor, value: firstDonation })
      })

      describe('when another donor appears', function () {
        const anotherDonor = anotherone

        describe('when the new donation is less than the previous one', function () {
          const secondDonation = 1

          it('reverts', async function () {
            await assertRevert(this.basil.sendTransaction({ from: anotherDonor, value: secondDonation }))
          })
        })

        describe('when the new donation is equal to the previous one', function () {
          const secondDonation = 2

          it('reverts', async function () {
            await assertRevert(this.basil.sendTransaction({ from: anotherDonor, value: secondDonation }))
          })
        })

        describe('when the new donation is greater than the previous one', function () {
          const secondDonation = 3


          describe('when the given R value are invalid', function () {
            const R = 256
            const G = 5
            const B = 5

            it('reverts', async function () {
              await assertRevert(this.basil.donate(R, G, B, { from: anotherDonor, value: secondDonation }))
            })
          })

          describe('when the given G value are invalid', function () {
            const R = 5
            const G = 256
            const B = 5

            it('reverts', async function () {
              await assertRevert(this.basil.donate(R, G, B, { from: anotherDonor, value: secondDonation }))
            })
          })

          describe('when the given B value are invalid', function () {
            const R = 5
            const G = 5
            const B = 256

            it('reverts', async function () {
              await assertRevert(this.basil.donate(R, G, B, { from: anotherDonor, value: secondDonation }))
            })
          })

          describe('when the given RGB values are valid', function () {
            const R = 255
            const G = 255
            const B = 255

            it('becomes the highest donation', async function () {
              await this.basil.donate(R, G, B, { from: anotherDonor, value: secondDonation })

              const highestDonation = await this.basil.highestDonation()
              assert(highestDonation.eq(secondDonation))

              const r = await this.basil.r()
              assert(r.eq(R))

              const g = await this.basil.g()
              assert(g.eq(G))

              const b = await this.basil.b()
              assert(b.eq(B))
            })

            it('emits a new donation event', async function () {
              const { logs } = await this.basil.donate(R, G, B, { from: anotherDonor, value: secondDonation })

              assert.equal(logs.length, 1);
              assert.equal(logs[0].event, 'NewDonation');
              assert.equal(logs[0].args.donor, anotherDonor);
              assert.equal(logs[0].args.value, secondDonation);
              assert.equal(logs[0].args.r, R);
              assert.equal(logs[0].args.g, G);
              assert.equal(logs[0].args.b, B);
            })
          })
        })
      })
    })
  })

  describe('withdraw', function () {

    describe('when the sender is not the owner', function () {
      const from = anotherone;
      const wallet = aWallet;

      it('reverts', async function () {
        await assertRevert(this.basil.withdraw(wallet, { from }))
      })
    })

    describe('when there was a donation before', function () {
      const from = owner;

      describe('when the requested wallet is the zero address', function () {
        const wallet = 0x0;

        it('reverts', async function () {
          await assertRevert(this.basil.withdraw(wallet, { from }))
        })
      })

      describe('when the requested wallet is not the zero address', function () {
        const wallet = aWallet;

        describe('when there were no funds', function () {
          it('reverts', async function () {
            await assertRevert(this.basil.withdraw(wallet, { from }));
          })
        })

        describe('when there were some funds', function () {
          const donor = someone
          const donation = 999

          beforeEach(async function () {
            await this.basil.donate(255, 255, 255, { from: donor, value: donation })
          })

          it('transfers all the contract funds to the requested wallet', async function () {
            const previousWalletBalance = await web3.eth.getBalance(wallet)
            const previousContractBalance = await web3.eth.getBalance(this.basil.address)

            assert(previousContractBalance.eq(donation))
            await this.basil.withdraw(wallet, { from })

            const newWalletBalance = await web3.eth.getBalance(wallet)
            assert(newWalletBalance.eq(previousWalletBalance.plus(donation)))

            const newContractBalance = await web3.eth.getBalance(this.basil.address)
            assert(newContractBalance.eq(0))
          })
        })
      })
    })
  })
})
