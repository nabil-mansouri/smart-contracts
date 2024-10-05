import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import {SaleContract, SocialAdsContractProxy, SocialCampaignContractProxy, SocialNameContractProxy} from "../typechain-types"
import {AppService} from "./appService";
import axios from "axios";
import { SocialNetworkEnum } from "./socialService";
type LoginInfos={
    login: string
    network:SocialNetworkEnum
    hash: string
}
export interface SignerService{
    socialAdsHash(sender:string, hash:string):Promise<string>;
    socialCampaignHash(sender:string, hash:string):Promise<string>;
    socialNameHash(sender:string, loginInfos:LoginInfos):Promise<string>;
    saleHashNative(sender:string, precision:BigNumber):Promise<string>;
    saleHashToken(sender:string, precision:BigNumber, tokenAddr:string):Promise<string>;
}

export class SignerServiceLocal implements SignerService{
    constructor(private appService:AppService, private signer:Signer){}
    
    async socialAdsHash(sender:string, hash:string):Promise<string>{
        const socialContract:SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        const toSign = await socialContract.prepareAdsSignature(sender, hash);
        return this.signer.signMessage(toSign);
    }

    async socialCampaignHash(sender:string, hash:string):Promise<string>{
        const socialContract:SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        const toSign = await socialContract.prepareSignatureCampaign(sender, hash);
        return this.signer.signMessage(toSign);
    }

    async socialNameHash(sender:string, loginInfos:LoginInfos):Promise<string>{
        const socialContract:SocialNameContractProxy = await this.appService.socialNameContractR();
        const hash = await socialContract.prepareSignature(sender, loginInfos.hash);
        return this.signer.signMessage(hash);
    }
    async saleHashNative(sender:string, precision:BigNumber):Promise<string>{
        const saleContract:SaleContract = await this.appService.saleContractR();
        const hash = await saleContract.hashNative(sender, precision);
        return this.signer.signMessage(hash);
    }
    async saleHashToken(sender:string, precision:BigNumber, tokenAddr:string):Promise<string>{
        const saleContract:SaleContract = this.appService.saleContract;
        const hash = await saleContract.hashToken(sender, precision, tokenAddr);
        return this.signer.signMessage(hash);
    }
    
}
export class SignerServiceRemoteJson implements SignerService{
    constructor(private appService:AppService, private jsonUrl:string){}
        
    async socialAdsHash(sender:string, hash:string):Promise<string>{
        const json = await axios.get(this.jsonUrl+"/ads");
        const key = ethers.utils.solidityKeccak256(['address', 'string'], [sender, hash]);
        return json.data[key];
    }

    async socialCampaignHash(sender:string, hash:string):Promise<string>{
        const json = await axios.get(this.jsonUrl+"/campaigns");
        const key = ethers.utils.solidityKeccak256(['address', 'string'], [sender, hash]);
        return json.data[key];
    }

    async socialNameHash(sender:string, loginInfos:LoginInfos):Promise<string>{
        const json = await axios.get(this.jsonUrl+"/names");
        const key = ethers.utils.solidityKeccak256(['address', 'bytes32'], [sender, loginInfos.hash]);
        return json.data[key];
    }
    async saleHashNative(sender:string, precision:BigNumber):Promise<string>{
        const json = await axios.get(this.jsonUrl+"/sale/native");
        const key = ethers.utils.solidityKeccak256([ "string", "string" ], [ sender, precision.toString() ]);
        return json.data[key];
    }
    async saleHashToken(sender:string, precision:BigNumber, tokenAddr:string):Promise<string>{
        const json = await axios.get(this.jsonUrl+"/sale/token");
        const key = ethers.utils.solidityKeccak256([ "string", "string", "string" ], [ sender, precision.toString(), tokenAddr ]);
        return json.data[key];
    }
    
}

export class SignerServiceRemoteVoid implements SignerService{
    constructor(){}
    async socialAdsHash(sender:string, hash:string):Promise<string>{
        const res = ethers.utils.solidityKeccak256(['address', 'string'], [sender, hash]);
        return res;
    }
    async socialCampaignHash(sender:string, hash:string):Promise<string>{
        const res = ethers.utils.solidityKeccak256(['address', 'string'], [sender, hash]);
        return res;
    }
    async socialNameHash(sender:string, loginInfos:LoginInfos):Promise<string>{
        const hash = ethers.utils.solidityKeccak256(['address', 'bytes32'], [sender, loginInfos.hash]);
        return hash;
    }
    async saleHashNative(sender:string, precision:BigNumber):Promise<string>{
        const hash = ethers.utils.solidityKeccak256(['address', 'uint256'], [sender, precision]);
        return hash;
    }
    async saleHashToken(sender:string, precision:BigNumber, tokenAddr:string):Promise<string>{
        const hash = ethers.utils.solidityKeccak256(['address', 'uint256', 'address'], [sender, precision, tokenAddr]);
        return hash;
    }
    
}