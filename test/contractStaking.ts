//must be first (mock)
import { TestHelper } from "./testHelper";
//import
import { expect } from "chai";
import "mocha";
import Moralis from "moralis";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { StakingContract, TokenContract } from 'typechain-types';
import { BigNumber } from "@ethersproject/bignumber";

describe("Staking", function () {
  let contract: StakingContract;
  let tokenContract: TokenContract;
  let owner: SignerWithAddress, addr2: SignerWithAddress, addr3: SignerWithAddress, addr4: SignerWithAddress, addr5: SignerWithAddress;
  //get custom contract
  const SUPPLY = BigNumber.from(10).pow(6).mul(2); 
  const REWARD = BigNumber.from(10).pow(3);
  before(async function () {
    //take snasphto
    await TestHelper.takeSnapshot();
    const testHelper = new TestHelper(SUPPLY, REWARD);
    [owner, addr2, addr3, addr4, addr5] = await testHelper.signerPromise;
    contract = await testHelper.stakingPromise;
    tokenContract = await testHelper.contractTokenPromise;
    await tokenContract.transfer(contract.address, TestHelper.addPrecision(REWARD.toNumber()));
    //total= 1000 0000
    //addr2=1000
    await tokenContract.transfer(addr2.address, BigNumber.from(10).pow(3).mul(TestHelper.PRECISION));
    //addr3=9000
    await tokenContract.transfer(addr3.address, BigNumber.from(10).pow(3).mul(9).mul(TestHelper.PRECISION));
    //addr5=500 000
    await tokenContract.transfer(addr4.address, BigNumber.from(10).pow(5).mul(5).mul(TestHelper.PRECISION));
    //addr6=500 000
    await tokenContract.transfer(addr5.address, BigNumber.from(10).pow(5).mul(5).mul(TestHelper.PRECISION));
  });

  after(async function(){
    await TestHelper.revertSnapshot();
  })

  it("Should return 0 rewards if empty", async function () {
    const history = await contract.historyOf(owner.address);
    const staking = await contract.stakingOf(owner.address);
    const reward = await contract.rewardOf(owner.address);
    const config = await contract.stakeConfig();
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.eq(1000)
    expect(history.length).to.equal(0);
    expect(staking.staked).to.equal(0);
    expect(staking.closed).is.false;
    expect(staking.earned).to.equal(0);
    expect(staking.endAt).to.equal(0);
    expect(staking.startAt).to.equal(0);
    expect(reward.earned).to.equal(0);
    expect(reward.paid).to.equal(0);
    expect(config.rewardPercent).to.equal(1);
    expect(config.rewardTotal).to.equal(TestHelper.addPrecision(10**3));
  });

  it("Should not stake if no allowance", async function () {
    const connected = contract.connect(addr2);
    try{
      expect(await connected.stake(100)).to.equal(100);
      expect.fail("Should not allow staking")
    }catch(e){}
    const staking = await contract.stakingOf(addr2.address);
    const reward = await contract.rewardOf(addr2.address);
    expect(staking.closed).is.false;
    expect(staking.earned).to.equal(0);
    expect(staking.endAt).to.equal(0);
    expect(staking.staked).to.equal(0);
    expect(staking.startAt).to.equal(0);
    expect(reward.earned).to.equal(0);
    expect(reward.paid).to.equal(0);
  });

  it("Should stake 100 with approve", async function () {
    const connected = contract.connect(addr2);
    const tokenConnected = tokenContract.connect(addr2);
    expect(await tokenConnected.allowance(addr2.address,contract.address)).to.equal(0);
    await tokenConnected.approve(contract.address, Moralis.Units.ETH(1000000));
    expect((await tokenConnected.allowance(addr2.address,contract.address))).to.equal(Moralis.Units.ETH(1000000));
    await (await connected.stake(TestHelper.addPrecision(100))).wait();
    const staking = await contract.stakingOf(addr2.address);
    const reward = await contract.rewardOf(addr2.address);
    const infos = await connected.stackingInfos();
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.eq(1100)
    expect(staking.closed).is.false;
    expect(staking.earned).to.equal(0);
    expect(staking.endAt).to.equal(0);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(100);
    expect(staking.startAt.toNumber()).to.not.equal(0);
    expect(reward.earned).to.equal(0);
    expect(reward.paid).to.equal(0);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.equal(100);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(10**5, 0.1);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(10**5 - 100, 0.1);
  });

  it("Should stake 100 without approve", async function () {
    const connected = contract.connect(addr2);
    const tokenConnected = tokenContract.connect(addr2);
    await (await tokenConnected.send(contract.address,TestHelper.addPrecision(100), [])).wait();
    const staking = await connected.stakingOf(addr2.address);
    const reward = await connected.rewardOf(addr2.address);
    const infos = await connected.stackingInfos();
    const history = await contract.historyOf(addr2.address);
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.eq(1200)
    expect(staking.closed).is.false;
    expect(staking.earned).to.equal(0);
    expect(staking.endAt).to.equal(0);
    expect(history.length).to.equal(1);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(staking.startAt.toNumber()).to.not.equal(0);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0,0.015);
    expect(reward.paid).to.equal(0);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.equal(200);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(10**5, 0.1);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(10**5 - 200, 0.1);
  });

  it("Should not allow stake -100", async function () {
    const connected = contract.connect(addr2);
    const tokenConnected = tokenContract.connect(addr2);
    try{
      await (await tokenConnected.send(contract.address,-100, [])).wait();
      expect.fail("Should not allow");
    }catch(e){}
    const staking = await connected.stakingOf(addr2.address);
    const reward = await connected.rewardOf(addr2.address);
    const infos = await connected.stackingInfos();
    const history = await contract.historyOf(addr2.address);
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.eq(1200)
    expect(staking.closed).is.false;
    expect(staking.earned).to.equal(0);
    expect(staking.endAt).to.equal(0);
    expect(history.length).to.equal(1);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(staking.startAt.toNumber()).to.not.equal(0);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0,0.015);
    expect(reward.paid).to.equal(0);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.equal(200);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(10**5, 0.1);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(10**5 - 200, 0.1);
  });

  it("Should not allow negative stake with approve", async function () {
    const connected = contract.connect(addr2);
    try{
      await (await connected.stake(-100)).wait();
      expect.fail("Should not allow");
    }catch(e){}
    const staking = await connected.stakingOf(addr2.address);
    const reward = await connected.rewardOf(addr2.address);
    const infos = await connected.stackingInfos();
    const history = await contract.historyOf(addr2.address);
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.eq(1200)
    expect(staking.closed).is.false;
    expect(staking.earned).to.equal(0);
    expect(staking.endAt).to.equal(0);
    expect(history.length).to.equal(1);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(staking.startAt.toNumber()).to.not.equal(0);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0,0.015);
    expect(reward.paid).to.equal(0);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.equal(200);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(10**5, 0.1);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(10**5 - 200, 0.1);
  });

  it("Should not allow withdraw -100", async function () {
    const connected = contract.connect(addr2);
    try{
      await (await connected.withdraw(-100, false)).wait();
      expect.fail("Should not allow");
    }catch(e){}
    const staking = await connected.stakingOf(addr2.address);
    const reward = await connected.rewardOf(addr2.address);
    const infos = await connected.stackingInfos();
    const history = await contract.historyOf(addr2.address);
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.eq(1200)
    expect(staking.closed).is.false;
    expect(staking.earned).to.equal(0);
    expect(staking.endAt).to.equal(0);
    expect(history.length).to.equal(1);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(staking.startAt.toNumber()).to.not.equal(0);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0,0.015);
    expect(reward.paid).to.equal(0);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.equal(200);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(10**5, 0.1);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(10**5 - 200, 0.1);
  });

  it("Should not allow non owner stakeCheck", async function(){
    try{
      const addr2Contract = contract.connect(addr2);
      await addr2Contract.stakeCheck(1);
      expect.fail("Should not allow");
    }catch(e){
    }
  })

  it("Should not allow non owner withdrawCheck", async function(){
    try{
      const addr2Contract = contract.connect(addr2);
      await addr2Contract.withdrawCheck(1);
      expect.fail("Should not allow");
    }catch(e){
    }
  })

  it("Should not allow non owner collectRewardsCheck", async function(){
    try{
      const addr2Contract = contract.connect(addr2);
      await addr2Contract.collectRewardsCheck();
      expect.fail("Should not allow");
    }catch(e){
    }
  })

  it("Should only owner can pause", async function(){
    try{
      const addr2Contract = contract.connect(addr2);
      expect(await addr2Contract.paused()).is.false;
      await addr2Contract.pause();
      expect.fail("Should not allow");
    }catch(e){}
    const ownerContract = contract.connect(owner);
    expect(await ownerContract.paused()).is.false;
    await ownerContract.pause();
    expect(await ownerContract.paused()).is.true;
  })

  it("Should not allow stake if paused", async function () {
    const ownerContract = contract.connect(owner);
    const connected = contract.connect(addr2);
    const tokenConnected = tokenContract.connect(addr2);
    expect(await ownerContract.paused()).is.true;
    try{
      await (await tokenConnected.send(contract.address,TestHelper.addPrecision(100), [])).wait();
      expect.fail("Should not allow");
    }catch(e){}
    const staking = await connected.stakingOf(addr2.address);
    const reward = await connected.rewardOf(addr2.address);
    const infos = await connected.stackingInfos();
    const history = await contract.historyOf(addr2.address);
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.eq(1200)
    expect(staking.closed).is.false;
    expect(staking.endAt).to.equal(0);
    expect(history.length).to.equal(1);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(staking.startAt.toNumber()).to.not.equal(0);
    expect(reward.paid).to.equal(0);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.equal(200);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(10**5, 0.1);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(10**5 - 200, 0.1);
  });

  it("Should not allow stake with approve if paused", async function () {
    const ownerContract = contract.connect(owner);
    const connected = contract.connect(addr2);
    expect(await ownerContract.paused()).is.true;
    try{
      await (await connected.stake(TestHelper.addPrecision(100))).wait();
      expect.fail("Should not allow");
    }catch(e){}
    const staking = await connected.stakingOf(addr2.address);
    const reward = await connected.rewardOf(addr2.address);
    const infos = await connected.stackingInfos();
    const history = await contract.historyOf(addr2.address);
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.eq(1200)
    expect(staking.closed).is.false;
    expect(staking.endAt).to.equal(0);
    expect(history.length).to.equal(1);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(staking.startAt.toNumber()).to.not.equal(0);
    expect(reward.paid).to.equal(0);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.equal(200);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(10**5, 0.1);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(10**5 - 200, 0.1);
  });

  it("Should not allow withdraw if paused", async function () {
    const ownerContract = contract.connect(owner);
    const connected = contract.connect(addr2);
    expect(await ownerContract.paused()).is.true;
    try{
      await (await connected.withdraw(TestHelper.addPrecision(100),false)).wait();
      expect.fail("Should not allow");
    }catch(e){}
    const staking = await connected.stakingOf(addr2.address);
    const reward = await connected.rewardOf(addr2.address);
    const infos = await connected.stackingInfos();
    const history = await contract.historyOf(addr2.address);
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.eq(1200)
    expect(staking.closed).is.false;
    expect(staking.endAt).to.equal(0);
    expect(history.length).to.equal(1);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(staking.startAt.toNumber()).to.not.equal(0);
    expect(reward.paid).to.equal(0);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.equal(200);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(10**5, 0.1);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(10**5 - 200, 0.1);
  });

  it("Should not allow collect if paused", async function () {
    const ownerContract = contract.connect(owner);
    const connected = contract.connect(addr2);
    expect(await ownerContract.paused()).is.true;
    try{
      await (await connected.collectRewards()).wait();
      expect.fail("Should not allow");
    }catch(e){}
    const staking = await connected.stakingOf(addr2.address);
    const reward = await connected.rewardOf(addr2.address);
    const infos = await connected.stackingInfos();
    const history = await contract.historyOf(addr2.address);
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.eq(1200)
    expect(staking.closed).is.false;
    expect(staking.endAt).to.equal(0);
    expect(history.length).to.equal(1);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(staking.startAt.toNumber()).to.not.equal(0);
    expect(reward.paid).to.equal(0);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.equal(200);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(10**5, 0.1);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(10**5 - 200, 0.1);
  });

  it("Should allow owner stake if paused", async function () {
    const ownerContract = contract.connect(owner);
    const tokenConnected = tokenContract.connect(owner);
    await tokenConnected.approve(contract.address, TestHelper.addPrecision(1));
    try{
      expect(await ownerContract.paused()).is.true;
      await (await ownerContract.stake(TestHelper.addPrecision(1))).wait();
      expect.fail("Should not allow");
    }catch(e){}
    await ownerContract.stakeCheck(TestHelper.addPrecision(1));
  })

  it("Should allow owner withdraw if paused", async function () {
    const ownerContract = contract.connect(owner);
    try{
      expect(await ownerContract.paused()).is.true;
      await (await ownerContract.withdraw(TestHelper.addPrecision(1), false)).wait();
      expect.fail("Should not allow");
    }catch(e){}
    await ownerContract.withdrawCheck(TestHelper.addPrecision(1));
  })

  it("Should allow owner collect if paused", async function () {
    const ownerContract = contract.connect(owner);
    try{
      expect(await ownerContract.paused()).is.true;
      await (await ownerContract.collectRewards()).wait();
      expect.fail("Should not allow");
    }catch(e){}
    await ownerContract.collectRewardsCheck();
  })

  it("Should unpause", async function(){
    try{
      const addr2Contract = contract.connect(addr2);
      expect(await addr2Contract.paused()).is.true;
      await addr2Contract.unpause();
      expect.fail("Should not allow");
    }catch(e){}
    const ownerContract = contract.connect(owner);
    expect(await ownerContract.paused()).is.true;
    await ownerContract.unpause();
    expect(await ownerContract.paused()).is.false;
  })

  it("Should get rewards after 6 hour", async function () {
    const connected = contract.connect(addr2);
    //6h => 0.25day => 0.025 for all period (10 days)
    //200 * 1% * 0.025 = 0.05
    await TestHelper.increaseHour(6);
    let reward = await contract.rewardOf(addr2.address);
    let staking = await contract.stakingOf(addr2.address);
    let balance = await tokenContract.balanceOf(addr2.address)
    expect(TestHelper.removePrecision(balance)).to.equal(800);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0.05,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0,0.015);
    expect(reward.paid).to.equal(0);
    await (await connected.collectRewards()).wait();
    reward = await contract.rewardOf(addr2.address);
    staking = await contract.stakingOf(addr2.address);
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(1199.95,0.001)
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0.05,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0.05,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0,0.015);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0,0.015);
    balance = await tokenContract.balanceOf(addr2.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(800 + 0.05,0.001);
  });

  it("Should not get rewards twice after 6 hour", async function () {
    const connected = contract.connect(addr2);
    let balance = await tokenContract.balanceOf(addr2.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(800.05,0.001);
    let reward = await contract.rewardOf(addr2.address);
    let staking = await contract.stakingOf(addr2.address);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0.05,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0.05,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0,0.015);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0,0.015);
    await (await connected.collectRewards()).wait();
    balance = await tokenContract.balanceOf(addr2.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(800.05,0.001);
    reward = await contract.rewardOf(addr2.address);
    staking = await contract.stakingOf(addr2.address);
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(1199.95,0.001)
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0.05,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0.05,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0,0.015);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0,0.015);
  })

  it("Should get rewards after 12 hour", async function () {
    const connected = contract.connect(addr2);
    //6h + 6h => 12h => 0.5day => 0.05 for all period (10 days)
    //200 * 1% * 0.05 = 0.1
    await TestHelper.increaseHour(6);
    let reward = await contract.rewardOf(addr2.address);
    let staking = await contract.stakingOf(addr2.address);
    let balance = await tokenContract.balanceOf(addr2.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(800.05,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0.1,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0.05,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0,0.015);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0,0.015);
    await (await connected.collectRewards()).wait();
    reward = await contract.rewardOf(addr2.address);
    staking = await contract.stakingOf(addr2.address);
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(1199.9,0.001)
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0.1,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0.1,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0,0.015);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0,0.015);
    balance = await tokenContract.balanceOf(addr2.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(800.1,0.001);
  })

  it("Should augment staking", async function () {
    const tokenConnected = tokenContract.connect(addr2);
    let history = await contract.historyOf(addr2.address);
    let reward = await contract.rewardOf(addr2.address);
    let staking = await contract.stakingOf(addr2.address);
    let balance = await tokenContract.balanceOf(addr2.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(800.1,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0,0.015);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0,0.015);
    expect(history.length).to.equal(1);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0.1,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0.1,0.001);
    await (await tokenConnected.send(contract.address,TestHelper.addPrecision(200), [])).wait();
    history = await contract.historyOf(addr2.address);
    reward = await contract.rewardOf(addr2.address);
    staking = await contract.stakingOf(addr2.address);
    balance = await tokenContract.balanceOf(addr2.address)
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(1399.9,0.001)
    expect(TestHelper.removePrecision(balance)).to.approximately(600.1,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(400);
    expect(TestHelper.removePrecision(staking.earned)).to.equal(0);
    expect(TestHelper.removePrecision(staking.paid)).to.equal(0);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0.1,0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0.1,0.001);
    expect(history.length).to.equal(2);
  })

  it("Should get rewards after 1 day", async function () {
    const connected = contract.connect(addr2);
    //12h + 12h => 24h => 1day => 0.1 for all period (10 days)
    //12h/200 => 0.1 | 12h/400 =>0.2 | 24h=0.1+0.2
    await TestHelper.increaseHour(12);
    let reward = await contract.rewardOf(addr2.address);
    let staking = await contract.stakingOf(addr2.address);
    let balance = await tokenContract.balanceOf(addr2.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(600.1,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(400);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0.2,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0.1, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0.1, 0.001);
    await (await connected.collectRewards()).wait();
    reward = await contract.rewardOf(addr2.address);
    staking = await contract.stakingOf(addr2.address);
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(1399.7,0.001)
    expect(TestHelper.removePrecision(staking.staked)).to.equal(400);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0.2,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0.2,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0.1, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0.1, 0.001);
    balance = await tokenContract.balanceOf(addr2.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(600.3,0.001);
  })

  it("Should reduce staking", async function () {
    const connected = contract.connect(addr2);
    let history = await contract.historyOf(addr2.address);
    let reward = await contract.rewardOf(addr2.address);
    let staking = await contract.stakingOf(addr2.address);
    let balance = await tokenContract.balanceOf(addr2.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(600.3,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(400);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0.1,0.015);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0.1,0.015);
    expect(history.length).to.equal(2);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(400);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0.2,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0.2,0.001);
    await (await connected.withdraw(TestHelper.addPrecision(200), false)).wait();
    history = await contract.historyOf(addr2.address);
    reward = await contract.rewardOf(addr2.address);
    staking = await contract.stakingOf(addr2.address);
    balance = await tokenContract.balanceOf(addr2.address)
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(1199.7,0.001)
    expect(TestHelper.removePrecision(balance)).to.approximately(800.3,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(TestHelper.removePrecision(staking.earned)).to.equal(0);
    expect(TestHelper.removePrecision(staking.paid)).to.equal(0);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0.3,0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0.3,0.001);
    expect(history.length).to.equal(3);
  })


  it("Should get rewards after 5 day", async function () {
    const connected = contract.connect(addr2);
    //4day => 0.4 for all period (10 days)
    //200 * 1% * 0.4 = 0.8
    //previous 1day=0.3 | 4day = | total = 0.3 + 0.8 = 1.1
    await TestHelper.increaseDay(4);
    let reward = await contract.rewardOf(addr2.address);
    let staking = await contract.stakingOf(addr2.address);
    let balance = await tokenContract.balanceOf(addr2.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(800.3,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0.8,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0.3, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0.3, 0.001);
    await (await connected.collectRewards()).wait();
    reward = await contract.rewardOf(addr2.address);
    staking = await contract.stakingOf(addr2.address);
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(1198.9,0.001)
    expect(TestHelper.removePrecision(staking.staked)).to.equal(200);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0.8,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0.8,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0.3, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0.3, 0.001);
    balance = await tokenContract.balanceOf(addr2.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(801.1,0.001);
  })

  it("Should addr3  stake 9000", async function () {
    const connected = tokenContract.connect(addr3);
    let reward = await contract.rewardOf(addr3.address);
    let staking = await contract.stakingOf(addr3.address);
    let balance = await tokenContract.balanceOf(addr3.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(9000,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(0);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.001);
    await (await connected.send(contract.address, balance, [])).wait();
    reward = await contract.rewardOf(addr3.address);
    staking = await contract.stakingOf(addr3.address);
    balance = await tokenContract.balanceOf(addr3.address)
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(10198.9,0.001)
    expect(TestHelper.removePrecision(balance)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(9000);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.001);
  })

  it("Should not allow addr4 to stake 500 000 (remaining is 90800)", async function () {
    const connected = tokenContract.connect(addr4);
    let reward = await contract.rewardOf(addr4.address);
    let staking = await contract.stakingOf(addr4.address);
    let infos = await contract.stackingInfos();
    let balance = await tokenContract.balanceOf(addr4.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(500000,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(0);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(9200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(90800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(1.1, 0.001);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(998.9, 0.001);
    try{
      await (await connected.send(contract.address, balance, [])).wait();
      expect.fail("Should not allow stake");
    }catch(e){}
    reward = await contract.rewardOf(addr4.address);
    staking = await contract.stakingOf(addr4.address);
    infos = await contract.stackingInfos();
    balance = await tokenContract.balanceOf(addr4.address)
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(10198.9,0.001)
    expect(TestHelper.removePrecision(balance)).to.approximately(500000,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(0);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(9200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(90800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(1.1, 0.001);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(998.9, 0.001);
  })

  it("Should allow addr4 to stake 90000", async function () {
    const connected = tokenContract.connect(addr4);
    let reward = await contract.rewardOf(addr4.address);
    let staking = await contract.stakingOf(addr4.address);
    let infos = await contract.stackingInfos();
    let balance = await tokenContract.balanceOf(addr4.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(500000,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(0);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(9200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(90800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(1.1, 0.001);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(998.9, 0.001);
    await (await connected.send(contract.address, TestHelper.addPrecision(90000), [])).wait();
    reward = await contract.rewardOf(addr4.address);
    staking = await contract.stakingOf(addr4.address);
    infos = await contract.stackingInfos();
    balance = await tokenContract.balanceOf(addr4.address)
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(100198.9,0.001)
    expect(TestHelper.removePrecision(balance)).to.approximately(410000,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(90000,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(99200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(1.1, 0.001);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(998.9, 0.001);
  })

  it("Should allow addr5 to stake 800", async function () {
    const connected = tokenContract.connect(addr5);
    let reward = await contract.rewardOf(addr5.address);
    let staking = await contract.stakingOf(addr5.address);
    let infos = await contract.stackingInfos();
    let balance = await tokenContract.balanceOf(addr5.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(500000,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.equal(0);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(99200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(1.1, 0.001);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(998.9, 0.001);
    await (await connected.send(contract.address, TestHelper.addPrecision(800), [])).wait();
    reward = await contract.rewardOf(addr5.address);
    staking = await contract.stakingOf(addr5.address);
    infos = await contract.stackingInfos();
    balance = await tokenContract.balanceOf(addr5.address)
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(100998.9,0.001)
    expect(TestHelper.removePrecision(balance)).to.approximately(499200,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(800,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(1.1, 0.001);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(998.9, 0.001);
  })

  it("Should allow addr5 withdraw all 800 at day 9", async function () {
    await TestHelper.increaseDay(4);
    //800*1% = 8 pour 10days
    //1day = 0.8 => 4day = 3.2
    const connected = contract.connect(addr5);
    let reward = await contract.rewardOf(addr5.address);
    let staking = await contract.stakingOf(addr5.address);
    let infos = await contract.stackingInfos();
    let balance = await tokenContract.balanceOf(addr5.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(499200,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(800,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(3.2,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(1.1, 0.001);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(998.9, 0.001);
    await (await connected.withdraw(TestHelper.addPrecision(800), false)).wait();
    reward = await contract.rewardOf(addr5.address);
    staking = await contract.stakingOf(addr5.address);
    infos = await contract.stackingInfos();
    balance = await tokenContract.balanceOf(addr5.address)
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(100198.9,0.001)
    expect(TestHelper.removePrecision(balance)).to.approximately(500000,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(3.2, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(99200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(1.1, 0.001);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(998.9, 0.001);
  })

  it("Should withdraw addr3 at day 10", async function () {
    await TestHelper.increaseDay(1);
    //9000*1% = 90 pour 10days
    //1day = 9 => 5day = 45
    const connected = contract.connect(addr3);
    let reward = await contract.rewardOf(addr3.address);
    let staking = await contract.stakingOf(addr3.address);
    let infos = await contract.stackingInfos();
    let balance = await tokenContract.balanceOf(addr3.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(9000,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(45,0.015);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(99200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(1.1, 0.001);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(998.9, 0.001);
    await (await connected.withdraw(TestHelper.addPrecision(9000), false)).wait();
    reward = await contract.rewardOf(addr3.address);
    staking = await contract.stakingOf(addr3.address);
    infos = await contract.stackingInfos();
    balance = await tokenContract.balanceOf(addr3.address)
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(91198.9,0.001)
    expect(TestHelper.removePrecision(balance)).to.approximately(9000,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(45,0.015);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(90200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(9800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(1.1, 0.001);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(998.9, 0.001);
  })

  it("Should collect rewards of addr4 at day 11", async function () {
    await TestHelper.increaseDay(1);
    //90000*1% = 900 pour 10days
    //1day = 90 => 5day = 450
    const connected = contract.connect(addr4);
    let reward = await contract.rewardOf(addr4.address);
    let staking = await contract.stakingOf(addr4.address);
    let infos = await contract.stackingInfos();
    let balance = await tokenContract.balanceOf(addr4.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(410000,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(90000,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(450,0.15);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(90200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(9800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(1.1, 0.001);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(998.9, 0.001);
    await (await connected.collectRewards()).wait();
    reward = await contract.rewardOf(addr4.address);
    staking = await contract.stakingOf(addr4.address);
    infos = await contract.stackingInfos();
    balance = await tokenContract.balanceOf(addr4.address)
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(90748.9,0.15)
    expect(TestHelper.removePrecision(balance)).to.approximately(410450,0.15);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(90000,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(450,0.15);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(450,0.15);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0, 0.1);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.1);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(90200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(9800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(451.1, 0.15);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(548.9, 0.15);
  })

  it("Should collect rewards of addr5 at day 11", async function () {
    //800*1% = 8 pour 10days
    //1day = 0.8 => 4day = 3.2
    const connected = contract.connect(addr5);
    let reward = await contract.rewardOf(addr5.address);
    let staking = await contract.stakingOf(addr5.address);
    let infos = await contract.stackingInfos();
    let balance = await tokenContract.balanceOf(addr5.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(500000,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(3.2, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(90200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(9800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(451.1, 0.15);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(548.9, 0.15);
    await (await connected.collectRewards()).wait();
    reward = await contract.rewardOf(addr5.address);
    staking = await contract.stakingOf(addr5.address);
    infos = await contract.stackingInfos();
    balance = await tokenContract.balanceOf(addr5.address)
    const balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(90745.7,0.15)
    expect(TestHelper.removePrecision(balance)).to.approximately(500003.2,0.001);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(3.2, 0.001);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(3.2, 0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(90200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(9800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(454.3, 0.15);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(545.7, 0.15);
  })

  it("Should withdraw addr4 at day 12", async function () {
    await TestHelper.increaseDay(1);
    const connected = contract.connect(addr4);
    let reward = await contract.rewardOf(addr4.address);
    let staking = await contract.stakingOf(addr4.address);
    let infos = await contract.stackingInfos();
    let balance = await tokenContract.balanceOf(addr4.address)
    let balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balance)).to.approximately(410450,0.15);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(90000,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(450,0.15);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(450,0.15);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0, 0.1);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0, 0.1);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(90200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(9800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(454.3, 0.15);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(545.7, 0.15);
    await (await connected.withdraw(TestHelper.addPrecision(90000), true)).wait();
    reward = await contract.rewardOf(addr4.address);
    staking = await contract.stakingOf(addr4.address);
    infos = await contract.stackingInfos();
    balance = await tokenContract.balanceOf(addr4.address)
    balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(745.7,0.15)
    expect(TestHelper.removePrecision(balance)).to.approximately(500450,0.15);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0,0.1);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.1);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(450, 0.15);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(450, 0.15);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(99800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(454.3, 0.15);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(545.7, 0.15);
  })

  it("Should not allow addr2 to withdraw more than 200 at day 12", async function () {
    const connected = contract.connect(addr2);
    let reward = await contract.rewardOf(addr2.address);
    let staking = await contract.stakingOf(addr2.address);
    let infos = await contract.stackingInfos();
    let balance = await tokenContract.balanceOf(addr2.address)
    let balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(745.7,0.15)
    expect(TestHelper.removePrecision(balance)).to.approximately(801.1,0.15);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(200,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(1.8,0.15);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0.8,0.15);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0.3, 0.15);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0.3, 0.15);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(99800, 0.001);
    try{
      await (await connected.withdraw(TestHelper.addPrecision(200.1), true)).wait();
      expect.fail("Should not allow withdraw")
    }catch(e){}
    reward = await contract.rewardOf(addr2.address);
    staking = await contract.stakingOf(addr2.address);
    infos = await contract.stackingInfos();
    balance = await tokenContract.balanceOf(addr2.address)
    balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(745.7,0.15)
    expect(TestHelper.removePrecision(balance)).to.approximately(801.1,0.15);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(200,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(1.8,0.15);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0.8,0.15);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0.3, 0.15);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0.3, 0.15);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(99800, 0.001);
  });

  it("Should withdraw and collect addr2 at day 15 without adding rewards", async function () {
    await TestHelper.increaseDay(3);
    //200*1% => 2 => 0.2/day => 5day=1
    const connected = contract.connect(addr2);
    let reward = await contract.rewardOf(addr2.address);
    let staking = await contract.stakingOf(addr2.address);
    let infos = await contract.stackingInfos();
    let balance = await tokenContract.balanceOf(addr2.address)
    let balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(745.7,0.15)
    expect(TestHelper.removePrecision(balance)).to.approximately(801.1,0.15);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(200,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(1.8,0.15);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0.8,0.15);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(0.3, 0.15);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(0.3, 0.15);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(200, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(99800, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(454.3, 0.15);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(545.7, 0.15);
    await (await connected.withdraw(TestHelper.addPrecision(200), true)).wait();
    reward = await contract.rewardOf(addr2.address);
    staking = await contract.stakingOf(addr2.address);
    infos = await contract.stackingInfos();
    balance = await tokenContract.balanceOf(addr2.address)
    balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(544.7,0.15)
    expect(TestHelper.removePrecision(balance)).to.approximately(1002.1,0.15);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(staking.earned)).to.approximately(0,0.15);
    expect(TestHelper.removePrecision(staking.paid)).to.approximately(0,0.15);
    expect(TestHelper.removePrecision(reward.earned)).to.approximately(2.1, 0.15);
    expect(TestHelper.removePrecision(reward.paid)).to.approximately(2.1, 0.15);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardDistribute)).to.approximately(455.3, 0.15);
    expect(TestHelper.removePrecision(infos.rewardTotal)).to.approximately(1000, 0.001);
    expect(TestHelper.removePrecision(infos.rewardRemain)).to.approximately(544.7, 0.15);
  })

  it("Should not stake after the end", async function () {
    const connected = contract.connect(addr2);
    let reward = await contract.rewardOf(addr2.address);
    let staking = await contract.stakingOf(addr2.address);
    let infos = await contract.stackingInfos();
    let balance = await tokenContract.balanceOf(addr2.address)
    let balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(544.7,0.15)
    expect(TestHelper.removePrecision(balance)).to.approximately(1002.1,0.15);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(100000, 0.001);
    try{
      await (await connected.stake(TestHelper.addPrecision(200))).wait();
      expect.fail("Should not allow stake")
    }catch(e){}
    reward = await contract.rewardOf(addr2.address);
    staking = await contract.stakingOf(addr2.address);
    infos = await contract.stackingInfos();
    balance = await tokenContract.balanceOf(addr2.address)
    balanceContract = await tokenContract.balanceOf(contract.address)
    expect(TestHelper.removePrecision(balanceContract)).to.approximately(544.7,0.15)
    expect(TestHelper.removePrecision(balance)).to.approximately(1002.1,0.15);
    expect(TestHelper.removePrecision(staking.staked)).to.approximately(0,0.001);
    expect(TestHelper.removePrecision(infos.stakeTotal)).to.approximately(0, 0.001);
    expect(TestHelper.removePrecision(infos.stakeMax)).to.approximately(100000, 0.001);
    expect(TestHelper.removePrecision(infos.stakeRemain)).to.approximately(100000, 0.001);
  })
  it("Should only owner read and set config", async function () {
    const addr2Contract = contract.connect(addr2);
    const ownerContract = contract.connect(owner);
    try{
      await addr2Contract.stakeConfig();
      expect.fail("Should not allow");
    }catch(e){}
    let config = await ownerContract.stakeConfig();
    expect(config.rewardPercent).eq(1);
    expect(config.rewardTotal).eq(TestHelper.addPrecision(1000));
    //modify
    config = {...config};
    config.rewardPercent = BigNumber.from(5);
    config.rewardTotal = TestHelper.addPrecision(2000);
    try{
      await addr2Contract.setConfig(config);
      expect.fail("Should not allow");
    }catch(e){}
    await ownerContract.setConfig(config);
      config = await ownerContract.stakeConfig();
    expect(config.rewardPercent).eq(5);
    expect(config.rewardTotal).eq(TestHelper.addPrecision(2000));
  })
  //DONE should collect early (without ending staking)
  //DONE should add stake
  //DONE should augment stake
  //DONE should reduce stake
  //DONE should not augment stake if limit
  //DONE should collect rewards after withdraw
  //DONE should not collect rewards if no rewards
  //DONE should withdraw partially
  //DONE should withdraw all
  //DONE should transfer (owner) without stake
  //DONE should stake using approve
  //DONE should unstake and collect
  //DONE should not stake after end
  //DONE should not compute rewards out of stake period
  //DONE should not withdraw more than
  //DONE should not stake/unstake negative
  //DONE should not stake/unstake when pause
  //DONE should only owner setConfig
  //DONE owner should allow stake/unstake/transfer even if paused
  //TODO timestamp issue (block.timestamp can vary 15s => use a signed timestamp?)
});