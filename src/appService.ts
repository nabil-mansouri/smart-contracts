import { BigNumber, BigNumberish, Contract, Signer, VoidSigner } from "ethers";
import { NFTService } from "./nftService";
import { AuthService } from "./authService";
import { SwapService } from "./swapService";
import { SignerService, SignerServiceLocal, SignerServiceRemoteJson, SignerServiceRemoteVoid } from "./signerService";
import { TokenService } from "./tokenService";
import { globalAppConfig } from "@config";
import { SocialViewsFactory, SocialViews, NFTContractFactory, SaleContract, SaleContractFactory, TokenContract, TokenContractFactory, StakingContractFactory, StakingContract, SocialNameContractProxy, SocialCampaignContractProxy, SocialAdsContractProxy, SocialAdsContractProxyFactory, SocialCampaignContractProxyFactory, SocialNameContractProxyFactory } from "typechain-types";
import { Web3Api, Web3Id as WEB3ID } from "./web3/web3Api";
import { AppConfig } from "./config";
import { UtilService } from "./utilService";
import { SocialService } from "./socialService";
import { MessageService } from "./messageService";

export {BigNumber};
export type Web3Id = WEB3ID;
export type AppServiceContracts = { 
    nftContract: Contract, 
    tokenContract: Contract, 
    saleContract: SaleContract, 
    stakeContract: StakingContract 
    socialNameContract: SocialNameContractProxy;
    socialCampaignContract: SocialCampaignContractProxy;
    socialAdsContract: SocialAdsContractProxy;
};
export type AppServiceOptions = Partial<AppServiceContracts> & {
    signerService?: SignerService | Signer,
    web3Selector: () => Promise<Web3Id>
};
export class AppService {
    public utilService = new UtilService(this);
    public nftService = new NFTService(this);
    public authService = new AuthService(this);
    public tokenService = new TokenService(this);
    public socialService = new SocialService(this);
    public messageService = new MessageService(this);
    public swapService = new SwapService(this);
    private contracts: AppServiceContracts;
    public readonly signerService: SignerService;
    constructor(options: AppServiceOptions) {
        const { nft, token, sale, staking, signer, social } = globalAppConfig;
        this.contracts = {
            socialAdsContract: options?.socialAdsContract || (new SocialAdsContractProxyFactory()).attach(social.adsContract),
            socialCampaignContract: options?.socialCampaignContract || (new SocialCampaignContractProxyFactory()).attach(social.campaignContract),
            socialNameContract: options?.socialNameContract || (new SocialNameContractProxyFactory()).attach(social.nameContract),
            saleContract: options?.saleContract || (new SaleContractFactory()).attach(sale.myContract),
            nftContract: options?.nftContract || (new NFTContractFactory()).attach(nft.myContract),
            tokenContract: options?.tokenContract || (new TokenContractFactory()).attach(token.myContract),
            stakeContract: options?.stakeContract || (new StakingContractFactory()).attach(staking.myContract),
        }
        if (options.signerService) {
            if (options.signerService instanceof Signer) {
                this.signerService = new SignerServiceLocal(this, options.signerService);
            } else {
                this.signerService = options.signerService;
            }
        } else {
            if (signer.type == "json") {
                this.signerService = new SignerServiceRemoteJson(this, signer.json);
            } else if (signer.type == "signer") {
                this.signerService = new SignerServiceLocal(this, new VoidSigner(signer.signer))
            } else {
                this.signerService = new SignerServiceRemoteVoid();
            }
        }
        Web3Api.web3ProviderSource = options.web3Selector;
    }

    public get nftContract() { return this.contracts.nftContract; }
    public get tokenContract(): TokenContract { return this.contracts.tokenContract as TokenContract; }
    public get socialNameContract(): SocialNameContractProxy { return this.contracts.socialNameContract as SocialNameContractProxy; }
    public get socialCampaignContract(): SocialCampaignContractProxy { return this.contracts.socialCampaignContract as SocialCampaignContractProxy; }
    public get socialAdsContract(): SocialAdsContractProxy { return this.contracts.socialAdsContract as SocialAdsContractProxy; }
    public get saleContract(): SaleContract { return this.contracts.saleContract as SaleContract; }
    public get stakeContract(): StakingContract { return this.contracts.stakeContract as StakingContract; }
    async tokenContractRW() {
        const signer = await this.authService.getSigner();
        return this.contracts.tokenContract.connect(signer) as TokenContract;
    }
    async saleContractRW() {
        const signer = await this.authService.getSigner();
        return this.contracts.saleContract.connect(signer) as SaleContract;
    }
    async stakeContractRW() {
        const signer = await this.authService.getSigner();
        return this.contracts.stakeContract.connect(signer) as StakingContract;
    }
    async socialCampaignContractRW() {
        const signer = await this.authService.getSigner();
        return this.contracts.socialCampaignContract.connect(signer) as SocialCampaignContractProxy;
    }
    async socialAdsContractRW() {
        const signer = await this.authService.getSigner();
        return this.contracts.socialAdsContract.connect(signer) as SocialAdsContractProxy;
    }
    async socialNameContractRW() {
        const signer = await this.authService.getSigner();
        return this.contracts.socialNameContract.connect(signer) as SocialNameContractProxy;
    }
    async tokenContractR() {
        const signer = await this.authService.getWallet();
        return this.contracts.tokenContract.connect(signer.provider) as TokenContract;
    }
    async saleContractR() {
        const signer = await this.authService.getWallet();
        return this.contracts.saleContract.connect(signer.provider) as SaleContract;
    }
    async stakeContractR() {
        const signer = await this.authService.getWallet();
        return this.contracts.stakeContract.connect(signer.provider) as StakingContract;
    }
    async socialCampaignContractR() {
        const signer = await this.authService.getWallet();
        return this.contracts.socialCampaignContract.connect(signer.provider) as SocialCampaignContractProxy;
    }
    async socialAdsContractR() {
        const signer = await this.authService.getWallet();
        return this.contracts.socialAdsContract.connect(signer.provider) as SocialAdsContractProxy;
    }
    async socialNameContractR():Promise<SocialNameContractProxy> {
        const signer = await this.authService.getWallet();
        return this.contracts.socialNameContract.connect(signer.provider) as SocialNameContractProxy;
    }
    getApproveLimitAmount(amount:BigNumberish):BigNumberish {
        return this.appConfig.token.approveMax && this.appConfig.token.approveMax > 0? this.appConfig.token.approveMax: amount;
    }
    getApproveLimitPrecision(amount:BigNumberish):BigNumberish {
        return this.utilService.addPrecision(this.getApproveLimitAmount(amount))
    }
    getApproveLimitFromPrecision(precision:BigNumberish):BigNumberish {
        return this.appConfig.token.approveMax && this.appConfig.token.approveMax > 0? this.utilService.addPrecision(this.appConfig.token.approveMax): precision;
    }
    public get appConfig() { return globalAppConfig as AppConfig }
    public get currentAddress() { return this.authService?.currentUserAddress; }
    public get isNode(): boolean { return typeof window === 'undefined'; }

}
export { SaleContract, TokenContract, StakingContract }