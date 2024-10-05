//must mock before
import 'mock-local-storage'
(global as any).window = {} as any;
(window as any).localStorage = global.localStorage;
global.XMLHttpRequest = require('xhr2');
(window as any).XMLHttpRequest = global.XMLHttpRequest;
global.btoa = require('btoa');
//load for ts-node
import 'tsconfig-paths/register';
//import
import { providers, Signer } from "ethers"
import { ethers, network } from 'hardhat';
import { NFTContract, SaleContract, SocialAdsContractImpl, SocialAdsContractProxy, SocialCampaignContractProxy, SocialCampaignContractImpl, SocialNameContractImpl,SocialNameContractProxy, StakingContract, TokenContract } from 'typechain-types';
import { NFTMarketPlace } from 'typechain-types/NFTMarketPlace';
import { UnitUtils, DateUtils, PaymentType } from "../src/utils";
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { Web3Id } from 'src/web3/web3Api';
import { SocialService } from 'src/socialService';


export class TestHelper {
    static snapshotId?: number;
    constructor(
        public SUPPLY = BigNumber.from(10).pow(6),
        public REWARD = BigNumber.from(10).pow(3)) {
    }
    public web3Selector: () => Promise<Web3Id> = async () => "injected";
    public static get PRECISION() {
        return UnitUtils.PRECISION;
    }

    private KEY = "iEdiICOysediWwyfZHfLA6Bf7ejJCSqp36R1eVkl";

    public contractTokenPromise = ethers.getContractFactory("TokenContract").then(async Contract => {
        const contract = await Contract.deploy("TEST", "TEST", this.SUPPLY);
        await contract.deployed();
        return contract as TokenContract;
    })
    /*
    public contractSociaViewPromise = async (socialAds?: SocialAdsContractProxy, socialCampaign?: SocialCampaignContract) => {
        const Contract = await ethers.getContractFactory("SocialViews")
        const config = {
            addressAds: socialAds ? socialAds.address : ethers.constants.AddressZero,
            addressCampaign: socialCampaign ? socialCampaign.address : ethers.constants.AddressZero
        }
        const contract = await Contract.deploy(config);
        await contract.deployed();
        return contract as SocialViews;
    }
    */


    public contractSocialNameLibPromise = async (validator: string) => {
        const token = await this.contractTokenPromise;
        const Contract = await ethers.getContractFactory("SocialNameContractImpl");
        const config = {
            tokenAddress: token.address,
            validator: validator,
            validatorRequire: true,
            allowChangeOwner: true,
            libAddress: ethers.constants.AddressZero,
            fee: {
                amount: TestHelper.addPrecision(0),
                service: SocialService.SERVICE_FEE,
                currency: token.address,
                paymentType: PaymentType.PAY
            },
            deposit: {
                amount: TestHelper.addPrecision(0),
                service: SocialService.SERVICE_DEPOSIT,
                currency: token.address,
                paymentType: PaymentType.PAY
            },
            registration: {
                amount: TestHelper.addPrecision(10),
                service: SocialService.REGISTRATION_SERVICE,
                currency: token.address,
                paymentType: PaymentType.LOCK
            }
        };
        const contract = await Contract.deploy(config);
        await contract.deployed();
        return (contract as SocialNameContractImpl);
    }

    public contractSocialNamePromise = async (validator: string) => {
        const lib = await this.contractSocialNameLibPromise(validator);
        const token = await this.contractTokenPromise;
        const Contract = await ethers.getContractFactory("SocialNameContractProxy");
        const config = {
            tokenAddress: token.address,
            validator: validator,
            validatorRequire: true,
            allowChangeOwner: true,
            libAddress: lib.address,
            fee: {
                amount: TestHelper.addPrecision(0),
                service: SocialService.SERVICE_FEE,
                currency: token.address,
                paymentType: PaymentType.PAY
            },
            deposit: {
                amount: TestHelper.addPrecision(0),
                service: SocialService.SERVICE_DEPOSIT,
                currency: token.address,
                paymentType: PaymentType.PAY
            },
            registration: {
                amount: TestHelper.addPrecision(10),
                service: SocialService.REGISTRATION_SERVICE,
                currency: token.address,
                paymentType: PaymentType.LOCK
            }
        };
        const contract = await Contract.deploy(config);
        await contract.deployed();
        return (contract as SocialNameContractProxy);
    }

    public contractSocialAdsLibPromise = async (validator: string) => {
        const token = await this.contractTokenPromise;
        const Contract = await ethers.getContractFactory("SocialAdsContractImpl");
        const config = {
            tokenAddress: token.address,
            validator: validator,
            validatorRequire: true,
            deleteDefinitely: true,
            libAddress: ethers.constants.AddressZero,
            ads: {
                amount: TestHelper.addPrecision(20),
                service: SocialService.SERVICE_ADS,
                currency: token.address,
                paymentType: PaymentType.LOCK
            },
            proposition: {
                amount: TestHelper.addPrecision(0),
                service: SocialService.SERVICE_ADS_PROPS,
                currency: token.address,
                paymentType: PaymentType.LOCK
            }
        };
        const contract = await Contract.deploy(config);
        await contract.deployed();
        return (contract as SocialAdsContractImpl);
    }
    public contractSocialAdsPromise = async (validator: string) => {
        const lib = await this.contractSocialAdsLibPromise(validator);
        const token = await this.contractTokenPromise;
        const Contract = await ethers.getContractFactory("SocialAdsContractProxy");
        const config = {
            libAddress:lib.address,
            deleteDefinitely:true,
            tokenAddress: token.address,
            validator: validator,
            validatorRequire: true,
            ads: {
                amount: TestHelper.addPrecision(20),
                service: SocialService.SERVICE_ADS,
                currency: token.address,
                paymentType: PaymentType.LOCK
            },
            proposition: {
                amount: TestHelper.addPrecision(0),
                service: SocialService.SERVICE_ADS_PROPS,
                currency: token.address,
                paymentType: PaymentType.LOCK
            }
        };
        const contract = await Contract.deploy(config);
        await contract.deployed();
        return (contract as SocialAdsContractProxy);
    }

    public contractSocialLibCampaignPromise = async (validator: string) => {
        const token = await this.contractTokenPromise;
        const Contract = await ethers.getContractFactory("SocialCampaignContractImpl");
        const config = {
            tokenAddress: token.address,
            validator: validator,
            validatorRequire: true,
            libAddress:ethers.constants.AddressZero,
            deleteDefinitely:true,
            campaign: {
                amount: TestHelper.addPrecision(15),
                service: SocialService.SERVICE_CAMPAIGN,
                currency: token.address,
                paymentType: PaymentType.LOCK
            }
        };
        const contract = await Contract.deploy(config);
        await contract.deployed();
        return (contract as SocialCampaignContractImpl);
    }

    public contractSocialCampaignPromise = async (validator: string) => {
        const lib = await this.contractSocialLibCampaignPromise(validator);
        const token = await this.contractTokenPromise;
        const Contract = await ethers.getContractFactory("SocialCampaignContractProxy");
        const config = {
            tokenAddress: token.address,
            validator: validator,
            validatorRequire: true,
            libAddress: lib.address,
            deleteDefinitely:true,
            campaign: {
                amount: TestHelper.addPrecision(15),
                service: SocialService.SERVICE_CAMPAIGN,
                currency: token.address,
                paymentType: PaymentType.LOCK
            }
        };
        const contract = await Contract.deploy(config);
        await contract.deployed();
        return (contract as SocialCampaignContractProxy);
    }

    public stakingPromise = this.contractTokenPromise.then(async token => {
        const Contract = await ethers.getContractFactory("StakingContract");
        const startDate = TestHelper.now();
        const endDate = TestHelper.addDays(startDate, 10);
        const config = {
            endDate,
            startDate,
            rewardTotal: this.REWARD.mul(UnitUtils.PRECISION),
            tokenAddress: token.address,
            rewardPercent: 1
        };
        const contract = await Contract.deploy(config);
        await contract.deployed();
        return (contract as StakingContract);
    })

    public saleContract = (tokens: Array<{ token: string, quote: number }>) => this.contractTokenPromise.then(async token => {
        const Contract = await ethers.getContractFactory("SaleContract");
        const startDate = TestHelper.now();
        const endDate = TestHelper.addDays(startDate, 10);
        const tokenPerCoin = 500; //native is precision and token is precision
        const maxPerUser = TestHelper.addPrecision(0);
        const config = {
            endDate,
            startDate,
            maxPerUser,
            tokenAddress: token.address,
            tokenPerCoin,
            tokenQuotes: tokens,
            validatorRequired: false,
            validator: "0x0000000000000000000000000000000000000000"
        };
        const contract = await Contract.deploy(config);
        await contract.deployed();
        return (contract as SaleContract);
    })

    public contractNFTPromise = ethers.getContractFactory("NFTContract").then(async Contract => {
        const contract = await Contract.deploy();
        await contract.deployed();
        return contract as NFTContract;
    })

    public contractNFTMarketPromise = ethers.getContractFactory("NFTMarketPlace").then(async Contract => {
        const contract = await Contract.deploy();
        await contract.deployed();
        return contract as NFTMarketPlace;
    })

    public signerPromise = ethers.getSigners();
    sign(address: string, data: string) {
        return network.provider.send(
            "eth_sign",
            [address, data]
        )
    }
    encodeAndSign(address: string, test: string) {
        const data = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(test))
        return network.provider.send(
            "eth_sign",
            [address, data]
        )
    }
    public async createToken(symbol: string): Promise<TokenContract> {
        const Contract = await ethers.getContractFactory("TokenContract");
        const contract = await Contract.deploy(symbol, symbol, this.SUPPLY);
        await contract.deployed();
        return contract as TokenContract;
    }

    static addPrecision(numb: BigNumberish): BigNumber {
        return UnitUtils.addPrecision(numb);
    }
    static removePrecision(numb: BigNumberish): number {
        return UnitUtils.removePrecision(numb);
    }
    static addMinutes(time: number, minutes: number) {
        return DateUtils.addMinutes(time, minutes);
    }

    static addHours(time: number, hours: number) {
        return DateUtils.addHours(time, hours);
    }

    static addDays(time: number, days: number) {
        return DateUtils.addDays(time, days);
    }

    static now() {
        return DateUtils.now();
    }

    static async setNextBlockTime(seconds: number): Promise<number> {
        await ethers.provider.send("evm_setNextBlockTimestamp", [seconds])
        const tmp = await ethers.provider.send("evm_mine", [])
        return tmp;
    }

    static async increaseHour(hours: number): Promise<number> {
        const seconds = (hours * 60 * 60);
        await ethers.provider.send("evm_increaseTime", [seconds])
        const tmp = await ethers.provider.send("evm_mine", []) // this one will have 02:00 PM as its timestamp
        return tmp;
    }

    static async increaseDay(days: number): Promise<number> {
        const seconds = (days * 60 * 60 * 24);
        await ethers.provider.send("evm_increaseTime", [seconds])
        const tmp = await ethers.provider.send("evm_mine", []) // this one will have 02:00 PM as its timestamp
        return tmp;
    }

    static async increaseTime(seconds: number): Promise<number> {
        await ethers.provider.send("evm_increaseTime", [seconds])
        const tmp = await ethers.provider.send("evm_mine", []) // this one will have 02:00 PM as its timestamp
        return tmp;
    }

    static async takeSnapshot() {
        TestHelper.snapshotId = await ethers.provider.send('evm_snapshot', [])
    }
    static async revertSnapshot() {
        if (typeof TestHelper.snapshotId == "undefined") {
            return;
        }
        const res = await ethers.provider.send('evm_revert', [TestHelper.snapshotId])
        TestHelper.snapshotId = undefined;
    }

    static _busd = false;
    static async ensureBusd(provider: providers.Web3Provider): Promise<void> {
        if (TestHelper._busd) return;
        TestHelper._busd = true;
        const deployer = '0xd2f93484f2d319194cba95c5171b18c1d8cfd6c4';
        const contractAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56';
        const contractCode = '0x60806040523480156200001157600080fd5b506000620000276001600160e01b036200014016565b600080546001600160a01b0319166001600160a01b0383169081178255604051929350917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a35060408051808201909152600a80825269212aa9a2102a37b5b2b760b11b6020909201918252620000a49160069162000145565b5060408051808201909152600480825263109554d160e21b6020909201918252620000d29160059162000145565b506004805460ff191660121790556a19a4815e0ad0c67f0000006003819055336000818152600160209081526040808320859055805194855251929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a3620001e7565b335b90565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200018857805160ff1916838001178555620001b8565b82800160010185558215620001b8579182015b82811115620001b85782518255916020019190600101906200019b565b50620001c6929150620001ca565b5090565b6200014291905b80821115620001c65760008155600101620001d1565b61113d80620001f76000396000f3fe608060405234801561001057600080fd5b506004361061012c5760003560e01c8063893d20e8116100ad578063a9059cbb11610071578063a9059cbb1461035a578063b09f126614610386578063d28d88521461038e578063dd62ed3e14610396578063f2fde38b146103c45761012c565b8063893d20e8146102dd5780638da5cb5b1461030157806395d89b4114610309578063a0712d6814610311578063a457c2d71461032e5761012c565b806332424aa3116100f457806332424aa31461025c578063395093511461026457806342966c681461029057806370a08231146102ad578063715018a6146102d35761012c565b806306fdde0314610131578063095ea7b3146101ae57806318160ddd146101ee57806323b872dd14610208578063313ce5671461023e575b600080fd5b6101396103ea565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561017357818101518382015260200161015b565b50505050905090810190601f1680156101a05780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101da600480360360408110156101c457600080fd5b506001600160a01b038135169060200135610480565b604080519115158252519081900360200190f35b6101f661049d565b60408051918252519081900360200190f35b6101da6004803603606081101561021e57600080fd5b506001600160a01b038135811691602081013590911690604001356104a3565b610246610530565b6040805160ff9092168252519081900360200190f35b610246610539565b6101da6004803603604081101561027a57600080fd5b506001600160a01b038135169060200135610542565b6101da600480360360208110156102a657600080fd5b5035610596565b6101f6600480360360208110156102c357600080fd5b50356001600160a01b03166105b1565b6102db6105cc565b005b6102e5610680565b604080516001600160a01b039092168252519081900360200190f35b6102e561068f565b61013961069e565b6101da6004803603602081101561032757600080fd5b50356106ff565b6101da6004803603604081101561034457600080fd5b506001600160a01b03813516906020013561077c565b6101da6004803603604081101561037057600080fd5b506001600160a01b0381351690602001356107ea565b6101396107fe565b61013961088c565b6101f6600480360360408110156103ac57600080fd5b506001600160a01b03813581169160200135166108e7565b6102db600480360360208110156103da57600080fd5b50356001600160a01b0316610912565b60068054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156104765780601f1061044b57610100808354040283529160200191610476565b820191906000526020600020905b81548152906001019060200180831161045957829003601f168201915b5050505050905090565b600061049461048d610988565b848461098c565b50600192915050565b60035490565b60006104b0848484610a78565b610526846104bc610988565b6105218560405180606001604052806028815260200161100e602891396001600160a01b038a166000908152600260205260408120906104fa610988565b6001600160a01b03168152602081019190915260400160002054919063ffffffff610bd616565b61098c565b5060019392505050565b60045460ff1690565b60045460ff1681565b600061049461054f610988565b846105218560026000610560610988565b6001600160a01b03908116825260208083019390935260409182016000908120918c16815292529020549063ffffffff610c6d16565b60006105a96105a3610988565b83610cce565b506001919050565b6001600160a01b031660009081526001602052604090205490565b6105d4610988565b6000546001600160a01b03908116911614610636576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b600080546040516001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3600080546001600160a01b0319169055565b600061068a61068f565b905090565b6000546001600160a01b031690565b60058054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156104765780601f1061044b57610100808354040283529160200191610476565b6000610709610988565b6000546001600160a01b0390811691161461076b576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b6105a9610776610988565b83610dca565b6000610494610789610988565b846105218560405180606001604052806025815260200161107f60259139600260006107b3610988565b6001600160a01b03908116825260208083019390935260409182016000908120918d1681529252902054919063ffffffff610bd616565b60006104946107f7610988565b8484610a78565b6005805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156108845780601f1061085957610100808354040283529160200191610884565b820191906000526020600020905b81548152906001019060200180831161086757829003601f168201915b505050505081565b6006805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156108845780601f1061085957610100808354040283529160200191610884565b6001600160a01b03918216600090815260026020908152604080832093909416825291909152205490565b61091a610988565b6000546001600160a01b0390811691161461097c576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b61098581610ebc565b50565b3390565b6001600160a01b0383166109d15760405162461bcd60e51b8152600401808060200182810382526024815260200180610fc46024913960400191505060405180910390fd5b6001600160a01b038216610a165760405162461bcd60e51b81526004018080602001828103825260228152602001806110e76022913960400191505060405180910390fd5b6001600160a01b03808416600081815260026020908152604080832094871680845294825291829020859055815185815291517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259281900390910190a3505050565b6001600160a01b038316610abd5760405162461bcd60e51b8152600401808060200182810382526025815260200180610f9f6025913960400191505060405180910390fd5b6001600160a01b038216610b025760405162461bcd60e51b815260040180806020018281038252602381526020018061105c6023913960400191505060405180910390fd5b610b4581604051806060016040528060268152602001611036602691396001600160a01b038616600090815260016020526040902054919063ffffffff610bd616565b6001600160a01b038085166000908152600160205260408082209390935590841681522054610b7a908263ffffffff610c6d16565b6001600160a01b0380841660008181526001602090815260409182902094909455805185815290519193928716927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a3505050565b60008184841115610c655760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b83811015610c2a578181015183820152602001610c12565b50505050905090810190601f168015610c575780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b505050900390565b600082820183811015610cc7576040805162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b9392505050565b6001600160a01b038216610d135760405162461bcd60e51b81526004018080602001828103825260218152602001806110a46021913960400191505060405180910390fd5b610d56816040518060600160405280602281526020016110c5602291396001600160a01b038516600090815260016020526040902054919063ffffffff610bd616565b6001600160a01b038316600090815260016020526040902055600354610d82908263ffffffff610f5c16565b6003556040805182815290516000916001600160a01b038516917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9181900360200190a35050565b6001600160a01b038216610e25576040805162461bcd60e51b815260206004820152601f60248201527f42455032303a206d696e7420746f20746865207a65726f206164647265737300604482015290519081900360640190fd5b600354610e38908263ffffffff610c6d16565b6003556001600160a01b038216600090815260016020526040902054610e64908263ffffffff610c6d16565b6001600160a01b03831660008181526001602090815260408083209490945583518581529351929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35050565b6001600160a01b038116610f015760405162461bcd60e51b8152600401808060200182810382526026815260200180610fe86026913960400191505060405180910390fd5b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b0319166001600160a01b0392909216919091179055565b6000610cc783836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250610bd656fe42455032303a207472616e736665722066726f6d20746865207a65726f206164647265737342455032303a20617070726f76652066726f6d20746865207a65726f20616464726573734f776e61626c653a206e6577206f776e657220697320746865207a65726f206164647265737342455032303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636542455032303a207472616e7366657220616d6f756e7420657863656564732062616c616e636542455032303a207472616e7366657220746f20746865207a65726f206164647265737342455032303a2064656372656173656420616c6c6f77616e63652062656c6f77207a65726f42455032303a206275726e2066726f6d20746865207a65726f206164647265737342455032303a206275726e20616d6f756e7420657863656564732062616c616e636542455032303a20617070726f766520746f20746865207a65726f2061646472657373a265627a7a7231582071e0c183217ae3e9a1406ae7b58c2f36e09f2b16b10e19d46ceb821f3ee6abad64736f6c63430005100032';
        const code = await provider.send('eth_getCode', [contractAddress, 'latest']);
        if (code === '0x') {
            const [from] = await provider.send('eth_accounts', []);
            const tx = await provider.send('eth_sendTransaction', [{
                from,
                to: deployer,
                value: '0x11c37937e080000',
            }])
            await provider.send('eth_sendRawTransaction', [contractCode]);
            console.log('BUSD registry successfully deployed');
        }
    }

    public fixSigner(signer: Signer): Signer {
        signer.signMessage = async (data: string) => {
            const address = await signer.getAddress();
            return network.provider.send(
                "eth_sign",
                [address, data]
            )
        }
        return signer;
    }

    public async resetBlockchain() {
        const res = await network.provider.request({
            method: "hardhat_reset",
            params: [],
        });
        await this.resetERC1820();
        return res;
    }

    public async resetERC1820() {
        const provider = network.provider;
        const ERC1820_ADDRESS = '0x1820a4b7618bde71dce8cdc73aab6c95905fad24';
        const ERC1820_DEPLOYER = '0xa990077c3205cbDf861e17Fa532eeB069cE9fF96';
        const ERC1820_PAYLOAD = '0xf90a388085174876e800830c35008080b909e5608060405234801561001057600080fd5b506109c5806100206000396000f3fe608060405234801561001057600080fd5b50600436106100a5576000357c010000000000000000000000000000000000000000000000000000000090048063a41e7d5111610078578063a41e7d51146101d4578063aabbb8ca1461020a578063b705676514610236578063f712f3e814610280576100a5565b806329965a1d146100aa5780633d584063146100e25780635df8122f1461012457806365ba36c114610152575b600080fd5b6100e0600480360360608110156100c057600080fd5b50600160a060020a038135811691602081013591604090910135166102b6565b005b610108600480360360208110156100f857600080fd5b5035600160a060020a0316610570565b60408051600160a060020a039092168252519081900360200190f35b6100e06004803603604081101561013a57600080fd5b50600160a060020a03813581169160200135166105bc565b6101c26004803603602081101561016857600080fd5b81019060208101813564010000000081111561018357600080fd5b82018360208201111561019557600080fd5b803590602001918460018302840111640100000000831117156101b757600080fd5b5090925090506106b3565b60408051918252519081900360200190f35b6100e0600480360360408110156101ea57600080fd5b508035600160a060020a03169060200135600160e060020a0319166106ee565b6101086004803603604081101561022057600080fd5b50600160a060020a038135169060200135610778565b61026c6004803603604081101561024c57600080fd5b508035600160a060020a03169060200135600160e060020a0319166107ef565b604080519115158252519081900360200190f35b61026c6004803603604081101561029657600080fd5b508035600160a060020a03169060200135600160e060020a0319166108aa565b6000600160a060020a038416156102cd57836102cf565b335b9050336102db82610570565b600160a060020a031614610339576040805160e560020a62461bcd02815260206004820152600f60248201527f4e6f7420746865206d616e616765720000000000000000000000000000000000604482015290519081900360640190fd5b6103428361092a565b15610397576040805160e560020a62461bcd02815260206004820152601a60248201527f4d757374206e6f7420626520616e204552433136352068617368000000000000604482015290519081900360640190fd5b600160a060020a038216158015906103b85750600160a060020a0382163314155b156104ff5760405160200180807f455243313832305f4143434550545f4d4147494300000000000000000000000081525060140190506040516020818303038152906040528051906020012082600160a060020a031663249cb3fa85846040518363ffffffff167c01000000000000000000000000000000000000000000000000000000000281526004018083815260200182600160a060020a0316600160a060020a031681526020019250505060206040518083038186803b15801561047e57600080fd5b505afa158015610492573d6000803e3d6000fd5b505050506040513d60208110156104a857600080fd5b5051146104ff576040805160e560020a62461bcd02815260206004820181905260248201527f446f6573206e6f7420696d706c656d656e742074686520696e74657266616365604482015290519081900360640190fd5b600160a060020a03818116600081815260208181526040808320888452909152808220805473ffffffffffffffffffffffffffffffffffffffff19169487169485179055518692917f93baa6efbd2244243bfee6ce4cfdd1d04fc4c0e9a786abd3a41313bd352db15391a450505050565b600160a060020a03818116600090815260016020526040812054909116151561059a5750806105b7565b50600160a060020a03808216600090815260016020526040902054165b919050565b336105c683610570565b600160a060020a031614610624576040805160e560020a62461bcd02815260206004820152600f60248201527f4e6f7420746865206d616e616765720000000000000000000000000000000000604482015290519081900360640190fd5b81600160a060020a031681600160a060020a0316146106435780610646565b60005b600160a060020a03838116600081815260016020526040808220805473ffffffffffffffffffffffffffffffffffffffff19169585169590951790945592519184169290917f605c2dbf762e5f7d60a546d42e7205dcb1b011ebc62a61736a57c9089d3a43509190a35050565b600082826040516020018083838082843780830192505050925050506040516020818303038152906040528051906020012090505b92915050565b6106f882826107ef565b610703576000610705565b815b600160a060020a03928316600081815260208181526040808320600160e060020a031996909616808452958252808320805473ffffffffffffffffffffffffffffffffffffffff19169590971694909417909555908152600284528181209281529190925220805460ff19166001179055565b600080600160a060020a038416156107905783610792565b335b905061079d8361092a565b156107c357826107ad82826108aa565b6107b85760006107ba565b815b925050506106e8565b600160a060020a0390811660009081526020818152604080832086845290915290205416905092915050565b6000808061081d857f01ffc9a70000000000000000000000000000000000000000000000000000000061094c565b909250905081158061082d575080155b1561083d576000925050506106e8565b61084f85600160e060020a031961094c565b909250905081158061086057508015155b15610870576000925050506106e8565b61087a858561094c565b909250905060018214801561088f5750806001145b1561089f576001925050506106e8565b506000949350505050565b600160a060020a0382166000908152600260209081526040808320600160e060020a03198516845290915281205460ff1615156108f2576108eb83836107ef565b90506106e8565b50600160a060020a03808316600081815260208181526040808320600160e060020a0319871684529091529020549091161492915050565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff161590565b6040517f01ffc9a7000000000000000000000000000000000000000000000000000000008082526004820183905260009182919060208160248189617530fa90519096909550935050505056fea165627a7a72305820377f4a2d4301ede9949f163f319021a6e9c687c292a5e2b2c4734c126b524e6c00291ba01820182018201820182018201820182018201820182018201820182018201820a01820182018201820182018201820182018201820182018201820182018201820';
        const code = await provider.send('eth_getCode', [ERC1820_ADDRESS, 'latest']);
        if (code === '0x') {
            const [from] = await provider.send('eth_accounts');
            const tx = await provider.send('eth_sendTransaction', [{
                from,
                to: ERC1820_DEPLOYER,
                value: '0x11c37937e080000',
            }]);
            await provider.send('eth_sendRawTransaction', [ERC1820_PAYLOAD]);
        }
    }
    /*
        async destroyNft() {
            const query = new Moralis.Query(NFTData)
            const res = await query.find();
            Moralis.CoreManager.set("MASTER_KEY", this.KEY);
            for (const a of res) {
                const f1 = a.get("metadata").uri as Moralis.File;
                const f2 = a.get("metadata").metaUri as Moralis.File;
                await f1.destroy();
                await f2.destroy();
                await a.destroy();
            }
            Moralis.CoreManager.set("MASTER_KEY", "");
        }
        */
}
export const testHelper = new TestHelper();