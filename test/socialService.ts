//must be first (mock)
import { TestHelper } from "./testHelper";
//import
import { expect } from "chai";
import "mocha";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { AppService } from "src/appService";
import { ethers, waffle } from "hardhat";
import { DateUtils, Lifecycle, PaymentType, TriState, UnitUtils } from "src/utils";
import { BigNumber } from "@ethersproject/bignumber";
import { SocialActionEnum, SocialAudiencesEnum, SocialDurationPeriodEnum, SocialNetworkEnum, SocialService } from "src/socialService";
import { Web3Wallet } from "src/web3/web3Wallet";

describe("SocialService", function () {
  let appService: AppService;
  let service: SocialService;
  let owner: SignerWithAddress, user: SignerWithAddress, user2: SignerWithAddress, user3: SignerWithAddress;
  let testHelper: TestHelper;
  before(async function () {
    Web3Wallet.enableCacheRsa = true;
    Web3Wallet.enableCachePassphrase = false;
    Web3Wallet.cacheRSA.clear()
    SocialService.signMethod = async (test: string) => {
      const user = await appService.authService.getUser();
      return testHelper.encodeAndSign(user.address, test);
    }
    await TestHelper.takeSnapshot();
    testHelper = new TestHelper();
    [owner, , , , , , , , user, user2, user3] = await testHelper.signerPromise;
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
    //service
    service = appService.socialService;
    //token
    await tokenContract.send(user.address, UnitUtils.addPrecision(1000), []);
    await tokenContract.send(user2.address, UnitUtils.addPrecision(1000), []);
  });

  after(async function () {
    expect(Web3Wallet.cacheRSA.size).gt(0)
    Web3Wallet.cacheRSA.clear()
    Web3Wallet.enableCachePassphrase = true;
    await TestHelper.revertSnapshot();
  })

  it("Should get and set social name config", async function () {
    appService.authService.forceUser(owner.address);
    let config = await service.socialNameConfig();
    expect(config.allowChangeOwner).eq(true);
    expect(config.validatorRequire).eq(true);
    expect(config.validator).eq(owner.address);
    expect(config.registration.service).eq(SocialService.REGISTRATION_SERVICE);
    config = { ...config };
    config.registration = { ...config.registration };
    config.registration.amount = UnitUtils.addPrecision(10)
    await service.setSocialNameConfig(config);
    appService.authService.forceUser(user.address);
  });

  it("Should register social name", async function () {
    const balanceBefore = await appService.tokenService.getMyTokenBalance();
    expect(+balanceBefore.balance).eq(1000)
    await service.registerName("instagram", "user1");
    const registrations = await service.getRegistrationForAddress(user.address);
    expect(registrations.length).eq(1);
    const registrationIds = await service.getRegistrationIdForLogin("instagram", "user1");
    expect(registrationIds).gt(0);
    const regExists = await service.checkIfRegistrationExists("instagram", "user1");
    expect(regExists).is.true;
    const balance = await appService.tokenService.getMyTokenBalance();
    expect(+balance.balance).eq((+balanceBefore.balance) - 10)
    expect(registrations[0].encryptName).eq("user1")
    expect(registrations[0].network).eq(SocialNetworkEnum.instagram)
    expect(registrations[0].owner).eq(user.address)
    //change user
    appService.authService.forceUser(user2.address);
    const registrationsEncrypt = await service.getRegistrationForAddress(user.address);
    expect(registrationsEncrypt[0].encryptName).not.eq("user1")
    expect(registrationsEncrypt[0].network).eq(SocialNetworkEnum.instagram)
    expect(registrationsEncrypt[0].owner).eq(user.address)
    //restore
    appService.authService.forceUser(user.address);
  });

  it("Should unregister social name", async function () {
    const balanceBefore = await appService.tokenService.getMyTokenBalance();
    expect(+balanceBefore.balance).eq(990)
    await service.unregister("instagram", "user1");
    const registrations = await service.getRegistrationForAddress(user.address);
    expect(registrations.length).eq(0);
    const registrationIds = await service.getRegistrationIdForLogin("instagram", "user1");
    expect(registrationIds).eq(0);
    const regExists = await service.checkIfRegistrationExists("instagram", "user1");
    expect(regExists).is.false;
    const balance = await appService.tokenService.getMyTokenBalance();
    expect(+balance.balance).eq((+balanceBefore.balance) + 10)
  });

  it("Should register social name another time", async function () {
    const balanceBefore = await appService.tokenService.getMyTokenBalance();
    expect(+balanceBefore.balance).eq(1000)
    await service.registerName("instagram", "user1");
    const registrations = await service.getRegistrationForAddress(user.address);
    expect(registrations.length).eq(1);
    const registrationIds = await service.getRegistrationIdForLogin("instagram", "user1");
    expect(registrationIds).gt(0);
    const regExists = await service.checkIfRegistrationExists("instagram", "user1");
    expect(regExists).is.true;
    const balance = await appService.tokenService.getMyTokenBalance();
    expect(+balance.balance).eq((+balanceBefore.balance) - 10)
  });

  it("Should update social name", async function () {
    const registrationIds = await service.getRegistrationIdForLogin("instagram", "user1");
    expect(registrationIds).gt(0);
    await service.updateRegistrationById(registrationIds, { newLogin: "user2", newNetwork: "instagram", newOwner: user.address });
    const registrationIdsAfter2 = await service.getRegistrationIdForLogin("instagram", "user2");
    expect(registrationIdsAfter2).gt(0);
    const registrationIdsAfter = await service.getRegistrationIdForLogin("instagram", "user1");
    expect(registrationIdsAfter).eq(0);
    const registrations = await service.getRegistrationForAddress(user.address);
    expect(registrations.length).eq(1);
    expect(registrations[0].encryptName).eq("user2");
    expect(registrations[0].name).not.eq("user2");
    expect(registrations[0].network).eq(SocialNetworkEnum.instagram)
    expect(registrations[0].owner).eq(user.address)
    //change user
    appService.authService.forceUser(user2.address);
    const registrationsEncrypt = await service.getRegistrationForAddress(user.address);
    expect(registrationsEncrypt[0].encryptName).not.eq("user2")
    expect(registrationsEncrypt[0].name).not.eq("user2");
    expect(registrationsEncrypt[0].network).eq(SocialNetworkEnum.instagram)
    expect(registrationsEncrypt[0].owner).eq(user.address)
    //restore
    appService.authService.forceUser(user.address);
  });

  it("Should send coin to social name", async function () {
    const balanceBefore = await appService.tokenService.getNativeTokenBalance();
    appService.authService.forceUser(owner.address);
    await service.sendCoin("instagram", "user2", 10, false)
    appService.authService.forceUser(user.address);
    const balanceAfter = await appService.tokenService.getNativeTokenBalance();
    expect(+balanceAfter.balance).eq((+balanceBefore.balance) + 10)
  });

  it("Should token to social name", async function () {
    const balanceBefore = await appService.tokenService.getMyTokenBalance();
    appService.authService.forceUser(owner.address);
    await service.sendToken("instagram", "user2", 10, appService.tokenContract.address, false)
    appService.authService.forceUser(user.address);
    const balanceAfter = await appService.tokenService.getMyTokenBalance();
    expect(+balanceAfter.balance).eq((+balanceBefore.balance) + 10)
  });

  it("Should delete social name", async function () {
    const balanceBefore = await appService.tokenService.getMyTokenBalance();
    expect(+balanceBefore.balance).eq(1000)
    appService.authService.forceUser(owner.address);
    await service.deleteRegistration("instagram", "user2");
    appService.authService.forceUser(user.address);
    const registrations = await service.getRegistrationForAddress(user.address);
    expect(registrations.length).eq(0);
    const registrationIds = await service.getRegistrationIdForLogin("instagram", "user2");
    expect(registrationIds).eq(0);
    const regExists = await service.checkIfRegistrationExists("instagram", "user2");
    expect(regExists).is.false;
    const balance = await appService.tokenService.getMyTokenBalance();
    expect(+balance.balance).eq((+balanceBefore.balance))
  });


  it("Should set social name pay fix coin", async function () {
    appService.authService.forceUser(owner.address);
    let config = await service.socialNameConfig();
    expect(config.validatorRequire).eq(true);
    expect(config.validator).eq(owner.address);
    config = { ...config };
    config.fee = { ...config.fee };
    config.fee.currency = ethers.constants.AddressZero;
    config.fee.paymentType = PaymentType.PAY
    config.fee.amount = UnitUtils.addPrecision(2)
    await service.setSocialNameConfig(config);
    appService.authService.forceUser(user.address);
  });


  it("Should send coin to social name with fixed coin fees", async function () {
    const balanceCoinBefore = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    appService.authService.forceUser(owner.address);
    await service.sendCoin("instagram", "user2", 10, true)
    appService.authService.forceUser(user.address);
    const balanceCoinAfter = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    expect(+balanceCoinAfter.balance).approximately((+balanceCoinBefore.balance) - 10 -2, 0.1);
  });

  it("Should token to social name with fixed coin fees", async function () {
    const balanceCoinBefore = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    const tokenAddr = appService.tokenContract.address;
    const balanceOwnerBefore = await appService.tokenService.getTokenBalanceFor(tokenAddr, owner.address);
    appService.authService.forceUser(owner.address);
    await service.sendToken("instagram", "user2", 10, tokenAddr, true)
    appService.authService.forceUser(user.address);
    const balanceCoinAfter = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    const balanceOwnerAfter = await appService.tokenService.getTokenBalanceFor(tokenAddr, owner.address);
    expect(+balanceOwnerAfter.balance).eq((+balanceOwnerBefore.balance) - 10);
    expect(+balanceCoinAfter.balance).approximately((+balanceCoinBefore.balance) - 2, 0.1);
  });

  it("Should set social name pay fix token", async function () {
    const tokenAddr = appService.tokenContract.address;
    appService.authService.forceUser(owner.address);
    let config = await service.socialNameConfig();
    expect(config.validatorRequire).eq(true);
    expect(config.validator).eq(owner.address);
    config = { ...config };
    config.fee = { ...config.fee };
    config.fee.currency = tokenAddr;
    config.fee.paymentType = PaymentType.PAY
    config.fee.amount = UnitUtils.addPrecision(2)
    await service.setSocialNameConfig(config);
    appService.authService.forceUser(user.address);
  });


  it("Should send coin to social name with fixed token fees", async function () {
    const tokenAddr = appService.tokenContract.address;
    const balanceOwnerBefore = await appService.tokenService.getTokenBalanceFor(tokenAddr, owner.address);
    const balanceCoinBefore = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    appService.authService.forceUser(owner.address);
    await service.sendCoin("instagram", "user2", 10, true)
    appService.authService.forceUser(user.address);
    const balanceCoinAfter = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    const balanceOwnerAfter = await appService.tokenService.getTokenBalanceFor(tokenAddr, owner.address);
    expect(+balanceCoinAfter.balance).approximately((+balanceCoinBefore.balance) - 10, 0.1);
    expect(+balanceOwnerAfter.balance).eq((+balanceOwnerBefore.balance) - 2);
  });

  it("Should token to social name with fixed token fees", async function () {
    const balanceCoinBefore = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    const tokenAddr = appService.tokenContract.address;
    const balanceOwnerBefore = await appService.tokenService.getTokenBalanceFor(tokenAddr, owner.address);
    appService.authService.forceUser(owner.address);
    await service.sendToken("instagram", "user2", 10, tokenAddr, true)
    appService.authService.forceUser(user.address);
    const balanceCoinAfter = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    const balanceOwnerAfter = await appService.tokenService.getTokenBalanceFor(tokenAddr, owner.address);
    expect(+balanceOwnerAfter.balance).eq((+balanceOwnerBefore.balance) - 12);
    expect(+balanceCoinAfter.balance).approximately((+balanceCoinBefore.balance), 0.1);
  });

  it("Should set social name pay proportionnal coin", async function () {
    appService.authService.forceUser(owner.address);
    let config = await service.socialNameConfig();
    expect(config.validatorRequire).eq(true);
    expect(config.validator).eq(owner.address);
    config = { ...config };
    config.fee = { ...config.fee };
    config.fee.currency = ethers.constants.AddressZero;
    config.fee.paymentType = PaymentType.PAY_PROPORTIONNAL
    config.fee.amount = BigNumber.from(10)
    await service.setSocialNameConfig(config);
    appService.authService.forceUser(user.address);
  });

  it("Should send coin to social name with proportionnal fees", async function () {
    const balanceCoinBefore = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    appService.authService.forceUser(owner.address);
    await service.sendCoin("instagram", "user2", 10, true)
    appService.authService.forceUser(user.address);
    const balanceCoinAfter = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    expect(+balanceCoinAfter.balance).approximately((+balanceCoinBefore.balance) - 10 -1, 0.1);
  });

  it("Should token to social name with proportionnal fees", async function () {
    const balanceCoinBefore = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    const tokenAddr = appService.tokenContract.address;
    const balanceOwnerBefore = await appService.tokenService.getTokenBalanceFor(tokenAddr, owner.address);
    appService.authService.forceUser(owner.address);
    await service.sendToken("instagram", "user2", 10, tokenAddr, true)
    appService.authService.forceUser(user.address);
    const balanceCoinAfter = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    const balanceOwnerAfter = await appService.tokenService.getTokenBalanceFor(tokenAddr, owner.address);
    expect(+balanceOwnerAfter.balance).approximately((+balanceOwnerBefore.balance) - 10 -1, 0.1);
    expect(+balanceCoinAfter.balance).approximately((+balanceCoinBefore.balance), 0.1);
  });

  it("Should cancel non claim payment", async function () {
    const tokenAddr = appService.tokenContract.address;
    const balanceCoinBefore = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    const balanceOwnerBefore = await appService.tokenService.getTokenBalanceFor(tokenAddr, owner.address);
    const listPendingSent = await appService.socialService.listPaymentSentFor(TriState.FALSE,owner.address);
    expect(listPendingSent.length).equal(6);
    appService.authService.forceUser(owner.address); 
    await service.cancelOnePayment(listPendingSent[0].id) 
    await service.cancelOnePayment(listPendingSent[1].id) 
    await service.cancelOnePayment(listPendingSent[2].id) 
    await service.cancelOnePayment(listPendingSent[3].id) 
    await service.cancelOnePayment(listPendingSent[4].id) 
    appService.authService.forceUser(user.address);
    const listPendingSentAfter = await appService.socialService.listPaymentSentFor(TriState.FALSE,owner.address);
    expect(listPendingSentAfter.length).equal(1);
    const balanceCoinAfter = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    const balanceOwnerAfter = await appService.tokenService.getTokenBalanceFor(tokenAddr, owner.address);
    //refund only values (not fees)
    expect(+balanceOwnerAfter.balance).approximately((+balanceOwnerBefore.balance) +2*10, 0.1);
    expect(+balanceCoinAfter.balance).approximately((+balanceCoinBefore.balance)+3*10, 0.2);
  });

  it("Should claim user2", async function () {
    appService.authService.forceUser(user.address);
    await service.registerName("instagram", "user2")
    const listPendingSentBefore = await appService.socialService.listPaymentReceived(TriState.FALSE);
    expect(listPendingSentBefore.length).equal(1);
    await appService.socialService.claimAllPayment("instagram", "user2")
    const listPendingSentAfter = await appService.socialService.listPaymentReceived(TriState.FALSE);
    expect(listPendingSentAfter.length).equal(0);
  });

  it("Should deposit coin secure", async function () {
    const balanceCoinBefore = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    appService.authService.forceUser(owner.address);
    await service.depositCoin(user.address, 10, true)
    appService.authService.forceUser(user.address);
    const balanceCoinAfter = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    expect(+balanceCoinAfter.balance).approximately((+balanceCoinBefore.balance) - 10, 0.1);
  });

  it("Should deposit token secure", async function () {
    const balanceCoinBefore = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    const tokenAddr = appService.tokenContract.address;
    const balanceOwnerBefore = await appService.tokenService.getTokenBalanceFor(tokenAddr, owner.address);
    appService.authService.forceUser(owner.address);
    await service.depositToken(user.address, tokenAddr, 10, true)
    appService.authService.forceUser(user.address);
    const balanceCoinAfter = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    const balanceOwnerAfter = await appService.tokenService.getTokenBalanceFor(tokenAddr, owner.address);
    expect(+balanceOwnerAfter.balance).approximately((+balanceOwnerBefore.balance) - 10, 0.1);
    expect(+balanceCoinAfter.balance).approximately((+balanceCoinBefore.balance), 0.1);
  });

  let piggy1:string, piggy2:string;
  it("Should deposit coin unsecure", async function () {
    const balanceCoinBefore = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    appService.authService.forceUser(owner.address);
    piggy1 = await service.depositCoin(undefined, 5, true)
    appService.authService.forceUser(user.address);
    const balanceCoinAfter = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    expect(+balanceCoinAfter.balance).approximately((+balanceCoinBefore.balance) - 5, 0.1);
  });

  it("Should deposit token unsecure", async function () {
    const balanceCoinBefore = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    const tokenAddr = appService.tokenContract.address;
    const balanceOwnerBefore = await appService.tokenService.getTokenBalanceFor(tokenAddr, owner.address);
    appService.authService.forceUser(owner.address);
    piggy2 = await service.depositToken(undefined, tokenAddr, 5, true)
    appService.authService.forceUser(user.address);
    const balanceCoinAfter = await appService.tokenService.getNativeTokenBalanceFor(owner.address);
    const balanceOwnerAfter = await appService.tokenService.getTokenBalanceFor(tokenAddr, owner.address);
    expect(+balanceOwnerAfter.balance).approximately((+balanceOwnerBefore.balance) - 5, 0.1);
    expect(+balanceCoinAfter.balance).approximately((+balanceCoinBefore.balance), 0.1);
  });


  it("Should claim deposit coin secure", async function () {
    appService.authService.forceUser(user.address);
    const balanceCoinBefore = await appService.tokenService.getNativeTokenBalanceFor(user.address);
    await service.claimPiggybank(ethers.constants.AddressZero)
    const balanceCoinAfter = await appService.tokenService.getNativeTokenBalanceFor(user.address);
    expect(+balanceCoinAfter.balance).approximately((+balanceCoinBefore.balance) + 10, 0.1);
  });

  it("Should claim deposit token secure", async function () {
    appService.authService.forceUser(user.address);
    const tokenAddr = appService.tokenContract.address;
    const balanceOwnerBefore = await appService.tokenService.getTokenBalanceFor(tokenAddr, user.address);
    await service.claimPiggybank(tokenAddr)
    appService.authService.forceUser(user.address);
    const balanceOwnerAfter = await appService.tokenService.getTokenBalanceFor(tokenAddr, user.address);
    expect(+balanceOwnerAfter.balance).approximately((+balanceOwnerBefore.balance) + 10, 0.1);
  });

  it("Should claim deposit coin unsecure", async function () {
    appService.authService.forceUser(user.address);
    const balanceCoinBefore = await appService.tokenService.getNativeTokenBalanceFor(user.address);
    await service.claimPiggybank(ethers.constants.AddressZero, piggy1)
    const balanceCoinAfter = await appService.tokenService.getNativeTokenBalanceFor(user.address);
    expect(+balanceCoinAfter.balance).approximately((+balanceCoinBefore.balance) + 5, 0.1);
  });

  it("Should claim deposit token unsecure", async function () {
    appService.authService.forceUser(user.address);
    const tokenAddr = appService.tokenContract.address;
    const balanceOwnerBefore = await appService.tokenService.getTokenBalanceFor(tokenAddr, user.address);
    await service.claimPiggybank(tokenAddr, piggy2)
    const balanceOwnerAfter = await appService.tokenService.getTokenBalanceFor(tokenAddr, user.address);
    expect(+balanceOwnerAfter.balance).approximately((+balanceOwnerBefore.balance) + 5, 0.1);
  });

  it("Should get and set social campaign config", async function () {
    appService.authService.forceUser(owner.address);
    let config = await service.socialCampaignConfig();
    expect(config.validatorRequire).eq(true);
    expect(config.validator).eq(owner.address);
    expect(config.campaign.service).eq(SocialService.SERVICE_CAMPAIGN);
    config = { ...config };
    config.campaign = { ...config.campaign };
    config.campaign.amount = UnitUtils.addPrecision(10)
    await service.setSocialCampaignConfig(config);
    appService.authService.forceUser(user.address);
  });

  it("Should create social campaign", async function () {
    const balanceBefore = await appService.tokenService.getMyTokenBalance();
    expect(+balanceBefore.balance).eq(1015)
    const listCampaignsBefore = await service.listCampaigns(0, 0);
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    expect(listCampaignsBefore.length).eq(0);
    expect(listMyCampaignsBefore.length).eq(0);
    const name = "CAMPAIGN NUMERO 1 LIKE 2 EARN 32";
    await service.createCampaign({
      actions: [SocialActionEnum.like],
      status: Lifecycle.LIVE,
      balance: {
        description: "DESCRIPTION",
        accBalance: 10,
        current: 10,
        pendingBalance: 10
      },
      name,
      duration: 10,
      uri: "https://facebook.com",
      durationPeriod: SocialDurationPeriodEnum.day,
      endat: DateUtils.nowSeconds() * 2,
      id: 10,
      network: SocialNetworkEnum.facebook,
      owner: owner.address,
      price: UnitUtils.addPrecision(1),
      priceCurrency: ethers.constants.AddressZero,
      startat: 1,
      pubKey: []
    });
    const listCampaignsAfter = await service.listCampaigns(0, 0);
    const listMyCampaignsAfter = await service.listMyCampaigns(0, 0);
    expect(listCampaignsAfter.length).eq(1);
    expect(listMyCampaignsAfter.length).eq(1);
    expect(listMyCampaignsAfter[0].balance.accBalance).eq(0);
    expect(listMyCampaignsAfter[0].balance.current).eq(0);
    expect(listMyCampaignsAfter[0].balance.pendingBalance).eq(0);
    expect(listMyCampaignsAfter[0].id).eq(1);
    expect(listMyCampaignsAfter[0].name).eq(name);
    expect(listMyCampaignsAfter[0].pubKey.length).gt(64);
    expect(listMyCampaignsAfter[0].owner).eq(user.address);
    expect(listMyCampaignsAfter[0].balance.description).eq("DESCRIPTION");
    const balance = await appService.tokenService.getMyTokenBalance();
    expect(+balance.balance).eq((+balanceBefore.balance) - 10)
  });


  it("Should add balance coin to social campaign", async function () {
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    expect(listMyCampaignsBefore.length).eq(1);
    expect(listMyCampaignsBefore[0].balance.accBalance).eq(0);
    expect(listMyCampaignsBefore[0].balance.current).eq(0);
    const balanceBefore = await appService.tokenService.getNativeTokenBalance();
    await service.addCampaignBalanceUsingCoin(listMyCampaignsBefore[0].id, 10);
    const listMyCampaignsAfter = await service.listMyCampaigns(0, 0);
    expect(listMyCampaignsAfter.length).eq(1);
    expect(listMyCampaignsAfter[0].balance.accBalance).eq(UnitUtils.addPrecision(10));
    expect(listMyCampaignsAfter[0].balance.current).eq(UnitUtils.addPrecision(10));
    expect(listMyCampaignsAfter[0].balance.pendingBalance).eq(0);
    const balanceAfter = await appService.tokenService.getNativeTokenBalance();
    expect(+balanceAfter.balance).approximately((+balanceBefore.balance) - 10, 0.5)
  })


  it("Should not add balance token to social campaign", async function () {
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    expect(listMyCampaignsBefore.length).eq(1);
    expect(listMyCampaignsBefore[0].balance.accBalance).eq(UnitUtils.addPrecision(10));
    expect(listMyCampaignsBefore[0].balance.current).eq(UnitUtils.addPrecision(10));
    const balanceBefore = await appService.tokenService.getNativeTokenBalance();
    const tokenContract = appService.tokenContract.address;
    await service.addCampaignBalanceUsingToken(listMyCampaignsBefore[0].id, 10, tokenContract);
    const listMyCampaignsAfter = await service.listMyCampaigns(0, 0);
    expect(listMyCampaignsAfter.length).eq(1);
    expect(listMyCampaignsAfter[0].balance.accBalance).eq(UnitUtils.addPrecision(10));
    expect(listMyCampaignsAfter[0].balance.current).eq(UnitUtils.addPrecision(10));
    expect(listMyCampaignsAfter[0].balance.pendingBalance).eq(0);
    const balanceAfter = await appService.tokenService.getNativeTokenBalance();
    expect(+balanceAfter.balance).approximately((+balanceBefore.balance), 0.5)
  })

  it("Should participate to the campaign", async function () {
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    const id = listMyCampaignsBefore[0].id;
    appService.authService.forceUser(user2.address);
    const listMyParticipationsCampaignBefore = await service.listMyParticipationsCampaign(0, 0);
    const listMyParticipationsBefore = await service.listMyParticipations(0, 0);
    const listParticipantsByCampaignBefore = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listMyParticipationsCampaignBefore.length).eq(0);
    expect(listMyParticipationsBefore.length).eq(0);
    expect(listParticipantsByCampaignBefore.length).eq(0);
    expect(listMyCampaignsBefore[0].balance.pendingBalance).eq(UnitUtils.addPrecision(0));
    await service.participateToCampaign(id, "user1", "facebook");
    const listMyParticipationsCampaignAfter = await service.listMyParticipationsCampaign(0, 0);
    const listMyParticipationsAfter = await service.listMyParticipations(0, 0);
    const listParticipantsByCampaignAfter = await service.listParticipantsByCampaign(id, 0, 0);
    const listMyCampaignsAfter = await service.listCampaigns(0, 0);
    expect(listMyCampaignsAfter[0].balance.pendingBalance).eq(UnitUtils.addPrecision(1));
    expect(listMyParticipationsCampaignAfter.length).eq(1);
    expect(listMyParticipationsAfter.length).eq(1);
    expect(listParticipantsByCampaignAfter.length).eq(1);
    expect(listMyParticipationsAfter[0].campaignId).eq(id)
    expect(listMyParticipationsAfter[0].canClaim).eq(TriState.UNDEFINED)
    expect(listMyParticipationsAfter[0].claimed).eq(false)
    expect(listMyParticipationsAfter[0].date).gt(0)
    const participantsBefore = await service.listParticipantsByCampaign(id, 0, 0);
    expect(participantsBefore.length).eq(1);
    expect(participantsBefore[0].handleEncrypt).not.eq("3::user1");
    appService.authService.forceUser(user.address);
    const participants = await service.listParticipantsByCampaign(id, 0, 0);
    expect(participants.length).eq(1);
    expect(participants[0].handleEncrypt).eq("3::user1");
  })
  it("Should allow claim all to false", async function () {
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    const id = listMyCampaignsBefore[0].id;
    const listParticipantsByCampaignBefore = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listParticipantsByCampaignBefore[0].canClaim).eq(TriState.UNDEFINED);
    expect(listMyCampaignsBefore[0].balance.pendingBalance).eq(UnitUtils.addPrecision(1));
    await service.allowClaimAll(id, false);
    const listMyCampaignsAfter = await service.listMyCampaigns(0, 0);
    const listParticipantsByCampaignAfter2 = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listParticipantsByCampaignAfter2[0].canClaim).eq(TriState.FALSE);
    expect(listMyCampaignsAfter[0].balance.pendingBalance).eq(0);
  })
  it("Should allow claim all to true", async function () {
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    const id = listMyCampaignsBefore[0].id;
    const listParticipantsByCampaignBefore = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listParticipantsByCampaignBefore[0].canClaim).eq(TriState.FALSE);
    expect(listMyCampaignsBefore[0].balance.pendingBalance).eq(UnitUtils.addPrecision(0));
    await service.allowClaimAll(id, true);
    const listMyCampaignsAfter = await service.listMyCampaigns(0, 0);
    const listParticipantsByCampaignAfter = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listParticipantsByCampaignAfter[0].canClaim).eq(TriState.TRUE);
    expect(listMyCampaignsAfter[0].balance.pendingBalance).eq(UnitUtils.addPrecision(1));
  })
  it("Should allow claim many", async function () {
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    const id = listMyCampaignsBefore[0].id;
    const listParticipantsByCampaignBefore = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listParticipantsByCampaignBefore[0].canClaim).eq(TriState.TRUE);
    expect(listMyCampaignsBefore[0].balance.pendingBalance).eq(UnitUtils.addPrecision(1));
    await service.allowClaimMany([user2.address], id, false);
    const listMyCampaignsAfter1 = await service.listMyCampaigns(0, 0);
    const listParticipantsByCampaignAfter1 = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listParticipantsByCampaignAfter1[0].canClaim).eq(TriState.FALSE);
    expect(listMyCampaignsAfter1[0].balance.pendingBalance).eq(UnitUtils.addPrecision(0));
    await service.allowClaimMany([user2.address], id, true);
    const listMyCampaignsAfter2 = await service.listMyCampaigns(0, 0);
    const listParticipantsByCampaignAfter = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listParticipantsByCampaignAfter[0].canClaim).eq(TriState.TRUE);
    expect(listMyCampaignsAfter2[0].balance.pendingBalance).eq(UnitUtils.addPrecision(1));
  })
  it("Should claim campaign many", async function () {
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    const id = listMyCampaignsBefore[0].id;
    const listParticipantsByCampaignBefore = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listParticipantsByCampaignBefore[0].claimed).eq(false);
    expect(listMyCampaignsBefore[0].balance.accBalance).eq(UnitUtils.addPrecision(10));
    expect(listMyCampaignsBefore[0].balance.current).eq(UnitUtils.addPrecision(10));
    expect(listMyCampaignsBefore[0].balance.pendingBalance).eq(UnitUtils.addPrecision(1));
    appService.authService.forceUser(user2.address);
    const balanceBefore = await appService.tokenService.getNativeTokenBalance();
    await service.campaignClaimMany([id]);
    const balanceAfter = await appService.tokenService.getNativeTokenBalance();
    expect(+balanceAfter.balance).approximately((+balanceBefore.balance) + 1, 0.1)
    appService.authService.forceUser(user.address);
    const listMyCampaignsAfter = await service.listMyCampaigns(0, 0);
    const listParticipantsByCampaignAfter = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listParticipantsByCampaignAfter[0].claimed).eq(true);
    expect(listMyCampaignsAfter[0].balance.accBalance).eq(UnitUtils.addPrecision(10));
    expect(listMyCampaignsAfter[0].balance.current).eq(UnitUtils.addPrecision(9));
    expect(listMyCampaignsAfter[0].balance.pendingBalance).eq(UnitUtils.addPrecision(0));
  })

  it("Should delete campaign", async function () {
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    const id = listMyCampaignsBefore[0].id;
    const balanceBefore = await appService.tokenService.getNativeTokenBalance();
    const balanceTBefore = await appService.tokenService.getMyTokenBalance();
    await service.deleteCampaign(id);
    const balanceAfter = await appService.tokenService.getNativeTokenBalance();
    const balanceTAfter = await appService.tokenService.getMyTokenBalance();
    expect(+balanceAfter.balance).approximately((+balanceBefore.balance) + 9, 0.1)
    expect(+balanceTAfter.balance).eq((+balanceTBefore.balance) + 10)
    const listCampaignsAfter = await service.listCampaigns(0, 0);
    const listMyCampaignsAfter = await service.listMyCampaigns(0, 0);
    expect(listCampaignsAfter.length).eq(0);
    expect(listMyCampaignsAfter.length).eq(0);
  })

  it("Should create social campaign2", async function () {
    const balanceBefore = await appService.tokenService.getMyTokenBalance();
    expect(+balanceBefore.balance).eq(1015)
    const listCampaignsBefore = await service.listCampaigns(0, 0);
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    expect(listCampaignsBefore.length).eq(0);
    expect(listMyCampaignsBefore.length).eq(0);
    const name = "CAMPAIGN NUMERO 2 LIKE 2 EARN 32";
    await service.createCampaign({
      actions: [SocialActionEnum.like],
      status: Lifecycle.LIVE,
      balance: {
        description: "DESCRIPTION",
        accBalance: 10,
        current: 10,
        pendingBalance: 10
      },
      name,
      duration: 10,
      uri: "https://facebook.com",
      durationPeriod: SocialDurationPeriodEnum.day,
      endat: DateUtils.nowSeconds() * 2,
      id: 10,
      network: SocialNetworkEnum.facebook,
      owner: owner.address,
      price: UnitUtils.addPrecision(1),
      priceCurrency: appService.tokenContract.address,
      startat: 1,
      pubKey: []
    });
    const listCampaignsAfter = await service.listCampaigns(0, 0);
    const listMyCampaignsAfter = await service.listMyCampaigns(0, 0);
    expect(listCampaignsAfter.length).eq(1);
    expect(listMyCampaignsAfter.length).eq(1);
    expect(listMyCampaignsAfter[0].balance.accBalance).eq(0);
    expect(listMyCampaignsAfter[0].balance.current).eq(0);
    expect(listMyCampaignsAfter[0].balance.pendingBalance).eq(0);
    expect(listMyCampaignsAfter[0].id).eq(2);
    expect(listMyCampaignsAfter[0].name).eq(name);
    expect(listMyCampaignsAfter[0].pubKey.length).gt(64);
    expect(listMyCampaignsAfter[0].owner).eq(user.address);
    expect(listMyCampaignsAfter[0].balance.description).eq("DESCRIPTION");
    const balance = await appService.tokenService.getMyTokenBalance();
    expect(+balance.balance).eq((+balanceBefore.balance) - 10)
  });


  it("Should not add balance coin to social campaign2", async function () {
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    expect(listMyCampaignsBefore.length).eq(1);
    expect(listMyCampaignsBefore[0].balance.accBalance).eq(0);
    expect(listMyCampaignsBefore[0].balance.current).eq(0);
    const balanceBefore = await appService.tokenService.getNativeTokenBalance();
    try {
      await service.addCampaignBalanceUsingCoin(listMyCampaignsBefore[0].id, 10);
    } catch (e) { }
    const listMyCampaignsAfter = await service.listMyCampaigns(0, 0);
    expect(listMyCampaignsAfter.length).eq(1);
    expect(listMyCampaignsAfter[0].balance.accBalance).eq(UnitUtils.addPrecision(0));
    expect(listMyCampaignsAfter[0].balance.current).eq(UnitUtils.addPrecision(0));
    expect(listMyCampaignsAfter[0].balance.pendingBalance).eq(0);
    const balanceAfter = await appService.tokenService.getNativeTokenBalance();
    expect(+balanceAfter.balance).eq((+balanceBefore.balance))
  })


  it("Should add balance token to social campaign2", async function () {
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    expect(listMyCampaignsBefore.length).eq(1);
    expect(listMyCampaignsBefore[0].balance.accBalance).eq(UnitUtils.addPrecision(0));
    expect(listMyCampaignsBefore[0].balance.current).eq(UnitUtils.addPrecision(0));
    const balanceBefore = await appService.tokenService.getMyTokenBalance();
    const tokenContract = appService.tokenContract.address;
    await service.addCampaignBalanceUsingToken(listMyCampaignsBefore[0].id, 10, tokenContract);
    const listMyCampaignsAfter = await service.listMyCampaigns(0, 0);
    expect(listMyCampaignsAfter.length).eq(1);
    expect(listMyCampaignsAfter[0].balance.accBalance).eq(UnitUtils.addPrecision(10));
    expect(listMyCampaignsAfter[0].balance.current).eq(UnitUtils.addPrecision(10));
    expect(listMyCampaignsAfter[0].balance.pendingBalance).eq(UnitUtils.addPrecision(0));
    const balanceAfter = await appService.tokenService.getMyTokenBalance();
    expect(+balanceAfter.balance).eq((+balanceBefore.balance) - 10)
  })

  it("Should participate to the campaign2", async function () {
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    const id = listMyCampaignsBefore[0].id;
    appService.authService.forceUser(user3.address);
    const listMyParticipationsCampaignBefore = await service.listMyParticipationsCampaign(0, 0);
    const listMyParticipationsBefore = await service.listMyParticipations(0, 0);
    const listParticipantsByCampaignBefore = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listMyParticipationsCampaignBefore.length).eq(0);
    expect(listMyParticipationsBefore.length).eq(0);
    expect(listParticipantsByCampaignBefore.length).eq(0);
    await service.participateToCampaign(id, "user1", "facebook");
    const listMyParticipationsCampaignAfter = await service.listMyParticipationsCampaign(0, 0);
    const listMyParticipationsAfter = await service.listMyParticipations(0, 0);
    const listParticipantsByCampaignAfter = await service.listParticipantsByCampaign(id, 0, 0);
    const listMyCampaignsAfter = await service.listCampaigns(0, 0);
    expect(listMyCampaignsAfter[0].balance.pendingBalance).eq(UnitUtils.addPrecision(1));
    expect(listMyParticipationsCampaignAfter.length).eq(1);
    expect(listMyParticipationsAfter.length).eq(1);
    expect(listParticipantsByCampaignAfter.length).eq(1);
    expect(listMyParticipationsAfter[0].campaignId).eq(id)
    expect(listMyParticipationsAfter[0].canClaim).eq(TriState.UNDEFINED)
    expect(listMyParticipationsAfter[0].claimed).eq(false)
    expect(listMyParticipationsAfter[0].date).gt(0)
    appService.authService.forceUser(user.address);
  })
  it("Should allow claim all campaign2", async function () {
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    const id = listMyCampaignsBefore[0].id;
    const listParticipantsByCampaignBefore = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listParticipantsByCampaignBefore[0].canClaim).eq(TriState.UNDEFINED);
    expect(listMyCampaignsBefore[0].balance.pendingBalance).eq(UnitUtils.addPrecision(1));
    await service.allowClaimAll(id, true);
    const listMyCampaignsAfter = await service.listMyCampaigns(0, 0);
    const listParticipantsByCampaignAfter = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listParticipantsByCampaignAfter[0].canClaim).eq(TriState.TRUE);
    expect(listMyCampaignsAfter[0].balance.pendingBalance).eq(UnitUtils.addPrecision(1));
  })
  it("Should claim token campaign2 many", async function () {
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    const id = listMyCampaignsBefore[0].id;
    const listParticipantsByCampaignBefore = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listParticipantsByCampaignBefore[0].claimed).eq(false);
    expect(listMyCampaignsBefore[0].balance.accBalance).eq(UnitUtils.addPrecision(10));
    expect(listMyCampaignsBefore[0].balance.current).eq(UnitUtils.addPrecision(10));
    expect(listMyCampaignsBefore[0].balance.pendingBalance).eq(UnitUtils.addPrecision(1));
    appService.authService.forceUser(user3.address);
    const balanceBefore = await appService.tokenService.getMyTokenBalance();
    await service.campaignClaimMany([id]);
    const balanceAfter = await appService.tokenService.getMyTokenBalance();
    expect(+balanceAfter.balance).eq((+balanceBefore.balance) + 1)
    appService.authService.forceUser(user.address);
    const listMyCampaignsAfter = await service.listMyCampaigns(0, 0);
    const listParticipantsByCampaignAfter = await service.listParticipantsByCampaign(id, 0, 0);
    expect(listParticipantsByCampaignAfter[0].claimed).eq(true);
    expect(listMyCampaignsAfter[0].balance.pendingBalance).eq(UnitUtils.addPrecision(0));
    expect(listMyCampaignsAfter[0].balance.accBalance).eq(UnitUtils.addPrecision(10));
    expect(listMyCampaignsAfter[0].balance.current).eq(UnitUtils.addPrecision(9));
  })

  it("Should delete campaign2 owner", async function () {
    const listMyCampaignsBefore = await service.listMyCampaigns(0, 0);
    const id = listMyCampaignsBefore[0].id;
    const balanceBefore = await appService.tokenService.getNativeTokenBalance();
    const balanceTBefore = await appService.tokenService.getMyTokenBalance();
    appService.authService.forceUser(owner.address);
    await service.deleteACampaign(id);
    appService.authService.forceUser(user.address);
    const balanceAfter = await appService.tokenService.getNativeTokenBalance();
    const balanceTAfter = await appService.tokenService.getMyTokenBalance();
    expect(+balanceAfter.balance).approximately((+balanceBefore.balance), 0.1)
    expect(+balanceTAfter.balance).eq((+balanceTBefore.balance))
    const listCampaignsAfter = await service.listCampaigns(0, 0);
    const listMyCampaignsAfter = await service.listMyCampaigns(0, 0);
    expect(listCampaignsAfter.length).eq(0);
    expect(listMyCampaignsAfter.length).eq(0);
  })



  it("Should get and set social ads config", async function () {
    appService.authService.forceUser(owner.address);
    let config = await service.socialAdsConfig();
    expect(config.validatorRequire).eq(true);
    expect(config.validator).eq(owner.address);
    expect(config.ads.service).eq(SocialService.SERVICE_ADS);
    config = { ...config };
    config.ads = { ...config.ads };
    config.ads.amount = UnitUtils.addPrecision(10)
    await service.setSocialAdsConfig(config);
    appService.authService.forceUser(user.address);
  });

  it("Should create social ads using coin", async function () {
    const balanceBefore = await appService.tokenService.getMyTokenBalance();
    expect(+balanceBefore.balance).eq(995)
    const listAdsBefore = await service.listAds(0, 0);
    const listMyAdsBefore = await service.listMyAds(0, 0);
    expect(listAdsBefore.length).eq(0);
    expect(listMyAdsBefore.length).eq(0);
    await service.createAds("facebook", "user1", {
      audiences: [SocialAudiencesEnum.ageAdult],
      duration: 10,
      durationPeriod: SocialDurationPeriodEnum.day,
      followers: 1000,
      handle: "",
      id: 10,
      description: "descript",
      network: SocialNetworkEnum.facebook,
      owner: ethers.constants.AddressZero,
      price: 100,
      priceCurrency: ethers.constants.AddressZero,
      pubKey: [],
      status: Lifecycle.LIVE,
      stats: { countProposition: 10, countPropositionAccepted: 10 },
      signature: []
    });
    const listAdsAfter = await service.listAds(0, 0);
    const listMyAdsAfter = await service.listMyAds(0, 0);
    expect(listAdsAfter.length).eq(1);
    expect(listMyAdsAfter.length).eq(1);
    expect(listMyAdsAfter[0].signature).not.eq([]);
    expect(listMyAdsAfter[0].pubKey.length).gt(64);
    expect(listMyAdsAfter[0].handle).not.eq("");
    expect(listMyAdsAfter[0].description).eq("descript");
    expect(listMyAdsAfter[0].id).eq(1);
    expect(listMyAdsAfter[0].owner).eq(user.address);
    expect(listMyAdsAfter[0].priceCurrency).eq(ethers.constants.AddressZero);
    const balance = await appService.tokenService.getMyTokenBalance();
    expect(+balance.balance).eq((+balanceBefore.balance) - 10)
  });

  it("Should create proposition using coin", async function () {
    appService.authService.forceUser(user2.address);
    const balanceBefore = await appService.tokenService.getNativeTokenBalance();
    const listAdsBefore = await service.listAds(0, 0);
    const id = listAdsBefore[0].id;
    const listPropsBefore = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsBefore = await service.listMyPropositions(0, 0);
    expect(listAdsBefore.length).eq(1);
    expect(listPropsBefore.length).eq(0);
    expect(listMyPropsBefore.length).eq(0);
    await service.createProposition({
      accepted: TriState.TRUE,
      adsId: id,
      amount: 5,
      canClaim: TriState.TRUE,
      claimed: true,
      currency: ethers.constants.AddressZero,
      description: "Description",
      endat: 10,
      id: 10,
      owner: ethers.constants.AddressZero,
      pubKey: [],
      startat: 1
    })
    const balanceAfter = await appService.tokenService.getNativeTokenBalance();
    const listPropsAfter = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsAfter = await service.listMyPropositions(0, 0);
    expect(listPropsAfter.length).eq(1);
    expect(listMyPropsAfter.length).eq(1);
    expect(listMyPropsAfter[0].accepted).eq(TriState.UNDEFINED);
    expect(listMyPropsAfter[0].canClaim).eq(TriState.UNDEFINED);
    expect(listMyPropsAfter[0].claimed).eq(false);
    expect(listMyPropsAfter[0].amount).eq(UnitUtils.addPrecision(5));
    expect(listMyPropsAfter[0].description).not.eq("Description");
    expect(listMyPropsAfter[0].pubKey.length).gt(64);
    expect(listMyPropsAfter[0].id).eq(1);
    expect(listMyPropsAfter[0].startat).eq(1);
    expect(listMyPropsAfter[0].endat).eq(10);
    expect(listMyPropsAfter[0].owner).eq(user2.address);
    expect(+balanceAfter.balance).approximately((+balanceBefore.balance) - 5, 0.1)
    appService.authService.forceUser(user.address);
    const listPropsAfterDecrypt = await service.listPropositionsForAds(id, 0, 0);
    expect(listPropsAfterDecrypt[0].description).eq("Description");
  })

  it("Should update social ads", async function () {
    appService.authService.forceUser(user.address);
    const listAdsBefore = await service.listAds(0, 0);
    const listMyAdsBefore = await service.listMyAds(0, 0);
    expect(listAdsBefore.length).eq(1);
    expect(listMyAdsBefore.length).eq(1);
    await service.updateAds({
      audiences: [SocialAudiencesEnum.ageAdult],
      duration: 11,
      durationPeriod: SocialDurationPeriodEnum.minute,
      followers: 100,
      handle: "",
      id: listMyAdsBefore[0].id,
      description: "descript",
      network: SocialNetworkEnum.facebook,
      owner: ethers.constants.AddressZero,
      price: 10,
      priceCurrency: appService.tokenContract.address,
      pubKey: [],
      stats: { countProposition: 10, countPropositionAccepted: 10 },
      status: Lifecycle.LIVE,
      signature: []
    })
    const listAdsAfter = await service.listAds(0, 0);
    const listMyAdsAfter = await service.listMyAds(0, 0);
    expect(listAdsAfter.length).eq(1);
    expect(listMyAdsAfter.length).eq(1);
    expect(listMyAdsAfter[0].signature).not.eq([]);
    expect(listMyAdsAfter[0].pubKey.length).gt(64);
    expect(listMyAdsAfter[0].handle).not.eq("");
    expect(listMyAdsAfter[0].description).eq("descript");
    expect(listMyAdsAfter[0].id).eq(1);
    expect(listMyAdsAfter[0].price).eq(10);
    expect(listMyAdsAfter[0].followers).eq(100);
    expect(listMyAdsAfter[0].network).eq(SocialNetworkEnum.facebook);
    expect(listMyAdsAfter[0].duration).eq(11);
    expect(listMyAdsAfter[0].durationPeriod).eq(SocialDurationPeriodEnum.minute);
    expect(listMyAdsAfter[0].owner).eq(user.address);
    expect(listMyAdsAfter[0].priceCurrency).eq(appService.tokenContract.address);
  })

  it("Should create proposition2 using token", async function () {
    appService.authService.forceUser(user2.address);
    const balanceBefore = await appService.tokenService.getMyTokenBalance();
    const listAdsBefore = await service.listAds(0, 0);
    const id = listAdsBefore[0].id;
    const listPropsBefore = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsBefore = await service.listMyPropositions(0, 0);
    expect(listAdsBefore.length).eq(1);
    expect(listPropsBefore.length).eq(1);
    expect(listMyPropsBefore.length).eq(1);
    await service.createProposition({
      accepted: TriState.TRUE,
      adsId: id,
      amount: 5,
      canClaim: TriState.TRUE,
      claimed: true,
      currency: appService.tokenContract.address,
      description: "Description",
      endat: 10,
      id: 10,
      owner: ethers.constants.AddressZero,
      pubKey: [],
      startat: 1
    })
    const balanceAfter = await appService.tokenService.getMyTokenBalance();
    const listPropsAfter = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsAfter = await service.listMyPropositions(0, 0);
    expect(listPropsAfter.length).eq(2);
    expect(listMyPropsAfter.length).eq(2);
    expect(listMyPropsAfter[1].accepted).eq(TriState.UNDEFINED);
    expect(listMyPropsAfter[1].canClaim).eq(TriState.UNDEFINED);
    expect(listMyPropsAfter[1].claimed).eq(false);
    expect(listMyPropsAfter[1].amount).eq(UnitUtils.addPrecision(5));
    expect(listMyPropsAfter[1].description).not.eq("Description");
    expect(listMyPropsAfter[0].pubKey.length).gt(64);
    expect(listMyPropsAfter[1].id).eq(2);
    expect(listMyPropsAfter[1].startat).eq(1);
    expect(listMyPropsAfter[1].endat).eq(10);
    expect(listMyPropsAfter[1].owner).eq(user2.address);
    expect(+balanceAfter.balance).eq((+balanceBefore.balance) - 5)
    appService.authService.forceUser(user.address);
    const listPropsAfterDecrypt = await service.listPropositionsForAds(id, 0, 0);
    expect(listPropsAfterDecrypt[1].description).eq("Description");
  })

  it("Should update proposition2", async function () {
    appService.authService.forceUser(user2.address);
    const listAdsBefore = await service.listAds(0, 0);
    const id = listAdsBefore[0].id;
    const listPropsBefore = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsBefore = await service.listMyPropositions(0, 0);
    expect(listPropsBefore.length).eq(2);
    expect(listMyPropsBefore.length).eq(2);
    await service.updateProposition({
      adsId: id,
      accepted: TriState.TRUE,
      canClaim: TriState.TRUE,
      claimed: true,
      currency: ethers.constants.AddressZero,
      description: "DESC2",
      endat: 30,
      startat: 20,
      id: listPropsBefore[1].id,
      owner: ethers.constants.AddressZero,
      pubKey: [],
      amount: 10,
    })
    const listPropsAfter = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsAfter = await service.listMyPropositions(0, 0);
    expect(listPropsAfter.length).eq(2);
    expect(listMyPropsAfter.length).eq(2);
    expect(listMyPropsAfter[1].accepted).eq(TriState.UNDEFINED);
    expect(listMyPropsAfter[1].canClaim).eq(TriState.UNDEFINED);
    expect(listMyPropsAfter[1].claimed).eq(false);
    expect(listMyPropsAfter[1].amount).eq(UnitUtils.addPrecision(5));
    expect(listMyPropsAfter[1].description).not.eq("DESC2");
    expect(listMyPropsAfter[0].pubKey.length).gt(64);
    expect(listMyPropsAfter[1].id).eq(2);
    expect(listMyPropsAfter[1].startat).eq(20);
    expect(listMyPropsAfter[1].endat).eq(30);
    expect(listMyPropsAfter[1].currency).eq(appService.tokenContract.address);
    expect(listMyPropsAfter[1].owner).eq(user2.address);
    appService.authService.forceUser(user.address);
    const listPropsAfterDecrypt = await service.listPropositionsForAds(id, 0, 0);
    expect(listPropsAfterDecrypt[1].description).eq("DESC2");
  })

  it("Should allow claim proposition1", async function () {
    appService.authService.forceUser(user2.address);
    const listAdsBefore = await service.listAds(0, 0);
    const id = listAdsBefore[0].id;
    const listPropsBefore = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsBefore = await service.listMyPropositions(0, 0);
    expect(listPropsBefore.length).eq(2);
    expect(listMyPropsBefore.length).eq(2);
    await service.allowClaimProposition(listMyPropsBefore[0].id, true);
    const listPropsAfter = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsAfter = await service.listMyPropositions(0, 0);
    expect(listPropsAfter.length).eq(2);
    expect(listMyPropsAfter.length).eq(2);
    expect(listMyPropsAfter[0].accepted).eq(TriState.UNDEFINED);
    expect(listMyPropsAfter[0].canClaim).eq(TriState.TRUE);
    expect(listMyPropsAfter[0].claimed).eq(false);
    await service.allowClaimProposition(listMyPropsBefore[0].id, false);
    const listPropsAfter1 = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsAfter1 = await service.listMyPropositions(0, 0);
    expect(listPropsAfter1.length).eq(2);
    expect(listMyPropsAfter1.length).eq(2);
    expect(listMyPropsAfter1[0].accepted).eq(TriState.UNDEFINED);
    expect(listMyPropsAfter1[0].canClaim).eq(TriState.FALSE);
    expect(listMyPropsAfter1[0].claimed).eq(false);
    await service.allowClaimProposition(listMyPropsBefore[0].id, true);
    const listPropsAfter2 = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsAfter2 = await service.listMyPropositions(0, 0);
    expect(listPropsAfter2.length).eq(2);
    expect(listMyPropsAfter2.length).eq(2);
    expect(listMyPropsAfter2[0].accepted).eq(TriState.UNDEFINED);
    expect(listMyPropsAfter2[0].canClaim).eq(TriState.TRUE);
    expect(listMyPropsAfter2[0].claimed).eq(false);
  })

  it("Should allow claim proposition2", async function () {
    appService.authService.forceUser(user2.address);
    const listAdsBefore = await service.listAds(0, 0);
    const id = listAdsBefore[0].id;
    const listPropsBefore = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsBefore = await service.listMyPropositions(0, 0);
    expect(listPropsBefore.length).eq(2);
    expect(listMyPropsBefore.length).eq(2);
    await service.allowClaimProposition(listMyPropsBefore[1].id, true);
    const listPropsAfter = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsAfter = await service.listMyPropositions(0, 0);
    expect(listPropsAfter.length).eq(2);
    expect(listMyPropsAfter.length).eq(2);
    expect(listMyPropsAfter[1].accepted).eq(TriState.UNDEFINED);
    expect(listMyPropsAfter[1].canClaim).eq(TriState.TRUE);
    expect(listMyPropsAfter[1].claimed).eq(false);
  })

  it("Should approve proposition1", async function () {
    appService.authService.forceUser(user.address);
    const listAdsBefore = await service.listAds(0, 0);
    const id = listAdsBefore[0].id;
    const listPropsBefore = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsBefore = await service.listMyPropositions(0, 0);
    expect(listPropsBefore.length).eq(2);
    expect(listMyPropsBefore.length).eq(0);
    await service.approveProposition(listPropsBefore[0].id, true);
    const listPropsAfter = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsAfter = await service.listMyPropositions(0, 0);
    expect(listPropsAfter.length).eq(2);
    expect(listMyPropsAfter.length).eq(0);
    expect(listPropsAfter[0].accepted).eq(TriState.TRUE);
    expect(listPropsAfter[0].canClaim).eq(TriState.TRUE);
    expect(listPropsAfter[0].claimed).eq(false);
    await service.approveProposition(listPropsBefore[0].id, false);
    const listPropsAfter1 = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsAfter1 = await service.listMyPropositions(0, 0);
    expect(listPropsAfter1.length).eq(2);
    expect(listMyPropsAfter1.length).eq(0);
    expect(listPropsAfter1[0].accepted).eq(TriState.FALSE);
    expect(listPropsAfter1[0].canClaim).eq(TriState.TRUE);
    expect(listPropsAfter1[0].claimed).eq(false);
    await service.approveProposition(listPropsBefore[0].id, true);
    const listPropsAfter2 = await service.listPropositionsForAds(id, 0, 0);
    const listMyPropsAfter2 = await service.listMyPropositions(0, 0);
    expect(listPropsAfter2.length).eq(2);
    expect(listMyPropsAfter2.length).eq(0);
    expect(listPropsAfter2[0].accepted).eq(TriState.TRUE);
    expect(listPropsAfter2[0].canClaim).eq(TriState.TRUE);
    expect(listPropsAfter2[0].claimed).eq(false);
  })


  it("Should claim props2 token", async function () {
    appService.authService.forceUser(user.address);
    const balanceBefore = await appService.tokenService.getMyTokenBalance();
    const listPropositionsBefore = await service.listPropositionsForAds(1, 0, 0);
    expect(listPropositionsBefore.length).eq(2);
    expect(listPropositionsBefore[1].canClaim).eq(TriState.TRUE);
    expect(listPropositionsBefore[1].claimed).eq(false);
    expect(listPropositionsBefore[1].currency).eq(appService.tokenContract.address);
    await service.claimProposition(listPropositionsBefore[1].id);
    const listPropositionsAfter = await service.listPropositionsForAds(1, 0, 0);
    expect(listPropositionsAfter.length).eq(2);
    expect(listPropositionsAfter[1].canClaim).eq(TriState.TRUE);
    expect(listPropositionsAfter[1].claimed).eq(true);
    const balanceAfter = await appService.tokenService.getMyTokenBalance();
    expect((+balanceAfter.balance)).approximately((+balanceBefore.balance) + 5, 0.1)
  })

  it("Should delete ads1", async function () {
    appService.authService.forceUser(user.address);
    const listAdsBefore = await service.listAds(0, 0);
    expect(listAdsBefore.length).eq(1);
    await service.deleteAds(listAdsBefore[0].id);
    const listAdsAfter = await service.listAds(0, 0);
    expect(listAdsAfter.length).eq(0);
  })

  it("Should delete props1 coin with withdraw", async function () {
    appService.authService.forceUser(user2.address);
    const balanceBefore = await appService.tokenService.getNativeTokenBalance();
    const listMyPropositionsBefore = await service.listMyPropositions(0, 0);
    expect(listMyPropositionsBefore.length).eq(2);
    expect(listMyPropositionsBefore[0].currency).eq(ethers.constants.AddressZero);
    await service.deleteProposition(listMyPropositionsBefore[0].id);
    const listMyPropositionsAfter = await service.listMyPropositions(0, 0);
    expect(listMyPropositionsAfter.length).eq(1);
    const balanceAfter = await appService.tokenService.getNativeTokenBalance();
    expect((+balanceAfter.balance)).approximately((+balanceBefore.balance) + 5, 0.1)
  })

  it("Should delete props2 token without withdraw", async function () {
    appService.authService.forceUser(user2.address);
    const balanceBefore = await appService.tokenService.getNativeTokenBalance();
    const balanceTBefore = await appService.tokenService.getMyTokenBalance();
    const listMyPropositionsBefore = await service.listMyPropositions(0, 0);
    expect(listMyPropositionsBefore.length).eq(1);
    expect(listMyPropositionsBefore[0].currency).eq(appService.tokenContract.address);
    await service.deleteProposition(listMyPropositionsBefore[0].id);
    const listMyPropositionsAfter = await service.listMyPropositions(0, 0);
    expect(listMyPropositionsAfter.length).eq(0);
    const balanceAfter = await appService.tokenService.getNativeTokenBalance();
    const balanceTAfter = await appService.tokenService.getMyTokenBalance();
    expect((+balanceAfter.balance)).approximately((+balanceBefore.balance), 0.1)
    expect((+balanceTAfter.balance)).eq((+balanceTBefore.balance))
  })

  it("Should allow owner to delete", async function () {
    appService.authService.forceUser(user2.address);
    const listAdsBefore = await service.listAds(0, 0);
    const listMyAdsBefore = await service.listMyAds(0, 0);
    expect(listAdsBefore.length).eq(0);
    expect(listMyAdsBefore.length).eq(0);
    await service.createAds("facebook", "user1", {
      audiences: [SocialAudiencesEnum.ageAdult],
      duration: 10,
      durationPeriod: SocialDurationPeriodEnum.day,
      followers: 1000,
      handle: "",
      id: 10,
      description: "descript",
      network: SocialNetworkEnum.facebook,
      owner: ethers.constants.AddressZero,
      price: 100,
      priceCurrency: ethers.constants.AddressZero,
      pubKey: [],
      signature: [],
      stats: { countProposition: 10, countPropositionAccepted: 10 },
      status: Lifecycle.LIVE
    });
    const listAdsAfter = await service.listAds(0, 0);
    const listMyAdsAfter = await service.listMyAds(0, 0);
    expect(listAdsAfter.length).eq(1);
    expect(listMyAdsAfter.length).eq(1);
    appService.authService.forceUser(owner.address);
    const listAdsAfter2 = await service.listAds(0, 0);
    expect(listAdsAfter2.length).eq(1);
    await service.deleteAd(listAdsAfter[0].id);
    const listAdsAfter3 = await service.listAds(0, 0);
    expect(listAdsAfter3.length).eq(0);

  });

});
