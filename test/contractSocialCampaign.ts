//must be first (mock)
import { TestHelper } from "./testHelper";
//import
import { expect } from "chai";
import "mocha";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { SocialCampaignContractProxy, SocialViews, TokenContract } from 'typechain-types';
import { ethers } from "hardhat";
import * as eths from "ethers";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { DateUtils, Lifecycle, TriState } from "src/utils";
import { SocialActionEnum, SocialDurationPeriodEnum, SocialNetworkEnum } from "src/socialService";

describe("SocialCampaign", function () {
    let contract: SocialCampaignContractProxy;
    let tokenContract: TokenContract;
    let owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress, addr3: SignerWithAddress, addr4: SignerWithAddress;
    const testHelper = new TestHelper;
    const SERVICE_ID = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_CAMPAIGN"));
    before(async function () {
        await TestHelper.takeSnapshot();
        const testHelper = new TestHelper();
        [owner, , , , , , , , , , , , , addr1, addr2, addr3, addr4] = await testHelper.signerPromise;
        contract = await testHelper.contractSocialCampaignPromise(owner.address);
        tokenContract = await testHelper.contractTokenPromise;
        await (await tokenContract.connect(owner).transfer(addr1.address, TestHelper.addPrecision(1000))).wait();
        await (await tokenContract.connect(owner).transfer(addr2.address, TestHelper.addPrecision(1000))).wait();
        await (await tokenContract.connect(owner).transfer(addr3.address, TestHelper.addPrecision(1000))).wait();
        await (await tokenContract.connect(owner).transfer(addr4.address, TestHelper.addPrecision(1000))).wait();
    });

    after(async () => {
        await TestHelper.revertSnapshot();    
    })

    it("Should set the right owner", async function () {
        expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should get config", async function () {
        const config = await contract.connect(addr1).socialConfig();
        expect(config.tokenAddress).equal(tokenContract.address);
        expect(config.validatorRequire).equal(true);
        expect(config.validator).equal(owner.address);
        expect(config.campaign.amount).eq(TestHelper.addPrecision(15));
        expect(config.campaign.currency).eq(tokenContract.address);
        expect(config.campaign.paymentType).eq(0);
        expect(config.campaign.service).eq(SERVICE_ID);
    });

    it("Should not create campaign for addr1 using hook if bad price", async function () {
        const countCampaignsOld = await contract.countCampaigns();
        const listCampaignsOld = (await contract.listCampaigns(0, 0));
        const countMyCampaignsOld = await contract.connect(addr1).countMyCampaigns();
        const listMyCampaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(countCampaignsOld).equal(0);
        expect(listCampaignsOld.length).equal(0);
        expect(countMyCampaignsOld).equal(0);
        expect(listMyCampaignsOld.length).equal(0);
        expect(balanceBefore).equal(TestHelper.addPrecision(1000));
        //create
        const userData = await contract.generateUserDataCampaign(createCampaign());
        try {
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(16), userData)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("Price: invalid price");
        }
        //check
        const countCampaigns = await contract.countCampaigns();
        const listCampaigns = (await contract.listCampaigns(0, 0));
        const countMyCampaigns = await contract.connect(addr1).countMyCampaigns();
        const listMyCampaigns = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const lockCount = await contract.lockCount();
        expect(countCampaigns).equal(0);
        expect(listCampaigns.length).equal(0);
        expect(countMyCampaigns).equal(0);
        expect(listMyCampaigns.length).equal(0);
        expect(balance).equal(TestHelper.addPrecision(1000));
        expect(lockCount).eq(0)
    });

    it("Should create campaign for addr1 using hook", async function () {
        const countCampaignsOld = await contract.countCampaigns();
        const listCampaignsOld = (await contract.listCampaigns(0, 0));
        const countMyCampaignsOld = await contract.connect(addr1).countMyCampaigns();
        const listMyCampaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(countCampaignsOld).equal(0);
        expect(listCampaignsOld.length).equal(0);
        expect(countMyCampaignsOld).equal(0);
        expect(listMyCampaignsOld.length).equal(0);
        expect(balanceBefore).equal(TestHelper.addPrecision(1000));
        //create
        const campaign = createCampaign();
        const userData = await contract.generateUserDataCampaign(campaign);
        await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(15), userData)).wait();
        //check
        const countCampaigns = await contract.countCampaigns();
        const listCampaigns = (await contract.listCampaigns(0, 0));
        const countMyCampaigns = await contract.connect(addr1).countMyCampaigns();
        const listMyCampaigns = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const lockCount = await contract.lockCount();
        expect(countCampaigns).equal(1);
        expect(listCampaigns.length).equal(1);
        expect(countMyCampaigns).equal(1);
        expect(listMyCampaigns.length).equal(1);
        expect(listMyCampaigns[0].network).equal(campaign.network);
        expect(listMyCampaigns[0].actions.length).equal(campaign.actions.length);
        expect(listMyCampaigns[0].name).equal(campaign.name);
        expect(ethers.utils.toUtf8String(ethers.utils.hexStripZeros(listMyCampaigns[0].name))).equal("CAMPAIGN1");
        expect(listMyCampaigns[0].price).equal(campaign.price);
        expect(listMyCampaigns[0].priceCurrency).equal(campaign.priceCurrency);
        expect(listMyCampaigns[0].startat).equal(campaign.startat);
        expect(listMyCampaigns[0].endat).equal(campaign.endat);
        expect(listMyCampaigns[0].duration).equal(campaign.duration);
        expect(listMyCampaigns[0].durationPeriod).equal(campaign.durationPeriod);
        expect(listMyCampaigns[0].owner).equal(addr1.address);
        expect(listMyCampaigns[0].balance.current).equal(0);
        expect(listMyCampaigns[0].balance.accBalance).equal(0);
        expect(listMyCampaigns[0].id).gt(0);
        expect(balance).equal(TestHelper.addPrecision(985));
        expect(lockCount).eq(1)
    });

    it("Should not create campaign when missing network", async function () {
        try {
            const campaign = createCampaign();
            campaign.network = 0;
            const userData = await contract.generateUserDataCampaign(campaign);
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(15), userData)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing social network");
        }
    })

    it("Should not create campaign when missing actions", async function () {
        try {
            const campaign = createCampaign();
            campaign.actions = [];
            const userData = await contract.generateUserDataCampaign(campaign);
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(15), userData)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing actions");
        }
    })

    it("Should not create campaign when missing count", async function () {
        try {
            const campaign = createCampaign();
            campaign.name = [];
            const userData = await contract.generateUserDataCampaign(campaign);
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(15), userData)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("incorrect data length");
        }
    })

    it("Should not create campaign when missing price", async function () {
        try {
            const campaign = createCampaign();
            campaign.price = 0;
            const userData = await contract.generateUserDataCampaign(campaign);
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(15), userData)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing price");
        }
    })

    it("Should not create campaign when missing duration", async function () {
        try {
            const campaign = createCampaign();
            campaign.duration = 0;
            const userData = await contract.generateUserDataCampaign(campaign);
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(15), userData)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing duration");
        }
    })
    it("Should not create campaign when missing duration period", async function () {
        try {
            const campaign = createCampaign();
            campaign.durationPeriod = 0;
            const userData = await contract.generateUserDataCampaign(campaign);
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(15), userData)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing duration period");
        }
    })
    it("Should not create campaign when missing uri", async function () {
        try {
            const campaign = createCampaign();
            campaign.uri = ethers.utils.toUtf8Bytes("")
            const userData = await contract.generateUserDataCampaign(campaign);
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(15), userData)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing URL");
        }
    })
    it("Should not create campaign when missing startat", async function () {
        try {
            const campaign = createCampaign();
            campaign.startat = 0;
            const userData = await contract.generateUserDataCampaign(campaign);
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(15), userData)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing start");
        }
    })

    it("Should participate for campaign1", async function () {
        const listMyCampaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const id = listMyCampaignsOld[0].id
        //prepare
        const countPropForAdrOld = await contract.connect(addr2).countMyParticipations()
        const countPropForAdsOld = await contract.connect(addr2).countParticipationsForCampaign(id)
        const listPropForAdsOld = await contract.connect(addr2).listParticipantsByCampaign(id, 0, 0)
        const listMyParticipOld = await contract.connect(addr2).listMyParticipations(0, 0)
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        const balanceOld = await tokenContract.balanceOf(addr2.address);
        expect(countPropForAdrOld).equal(0);
        expect(countPropForAdsOld).equal(0);
        expect(listPropForAdsOld.length).equal(0);
        expect(listMyParticipOld.length).equal(0);
        //create props
        const login = "twitter:handle:login";
        const loginBytes = ethers.utils.toUtf8Bytes(login);
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(login));
        const toSign = await contract.prepareSignatureCampaign(addr2.address, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        await (await contract.connect(addr2).participateToCampaign(id, hash, loginBytes, signature)).wait()
        //after
        const countPropForAdr = await contract.connect(addr2).countMyParticipations()
        const countPropForAds = await contract.connect(addr2).countParticipationsForCampaign(id)
        const listPropForAds = await contract.connect(addr2).listParticipantsByCampaign(id, 0, 0)
        const listMyParticip = await contract.connect(addr2).listMyParticipations(0, 0)
        const balanceContract = await contract.balanceToken(tokenContract.address);
        const balance = await tokenContract.balanceOf(addr2.address);
        expect(balance).equal(balanceOld);
        expect(balanceContract).equal(balanceContractOld);
        expect(countPropForAdr).equal(1);
        expect(countPropForAds).equal(1);
        expect(listPropForAds.length).equal(1);
        expect(listMyParticip.length).equal(1);
        expect(listMyParticip[0].user).equal(addr2.address);
        expect(listMyParticip[0].handleHash).equal(hash);
        expect(listMyParticip[0].handleEncrypt).equal(ethers.utils.hexlify(loginBytes));
        expect(listMyParticip[0].date).gt(0);
        expect(listMyParticip[0].id).gt(0);
        expect(listMyParticip[0].campaignId).eq(id);
        expect(listMyParticip[0].canClaim).eq(TriState.UNDEFINED);;
        expect(listMyParticip[0].claimed).eq(false);
    });


    it("Should not participate for non existing campaign", async function () {
        try {
            const login = "twitter:handle:login";
            const loginBytes = ethers.utils.toUtf8Bytes(login);
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(login));
            const toSign = await contract.prepareSignatureCampaign(addr2.address, hash);
            const signature = await testHelper.sign(owner.address, toSign);
            await (await contract.connect(addr2).participateToCampaign(10, hash,loginBytes, signature)).wait()
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("Campaign: campaign not found");
        }
    })

    it("Should not participate because missing login", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
            const id = listMyPropOld[0].id
            const login = "";
            const loginBytes = ethers.utils.toUtf8Bytes(login);
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(login));
            const toSign = await contract.prepareSignatureCampaign(addr2.address, hash);
            const signature = await testHelper.sign(owner.address, toSign);
            await (await contract.connect(addr2).participateToCampaign(id, hash, loginBytes, signature)).wait()
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing login");
        }
    })

    it("Should not participate twice", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
            const id = listMyPropOld[0].id
            const login = "twitter:handle:login";
            const loginBytes = ethers.utils.toUtf8Bytes(login);
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(login));
            const toSign = await contract.prepareSignatureCampaign(addr2.address, hash);
            const signature = await testHelper.sign(owner.address, toSign);
            await (await contract.connect(addr2).participateToCampaign(id, hash, loginBytes, signature)).wait()
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("you already participate to this campaign");
        }
    })

    it("Should not participate if paused", async function () {
        const listMyCampaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const id = listMyCampaignsOld[0].id
        const campaignBefore = await contract.getCampaignsById(id);
        expect(campaignBefore.status).eq(Lifecycle.LIVE);
        await (await contract.connect(addr1).setCampaignStatus(id, Lifecycle.PAUSED)).wait()
        const campaignPaused = await contract.getCampaignsById(id);
        expect(campaignPaused.status).eq(Lifecycle.PAUSED);
        try {
            const login = "twitter:handle:loginnew";
            const loginBytes = ethers.utils.toUtf8Bytes(login);
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(login));
            const toSign = await contract.prepareSignatureCampaign(addr3.address, hash);
            const signature = await testHelper.sign(owner.address, toSign);
            await (await contract.connect(addr3).participateToCampaign(id, hash, loginBytes, signature)).wait()
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("Campaign: not live");
        }
        await (await contract.connect(addr1).setCampaignStatus(id, Lifecycle.LIVE)).wait()
        const campaignAfter = await contract.getCampaignsById(id);
        expect(campaignAfter.status).equal(Lifecycle.LIVE)
    })
    it("Should not allow claim many non existing campaign", async function () {
        try {
            await (await contract.connect(addr1).allowClaimMany([], 10, true)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("campaign not found");
        }
    })
    it("Should not allow claim all non existing campaign", async function () {
        try {
            await (await contract.connect(addr1).allowClaimAll(10, true)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("campaign not found");
        }
    })

    it("Should not allow claim many if not owner", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
            const id = listMyPropOld[0].id
            await (await contract.connect(addr2).allowClaimMany([], id, true)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("you are not the owner");
        }
    })

    it("Should not allow claim all if not owner", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
            const id = listMyPropOld[0].id
            await (await contract.connect(addr2).allowClaimAll(id, true)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("you are not the owner");
        }
    })

    it("Should refuse claim for campaign1", async function () {
        const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
        const id = listMyPropOld[0].id;
        await (await contract.connect(addr1).allowClaimAll(id, false)).wait();
        const listMyProp = await contract.connect(addr2).listMyParticipations(0, 0);
        expect(listMyProp[0].canClaim).equal(TriState.FALSE);
    })

    it("Should not allow claim non existing campaign", async function () {
        try {
            await (await contract.connect(addr2).campaignClaimMany([10])).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("participation not found");
        }
    })

    it("Should not allow claim campaign if not owner", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
            const id = listMyPropOld[0].id
            await (await contract.connect(addr2).allowClaimMany([addr2.address], id, true)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("you are not the owner");
        }
    })

    it("Should refuse claim for campaign", async function () {
        const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
        const id = listMyPropOld[0].id;
        await (await contract.connect(addr1).allowClaimMany([addr2.address], id, false)).wait();
        const listMyProp = await contract.connect(addr2).listMyParticipations(0, 0);
        expect(listMyProp[0].canClaim).equal(TriState.FALSE);
    })

    it("Should not claim non existing participation", async function () {
        try {
            await (await contract.connect(addr2).campaignClaimMany([10])).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("participation not found");
        }
    })

    it("Should not claim participation if not owner", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
            const id = listMyPropOld[0].id
            await (await contract.connect(addr1).campaignClaimMany([id])).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("you are not the user allowed");
        }
    })

    it("Should not claim participation if not allowed to claim", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
            const id = listMyPropOld[0].id
            await (await contract.connect(addr2).campaignClaimMany([id])).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("not allowed to claim");
        }
    })

    it("Should not add balance on non existing campaign", async function () {
        try {
            await (await contract.connect(addr1).addBalance(10, 10)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("campaign not found");
        }
    })

    it("Should not add balance if not campaign owner", async function () {
        try {
            const campaigns = await contract.connect(addr1).listMyCampaigns(0, 0);
            const id = campaigns[0].id;
            await (await contract.connect(addr2).addBalance(id, 10)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("you are not the owner");
        }
    })

    it("Should add balance to campaign using token", async function () {
        const campaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const id = campaignsOld[0].id;
        const balanceOld = await tokenContract.balanceOf(addr1.address);
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        expect(campaignsOld[0].balance.current).equal(0)
        expect(campaignsOld[0].balance.accBalance).equal(0)
        await (await tokenContract.connect(addr1).approve(contract.address, TestHelper.addPrecision(10))).wait();
        await (await contract.connect(addr1).addBalance(id, TestHelper.addPrecision(10))).wait();
        const campaigns = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const balanceContract = await contract.balanceToken(tokenContract.address);
        expect(campaigns[0].balance.current).equal(TestHelper.addPrecision(10))
        expect(campaigns[0].balance.accBalance).equal(TestHelper.addPrecision(10))
        expect(balance).eq(balanceOld.sub(TestHelper.addPrecision(10)));
        expect(balanceContract).eq(balanceContractOld.add(TestHelper.addPrecision(10)));
    })

    it("Should add balance anew to campaign using token", async function () {
        const campaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const id = campaignsOld[0].id;
        const balanceOld = await tokenContract.balanceOf(addr1.address);
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        expect(campaignsOld[0].balance.current).equal(TestHelper.addPrecision(10))
        expect(campaignsOld[0].balance.accBalance).equal(TestHelper.addPrecision(10))
        await (await tokenContract.connect(addr1).approve(contract.address, TestHelper.addPrecision(10))).wait();
        await (await contract.connect(addr1).addBalance(id, TestHelper.addPrecision(10))).wait();
        const campaigns = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const balanceContract = await contract.balanceToken(tokenContract.address);
        expect(campaigns[0].balance.current).equal(TestHelper.addPrecision(20))
        expect(campaigns[0].balance.accBalance).equal(TestHelper.addPrecision(20))
        expect(balance).eq(balanceOld.sub(TestHelper.addPrecision(10)));
        expect(balanceContract).eq(balanceContractOld.add(TestHelper.addPrecision(10)));
    })

    it("Should not delete non existing campaign", async function () {
        try {
            await (await contract.connect(addr1).deleteCampaign(10)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("campaign not found");
        }
    })

    it("Should not delete campaign if not owner", async function () {
        try {
            const listMyCampaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
            const id = listMyCampaignsOld[0].id
            await (await contract.connect(addr2).deleteCampaign(id)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("you are not the owner");
        }
    })

    it("Should delete campaign1", async function () {
        const countCampaignsOld = await contract.countCampaigns();
        const listCampaignsOld = (await contract.listCampaigns(0, 0));
        const countMyCampaignsOld = await contract.connect(addr1).countMyCampaigns();
        const listMyCampaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(countCampaignsOld).equal(1);
        expect(listCampaignsOld.length).equal(1);
        expect(countMyCampaignsOld).equal(1);
        expect(listMyCampaignsOld.length).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(965));
        const id = listMyCampaignsOld[0].id
        await (await contract.connect(addr1).deleteCampaign(id)).wait();
        const countCampaigns = await contract.countCampaigns();
        const listCampaigns = (await contract.listCampaigns(0, 0));
        const countMyCampaigns = await contract.connect(addr1).countMyCampaigns();
        const listMyCampaigns = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const key = await contract.generateServiceKey(SERVICE_ID, id);
        const lock = await contract.locked(key)
        expect(lock.payer).equal(addr1.address)
        expect(lock.unlocked).equal(true)
        expect(countCampaigns).equal(0);
        expect(listCampaigns.length).equal(0);
        expect(countMyCampaigns).equal(0);
        expect(listMyCampaigns.length).equal(0);
        expect(balance).equal(TestHelper.addPrecision(1000));
    })

    it("Should create campaign for addr1 using approve", async function () {
        const countCampaignsOld = await contract.countCampaigns();
        const listCampaignsOld = (await contract.listCampaigns(0, 0));
        const countMyCampaignsOld = await contract.connect(addr1).countMyCampaigns();
        const listMyCampaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(countCampaignsOld).equal(0);
        expect(listCampaignsOld.length).equal(0);
        expect(countMyCampaignsOld).equal(0);
        expect(listMyCampaignsOld.length).equal(0);
        expect(balanceBefore).equal(TestHelper.addPrecision(1000));
        //create
        const campaign = createCampaign();
        await (await tokenContract.connect(addr1).approve(contract.address, TestHelper.addPrecision(15))).wait()
        await (await contract.connect(addr1).createCampaign(campaign)).wait();
        //check
        const countCampaigns = await contract.countCampaigns();
        const listCampaigns = (await contract.listCampaigns(0, 0));
        const countMyCampaigns = await contract.connect(addr1).countMyCampaigns();
        const listMyCampaigns = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const lockCount = await contract.lockCount();
        expect(countCampaigns).equal(1);
        expect(listCampaigns.length).equal(1);
        expect(countMyCampaigns).equal(1);
        expect(listMyCampaigns.length).equal(1);
        expect(listMyCampaigns[0].network).equal(campaign.network);
        expect(listMyCampaigns[0].actions.length).equal(campaign.actions.length);
        expect(listMyCampaigns[0].name).equal(campaign.name);
        expect(listMyCampaigns[0].price).equal(campaign.price);
        expect(listMyCampaigns[0].priceCurrency).equal(campaign.priceCurrency);
        expect(listMyCampaigns[0].startat).equal(campaign.startat);
        expect(listMyCampaigns[0].endat).equal(campaign.endat);
        expect(listMyCampaigns[0].duration).equal(campaign.duration);
        expect(listMyCampaigns[0].durationPeriod).equal(campaign.durationPeriod);
        expect(listMyCampaigns[0].owner).equal(addr1.address);
        expect(listMyCampaigns[0].balance.current).equal(0);
        expect(listMyCampaigns[0].balance.accBalance).equal(0);
        expect(listMyCampaigns[0].id).gt(0);
        expect(balance).equal(TestHelper.addPrecision(985));
        expect(lockCount).eq(2)
    });

    it("Should create campaign for addr1 using approve and coin", async function () {
        const countCampaignsOld = await contract.countCampaigns();
        const listCampaignsOld = (await contract.listCampaigns(0, 0));
        const countMyCampaignsOld = await contract.connect(addr1).countMyCampaigns();
        const listMyCampaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(countCampaignsOld).equal(1);
        expect(listCampaignsOld.length).equal(1);
        expect(countMyCampaignsOld).equal(1);
        expect(listMyCampaignsOld.length).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(985));
        //create
        const campaign = createCampaign();
        campaign.priceCurrency = ethers.constants.AddressZero;
        await (await tokenContract.connect(addr1).approve(contract.address, TestHelper.addPrecision(15))).wait()
        await (await contract.connect(addr1).createCampaign(campaign)).wait();
        //check
        const countCampaigns = await contract.countCampaigns();
        const listCampaigns = (await contract.listCampaigns(0, 0));
        const countMyCampaigns = await contract.connect(addr1).countMyCampaigns();
        const listMyCampaigns = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const lockCount = await contract.lockCount();
        expect(countCampaigns).equal(2);
        expect(listCampaigns.length).equal(2);
        expect(countMyCampaigns).equal(2);
        expect(listMyCampaigns.length).equal(2);
        expect(listMyCampaigns[1].network).equal(campaign.network);
        expect(listMyCampaigns[1].actions.length).equal(campaign.actions.length);
        expect(listMyCampaigns[1].name).equal(campaign.name);
        expect(listMyCampaigns[1].price).equal(campaign.price);
        expect(listMyCampaigns[1].priceCurrency).equal(ethers.constants.AddressZero);
        expect(listMyCampaigns[1].priceCurrency).equal(campaign.priceCurrency);
        expect(listMyCampaigns[1].startat).equal(campaign.startat);
        expect(listMyCampaigns[1].endat).equal(campaign.endat);
        expect(listMyCampaigns[1].duration).equal(campaign.duration);
        expect(listMyCampaigns[1].durationPeriod).equal(campaign.durationPeriod);
        expect(listMyCampaigns[1].owner).equal(addr1.address);
        expect(listMyCampaigns[1].balance.current).equal(0);
        expect(listMyCampaigns[1].balance.accBalance).equal(0);
        expect(listMyCampaigns[1].id).gt(0);
        expect(balance).equal(TestHelper.addPrecision(970));
        expect(lockCount).eq(3)
    });

    it("Should participate for campaign1 pay with token", async function () {
        const listMyCampaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const id = listMyCampaignsOld[0].id
        //prepare
        const countPropForAdrOld = await contract.connect(addr2).countMyParticipations()
        const countPropForAdsOld = await contract.connect(addr2).countParticipationsForCampaign(id)
        const listPropForAdsOld = await contract.connect(addr2).listParticipantsByCampaign(id, 0, 0)
        const listMyParticipOld = await contract.connect(addr2).listMyParticipations(0, 0)
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        const balanceOld = await tokenContract.balanceOf(addr2.address);
        expect(countPropForAdrOld).equal(1);
        expect(countPropForAdsOld).equal(0);
        expect(listPropForAdsOld.length).equal(0);
        expect(listMyParticipOld.length).equal(1);
        //create props
        const login = "twitter:handle:login";
        const loginBytes = ethers.utils.toUtf8Bytes(login);
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(login));
        const toSign = await contract.prepareSignatureCampaign(addr2.address, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        await (await contract.connect(addr2).participateToCampaign(id, hash, loginBytes, signature)).wait()
        //after
        const countPropForAdr = await contract.connect(addr2).countMyParticipations()
        const countPropForAds = await contract.connect(addr2).countParticipationsForCampaign(id)
        const listPropForAds = await contract.connect(addr2).listParticipantsByCampaign(id, 0, 0)
        const listMyParticip = await contract.connect(addr2).listMyParticipations(0, 0)
        const balanceContract = await contract.balanceToken(tokenContract.address);
        const balance = await tokenContract.balanceOf(addr2.address);
        expect(balance).equal(balanceOld);
        expect(balanceContract).equal(balanceContractOld);
        expect(countPropForAdr).equal(2);
        expect(countPropForAds).equal(1);
        expect(listPropForAds.length).equal(1);
        expect(listMyParticip.length).equal(2);
        expect(listMyParticip[1].user).equal(addr2.address);
        expect(listMyParticip[1].handleHash).equal(hash);
        expect(listMyParticip[1].handleEncrypt).equal(ethers.utils.hexlify(loginBytes));
        expect(listMyParticip[1].date).gt(0);
        expect(listMyParticip[1].id).gt(0);
        expect(listMyParticip[1].campaignId).eq(id);
        expect(listMyParticip[1].canClaim).eq(TriState.UNDEFINED);;
        expect(listMyParticip[1].claimed).eq(false);
    });


    it("Should participate for campaign2 pay with coin", async function () {
        const listMyCampaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const id = listMyCampaignsOld[1].id
        //prepare
        const countPropForAdrOld = await contract.connect(addr2).countMyParticipations()
        const countPropForAdsOld = await contract.connect(addr2).countParticipationsForCampaign(id)
        const listPropForAdsOld = await contract.connect(addr2).listParticipantsByCampaign(id, 0, 0)
        const listMyParticipOld = await contract.connect(addr2).listMyParticipations(0, 0)
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        const balanceCoinContractOld = await contract.balanceCoin();
        const balanceOld = await tokenContract.balanceOf(addr2.address);
        const balanceCoinOld = await addr2.getBalance();
        expect(countPropForAdrOld).equal(2);
        expect(countPropForAdsOld).equal(0);
        expect(listPropForAdsOld.length).equal(0);
        expect(listMyParticipOld.length).equal(2);
        //create props
        const login = "twitter:handle:login";
        const loginBytes = ethers.utils.toUtf8Bytes(login);
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(login));
        const toSign = await contract.prepareSignatureCampaign(addr2.address, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        await (await contract.connect(addr2).participateToCampaign(id, hash, loginBytes, signature)).wait()
        //after
        const countPropForAdr = await contract.connect(addr2).countMyParticipations()
        const countPropForAds = await contract.connect(addr2).countParticipationsForCampaign(id)
        const listPropForAds = await contract.connect(addr2).listParticipantsByCampaign(id, 0, 0)
        const listMyParticip = await contract.connect(addr2).listMyParticipations(0, 0)
        const balanceContract = await contract.balanceToken(tokenContract.address);
        const balanceCoinContract = await contract.balanceCoin();
        const balance = await tokenContract.balanceOf(addr2.address);
        const balanceCoin = await addr2.getBalance();
        expect(TestHelper.removePrecision(balanceCoin)).approximately(TestHelper.removePrecision(balanceCoinOld), 0.2);
        expect(balance).equal(balanceOld);
        expect(balanceCoinContract).equal(balanceCoinContractOld);
        expect(balanceContract).equal(balanceContractOld);
        expect(countPropForAdr).equal(3);
        expect(countPropForAds).equal(1);
        expect(listPropForAds.length).equal(1);
        expect(listMyParticip.length).equal(3);
        expect(listMyParticip[2].user).equal(addr2.address);
        expect(listMyParticip[2].handleHash).equal(hash);
        expect(listMyParticip[2].date).gt(0);
        expect(listMyParticip[2].id).gt(0);
        expect(listMyParticip[2].campaignId).eq(id);
        expect(listMyParticip[2].canClaim).eq(TriState.UNDEFINED);;
        expect(listMyParticip[2].claimed).eq(false);
    });

    it("Should not claim if not allowed", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
            const id = listMyPropOld[0].id;
            await (await contract.connect(addr2).campaignClaimMany([id])).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("not allowed to claim");
        }
    })

    it("Should allow claim for participation 1", async function () {
        const listMyCamp = await contract.connect(addr1).listMyCampaigns(0, 0);
        const id = listMyCamp[0].id;
        const listMyPartOld = await contract.connect(addr2).listMyParticipations(0, 0);
        expect(listMyPartOld.length).equal(3)
        expect(listMyPartOld[1].canClaim).equal(TriState.UNDEFINED);
        const countNonClaimBefore = await contract.countCanClaimParticipationsForCampaign(id, TriState.UNDEFINED);
        const countClaimBefore = await contract.countCanClaimParticipationsForCampaign(id, TriState.TRUE);
        expect(countNonClaimBefore).equal(1)
        expect(countClaimBefore).equal(0)
        await (await contract.connect(addr1).allowClaimMany([addr2.address], id, true)).wait();
        const listMyPart = await contract.connect(addr2).listMyParticipations(0, 0);
        expect(listMyPart.length).equal(3)
        expect(listMyPart[1].canClaim).equal(TriState.TRUE);
        const countNonClaimAfter = await contract.countCanClaimParticipationsForCampaign(id, TriState.UNDEFINED);
        const countClaimAfter = await contract.countCanClaimParticipationsForCampaign(id, TriState.TRUE);
        expect(countNonClaimAfter).equal(0)
        expect(countClaimAfter).equal(1)
    })

    it("Should allow claim for participation 2", async function () {
        const listMyCamp = await contract.connect(addr1).listMyCampaigns(0, 0);
        const id = listMyCamp[1].id;
        const listMyPartOld = await contract.connect(addr2).listMyParticipations(0, 0);
        expect(listMyPartOld.length).equal(3)
        expect(listMyPartOld[2].canClaim).equal(TriState.UNDEFINED);
        await (await contract.connect(addr1).allowClaimAll(id, true)).wait();
        const listMyPart = await contract.connect(addr2).listMyParticipations(0, 0);
        expect(listMyPart.length).equal(3)
        expect(listMyPart[2].canClaim).equal(TriState.TRUE);
    })

    it("Should not claim participation1 if no balance", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
            expect(listMyPropOld.length).eq(3)
            const id = listMyPropOld[1].id
            expect(listMyPropOld[1].canClaim).equal(TriState.TRUE);
            expect(listMyPropOld[1].claimed).equal(false);
            await (await contract.connect(addr2).campaignClaimMany([id])).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("not enough balance for this campaign");
        }
    })

    it("Should not claim participation2 if no balance", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
            expect(listMyPropOld.length).eq(3)
            const id = listMyPropOld[2].id
            expect(listMyPropOld[2].canClaim).equal(TriState.TRUE);
            expect(listMyPropOld[2].claimed).equal(false);
            await (await contract.connect(addr2).campaignClaimMany([id])).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("not enough balance for this campaign");
        }
    })

    it("Should add balance to campaign1 using token", async function () {
        const campaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const id = campaignsOld[0].id;
        const balanceOld = await tokenContract.balanceOf(addr1.address);
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        expect(campaignsOld[0].balance.current).equal(0)
        expect(campaignsOld[0].balance.accBalance).equal(0)
        await (await tokenContract.connect(addr1).approve(contract.address, TestHelper.addPrecision(10))).wait();
        await (await contract.connect(addr1).addBalance(id, TestHelper.addPrecision(10))).wait();
        const campaigns = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const balanceContract = await contract.balanceToken(tokenContract.address);
        expect(campaigns[0].balance.current).equal(TestHelper.addPrecision(10))
        expect(campaigns[0].balance.accBalance).equal(TestHelper.addPrecision(10))
        expect(balance).eq(balanceOld.sub(TestHelper.addPrecision(10)));
        expect(balanceContract).eq(balanceContractOld.add(TestHelper.addPrecision(10)));
    })

    it("Should add balance to campaign2 using coin", async function () {
        const campaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const id = campaignsOld[1].id;
        const balanceCoinOld = await addr1.getBalance();
        const balanceCoinContractOld = await contract.balanceCoin();
        expect(campaignsOld[1].balance.current).equal(0)
        expect(campaignsOld[1].balance.accBalance).equal(0)
        await (await contract.connect(addr1).addBalance(id, 0, { value: TestHelper.addPrecision(10) })).wait();
        const campaigns = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balanceCoin = await addr1.getBalance();
        const balanceCoinContract = await contract.balanceCoin();
        expect(campaigns[1].balance.current).equal(TestHelper.addPrecision(10))
        expect(campaigns[1].balance.accBalance).equal(TestHelper.addPrecision(10))
        expect(TestHelper.removePrecision(balanceCoin)).approximately(TestHelper.removePrecision(balanceCoinOld.sub(TestHelper.addPrecision(10))), 0.1);
        expect(TestHelper.removePrecision(balanceCoinContract)).approximately(TestHelper.removePrecision(balanceCoinContractOld.add(TestHelper.addPrecision(10))), 0.1);
    })


    it("Should claim participation1 if allowed to claim using token", async function () {
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        const balanceCoinContractOld = await contract.balanceCoin();
        const balanceOld = await tokenContract.balanceOf(addr2.address);
        const balanceCoinOld = await addr2.getBalance();
        const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
        expect(listMyPropOld.length).eq(3)
        const id = listMyPropOld[1].id
        expect(listMyPropOld[1].canClaim).equal(TriState.TRUE);
        expect(listMyPropOld[1].claimed).equal(false);
        await (await contract.connect(addr2).campaignClaimMany([id])).wait();
        const listMyProp = await contract.connect(addr2).listMyParticipations(0, 0);
        expect(listMyProp.length).eq(3)
        const props = listMyProp[1]
        const ads = await contract.getCampaignsById(props.campaignId);
        const balanceContract = await contract.balanceToken(tokenContract.address);
        const balanceCoinContract = await contract.balanceCoin();
        const balance = await tokenContract.balanceOf(addr2.address);
        const balanceCoin = await addr2.getBalance();
        expect(props.canClaim).equal(TriState.TRUE);
        expect(props.claimed).equal(true);
        expect(TestHelper.removePrecision(balanceCoin)).approximately(TestHelper.removePrecision(balanceCoinOld), 0.01);
        expect(balanceCoinContract).equal(balanceCoinContractOld);
        expect(balance).equal(balanceOld.add(ads.price));
        expect(balanceContract).equal(balanceContractOld.sub(ads.price));
    })

    it("Should claim participation2 if allowed to claim using coin", async function () {
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        const balanceCoinContractOld = await contract.balanceCoin();
        const balanceOld = await tokenContract.balanceOf(addr2.address);
        const balanceCoinOld = await addr2.getBalance();
        const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
        expect(listMyPropOld.length).eq(3)
        const id = listMyPropOld[2].id
        expect(listMyPropOld[2].canClaim).equal(TriState.TRUE);
        expect(listMyPropOld[2].claimed).equal(false);
        await (await contract.connect(addr2).campaignClaimMany([id])).wait();
        const listMyProp = await contract.connect(addr2).listMyParticipations(0, 0);
        expect(listMyProp.length).eq(3)
        const props = listMyProp[2]
        const balanceContract = await contract.balanceToken(tokenContract.address);
        const balanceCoinContract = await contract.balanceCoin();
        const balance = await tokenContract.balanceOf(addr2.address);
        const balanceCoin = await addr2.getBalance();
        const ads = await contract.getCampaignsById(props.campaignId);
        expect(props.canClaim).equal(TriState.TRUE);
        expect(props.claimed).equal(true);
        expect(TestHelper.removePrecision(balanceCoin)).approximately(TestHelper.removePrecision(balanceCoinOld.add(ads.price)), 0.01);
        expect(TestHelper.removePrecision(balanceCoinContract)).approximately(TestHelper.removePrecision(balanceCoinContractOld.sub(ads.price)), 0.01);
        expect(balance).equal(balanceOld);
        expect(balanceContract).equal(balanceContractOld);
    })

    it("Should add balance to campaign using token after claim", async function () {
        const campaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const id = campaignsOld[0].id;
        const balanceOld = await tokenContract.balanceOf(addr1.address);
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        expect(campaignsOld[0].balance.current).equal(TestHelper.addPrecision(9))
        expect(campaignsOld[0].balance.accBalance).equal(TestHelper.addPrecision(10))
        await (await tokenContract.connect(addr1).approve(contract.address, TestHelper.addPrecision(10))).wait();
        await (await contract.connect(addr1).addBalance(id, TestHelper.addPrecision(10))).wait();
        const campaigns = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const balanceContract = await contract.balanceToken(tokenContract.address);
        expect(campaigns[0].balance.current).equal(TestHelper.addPrecision(19))
        expect(campaigns[0].balance.accBalance).equal(TestHelper.addPrecision(20))
        expect(balance).eq(balanceOld.sub(TestHelper.addPrecision(10)));
        expect(balanceContract).eq(balanceContractOld.add(TestHelper.addPrecision(10)));
    })

    it("Should add balance to campaign2 using coin after claim", async function () {
        const campaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const id = campaignsOld[1].id;
        const balanceCoinOld = await addr1.getBalance();
        const balanceCoinContractOld = await contract.balanceCoin();
        expect(campaignsOld[1].balance.current).equal(TestHelper.addPrecision(9))
        expect(campaignsOld[1].balance.accBalance).equal(TestHelper.addPrecision(10))
        await (await contract.connect(addr1).addBalance(id, 0, { value: TestHelper.addPrecision(10) })).wait();
        const campaigns = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balanceCoin = await addr1.getBalance();
        const balanceCoinContract = await contract.balanceCoin();
        expect(campaigns[1].balance.current).equal(TestHelper.addPrecision(19))
        expect(campaigns[1].balance.accBalance).equal(TestHelper.addPrecision(20))
        expect(TestHelper.removePrecision(balanceCoin)).approximately(TestHelper.removePrecision(balanceCoinOld.sub(TestHelper.addPrecision(10))), 0.1);
        expect(TestHelper.removePrecision(balanceCoinContract)).approximately(TestHelper.removePrecision(balanceCoinContractOld.add(TestHelper.addPrecision(10))), 0.1);
    })

    it("Should not allow claim twice", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyParticipations(0, 0);
            const id = listMyPropOld[1].id;
            await (await contract.connect(addr2).campaignClaimMany([id])).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("already claimed");
        }
    })


    it("Should delete campaign1 and campaign2", async function () {
        const countCampaignsOld = await contract.countCampaigns();
        const listCampaignsOld = (await contract.listCampaigns(0, 0));
        const countMyCampaignsOld = await contract.connect(addr1).countMyCampaigns();
        const listMyCampaignsOld = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        const balanceCoinBefore = await addr1.getBalance();
        expect(countCampaignsOld).equal(2);
        expect(listCampaignsOld.length).equal(2);
        expect(countMyCampaignsOld).equal(2);
        expect(listMyCampaignsOld.length).equal(2);
        expect(balanceBefore).equal(TestHelper.addPrecision(950));
        const id1 = listMyCampaignsOld[0].id
        const id2 = listMyCampaignsOld[1].id
        await (await contract.connect(addr1).deleteCampaign(id1)).wait();
        await (await contract.connect(addr1).deleteCampaign(id2)).wait();
        const countCampaigns = await contract.countCampaigns();
        const listCampaigns = (await contract.listCampaigns(0, 0));
        const countMyCampaigns = await contract.connect(addr1).countMyCampaigns();
        const listMyCampaigns = await contract.connect(addr1).listMyCampaigns(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const balanceCoin = await addr1.getBalance();
        const key = await contract.generateServiceKey(SERVICE_ID, id1);
        const lock = await contract.locked(key)
        expect(lock.payer).equal(addr1.address)
        expect(lock.unlocked).equal(true)
        expect(countCampaigns).equal(0);
        expect(listCampaigns.length).equal(0);
        expect(countMyCampaigns).equal(0);
        expect(listMyCampaigns.length).equal(0);
        //return balance token + price of campaign is 15
        const prevBalance = TestHelper.removePrecision(balanceBefore);
        const prevBalancePlusPrice = TestHelper.addPrecision(prevBalance + (15 * 2));
        const newBalance = listMyCampaignsOld[0].balance.current.add(prevBalancePlusPrice);
        expect(balance).equal(newBalance);
        //return balance coin
        const newBalanceCoin = listMyCampaignsOld[1].balance.current.add(balanceCoinBefore);
        expect(TestHelper.removePrecision(balanceCoin)).approximately(TestHelper.removePrecision(newBalanceCoin), 0.1);
    })

    it("Should create 15 campaign", async function () {
        for (let i = 0; i < 15; i++) {
            const campaign = createCampaign();
            campaign.actions = [i];
            campaign.priceCurrency = ethers.constants.AddressZero;
            await (await tokenContract.connect(addr1).approve(contract.address, TestHelper.addPrecision(20))).wait()
            await (await contract.connect(addr1).createCampaign(campaign)).wait();
        }
        //check
        const countCampaigns = await contract.countCampaigns();
        const listCampaigns = (await contract.listCampaigns(0, 0));
        const listCampaignsLimit = (await contract.listCampaigns(10, 5));
        const countMyCampaigns = await contract.connect(addr1).countMyCampaigns();
        const listMyCampaigns = await contract.connect(addr1).listMyCampaigns(0, 0);
        const listMyCampaignsLimit = await contract.connect(addr1).listMyCampaigns(10, 5);
        expect(countCampaigns).equal(15);
        expect(listCampaigns.length).equal(15);
        expect(listCampaignsLimit.length).equal(5);
        expect(countMyCampaigns).equal(15);
        expect(listMyCampaigns.length).equal(15);
        expect(listMyCampaignsLimit.length).equal(5);
        expect(listCampaigns[0].actions[0]).equal("0");
        expect(listCampaigns[14].actions[0]).equal("14");
        expect(listMyCampaigns[0].actions[0]).equal("0");
        expect(listMyCampaigns[14].actions[0]).equal("14");
        expect(listCampaignsLimit[0].actions[0]).equal("10");
        expect(listCampaignsLimit[1].actions[0]).equal("11");
        expect(listCampaignsLimit[2].actions[0]).equal("12");
        expect(listCampaignsLimit[3].actions[0]).equal("13");
        expect(listCampaignsLimit[4].actions[0]).equal("14");
        expect(listMyCampaignsLimit[0].actions[0]).equal("10");
        expect(listMyCampaignsLimit[1].actions[0]).equal("11");
        expect(listMyCampaignsLimit[2].actions[0]).equal("12");
        expect(listMyCampaignsLimit[3].actions[0]).equal("13");
        expect(listMyCampaignsLimit[4].actions[0]).equal("14");
    });

    it("Should create 15 props", async function () {
        const listCampaignsOld = (await contract.listCampaigns(0, 0));
        for (let i = 0; i < 15; i++) {
            const id = listCampaignsOld[i].id;
            const login = "login" + i;
            const loginBytes = ethers.utils.toUtf8Bytes(login);
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(login));
            const toSign = await contract.prepareSignatureCampaign(addr2.address, hash);
            const signature = await testHelper.sign(owner.address, toSign);
            await (await contract.connect(addr2).participateToCampaign(id, hash, loginBytes,signature)).wait();
        }
        //check
        const lastId = listCampaignsOld[14].id;
        const countMyProps = await contract.connect(addr2).countMyParticipations();
        const listMyProps = await contract.connect(addr2).listMyParticipations(0, 0);
        const listMyPropsLimit = await contract.connect(addr2).listMyParticipations(10, 5);
        const listMyPartCampaign = await contract.connect(addr2).listMyParticipationsCampaign(0, 0);
        const listMyPartCampaignLimit = await contract.connect(addr2).listMyParticipationsCampaign(10, 5);
        const countParticipationsForCampaign = await contract.connect(addr2).countParticipationsForCampaign(lastId);
        const listParticipantsByCampaign = await contract.connect(addr2).listParticipantsByCampaign(lastId, 0, 0);
        expect(listMyPartCampaign.length).equal(18);
        expect(listMyPartCampaign[14].id).equal("15");
        expect(listMyPartCampaignLimit.length).equal(5);
        expect(listMyPartCampaignLimit[0].id).equal("11");
        expect(listMyPartCampaignLimit[4].id).equal("15");
        expect(countParticipationsForCampaign).equal(1);
        expect(listParticipantsByCampaign.length).equal(1);
        expect(listParticipantsByCampaign[0].campaignId).equal("18");
        expect(countMyProps).equal(18);
        expect(listMyProps.length).equal(18);
        expect(listMyPropsLimit.length).equal(5);
        expect(listMyProps[0].campaignId).equal("1");
        expect(listMyProps[14].campaignId).equal("15");
        expect(listMyPropsLimit[0].campaignId).equal("11");
        expect(listMyPropsLimit[1].campaignId).equal("12");
        expect(listMyPropsLimit[2].campaignId).equal("13");
        expect(listMyPropsLimit[3].campaignId).equal("14");
        expect(listMyPropsLimit[4].campaignId).equal("15");
    });

    it("Should set config", async function () {
        const configOld = await contract.connect(addr1).socialConfig();
        const copy = { ...configOld };
        copy.campaign = { ...copy.campaign }
        copy.validatorRequire = false;
        copy.campaign.paymentType = 1;
        await (await contract.setConfig(copy)).wait();
        const config = await contract.connect(addr1).socialConfig();
        expect(config.tokenAddress).equal(tokenContract.address);
        expect(config.validatorRequire).equal(false);
        expect(config.validator).equal(owner.address);
        expect(config.campaign.currency).eq(tokenContract.address);
        expect(config.campaign.paymentType).eq(1);
        expect(config.campaign.service).eq(SERVICE_ID);
    });

    it("Should not allow non owner set config", async function () {
        try {
            const configOld = await contract.connect(addr1).socialConfig();
            await (await contract.connect(addr3).setConfig(configOld)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing role");
        }
    })
    it("Should not participate if campaign not started", async function () {
        const campaign = createCampaign();
        campaign.startat = DateUtils.addHours(DateUtils.nowSeconds(), 1);
        await (await tokenContract.connect(addr3).approve(contract.address, TestHelper.addPrecision(20))).wait()
        await (await contract.connect(addr3).createCampaign(campaign)).wait();
        const campaigns = await contract.connect(addr3).listMyCampaigns(0,0);
        expect(campaigns.length).equal(1)
        try {
            const login = "twitter:login4";
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(login));
            const loginBytes = ethers.utils.toUtf8Bytes(login);
            const toSign = await contract.prepareSignatureCampaign(addr4.address, hash);
            const signature = await testHelper.sign(owner.address, toSign);
            await contract.connect(addr4).participateToCampaign(campaigns[0].id, hash, loginBytes, signature);
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("campaign not started");
        }
    });
    it("Should not participate if campaign ended", async function () {
        const campaign = createCampaign();
        campaign.endat = DateUtils.addHours(DateUtils.nowSeconds(), -1);
        await (await tokenContract.connect(addr3).approve(contract.address, TestHelper.addPrecision(20))).wait()
        await (await contract.connect(addr3).createCampaign(campaign)).wait();
        const campaigns = await contract.connect(addr3).listMyCampaigns(0,0);
        expect(campaigns.length).equal(2)
        try {
            const login = "twitter:login4";
            const loginBytes = ethers.utils.toUtf8Bytes(login);
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(login));
            const toSign = await contract.prepareSignatureCampaign(addr4.address, hash);
            const signature = await testHelper.sign(owner.address, toSign);
            await contract.connect(addr4).participateToCampaign(campaigns[1].id, hash, loginBytes, signature);
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("campaign ended");
        }
    });

    it("Should set config", async function () {
        const configOld = await contract.connect(addr1).socialConfig();
        const copy = { ...configOld };
        copy.campaign = { ...copy.campaign }
        copy.validatorRequire = false;
        copy.campaign.paymentType = 1;
        await (await contract.setConfig(copy)).wait();
        const config = await contract.connect(addr1).socialConfig();
        expect(config.tokenAddress).equal(tokenContract.address);
        expect(config.validatorRequire).equal(false);
        expect(config.validator).equal(owner.address);
        expect(config.campaign.currency).eq(tokenContract.address);
        expect(config.campaign.paymentType).eq(1);
        expect(config.campaign.service).eq(SERVICE_ID);
    });

    it("Should not allow non owner set config", async function () {
        try {
            const configOld = await contract.connect(addr1).socialConfig();
            await (await contract.connect(addr3).setConfig(configOld)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing role");
        }
    })
    it("Should not allow non owner delete ads", async function () {
        try {
            const listMyAds = await contract.connect(addr1).listMyCampaigns(0, 0);
            const id = listMyAds[0].id;
            await (await contract.connect(addr3).deleteACampaign(id)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing role");
        }
    })
    it("Should allow owner delete campaign", async function () {
        const listMyAds = await contract.connect(addr1).listMyCampaigns(0, 0);
        const id = listMyAds[0].id;
        await (await contract.deleteACampaign(id)).wait();
    })

    it("Should set config delete virtually", async function () {
        const configOld = await contract.connect(addr1).socialConfig();
        expect(configOld.deleteDefinitely).eq(true);
        const copy = { ...configOld };
        copy.deleteDefinitely = false;
        await (await contract.setConfig(copy)).wait();
        const config = await contract.connect(addr1).socialConfig();
        expect(config.deleteDefinitely).eq(false);
    });

    it("Should update campaign to pause for delete virtually", async function () {
        const adsCountOld = await contract.countCampaigns();
        const listAdsOld = (await contract.listCampaigns(0, 0));
        expect(adsCountOld).gt(0);
        expect(listAdsOld.length).gt(0);
        //create
        const ads = {...listAdsOld[2]};
        expect(ads.status).eq(Lifecycle.LIVE);
        ads.status = Lifecycle.PAUSED;
        await (await contract.connect(addr1).setCampaignStatus(ads.id, Lifecycle.PAUSED)).wait();
        //check
        const adsCount = await contract.countCampaigns();
        const listAds = (await contract.listCampaigns(0, 0));
        const listPaused = (await contract.listCampaignByStatus(0, 0, Lifecycle.PAUSED));
        const listLived = (await contract.listCampaignByStatus(0, 0, Lifecycle.LIVE));
        const listDeleted = (await contract.listCampaignByStatus(0, 0, Lifecycle.DELETE));
        expect(adsCount).gt(0);
        expect(listAds[2].status).equal(Lifecycle.PAUSED)
        expect(listPaused.length).equal(16)
        expect(listPaused.filter(e=>e.id.gt(0)).length).equal(1)
        expect(listLived.length).equal(16)
        expect(listLived.filter(e=>e.id.gt(0)).length).equal(15)
        expect(listDeleted.length).equal(16)
        expect(listDeleted.filter(e=>e.id.gt(0)).length).equal(0)
    });

    it("Should update campaign for delete virtually", async function () {
        const adsCountOld = await contract.countCampaigns();
        const listAdsOld = (await contract.listCampaigns(0, 0));
        expect(adsCountOld).gt(0);
        expect(listAdsOld.length).gt(0);
        //create
        const ads = listAdsOld[1];
        expect(ads.status).eq(Lifecycle.LIVE);
        await (await contract.connect(addr1).deleteCampaign(ads.id)).wait();
        //check
        const adsCount = await contract.countCampaigns();
        const listAds = (await contract.listCampaigns(0, 0));
        const listPaused = (await contract.listCampaignByStatus(0, 0, Lifecycle.PAUSED));
        const listLived = (await contract.listCampaignByStatus(0, 0, Lifecycle.LIVE));
        const listDeleted = (await contract.listCampaignByStatus(0, 0, Lifecycle.DELETE));
        expect(adsCount).gt(0);
        expect(listAds[1].status).equal(Lifecycle.DELETE)
        expect(listPaused.length).equal(16)
        expect(listPaused.filter(e=>e.id.gt(0)).length).equal(1)
        expect(listLived.length).equal(16)
        expect(listLived.filter(e=>e.id.gt(0)).length).equal(14)
        expect(listDeleted.length).equal(16)
        expect(listDeleted.filter(e=>e.id.gt(0)).length).equal(1)
    });

    it("Should not participate on deleted campaign", async function () {
        try {
            const listAds = (await contract.listCampaigns(0, 0));
            expect(listAds[1].status).equal(Lifecycle.DELETE)
            const login = "twitter:handle:login";
            const loginBytes = ethers.utils.toUtf8Bytes(login);
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(login));
            const toSign = await contract.prepareSignatureCampaign(addr2.address, hash);
            const signature = await testHelper.sign(owner.address, toSign);
            await (await contract.connect(addr2).participateToCampaign(listAds[1].id, hash, loginBytes, signature)).wait()
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("Campaign: not live");
        }
    })



    function createCampaign() {
        return {
            id: 0,
            network: SocialNetworkEnum.twitter,
            actions: [SocialActionEnum.follow],
            name: ethers.utils.hexZeroPad(ethers.utils.toUtf8Bytes("CAMPAIGN1"), 32) as eths.utils.BytesLike,
            uri: ethers.utils.toUtf8Bytes("https://twitter.com"),
            price: TestHelper.addPrecision(1) as BigNumberish,
            priceCurrency: tokenContract.address,
            startat: DateUtils.nowSeconds() - 1000 * 60,
            endat: DateUtils.nowSeconds() + 1000 * 60,
            duration: 10,
            durationPeriod: SocialDurationPeriodEnum.day,
            owner: ethers.constants.AddressZero,
            status: Lifecycle.LIVE,
            balance: {
                description: ethers.utils.toUtf8Bytes("DESCRIPTION"),
                current:10000,
                accBalance: 10000,
                pendingBalance: 10000
            },
            pubKey: []
        }
    }
});