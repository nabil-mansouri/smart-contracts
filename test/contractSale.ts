//must be first (mock)
import { TestHelper } from "./testHelper";
//import
import { expect } from "chai";
import "mocha";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { SaleContract, TokenContract } from 'typechain-types';
import { BigNumber } from "@ethersproject/bignumber";
import { ethers, waffle } from "hardhat";
import { UnitUtils } from "src/utils";
const provider = waffle.provider;

describe("Sale", function () {
  let contract: SaleContract;
  let tokenContract: TokenContract;
  let busdContract: TokenContract;
  let zeroContract: TokenContract;
  let strangeContract: TokenContract;
  let dogeContract: TokenContract;
  let owner: SignerWithAddress, addr2: SignerWithAddress, addr3: SignerWithAddress, addr4: SignerWithAddress, addr5: SignerWithAddress, addr6: SignerWithAddress;
  //get custom contract
  const SUPPLY = BigNumber.from(10).pow(6).mul(2);
  const REWARD = BigNumber.from(10).pow(3);
  const TOTAL_SALE_WITHP = TestHelper.addPrecision(BigNumber.from(10).pow(3).mul(2).toNumber());
  const testHelper = new TestHelper(SUPPLY, REWARD);
  before(async function () {
    await TestHelper.takeSnapshot();
    [owner, addr2, addr3, addr4, addr5, addr6] = await testHelper.signerPromise;
    zeroContract = await testHelper.createToken("ZERO");
    strangeContract = await testHelper.createToken("STRANGE");
    busdContract = await testHelper.createToken("BUSD");
    dogeContract = await testHelper.createToken("DOGE");
    contract = await testHelper.saleContract([{ token: busdContract.address, quote: 10 }, { token: dogeContract.address, quote: 2 }, { token: zeroContract.address, quote: 0 }]);
    tokenContract = await testHelper.contractTokenPromise;
    //total= 1000 0000 BUSD
    //addr2=1000 BUSD
    await busdContract.transfer(addr2.address, BigNumber.from(10).pow(3).mul(TestHelper.PRECISION));
    //addr3=9000 BUSD
    await busdContract.transfer(addr3.address, BigNumber.from(10).pow(3).mul(9).mul(TestHelper.PRECISION));
    //addr5=500 000 BUSD
    await busdContract.transfer(addr4.address, BigNumber.from(10).pow(5).mul(5).mul(TestHelper.PRECISION));
    //addr6=500 000 BUSD
    await busdContract.transfer(addr5.address, BigNumber.from(10).pow(5).mul(5).mul(TestHelper.PRECISION));
    //addr4=500 000 DIGE
    await dogeContract.transfer(addr4.address, BigNumber.from(10).pow(5).mul(5).mul(TestHelper.PRECISION));
    //addr4=500 000 DIGE
    await dogeContract.transfer(addr6.address, BigNumber.from(10).pow(5).mul(5).mul(TestHelper.PRECISION));
  });

  after(async function () {
    await TestHelper.revertSnapshot();
  })

  it("Should return 0 if no sale", async function () {
    const infos = await contract.saleInfos();
    expect(infos.countHolders).equal(0);
    expect(infos.countSale).equal(0);
    expect(infos.endAt).not.equal(0);
    expect(infos.startAt).not.equal(0);
    expect(infos.saleCommit).equal(0);
    expect(infos.saleMax).equal(0);
    expect(infos.saleRemain).equal(0);
  });

  it("Should owner transfer token to sale", async function () {
    await tokenContract.send(contract.address, TOTAL_SALE_WITHP, [])
    const infos = await contract.saleInfos();
    expect(infos.countHolders).equal(0);
    expect(infos.countSale).equal(0);
    expect(infos.endAt).not.equal(0);
    expect(infos.startAt).not.equal(0);
    expect(infos.saleCommit).equal(0);
    expect(infos.saleMax).equal(TOTAL_SALE_WITHP);
    expect(infos.saleRemain).equal(TOTAL_SALE_WITHP);
  });

  it("Should sale native to addr2", async function () {
    //500 token for 1 coin
    let balanceContract = await tokenContract.balanceOf(contract.address);
    let balanceAddr2 = await tokenContract.balanceOf(addr2.address);
    let balanceAddr2Eth = await provider.getBalance(addr2.address);
    expect(balanceAddr2).eq(0);
    expect(balanceAddr2Eth).eq(TestHelper.addPrecision(10000));
    expect(balanceContract).eq(TOTAL_SALE_WITHP)
    await (await contract.connect(addr2).saleNative([], { value: TestHelper.addPrecision(1) })).wait();
    balanceAddr2 = await tokenContract.balanceOf(addr2.address);
    balanceAddr2Eth = await provider.getBalance(addr2.address);
    balanceContract = await tokenContract.balanceOf(contract.address);
    expect(TestHelper.removePrecision(balanceAddr2Eth)).approximately((9999), 0.1);
    expect(balanceAddr2).eq(TestHelper.addPrecision(500));
    expect(balanceContract).eq(TOTAL_SALE_WITHP.sub(TestHelper.addPrecision(500)));
    const infos = await contract.saleInfos();
    expect(infos.countHolders).equal(1);
    expect(infos.countSale).equal(1);
    expect(infos.saleCommit).equal(TestHelper.addPrecision(500));
    expect(infos.saleMax).equal(TOTAL_SALE_WITHP);
    expect(infos.saleRemain).equal(TestHelper.addPrecision(1500));
    const history = await contract.historyOf(addr2.address);
    expect(history.sales.length).equal(1);
    expect(history.sales[0].cost).equal(TestHelper.addPrecision(1));
    expect(history.sales[0].amount).equal(TestHelper.addPrecision(500));
    expect(history.sales[0].token).equal(("0x0000000000000000000000000000000000000000"));
  });

  it("Should sale native to addr3", async function () {
    //500 token for 1 coin
    let balanceContract = await tokenContract.balanceOf(contract.address);
    let balanceAddr3 = await tokenContract.balanceOf(addr3.address);
    let balanceAddr3Eth = await provider.getBalance(addr3.address);
    expect(balanceAddr3).eq(0);
    expect(balanceAddr3Eth).eq(TestHelper.addPrecision(10000));
    expect(balanceContract).eq(TOTAL_SALE_WITHP.sub(TestHelper.addPrecision(500)));
    await (await contract.connect(addr3).saleNative([], { value: TestHelper.addPrecision(0.1) })).wait();
    balanceAddr3 = await tokenContract.balanceOf(addr3.address);
    balanceAddr3Eth = await provider.getBalance(addr3.address);
    balanceContract = await tokenContract.balanceOf(contract.address);
    expect(TestHelper.removePrecision(balanceAddr3Eth)).approximately((9999.9), 0.1);
    expect(balanceAddr3).eq(TestHelper.addPrecision(50));
    expect(balanceContract).eq(TOTAL_SALE_WITHP.sub(TestHelper.addPrecision(550)));
    const infos = await contract.saleInfos();
    expect(infos.countHolders).equal(2);
    expect(infos.countSale).equal(2);
    expect(infos.saleCommit).equal(TestHelper.addPrecision(550));
    expect(infos.saleMax).equal(TOTAL_SALE_WITHP);
    expect(infos.saleRemain).equal(TestHelper.addPrecision(1450));
    const history = await contract.historyOf(addr3.address);
    expect(history.sales.length).equal(1);
    expect(history.sales[0].cost).equal(TestHelper.addPrecision(0.1));
    expect(history.sales[0].amount).equal(TestHelper.addPrecision(50));
    expect(history.sales[0].token).equal(("0x0000000000000000000000000000000000000000"));
  });

  it("Should sale using busd to addr3", async function () {
    //10 token for 1 busd
    let balanceContract = await tokenContract.balanceOf(contract.address);
    let balanceAddr3 = await tokenContract.balanceOf(addr3.address);
    let balanceBusd = await busdContract.balanceOf(contract.address);
    expect(balanceBusd).equal(0);
    expect(balanceAddr3).eq(TestHelper.addPrecision(50));
    expect(balanceContract).eq(TOTAL_SALE_WITHP.sub(TestHelper.addPrecision(550)));
    await busdContract.connect(addr3).approve(contract.address, TestHelper.addPrecision(1000000000));
    await (await contract.connect(addr3).saleToken(TestHelper.addPrecision(45), busdContract.address, [])).wait();
    balanceAddr3 = await tokenContract.balanceOf(addr3.address);
    balanceContract = await tokenContract.balanceOf(contract.address);
    balanceBusd = await busdContract.balanceOf(contract.address);
    expect(balanceBusd).equal(TestHelper.addPrecision(45));
    expect(balanceAddr3).eq(TestHelper.addPrecision(500));
    expect(balanceContract).eq(TOTAL_SALE_WITHP.sub(TestHelper.addPrecision(1000)));
    const infos = await contract.saleInfos();
    expect(infos.countHolders).equal(2);
    expect(infos.countSale).equal(3);
    expect(infos.saleCommit).equal(TestHelper.addPrecision(1000));
    expect(infos.saleMax).equal(TOTAL_SALE_WITHP);
    expect(infos.saleRemain).equal(TestHelper.addPrecision(1000));
    const history = await contract.historyOf(addr3.address);
    expect(history.sales.length).equal(2);
    expect(history.sales[1].cost).equal(TestHelper.addPrecision(45));
    expect(history.sales[1].amount).equal(TestHelper.addPrecision(450));
    expect(history.sales[1].token).equal((busdContract.address));
  });

  it("Should sale using dodge to addr4", async function () {
    //2 token for 1 doge
    let balanceContract = await tokenContract.balanceOf(contract.address);
    let balanceAddr4 = await tokenContract.balanceOf(addr4.address);
    let balanceDoge = await dogeContract.balanceOf(contract.address);
    expect(balanceDoge).eq(0);
    expect(balanceAddr4).eq(TestHelper.addPrecision(0));
    expect(balanceContract).eq(TOTAL_SALE_WITHP.sub(TestHelper.addPrecision(1000)));
    await dogeContract.connect(addr4).approve(contract.address, TestHelper.addPrecision(1000000000));
    await (await contract.connect(addr4).saleToken(TestHelper.addPrecision(100), dogeContract.address, [])).wait();
    balanceAddr4 = await tokenContract.balanceOf(addr4.address);
    balanceContract = await tokenContract.balanceOf(contract.address);
    balanceDoge = await dogeContract.balanceOf(contract.address);
    expect(balanceDoge).eq(TestHelper.addPrecision(100));
    expect(balanceAddr4).eq(TestHelper.addPrecision(200));
    expect(balanceContract).eq(TOTAL_SALE_WITHP.sub(TestHelper.addPrecision(1200)));
    const infos = await contract.saleInfos();
    expect(infos.countHolders).equal(3);
    expect(infos.countSale).equal(4);
    expect(infos.saleCommit).equal(TestHelper.addPrecision(1200));
    expect(infos.saleMax).equal(TOTAL_SALE_WITHP);
    expect(infos.saleRemain).equal(TestHelper.addPrecision(800));
  });

  it("Should not sale using unknow token", async function () {
    try {
      await (await contract.connect(addr4).saleToken(TestHelper.addPrecision(100), strangeContract.address, [])).wait();
      expect.fail("Should not allow");
    } catch (e) {
      expect((e as any).message).contains("Sale: token not accepted")
    }
  });

  it("Should not sale negative or null amount token", async function () {
    try {
      await (await contract.connect(addr4).saleToken(TestHelper.addPrecision(0), busdContract.address, [])).wait();
      expect.fail("Should not allow");
    } catch (e) {
      expect((e as any).message).contains("Sale: Amount should be positive")
    }
  });

  it("Should not sale negative or null amount coin", async function () {
    try {
      await (await contract.connect(addr4).saleNative([], { value: 0 })).wait();
      expect.fail("Should not allow");
    } catch (e) {
      expect((e as any).message).contains("Sale: Amount should be positive")
    }
  });

  it("Should not sale native more than available", async function () {
    try {
      //800 available | 500 per coin | 1.6*500=800
      await (await contract.connect(addr4).saleNative([], { value: TestHelper.addPrecision(1.65) })).wait();
      expect.fail("Should not allow");
    } catch (e) {
      expect((e as any).message).contains("Sale: Not enough balance")
    }
  });

  it("Should not sale token more than available", async function () {
    try {
      //800 available | 10 per coin | 81*10=810
      await (await contract.connect(addr4).saleToken(TestHelper.addPrecision(81), busdContract.address, [])).wait();
      expect.fail("Should not allow");
    } catch (e) {
      expect((e as any).message).contains("Sale: Not enough balance")
    }
  });

  it("Should not sale token quote 0", async function () {
    try {
      await (await contract.connect(addr4).saleToken(TestHelper.addPrecision(1), zeroContract.address, [])).wait();
      expect.fail("Should not allow");
    } catch (e) {
      expect((e as any).message).contains("Sale: token not accepted")
    }
  });

  it("Should sell all available", async function () {
    //10 token for 1 busd
    let balanceContract = await tokenContract.balanceOf(contract.address);
    let balanceAddr5 = await tokenContract.balanceOf(addr5.address);
    let balanceBusd = await busdContract.balanceOf(contract.address);
    expect(balanceBusd).equal(TestHelper.addPrecision(45));
    expect(balanceAddr5).eq(TestHelper.addPrecision(0));
    expect(balanceContract).eq(TestHelper.addPrecision(800));
    await busdContract.connect(addr5).approve(contract.address, TestHelper.addPrecision(1000000000));
    await (await contract.connect(addr5).saleToken(TestHelper.addPrecision(80), busdContract.address, [])).wait();
    balanceAddr5 = await tokenContract.balanceOf(addr5.address);
    balanceContract = await tokenContract.balanceOf(contract.address);
    balanceBusd = await busdContract.balanceOf(contract.address);
    expect(balanceBusd).equal(TestHelper.addPrecision(125));
    expect(balanceAddr5).eq(TestHelper.addPrecision(800));
    expect(balanceContract).eq(TestHelper.addPrecision(0));
    const infos = await contract.saleInfos();
    expect(infos.countHolders).equal(4);
    expect(infos.countSale).equal(5);
    expect(infos.saleCommit).equal(TestHelper.addPrecision(2000));
    expect(infos.saleMax).equal(TOTAL_SALE_WITHP);
    expect(infos.saleRemain).equal(TestHelper.addPrecision(0));
  });

  it("Should increase available sale", async function () {
    await tokenContract.send(contract.address, TOTAL_SALE_WITHP, [])
    const infos = await contract.saleInfos();
    expect(infos.countHolders).equal(4);
    expect(infos.countSale).equal(5);
    expect(infos.saleCommit).equal(TestHelper.addPrecision(2000));
    expect(infos.saleMax).equal(TOTAL_SALE_WITHP.mul(2));
    expect(infos.saleRemain).equal(TOTAL_SALE_WITHP);
  });

  it("Should decrease available sale", async function () {
    await (await contract.decrease(TestHelper.addPrecision(500))).wait()
    const infos = await contract.saleInfos();
    expect(infos.countHolders).equal(4);
    expect(infos.countSale).equal(5);
    expect(infos.saleCommit).equal(TestHelper.addPrecision(2000));
    expect(infos.saleMax).equal(TestHelper.addPrecision(3500));
    expect(infos.saleRemain).equal(TestHelper.addPrecision(1500));
  });

  it("Should sale native if more than max per user not setted", async function () {
    let config = await contract.saleConfig();
    try {
      expect(config.maxPerUser).eq(0);
      config = { ...config };
      config.maxPerUser = TestHelper.addPrecision(500);
      await contract.setConfig(config);
      //1 coin = 500 
      await contract.connect(addr2).saleNative([], { value: TestHelper.addPrecision(1.1) });
      expect.fail("Should not allow")
    } catch (e) {
      expect((e as any).message).contain("Sale: maxPerUser");
    } finally {
      config = { ...config };
      config.maxPerUser = TestHelper.addPrecision(0);
      await contract.setConfig(config);
    }
  });

  it("Should not sale token if amount more than max per user", async function () {
    let config = await contract.saleConfig();
    try {
      expect(config.maxPerUser).eq(0);
      config = { ...config };
      config.maxPerUser = TestHelper.addPrecision(10);
      await contract.setConfig(config);
      //10busd = 1 
      await contract.connect(addr2).saleToken(TestHelper.addPrecision(101), busdContract.address, []);
      expect.fail("Should not allow")
    } catch (e) {
      expect((e as any).message).contain("Sale: maxPerUser");
    } finally {
      config = { ...config };
      config.maxPerUser = TestHelper.addPrecision(0);
      await contract.setConfig(config);
    }
  });

  it("Should sale native if amount less than max per user", async function () {
    //i have 200
    let config = await contract.saleConfig();
    try {
      expect(config.maxPerUser).eq(0);
      config = { ...config };
      config.maxPerUser = TestHelper.addPrecision(205);
      await contract.setConfig(config);
      //1native = 500 token => 0.01 = 5
      await contract.connect(addr4).saleNative([], { value: TestHelper.addPrecision(0.01) });
    } finally {
      config = { ...config };
      config.maxPerUser = TestHelper.addPrecision(0);
      await contract.setConfig(config);
    }
  });

  it("Should sale token if amount less than max per user", async function () {
    //i have 205
    let config = await contract.saleConfig();
    try {
      expect(config.maxPerUser).eq(0);
      config = { ...config };
      config.maxPerUser = TestHelper.addPrecision(215);
      await contract.setConfig(config);
      //1busd = 10 token
      await busdContract.connect(addr4).approve(contract.address, TestHelper.addPrecision(1));
      await contract.connect(addr4).saleToken(TestHelper.addPrecision(1), busdContract.address, []);
    } finally {
      config = { ...config };
      config.maxPerUser = TestHelper.addPrecision(0);
      await contract.setConfig(config);
    }
  });

  it("Should not sale native if not start", async function () {
    let config = await contract.saleConfig();
    const before = config.startDate;
    try {
      config = { ...config };
      config.startDate = BigNumber.from(TestHelper.addDays(TestHelper.now(), 1));
      await contract.setConfig(config);
      //10busd = 1 
      await contract.connect(addr2).saleNative([], { value: TestHelper.addPrecision(1) });
      expect.fail("Should not allow")
    } catch (e) {
      expect((e as any).message).contain("Sale: not started");
    } finally {
      config = { ...config };
      config.startDate = before;
      await contract.setConfig(config);
    }
  });

  it("Should not sale token if not start", async function () {
    let config = await contract.saleConfig();
    const before = config.startDate;
    try {
      config = { ...config };
      config.startDate = BigNumber.from(TestHelper.addDays(TestHelper.now(), 1));
      await contract.setConfig(config);
      //10busd = 1 
      await contract.connect(addr2).saleToken(TestHelper.addPrecision(101), busdContract.address, []);
      expect.fail("Should not allow")
    } catch (e) {
      expect((e as any).message).contain("Sale: not started");
    } finally {
      config = { ...config };
      config.startDate = before;
      await contract.setConfig(config);
    }
  });

  it("Should not sale native if ended", async function () {
    let config = await contract.saleConfig();
    const before = config.endDate;
    try {
      expect(config.endDate.toNumber()).greaterThan(TestHelper.now());
      config = { ...config };
      config.endDate = BigNumber.from(TestHelper.addDays(TestHelper.now(), -1));
      await contract.setConfig(config);
      //10busd = 1 
      await contract.connect(addr2).saleNative([], { value: TestHelper.addPrecision(1) });
      expect.fail("Should not allow")
    } catch (e) {
      expect((e as any).message).contain("Sale: Finished");
    } finally {
      config = { ...config };
      config.endDate = before;
      await contract.setConfig(config);
    }
  });

  it("Should not sale token if ended", async function () {
    let config = await contract.saleConfig();
    const before = config.endDate;
    try {
      expect(config.endDate.toNumber()).greaterThan(TestHelper.now());
      config = { ...config };
      config.endDate = BigNumber.from(TestHelper.addDays(TestHelper.now(), -1));
      await contract.setConfig(config);
      //10busd = 1 
      await contract.connect(addr2).saleToken(TestHelper.addPrecision(101), busdContract.address, []);
      expect.fail("Should not allow")
    } catch (e) {
      expect((e as any).message).contain("Sale: Finished");
    } finally {
      config = { ...config };
      config.endDate = before;
      await contract.setConfig(config);
    }
  });
  it("Should not sale native if invalid signature", async function () {
    let config = await contract.saleConfig();
    try {
      expect(config.validatorRequire).is.false;
      config = { ...config };
      config.validator = addr5.address;
      config.validatorRequire = true;
      await contract.setConfig(config);
      //invalid signature
      await contract.connect(addr2).saleNative([], { value: TestHelper.addPrecision(1) });
      expect.fail("Should not allow")
    } catch (e) {
      expect((e as any).message).contain("ECDSA: invalid signature length");
    } finally {
      config = { ...config };
      config.validatorRequire = false;
      await contract.setConfig(config);
    }
  });

  it("Should not sale native if invalid signer", async function () {
    let config = await contract.saleConfig();
    try {
      expect(config.validatorRequire).is.false;
      config = { ...config };
      config.validator = addr5.address;
      config.validatorRequire = true;
      await contract.setConfig(config);
      //invalid signature
      //invalid signer
      try {
        const hash = ethers.utils.solidityKeccak256(['address', 'uint256', 'address'], [addr2.address, TestHelper.addPrecision(1), contract.address]);
        const signature = await testHelper.sign(addr2.address, hash);
        await contract.connect(addr2).saleNative(signature, { value: TestHelper.addPrecision(1) });
        expect.fail("Should not allow")
      } catch (e) {
        expect((e as any).message).contain("checkSignature: Invalid signer");
      }
      //not the signer
      try {
        const hash = await contract.connect(addr5).hashNative(addr2.address, TestHelper.addPrecision(101));
        const signature = await testHelper.sign(addr2.address, hash);
        await contract.connect(addr2).saleToken(TestHelper.addPrecision(101), busdContract.address, signature);
        expect.fail("Should not allow")
      } catch (e) {
        expect((e as any).message).contain("checkSignature: Invalid signer");
      }
    } finally {
      config = { ...config };
      config.validatorRequire = false;
      await contract.setConfig(config);
    }
  });

  it("Should not sale native if invalid hash", async function () {
    let config = await contract.saleConfig();
    try {
      expect(config.validatorRequire).is.false;
      config = { ...config };
      config.validator = addr5.address;
      config.validatorRequire = true;
      await contract.setConfig(config);
      //invalid hash 
      const hash = await contract.connect(addr5).hashNative(addr2.address, TestHelper.addPrecision(0));
      const signature = await testHelper.sign(addr5.address, hash);
      await contract.connect(addr2).saleToken(TestHelper.addPrecision(101), busdContract.address, signature);
      expect.fail("Should not allow")
    } catch (e) {
      expect((e as any).message).contain("checkSignature: Invalid signer");
    } finally {
      config = { ...config };
      config.validatorRequire = false;
      await contract.setConfig(config);
    }
  });
  it("Should not allow sale token if invalid signature", async function () {
    let config = await contract.saleConfig();
    try {
      expect(config.validatorRequire).is.false;
      config = { ...config };
      config.validator = addr5.address;
      config.validatorRequire = true;
      await contract.setConfig(config);
      //invalid signature
      await contract.connect(addr2).saleToken(TestHelper.addPrecision(101), busdContract.address, []);
      expect.fail("Should not allow")
    } catch (e) {
      expect((e as any).message).contain("ECDSA: invalid signature length");
    } finally {
      config = { ...config };
      config.validatorRequire = false;
      await contract.setConfig(config);
    }
  });
  it("Should not allow sale token if invalid signer", async function () {
    let config = await contract.saleConfig();
    try {
      expect(config.validatorRequire).is.false;
      config = { ...config };
      config.validator = addr5.address;
      config.validatorRequire = true;
      await contract.setConfig(config);
      //not the signer
      try {
        const hash = ethers.utils.solidityKeccak256(['address', 'uint256', 'address', 'address'], [addr2.address, TestHelper.addPrecision(101), busdContract.address, contract.address]);
        const signature = await testHelper.sign(addr2.address, hash);
        await contract.connect(addr2).saleToken(TestHelper.addPrecision(101), busdContract.address, signature);
        expect.fail("Should not allow")
      } catch (e) {
        expect((e as any).message).contain("checkSignature: Invalid signer");
      }
      //not the signer
      try {
        const hash = await contract.connect(addr5).hashToken(addr2.address, TestHelper.addPrecision(101), busdContract.address);
        const signature = await testHelper.sign(addr2.address, hash);
        await contract.connect(addr2).saleToken(TestHelper.addPrecision(101), busdContract.address, signature);
        expect.fail("Should not allow")
      } catch (e) {
        expect((e as any).message).contain("checkSignature: Invalid signer");
      }
    } finally {
      config = { ...config };
      config.validatorRequire = false;
      await contract.setConfig(config);
    }
  });
  it("Should not allow sale token if invalid hash", async function () {
    let config = await contract.saleConfig();
    try {
      expect(config.validatorRequire).is.false;
      config = { ...config };
      config.validator = addr5.address;
      config.validatorRequire = true;
      await contract.setConfig(config);
      //invalid hash
      const hash = await contract.connect(addr5).hashToken(addr2.address, TestHelper.addPrecision(0), busdContract.address);
      const signature = await testHelper.sign(addr5.address, hash);
      await contract.connect(addr2).saleToken(TestHelper.addPrecision(101), busdContract.address, signature);
      expect.fail("Should not allow")
    } catch (e) {
      expect((e as any).message).contain("checkSignature: Invalid signer");
    } finally {
      config = { ...config };
      config.validatorRequire = false;
      await contract.setConfig(config);
    }
  });
  it("Should only allow signer to sign", async function () {
    let config = await contract.saleConfig();
    try {
      expect(config.validatorRequire).is.false;
      config = { ...config };
      config.validator = addr5.address;
      config.validatorRequire = true;
      await contract.setConfig(config);
      //not the validator
      try {
        const signature = await contract.connect(addr2).hashToken(addr2.address, TestHelper.addPrecision(101), busdContract.address);
        await contract.connect(addr2).saleToken(TestHelper.addPrecision(101), busdContract.address, signature);
        expect.fail("Should not allow")
      } catch (e) {
        expect((e as any).message).contain("onlyValidator: only validator");
      }
      //not the signer
      try {
        const signature = await contract.connect(addr2).hashNative(addr2.address, TestHelper.addPrecision(1));
        await contract.connect(addr2).saleNative(signature, { value: TestHelper.addPrecision(1) });
        expect.fail("Should not allow")
      } catch (e) {
        expect((e as any).message).contain("onlyValidator: only validator");
      }
    } finally {
      config = { ...config };
      config.validatorRequire = false;
      await contract.setConfig(config);
    }
  })


  it("Should allow sale native if whitelisted", async function () {
    let config = await contract.saleConfig();
    try {
      expect(config.validatorRequire).is.false;
      config = { ...config };
      config.validator = addr5.address;
      config.validatorRequire = true;
      await contract.setConfig(config);
      //valid signer
      const hash = await contract.connect(addr5).hashNative(addr2.address, TestHelper.addPrecision(0.01));
      const signature = await testHelper.sign(addr5.address, hash);
      await contract.connect(addr2).saleNative(signature, { value: TestHelper.addPrecision(0.01) });
    } finally {
      config = { ...config };
      config.validatorRequire = false;
      await contract.setConfig(config);
    }
  });

  it("Should allow sale token if whitelisted", async function () {
    let config = await contract.saleConfig();
    try {
      expect(config.validatorRequire).is.false;
      config = { ...config };
      config.validator = addr5.address;
      config.validatorRequire = true;
      await contract.setConfig(config);
      //valid signature
      await busdContract.connect(addr2).approve(contract.address, TestHelper.addPrecision(1));
      const hash = await contract.connect(addr5).hashToken(addr2.address, TestHelper.addPrecision(1), busdContract.address);
      const signature = await testHelper.sign(addr5.address, hash);
      await contract.connect(addr2).saleToken(TestHelper.addPrecision(1), busdContract.address, signature);
    } finally {
      config = { ...config };
      config.validatorRequire = false;
      await contract.setConfig(config);
    }
  });

  it("Should allow sale token if whitelisted without approve", async function () {
    let config = await contract.saleConfig();
    try {
      expect(config.validatorRequire).is.false;
      config = { ...config };
      config.validator = addr5.address;
      config.validatorRequire = true;
      await contract.setConfig(config);
      //check before
      let balance = await tokenContract.balanceOf(addr6.address);
      expect(balance).equal(TestHelper.addPrecision(0));
      //valid signature
      const hash = await contract.connect(addr5).hashToken(addr6.address, TestHelper.addPrecision(100), dogeContract.address);
      const signature = await testHelper.sign(addr5.address, hash);
      await dogeContract.connect(addr6).send(contract.address, TestHelper.addPrecision(100), signature);
      balance = await tokenContract.balanceOf(addr6.address);
      expect(balance).equal(TestHelper.addPrecision(200));
    } finally {
      config = { ...config };
      config.validatorRequire = false;
      await contract.setConfig(config);
    }
  });


  it("Should NOT allow sale token if whitelisted without approve because bad signer", async function () {
    let config = await contract.saleConfig();
    try {
      expect(config.validatorRequire).is.false;
      config = { ...config };
      config.validator = addr5.address;
      config.validatorRequire = true;
      await contract.setConfig(config);
      //check before
      let balance = await tokenContract.balanceOf(addr6.address);
      expect(balance).equal(TestHelper.addPrecision(200));
      //valid signature
      const hash = await contract.connect(addr5).hashToken(addr6.address, TestHelper.addPrecision(100), dogeContract.address);
      const signature = await testHelper.sign(addr6.address, hash);
      await dogeContract.connect(addr6).send(contract.address, TestHelper.addPrecision(100), signature);
      expect.fail("Should not allow")
    } catch (e) {
      expect((e as any).message).contain("checkSignature: Invalid signer")
    } finally {
      config = { ...config };
      config.validatorRequire = false;
      await contract.setConfig(config);
    }
  });


  it("Should only owner can pause", async function () {
    try {
      const addr2Contract = contract.connect(addr2);
      expect(await addr2Contract.paused()).is.false;
      await addr2Contract.pause();
      expect.fail("Should not allow");
    } catch (e) { }
    const ownerContract = contract.connect(owner);
    expect(await ownerContract.paused()).is.false;
    await ownerContract.pause();
    expect(await ownerContract.paused()).is.true;
  })

  it("Should not allow sale when paused", async function () {
    try {
      await (await contract.connect(addr4).saleNative([], { value: TestHelper.addPrecision(1) })).wait();
      expect.fail("Should not allow");
    } catch (e) {
      expect((e as any).message).contains("Pausable: paused")
    }
  });

  it("Should unpause", async function () {
    try {
      const addr2Contract = contract.connect(addr2);
      expect(await addr2Contract.paused()).is.true;
      await addr2Contract.unpause();
      expect.fail("Should not allow");
    } catch (e) { }
    const ownerContract = contract.connect(owner);
    expect(await ownerContract.paused()).is.true;
    await ownerContract.unpause();
    expect(await ownerContract.paused()).is.false;
  })

  it("Should only owner read and set config", async function () {
    const addr2Contract = contract.connect(addr2);
    const ownerContract = contract.connect(owner);
    try {
      await addr2Contract.saleConfig();
      expect.fail("Should not allow");
    } catch (e) { }
    let config = await ownerContract.saleConfig();
    expect(config.tokenPerCoin).eq((500));
    expect(config.maxPerUser).eq(TestHelper.addPrecision(0));
    expect(config.tokenQuotes.length).eq(3);
    expect(config.tokenQuotes[0].quote).eq(10);
    expect(config.tokenQuotes[0].token).eq(busdContract.address);
    expect(config.tokenQuotes[1].quote).eq(2);
    expect(config.tokenQuotes[1].token).eq(dogeContract.address);
    expect(config.tokenQuotes[2].quote).eq(0);
    expect(config.tokenQuotes[2].token).eq(zeroContract.address);
    //modify
    config = { ...config };
    config.maxPerUser = BigNumber.from(100);
    config.tokenPerCoin = TestHelper.addPrecision(2000);
    config.tokenQuotes = [{ token: dogeContract.address, quote: 1 }] as any;
    try {
      await addr2Contract.setConfig(config);
      expect.fail("Should not allow");
    } catch (e) { }
    await ownerContract.setConfig(config);
    config = await ownerContract.saleConfig();
    expect(config.maxPerUser).eq(100);
    expect(config.tokenPerCoin).eq(TestHelper.addPrecision(2000));
    expect(config.tokenQuotes.length).eq(1);
    expect(config.tokenQuotes[0].quote).eq(1);
    expect(config.tokenQuotes[0].token).eq(dogeContract.address);
  })

  it("Should withdraw coin", async function () {
    const ownerContract = contract.connect(owner);
    const balanceCoin = await ownerContract.balanceCoin();
    const ownerCoin = await owner.getBalance();
    const res = await (await ownerContract.withdrawCoin()).wait();
    const balanceCoinAfter = await ownerContract.balanceCoin();
    const ownerCoinAfter = await owner.getBalance();
    expect(balanceCoinAfter).equal(0);
    expect(ownerCoinAfter).gt(ownerCoin)
    expect(UnitUtils.removePrecision(ownerCoinAfter)).approximately(UnitUtils.removePrecision(balanceCoin.add(ownerCoin).sub(res.gasUsed)), 0.001)
  })

  it("Should withdraw token", async function () {
    const ownerContract = contract.connect(owner);
    const balanceToken = await ownerContract.balanceToken(busdContract.address);
    const ownerBusd = await busdContract.balanceOf(owner.address);
    const res = await (await ownerContract.withdrawToken(busdContract.address)).wait();
    const balanceTokenAfter = await busdContract.balanceOf(ownerContract.address);
    const ownerTokenAfter = await busdContract.balanceOf(owner.address);
    expect(balanceTokenAfter).equal(0);
    expect(ownerTokenAfter).gt(ownerBusd)
    expect(ownerTokenAfter).eq(balanceToken.add(ownerBusd))
  })

  it("Should not allow withdraw coin", async function () {
    try{
      const addr2Contract = contract.connect(addr2);
      await (await addr2Contract.withdrawCoin()).wait();
      expect.fail("Should fail")
    }catch(e){
      expect((e as any).message).contain("missing role");
    }
  })

  it("Should not allow withdraw token", async function () {
    try{
      const addr2Contract = contract.connect(addr2);
      await (await addr2Contract.withdrawToken(busdContract.address)).wait();
      expect.fail("Should fail")
    }catch(e){
      expect((e as any).message).contain("missing role");
    }
  })

  it("Should register for whitelist only once", async function () {
    const contractSale = contract.connect(addr2);
    let isWhitelisted = await contractSale.whitelist(addr2.address);
    expect(isWhitelisted.buyer).eq(ethers.constants.AddressZero);
    let count = await contractSale.whitelistCount();
    expect(count).eq(0);
    await (await contractSale.registerWhitelist(addr2.address, busdContract.address, 10, ethers.constants.AddressZero)).wait();
    isWhitelisted = await contractSale.whitelist(addr2.address);
    expect(isWhitelisted.buyer).eq(addr2.address);
    count = await contractSale.whitelistCount();
    expect(count).eq(1);
    let whitelist = await contractSale.seeWhitelist(0, 10);
    expect(whitelist.length).eq(10);
    whitelist = whitelist.filter(e => e.buyer != ethers.constants.AddressZero);
    expect(whitelist.length).eq(1);
    expect(whitelist[0].amount).eq(10)
    expect(whitelist[0].buyer).eq(addr2.address)
    expect(whitelist[0].token).eq(busdContract.address)
    expect(whitelist[0].sponsor).eq(ethers.constants.AddressZero)
    let sponsoshipt = await contractSale.seeSponsorship(owner.address);
    expect(sponsoshipt.length).eq(0);
    let sponsoshipCount = await contractSale.seeSponsorshipCount(owner.address);
    expect(sponsoshipCount).eq(0);
    //should register only once
    await (await contractSale.registerWhitelist(addr2.address, busdContract.address, 20, owner.address)).wait();
    count = await contractSale.whitelistCount();
    expect(count).eq(1);
    whitelist = await contractSale.seeWhitelist(0, 10);
    expect(whitelist.length).eq(10);
    whitelist = whitelist.filter(e => e.buyer != ethers.constants.AddressZero);
    expect(whitelist.length).eq(1);
    sponsoshipt = await contractSale.seeSponsorship(owner.address);
    expect(sponsoshipt.length).eq(1);
    expect(sponsoshipt[0].buyer).eq(addr2.address);
    expect(sponsoshipt[0].amount).eq(20);
    expect(sponsoshipt[0].token).eq(busdContract.address)
    expect(sponsoshipt[0].sponsor).eq(owner.address)
    sponsoshipCount = await contractSale.seeSponsorshipCount(owner.address);
    expect(sponsoshipCount).eq(1);

  })


  it("Should register multiple address for whitelist", async function () {
    const contractSale = contract.connect(addr2);
    let count = await contractSale.whitelistCount();
    expect(count).eq(1);
    await (await contractSale.registerWhitelist(owner.address, busdContract.address, 10, ethers.constants.AddressZero)).wait();
    await (await contractSale.registerWhitelist(addr3.address, busdContract.address, 10, owner.address)).wait();
    await (await contractSale.registerWhitelist(addr4.address, busdContract.address, 10, owner.address)).wait();
    await (await contractSale.registerWhitelist(addr5.address, busdContract.address, 10, owner.address)).wait();
    await (await contractSale.registerWhitelist(addr6.address, busdContract.address, 10, owner.address)).wait();
    count = await contractSale.whitelistCount();
    expect(count).eq(6);
    let whitelist = await contractSale.seeWhitelist(0, 10);
    expect(whitelist.length).eq(10);
    whitelist = whitelist.filter(e => e.buyer != ethers.constants.AddressZero);
    expect(whitelist.length).eq(6);
    let sponsoshipt = await contractSale.seeSponsorship(owner.address);
    expect(sponsoshipt.length).eq(5);
    let sponsoshipCount = await contractSale.seeSponsorshipCount(owner.address);
    expect(sponsoshipCount).eq(5);
  })

  it("Should not sponsor myself", async function () {
    try {
      const contractSale = contract.connect(owner);
      await (await contractSale.registerWhitelist(owner.address, busdContract.address, 10, owner.address)).wait();
    } catch (e) {
      expect((e as any).message).contains("Whitelist: should not sponsor yourself")
    }
  })

});