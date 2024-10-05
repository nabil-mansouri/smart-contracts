// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, network } from "hardhat";
import { UnitUtils, DateUtils, PaymentType } from "../src/utils";
import * as confDev from "../config/conf.dev";

const SERVICE_FEE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_FEE"));
const SERVICE_DEPOSIT = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_DEPOSIT"));
const REGISTRATION_SERVICE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_REGISTRATION"))
const SERVICE_CAMPAIGN = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_CAMPAIGN"))
const SERVICE_ADS = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_ADS"))
const SERVICE_ADS_PROPS = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_ADS_PROPS"))

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  // We get the contract to deploy
  const Token = await ethers.getContractFactory("TokenContract");
  const Staking = await ethers.getContractFactory("StakingContract");
  const SaleContract = await ethers.getContractFactory("SaleContract");
  //const NFTContract = await ethers.getContractFactory("NFTContract");
  const SocialAdsContractImpl = await ethers.getContractFactory("SocialAdsContractImpl");
  const SocialAdsContractProxy = await ethers.getContractFactory("SocialAdsContractProxy");
  const SocialCampaignContractProxy = await ethers.getContractFactory("SocialCampaignContractProxy");
  const SocialCampaignContractImpl = await ethers.getContractFactory("SocialCampaignContractImpl");
  const SocialNameContractImpl = await ethers.getContractFactory("SocialNameContractImpl");
  const SocialNameContractProxy = await ethers.getContractFactory("SocialNameContractProxy");
  // per platform
  if (network.name == "localhost") {
    //token
    const supplyWithout = 10 ** 6;
    const token = await Token.deploy("TEST", "TEST", supplyWithout);
    await token.deployed();
    console.log("Token deployed to:", token.address);
    //staking
    const rewardPercent = 1;
    const rewardTotal = UnitUtils.addPrecision(1000);
    const startDate = DateUtils.now();
    const endDate = DateUtils.addDays(startDate, 10);
    const stakeConfig = {
      endDate,
      startDate,
      rewardTotal,
      tokenAddress: token.address,
      rewardPercent
    }
    const staking = await Staking.deploy(stakeConfig);
    await staking.deployed();
    console.log("Staking deployed to:", staking.address);
    //sale
    const tokenPerCoin = 500;//native is precision and token is precision
    const maxPerUser = UnitUtils.addPrecision(0);
    const saleConfig = {
      endDate,
      startDate,
      maxPerUser,
      tokenAddress: token.address,
      tokenPerCoin,
      tokenQuotes: [{
        quote: 10,
        token: "0xe9e7cea3dedca5984780bafc599bd69add087d56"
      }],
      validatorRequired: false,
      validator: ethers.constants.AddressZero
    };
    const sale = await SaleContract.deploy(saleConfig);
    await sale.deployed();
    console.log("Sale deployed to:", sale.address);
    //NFT
    //const nftContract = await NFTContract.deploy();
    //await nftContract.deployed();
    //console.log("NFT deployed to:", nftContract.address);
    //SOCIAL ADS LIB
    const socialAdsConfig = {
      tokenAddress: token.address,
      validator: ethers.constants.AddressZero,
      validatorRequire: false,
      libAddress: ethers.constants.AddressZero,
      deleteDefinitely: false,
      ads: {
        amount: UnitUtils.addPrecision(20),
        service: SERVICE_ADS,
        currency: token.address,
        paymentType: PaymentType.LOCK
      },
      proposition: {
        amount: UnitUtils.addPrecision(0),
        service: SERVICE_ADS_PROPS,
        currency: token.address,
        paymentType: PaymentType.LOCK
      }
    }
    const socialAdsLib = await SocialAdsContractImpl.deploy(socialAdsConfig);
    await socialAdsLib.deployed();
    console.log("SocialAdsLib deployed to:", socialAdsLib.address);
    //SOCIAL ADS PROXY
    socialAdsConfig.libAddress = socialAdsLib.address;
    const socialAds = await SocialAdsContractProxy.deploy(socialAdsConfig);
    await socialAds.deployed();
    console.log("SocialAdsProxy deployed to:", socialAds.address);
    //SOCIAL CAMPAIGN LIB
    const socialCampaignConfig = {
      tokenAddress: token.address,
      validator: ethers.constants.AddressZero,
      validatorRequire: false,
      libAddress: ethers.constants.AddressZero,
      deleteDefinitely: false,
      campaign: {
        amount: UnitUtils.addPrecision(15),
        service: SERVICE_CAMPAIGN,
        currency: token.address,
        paymentType: PaymentType.LOCK
      }
    }
    const socialCampaignLib = await SocialCampaignContractImpl.deploy(socialCampaignConfig);
    await socialCampaignLib.deployed();
    console.log("SOCIAL CAMPAIGN Lib deployed to:", socialCampaignLib.address);
    //SOCIAL CAMPAIGN PROXY
    socialCampaignConfig.libAddress = socialCampaignLib.address;
    const socialCampaign = await SocialCampaignContractProxy.deploy(socialCampaignConfig);
    await socialCampaign.deployed();
    console.log("SOCIAL CAMPAIGN deployed to:", socialCampaign.address);
    //SOCIAL NAME
    const socialNameConfig = {
      tokenAddress: token.address,
      validator: ethers.constants.AddressZero,
      validatorRequire: false,
      allowChangeOwner: true,
      libAddress: ethers.constants.AddressZero,
      fee: {
        amount: UnitUtils.addPrecision(1),
        service: SERVICE_FEE,
        currency: token.address,
        paymentType: PaymentType.PAY_PROPORTIONNAL
      },
      deposit: {
        amount: UnitUtils.addPrecision(1),
        service: SERVICE_DEPOSIT,
        currency: token.address,
        paymentType: PaymentType.PAY_PROPORTIONNAL
      },
      registration: {
        amount: UnitUtils.addPrecision(10),
        service: REGISTRATION_SERVICE,
        currency: token.address,
        paymentType: PaymentType.LOCK
      }
    }
    const socialNameLib = await SocialNameContractImpl.deploy(socialNameConfig);
    await socialNameLib.deployed();
    console.log("Social Name LIB deployed to:", socialNameLib.address);
    //SOCIAL NAME
    socialNameConfig.libAddress = socialNameLib.address;
    const socialName = await SocialNameContractProxy.deploy(socialNameConfig);
    await socialName.deployed();
    console.log("Social Name deployed to:", socialName.address);
    //SOCIAL VIEW
    //const socialView = await SocialViews.deploy({
    //  addressAds: socialAds.address,
    //  addressCampaign: socialCampaign.address
    //});
    //await socialView.deployed();
    //console.log("SOCIAL VIEW deployed to:", socialView.address);
    //CONFIG
    confDev.globalAppConfig.token.myContract = token.address;
    confDev.globalAppConfig.sale.myContract = sale.address;
    confDev.globalAppConfig.staking.myContract = staking.address;
    confDev.globalAppConfig.nft.myContract = ethers.constants.AddressZero //nftContract.address;
    confDev.globalAppConfig.social.nameContract = socialName.address;
    confDev.globalAppConfig.social.campaignContract = socialCampaign.address;
    confDev.globalAppConfig.social.adsContract = socialAds.address;
    //confDev.globalAppConfig.social.viewContract = socialView.address;
    console.log(JSON.stringify(confDev, null, 2))
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
