"use strict";

const ERC721Token = artifacts.require('ERC721Token');
const BasilERC721 = artifacts.require('BasilERC721');

import Deployer from 'kernel/deploy/objects/Deployer';
import shouldBehaveLikeBasil from './Basil.test';

const ZOS_ADDRESS = "0x212fbf392206bca0a478b9ed3253b08559b35903";
const ZEPPELIN_VERSION = '1.8.0';
const ZEPPELIN_DISTRO = 'ZeppelinOS';
const ERC721_NAME = 'ERC721Token';

contract('BasilERC721', (accounts) => {

  const owner = accounts[2];

  describe.only('implementation', function() {

    shouldBehaveLikeBasil(BasilERC721, accounts);

    beforeEach(async function () {

      // Deploy BasilERC721 implementation.
      this.basil = await BasilERC721.new();
      await this.basil.initialize(owner);

      // Get a proxy for ZOS' ERC721Token implementation.
      const controller = await Deployer.projectController(owner, 'TheBasil', ZOS_ADDRESS);
      const erc721Proxy = await Deployer.createProxy(
        controller,
        owner,
        ERC721Token,
        ERC721_NAME,
        ZEPPELIN_DISTRO,
        ZEPPELIN_VERSION
      );

      // Set the token in Basil.
      await this.basil.setToken(erc721Proxy.address);
    });

    it('should properly have its ERC721Token set', async function() {
      const token = await this.basil.token();
      assert.notEqual(token, 0x0);
    });
  });
});
