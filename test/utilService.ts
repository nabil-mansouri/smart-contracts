//must be first (mock)
import { TestHelper } from "./testHelper";
//import
import { expect } from "chai";
import "mocha";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { AppService } from "src/appService";
import { ethers } from "ethers";
import { waffle } from "hardhat";
import { DateUtils, UnitUtils } from "src/utils";
import { BigNumber } from "@ethersproject/bignumber";
import { Web3Wallet } from "src/web3/web3Wallet";

describe("UtilService", function () {
  let appService: AppService;
  let owner: SignerWithAddress, user: SignerWithAddress, user2: SignerWithAddress, user3: SignerWithAddress;
  let testHelper:TestHelper;
  before(async function () {
    Web3Wallet.enableCacheRsa = false;
    Web3Wallet.enableCachePassphrase = false;
    Web3Wallet.cacheRSA.clear()
    await TestHelper.takeSnapshot();
    testHelper = new TestHelper();
    [owner,,,,,,,,user, user2, user3] = await testHelper.signerPromise;
    const tokenContract = await testHelper.contractTokenPromise;
    const socialNameContract = await testHelper.contractSocialNamePromise(owner.address);
    const socialCampaignContract = await testHelper.contractSocialCampaignPromise(owner.address);
    const socialAdsContract = await testHelper.contractSocialAdsPromise(owner.address);
    appService = new AppService({
      signerService: testHelper.fixSigner(owner),
      web3Selector: testHelper.web3Selector,
      tokenContract,
      socialAdsContract,
      socialCampaignContract,
      socialNameContract
    });
    appService.authService.forceUser(user.address);
    appService.authService.forceProvider(waffle.provider);
  });

  after(async function(){
    Web3Wallet.enableCacheRsa = true;
    Web3Wallet.enableCachePassphrase = true;
    Web3Wallet.cacheRSA.clear()
    await TestHelper.revertSnapshot();
  })

  const sign = async (test:string) => {
    const user = await appService.authService.getUser();
    return testHelper.encodeAndSign(user.address, test);
  }

  it("Should generate same pubKey for same address", async function () {
    appService.authService.forceUser(user.address);
    const wallet = await appService.authService.getWallet();
    const pubKey = await wallet.getPublicKeyLegacy(sign);
    {
      const pubKey1 = await wallet.getPublicKeyLegacy(sign);
      const pubKey2 = await wallet.getPublicKeyLegacy(sign);
      const pubKey3 = await wallet.getPublicKeyLegacy(sign);
      expect(pubKey).equal(pubKey2);
      expect(pubKey1).equal(pubKey2);
      expect(pubKey3).equal(pubKey2);
    }
    appService.authService.forceUser(user2.address);
    {
      const pubKey1 = await wallet.getPublicKeyLegacy(sign);
      const pubKey2 = await wallet.getPublicKeyLegacy(sign);
      const pubKey3 = await wallet.getPublicKeyLegacy(sign);
      expect(pubKey1).equal(pubKey2);
      expect(pubKey3).equal(pubKey2);
      expect(pubKey3).not.equal(pubKey);
    }
    expect(Web3Wallet.cacheRSA.size).equal(0)
  });

  it("Should encrypt using user1 publicKey", async function () {
    appService.authService.forceUser(user.address);
    let wallet = await appService.authService.getWallet();
    const pubKey = await wallet.getPublicKeyLegacy(sign);
    //switch to user2 and encrypt
    appService.authService.forceUser(user2.address);
    wallet = await appService.authService.getWallet();
    const encrypted = await wallet.encryptLegacy("my secret text", pubKey);
    expect(encrypted).not.equal("my secret text")
    //switch to user1 to decrypt
    appService.authService.forceUser(user.address);
    wallet = await appService.authService.getWallet();
    const decrypt = await wallet.decryptLegacy(encrypted, sign);
    expect(decrypt).equal("my secret text")
    //switch to user3 should not decrypt
    appService.authService.forceUser(user3.address);
    wallet = await appService.authService.getWallet();
    const decryptBad = await wallet.decryptLegacy(encrypted, sign);
    expect(decryptBad).not.equal("my secret text")
    expect(Web3Wallet.cacheRSA.size).equal(0)
  })

});
