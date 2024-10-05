import { Web3Network,IProviderOptionsExt,NetworkId } from "./web3/web3Api";

export interface AppConfig {
    moralis?:{
        server: string,
        appid: string
    },
    signer:{ type:"void" } | { type:"json", json:string } | { type:"signer",signer:string },
    nft:{
        collection?:string
        myContract: string
        nftStorageKey: string
    },
    token:{
        usdSymbol:string
        usdContract:string;
        nativeSymbol:string
        myContract : string;
        price?:string
        mySymbol: string
        myName: string
        myDecimals: number
        approveMax: number
    },
    sale:{
        myContract : string;
        fromTokenAddresses:string[];
    },
    staking:{
        percent: number
        periodCount: number
        period: "day"|"month" | "year"
        myContract : string;
    },
    swap:{
        chainId : number;
    },
    authenticate: {
        network?:NetworkId
        signMessage: string,
        encryptMessage: string,
        switchToNetwork: boolean,
        providerOptions?:IProviderOptionsExt,
        createNetworkIfNeeded?: Web3Network
    },
    social:{
        nameContract : string;
        adsContract : string;
        campaignContract : string;
    }
}