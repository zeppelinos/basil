const ImplementationDirectory = artifacts.require('ImplementationDirectory');
const MintableERC721Token = artifacts.require('MintableERC721Token');

const validateAddress = require('./helpers/validateAddress.js');
const shouldBehaveLikeBasil = require('./Basil.behavior.js');
const shouldBehaveLikeBasilWithTokens = require('./BasilWithTokens.behavior.js');
const should = require('chai').should();

const { decodeLogs, Logger, App, AppDeployer, Contracts } = require('zos-lib')

contract.only('App', ([_, owner, aWallet, someone, anotherone]) => {

  const initialVersion = '0.0.1';
  const updatedVersion = '0.0.2';
  const contractName = "Basil";
  const tokenClass = 'MintableERC721Token';
  const tokenName = 'BasilToken';
  const tokenSymbol = 'BSL';
  const txParams = {
    from: owner
  };

  describe('setup', function() {

    beforeEach(async function() {
      this.app = await App.deploy(initialVersion, 0x0, txParams);
    });

    describe('package', function() {

      describe('when queried for the initial version', function() {

        it('claims to have it', async function() {
          (await this.app.package.hasVersion(initialVersion)).should.be.true;
        });
      });

      describe('when queried for the updated version', function() {

        it('doesnt claim to have it', async function() {
          (await this.app.package.hasVersion(updatedVersion)).should.be.false;
        });
      });
    });
  });

  describe('version 0.0.1', function() {

    beforeEach(async function() {
      this.app = await App.deploy(initialVersion, 0x0, txParams);
      const Basil = Contracts.getFromLocal('Basil');
      await this.app.setImplementation(Basil, contractName);
      this.basil = await this.app.createProxy(Basil, contractName, 'initialize', [owner]);
    });

    describe('directory', function() {

      describe('when queried for the implementation', function() {

        it('returns a valid address', async function() {
          validateAddress(await this.app.directories[initialVersion].getImplementation(contractName)).should.be.true;
        });
      });
    });

    describe('implementation', function() {
      shouldBehaveLikeBasil(owner, aWallet, someone, anotherone);
    });
  });

  describe.only('version 0.0.2', function() {

    beforeEach(async function() {

      this.app = await App.deploy(initialVersion, 0x0, txParams);
      const Basil = Contracts.getFromLocal('Basil');
      await this.app.setImplementation(Basil, contractName);
      this.basil = await this.app.createProxy(Basil, contractName, 'initialize', [owner]);

      const stdlib = await ImplementationDirectory.new(txParams);
      const tokenImplementation = await MintableERC721Token.new();
      await stdlib.setImplementation(tokenClass, tokenImplementation.address, txParams);

      await this.app.newVersion(updatedVersion, stdlib.address);
      this.token = await this.app.createProxy(
        MintableERC721Token, 
        tokenClass,
        'initialize',
        [this.basil.address, tokenName, tokenSymbol]
      )
      console.log('> ', this.token.address)

      const BasilERC721 = Contracts.getFromLocal('BasilERC721')
      await this.app.setImplementation(BasilERC721, contractName);
      await this.app.upgradeProxy(this.basil.address, BasilERC721, contractName, 'initialize', [owner, this.token.address])
      this.basil = BasilERC721.at(this.basil.address)
    });

    describe('implementation', function() {
      shouldBehaveLikeBasilWithTokens(owner, aWallet, someone, anotherone, tokenName, tokenSymbol);
    });
  });
});
