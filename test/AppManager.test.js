const OwnedUpgradeabilityProxy = artifacts.require('zos-lib/contracts/upgradeability/OwnedUpgradeabilityProxy.sol');
const UpgradeabilityProxyFactory = artifacts.require('UpgradeabilityProxyFactory');
const Package = artifacts.require('Package');
const AppDirectory = artifacts.require('AppDirectory');
const ContractDirectory = artifacts.require('ContractDirectory');
const AppManager = artifacts.require('PackagedAppManager');
const MintableERC721Token = artifacts.require('MintableERC721Token');

const Basil = artifacts.require('Basil');
const BasilERC721 = artifacts.require('BasilERC721');

const decodeLogs = require('zos-lib').decodeLogs;
const encodeCall = require('zos-lib').encodeCall;
const validateAddress = require('./helpers/validateAddress.js');
const shouldBehaveLikeBasil = require('./Basil.behavior.js');
const shouldBehaveLikeBasilWithTokens = require('./BasilWithTokens.behavior.js');
const should = require('chai').should();

contract.only('AppManager', (accounts) => {

  before(function() {
    this.owner = accounts[2];
    this.aWallet = accounts[3];
    this.someone = accounts[4];
    this.anotherone = accounts[5];
    this.initialVersion = '0.0.1';
    this.updatedVersion = '0.0.2';
    this.contractName = "Basil";
    this.tokenClass = 'MintableERC721Token';
    this.tokenName = 'BasilToken';
    this.tokenSymbol = 'BSL';
    this.txParams = {
      from: this.owner
    };
  });

  describe('setup', function() {

    beforeEach(async function() {
      this.factory = await UpgradeabilityProxyFactory.new(this.txParams);
      this.package = await Package.new(this.txParams);
      this.directory = await AppDirectory.new(0, this.txParams);
      await this.package.addVersion(this.initialVersion, this.directory.address, this.txParams);
      this.appManager = await AppManager.new(this.package.address, this.initialVersion, this.factory.address, this.txParams);
    });

    describe('package', function() {

      describe('when queried for the initial version', function() {

        it('claims to have it', async function() {
          (await this.package.hasVersion(this.initialVersion)).should.be.true;
        });

      });

      describe('when queried for the updated version', function() {

        it('doesnt claim to have it', async function() {
          (await this.package.hasVersion(this.updatedVersion)).should.be.false;
        });

      });

    });

    describe('version 0.0.1', function() {

      beforeEach(async function() {
        const implementation = await Basil.new(this.txParams);
        await this.directory.setImplementation(this.contractName, implementation.address, this.txParams);
        const callData = encodeCall('initialize', ['address'], [this.owner]);
        const {receipt} = await this.appManager.createAndCall(this.contractName, callData, this.txParams);
        const logs = decodeLogs([receipt.logs[1]], UpgradeabilityProxyFactory, 0x0);
        const proxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy;
        this.proxy = OwnedUpgradeabilityProxy.at(proxyAddress);
        this.basil = Basil.at(proxyAddress);
      });

      describe('directory', function() {

        describe('when queried for the implementation', function() {

          it('returns a valid address', async function() {
            validateAddress(await this.directory.getImplementation(this.contractName)).should.be.true;
          });

        });
      });

      describe('implementation', function() {

        beforeEach(async function() {
          this.donations = Basil.at(this.proxy.address);
        });

        shouldBehaveLikeBasil();
      });

      describe('version 0.0.2', function() {

        beforeEach(async function() {
          this.stdlib = await ContractDirectory.new(this.txParams);
          const tokenImplementation = await MintableERC721Token.new();
          await this.stdlib.setImplementation(this.tokenClass, tokenImplementation.address, this.txParams);
          this.directory = await AppDirectory.new(this.stdlib.address, this.txParams);
          const implementation = await BasilERC721.new(this.txParams);
          await this.directory.setImplementation(this.contractName, implementation.address, this.txParams);
          await this.package.addVersion(this.updatedVersion, this.directory.address, this.txParams);
          await this.appManager.setVersion(this.updatedVersion, this.txParams);
          await this.appManager.upgradeTo(this.proxy.address, this.contractName, this.txParams);
          const callData = encodeCall(
            'initialize',
            ['address', 'string', 'string'],
            [this.proxy.address, this.tokenName, this.tokenSymbol]
          );
          const {receipt} = await this.appManager.createAndCall(this.tokenClass, callData, this.txParams);
          const logs = decodeLogs([receipt.logs[1]], UpgradeabilityProxyFactory, 0x0);
          const proxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy;
          this.tokenProxy = OwnedUpgradeabilityProxy.at(proxyAddress);
          const donations = BasilERC721.at(this.proxy.address);
          await donations.setToken(proxyAddress, this.txParams);
          this.basil = BasilERC721.at(this.proxy.address);
        });

        describe('implementation', function() {

          beforeEach(async function() {
            this.token = MintableERC721Token.at(this.tokenProxy.address);
            this.donations = BasilERC721.at(this.proxy.address);
          });

          shouldBehaveLikeBasilWithTokens();
        });

      });

    });

  });

});
