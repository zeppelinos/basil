'use strict';

const abi = require('ethereumjs-abi')
import assertRevert from './helpers/assertRevert'

const Basil = artifacts.require('Basil')
const BasilTestUpgrade = artifacts.require('BasilTestUpgrade.sol')
const Registry = artifacts.require('zos-core/contracts/Registry.sol')
const Factory = artifacts.require('zos-core/contracts/Factory.sol')
const OwnedUpgradeabilityProxy = artifacts.require('zos-core/contracts/upgradeability/OwnedUpgradeabilityProxy.sol')

contract('Basil', ([_, proxyOwner, owner, aWallet, someone, anotherone]) => {

  let registry;
  let factory;
  let proxy;
  let basil;
  let basil_v1;

  beforeEach(async function () {

    // Deploy the upgradeability wrappers.
    registry = await Registry.new()
    factory = await Factory.new(registry.address)
    
    // Deploy first implementation and upload it to the registry.
    const behavior = await Basil.new()
    registry.addVersion('0', behavior.address)

    // Create the proxy with the first implementation, and execute 
    // the implementation's initialize function.
    const methodId = abi.methodID('initialize', ['address']).toString('hex');
    const params = abi.rawEncode(['address'], [owner]).toString('hex');
    const initializeData = '0x' + methodId + params;
    const proxyData = await factory.createProxyAndCall('0', initializeData, { from: proxyOwner })
    const proxyAddress = proxyData.logs[0].args.proxy;
    proxy = OwnedUpgradeabilityProxy.at(proxyAddress);
    basil = Basil.at(proxyAddress)
  })

  describe('zos-core usage', function () {

    it('sets the right upgradeability owner', async function () {
      const upgradeabilityOwner = await basil.upgradeabilityOwner();
      assert.equal(upgradeabilityOwner, proxyOwner);
    })

    it('initializes the basil', async function () {
      const init = await basil.initialized();
      const basilOwner = await basil.owner();
      assert.equal(init, true);
      assert.equal(basilOwner, owner);
    })

    it('can update the basil', async function() {

      // Deploy the new behavior and register it.
      const behavior = await BasilTestUpgrade.new();
      registry.addVersion('1', behavior.address);

      // Signal the proxy to upgrade to the new version.
      await proxy.upgradeTo('1', {from: proxyOwner});
      assert.equal(await proxy.version(), '1');
      assert.equal(await proxy.implementation(), behavior.address);

      // Test the new version's features.
      basil_v1 = await BasilTestUpgrade.at(proxy.address);
      const msg = await basil_v1.sayHi();
      assert.equal(msg, "Hi!");
    })

    it('sets the right registry', async function () {
      const reg = await basil.registry();
      assert.equal(reg, registry.address);
    })
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
          await assertRevert(basil.donate(R, G, B, { from: donor, value: firstDonation }))
        })
      })

      describe('when the donation is greater than zero', function () {
        const firstDonation = 2

        describe('when the given R value are invalid', function () {
          const R = 256
          const G = 5
          const B = 5

          it('reverts', async function () {
            await assertRevert(basil.donate(R, G, B, { from: donor, value: firstDonation }))
          })
        })

        describe('when the given G value are invalid', function () {
          const R = 5
          const G = 256
          const B = 5

          it('reverts', async function () {
            await assertRevert(basil.donate(R, G, B, { from: donor, value: firstDonation }))
          })
        })

        describe('when the given B value are invalid', function () {
          const R = 5
          const G = 5
          const B = 256

          it('reverts', async function () {
            await assertRevert(basil.donate(R, G, B, { from: donor, value: firstDonation }))
          })
        })

        describe('when the given RGB values are valid', function () {
          const R = 5
          const G = 5
          const B = 5

          it('becomes the highest donation', async function () {
            await basil.donate(R, G, B, { from: donor, value: firstDonation })

            const r = await basil.r()
            assert(r.eq(R))

            const g = await basil.g()
            assert(g.eq(G))

            const b = await basil.b()
            assert(b.eq(B))

            const highestDonation = await basil.highestDonation()
            assert(highestDonation.eq(firstDonation))
          })

          it('emits a new donation event', async function () {
            const { logs } = await basil.donate(R, G, B, { from: donor, value: firstDonation })

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
        await basil.donate(10, 10, 10, { from: donor, value: firstDonation })
      })

      describe('when another donor appears', function () {
        const anotherDonor = anotherone

        describe('when the new donation is less than the previous one', function () {
          const secondDonation = 1

          it('reverts', async function () {
            await assertRevert(basil.sendTransaction({ from: anotherDonor, value: secondDonation }))
          })
        })

        describe('when the new donation is equal to the previous one', function () {
          const secondDonation = 2

          it('reverts', async function () {
            await assertRevert(basil.sendTransaction({ from: anotherDonor, value: secondDonation }))
          })
        })

        describe('when the new donation is greater than the previous one', function () {
          const secondDonation = 3


          describe('when the given R value are invalid', function () {
            const R = 256
            const G = 5
            const B = 5

            it('reverts', async function () {
              await assertRevert(basil.donate(R, G, B, { from: anotherDonor, value: secondDonation }))
            })
          })

          describe('when the given G value are invalid', function () {
            const R = 5
            const G = 256
            const B = 5

            it('reverts', async function () {
              await assertRevert(basil.donate(R, G, B, { from: anotherDonor, value: secondDonation }))
            })
          })

          describe('when the given B value are invalid', function () {
            const R = 5
            const G = 5
            const B = 256

            it('reverts', async function () {
              await assertRevert(basil.donate(R, G, B, { from: anotherDonor, value: secondDonation }))
            })
          })

          describe('when the given RGB values are valid', function () {
            const R = 255
            const G = 255
            const B = 255

            it('becomes the highest donation', async function () {
              await basil.donate(R, G, B, { from: anotherDonor, value: secondDonation })

              const highestDonation = await basil.highestDonation()
              assert(highestDonation.eq(secondDonation))

              const r = await basil.r()
              assert(r.eq(R))

              const g = await basil.g()
              assert(g.eq(G))

              const b = await basil.b()
              assert(b.eq(B))
            })

            it('emits a new donation event', async function () {
              const { logs } = await basil.donate(R, G, B, { from: anotherDonor, value: secondDonation })

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
        await assertRevert(basil.withdraw(wallet, { from }))
      })
    })

    describe('when there was a donation before', function () {
      const from = owner;

      describe('when the requested wallet is the zero address', function () {
        const wallet = 0x0;

        it('reverts', async function () {
          await assertRevert(basil.withdraw(wallet, { from }))
        })
      })

      describe('when the requested wallet is not the zero address', function () {
        const wallet = aWallet;

        describe('when there were no funds', function () {
          it('reverts', async function () {
            await assertRevert(basil.withdraw(wallet, { from }));
          })
        })

        describe('when there were some funds', function () {
          const donor = someone
          const donation = 999

          beforeEach(async function () {
            await basil.donate(255, 255, 255, { from: donor, value: donation })
          })

          it('transfers all the contract funds to the requested wallet', async function () {
            const previousWalletBalance = await web3.eth.getBalance(wallet)
            const previousContractBalance = await web3.eth.getBalance(basil.address)

            assert(previousContractBalance.eq(donation))
            await basil.withdraw(wallet, { from })

            const newWalletBalance = await web3.eth.getBalance(wallet)
            assert(newWalletBalance.eq(previousWalletBalance.plus(donation)))

            const newContractBalance = await web3.eth.getBalance(basil.address)
            assert(newContractBalance.eq(0))
          })
        })
      })
    })
  })
})
