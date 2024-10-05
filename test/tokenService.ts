//must be first (mock)
import { TestHelper } from "./testHelper";
//import
import { expect } from "chai";
import "mocha";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { TokenService } from "src/tokenService";
import { AppService } from "src/appService";
import { ethers, waffle } from "hardhat";
import { EthersProviderWrapper } from "@nomiclabs/hardhat-ethers/internal/ethers-provider-wrapper";
import { TokenContract } from "typechain-types";
import { SwapService } from "src/swapService";
import { DateUtils } from "src/utils";
import { BigNumber } from "@ethersproject/bignumber";

describe("TokenService", function () {
  let service: TokenService;
  let swapService: SwapService;
  let tokenContract: TokenContract;
  let busdContract:TokenContract;
  let owner: SignerWithAddress, user: SignerWithAddress, user2: SignerWithAddress;
  before(async function () {
    //take snasphto
    await TestHelper.takeSnapshot();
    const testHelper = new TestHelper();
    [owner,,,,,,,user, user2] = await testHelper.signerPromise;
    const nftContract = await testHelper.contractNFTPromise;
    const stakeContract = await testHelper.stakingPromise;
    busdContract = await testHelper.createToken("BUSD");
    const socialNameContract = await testHelper.contractSocialNamePromise(owner.address);
    const socialCampaignContract = await testHelper.contractSocialCampaignPromise(owner.address);
    const socialAdsContract = await testHelper.contractSocialAdsPromise(owner.address);
    const saleContract = await testHelper.saleContract([{ quote: 10, token: busdContract.address }]);
    tokenContract = await testHelper.contractTokenPromise;
    const appService = new AppService({
      signerService: testHelper.fixSigner(owner),
      web3Selector: testHelper.web3Selector,
      nftContract,
      tokenContract,
      saleContract,
      stakeContract,
      socialAdsContract,
      socialCampaignContract,
      socialNameContract
    });
    appService.authService.forceUser(user.address);
    appService.authService.forceProvider(waffle.provider);
    //service
    service = appService.tokenService;
    swapService = appService.swapService;
    swapService["forceChain"] = 56;//BSC
    //config
    appService.appConfig.token.usdSymbol = "BUSD";
    appService.appConfig.token.usdContract = busdContract.address;
    //set validator
    let config = await saleContract.saleConfig();
    config = { ...config, validator: owner.address, validatorRequire: true };
    await saleContract.setConfig(config);
    //transfer fund to sale
    await tokenContract.send(saleContract.address, TestHelper.addPrecision(100000), []);
    //transfer fund to reward
    await tokenContract.send(stakeContract.address, TestHelper.addPrecision(100), []);
    //trnasfer usd
    await busdContract.transfer(user.address, TestHelper.addPrecision(1000));
  });

  after(async function(){
    //TODO avatar/ meme / player / player accessory
    //TODO NFT de base + NFTMArketPlace (on tken received?) / signature pour mint (operateur a le droit mais pas le public) 
    await TestHelper.revertSnapshot();
  })

  it("Should get balance of my token", async function () {
    let balance = await service.getMyTokenBalance();
    expect(balance.balance).eq("0.000");
    await tokenContract.transfer(user.address, TestHelper.addPrecision(100));
    balance = await service.getMyTokenBalance();
    expect(balance.balance).eq("100.000");
  });

  it("Should get balance of native coin", async function () {
    let balance = await service.getNativeTokenBalance();
    expect(+balance.balance).approximately(10000, 1);
    expect(+(balance.price!)).approximately(600, 300);
  });

  it("Should buy using coin", async function () {
    let balance = await service.getMyTokenBalance();
    expect(balance.balance).eq("100.000");
    balance = await service.buyUsingCoin(1);
    expect(+(balance.balance!)).approximately(600, 1);
  });

  it("Should buy using token usd", async function () {
    const usdContractAddr = service.appService.appConfig.token.usdContract;
    let countApprovale = 0, countTransfer = 0;
    const contract = await service.getERC20(usdContractAddr);
    (contract.provider as EthersProviderWrapper).pollingInterval = 100;
    service.listenApproval(usdContractAddr, () => {
      countApprovale++;
    })
    service.listenTransfer(usdContractAddr, () => {
      countTransfer++;
    })
    const balance = await service.buyUsingToken(1, usdContractAddr);
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(+(balance.balance!)).approximately(610, 1);
    //expect(countTransfer).gte(1);
    //expect(countApprovale).gte(1);
  });

  it("Should send coin", async function () {
    let balance = await service.getNativeTokenBalance();
    expect(+balance.balance).approximately(10000, 2);
    balance = await service.sendCoin("10", user2.address);
    const balance2 = await service.getNativeTokenBalanceFor(user2.address);
    expect(+balance2.balance).approximately(10010, 2);
    expect(+balance.balance).approximately(9990, 2);
  });

  it("Should send token", async function () {
    let balance = await service.getTokenBalance(tokenContract.address);
    expect(+balance.balance).approximately(610, 1);
    balance = await service.getMyTokenBalance();
    expect(+balance.balance).approximately(610, 1);
    balance = await service.sendToken(10, user2.address, tokenContract.address);
    const balance2 = await service.getTokenBalanceFor(tokenContract.address, user2.address);
    expect(+balance2.balance).approximately(10, 1);
    expect(+balance.balance).approximately(600, 1);
    balance = await service.getMyTokenBalance();
    expect(+balance.balance).approximately(600, 1);
  });

  it("Should stake token", async function () {
    let balance = await service.getMyTokenBalance();
    expect(+balance.balance).approximately(600, 1);
    const infos = await service.stakeToken(400);
    balance = await service.getMyTokenBalance();
    expect(+balance.balance).approximately(200, 1);
    expect(+infos.staked).equal(400);
  });

  it("Should collect reward", async function () {
    await TestHelper.increaseDay(5);
    let balance = await service.getMyTokenBalance();
    let infos = await service.stakingOf();
    let total = await service.stakeComputeRewards();
    expect(+balance.balance).equal(200);
    expect(+infos.staked).equal(400);
    expect(+infos.earned).equal(2);
    expect(+infos.paid).equal(0);
    expect(+total.earned).equal(2);
    expect(+total.paid).equal(0);
    expect(+total.topay).equal(2);
    infos = await service.stakeCollect();
    balance = await service.getMyTokenBalance();
    total = await service.stakeComputeRewards();
    expect(+balance.balance).equal(202);
    expect(+infos.staked).equal(400);
    expect(+infos.earned).equal(2);
    expect(+infos.paid).equal(2);
    expect(+total.earned).equal(2);
    expect(+total.paid).equal(2);
    expect(+total.topay).equal(0);
  });

  it("Should get my rewards and stake info", async function () {
    let history = await service.stakeHistory();
    expect(history.length).equal(0);
    await TestHelper.increaseDay(2);
    const infos = await service.stakeToken(200);
    expect(+infos.staked).equal(600);
    let total = await service.stakeComputeRewards();
    expect(+total.earned).equal(2.8);
    expect(+total.paid).equal(2);
    expect(+total.topay).equal(0.8);
    await TestHelper.increaseDay(5);
    history = await service.stakeHistory();
    expect(history.length).equal(1);
    total = await service.stakeComputeRewards();
    expect(+total.earned).approximately(4.6, 0.01);
    expect(+total.paid).equal(2);
    expect(+total.topay).approximately(2.6,0.01);
    //infos
    let glob = await service.stakeInfos();
    expect(+glob.rewardDistribute).equal(2);
    expect(+glob.rewardPercent).equal(1);
    expect(+glob.rewardRemain).equal(998);
    expect(+glob.rewardTotal).equal(1000);
    expect(+glob.stakeMax).equal(100000);
    expect(+glob.stakeRemain).equal(100000 - 600);
    expect(+glob.stakeTotal).equal(600);
  });

  it("Should unstake token", async function () {
    let balance = await service.getMyTokenBalance();
    expect(+balance.balance).approximately(2, 0.1);
    let infos = await service.stakeWithdraw(200, true);
    balance = await service.getMyTokenBalance();
    expect(+infos.staked).equal(400);
    expect(+balance.balance).approximately(204.6, 1);
    infos = await service.stakeWithdraw(undefined, true);
    balance = await service.getMyTokenBalance();
    expect(+balance.balance).approximately(604.6, 1);
    expect(+infos.staked).equal(0);
    let total = await service.stakeComputeRewards();
    expect(+total.earned).approximately(4.6, 0.01);
    expect(+total.paid).approximately(4.6, 0.01);
    expect(+total.topay).equal(0);
  });

  it("Should get swap config", async function () {
    const health = await swapService.getHealthCheck();
    expect(health).is.true;
    const sources = await swapService.getListLiquiditySource();
    expect(sources.protocols.length).not.equal(0);
    const preset = await swapService.getPreset();
    expect(preset.LOWEST_GAS.length).not.equal(0);
    expect(preset.MAX_RESULT.length).not.equal(0);
  });

  it("Should list all tokens for swap", async function () {
    const tokens = await swapService.getListTokens();
    expect(tokens.tokens.length).not.equal(0);
    const bnb = tokens.tokens.filter(e => e.symbol == "BNB");
    expect(bnb.length).eq(1);
    expect(bnb[0].address).is.not.empty;
    expect(bnb[0].logoURI).is.not.empty;
    expect(bnb[0].symbol).eq("BNB")
    expect(bnb[0].name).eq("BNB")
    expect(bnb[0].decimals).eq(18)
  });

  it("Should approve if needed", async function () {
    const BUSD_BSC = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
    const appAddress = await swapService.getApproveAddress();
    expect(appAddress.address).is.not.empty;
    const allowance = await swapService.getApproveAllowance(user.address, BUSD_BSC);
    expect(allowance.allowance).eq("0")
    service["decimals"].set(BUSD_BSC, 18);
    const approveTransaction = await swapService.getApproveRawTransaction(1000, BUSD_BSC);
    expect(approveTransaction.to).eq(BUSD_BSC);
    expect(+approveTransaction.gasPrice).gt(0);
    expect(approveTransaction.value).eq("0");
    expect(approveTransaction.data).is.not.empty;
    expect(approveTransaction.data.startsWith("0x")).is.true;
    const tmp = service.appService.tokenContract.interface.decodeFunctionData("approve", approveTransaction.data);
    expect(`${tmp.spender}`.toLowerCase()).eq(`${appAddress.address}`.toLowerCase());
    expect(tmp.value).equal(TestHelper.addPrecision(1000));
    const res = await swapService.makeApproveIfNeeded(1000, BUSD_BSC);
    expect(res!.allowance).equal("0")
  });

  it("Should get quotes", async function () {
    const tokens = await swapService.getListTokens();
    const from = tokens.tokens[0];
    const to = tokens.tokens[2];
    const quote = await swapService.getQuote({ amount: 10, fromTokenAddress: from, toTokenAddress: to })
    expect(quote.estimatedGas).gt(0);
    expect(quote.protocols.length).gt(0)
    expect(quote.fromTokenAmount).eq(TestHelper.addPrecision(10))
    expect(quote.toTokenAmount).not.eq(TestHelper.addPrecision(10))
    expect(quote.fromToken.decimals).eq(18)
    expect(quote.fromToken.symbol).eq("BNB")
    expect(quote.toToken.symbol).eq("CHI")
  });

  it("Should make swap", async function () {
    const tokens = await swapService.getListTokens();
    const from = tokens.tokens[0];
    const to = tokens.tokens[2];
    try {
      await swapService.getSwapTransaction({ amount: 10, fromTokenAddress: from, toTokenAddress: to, fromAddress: user.address, slippage: 1 })
    } catch (e) {
      expect((e as any).description).contain("insufficient funds for transfer")
    }
    try {
      await swapService.makeSwap({ amount: 10, fromTokenAddress: from, toTokenAddress: to, fromAddress: user.address, slippage: 1 })
    } catch (e) {
      expect((e as any).description).contain("insufficient funds for transfer")
    }
  });

  it("Should register for whitelist", async function () {
    const tmp = await service.registerForWhitelist(owner.address, 10, busdContract.address);
    expect(tmp.buyer).equal(owner.address);
    const tmp2 = await service.registerForWhitelist(user.address, 10, busdContract.address, owner.address);
    expect(tmp2.buyer).equal(user.address);
    expect(tmp2.sponsor).equal(owner.address);
    const count = await service.seeWhitelistCount();
    expect(count).equal(2);
    const whitelist = await service.seeWhitelist();
    expect(whitelist.length).equal(2);
    let whitelistLimit = await service.seeWhitelist(0,10);
    expect(whitelistLimit.length).equal(10);
    whitelistLimit = whitelistLimit.filter(e => e.buyer != ethers.constants.AddressZero);
    expect(whitelistLimit.length).equal(2);
    const check = await service.checkIfWhitelisted(user.address)
    expect(check.sponsor).equal(owner.address);
    const sponsor = await service.seeSponsorShip(owner.address);
    expect(sponsor.length).equal(1);
    const sponsorCount = await service.seeSponsorShipCount(owner.address);
    expect(sponsorCount).equal(1);
  });

  it("Should get all balances", async function () {
    //with quotes
  });

  it("Should get history of send", async function () {
  });

  it("Should get pending transaction", async function () {
  });


});

function beforeAll(arg0: () => Promise<void>) {
  throw new Error("Function not implemented.");
}
