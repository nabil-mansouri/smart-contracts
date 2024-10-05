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
import { MessageService } from "src/messageService";

describe("MessageService", function () {
  let appService: AppService;
  let service: MessageService;
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
    service = appService.messageService;
    //token
    await tokenContract.send(user.address, UnitUtils.addPrecision(1000), []);
    await tokenContract.send(user2.address, UnitUtils.addPrecision(1000), []);
  });

  after(async function () {
    Web3Wallet.cacheRSA.clear()
    Web3Wallet.enableCachePassphrase = true;
    await TestHelper.revertSnapshot();
  })

  it("Should send message", async function () {
    appService.authService.forceUser(owner.address);
    const listMessageBySubjectOld = await service.listMessageBySubject("SUBJECT1", 0, 0);
    const listMessageReceivedByOld = await service.listMessageReceivedBy(user.address, 0, 0);
    const listMessageSentByOld = await service.listMessageSentBy(owner.address, 0, 0);
    expect(listMessageBySubjectOld.length).eq(0);
    expect(listMessageReceivedByOld.length).eq(0);
    expect(listMessageSentByOld.length).eq(0);
    await service.sendMessage("SUBJECT1", "MESSAGE1", user.address);
    //DECRYPT USING OWNER
    const listMessageBySubject = await service.listMessageBySubject("SUBJECT1", 0, 0);
    const listMessageReceivedBy = await service.listMessageReceivedBy(user.address, 0, 0);
    const listMessageSentBy = await service.listMessageSentBy(owner.address, 0, 0);
    expect(listMessageBySubject.length).eq(1);
    expect(listMessageReceivedBy.length).eq(1);
    expect(listMessageSentBy.length).eq(1);
    expect(listMessageSentBy[0].decrypted).eq("MESSAGE1");
    expect(listMessageSentBy[0].encryptMessage).not.eq("MESSAGE1");
    expect(listMessageSentBy[0].myEncryptMessage).not.eq("MESSAGE1");
    expect(listMessageSentBy[0].subjectId).not.eq("SUBJECT1");
    //DECRYPT USING USER
    appService.authService.forceUser(user.address);
    const listMessageSentBy1 = await service.listMessageSentBy(owner.address, 0, 0);
    expect(listMessageSentBy1.length).eq(1);
    expect(listMessageSentBy1[0].decrypted).is.undefined;
    expect(listMessageSentBy1[0].encryptMessage).not.eq("MESSAGE1");
    expect(listMessageSentBy1[0].myEncryptMessage).not.eq("MESSAGE1");
    expect(listMessageSentBy1[0].subjectId).not.eq("SUBJECT1");
  });

  it("Should reply message", async function () {
    appService.authService.forceUser(user.address);
    const listMessageBySubjectOld = await service.listMessageBySubject("SUBJECT1", 0, 0);
    const listMessageReceivedByOld = await service.listMessageReceivedBy(owner.address, 0, 0);
    const listMessageSentByOld = await service.listMessageSentBy(user.address, 0, 0);
    expect(listMessageBySubjectOld.length).eq(1);
    expect(listMessageReceivedByOld.length).eq(0);
    expect(listMessageSentByOld.length).eq(0);
    await service.replyMessage(listMessageBySubjectOld[0].id, "MESSAGE2");
    //DECRYPT USING USER
    const listMessageBySubject = await service.listMessageBySubject("SUBJECT1", 0, 0);
    const listMessageReceivedBy = await service.listMessageReceivedBy(owner.address, 0, 0);
    const listMessageSentBy = await service.listMessageSentBy(user.address, 0, 0);
    expect(listMessageBySubject.length).eq(2);
    expect(listMessageReceivedBy.length).eq(1);
    expect(listMessageSentBy.length).eq(1);
    expect(listMessageSentBy[0].decrypted).eq("MESSAGE2");
    expect(listMessageSentBy[0].encryptMessage).not.eq("MESSAGE2");
    expect(listMessageSentBy[0].myEncryptMessage).not.eq("MESSAGE2");
    expect(listMessageSentBy[0].subjectId).not.eq("SUBJECT1");
    //DECRYPT USING OWNER
    appService.authService.forceUser(owner.address);
    const listMessageReceivedBy1 = await service.listMessageReceivedBy(owner.address, 0, 0);
    expect(listMessageReceivedBy1.length).eq(1);
    expect(listMessageReceivedBy1[0].decrypted).eq("MESSAGE2");
    expect(listMessageReceivedBy1[0].encryptMessage).not.eq("MESSAGE2");
    expect(listMessageReceivedBy1[0].myEncryptMessage).not.eq("MESSAGE2");
    expect(listMessageReceivedBy1[0].subjectId).not.eq("SUBJECT1");
  }); 
  
  it("Should reply to replied message", async function () {
    appService.authService.forceUser(owner.address);
    const listMessageBySubjectOld = await service.listMessageBySubject("SUBJECT1", 0, 0);
    const listMessageReceivedByOld = await service.listMessageReceivedBy(user.address, 0, 0);
    const listMessageSentByOld = await service.listMessageSentBy(owner.address, 0, 0);
    expect(listMessageBySubjectOld.length).eq(2);
    expect(listMessageReceivedByOld.length).eq(1);
    expect(listMessageSentByOld.length).eq(1);
    await service.replyMessage(listMessageBySubjectOld[1].id, "MESSAGE3");
    //DECRYPT USING OWNER
    const listMessageBySubject = await service.listMessageBySubject("SUBJECT1", 0, 0);
    const listMessageReceivedBy = await service.listMessageReceivedBy(user.address, 0, 0);
    const listMessageSentBy = await service.listMessageSentBy(owner.address, 0, 0);
    expect(listMessageBySubject.length).eq(3);
    expect(listMessageReceivedBy.length).eq(2);
    expect(listMessageSentBy.length).eq(2);
    expect(listMessageSentBy[1].decrypted).eq("MESSAGE3");
    expect(listMessageSentBy[1].encryptMessage).not.eq("MESSAGE3");
    expect(listMessageSentBy[1].myEncryptMessage).not.eq("MESSAGE3");
    expect(listMessageSentBy[1].subjectId).not.eq("SUBJECT1");
    //DECRYPT USING USER
    appService.authService.forceUser(user.address);
    const listMessageReceivedBy1 = await service.listMessageReceivedBy(user.address, 0, 0);
    expect(listMessageReceivedBy1.length).eq(2);
    expect(listMessageReceivedBy1[1].decrypted).eq("MESSAGE3");
    expect(listMessageReceivedBy1[1].encryptMessage).not.eq("MESSAGE3");
    expect(listMessageReceivedBy1[1].myEncryptMessage).not.eq("MESSAGE3");
    expect(listMessageReceivedBy1[1].subjectId).not.eq("SUBJECT1");
  });

  it("Should reply to self", async function () {
    appService.authService.forceUser(owner.address);
    const listMessageBySubjectOld = await service.listMessageBySubject("SUBJECT1", 0, 0);
    const listMessageReceivedByOld = await service.listMessageReceivedBy(user.address, 0, 0);
    const listMessageSentByOld = await service.listMessageSentBy(owner.address, 0, 0);
    expect(listMessageBySubjectOld.length).eq(3);
    expect(listMessageReceivedByOld.length).eq(2);
    expect(listMessageSentByOld.length).eq(2);
    const myHash = await service.getMyHash();
    expect(listMessageBySubjectOld[2].sender).eq(myHash);
    await service.replyMessage(listMessageBySubjectOld[2].id, "MESSAGE4");
    //DECRYPT USING OWNER
    const listMessageBySubject = await service.listMessageBySubject("SUBJECT1", 0, 0);
    const listMessageReceivedBy = await service.listMessageReceivedBy(user.address, 0, 0);
    const listMessageSentBy = await service.listMessageSentBy(owner.address, 0, 0);
    expect(listMessageBySubject.length).eq(4);
    expect(listMessageReceivedBy.length).eq(3);
    expect(listMessageSentBy.length).eq(3);
    expect(listMessageSentBy[2].decrypted).eq("MESSAGE4");
    expect(listMessageSentBy[2].encryptMessage).not.eq("MESSAGE4");
    expect(listMessageSentBy[2].myEncryptMessage).not.eq("MESSAGE4");
    expect(listMessageSentBy[2].subjectId).not.eq("SUBJECT1");
    expect(listMessageBySubject[3].sender).eq(myHash);
    //DECRYPT USING USER
    appService.authService.forceUser(user.address);
    const listMessageReceivedBy1 = await service.listMessageReceivedBy(user.address, 0, 0);
    expect(listMessageReceivedBy1.length).eq(3);
    expect(listMessageReceivedBy1[2].decrypted).eq("MESSAGE4");
    expect(listMessageReceivedBy1[2].encryptMessage).not.eq("MESSAGE4");
    expect(listMessageReceivedBy1[2].myEncryptMessage).not.eq("MESSAGE4");
    expect(listMessageReceivedBy1[2].subjectId).not.eq("SUBJECT1");
  });

  it("Should send message campaign", async function () {
    appService.authService.forceUser(user.address);
    await appService.socialService.createCampaign({
      actions: [SocialActionEnum.like],
      status: Lifecycle.LIVE,
      balance: {
        description: "DESCRIPTION",
        accBalance: 10,
        current: 10,
        pendingBalance: 10
      },
      name:"NAME",
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
    const campaigns = await appService.socialService.listCampaigns(0,0)
    expect(campaigns.length).equal(1)
    //OWNER
    appService.authService.forceUser(owner.address);
    const listMessageBySubjectOld = await service.listMessageBySubjectForCampaign(1, 0, 0);
    const listMessageReceivedByOld = await service.listMessageReceivedBy(user.address, 0, 0);
    const listMessageSentByOld = await service.listMessageSentBy(owner.address, 0, 0);
    expect(listMessageBySubjectOld.length).eq(0);
    expect(listMessageReceivedByOld.length).eq(3);
    expect(listMessageSentByOld.length).eq(3);
    await service.sendMessageForCampaign(campaigns[0], "CAMPAIGN1");
    const listMessageBySubject = await service.listMessageBySubjectForCampaign(1, 0, 0);
    const listMessageReceivedBy = await service.listMessageReceivedBy(user.address, 0, 0);
    const listMessageSentBy = await service.listMessageSentBy(owner.address, 0, 0);
    expect(listMessageBySubject.length).eq(1);
    expect(listMessageReceivedBy.length).eq(4);
    expect(listMessageSentBy.length).eq(4);
    expect(listMessageSentBy[3].decrypted).eq("CAMPAIGN1");
    expect(listMessageSentBy[3].encryptMessage).not.eq("CAMPAIGN1");
    expect(listMessageSentBy[3].myEncryptMessage).not.eq("CAMPAIGN1");
    //USER
    appService.authService.forceUser(user.address);
    const listMessageSentBy1 = await service.listMessageSentBy(owner.address, 0, 0);
    expect(listMessageSentBy1.length).eq(4);
    expect(listMessageSentBy1[3].decrypted).eq("CAMPAIGN1");
    expect(listMessageSentBy1[3].encryptMessage).not.eq("CAMPAIGN1");
    expect(listMessageSentBy1[3].myEncryptMessage).not.eq("CAMPAIGN1");
  });

  it("Should send message ads", async function () {
    //USER
    appService.authService.forceUser(user.address);
    await appService.socialService.createAds("facebook", "user1", {
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
    const listAdsAfter = await appService.socialService.listAds(0, 0);
    expect(listAdsAfter.length).equal(1)
    //OWNER
    appService.authService.forceUser(owner.address);
    const listMessageBySubjectOld = await service.listMessageBySubjectForAds(1, 0, 0);
    const listMessageReceivedByOld = await service.listMessageReceivedBy(user.address, 0, 0);
    const listMessageSentByOld = await service.listMessageSentBy(owner.address, 0, 0);
    expect(listMessageBySubjectOld.length).eq(0);
    expect(listMessageReceivedByOld.length).eq(4);
    expect(listMessageSentByOld.length).eq(4);
    await service.sendMessageForAds(listAdsAfter[0], "MESSAGE1");
    const listMessageBySubject = await service.listMessageBySubjectForAds(1, 0, 0);
    const listMessageReceivedBy = await service.listMessageReceivedBy(user.address, 0, 0);
    const listMessageSentBy = await service.listMessageSentBy(owner.address, 0, 0);
    expect(listMessageBySubject.length).eq(1);
    expect(listMessageReceivedBy.length).eq(5);
    expect(listMessageSentBy.length).eq(5);
    expect(listMessageSentBy[4].decrypted).eq("MESSAGE1");
    expect(listMessageSentBy[4].encryptMessage).not.eq("MESSAGE1");
    expect(listMessageSentBy[4].myEncryptMessage).not.eq("MESSAGE1");
    //USER
    appService.authService.forceUser(user.address);
    const listMessageSentBy1 = await service.listMessageSentBy(owner.address, 0, 0);
    expect(listMessageSentBy1.length).eq(5);
    expect(listMessageSentBy1[4].decrypted).eq("MESSAGE1");
    expect(listMessageSentBy1[4].encryptMessage).not.eq("MESSAGE1");
    expect(listMessageSentBy1[4].myEncryptMessage).not.eq("MESSAGE1");
  });
  
  
});
