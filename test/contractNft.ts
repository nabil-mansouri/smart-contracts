//must be first (mock)
import { testHelper } from "./testHelper";
//import
import { expect } from "chai";
import "mocha";
import path from "path";
import { AppService } from "../src/appService";
import { NFTMarketPlace } from "typechain-types/NFTMarketPlace";
import { NFTContract } from "typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
//TODO nftService / nftContract
//TODO ihm : see nftschool tuto + see 1inch widget on github (animation, auto loggin....)
//TODO auth: metamask /  wallet connect / web3 (injected) / see all
//TODO decentralized launchpad
describe.skip("NFTContract", function () {
  let appService: AppService;
  let nftContract:NFTContract;
  let nftMarketContract:NFTMarketPlace;
  let user: SignerWithAddress,owner: SignerWithAddress
  const image = path.resolve(__dirname, "images/empty.jpg");
  before(async function () {
    [owner,,,,,,user] = await testHelper.signerPromise;
    const tokenContract = await testHelper.contractTokenPromise;
    nftContract = await testHelper.contractNFTPromise;
    nftMarketContract = await testHelper.contractNFTMarketPromise;
    const socialNameContract = await testHelper.contractSocialNamePromise(owner.address);
    const socialCampaignContract = await testHelper.contractSocialCampaignPromise(owner.address);
    const socialAdsContract = await testHelper.contractSocialAdsPromise(owner.address);
    const saleContract = await testHelper.saleContract([]);
    appService = new AppService({
      signerService: owner,
      web3Selector: testHelper.web3Selector,
      nftContract, tokenContract, saleContract,
      socialAdsContract,socialCampaignContract,socialNameContract
    });
  });
  it("Should allow marketplace to mint nft", async function () {
  })
  it("Should allow marketplace to batch mint nft", async function () {
  })
  it("Should allow only allowed users to mint on marketplace", async function () {
  })
  it("Should allow only allowed users to mint batch on marketplace", async function () {
  })
  it("Should allow marketplace to burn nft", async function () {
  })
  it("Should allow marketplace to burn batch nft", async function () {
  })
  it("Should allow only allowed users on marketplace to burn nft", async function () {
  })
  it("Should allow only allowed users on marketplace to burn batch nft", async function () {
  })
  it("Should list nft", async function () {
  })
  it("Should list nft by category", async function () {
  })
  it("Should list nft using pagination", async function () {
  })
  it("Should list and sort nft", async function () {
  })
  it("Should get nft data and metadata by id", async function () {
  })
  it("Should apply fee on mint", async function () {
  })
  it("Should apply fee on mint batch", async function () {
  })
  it("Should not allow mint if paused", async function () {
  })
  it("Should not allow mint batch if paused", async function () {
  })
  it("Should not allow burn if paused", async function () {
  })
  it("Should not allow burn batch if paused", async function () {
  })
  it("Should sell a nft without fees", async function () {
  })
  it("Should sell a nft with fees", async function () {
  })
  it("Should list my sold nft", async function () {
  })
  it("Should list my buyed nft", async function () {
  })
  it("Should list my nft on sale", async function () {
  })
  it("Should listen nft transfer", async function () {
  })
  it("Should listen nft mint", async function () {
    //NEED?
  })
  it("Should listen nft burn", async function () {
    //NEED?
  })
});
