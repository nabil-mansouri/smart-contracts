//must be first (mock)
import { TestHelper } from "./testHelper";
//import
import { expect } from "chai";
import "mocha";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { SocialNameContractProxy, SocialViews, TokenContract } from 'typechain-types';
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import { PaymentType, TriState, UnitUtils } from "src/utils";

describe("SocialName", function () {
    const SUPPLY = BigNumber.from(10).pow(6).mul(2); 
    const REWARD = BigNumber.from(10).pow(3);
    const testHelper = new TestHelper(SUPPLY, REWARD);
    let contract: SocialNameContractProxy;
    let tokenContract: TokenContract;
    let owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress, addr3: SignerWithAddress, addr4: SignerWithAddress;
    const SERVICE_ID = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_REGISTRATION"));
    before(async function () {
        await TestHelper.takeSnapshot();
        const testHelper = new TestHelper(SUPPLY, REWARD);
        [owner,,,,,,,,,,,,,addr1, addr2, addr3, addr4] = await testHelper.signerPromise;
        contract = await testHelper.contractSocialNamePromise(owner.address);
        tokenContract = await testHelper.contractTokenPromise;
        await (await tokenContract.connect(owner).transfer(addr1.address, TestHelper.addPrecision(1000))).wait();
        await (await tokenContract.connect(owner).transfer(addr2.address, TestHelper.addPrecision(1000))).wait();
        await (await tokenContract.connect(owner).transfer(addr3.address, TestHelper.addPrecision(1000))).wait();
        await (await tokenContract.connect(owner).transfer(addr4.address, TestHelper.addPrecision(1000))).wait();
    });
    after(async function () {
        await TestHelper.revertSnapshot();
    });

    it("Should set the right owner", async function () {
        expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should get config", async function () {
        const config = await contract.connect(addr1).socialConfig();
        expect(config.tokenAddress).equal(tokenContract.address);
        expect(config.validatorRequire).equal(true);
        expect(config.validator).equal(owner.address);
        expect(config.registration.amount).eq(TestHelper.addPrecision(10));
        expect(config.registration.currency).eq(tokenContract.address);
        expect(config.registration.paymentType).eq(0);
        expect(config.registration.service).eq(SERVICE_ID);
        expect(config.allowChangeOwner).eq(true);
    });

    it("Should not create registration for addr1 using hook if bad price", async function () {
        const registrationCountOld = await contract.registrationCount();
        const registrationOldId = (await contract.seeRegistrationIds(addr1.address));
        const registrationsOld = await contract.seeRegistration(addr1.address);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(registrationOldId.length).equal(0);       
        expect(registrationCountOld).equal(0);
        expect(registrationsOld.length).equal(0);
        expect(balanceBefore).equal(TestHelper.addPrecision(1000));
        //create
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login"));
        const toSign = await contract.prepareSignature(addr1.address, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        const registration = createRegistration(hash, signature)
        const userData = await contract.generateUserData(registration);
        try {
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(11), userData)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("Price: invalid price");
        }
        //check
        const registrationCount = await contract.registrationCount();
        const registrationIds = await contract.seeRegistrationIds(addr1.address);
        const registrations = await contract.seeRegistration(addr1.address);
        const balance = await tokenContract.balanceOf(addr1.address);
        const lockCount = await contract.lockCount();
        expect(balance).equal(TestHelper.addPrecision(1000));
        expect(registrationIds.length).eq(0);
        expect(registrationCount).eq(0);
        expect(registrations.length).eq(0);
        expect(lockCount).eq(0)
    });

    it("Should create registration for addr1 using hook", async function () {
        const registrationCountOld = await contract.registrationCount();
        const registrationOldId = await contract.seeRegistrationIds(addr1.address);
        const registrationsOld = await contract.seeRegistration(addr1.address);
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(registrationOldId.length).equal(0);
        expect(registrationCountOld).equal(0);
        expect(registrationsOld.length).equal(0);
        expect(balanceBefore).equal(TestHelper.addPrecision(1000));
        //create
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login"));
        const toSign = await contract.prepareSignature(addr1.address, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        const registrat = createRegistration(hash, signature)
        const userData = await contract.generateUserData(registrat);
        await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(10), userData)).wait();
        //check
        const registrationCount = await contract.registrationCount();
        const registrationId = await contract.registrationsOwner(addr1.address, 0);
        const registration = await contract.registrationsById(registrationId);
        const registrations = await contract.seeRegistration(addr1.address);
        const balance = await tokenContract.balanceOf(addr1.address);
        expect(balance).equal(TestHelper.addPrecision(990));
        expect(registration.id).gt(0);
        expect(registrationCount).eq(1);
        expect(registrations[0].id).gt(0);
        expect(registrations[0].owner).eq(addr1.address);
        expect(registrations[0].name).eq(hash);
        expect(registrations[0].id).not.eq(registrat.id);
        expect(registrations[0].network).eq(registrat.network);
        expect(registrations[0].encryptName).eq(ethers.utils.hexlify(registrat.encryptName));
        expect(registrations[0].name).eq(registrat.name);
        expect(registrations[0].signature).eq(registrat.signature);
        expect(registrations[0].owner).not.eq(registrat.owner);
        //check locked payment
        const key = await contract.generateServiceKey(SERVICE_ID, registration.id);
        const lock = await contract.locked(key)
        const lockCount = await contract.lockCount();
        expect(lock.amount).equal(TestHelper.addPrecision(10));
        expect(lock.service).equal(SERVICE_ID);
        expect(lock.currency).equal(tokenContract.address);
        expect(lock.serviceId).equal(registration.id);
        expect(lock.payer).equal(addr1.address);
        expect(lock.unlocked).equal(false);
        expect(lockCount).equal(1)
    });

    it("Should not register twice", async function () {
        const registrationCountOld = await contract.registrationCount();
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(registrationCountOld).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(990));
        //create
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login"));
        const toSign = await contract.prepareSignature(addr1.address, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        const registrat = createRegistration(hash, signature)
        const userData = await contract.generateUserData(registrat);
        try {
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(10), userData)).wait();
            expect.fail("Should fail");
        } catch (e) {
            expect((e as any).message).contain("SocialNameService: the login is already registered");
        }
        //check
        const registrationCount = await contract.registrationCount();
        const balance = await tokenContract.balanceOf(addr1.address);
        expect(balance).equal(TestHelper.addPrecision(990));
        expect(registrationCount).eq(1);
        const registrationId = await contract.registrationsOwner(addr1.address, 0);
        const registration = await contract.registrationsById(registrationId);
        const registrations = await contract.seeRegistration(addr1.address);
        const lockCount = await contract.lockCount();
        expect(registration.owner).eq(addr1.address);
        expect(registrations[0].owner).eq(addr1.address);
        expect(lockCount).eq(1)
    });

    it("Should not allow register name twice", async function () {
        //create
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login"));
        const toSign = await contract.prepareSignature(addr1.address, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        const registrat = createRegistration(hash, signature)
        const userData = await contract.generateUserData(registrat);
        try {
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(10), userData)).wait();
            expect.fail("Should fail");
        } catch (e) {
            expect((e as any).message).contain("SocialNameService: the login is already registered");
        }
    });

/*
BECAUSE WE CANNOT SEND NON BYTES32 ARG
    it("Should not register when missing hash", async function () {
        const registrationCountOld = await contract.registrationCount();
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(registrationCountOld).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(990));
        //create
        const hash:number[] = [];
        const toSign = await contract.prepareSignature(addr1.address, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        const userData = await contract.generateUserData(hash, signature);
        try {
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(10), userData)).wait();
            expect.fail("Should fail");
        } catch (e) {
            expect((e as any).message).contain("SocialNameService: missing handle");
        }
        //check
        const registrationCount = await contract.registrationCount();
        const balance = await tokenContract.balanceOf(addr1.address);
        expect(balance).equal(TestHelper.addPrecision(990));
        expect(registrationCount).eq(1);
        const registrationId = await contract.registrationsOwner(addr1.address, 0);
        const registration = await contract.registrationsById(registrationId);
        const registrations = await contract.seeRegistration(addr1.address);
        expect(registration.owner).eq(addr1.address);
        expect(registrations[0].owner).eq(addr1.address);
    });
*/

    it("Should not register when bad signature", async function () {
        const registrationCountOld = await contract.registrationCount();
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(registrationCountOld).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(990));
        //create
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login2"));
        const toSign = await contract.prepareSignature(addr1.address, hash);
        const signature = await testHelper.sign(addr1.address, toSign);
        const registrat = createRegistration(hash, signature)
        const userData = await contract.generateUserData(registrat);
        try {
            await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(10), userData)).wait();
            expect.fail("Should fail");
        } catch (e) {
            expect((e as any).message).contain("checkSignature: Invalid signer");
        }
        //check
        const registrationCount = await contract.registrationCount();
        const balance = await tokenContract.balanceOf(addr1.address);
        expect(balance).equal(TestHelper.addPrecision(990));
        expect(registrationCount).eq(1);
        const registrationId = await contract.registrationsOwner(addr1.address, 0);
        const registration = await contract.registrationsById(registrationId);
        const registrations = await contract.seeRegistration(addr1.address);
        expect(registration.owner).eq(addr1.address);
        expect(registrations[0].owner).eq(addr1.address);
    });

    it("Should not update registration if missing owner", async function () {
        const registrationOldId = await contract.registrationsOwner(addr1.address, 0);
        const registrationCountOld = await contract.registrationCount();
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(registrationCountOld).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(990));
        //update
        const newOwner = ethers.constants.AddressZero;
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:billy"));
        const toSign = await contract.prepareSignature(newOwner, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        try {
            await (await contract.connect(addr1).updateRegistration(registrationOldId, newOwner, hash,hash, signature)).wait()
            expect.fail("Should fail");
        } catch (e) {
            expect((e as any).message).contain("SocialNameService: missing user address");
        }
        const registrationId = await contract.registrationsOwner(addr1.address, 0);
        const registration = await contract.registrationsById(registrationId);
        const registrations = await contract.seeRegistration(addr1.address);
        expect(registration.owner).eq(addr1.address);
        expect(registrations[0].owner).eq(addr1.address);
    });
/*
    it("Should not update registration if missing hash", async function () {
        const registrationOldId = await contract.registrationsOwner(addr1.address, 0);
        const registrationOld = await contract.registrationsById(registrationOldId);
        const registrationsOld = await contract.seeRegistration(addr1.address);
        expect(registrationOld.owner).eq(addr1.address);
        expect(registrationsOld[0].owner).eq(addr1.address);
        const registrationCountOld = await contract.registrationCount();
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(registrationCountOld).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(990));
        //update
        const newOwner = addr1.address;
        const hash:number[] = [];
        const toSign = await contract.prepareSignature(newOwner, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        try {

            await (await contract.connect(addr1).updateRegistration(registrationOldId,newOwner, hash, signature)).wait()
            expect.fail("Should fail");
        } catch (e) {
            expect((e as any).message).contain("SocialNameService: missing social login");
        }
        const registrationId = await contract.registrationsOwner(addr1.address, 0);
        const registration = await contract.registrationsById(registrationId);
        const registrations = await contract.seeRegistration(addr1.address);
        expect(registration.owner).eq(addr1.address);
        expect(registrations[0].owner).eq(addr1.address);
    });
*/
    it("Should not update registration if not the owner", async function () {
        const registrationOldId = await contract.registrationsOwner(addr1.address, 0);
        const registrationCountOld = await contract.registrationCount();
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(registrationCountOld).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(990));
        //update
        const newOwner = addr1.address;
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:billy"));
        const toSign = await contract.prepareSignature(newOwner, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        try {
            await (await contract.connect(addr2).updateRegistration(registrationOldId,newOwner, hash, hash,signature)).wait()
            expect.fail("Should fail");
        } catch (e) {
            expect((e as any).message).contain("SocialNameService: you are not the owner");
        }
        const registrationId = await contract.registrationsOwner(addr1.address, 0);
        const registration = await contract.registrationsById(registrationId);
        const registrations = await contract.seeRegistration(addr1.address);
        expect(registration.owner).eq(addr1.address);
        expect(registrations[0].owner).eq(addr1.address);
    });

    it("Should update hash registration", async function () {
        const registrationOldId = await contract.registrationsOwner(addr1.address, 0);
        const newHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:billy"));
        const registrationCountOld = await contract.registrationCount();
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        expect(registrationCountOld).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(990));
        //update
        const toSign = await contract.prepareSignature(addr1.address, newHash);
        const signature = await testHelper.sign(owner.address, toSign);
        const encryptName = ethers.utils.toUtf8Bytes("NAB")
        await (await contract.connect(addr1).updateRegistration(registrationOldId,addr1.address, newHash, encryptName, signature)).wait()
        //check
        const registrationCount = await contract.registrationCount();
        const balance = await tokenContract.balanceOf(addr1.address);
        const registrationId = await contract.registrationsOwner(addr1.address, 0);
        const registration = await contract.registrationsById(registrationId);
        const registrations = await contract.seeRegistration(addr1.address);
        expect(balance).equal(TestHelper.addPrecision(990));
        expect(registrations[0].owner).eq(addr1.address);
        expect(registrations[0].name).eq(newHash);
        expect(registrations[0].encryptName).eq(ethers.utils.hexlify(encryptName));
        expect(registrationCount).eq(1);
        expect(registration.id).gt(0);
        expect(registrationCount).eq(1);
        expect(registrations[0].id).gt(0);
    });

    it("Should update owner registration", async function () {
        const registrationCountOld = await contract.registrationCount();
        const balanceBefore = await tokenContract.balanceOf(addr1.address);
        const registrationOldId = await contract.registrationsOwner(addr1.address, 0);
        const registrationOld = await contract.registrationsById(registrationOldId);
        const registrationsOld = await contract.seeRegistration(addr1.address);
        expect(registrationOld.owner).eq(addr1.address);
        expect(registrationsOld[0].owner).eq(addr1.address);
        expect(registrationCountOld).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(990));
        //update
        const newOwner = addr2.address;
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:billy"));
        const toSign = await contract.prepareSignature(newOwner, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        await (await contract.connect(addr1).updateRegistration(registrationOldId,newOwner, hash,[], signature)).wait()
        //check
        const registrationCount = await contract.registrationCount();
        const balance = await tokenContract.balanceOf(addr1.address);
        const registrationId = await contract.registrationsOwner(newOwner, 0);
        const registration = await contract.registrationsById(registrationId);
        const registrations = await contract.seeRegistration(newOwner);
        expect(balance).equal(TestHelper.addPrecision(990));
        expect(registrationCount).eq(1);
        expect(registration.id).gt(0);
        expect(registrationCount).eq(1);
        expect(registrations[0].id).gt(0);
        expect(registrations[0].owner).eq(newOwner);
        expect(registrations[0].name).eq(hash);
        //check locked payment
        const key = await contract.generateServiceKey(SERVICE_ID, registration.id);
        const lock = await contract.locked(key)
        expect(lock.amount).equal(TestHelper.addPrecision(10));
        expect(lock.service).equal(SERVICE_ID);
        expect(lock.currency).equal(tokenContract.address);
        expect(lock.serviceId).equal(registration.id);
        expect(lock.payer).equal(newOwner);
        expect(lock.unlocked).equal(false);
    });

    let firstUnregister: BigNumber;
    it("Should unregister", async function () {
        const registrationCountOld = await contract.registrationCount();
        const registrationOldId = await contract.registrationsOwner(addr2.address, 0);
        const registrationOld = await contract.registrationsById(registrationOldId);
        const registrationsOld = await contract.seeRegistration(addr2.address);
        const balanceBefore = await tokenContract.balanceOf(addr2.address);
        firstUnregister = registrationOld.id;
        expect(registrationOld.id).gt(0);
        expect(registrationCountOld).equal(1);
        expect(registrationsOld[0].id).gt(0);
        expect(registrationsOld[0].owner).eq(addr2.address);
        expect(balanceBefore).equal(TestHelper.addPrecision(1000));
        //unregister
        await (await contract.connect(addr2).unregister(registrationOldId)).wait();
        //check
        const registrationCount = await contract.registrationCount();
        const registrationIds = await contract.seeRegistrationIds(addr2.address);
        const registrations = await contract.seeRegistration(addr2.address);
        const balance = await tokenContract.balanceOf(addr2.address);
        expect(balance).equal(TestHelper.addPrecision(1010));
        expect(registrationIds.length).eq(0);
        expect(registrationCount).eq(0);
        expect(registrations.length).eq(0);
        //check locked payment
        const key = await contract.generateServiceKey(SERVICE_ID, registrationOld.id);
        const lock = await contract.locked(key)
        expect(lock.amount).equal(TestHelper.addPrecision(10));
        expect(lock.service).equal(SERVICE_ID);
        expect(lock.currency).equal(tokenContract.address);
        expect(lock.serviceId).equal(registrationOld.id);
        expect(lock.payer).equal(addr2.address);
        expect(lock.unlocked).equal(true);
    });

    it("Should unregister twice", async function () {
        const registrationOldId = await contract.seeRegistrationIds(addr2.address);
        const balanceOld = await tokenContract.balanceOf(addr2.address);
        expect(balanceOld).equal(TestHelper.addPrecision(1010));
        expect(registrationOldId.length).eq(0)
        try {
            await (await contract.connect(addr2).unregister(firstUnregister)).wait();
            expect.fail("Should fail");
        } catch (e) {
            expect((e as any).message).contain("SocialNameService: registration not found");
        }
        const balance = await tokenContract.balanceOf(addr2.address);
        expect(balance).equal(TestHelper.addPrecision(1010));
    })

    it("Should set config", async function () {
        const configOld = await contract.connect(addr1).socialConfig();
        const copy = {...configOld};
        copy.registration = {...copy.registration}
        copy.validatorRequire = false;
        copy.registration.paymentType = 1;
        copy.allowChangeOwner = false;
        await (await contract.setConfig(copy)).wait();
        const config = await contract.connect(addr1).socialConfig();
        expect(config.tokenAddress).equal(tokenContract.address);
        expect(config.validatorRequire).equal(false);
        expect(config.validator).equal(owner.address);
        expect(config.registration.amount).eq(TestHelper.addPrecision(10));
        expect(config.registration.currency).eq(tokenContract.address);
        expect(config.registration.paymentType).eq(1);
        expect(config.registration.service).eq(SERVICE_ID);
        expect(config.allowChangeOwner).eq(false);
    });

    it("Should create registration for addr3", async function () {
        const registrationCountOld = await contract.registrationCount();
        const registrationOldId = await contract.seeRegistrationIds(addr3.address);
        const registrationsOld = await contract.seeRegistration(addr3.address);
        const balanceBefore = await tokenContract.balanceOf(addr3.address);
        expect(registrationOldId.length).equal(0);
        expect(registrationCountOld).equal(0);
        expect(registrationsOld.length).equal(0);
        expect(balanceBefore).equal(TestHelper.addPrecision(1000));
        //create
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login3"));
        const signature :number[]= [];
        const registra = createRegistration(hash, signature)
        try {
            await (await contract.connect(addr3).register(registra)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("ERC777: transfer amount exceeds allowance");
        }
        await tokenContract.connect(addr3).approve(contract.address, TestHelper.addPrecision(10));
        await (await contract.connect(addr3).register(registra)).wait();
        //check
        const registrationCount = await contract.registrationCount();
        const registrationId = await contract.registrationsOwner(addr3.address, 0);
        const registration = await contract.registrationsById(registrationId);
        const registrations = await contract.seeRegistration(addr3.address);
        const balance = await tokenContract.balanceOf(addr3.address);
        expect(balance).equal(TestHelper.addPrecision(990));
        expect(registration.id).gt(0);
        expect(registrationCount).eq(1);
        expect(registrations[0].id).gt(0);
        expect(registrations[0].owner).eq(addr3.address);
        expect(registrations[0].name).eq(hash);
        //check locked payment
        const key = await contract.generateServiceKey(SERVICE_ID, registration.id);
        const lock = await contract.locked(key)
        expect(lock.amount).equal(0);
        expect(lock.currency).equal(ethers.constants.AddressZero);
        expect(lock.serviceId).equal(0);
        expect(lock.payer).equal(ethers.constants.AddressZero);
        expect(lock.unlocked).equal(false);
        const lockCount = await contract.lockCount();
        expect(lockCount).equal(1)
    });

    it("Should not update owner registration", async function () {
        const registrationCountOld = await contract.registrationCount();
        const balanceBefore = await tokenContract.balanceOf(addr3.address);
        const registrationOldId = await contract.registrationsOwner(addr3.address, 0);
        const registrationOld = await contract.registrationsById(registrationOldId);
        const registrationsOld = await contract.seeRegistration(addr3.address);
        expect(registrationOld.owner).eq(addr3.address);
        expect(registrationsOld[0].owner).eq(addr3.address);
        expect(registrationCountOld).equal(1);
        expect(balanceBefore).equal(TestHelper.addPrecision(990));
        //update
        const newOwner = addr2.address;
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:billy"));
        const toSign = await contract.prepareSignature(newOwner, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        try {
            await (await contract.connect(addr3).updateRegistration(registrationOldId,newOwner, hash,[], signature)).wait()
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("SocialNameService: you can't change the owner");
        }
    });

    it("Should not create registration for addr4 using hook because bad price", async function () {
        const registrationCountOld = await contract.registrationCount();
        const registrationOldId = await contract.seeRegistrationIds(addr4.address);
        const registrationsOld = await contract.seeRegistration(addr4.address);
        const balanceBefore = await tokenContract.balanceOf(addr4.address);
        expect(registrationOldId.length).equal(0);
        expect(registrationCountOld).equal(1);
        expect(registrationsOld.length).equal(0);
        expect(balanceBefore).equal(TestHelper.addPrecision(1000));
        //create
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4"));
        const toSign = await contract.prepareSignature(addr4.address, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        const registra = createRegistration(hash, signature);
        const userData = await contract.generateUserData(registra);
        try {
            await (await tokenContract.connect(addr4).send(contract.address, TestHelper.addPrecision(9), userData)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("Price: invalid price");
        }
        //check
        const registrationCount = await contract.registrationCount();
        const registrationId = await contract.seeRegistrationIds(addr4.address);
        const registrations = await contract.seeRegistration(addr4.address);
        const balance = await tokenContract.balanceOf(addr4.address);
        expect(balance).equal(TestHelper.addPrecision(1000));
        expect(registrationId.length).eq(0);
        expect(registrationCount).eq(1);
        expect(registrations.length).eq(0);
    });


    it("Should create registration for addr4 using hook", async function () {
        const registrationCountOld = await contract.registrationCount();
        const registrationOldId = await contract.seeRegistrationIds(addr4.address);
        const registrationsOld = await contract.seeRegistration(addr4.address);
        const balanceBefore = await tokenContract.balanceOf(addr4.address);
        expect(registrationOldId.length).equal(0);
        expect(registrationCountOld).equal(1);
        expect(registrationsOld.length).equal(0);
        expect(balanceBefore).equal(TestHelper.addPrecision(1000));
        //create
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4"));
        const toSign = await contract.prepareSignature(addr4.address, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        const registrat = createRegistration(hash, signature)
        const userData = await contract.generateUserData(registrat);
        await (await tokenContract.connect(addr4).send(contract.address, TestHelper.addPrecision(10), userData)).wait();
        //check
        const registrationCount = await contract.registrationCount();
        const registrationId = await contract.registrationsOwner(addr4.address, 0);
        const registration = await contract.registrationsById(registrationId);
        const registrations = await contract.seeRegistration(addr4.address);
        const balance = await tokenContract.balanceOf(addr4.address);
        expect(balance).equal(TestHelper.addPrecision(990));
        expect(registration.id).gt(0);
        expect(registrationCount).eq(2);
        expect(registrations[0].id).gt(0);
        expect(registrations[0].owner).eq(addr4.address);
        expect(registrations[0].name).eq(hash);
        //check locked payment
        const key = await contract.generateServiceKey(SERVICE_ID, registration.id);
        const lock = await contract.locked(key)
        expect(lock.amount).equal(0);
        expect(lock.currency).equal(ethers.constants.AddressZero);
        expect(lock.serviceId).equal(0);
        expect(lock.payer).equal(ethers.constants.AddressZero);
        expect(lock.unlocked).equal(false);
    });

    it("Should not allow update addr4 if name already exists", async function () {
        //update
        try {
            const registrationOldId = await contract.registrationsOwner(addr4.address, 0);
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login3"));
            const toSign = await contract.prepareSignature(addr4.address, hash);
            const signature = await testHelper.sign(owner.address, toSign);
            await (await contract.connect(addr4).updateRegistration(registrationOldId,addr4.address, hash,[], signature)).wait();
        } catch (e) {
            expect((e as any).message).contain("the login is already used");
        }
    });

    it("Should allow update addr4 with different name", async function () {
        const registrationOldId = await contract.registrationsOwner(addr4.address, 0);
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
        const toSign = await contract.prepareSignature(addr4.address, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        await (await contract.connect(addr4).updateRegistration(registrationOldId,addr4.address, hash,[], signature)).wait();
    });


    it("Should unregister addr3", async function () {
        const registrationCountOld = await contract.registrationCount();
        const registrationOldId = await contract.registrationsOwner(addr3.address, 0);
        const registrationOld = await contract.registrationsById(registrationOldId);
        const registrationsOld = await contract.seeRegistration(addr3.address);
        const balanceBefore = await tokenContract.balanceOf(addr3.address);
        expect(registrationOld.id).gt(0);
        expect(registrationCountOld).equal(2);
        expect(registrationsOld[0].id).gt(0);
        expect(registrationsOld[0].owner).eq(addr3.address);
        expect(balanceBefore).equal(TestHelper.addPrecision(990));
        //unregister
        await (await contract.connect(addr3).unregister(registrationOldId)).wait();
        //check
        const registrationCount = await contract.registrationCount();
        const registrationId = await contract.seeRegistrationIds(addr3.address);
        const registrations = await contract.seeRegistration(addr3.address);
        const balance = await tokenContract.balanceOf(addr3.address);
        expect(balance).equal(TestHelper.addPrecision(990));
        expect(registrationId.length).eq(0);
        expect(registrationCount).eq(1);
        expect(registrations.length).eq(0);
    });

    it("Should unregister addr4", async function () {
        const registrationCountOld = await contract.registrationCount();
        const registrationOldId = await contract.seeRegistrationIds(addr4.address);
        const registrationOld = await contract.registrationsById(registrationOldId[0]);
        const registrationsOld = await contract.seeRegistration(addr4.address);
        const balanceBefore = await tokenContract.balanceOf(addr4.address);
        expect(registrationOld.id).gt(0);
        expect(registrationCountOld).equal(1);
        expect(registrationsOld[0].id).gt(0);
        expect(registrationsOld[0].owner).eq(addr4.address);
        expect(balanceBefore).equal(TestHelper.addPrecision(990));
        //unregister
        await (await contract.connect(addr4).unregister(registrationOldId[0])).wait();
        //check
        const registrationCount = await contract.registrationCount();
        const registrationId = await contract.seeRegistrationIds(addr4.address);
        const registrations = await contract.seeRegistration(addr4.address);
        const balance = await tokenContract.balanceOf(addr4.address);
        expect(balance).equal(TestHelper.addPrecision(990));
        expect(registrationId.length).eq(0);
        expect(registrationCount).eq(0);
        expect(registrations.length).eq(0);
    });

    it("Should allow addr4 create multiple name with same address", async function () {
        const registrationOldId = await contract.seeRegistrationIds(addr4.address);
        expect(registrationOldId.length).equal(0);
        {
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4a"));
            const toSign = await contract.prepareSignature(addr4.address, hash);
            const signature = await testHelper.sign(owner.address, toSign);
            const registrat = createRegistration(hash, signature)
            const userData = await contract.generateUserData(registrat);
            await (await tokenContract.connect(addr4).send(contract.address, TestHelper.addPrecision(10), userData)).wait();
        }
        {
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
            const toSign = await contract.prepareSignature(addr4.address, hash);
            const signature = await testHelper.sign(owner.address, toSign);
            const registrat = createRegistration(hash, signature)
            const userData = await contract.generateUserData(registrat);
            await (await tokenContract.connect(addr4).send(contract.address, TestHelper.addPrecision(10), userData)).wait();
        }
        {
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4c"));
            const toSign = await contract.prepareSignature(addr4.address, hash);
            const signature = await testHelper.sign(owner.address, toSign);
            const registrat = createRegistration(hash, signature)
            const userData = await contract.generateUserData(registrat);
            await (await tokenContract.connect(addr4).send(contract.address, TestHelper.addPrecision(10), userData)).wait();
        }
        const registrationId = await contract.seeRegistrationIds(addr4.address);
        expect(registrationId.length).equal(3);
        const hasha = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4a"));
        const tmpa = await contract.registrationsByName(hasha)
        expect(tmpa.toNumber()).gt(0)
        const hashb = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
        const tmpb = await contract.registrationsByName(hashb)
        expect(tmpb.toNumber()).gt(0)
    });
    it("Should send coin to addr4", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
        const balanceContractOld = await contract.balanceCoin();
        const balance1Old = await addr1.getBalance();
        const balance4Old = await addr4.getBalance();
        const listReceivedBefore = await contract.listPaymentReceivedForAddress(addr4.address, TriState.UNDEFINED);
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listReceivedBefore.flatMap((value)=>value).length).eq(0);
        expect(listSentBefore.length).eq(0)
        expect(balanceContractOld).eq(0);
        const amount = TestHelper.addPrecision(10);
        await (await contract.connect(addr1).sendCoin(hash,false,{value:amount})).wait()
        const listReceivedAfter = await contract.listPaymentReceivedForAddress(addr4.address, TriState.UNDEFINED);
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        const balanceContract = await contract.balanceCoin();
        const balance1 = await addr1.getBalance();
        const balance4 = await addr4.getBalance();
        expect(listReceivedAfter.flatMap((value)=>value).length).eq(1);
        expect(listSentAfter.length).eq(1)
        expect(listSentAfter[0].claimed).eq(true)
        expect(balanceContract).eq(balanceContractOld);
        expect(TestHelper.removePrecision(balance1)).approximately(TestHelper.removePrecision(balance1Old.sub(amount)), 0.05)
        expect(TestHelper.removePrecision(balance4)).approximately(TestHelper.removePrecision(balance4Old.add(amount)), 0.05)
    });
    it("Should send token to addr4", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        const balance1Old = await tokenContract.balanceOf(addr1.address);
        const balance4Old = await tokenContract.balanceOf(addr4.address);
        const listReceivedBefore = await contract.listPaymentReceivedForAddress(addr4.address, TriState.UNDEFINED);
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listReceivedBefore.flatMap((value)=>value).length).eq(1);
        expect(listSentBefore.length).eq(1)
        const amount = TestHelper.addPrecision(10);
        await (await tokenContract.connect(addr1).approve(contract.address, amount)).wait()
        await (await contract.connect(addr1).send(hash,tokenContract.address, amount,false)).wait()
        const balanceContract = await contract.balanceToken(tokenContract.address);
        const balance1 = await tokenContract.balanceOf(addr1.address);
        const balance4 = await tokenContract.balanceOf(addr4.address);
        const listReceivedAfter = await contract.listPaymentReceivedForAddress(addr4.address, TriState.UNDEFINED);
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listReceivedAfter.flatMap((value)=>value).length).eq(2);
        expect(listSentAfter.length).eq(2)
        expect(listSentAfter[1].claimed).eq(true)
        expect(balanceContract).eq(balanceContractOld);
        expect(TestHelper.removePrecision(balance1)).approximately(TestHelper.removePrecision(balance1Old.sub(amount)), 0.05)
        expect(TestHelper.removePrecision(balance4)).approximately(TestHelper.removePrecision(balance4Old.add(amount)), 0.05)
    });

    it("Should not claim anything", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
        const balanceContractOld = await contract.balanceCoin();
        const balanceOld = await addr4.getBalance();
        const tokenContractOld = await contract.balanceToken(tokenContract.address);
        const tokenOld = await tokenContract.balanceOf(addr4.address);
        await (await contract.connect(addr4).claimAll(hash)).wait();
        const balanceContractAfter = await contract.balanceCoin();
        const balanceAfter = await addr4.getBalance();
        const tokenContractAfter = await contract.balanceToken(tokenContract.address);
        const tokenAfter = await tokenContract.balanceOf(addr4.address);
        expect(balanceContractOld).eq(balanceContractAfter);
        expect(UnitUtils.removePrecision(balanceOld)).approximately(UnitUtils.removePrecision(balanceAfter), 0.01);
        expect(tokenContractOld).eq(tokenContractAfter);
        expect(tokenOld).eq(tokenAfter);
    });

    it("Should not claim if already", async function () {
        try {
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
            await (await contract.connect(addr4).claimOne(hash, 1)).wait();
            expect.fail("Should fail")    
        } catch (e) {
            expect((e as any).message).contain("Already claimed");
        }
    });

    it("Should not claim if not exists", async function () {
        try {
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:notexists"));
            await (await contract.connect(addr4).claimOne(hash, 1)).wait();
            expect.fail("Should fail")    
        } catch (e) {
            expect((e as any).message).contain("could not found receiver");
        }
    });

    it("Should not send coin to non existing name", async function () {
        try {
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:notexists"));
            await (await contract.connect(addr1).sendCoin(hash, false, {value: 10})).wait()  
            expect.fail("Should fail")    
        } catch (e) {
            expect((e as any).message).contain("could not found receiver");
        }
    });
    it("Should not send token to non existing name", async function () {
        try {
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:notexists"));
            await (await contract.connect(addr1).send(hash,tokenContract.address, 10, false)).wait()  
            expect.fail("Should fail")        
        } catch (e) {
            expect((e as any).message).contain("could not found receiver");
        }
    });
    it("Should not allow owner create registration if exists", async function () {
        try {
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4c"));
            const registrat = createRegistration(hash, [])
            registrat.owner = addr3.address;
            await(await contract.createRegistration(registrat)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("registration already exists");
        }
    })
    it("Should allow owner create registration", async function () {
        const registrationByOOld = await contract.seeRegistrationIds(addr3.address);
        const countOld = await contract.registrationCount();
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:owner"));
        const registrat = createRegistration(hash, [])
        registrat.owner = addr3.address;
        await(await contract.createRegistration(registrat)).wait();
        const count = await contract.registrationCount();
        const registrationByN = await contract.registrationsByName(hash);
        const registrationByO = await contract.seeRegistrationIds(addr3.address);
        expect(countOld).equal(count.sub(1))
        expect(registrationByOOld.length).equal(registrationByO.length-1)
        expect(registrationByN).gt(0);
    })
    it("Should allow owner delete registration", async function () {
        const registrationByOOld = await contract.seeRegistrationIds(addr3.address);
        const countOld = await contract.registrationCount();
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:owner"));
        await(await contract.deleteRegistration(hash)).wait();
        const count = await contract.registrationCount();
        const registrationByN = await contract.registrationsByName(hash);
        const registrationByO = await contract.seeRegistrationIds(addr3.address);
        expect(countOld).equal(count.add(1))
        expect(registrationByOOld.length).equal(registrationByO.length+1)
        expect(registrationByN).eq(0);
    })
    it("Should not allow owner delete non existing registration", async function () {
        try {
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:owner"));
            await(await contract.deleteRegistration(hash)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("registration does not exists");
        }
    })
    it("Should not allow non owner create registration", async function () {
        try {
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:owner"));
            const registrat = createRegistration(hash, [])
            registrat.owner = addr3.address;
            await(await contract.connect(addr3).createRegistration(registrat)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing role");
        }
    })
    it("Should not allow non owner delete registration", async function () {
        try {
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:owner"));
            await(await contract.connect(addr3).deleteRegistration(hash)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing role");
        }
    })
    it("Should not allow non owner set config", async function () {
        try {
            const configOld = await contract.connect(addr1).socialConfig();
            await(await contract.connect(addr3).setConfig(configOld)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing role");
        }
    })    
    it("Should reset config lock", async function () {
        const configOld = await contract.connect(addr1).socialConfig();
        const copy = {...configOld};
        copy.registration = {...copy.registration}
        copy.registration.paymentType = 0;
        await (await contract.setConfig(copy)).wait();
        const config = await contract.connect(addr1).socialConfig();
        expect(config.registration.paymentType).eq(0);
    });
    it("Should allow owner unlock payment", async function () {//create
        const balanceOld = await tokenContract.balanceOf(addr1.address);
        expect(balanceOld).eq(TestHelper.addPrecision(980))
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:unlock"));
        const toSign = await contract.prepareSignature(addr1.address, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        const registrat = createRegistration(hash,signature)
        const userData = await contract.generateUserData(registrat);
        await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(10), userData)).wait();
        const balance = await tokenContract.balanceOf(addr1.address);
        expect(balance).eq(TestHelper.addPrecision(970))
        const registrations = await contract.registrationsOwner(addr1.address, 0);
        expect(registrations.toNumber()).greaterThan(0);
        //check locked
        const key = await contract.generateServiceKey(SERVICE_ID, registrations);
        const lock = await contract.locked(key)
        expect(lock.amount).equal(TestHelper.addPrecision(10));
        expect(lock.service).equal(SERVICE_ID);
        expect(lock.currency).equal(tokenContract.address);
        expect(lock.serviceId).equal(registrations);
        expect(lock.payer).equal(addr1.address);
        expect(lock.unlocked).equal(false);
        //owner unlock
        await (await contract.unlockPayment(SERVICE_ID, registrations, addr1.address)).wait();
        const balanceAfter = await tokenContract.balanceOf(addr1.address);
        expect(balanceAfter).eq(TestHelper.addPrecision(980))
    })
    it("Should not allow non owner unlock payment", async function () {//create
        try {
            await (await contract.connect(addr1).unlockPayment(SERVICE_ID, 1, addr1.address)).wait();
            expect.fail("Should fail")
        } catch (e) {
            expect((e as any).message).contain("missing role");
        }
    })

    it("Should send coin to addr5 - not exists", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:newlogin"));
        const balanceContractOld = await contract.balanceCoin();
        const balance1Old = await addr1.getBalance();
        const listReceivedBefore = await contract.listPaymentReceivedForHash(hash, TriState.UNDEFINED);
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listReceivedBefore.length).eq(0);
        expect(listSentBefore.length).eq(2)
        expect(balanceContractOld).eq(0);
        const amount = TestHelper.addPrecision(10);
        await (await contract.connect(addr1).sendCoin(hash,true,{value:amount})).wait()
        const listReceivedAfter = await contract.listPaymentReceivedForHash(hash, TriState.UNDEFINED);
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        const balanceContract = await contract.balanceCoin();
        const balance1 = await addr1.getBalance();
        expect(listReceivedAfter.length).eq(1);
        expect(listSentAfter.length).eq(3)
        expect(listSentAfter[2].claimed).eq(false)
        expect(balanceContract).eq(balanceContractOld.add(amount));
        expect(TestHelper.removePrecision(balance1)).approximately(TestHelper.removePrecision(balance1Old.sub(amount)), 0.05)
    });
    it("Should send token to addr5 - not exists", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:newlogin"));
        const balanceContractOld = await contract.balanceToken(tokenContract.address);
        const balance1Old = await tokenContract.balanceOf(addr1.address);
        const listReceivedBefore = await contract.listPaymentReceivedForHash(hash, TriState.UNDEFINED);
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listReceivedBefore.length).eq(1);
        expect(listSentBefore.length).eq(3)
        const amount = TestHelper.addPrecision(10);
        await (await tokenContract.connect(addr1).approve(contract.address, amount)).wait()
        await (await contract.connect(addr1).send(hash,tokenContract.address, amount,true)).wait()
        const balanceContract = await contract.balanceToken(tokenContract.address);
        const balance1 = await tokenContract.balanceOf(addr1.address);
        const listReceivedAfter = await contract.listPaymentReceivedForHash(hash, TriState.UNDEFINED);
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listReceivedAfter.length).eq(2);
        expect(listSentAfter.length).eq(4)
        expect(listSentAfter[3].claimed).eq(false)
        expect(balanceContract).eq(balanceContractOld.add(amount));
        expect(TestHelper.removePrecision(balance1)).approximately(TestHelper.removePrecision(balance1Old.sub(amount)), 0.05)
    });

    it("Should not claim if not exists", async function () {
        try {
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:newlogin"));
            await (await contract.connect(addr4).claimOne(hash, 1)).wait();
            expect.fail("Should fail")    
        } catch (e) {
            expect((e as any).message).contain("could not found receiver");
        }
    });

    it("Should create registration for newlogin using hook", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:newlogin"));
        const registrationCountOld = await contract.registrationCount();
        const listReceivedBefore = await contract.listPaymentReceivedForAddress(addr1.address, TriState.UNDEFINED);
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listReceivedBefore.flatMap(e=>e).length).eq(0);
        expect(listSentBefore.length).eq(4)
        //create
        const toSign = await contract.prepareSignature(addr1.address, hash);
        const signature = await testHelper.sign(owner.address, toSign);
        const registrat = createRegistration(hash, signature)
        const userData = await contract.generateUserData(registrat);
        await (await tokenContract.connect(addr1).send(contract.address, TestHelper.addPrecision(10), userData)).wait();
        const listReceivedAfter = await contract.listPaymentReceivedForAddress(addr1.address, TriState.UNDEFINED);
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listReceivedAfter.flatMap(e=>e).length).eq(2);
        expect(listSentAfter.length).eq(4)
        expect(listReceivedAfter.flatMap(e=>e)[0].claimed).eq(false)
        expect(listReceivedAfter.flatMap(e=>e)[1].claimed).eq(false)
        //check
        const registrationCount = await contract.registrationCount();
        expect(registrationCount).equal(registrationCountOld.add(1))
    });


    it("Should claim coin", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:newlogin"));
        const listReceived = await contract.listPaymentReceivedForHash(hash, TriState.UNDEFINED);
        const balanceContractOld = await contract.balanceCoin();
        const balanceOld = await addr1.getBalance();
        const tokenContractOld = await contract.balanceToken(tokenContract.address);
        const tokenOld = await tokenContract.balanceOf(addr1.address);
        expect(listReceived[0].claimed).eq(false)
        await (await contract.connect(addr4).claimOne(hash, listReceived[0].id)).wait();
        const balanceContractAfter = await contract.balanceCoin();
        const balanceAfter = await addr1.getBalance();
        const tokenContractAfter = await contract.balanceToken(tokenContract.address);
        const tokenAfter = await tokenContract.balanceOf(addr1.address);
        expect(UnitUtils.removePrecision(balanceContractAfter)).eq(UnitUtils.removePrecision(balanceContractOld) - 10);
        expect(UnitUtils.removePrecision(balanceAfter)).approximately(UnitUtils.removePrecision(balanceOld) + 10, 0.01);
        expect(tokenContractOld).eq(tokenContractAfter);
        expect(tokenOld).eq(tokenAfter);
        const listReceivedAfter = await contract.listPaymentReceivedForHash(hash, TriState.UNDEFINED);
        expect(listReceivedAfter[0].claimed).eq(true)
        expect(listReceivedAfter[1].claimed).eq(false)
    });

    it("Should claim token", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:newlogin"));
        const listReceived = await contract.listPaymentReceivedForHash(hash, TriState.UNDEFINED);
        const balanceContractOld = await contract.balanceCoin();
        const balanceOld = await addr1.getBalance();
        const tokenContractOld = await contract.balanceToken(tokenContract.address);
        const tokenOld = await tokenContract.balanceOf(addr1.address);
        expect(listReceived[0].claimed).eq(true)
        expect(listReceived[1].claimed).eq(false)
        await (await contract.connect(addr4).claimAll(hash)).wait();
        const balanceContractAfter = await contract.balanceCoin();
        const balanceAfter = await addr1.getBalance();
        const tokenContractAfter = await contract.balanceToken(tokenContract.address);
        const tokenAfter = await tokenContract.balanceOf(addr1.address);
        expect(balanceContractAfter).eq(balanceContractOld);
        expect(UnitUtils.removePrecision(balanceAfter)).approximately(UnitUtils.removePrecision(balanceOld), 0.01);
        expect(tokenContractAfter).eq(tokenContractOld.sub(UnitUtils.addPrecision(10)));
        expect(tokenAfter).eq(tokenOld.add(UnitUtils.addPrecision(10)));
        const listReceivedAfter = await contract.listPaymentReceivedForHash(hash, TriState.UNDEFINED);
        expect(listReceivedAfter[0].claimed).eq(true)
        expect(listReceivedAfter[1].claimed).eq(true)
    });

    it("Should not claim anything", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:newlogin"));
        const listReceived = await contract.listPaymentReceivedForHash(hash, TriState.UNDEFINED);
        const balanceContractOld = await contract.balanceCoin();
        const balanceOld = await addr1.getBalance();
        const tokenContractOld = await contract.balanceToken(tokenContract.address);
        const tokenOld = await tokenContract.balanceOf(addr1.address);
        expect(listReceived[0].claimed).eq(true)
        expect(listReceived[1].claimed).eq(true)
        await (await contract.connect(addr4).claimAll(hash)).wait();
        const balanceContractAfter = await contract.balanceCoin();
        const balanceAfter = await addr1.getBalance();
        const tokenContractAfter = await contract.balanceToken(tokenContract.address);
        const tokenAfter = await tokenContract.balanceOf(addr1.address);
        expect(balanceContractAfter).eq(balanceContractOld);
        expect(UnitUtils.removePrecision(balanceAfter)).approximately(UnitUtils.removePrecision(balanceOld), 0.01);
        expect(tokenContractAfter).eq(tokenContractOld);
        expect(tokenAfter).eq(tokenOld);
        const listReceivedAfter = await contract.listPaymentReceivedForHash(hash, TriState.UNDEFINED);
        expect(listReceivedAfter[0].claimed).eq(true)
        expect(listReceivedAfter[1].claimed).eq(true)
    });

    it("Should not claim twice", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:newlogin"));
        try {
            const listReceivedAfter = await contract.listPaymentReceivedForHash(hash, TriState.UNDEFINED);
            expect(listReceivedAfter[0].claimed).eq(true)
            expect(listReceivedAfter[1].claimed).eq(true)
            await (await contract.connect(addr2).claimOne(hash,listReceivedAfter[0].id)).wait();
            expect.fail("Should fail");
        } catch (e) {
            expect((e as any).message).contain("Already claimed");
        }
    })

    it("Should set config fixed fees using coin", async function () {
        const configOld = await contract.connect(addr1).socialConfig();
        const copy = {...configOld};
        copy.fee = {...copy.fee,paymentType:PaymentType.PAY, amount: UnitUtils.addPrecision(1), currency: ethers.constants.AddressZero};
        await (await contract.setConfig(copy)).wait();
        const config = await contract.connect(addr1).socialConfig();
        expect(config.fee.currency).eq(ethers.constants.AddressZero);
        expect(config.fee.amount).eq(UnitUtils.addPrecision(1));
    })

    it("Should send coin and pay coin fixed fees using coin", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
        const balance1Old = await addr1.getBalance()
        const balance4Old = await addr4.getBalance()
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        const amount = TestHelper.addPrecision(10);
        const amountLessFee = amount.sub(TestHelper.addPrecision(1))
        await (await contract.connect(addr1).sendCoin(hash,true, {value: amount})).wait()
        const balance1After = await addr1.getBalance()
        const balance4After = await addr4.getBalance()
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listSentAfter.length).eq(listSentBefore.length+1);
        expect(listSentAfter[listSentBefore.length-1].claimed).eq(true)
        expect(TestHelper.removePrecision(balance4After)).eq(TestHelper.removePrecision((balance4Old.add(amountLessFee))));
        expect(TestHelper.removePrecision(balance1After)).approximately(TestHelper.removePrecision(balance1Old.sub(amount)), 0.05)    
    })

    it("Should send token and pay coin fixed fees using coin", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
        const balance1Old = await tokenContract.balanceOf(addr1.address)
        const balance4Old = await tokenContract.balanceOf(addr4.address)
        const balanceCoin1Old = await addr1.getBalance()
        const balanceCoinContractOld = await contract.balanceCoin()
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        const amount = TestHelper.addPrecision(10);
        const fee = TestHelper.addPrecision(1);
        await (await tokenContract.connect(addr1).approve(contract.address, amount)).wait()
        await (await contract.connect(addr1).send(hash,tokenContract.address, amount,true,{value: fee})).wait()
        const balance1After = await tokenContract.balanceOf(addr1.address)
        const balance4After = await tokenContract.balanceOf(addr4.address)
        const balanceCoin1After = await addr1.getBalance()
        const balanceCoinContractAfter = await contract.balanceCoin()
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listSentAfter.length).eq(listSentBefore.length+1);
        expect(listSentAfter[listSentBefore.length-1].claimed).eq(true)
        expect(TestHelper.removePrecision(balance4After)).eq(TestHelper.removePrecision((balance4Old.add(amount))));
        expect(TestHelper.removePrecision(balance1After)).eq(TestHelper.removePrecision(balance1Old.sub(amount)))  
        expect(TestHelper.removePrecision(balanceCoin1After)).approximately(TestHelper.removePrecision((balanceCoin1Old.sub(fee))),0.01);
        expect(TestHelper.removePrecision(balanceCoinContractAfter)).eq(TestHelper.removePrecision(balanceCoinContractOld.add(fee)))   
    })

    it("Should set config fixed fees using token", async function () {
        const configOld = await contract.connect(addr1).socialConfig();
        const copy = {...configOld};
        copy.fee = {...copy.fee,paymentType:PaymentType.PAY, amount: UnitUtils.addPrecision(100), currency: tokenContract.address};
        await (await contract.setConfig(copy)).wait();
        const config = await contract.connect(addr1).socialConfig();
        expect(config.fee.currency).eq(tokenContract.address);
        expect(config.fee.amount).eq(UnitUtils.addPrecision(100));
    })

    it("Should send coin and pay coin fixed fees using token", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
        const balanceCoin1Old = await addr1.getBalance()
        const balanceCoin4Old = await addr4.getBalance()
        const balance1Old = await tokenContract.balanceOf(addr1.address)
        const balanceContractOld = await tokenContract.balanceOf(contract.address)
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        const amount = TestHelper.addPrecision(10);
        const fee = (TestHelper.addPrecision(100))
        await (await tokenContract.connect(addr1).approve(contract.address, fee)).wait()
        await (await contract.connect(addr1).sendCoin(hash,true, {value: amount})).wait()
        const balanceContractAfter = await tokenContract.balanceOf(contract.address)
        const balanceCoin1After = await addr1.getBalance()
        const balanceCoin4After = await addr4.getBalance()
        const balance1After = await tokenContract.balanceOf(addr1.address)
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listSentAfter.length).eq(listSentBefore.length+1);
        expect(listSentAfter[listSentBefore.length-1].claimed).eq(true)
        expect(TestHelper.removePrecision(balanceContractAfter)).eq(TestHelper.removePrecision(balanceContractOld.add(fee)))  
        expect(TestHelper.removePrecision(balance1After)).eq(TestHelper.removePrecision(balance1Old.sub(fee)))  
        expect(TestHelper.removePrecision(balanceCoin4After)).eq(TestHelper.removePrecision((balanceCoin4Old.add(amount))));
        expect(TestHelper.removePrecision(balanceCoin1After)).approximately(TestHelper.removePrecision(balanceCoin1Old.sub(amount)), 0.05)    
    })

    it("Should send token and pay coin fixed fees using token", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
        const balance1Old = await tokenContract.balanceOf(addr1.address)
        const balance4Old = await tokenContract.balanceOf(addr4.address)
        const balanceContractOld = await tokenContract.balanceOf(contract.address)
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        const amount = TestHelper.addPrecision(10);
        const fee = TestHelper.addPrecision(100);
        const amountPlusFee = amount.add(fee);
        await (await tokenContract.connect(addr1).approve(contract.address, amount.add(fee))).wait()
        await (await contract.connect(addr1).send(hash,tokenContract.address, amount,true)).wait()
        const balance1After = await tokenContract.balanceOf(addr1.address)
        const balance4After = await tokenContract.balanceOf(addr4.address)
        const balanceContractAfter = await tokenContract.balanceOf(contract.address)
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(TestHelper.removePrecision(balanceContractAfter)).eq(TestHelper.removePrecision(balanceContractOld.add(fee)))  
        expect(listSentAfter.length).eq(listSentBefore.length+1);
        expect(listSentAfter[listSentBefore.length-1].claimed).eq(true)
        expect(TestHelper.removePrecision(balance1After)).eq(TestHelper.removePrecision(balance1Old.sub(amountPlusFee)))  
        expect(TestHelper.removePrecision(balance4After)).eq(TestHelper.removePrecision((balance4Old.add(amount))));  
    })



    it("Should set config proportional fees using coin", async function () {
        const configOld = await contract.connect(addr1).socialConfig();
        const copy = {...configOld};
        copy.fee = {...copy.fee,paymentType:PaymentType.PAY_PROPORTIONNAL, amount: BigNumber.from(20), currency: ethers.constants.AddressZero};
        await (await contract.setConfig(copy)).wait();
        const config = await contract.connect(addr1).socialConfig();
        expect(config.fee.currency).eq(ethers.constants.AddressZero);
        expect(config.fee.paymentType).eq(PaymentType.PAY_PROPORTIONNAL);
        expect(config.fee.amount).eq((20));
    })

    it("Should send coin and pay proportional fees", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
        const balance1Old = await addr1.getBalance()
        const balance4Old = await addr4.getBalance()
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        const amount = TestHelper.addPrecision(10);
        const amountLessFee = amount.sub(TestHelper.addPrecision(2))
        await (await contract.connect(addr1).sendCoin(hash,true, {value: amount})).wait()
        const balance1After = await addr1.getBalance()
        const balance4After = await addr4.getBalance()
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listSentAfter.length).eq(listSentBefore.length+1);
        expect(listSentAfter[listSentBefore.length-1].claimed).eq(true)
        expect(TestHelper.removePrecision(balance4After)).eq(TestHelper.removePrecision((balance4Old.add(amountLessFee))));
        expect(TestHelper.removePrecision(balance1After)).approximately(TestHelper.removePrecision(balance1Old.sub(amount)), 0.05)    
    })

    it("Should send token and pay proportional fees", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
        const balance1Old = await tokenContract.balanceOf(addr1.address)
        const balance4Old = await tokenContract.balanceOf(addr4.address)
        const balanceTokenContractOld = await tokenContract.balanceOf(contract.address)
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        const amount = TestHelper.addPrecision(10);
        const fee = TestHelper.addPrecision(2);
        const amountPlusFee = amount.add(fee);
        await (await tokenContract.connect(addr1).approve(contract.address, amountPlusFee)).wait()
        await (await contract.connect(addr1).send(hash,tokenContract.address, amount,true)).wait()
        const balance1After = await tokenContract.balanceOf(addr1.address)
        const balance4After = await tokenContract.balanceOf(addr4.address)
        const balanceTokenContractAfter = await tokenContract.balanceOf(contract.address)
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listSentAfter.length).eq(listSentBefore.length+1);
        expect(listSentAfter[listSentBefore.length-1].claimed).eq(true)
        expect(TestHelper.removePrecision(balance4After)).eq(TestHelper.removePrecision((balance4Old.add(amount))));
        expect(TestHelper.removePrecision(balance1After)).eq(TestHelper.removePrecision(balance1Old.sub(amountPlusFee)))  
        expect(TestHelper.removePrecision(balanceTokenContractAfter)).eq(TestHelper.removePrecision(balanceTokenContractOld.add(fee)))   
    })


    it("Should set config proportional fees using token", async function () {
        const configOld = await contract.connect(addr1).socialConfig();
        const copy = {...configOld};
        copy.fee = {...copy.fee,paymentType:PaymentType.PAY_PROPORTIONNAL, amount: BigNumber.from(10), currency: tokenContract.address};
        await (await contract.setConfig(copy)).wait();
        const config = await contract.connect(addr1).socialConfig();
        expect(config.fee.currency).eq(tokenContract.address);
        expect(config.fee.paymentType).eq(PaymentType.PAY_PROPORTIONNAL);
        expect(config.fee.amount).eq(10);
    })

    it("Should send coin and pay proportional fees", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
        const balanceCoin1Old = await addr1.getBalance()
        const balanceCoin4Old = await addr4.getBalance()
        const balanceCoinContractOld = await contract.balanceCoin();
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        const amount = TestHelper.addPrecision(10);
        const fee = (TestHelper.addPrecision(1)) //10%
        const amountPlusFee = amount.add(fee)
        await (await contract.connect(addr1).sendCoin(hash,true, {value: amountPlusFee})).wait()
        const balanceContractAfter =await contract.balanceCoin();
        const balanceCoin1After = await addr1.getBalance()
        const balanceCoin4After = await addr4.getBalance()
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listSentAfter.length).eq(listSentBefore.length+1);
        expect(listSentAfter[listSentBefore.length-1].claimed).eq(true)
        expect(TestHelper.removePrecision(balanceContractAfter)).approximately(TestHelper.removePrecision(balanceCoinContractOld.add(fee)), 0.1)  
        expect(TestHelper.removePrecision(balanceCoin4After)).approximately(TestHelper.removePrecision((balanceCoin4Old.add(amount))), 0.15)  
        expect(TestHelper.removePrecision(balanceCoin1After)).approximately(TestHelper.removePrecision(balanceCoin1Old.sub(amountPlusFee)), 0.15)
    })

    it("Should send token and pay coin proportional fees using token", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:login4b"));
        const balance1Old = await tokenContract.balanceOf(addr1.address)
        const balance4Old = await tokenContract.balanceOf(addr4.address)
        const balanceContractOld = await tokenContract.balanceOf(contract.address)
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        const amount = TestHelper.addPrecision(10);
        const fee = TestHelper.addPrecision(1);//10%
        const amountPlusFee = amount.add(fee);
        await (await tokenContract.connect(addr1).approve(contract.address, amount.add(fee))).wait()
        await (await contract.connect(addr1).send(hash,tokenContract.address, amount,true)).wait()
        const balance1After = await tokenContract.balanceOf(addr1.address)
        const balance4After = await tokenContract.balanceOf(addr4.address)
        const balanceContractAfter = await tokenContract.balanceOf(contract.address)
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(TestHelper.removePrecision(balanceContractAfter)).eq(TestHelper.removePrecision(balanceContractOld.add(fee)))  
        expect(listSentAfter.length).eq(listSentBefore.length+1);
        expect(listSentAfter[listSentBefore.length-1].claimed).eq(true)
        expect(TestHelper.removePrecision(balance1After)).eq(TestHelper.removePrecision(balance1Old.sub(amountPlusFee)))  
        expect(TestHelper.removePrecision(balance4After)).eq(TestHelper.removePrecision((balance4Old.add(amount))));  
    })
   
     
    it("Should cancel send coin", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:newagainandagain"));
        const balanceCoin1Old = await addr1.getBalance()
        const balanceCoinContractOld = await contract.balanceCoin();
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        const amount = TestHelper.addPrecision(10);
        const fee = TestHelper.addPrecision(1);//10%
        const amountPlusFee = amount.add(fee);
        await (await contract.connect(addr1).sendCoin(hash,true,{value:amountPlusFee})).wait()
        const balanceCoin1After = await addr1.getBalance()
        const balanceCoinContractAfter = await contract.balanceCoin();
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listSentAfter.length).eq(listSentBefore.length+1);
        expect(listSentAfter[listSentAfter.length-1].claimed).eq(false) 
        expect(TestHelper.removePrecision(balanceCoin1After)).approximately(TestHelper.removePrecision((balanceCoin1Old.sub(amountPlusFee))),0.15);
        expect(TestHelper.removePrecision(balanceCoinContractAfter)).eq(TestHelper.removePrecision(balanceCoinContractOld.add(amountPlusFee)))  
        //CANCEL
        const id = listSentAfter[listSentAfter.length-1].id;
        await (await contract.connect(addr1).cancelOne(id)).wait()
        const balanceCoin1After2 = await addr1.getBalance()
        const balanceCoinContractAfter2 = await contract.balanceCoin();
        const listSentAfter2 = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listSentAfter2.length).eq(listSentAfter.length);
        expect(listSentAfter2[listSentAfter.length-1].claimed).eq(true)
        expect(listSentAfter2[listSentAfter.length-1].cancel).eq(true)
        expect(TestHelper.removePrecision(balanceCoin1After2)).approximately(TestHelper.removePrecision((balanceCoin1Old.sub(fee))),0.15);
        expect(TestHelper.removePrecision(balanceCoinContractAfter2)).approximately(TestHelper.removePrecision(balanceCoinContractOld.add(fee)),0.15); 
    })

    it("Should cancel send token", async function () {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("twitter:handle:newagainandagain"));
        const balance1Old = await tokenContract.balanceOf(addr1.address)
        const balanceContractOld = await tokenContract.balanceOf(contract.address)
        const listSentBefore = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        const amount = TestHelper.addPrecision(10);
        const fee = TestHelper.addPrecision(1);//10%
        const amountPlusFee = amount.add(fee);
        await (await tokenContract.connect(addr1).approve(contract.address, amount.add(fee))).wait()
        await (await contract.connect(addr1).send(hash,tokenContract.address, amount,true)).wait()
        const balance1After = await tokenContract.balanceOf(addr1.address)
        const balanceContractAfter = await tokenContract.balanceOf(contract.address)
        const listSentAfter = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listSentAfter.length).eq(listSentBefore.length+1);
        expect(listSentAfter[listSentAfter.length-1].claimed).eq(false)
        expect(TestHelper.removePrecision(balance1After)).eq(TestHelper.removePrecision(balance1Old.sub(amountPlusFee)))  
        expect(TestHelper.removePrecision(balanceContractAfter)).eq(TestHelper.removePrecision((balanceContractOld.add(amount).add(fee))));  
        //CANCEL
        const id = listSentAfter[listSentAfter.length-1].id;
        await (await contract.connect(addr1).cancelOne(id)).wait()
        const balance1After2 = await tokenContract.balanceOf(addr1.address)
        const balanceContractAfter2 = await tokenContract.balanceOf(contract.address)
        const listSentAfter2 = await contract.listPaymentSendForAddress(addr1.address, TriState.UNDEFINED);
        expect(listSentAfter2.length).eq(listSentAfter.length);
        expect(listSentAfter2[listSentAfter.length-1].claimed).eq(true)
        expect(listSentAfter2[listSentAfter.length-1].cancel).eq(true)
        expect(TestHelper.removePrecision(balance1After2)).eq(TestHelper.removePrecision(balance1Old.sub(fee)))  
        expect(TestHelper.removePrecision(balanceContractAfter2)).eq(TestHelper.removePrecision((balanceContractOld.add(fee))));
    })

    it("Should deposit coin to piggybank secure", async function () {
        const piggyHashs = await contract.piggyBankHash(addr4.address, ethers.constants.AddressZero);
        const piggyId = await contract.piggyBankHashSecure(piggyHashs, true);
        const balance1Old = await addr1.getBalance();
        const balanceContractOld = await contract.balanceCoin();
        const piggyBefore = await contract.piggyBankById(piggyId);
        expect(piggyBefore.id).eq(UnitUtils.ZER0_32);
        const amount = TestHelper.addPrecision(10);
        await (await contract.connect(addr1).depositCoin(piggyHashs,true,{value:amount})).wait()
        const piggyAfter = await contract.piggyBankById(piggyId);
        const balance1 = await addr1.getBalance();
        const balanceContract = await contract.balanceCoin();
        expect(piggyAfter.id).eq(piggyId)
        expect(piggyAfter.claimed).eq(0)
        expect(piggyAfter.amount).eq(amount)
        expect(piggyAfter.secure).eq(true)
        expect(piggyAfter.currency).eq(ethers.constants.AddressZero)
        expect(TestHelper.removePrecision(balanceContract)).eq(TestHelper.removePrecision(balanceContractOld.add(amount)))
        expect(TestHelper.removePrecision(balance1)).approximately(TestHelper.removePrecision(balance1Old.sub(amount)), 0.05)
    });

    it("Should deposit token to piggybank secure", async function () {
        const piggyHashs = await contract.piggyBankHash(addr4.address, tokenContract.address);
        const piggyId = await contract.piggyBankHashSecure(piggyHashs, true);
        const balance1Old = await tokenContract.balanceOf(addr1.address);
        const balanceContractOld = await tokenContract.balanceOf(contract.address);
        const piggyBefore = await contract.piggyBankById(piggyId);
        expect(piggyBefore.id).eq(UnitUtils.ZER0_32);
        const amount = TestHelper.addPrecision(10);
        await (await tokenContract.connect(addr1).approve(contract.address, amount)).wait()
        await (await contract.connect(addr1).depositToken(piggyHashs,true, tokenContract.address, amount)).wait()
        const piggyAfter = await contract.piggyBankById(piggyId);
        const balance1 = await tokenContract.balanceOf(addr1.address);
        const balanceContract = await tokenContract.balanceOf(contract.address);
        expect(piggyAfter.id).eq(piggyId)
        expect(piggyAfter.claimed).eq(0)
        expect(piggyAfter.amount).eq(amount)
        expect(piggyAfter.secure).eq(true)
        expect(piggyAfter.currency).eq(tokenContract.address)
        expect(TestHelper.removePrecision(balanceContract)).eq(TestHelper.removePrecision(balanceContractOld.add(amount)))
        expect(TestHelper.removePrecision(balance1)).eq(TestHelper.removePrecision(balance1Old.sub(amount)))
    });

    it("Should not claim piggybank if not exists", async function () {
        try {
            const piggyHashs = await contract.piggyBankHash(addr1.address, tokenContract.address);
            await (await contract.connect(addr4).claimPiggybank(piggyHashs, true)).wait();
            expect.fail("Should fail")    
        } catch (e) {
            expect((e as any).message).contain("could not found piggy bank");
        }
    });

    it("Should not claim if not receiver", async function () {
        try {
            const piggyHashs = await contract.piggyBankHash(addr4.address, tokenContract.address);
            await (await contract.connect(addr1).claimPiggybank(piggyHashs, true)).wait();
            expect.fail("Should fail")    
        } catch (e) {
            expect((e as any).message).contain("you are not allowed to claim");
        }
    });

    it("Should claim deposit coin to piggybank secure", async function () {
        const piggyHashs = await contract.piggyBankHash(addr4.address, ethers.constants.AddressZero);
        const piggyId = await contract.piggyBankHashSecure(piggyHashs, true);
        const balance1Old = await addr4.getBalance();
        const balanceContractOld = await contract.balanceCoin();
        const piggyBefore = await contract.piggyBankById(piggyId);
        expect(piggyBefore.id).not.eq(UnitUtils.ZER0_32);
        expect(piggyBefore.claimed).eq(0)
        await (await contract.connect(addr4).claimPiggybank(piggyHashs,true)).wait()
        const piggyAfter = await contract.piggyBankById(piggyId);
        const balance1 = await addr4.getBalance();
        const balanceContract = await contract.balanceCoin();
        expect(piggyAfter.id).eq(piggyId)
        expect(piggyAfter.claimed).gt(0)
        expect(piggyAfter.amount).eq(piggyAfter.claimed)
        expect(piggyAfter.secure).eq(true)
        expect(piggyAfter.currency).eq(ethers.constants.AddressZero)
        expect(TestHelper.removePrecision(balanceContract)).eq(TestHelper.removePrecision(balanceContractOld.sub(piggyAfter.claimed)))
        expect(TestHelper.removePrecision(balance1)).approximately(TestHelper.removePrecision(balance1Old.add(piggyAfter.claimed)), 0.05)
    });

    it("Should claim deposit token from piggybank secure", async function () {
        const piggyHashs = await contract.piggyBankHash(addr4.address, tokenContract.address);
        const piggyId = await contract.piggyBankHashSecure(piggyHashs, true);
        const balance1Old = await tokenContract.balanceOf(addr4.address);
        const balanceContractOld = await tokenContract.balanceOf(contract.address);
        const piggyBefore = await contract.piggyBankById(piggyId);
        expect(piggyBefore.id).not.eq(UnitUtils.ZER0_32);
        expect(piggyBefore.claimed).eq(0)
        const amount = TestHelper.addPrecision(10);
        await (await contract.connect(addr4).claimPiggybank(piggyHashs,true)).wait()
        const piggyAfter = await contract.piggyBankById(piggyId);
        const balance1 = await tokenContract.balanceOf(addr4.address);
        const balanceContract = await tokenContract.balanceOf(contract.address);
        expect(piggyAfter.id).eq(piggyId)
        expect(piggyAfter.claimed).gt(0)
        expect(piggyAfter.amount).eq(piggyAfter.claimed)
        expect(piggyAfter.secure).eq(true)
        expect(piggyAfter.currency).eq(tokenContract.address)
        expect(TestHelper.removePrecision(balanceContract)).eq(TestHelper.removePrecision(balanceContractOld.sub(amount)))
        expect(TestHelper.removePrecision(balance1)).eq(TestHelper.removePrecision(balance1Old.add(amount)))
    });

    it("Should not claim deposit coin twice", async function () {
        try {
            const piggyHashs = await contract.piggyBankHash(addr4.address, ethers.constants.AddressZero);
            await (await contract.connect(addr4).claimPiggybank(piggyHashs, true)).wait();
            expect.fail("Should fail")    
        } catch (e) {
            expect((e as any).message).contain("Already claimed");
        }
    });

    it("Should not claim deposit token twice", async function () {
        try {
            const piggyHashs = await contract.piggyBankHash(addr4.address, tokenContract.address);
            await (await contract.connect(addr4).claimPiggybank(piggyHashs, true)).wait();
            expect.fail("Should fail")    
        } catch (e) {
            expect((e as any).message).contain("Already claimed");
        }
    });

    it("Should set config proportionnal for deposit", async function () {
        const configOld = await contract.connect(addr1).socialConfig();
        const copy = {...configOld};
        copy.deposit = {...copy.deposit,paymentType:PaymentType.PAY_PROPORTIONNAL, amount: BigNumber.from(10), currency: ethers.constants.AddressZero};
        await (await contract.setConfig(copy)).wait();
        const config = await contract.connect(addr1).socialConfig();
        expect(config.deposit.currency).eq(ethers.constants.AddressZero);
        expect(config.deposit.amount).eq(10);
    })

    it("Should deposit coin to piggybank secure with tax", async function () {
        const piggyHashs = await contract.piggyBankHash(addr4.address, ethers.constants.AddressZero);
        const piggyId = await contract.piggyBankHashSecure(piggyHashs, true);
        const balance1Old = await addr1.getBalance();
        const balanceContractOld = await contract.balanceCoin();
        const piggyBefore = await contract.piggyBankById(piggyId);
        expect(piggyBefore.id).not.eq(UnitUtils.ZER0_32);
        const amount = TestHelper.addPrecision(10);
        const amountMinusFee = amount.sub(TestHelper.addPrecision(1))
        await (await contract.connect(addr1).depositCoin(piggyHashs,true,{value:amount})).wait()
        const piggyAfter = await contract.piggyBankById(piggyId);
        const balance1 = await addr1.getBalance();
        const balanceContract = await contract.balanceCoin();
        expect(piggyAfter.id).eq(piggyId)
        expect(piggyAfter.claimed).eq(piggyBefore.amount).gt(0)
        expect(piggyAfter.amount).eq(piggyBefore.amount.add(amountMinusFee))
        expect(piggyAfter.secure).eq(true)
        expect(piggyAfter.currency).eq(ethers.constants.AddressZero)
        expect(TestHelper.removePrecision(balanceContract)).eq(TestHelper.removePrecision(balanceContractOld.add(amount)))
        expect(TestHelper.removePrecision(balance1)).approximately(TestHelper.removePrecision(balance1Old.sub(amount)), 0.05)
    });

    it("Should deposit token to piggybank secure", async function () {
        const piggyHashs = await contract.piggyBankHash(addr4.address, tokenContract.address);
        const piggyId = await contract.piggyBankHashSecure(piggyHashs, true);
        const balance1Old = await tokenContract.balanceOf(addr1.address);
        const balanceContractOld = await tokenContract.balanceOf(contract.address);
        const piggyBefore = await contract.piggyBankById(piggyId);
        expect(piggyBefore.id).not.eq(UnitUtils.ZER0_32);
        const amount = TestHelper.addPrecision(10);
        const amountPlusFee = amount.add(TestHelper.addPrecision(1))
        await (await tokenContract.connect(addr1).approve(contract.address, amountPlusFee)).wait()
        await (await contract.connect(addr1).depositToken(piggyHashs,true, tokenContract.address, amount)).wait()
        const piggyAfter = await contract.piggyBankById(piggyId);
        const balance1 = await tokenContract.balanceOf(addr1.address);
        const balanceContract = await tokenContract.balanceOf(contract.address);
        expect(piggyAfter.id).eq(piggyId)
        expect(piggyAfter.claimed).eq(piggyBefore.amount).gt(0)
        expect(piggyAfter.amount).eq(piggyBefore.amount.add(amount))
        expect(piggyAfter.secure).eq(true)
        expect(piggyAfter.currency).eq(tokenContract.address)
        expect(TestHelper.removePrecision(balanceContract)).eq(TestHelper.removePrecision(balanceContractOld.add(amountPlusFee)))
        expect(TestHelper.removePrecision(balance1)).eq(TestHelper.removePrecision(balance1Old.sub(amountPlusFee)))
    });

    it("Should claim deposit coin to piggybank secure", async function () {
        const piggyHashs = await contract.piggyBankHash(addr4.address, ethers.constants.AddressZero);
        const piggyId = await contract.piggyBankHashSecure(piggyHashs, true);
        const balance1Old = await addr4.getBalance();
        const balanceContractOld = await contract.balanceCoin();
        const piggyBefore = await contract.piggyBankById(piggyId);
        expect(piggyBefore.id).not.eq(UnitUtils.ZER0_32);
        expect(piggyBefore.claimed).gt(0).lt(piggyBefore.amount)
        const amountMinusFee = UnitUtils.addPrecision(9)
        await (await contract.connect(addr4).claimPiggybank(piggyHashs,true)).wait()
        const piggyAfter = await contract.piggyBankById(piggyId);
        const balance1 = await addr4.getBalance();
        const balanceContract = await contract.balanceCoin();
        expect(piggyAfter.id).eq(piggyId)
        expect(piggyAfter.claimed).gt(0)
        expect(piggyAfter.amount).eq(piggyAfter.claimed)
        expect(piggyAfter.secure).eq(true)
        expect(piggyAfter.currency).eq(ethers.constants.AddressZero)
        expect(TestHelper.removePrecision(balanceContract)).eq(TestHelper.removePrecision(balanceContractOld.sub(amountMinusFee)))
        expect(TestHelper.removePrecision(balance1)).approximately(TestHelper.removePrecision(balance1Old.add(amountMinusFee)), 0.05)
    });

    it("Should claim deposit token from piggybank secure", async function () {
        const piggyHashs = await contract.piggyBankHash(addr4.address, tokenContract.address);
        const piggyId = await contract.piggyBankHashSecure(piggyHashs, true);
        const balance1Old = await tokenContract.balanceOf(addr4.address);
        const balanceContractOld = await tokenContract.balanceOf(contract.address);
        const piggyBefore = await contract.piggyBankById(piggyId);
        expect(piggyBefore.id).not.eq(UnitUtils.ZER0_32);
        expect(piggyBefore.claimed).gt(0).lt(piggyBefore.amount)
        const amount = UnitUtils.addPrecision(10)
        await (await contract.connect(addr4).claimPiggybank(piggyHashs,true)).wait()
        const piggyAfter = await contract.piggyBankById(piggyId);
        const balance1 = await tokenContract.balanceOf(addr4.address);
        const balanceContract = await tokenContract.balanceOf(contract.address);
        expect(piggyAfter.id).eq(piggyId)
        expect(piggyAfter.claimed).gt(0)
        expect(piggyAfter.amount).eq(piggyAfter.claimed)
        expect(piggyAfter.secure).eq(true)
        expect(piggyAfter.currency).eq(tokenContract.address)
        expect(TestHelper.removePrecision(balanceContract)).eq(TestHelper.removePrecision(balanceContractOld.sub(amount)))
        expect(TestHelper.removePrecision(balance1)).eq(TestHelper.removePrecision(balance1Old.add(amount)))
    });

    it("Should send message", async function () {
        const subjectId = await contract.messageSubjectHash(ethers.utils.toUtf8Bytes("subject1"))
        const addr1Hash = await contract.messageAddressHash(addr1.address)
        const addr4Hash = await contract.messageAddressHash(addr4.address)
        const counMessageOld = await contract.counMessage();
        const counMessageReceivedByOld = await contract.counMessageReceivedBy(addr4.address);
        const counMessageSentByOld = await contract.counMessageSentBy(addr1.address);
        const listMessageReceivedByOld = await contract.listMessageReceivedBy(addr4.address, 0, 0);
        const listMessageSentByOld = await contract.listMessageSentBy(addr1.address, 0, 0);
        const listMessageSubjectByOld = await contract.listMessageSubjectBy(addr1.address, 0, 0);
        const listMessageSubjectByOld4 = await contract.listMessageSubjectBy(addr4.address, 0, 0);
        const listMessageBySubjectOld = await contract.listMessageBySubject(subjectId, 0, 0);
        expect(counMessageOld).eq(0)
        expect(counMessageReceivedByOld).eq(0)
        expect(counMessageSentByOld).eq(0)
        expect(listMessageReceivedByOld.length).eq(0)
        expect(listMessageSentByOld.length).eq(0)
        expect(listMessageSubjectByOld.length).eq(0)
        expect(listMessageSubjectByOld4.length).eq(0)
        expect(listMessageBySubjectOld.length).eq(0)
        await (await contract.connect(addr1).sendMessage(subjectId, {
            id: BigNumber.from(0),
            date: 0,
            encryptMessage: ethers.constants.AddressZero,
            myEncryptMessage: ethers.constants.AddressZero,
            receiver: addr4Hash,
            receiverPubKey: ethers.constants.AddressZero,
            sender: UnitUtils.ZER0_32,
            senderPubKey: ethers.constants.AddressZero,
            subjectId: UnitUtils.ZER0_32
        })).wait()
        const counMessage = await contract.counMessage();
        const counMessageReceivedBy = await contract.counMessageReceivedBy(addr4.address);
        const counMessageSentBy = await contract.counMessageSentBy(addr1.address);
        const listMessageReceivedBy = await contract.listMessageReceivedBy(addr4.address, 0, 0);
        const listMessageSentBy = await contract.listMessageSentBy(addr1.address, 0, 0);
        const listMessageSubjectBy = await contract.listMessageSubjectBy(addr1.address, 0, 0);
        const listMessageSubjectBy4 = await contract.listMessageSubjectBy(addr4.address, 0, 0);
        const listMessageBySubject = await contract.listMessageBySubject(subjectId, 0, 0);
        expect(counMessage).eq(1)
        expect(counMessageReceivedBy).eq(1)
        expect(counMessageSentBy).eq(1)
        expect(listMessageReceivedBy.length).eq(1)
        expect(listMessageSentBy.length).eq(1)
        expect(listMessageSubjectBy.length).eq(1)
        expect(listMessageSubjectBy4.length).eq(1)
        expect(listMessageBySubject.length).eq(1)
        expect(listMessageBySubject[0].encryptMessage).eq(ethers.constants.AddressZero)
        expect(listMessageBySubject[0].myEncryptMessage).eq(ethers.constants.AddressZero)
        expect(listMessageBySubject[0].receiver).eq(addr4Hash)
        expect(listMessageBySubject[0].sender).eq(addr1Hash)
        expect(listMessageBySubject[0].subjectId).eq(subjectId)
        expect(listMessageBySubject[0].id).eq(1)
        expect(listMessageBySubject[0].senderPubKey).eq(ethers.constants.AddressZero)
        expect(listMessageBySubject[0].receiverPubKey).eq(ethers.constants.AddressZero)
        await (await contract.connect(addr1).deleteMessage(listMessageBySubject[0].id)).wait()
        const listMessageReceivedByAfter = await contract.listMessageReceivedBy(addr4.address, 0, 0);
        const listMessageSentByAfter = await contract.listMessageSentBy(addr1.address, 0, 0);
        const listMessageBySubjectAfter = await contract.listMessageBySubject(subjectId, 0, 0);
        expect(listMessageReceivedByAfter.length).eq(0)
        expect(listMessageSentByAfter.length).eq(0)
        expect(listMessageBySubjectAfter.length).eq(0)
    });

    function createRegistration(hash:string, signature:ethers.utils.BytesLike){
        return {
            id: 1000,
            owner: owner.address,
            name: hash,
            network: 1,
            encryptName: ethers.utils.toUtf8Bytes("NAME"),
            signature,
        }
    }
});