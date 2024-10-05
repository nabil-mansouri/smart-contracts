//must be first (mock)
import { TestHelper } from "./testHelper";
//import
import { expect } from "chai";
import "mocha";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { SocialAdsContractProxy, SocialViews, TokenContract } from 'typechain-types';
import { ethers } from "hardhat";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { SocialAudiencesEnum, SocialDurationPeriodEnum, SocialNetworkEnum } from "src/socialService";
import { Lifecycle, TriState } from "src/utils";

describe("SocialAds", function () {
    let contract: SocialAdsContractProxy;
    let tokenContract: TokenContract;
    let owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress, addr3: SignerWithAddress, addr4: SignerWithAddress;
    const SERVICE_ID = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_ADS"));
    const testHelper = new TestHelper
    before(async function () {
        await TestHelper.takeSnapshot();
        const testHelper = new TestHelper();
        [owner,,,,,,,,,,,,,addr1, addr2, addr3, addr4] = await testHelper.signerPromise;
        contract = await testHelper.contractSocialAdsPromise(owner.address);
        tokenContract = await testHelper.contractTokenPromise;
        await (await tokenContract.connect(owner).transfer(addr1.address, TestHelper.addPrecision(1000))).wait();
        await (await tokenContract.connect(owner).transfer(addr2.address, TestHelper.addPrecision(1000))).wait();
        await (await tokenContract.connect(owner).transfer(addr3.address, TestHelper.addPrecision(1000))).wait();
        await (await tokenContract.connect(owner).transfer(addr4.address, TestHelper.addPrecision(1000))).wait();
    });
    
    after(async ()=>{
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
        expect(config.ads.amount).eq(TestHelper.addPrecision(20));
        expect(config.ads.currency).eq(tokenContract.address);
        expect(config.ads.paymentType).eq(0);
        expect(config.ads.service).eq(SERVICE_ID);
    });

    it("Should not create ads for addr1 using hook if bad price", async function () {
        const adsCountOld = await contract.countAds();
        const listAdsOld = (await contract.listAds(0, 0));
        const countMyAdsOld = await contract.connect(addr1).countMyAds();
        const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(adsCountOld).equal(0);
        expect(listAdsOld.length).equal(0);
        expect(countMyAdsOld).equal(0);
        expect(listMyAdsOld.length).equal(0);
        expect(balanceBefore).equal(TestHelper.addPrecision(1000));
        //create
        const ads = createAds();
        const toSign = await contract.prepareAdsSignature(addr1.address, ads.handle);
        ads.signature = await testHelper.sign(owner.address, toSign);
        const userData = await contract.generateAdsUserData(ads);
        try {
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(21), userData)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("Price: invalid price");
        }
        //check
        const adsCount = await contract.countAds();
        const listAds = (await contract.listAds(0, 0));
        const countMyAds = await contract.connect(addr1).countMyAds();
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const lockCount = await contract.lockCount();
        expect(adsCount).equal(0);
        expect(listAds.length).equal(0);
        expect(countMyAds).equal(0);
        expect(listMyAds.length).equal(0);
        expect(balance).equal(TestHelper.addPrecision(1000));
        expect(lockCount).eq(0)
    });

    it("Should create ads for addr1 using hook", async function () {
        const adsCountOld = await contract.countAds();
        const listAdsOld = (await contract.listAds(0, 0));
        const countMyAdsOld = await contract.connect(addr1).countMyAds();
        const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(adsCountOld).equal(0);
        expect(listAdsOld.length).equal(0);
        expect(countMyAdsOld).equal(0);
        expect(listMyAdsOld.length).equal(0);
        expect(balanceBefore).equal(TestHelper.addPrecision(1000));
        //create
        const ads = createAds();
        const toSign = await contract.prepareAdsSignature(addr1.address, ads.handle);
        ads.signature = await testHelper.sign(owner.address, toSign);
        const userData = await contract.generateAdsUserData(ads);
        await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(20), userData)).wait();
        //check
        const adsCount = await contract.countAds();
        const listAds = (await contract.listAds(0, 0));
        const countMyAds = await contract.connect(addr1).countMyAds();
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const lockCount = await contract.lockCount();
        expect(adsCount).equal(1);
        expect(listAds.length).equal(1);
        expect(countMyAds).equal(1);
        expect(listMyAds.length).equal(1);
        expect(listMyAds[0].network).equal(ads.network);
        expect(listMyAds[0].audiences.length).equal(ads.audiences.length);
        expect(listMyAds[0].followers).equal(ads.followers);
        expect(listMyAds[0].price).equal(ads.price);
        expect(listMyAds[0].priceCurrency).equal(ads.priceCurrency);
        expect(listMyAds[0].duration).equal(ads.duration);
        expect(listMyAds[0].durationPeriod).equal(ads.durationPeriod);
        expect(listMyAds[0].owner).equal(addr1.address);
        expect(listMyAds[0].id).gt(0);
        expect(listMyAds[0].stats.countProposition).eq(0);
        expect(listMyAds[0].stats.countPropositionAccepted).eq(0);
        expect(balance).equal(TestHelper.addPrecision(980));
        expect(lockCount).eq(1)
    });

    it("Should not create ads when missing network", async function () {
        try {
            const ads = createAds();
            ads.network = 0;
            const toSign = await contract.prepareAdsSignature(addr1.address, ads.handle);
            ads.signature = await testHelper.sign(owner.address, toSign);
            const userData = await contract.generateAdsUserData(ads);
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(20), userData)).wait();
        } catch (e) {
            expect((e as any).message).contain("missing social network");
        }
    })

    it("Should not create ads when missing audiences", async function () {
        try {
            const ads = createAds();
            ads.audiences = [];
            const toSign = await contract.prepareAdsSignature(addr1.address, ads.handle);
            ads.signature = await testHelper.sign(owner.address, toSign);
            const userData = await contract.generateAdsUserData(ads);
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(20), userData)).wait();
        } catch (e) {
            expect((e as any).message).contain("missing audiences");
        }
    })

    it("Should not create ads when missing followers", async function () {
        try {
            const ads = createAds();
            ads.followers = 0;
            const toSign = await contract.prepareAdsSignature(addr1.address, ads.handle);
            ads.signature = await testHelper.sign(owner.address, toSign);
            const userData = await contract.generateAdsUserData(ads);
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(20), userData)).wait();
        } catch (e) {
            expect((e as any).message).contain("missing followers");
        }
    })

    it("Should not create ads when missing followers", async function () {
        try {
            const ads = createAds();
            ads.price = 0;
            const toSign = await contract.prepareAdsSignature(addr1.address, ads.handle);
            ads.signature = await testHelper.sign(owner.address, toSign);
            const userData = await contract.generateAdsUserData(ads);
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(20), userData)).wait();
        } catch (e) {
            expect((e as any).message).contain("missing price");
        }
    })

    it("Should not create ads when missing followers", async function () {
        try {
            const ads = createAds();
            ads.duration = 0;
            const toSign = await contract.prepareAdsSignature(addr1.address, ads.handle);
            ads.signature = await testHelper.sign(owner.address, toSign);
            const userData = await contract.generateAdsUserData(ads);
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(20), userData)).wait();
        } catch (e) {
            expect((e as any).message).contain("missing duration");
        }
    })
    it("Should not create ads when missing followers", async function () {
        try {
            const ads = createAds();
            ads.durationPeriod = 0;
            const toSign = await contract.prepareAdsSignature(addr1.address, ads.handle);
            ads.signature = await testHelper.sign(owner.address, toSign);
            const userData = await contract.generateAdsUserData(ads);
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(20), userData)).wait();
        } catch (e) {
            expect((e as any).message).contain("missing duration period");
        }
    })

    it("Should update ads for addr1 using hook pay with token", async function () {
        const adsCountOld = await contract.countAds();
        const listAdsOld = (await contract.listAds(0, 0));
        const countMyAdsOld = await contract.connect(addr1).countMyAds();
        const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(adsCountOld).equal(1);
        expect(listAdsOld.length).equal(1);
        expect(countMyAdsOld).equal(1);
        expect(listMyAdsOld.length).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(980));
        //create
        const id = listMyAdsOld[0].id
        const ads = createAds();
        ads.network = SocialNetworkEnum.facebook;
        ads.audiences = [SocialAudiencesEnum.ageAdult]
        ads.followers = 20;
        ads.price = 30;
        ads.duration = 15;
        ads.durationPeriod = SocialDurationPeriodEnum.month;
        await (await contract.connect(addr1).updateAds(id, ads)).wait();
        //check
        const adsCount = await contract.countAds();
        const listAds = (await contract.listAds(0, 0));
        const countMyAds = await contract.connect(addr1).countMyAds();
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const lockCount = await contract.lockCount();
        expect(adsCount).equal(1);
        expect(listAds.length).equal(1);
        expect(countMyAds).equal(1);
        expect(listMyAds.length).equal(1);
        expect(listMyAds[0].stats.countProposition).eq(0);
        expect(listMyAds[0].stats.countPropositionAccepted).eq(0);
        expect(listMyAds[0].network).equal(ads.network);
        expect(listMyAds[0].audiences.length).equal(ads.audiences.length);
        expect(listMyAds[0].followers).equal(ads.followers);
        expect(listMyAds[0].price).equal(ads.price);
        expect(listMyAds[0].priceCurrency).equal(ads.priceCurrency);
        expect(listMyAds[0].duration).equal(ads.duration);
        expect(listMyAds[0].durationPeriod).equal(ads.durationPeriod);
        expect(listMyAds[0].owner).equal(addr1.address);
        expect(listMyAds[0].id).gt(0);
        expect(balance).equal(balanceBefore);
        expect(lockCount).eq(1)
    });

    it("Should not update ads if not owner", async function () {
        const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
        //create
        try {
            const id = listMyAdsOld[0].id
            const ads = createAds();
            ads.network = SocialNetworkEnum.instagram;
            await (await contract.connect(addr2).updateAds(id, ads)).wait();
        } catch (e) {
            expect((e as any).message).contain("not the owner");
        }
    });

    it("Should create proposition for ads1 pay with token", async function () {
        const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
        const id = listMyAdsOld[0].id
        //prepare
        const countPropForAdrOld = await contract.connect(addr2).countMyPropositions()
        const countPropForAdsOld = await contract.connect(addr2).countPropositionsForAds(id)
        const listPropForAdsOld = await contract.connect(addr2).listPropositionsForAds(id, 0, 0)
        const listPropForMeOld = await contract.connect(addr2).listMyPropositions(0, 0)
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        const balanceOld = await tokenContract.balanceOf(addr2.address);
        expect(countPropForAdrOld).equal(0);
        expect(countPropForAdsOld).equal(0);
        expect(listPropForAdsOld.length).equal(0);
        expect(listPropForMeOld.length).equal(0);
        //create props
        const props = createProposition(id, listMyAdsOld[0].priceCurrency);
        await (await tokenContract.connect(addr2).approve(contract.address, props.amount)).wait()
        await (await contract.connect(addr2).createProposition(props)).wait();
        //after
        const countPropForAdr = await contract.connect(addr2).countMyPropositions()
        const countPropForAds = await contract.connect(addr2).countPropositionsForAds(id)
        const listPropForAds = await contract.connect(addr2).listPropositionsForAds(id, 0, 0)
        const listPropForMe = await contract.connect(addr2).listMyPropositions(0, 0)
        const balanceContract = await contract.balanceToken(tokenContract.address);
        const balance = await tokenContract.balanceOf(addr2.address);
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        expect(listMyAds[0].stats.countProposition).eq(1);
        expect(listMyAds[0].stats.countPropositionAccepted).eq(0);
        expect(balance).equal(balanceOld.sub(props.amount));
        expect(balanceContract).equal(balanceContractOld.add(props.amount));
        expect(countPropForAdr).equal(1);
        expect(countPropForAds).equal(1);
        expect(listPropForAds.length).equal(1);
        expect(listPropForMe.length).equal(1);
        expect(listPropForMe[0].description).equal(props.description);
        expect(listPropForMe[0].currency).equal(tokenContract.address);
        expect(listPropForMe[0].amount).equal(props.amount);
        expect(listPropForMe[0].endat).equal(props.endat);
        expect(listPropForMe[0].startat).equal(props.startat);
        expect(listPropForMe[0].owner).equal(addr2.address);
        expect(listPropForMe[0].id).gt(0);
        expect(listPropForMe[0].adsId).eq(id);
        expect(listPropForMe[0].accepted).eq(TriState.UNDEFINED);
        expect(listPropForMe[0].canClaim).eq(TriState.UNDEFINED);
        expect(listPropForMe[0].claimed).eq(false);
    });


    it("Should update proposition for ads1 pay with token", async function () {
        const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
        const id = listMyAdsOld[0].id
        //prepare
        const countPropForAdrOld = await contract.connect(addr2).countMyPropositions()
        const countPropForAdsOld = await contract.connect(addr2).countPropositionsForAds(id)
        const listPropForAdsOld = await contract.connect(addr2).listPropositionsForAds(id, 0, 0)
        const listPropForMeOld = await contract.connect(addr2).listMyPropositions(0, 0)
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        const balanceOld = await tokenContract.balanceOf(addr2.address);
        expect(countPropForAdrOld).equal(1);
        expect(countPropForAdsOld).equal(1);
        expect(listPropForAdsOld.length).equal(1);
        expect(listPropForMeOld.length).equal(1);
        //create props
        const props = createProposition(id, listMyAdsOld[0].priceCurrency);
        props.id = listPropForAdsOld[0].id;
        props.contact = "NEW";
        props.description = "NEW";
        props.startat = 1;
        props.endat = 2;
        await (await tokenContract.connect(addr2).approve(contract.address, props.amount)).wait()
        await (await contract.connect(addr2).updateProposition(props)).wait();
        //after
        const countPropForAdr = await contract.connect(addr2).countMyPropositions()
        const countPropForAds = await contract.connect(addr2).countPropositionsForAds(id)
        const listPropForAds = await contract.connect(addr2).listPropositionsForAds(id, 0, 0)
        const listPropForMe = await contract.connect(addr2).listMyPropositions(0, 0)
        const balanceContract = await contract.balanceToken(tokenContract.address);
        const balance = await tokenContract.balanceOf(addr2.address);
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        expect(balance).equal(balanceOld);
        expect(balanceContract).equal(balanceContractOld);
        expect(countPropForAdr).equal(1);
        expect(countPropForAds).equal(1);
        expect(listPropForAds.length).equal(1);
        expect(listPropForMe.length).equal(1);
        expect(listMyAds[0].stats.countProposition).eq(1);
        expect(listMyAds[0].stats.countPropositionAccepted).eq(0);
        expect(listPropForMe[0].description).equal(props.description);
        expect(listPropForMe[0].currency).equal(tokenContract.address);
        expect(listPropForMe[0].amount).equal(props.amount);
        expect(listPropForMe[0].endat).equal(props.endat);
        expect(listPropForMe[0].startat).equal(props.startat);
        expect(listPropForMe[0].owner).equal(addr2.address);
        expect(listPropForMe[0].id).gt(0);
        expect(listPropForMe[0].adsId).eq(id);
        expect(listPropForMe[0].accepted).eq(TriState.UNDEFINED);
        expect(listPropForMe[0].canClaim).eq(TriState.UNDEFINED);
        expect(listPropForMe[0].claimed).eq(false);
    });

    it("Should not create proposition for non existing ads", async function () {
        try {
            const props = createProposition(10, ethers.constants.AddressZero);
            await (await contract.connect(addr2).createProposition(props)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("Ads: ads not found");
        }
    })

    it("Should not create proposition because missing startat", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
            const id = listMyPropOld[0].id
            const props = createProposition(id, ethers.constants.AddressZero);
            props.startat = 0;
            await (await contract.connect(addr2).createProposition(props)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing start at");
        }
    })

    it("Should not create proposition because missing endat", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
            const id = listMyPropOld[0].id
            const props = createProposition(id, ethers.constants.AddressZero);
            props.endat = 0;
            await (await contract.connect(addr2).createProposition(props)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing end at");
        }
    })

    it("Should not update proposition for non existing ads", async function () {
        try {
            const props = createProposition(10, ethers.constants.AddressZero);
            await (await contract.connect(addr2).updateProposition(props)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("Ads: ads not found");
        }
    })

    it("Should not update proposition because missing startat", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
            const id = listMyPropOld[0].id
            const props = createProposition(id, ethers.constants.AddressZero);
            props.id = listMyPropOld[0].id;
            props.startat = 0;
            await (await contract.connect(addr2).updateProposition(props)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing start at");
        }
    })

    it("Should not update proposition because missing endat", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
            const id = listMyPropOld[0].id
            const props = createProposition(id, ethers.constants.AddressZero);
            props.id = listMyPropOld[0].id;
            props.endat = 0;
            await (await contract.connect(addr2).updateProposition(props)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing end at");
        }
    })

    it("Should not approve non existing proposition", async function () {
        try {
            await (await contract.connect(addr1).approveProposition(10, true)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("proposition not found");
        }
    })

    it("Should not approve proposition if not owner", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
            const id = listMyPropOld[0].id
            await (await contract.connect(addr2).approveProposition(id, true)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("not the owner");
        }
    })

    it("Should refuse approve for prop1", async function () {
        const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
        const id = listMyPropOld[0].id;
        await (await contract.connect(addr1).approveProposition(id, false)).wait();
        const listMyProp = await contract.connect(addr2).listMyPropositions(0, 0);
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        expect(listMyAds[0].stats.countProposition).eq(1);
        expect(listMyAds[0].stats.countPropositionAccepted).eq(0);
        expect(listMyProp[0].accepted).equal(TriState.FALSE);
    })

    it("Should not allow claim non existing proposition", async function () {
        try {
            await (await contract.connect(addr2).allowClaimProposition(10, true)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("proposition not found");
        }
    })

    it("Should not allow claim proposition if not owner", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
            const id = listMyPropOld[0].id
            await (await contract.connect(addr1).allowClaimProposition(id, true)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("not the owner");
        }
    })

    it("Should refuse claim for prop1", async function () {
        const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
        const id = listMyPropOld[0].id;
        await (await contract.connect(addr2).allowClaimProposition(id, false)).wait();
        const listMyProp = await contract.connect(addr2).listMyPropositions(0, 0);
        expect(listMyProp[0].canClaim).equal(TriState.FALSE);
    })

    it("Should not claim non existing proposition", async function () {
        try {
            await (await contract.connect(addr2).claimProposition(10)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("proposition not found");
        }
    })

    it("Should not claim proposition if not owner of the ads", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
            const id = listMyPropOld[0].id
            await (await contract.connect(addr2).claimProposition(id)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("not the owner");
        }
    })

    it("Should not claim proposition if not allowed to claim", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
            const id = listMyPropOld[0].id
            await (await contract.connect(addr1).claimProposition(id)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("not allowed to claim");
        }
    })

    it("Should not delete non existing ads", async function () {
        try {
            await (await contract.connect(addr1).deleteAds(10)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("ads not found");
        }
    })

    it("Should not delete ads if not owner", async function () {
        try {
            const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
            const id = listMyAdsOld[0].id
            await (await contract.connect(addr2).deleteAds(id)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("not the owner");
        }
    })

    it("Should delete ads1", async function () {
        const adsCountOld = await contract.countAds();
        const listAdsOld = (await contract.listAds(0, 0));
        const countMyAdsOld = await contract.connect(addr1).countMyAds();
        const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(adsCountOld).equal(1);
        expect(listAdsOld.length).equal(1);
        expect(countMyAdsOld).equal(1);
        expect(listMyAdsOld.length).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(980));
        const id = listMyAdsOld[0].id
        await (await contract.connect(addr1).deleteAds(id)).wait();
        const adsCount = await contract.countAds();
        const listAds = (await contract.listAds(0, 0));
        const countMyAds = await contract.connect(addr1).countMyAds();
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const key = await contract.generateServiceKey(SERVICE_ID, id);
        const lock = await contract.locked(key)
        expect(lock.payer).equal(addr1.address)
        expect(lock.unlocked).equal(true)
        expect(adsCount).equal(0);
        expect(listAds.length).equal(0);
        expect(countMyAds).equal(0);
        expect(listMyAds.length).equal(0);
        expect(balance).equal(TestHelper.addPrecision(1000));
    })
    it("Should not delete non existing proposition", async function () {
        try {
            await (await contract.connect(addr2).deleteProposition(10)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("proposition not found");
        }
    })

    it("Should not delete proposition if not owner", async function () {
        try {
            const listMyPropssOld = await contract.connect(addr2).listMyPropositions(0, 0);
            const id = listMyPropssOld[0].id
            await (await contract.connect(addr1).deleteProposition(id)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("not the owner");
        }
    })
    it("Should delete proposition", async function () {
        const propsCountOld = await contract.countPropositionsFor(addr2.address);
        const listPropsOld = (await contract.listPropositionsFor(addr2.address, 0, 0));
        const countMyPropsOld = await contract.connect(addr2).countMyPropositions();
        const listMyPropsOld = await contract.connect(addr2).listMyPropositions(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr2.address);
        expect(propsCountOld).equal(1);
        expect(listPropsOld.length).equal(1);
        expect(countMyPropsOld).equal(1);
        expect(listMyPropsOld.length).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(990));
        const id = listMyPropsOld[0].id
        await (await contract.connect(addr2).deleteProposition(id)).wait();
        const propsCount = await contract.countPropositionsFor(addr2.address);
        const listProps = (await contract.listPropositionsFor(addr2.address, 0, 0));
        const countMyProps = await contract.connect(addr2).countMyPropositions();
        const listMyProps = await contract.connect(addr2).listMyPropositions(0, 0);
        const balance = await tokenContract.balanceOf(addr2.address);
        expect(propsCount).equal(0);
        expect(listProps.length).equal(0);
        expect(countMyProps).equal(0);
        expect(listMyProps.length).equal(0);
        //should get money back if not claimed
        expect(balance).equal(balanceBefore.add(listMyPropsOld[0].amount));
    })


    it("Should create ads for addr1 using approve", async function () {
        const adsCountOld = await contract.countAds();
        const listAdsOld = (await contract.listAds(0, 0));
        const countMyAdsOld = await contract.connect(addr1).countMyAds();
        const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(adsCountOld).equal(0);
        expect(listAdsOld.length).equal(0);
        expect(countMyAdsOld).equal(0);
        expect(listMyAdsOld.length).equal(0);
        expect(balanceBefore).equal(TestHelper.addPrecision(1000));
        //create
        const ads = createAds();
        const toSign = await contract.prepareAdsSignature(addr1.address, ads.handle);
        ads.signature = await testHelper.sign(owner.address, toSign);
        await (await tokenContract.connect(addr1).approve(contract.address, TestHelper.addPrecision(20))).wait()
        await (await contract.connect(addr1).createAds(ads)).wait();
        //check
        const adsCount = await contract.countAds();
        const listAds = (await contract.listAds(0, 0));
        const countMyAds = await contract.connect(addr1).countMyAds();
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const lockCount = await contract.lockCount();
        expect(adsCount).equal(1);
        expect(listAds.length).equal(1);
        expect(countMyAds).equal(1);
        expect(listMyAds.length).equal(1);
        expect(listMyAds[0].network).equal(ads.network);
        expect(listMyAds[0].audiences.length).equal(ads.audiences.length);
        expect(listMyAds[0].followers).equal(ads.followers);
        expect(listMyAds[0].price).equal(ads.price);
        expect(listMyAds[0].priceCurrency).equal(ads.priceCurrency);
        expect(listMyAds[0].duration).equal(ads.duration);
        expect(listMyAds[0].durationPeriod).equal(ads.durationPeriod);
        expect(listMyAds[0].owner).equal(addr1.address);
        expect(listMyAds[0].id).gt(0);
        expect(listMyAds[0].stats.countProposition).eq(0);
        expect(listMyAds[0].stats.countPropositionAccepted).eq(0);
        expect(balance).equal(TestHelper.addPrecision(980));
        expect(lockCount).eq(2)
    });

    it("Should create ads for addr1 using approve and coin", async function () {
        const adsCountOld = await contract.countAds();
        const listAdsOld = (await contract.listAds(0, 0));
        const countMyAdsOld = await contract.connect(addr1).countMyAds();
        const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(adsCountOld).equal(1);
        expect(listAdsOld.length).equal(1);
        expect(countMyAdsOld).equal(1);
        expect(listMyAdsOld.length).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(980));
        //create
        const ads = createAds();
        const toSign = await contract.prepareAdsSignature(addr1.address, ads.handle);
        ads.signature = await testHelper.sign(owner.address, toSign);
        ads.priceCurrency = ethers.constants.AddressZero;
        await (await tokenContract.connect(addr1).approve(contract.address, TestHelper.addPrecision(20))).wait()
        await (await contract.connect(addr1).createAds(ads)).wait();
        //check
        const adsCount = await contract.countAds();
        const listAds = (await contract.listAds(0, 0));
        const countMyAds = await contract.connect(addr1).countMyAds();
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const lockCount = await contract.lockCount();
        expect(adsCount).equal(2);
        expect(listAds.length).equal(2);
        expect(countMyAds).equal(2);
        expect(listMyAds.length).equal(2);
        expect(listMyAds[1].network).equal(ads.network);
        expect(listMyAds[1].audiences.length).equal(ads.audiences.length);
        expect(listMyAds[1].followers).equal(ads.followers);
        expect(listMyAds[1].price).equal(ads.price);
        expect(listMyAds[1].priceCurrency).equal(ads.priceCurrency);
        expect(listMyAds[1].priceCurrency).equal(ethers.constants.AddressZero);
        expect(listMyAds[1].duration).equal(ads.duration);
        expect(listMyAds[1].durationPeriod).equal(ads.durationPeriod);
        expect(listMyAds[1].owner).equal(addr1.address);
        expect(listMyAds[1].id).gt(0);
        expect(listMyAds[1].stats.countProposition).eq(0);
        expect(listMyAds[1].stats.countPropositionAccepted).eq(0);
        expect(balance).equal(TestHelper.addPrecision(960));
        expect(lockCount).eq(3)
    });
    it("Should not create proposition for ads1 pay with token if amount is 0", async function () {
        const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
        const id = listMyAdsOld[0].id
        try {
            const props = createProposition(id, listMyAdsOld[0].priceCurrency);
            props.amount = BigNumber.from(0);
            await (await contract.connect(addr2).createProposition(props)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("token amount equal 0");
        }
    })
    it("Should not create proposition for ads2 pay with coin if amount is 0", async function () {
        const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
        const id = listMyAdsOld[1].id
        try {
            const props = createProposition(id, listMyAdsOld[1].priceCurrency);
            await (await contract.connect(addr2).createProposition(props)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("coin amount equal 0");
        }
    })

    it("Should create proposition for ads1 pay with token", async function () {
        const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
        const id = listMyAdsOld[0].id
        //prepare
        const countPropForAdrOld = await contract.connect(addr2).countMyPropositions()
        const countPropForAdsOld = await contract.connect(addr2).countPropositionsForAds(id)
        const listPropForAdsOld = await contract.connect(addr2).listPropositionsForAds(id, 0, 0)
        const listPropForMeOld = await contract.connect(addr2).listMyPropositions(0, 0)
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        const balanceOld = await tokenContract.balanceOf(addr2.address);
        expect(countPropForAdrOld).equal(0);
        expect(countPropForAdsOld).equal(0);
        expect(listPropForAdsOld.length).equal(0);
        expect(listPropForMeOld.length).equal(0);
        //create props
        const props = createProposition(id, listMyAdsOld[0].priceCurrency);
        await (await tokenContract.connect(addr2).approve(contract.address, props.amount)).wait()
        await (await contract.connect(addr2).createProposition(props)).wait();
        //after
        const countPropForAdr = await contract.connect(addr2).countMyPropositions()
        const countPropForAds = await contract.connect(addr2).countPropositionsForAds(id)
        const listPropForAds = await contract.connect(addr2).listPropositionsForAds(id, 0, 0)
        const listPropForMe = await contract.connect(addr2).listMyPropositions(0, 0)
        const balanceContract = await contract.balanceToken(tokenContract.address);
        const balance = await tokenContract.balanceOf(addr2.address);
        expect(balance).equal(balanceOld.sub(props.amount));
        expect(balanceContract).equal(balanceContractOld.add(props.amount));
        expect(countPropForAdr).equal(1);
        expect(countPropForAds).equal(1);
        expect(listPropForAds.length).equal(1);
        expect(listPropForMe.length).equal(1);
        expect(listPropForMe[0].description).equal(props.description);
        expect(listPropForMe[0].currency).equal(tokenContract.address);
        expect(listPropForMe[0].amount).equal(props.amount);
        expect(listPropForMe[0].endat).equal(props.endat);
        expect(listPropForMe[0].startat).equal(props.startat);
        expect(listPropForMe[0].owner).equal(addr2.address);
        expect(listPropForMe[0].id).gt(0);
        expect(listPropForMe[0].adsId).eq(id);
        expect(listPropForMe[0].accepted).eq(TriState.UNDEFINED);
        expect(listPropForMe[0].canClaim).eq(TriState.UNDEFINED);
        expect(listPropForMe[0].claimed).eq(false);
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        expect(listMyAds[0].stats.countProposition).eq(1);
        expect(listMyAds[0].stats.countPropositionAccepted).eq(0);
    });


    it("Should create proposition for ads2 pay with coin", async function () {
        const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
        const id = listMyAdsOld[1].id
        //prepare
        const countPropForAdrOld = await contract.connect(addr2).countMyPropositions()
        const countPropForAdsOld = await contract.connect(addr2).countPropositionsForAds(id)
        const listPropForAdsOld = await contract.connect(addr2).listPropositionsForAds(id, 0, 0)
        const listPropForMeOld = await contract.connect(addr2).listMyPropositions(0, 0)
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        const balanceCoinContractOld = await contract.balanceCoin();
        const balanceOld = await tokenContract.balanceOf(addr2.address);
        const balanceCoinOld = await addr2.getBalance();
        expect(countPropForAdrOld).equal(1);
        expect(countPropForAdsOld).equal(0);
        expect(listPropForAdsOld.length).equal(0);
        expect(listPropForMeOld.length).equal(1);
        //create props
        const props = createProposition(id, listMyAdsOld[1].priceCurrency);
        await (await contract.connect(addr2).createProposition(props, { value: props.amount })).wait();
        //after
        const countPropForAdr = await contract.connect(addr2).countMyPropositions()
        const countPropForAds = await contract.connect(addr2).countPropositionsForAds(id)
        const listPropForAds = await contract.connect(addr2).listPropositionsForAds(id, 0, 0)
        const listPropForMe = await contract.connect(addr2).listMyPropositions(0, 0)
        const balanceContract = await contract.balanceToken(tokenContract.address);
        const balanceCoinContract = await contract.balanceCoin();
        const balance = await tokenContract.balanceOf(addr2.address);
        const balanceCoin = await addr2.getBalance();
        expect(TestHelper.removePrecision(balanceCoin)).approximately(TestHelper.removePrecision(balanceCoinOld.sub(props.amount)), 0.2);
        expect(balance).equal(balanceOld);
        expect(balanceCoinContract).equal(balanceCoinContractOld.add(props.amount));
        expect(balanceContract).equal(balanceContractOld);
        expect(countPropForAdr).equal(2);
        expect(countPropForAds).equal(1);
        expect(listPropForAds.length).equal(1);
        expect(listPropForMe.length).equal(2);
        expect(listPropForMe[1].description).equal(props.description);
        expect(listPropForMe[1].currency).equal(ethers.constants.AddressZero);
        expect(listPropForMe[1].amount).equal(props.amount);
        expect(listPropForMe[1].endat).equal(props.endat);
        expect(listPropForMe[1].startat).equal(props.startat);
        expect(listPropForMe[1].owner).equal(addr2.address);
        expect(listPropForMe[1].id).gt(0);
        expect(listPropForMe[1].adsId).eq(id);
        expect(listPropForMe[1].accepted).eq(TriState.UNDEFINED);
        expect(listPropForMe[1].canClaim).eq(TriState.UNDEFINED);
        expect(listPropForMe[1].claimed).eq(false);
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        expect(listMyAds[1].stats.countProposition).eq(1);
        expect(listMyAds[1].stats.countPropositionAccepted).eq(0);
    });

    it("Should approve for prop1", async function () {
      {
        const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
        const id = listMyPropOld[0].id;
        await (await contract.connect(addr1).approveProposition(id, true)).wait();
        const listMyProp = await contract.connect(addr2).listMyPropositions(0, 0);
        expect(listMyProp[0].accepted).equal(TriState.TRUE);
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        expect(listMyAds[0].stats.countProposition).eq(1);
        expect(listMyAds[0].stats.countPropositionAccepted).eq(1);
      }
      {
        const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
        const id = listMyPropOld[0].id;
        await (await contract.connect(addr1).approveProposition(id, false)).wait();
        const listMyProp = await contract.connect(addr2).listMyPropositions(0, 0);
        expect(listMyProp[0].accepted).equal(TriState.FALSE);
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        expect(listMyAds[0].stats.countProposition).eq(1);
        expect(listMyAds[0].stats.countPropositionAccepted).eq(0);
      }
      {
        const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
        const id = listMyPropOld[0].id;
        await (await contract.connect(addr1).approveProposition(id, true)).wait();
        const listMyProp = await contract.connect(addr2).listMyPropositions(0, 0);
        expect(listMyProp[0].accepted).equal(TriState.TRUE);
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        expect(listMyAds[0].stats.countProposition).eq(1);
        expect(listMyAds[0].stats.countPropositionAccepted).eq(1);
      }
    })

    it("Should approve for prop2", async function () {
        const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
        const id = listMyPropOld[1].id;
        await (await contract.connect(addr1).approveProposition(id, true)).wait();
        const listMyProp = await contract.connect(addr2).listMyPropositions(0, 0);
        expect(listMyProp[1].accepted).equal(TriState.TRUE);
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        expect(listMyAds[1].stats.countProposition).eq(1);
        expect(listMyAds[1].stats.countPropositionAccepted).eq(1);
    })

    it("Should not claim if not allowed", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
            const id = listMyPropOld[0].id;
            await (await contract.connect(addr1).claimProposition(id)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("not allowed to claim");
        }
    })

    it("Should allow claim for prop1", async function () {
        const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
        const id = listMyPropOld[0].id;
        await (await contract.connect(addr2).allowClaimProposition(id, true)).wait();
        const listMyProp = await contract.connect(addr2).listMyPropositions(0, 0);
        expect(listMyProp[0].canClaim).equal(TriState.TRUE);
    })

    it("Should allow claim for prop2", async function () {
        const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
        const id = listMyPropOld[1].id;
        await (await contract.connect(addr2).allowClaimProposition(id, true)).wait();
        const listMyProp = await contract.connect(addr2).listMyPropositions(0, 0);
        expect(listMyProp[1].canClaim).equal(TriState.TRUE);
    })

    it("Should claim proposition1 if allowed to claim using token", async function () {
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        const balanceCoinContractOld = await contract.balanceCoin();
        const balanceOld = await tokenContract.balanceOf(addr1.address);
        const balanceCoinOld = await addr1.getBalance();
        const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
        const id = listMyPropOld[0].id
        expect(listMyPropOld[0].canClaim).equal(TriState.TRUE);
        expect(listMyPropOld[0].claimed).equal(false);
        await (await contract.connect(addr1).claimProposition(id)).wait();
        const listMyProp = await contract.connect(addr2).listMyPropositions(0, 0);
        const props = listMyProp[0]
        const balanceContract = await contract.balanceToken(tokenContract.address);
        const balanceCoinContract = await contract.balanceCoin();
        const balance = await tokenContract.balanceOf(addr1.address);
        const balanceCoin = await addr1.getBalance();
        expect(props.canClaim).equal(TriState.TRUE);
        expect(props.claimed).equal(true);
        expect(TestHelper.removePrecision(balanceCoin)).approximately(TestHelper.removePrecision(balanceCoinOld), 0.01);
        expect(balanceCoinContract).equal(balanceCoinContractOld);
        expect(balance).equal(balanceOld.add(props.amount));
        expect(balanceContract).equal(balanceContractOld.sub(props.amount));
    })



    it("Should claim proposition2 if allowed to claim using coin", async function () {
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        const balanceCoinContractOld = await contract.balanceCoin();
        const balanceOld = await tokenContract.balanceOf(addr1.address);
        const balanceCoinOld = await addr1.getBalance();
        const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
        const id = listMyPropOld[1].id
        expect(listMyPropOld[1].canClaim).equal(TriState.TRUE);
        expect(listMyPropOld[1].claimed).equal(false);
        await (await contract.connect(addr1).claimProposition(id)).wait();
        const listMyProp = await contract.connect(addr2).listMyPropositions(0, 0);
        const props = listMyProp[1]
        const balanceContract = await contract.balanceToken(tokenContract.address);
        const balanceCoinContract = await contract.balanceCoin();
        const balance = await tokenContract.balanceOf(addr1.address);
        const balanceCoin = await addr1.getBalance();
        expect(props.canClaim).equal(TriState.TRUE);
        expect(props.claimed).equal(true);
        expect(TestHelper.removePrecision(balanceCoin)).approximately(TestHelper.removePrecision(balanceCoinOld.add(props.amount)), 0.01);
        expect(TestHelper.removePrecision(balanceCoinContract)).approximately(TestHelper.removePrecision(balanceCoinContractOld.sub(props.amount)), 0.01);
        expect(balance).equal(balanceOld);
        expect(balanceContract).equal(balanceContractOld);
    })

    it("Should not allow claim twice", async function () {
        try {
            const listMyPropOld = await contract.connect(addr2).listMyPropositions(0, 0);
            const id = listMyPropOld[0].id;
            await (await contract.connect(addr1).claimProposition(id)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("already claimed");
        }
    })


    it("Should delete ads1 and ads2", async function () {
        const adsCountOld = await contract.countAds();
        const listAdsOld = (await contract.listAds(0, 0));
        const countMyAdsOld = await contract.connect(addr1).countMyAds();
        const listMyAdsOld = await contract.connect(addr1).listMyAds(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(adsCountOld).equal(2);
        expect(listAdsOld.length).equal(2);
        expect(countMyAdsOld).equal(2);
        expect(listMyAdsOld.length).equal(2);
        expect(balanceBefore).equal(TestHelper.addPrecision(970));
        const id1 = listMyAdsOld[0].id
        const id2 = listMyAdsOld[1].id
        await (await contract.connect(addr1).deleteAds(id1)).wait();
        await (await contract.connect(addr1).deleteAds(id2)).wait();
        const adsCount = await contract.countAds();
        const listAds = (await contract.listAds(0, 0));
        const countMyAds = await contract.connect(addr1).countMyAds();
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        const balance = await tokenContract.balanceOf(addr1.address);
        const key = await contract.generateServiceKey(SERVICE_ID, id1);
        const lock = await contract.locked(key)
        expect(lock.payer).equal(addr1.address)
        expect(lock.unlocked).equal(true)
        expect(adsCount).equal(0);
        expect(listAds.length).equal(0);
        expect(countMyAds).equal(0);
        expect(listMyAds.length).equal(0);
        expect(balance).equal(TestHelper.addPrecision(1010));
    })


    it("Should delete proposition1 and prop2 without money back", async function () {
        const propsCountOld = await contract.countPropositionsFor(addr2.address);
        const listPropsOld = (await contract.listPropositionsFor(addr2.address, 0, 0));
        const countMyPropsOld = await contract.connect(addr2).countMyPropositions();
        const listMyPropsOld = await contract.connect(addr2).listMyPropositions(0, 0);
        const balanceBefore = await tokenContract.balanceOf(addr2.address);
        const balanceCoinBefore = await addr2.getBalance();
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        const balanceCoinContractOld = await contract.balanceCoin();
        expect(propsCountOld).equal(2);
        expect(listPropsOld.length).equal(2);
        expect(countMyPropsOld).equal(2);
        expect(listMyPropsOld.length).equal(2);
        expect(balanceBefore).equal(TestHelper.addPrecision(990));
        const id1 = listMyPropsOld[0].id
        const id2 = listMyPropsOld[1].id
        await (await contract.connect(addr2).deleteProposition(id1)).wait();
        await (await contract.connect(addr2).deleteProposition(id2)).wait();
        const propsCount = await contract.countPropositionsFor(addr2.address);
        const listProps = (await contract.listPropositionsFor(addr2.address, 0, 0));
        const countMyProps = await contract.connect(addr2).countMyPropositions();
        const listMyProps = await contract.connect(addr2).listMyPropositions(0, 0);
        const balance = await tokenContract.balanceOf(addr2.address);
        const balanceCoin = await addr2.getBalance();
        const balanceContract = await contract.balanceToken(tokenContract.address);
        const balanceCoinContract = await contract.balanceCoin();
        expect(propsCount).equal(0);
        expect(listProps.length).equal(0);
        expect(countMyProps).equal(0);
        expect(listMyProps.length).equal(0);
        //should get money back if not claimed
        expect(balance).equal(balanceBefore);
        expect(TestHelper.removePrecision(balanceCoin)).approximately(TestHelper.removePrecision(balanceCoinBefore), 0.1);
        expect(balanceContract).equal(balanceContractOld);
        expect(TestHelper.removePrecision(balanceCoinContract)).equal(TestHelper.removePrecision(balanceCoinContractOld));
    })


    it("Should create 15 ads", async function () {
        for (let i = 0; i < 15; i++) {
            const ads = createAds();
            const toSign = await contract.prepareAdsSignature(addr1.address, ads.handle);
            ads.signature = await testHelper.sign(owner.address, toSign);
            ads.audiences = [i+""];
            ads.priceCurrency = ethers.constants.AddressZero;
            await (await tokenContract.connect(addr1).approve(contract.address, TestHelper.addPrecision(20))).wait()
            await (await contract.connect(addr1).createAds(ads)).wait();
        }
        //check
        const adsCount = await contract.countAds();
        const listAds = (await contract.listAds(0, 0));
        const listAdsLimit = (await contract.listAds(10, 5));
        const countMyAds = await contract.connect(addr1).countMyAds();
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        const listMyAdsLimit = await contract.connect(addr1).listMyAds(10, 5);
        expect(adsCount).equal(15);
        expect(listAds.length).equal(15);
        expect(listAdsLimit.length).equal(5);
        expect(countMyAds).equal(15);
        expect(listMyAds.length).equal(15);
        expect(listMyAdsLimit.length).equal(5);
        expect(listAds[0].audiences[0]).equal("0");
        expect(listAds[14].audiences[0]).equal("14");
        expect(listMyAds[0].audiences[0]).equal("0");
        expect(listMyAds[14].audiences[0]).equal("14");
        expect(listAdsLimit[0].audiences[0]).equal("10");
        expect(listAdsLimit[1].audiences[0]).equal("11");
        expect(listAdsLimit[2].audiences[0]).equal("12");
        expect(listAdsLimit[3].audiences[0]).equal("13");
        expect(listAdsLimit[4].audiences[0]).equal("14");
        expect(listMyAdsLimit[0].audiences[0]).equal("10");
        expect(listMyAdsLimit[1].audiences[0]).equal("11");
        expect(listMyAdsLimit[2].audiences[0]).equal("12");
        expect(listMyAdsLimit[3].audiences[0]).equal("13");
        expect(listMyAdsLimit[4].audiences[0]).equal("14");
    });

    it("Should create 15 props", async function () {
        const listAdsOld = (await contract.listAds(0, 0));
        const id = listAdsOld[0].id;
        for (let i = 0; i < 15; i++) {
            const props = createProposition(id, listAdsOld[0].priceCurrency);
            props.description = i + "";
            await (await contract.connect(addr2).createProposition(props, { value: props.amount })).wait();
        }
        //check
        const propsCount = await contract.countPropositionsForAds(id);
        const listProps = (await contract.listPropositionsForAds(id, 0, 0));
        const listPropsLimit = (await contract.listPropositionsForAds(id, 10, 5));
        const countMyProps = await contract.connect(addr2).countMyPropositions();
        const listMyProps = await contract.connect(addr2).listMyPropositions(0, 0);
        const listMyPropsLimit = await contract.connect(addr2).listMyPropositions(10, 5);
        expect(propsCount).equal(15);
        expect(listProps.length).equal(15);
        expect(listPropsLimit.length).equal(5);
        expect(countMyProps).equal(15);
        expect(listMyProps.length).equal(15);
        expect(listMyPropsLimit.length).equal(5);
        expect(listProps[0].description).equal("0");
        expect(listProps[14].description).equal("14");
        expect(listMyProps[0].description).equal("0");
        expect(listMyProps[14].description).equal("14");
        expect(listMyPropsLimit[0].description).equal("10");
        expect(listMyPropsLimit[1].description).equal("11");
        expect(listMyPropsLimit[2].description).equal("12");
        expect(listMyPropsLimit[3].description).equal("13");
        expect(listMyPropsLimit[4].description).equal("14");
        expect(listPropsLimit[0].description).equal("10");
        expect(listPropsLimit[1].description).equal("11");
        expect(listPropsLimit[2].description).equal("12");
        expect(listPropsLimit[3].description).equal("13");
        expect(listPropsLimit[4].description).equal("14");
    });

    it("Should set config", async function () {
        const configOld = await contract.connect(addr1).socialConfig();
        const copy = { ...configOld };
        copy.ads = { ...copy.ads }
        copy.validatorRequire = false;
        copy.ads.paymentType = 1;
        await (await contract.setConfig(copy)).wait();
        const config = await contract.connect(addr1).socialConfig();
        expect(config.tokenAddress).equal(tokenContract.address);
        expect(config.validatorRequire).equal(false);
        expect(config.validator).equal(owner.address);
        expect(config.ads.currency).eq(tokenContract.address);
        expect(config.ads.paymentType).eq(1);
        expect(config.ads.service).eq(SERVICE_ID);
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
            const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
            const id = listMyAds[0].id;
            await (await contract.connect(addr3).deleteAd(id)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing role");
        }
    })
    it("Should allow owner delete ads", async function () {
        const listMyAds = await contract.connect(addr1).listMyAds(0, 0);
        const id = listMyAds[0].id;
        await (await contract.deleteAd(id)).wait();
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

    it("Should update ads to pause for delete virtually", async function () {
        const adsCountOld = await contract.countAds();
        const listAdsOld = (await contract.listAds(0, 0));
        expect(adsCountOld).gt(0);
        expect(listAdsOld.length).gt(0);
        //create
        const ads = {...listAdsOld[0]};
        expect(ads.status).eq(Lifecycle.LIVE);
        ads.status = Lifecycle.PAUSED;
        await (await contract.connect(addr1).updateAds(ads.id, ads)).wait();
        //check
        const adsCount = await contract.countAds();
        const listAds = (await contract.listAds(0, 0));
        const listPaused = (await contract.listAdsByStatus(0, 0, Lifecycle.PAUSED));
        const listLived = (await contract.listAdsByStatus(0, 0, Lifecycle.LIVE));
        const listDeleted = (await contract.listAdsByStatus(0, 0, Lifecycle.DELETE));
        expect(adsCount).gt(0);
        expect(listAds[0].status).equal(Lifecycle.PAUSED)
        expect(listPaused.length).equal(14)
        expect(listPaused.filter(e=>e.id.gt(0)).length).equal(1)
        expect(listLived.length).equal(14)
        expect(listLived.filter(e=>e.id.gt(0)).length).equal(13)
        expect(listDeleted.length).equal(14)
        expect(listDeleted.filter(e=>e.id.gt(0)).length).equal(0)
    });

    it("Should not create proposition for paused ads", async function () {
        try {
            const listAds = (await contract.listAds(0, 0));
            expect(listAds[0].status).equal(Lifecycle.PAUSED)
            const props = createProposition(listAds[0].id, listAds[0].priceCurrency);
            await (await contract.connect(addr2).createProposition(props)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("Ads: ads not live");
        }
    })

    it("Should update ads to delete for delete virtually", async function () {
        const adsCountOld = await contract.countAds();
        const listAdsOld = (await contract.listAds(0, 0));
        expect(adsCountOld).gt(0);
        expect(listAdsOld.length).gt(0);
        //create
        const ads = listAdsOld[1];
        expect(ads.status).eq(Lifecycle.LIVE);
        await (await contract.connect(addr1).deleteAds(ads.id)).wait();
        //check
        const adsCount = await contract.countAds();
        const listAds = (await contract.listAds(0, 0));
        const listPaused = (await contract.listAdsByStatus(0, 0, Lifecycle.PAUSED));
        const listLived = (await contract.listAdsByStatus(0, 0, Lifecycle.LIVE));
        const listDeleted = (await contract.listAdsByStatus(0, 0, Lifecycle.DELETE));
        expect(adsCount).gt(0);
        expect(listAds[0].status).equal(Lifecycle.PAUSED)
        expect(listPaused.length).equal(14)
        expect(listPaused.filter(e=>e.id.gt(0)).length).equal(1)
        expect(listLived.length).equal(14)
        expect(listLived.filter(e=>e.id.gt(0)).length).equal(12)
        expect(listDeleted.length).equal(14)
        expect(listDeleted.filter(e=>e.id.gt(0)).length).equal(1)
    });

    it("Should not create proposition for deleted ads", async function () {
        try {
            const listAds = (await contract.listAds(0, 0));
            expect(listAds[1].status).equal(Lifecycle.DELETE)
            const props = createProposition(listAds[1].id, listAds[1].priceCurrency);
            await (await contract.connect(addr2).createProposition(props)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("Ads: ads not live");
        }
    })

    function createAds(handle = "https://twitter.com/ACCOUNT") {
        return {
            id: 0,
            network: SocialNetworkEnum.facebook,
            handle,
            audiences: [SocialAudiencesEnum.ageAdult] as string[],
            followers: 10,
            price: 1,
            priceCurrency: tokenContract.address,
            duration: 10,
            durationPeriod: SocialDurationPeriodEnum.day,
            description: "desc",
            owner: ethers.constants.AddressZero,
            pubKey:ethers.utils.formatBytes32String(""),
            signature:[],
            stats: {
              countProposition: 10,
              countPropositionAccepted: 10
            },
            status: Lifecycle.LIVE
        };
    }

    function createProposition(adsId: BigNumberish, currency: string) {
        return {
            id: 0 as BigNumberish,
            adsId,
            startat: new Date().getTime(),
            endat: new Date().getTime() + 1000,
            amount: TestHelper.addPrecision(10),
            currency,
            owner: ethers.constants.AddressZero,
            accepted: TriState.TRUE,
            canClaim: TriState.TRUE,
            claimed: true,
            pubKey:ethers.utils.formatBytes32String(""),
            contact: "Contact me at 0999999999",
            description: "We want to propose...."
        }
    }
});