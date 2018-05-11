const ContractDirectory = artifacts.require('ContractDirectory');
const MintableERC721Token = artifacts.require('MintableERC721Token');

const validateAddress = require('./helpers/validateAddress.js');
const shouldBehaveLikeBasil = require('./Basil.behavior.js');
const shouldBehaveLikeBasilWithTokens = require('./BasilWithTokens.behavior.js');
const should = require('chai').should();

const { decodeLogs, Logger, AppManagerDeployer, ContractsProvider } = require('zos-lib')

contract('AppManager', ([_, owner, aWallet, someone, anotherone]) => {

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

      this.appManager = await AppManagerDeployer.call(initialVersion, txParams);
    });

    describe('package', function() {

      describe('when queried for the initial version', function() {

        it('claims to have it', async function() {
          (await this.appManager.package.hasVersion(initialVersion)).should.be.true;
        });
      });

      describe('when queried for the updated version', function() {

        it('doesnt claim to have it', async function() {
          (await this.appManager.package.hasVersion(updatedVersion)).should.be.false;
        });
      });
    });
  });

  describe('version 0.0.1', function() {

    beforeEach(async function() {

      this.appManager = await AppManagerDeployer.call(initialVersion, txParams);

      const Basil = ContractsProvider.getByName('Basil');
      await this.appManager.setImplementation(Basil, contractName);
      this.basil = await this.appManager.createProxy(Basil, contractName, 'initialize', [owner]);
    });

    describe('directory', function() {

      describe('when queried for the implementation', function() {

        it('returns a valid address', async function() {
          validateAddress(await this.appManager.directories[initialVersion].getImplementation(contractName)).should.be.true;
        });
      });
    });

    describe('implementation', function() {
      shouldBehaveLikeBasil(owner, aWallet, someone, anotherone);
    });
  });

  describe('version 0.0.2', function() {

    beforeEach(async function() {
      
      this.appManager = await AppManagerDeployer.call(initialVersion, txParams);

      const Basil = ContractsProvider.getByName('Basil');
      await this.appManager.setImplementation(Basil, contractName);
      this.basil = await this.appManager.createProxy(Basil, contractName, 'initialize', [owner]);

      const stdlib = await ContractDirectory.new(txParams);
      const tokenImplementation = await MintableERC721Token.new();
      await stdlib.setImplementation(tokenClass, tokenImplementation.address, txParams);

      await this.appManager.newVersion(updatedVersion, stdlib.address);
      const BasilERC721 = ContractsProvider.getByName('BasilERC721')
      await this.appManager.setImplementation(BasilERC721, contractName);
      await this.appManager.upgradeProxy(this.basil.address, null, contractName)
      this.basil = BasilERC721.at(this.basil.address)

      this.token = await this.appManager.createProxy(
        MintableERC721Token, 
        tokenClass,
        'initialize',
        [this.basil.address, tokenName, tokenSymbol]
      )
      await this.basil.setToken(this.token.address, txParams)
    });

    describe('implementation', function() {
      shouldBehaveLikeBasilWithTokens(owner, aWallet, someone, anotherone, tokenName, tokenSymbol);
    });
  });
});
