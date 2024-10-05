import { BigNumber, BigNumberish, BytesLike, ethers } from "ethers";
import { SocialAdsContractProxy, SocialCampaignContractProxy, SocialNameContractProxy, TokenContract } from "../typechain-types";
import { AppService } from "./appService";
import { appErrors } from "./errors";
import { Lifecycle, TriState, UnitUtils, PaymentType } from "./utils";
export {PaymentType, TriState, Lifecycle}
export type SocialNetworkAction = "like" | "follow" | "retweet" | "tweet" | "join" | "share";
export type SocialNetworkType = "address" | "twitter" | "facebook" | "telegram" | "instagram" | "mail" | "phone";
export type SocialAudiences = "gener-male" | "gender-female" |
    "age-newborn" | "age-infant" | "age-toddler" | "age-kids" | "age-teenager" | "age-adult" |
    "parental-child" | "parental-nochild" |
    "relation-married" | "relation-alone";
export type SocialDurationPeriod = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";
export enum SocialActionEnum {
    like = 1,
    follow = 2,
    retweet = 3,
    tweet = 4,
    join = 5,
    share = 6
}
export enum SocialNetworkEnum {
    address = 1,
    twitter = 2,
    facebook = 3,
    telegram = 4,
    instagram = 5,
    mail = 6,
    phone = 7
}
export enum SocialDurationPeriodEnum {
    second = 1,
    minute = 2,
    hour = 3,
    day = 4,
    week = 5,
    month = 6,
    year = 7
}

export enum SocialAudiencesEnum {
    generMale = "generMale",
    genderFemale = "genderFemale",
    ageNewborn = "ageNewborn",
    ageInfant = "ageInfant",
    ageToddler = "ageToddler",
    ageKids = "ageKids",
    ageTeenager = "ageTeenager",
    ageAdult = "ageAdult",
    parentalChild = "parentalChild",
    parentalNochild = "parentalNochild",
    relationMarried = "relationMarried",
    relationAlone = "relationAlone"
}


export class SocialService {
    static SERVICE_FEE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_FEE"));
    static SERVICE_DEPOSIT = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_DEPOSIT"));

    static signMethod: (text: string) => Promise<string>;
    static REGISTRATION_SERVICE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_REGISTRATION"))
    static SERVICE_CAMPAIGN = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_CAMPAIGN"))
    static SERVICE_ADS_PROPS = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_ADS_PROPS"))
    static SERVICE_ADS = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SERVICE_ADS"))
    
    constructor(private appService: AppService) { }
    static socialNewtoworkToEnum(type: SocialNetworkType): SocialNetworkEnum {
        switch (type) {
            case "address":
                return SocialNetworkEnum.address;
            case "facebook":
                return SocialNetworkEnum.facebook;
            case "instagram":
                return SocialNetworkEnum.instagram;
            case "mail":
                return SocialNetworkEnum.mail;
            case "phone":
                return SocialNetworkEnum.phone;
            case "telegram":
                return SocialNetworkEnum.telegram;
            case "twitter":
                return SocialNetworkEnum.twitter;
        }
    }
    static socialNewtoworkFromEnum(type: SocialNetworkEnum): SocialNetworkType {
        switch (type) {
            case SocialNetworkEnum.address:
                return "address"
            case SocialNetworkEnum.facebook:
                return "facebook"
            case SocialNetworkEnum.instagram:
                return "instagram"
            case SocialNetworkEnum.mail:
                return "mail"
            case SocialNetworkEnum.phone:
                return "phone"
            case SocialNetworkEnum.telegram:
                return "telegram"
            case SocialNetworkEnum.twitter:
                return "twitter";
        }
    }
    static socialActionFromEnum(type: SocialActionEnum, network?:SocialNetworkType): SocialNetworkAction {
        switch (type) {
            case SocialActionEnum.follow:
                return "follow"
            case SocialActionEnum.join:
                return "join"
            case SocialActionEnum.like:
                return "like"
            case SocialActionEnum.retweet:
                return "retweet"
            case SocialActionEnum.share:
                return "share"
            case SocialActionEnum.tweet:
                return "tweet";
        }
    }
    static socialActionToEnum(type: SocialNetworkAction): SocialActionEnum {
        switch (type) {
            case "follow":
                return SocialActionEnum.follow;
            case "join":
                return SocialActionEnum.join;
            case "like":
                return SocialActionEnum.like;
            case "retweet":
                return SocialActionEnum.retweet;
            case "tweet":
                return SocialActionEnum.tweet;
            case "share":
                return SocialActionEnum.share;
        }
    }
    static socialPeriodToEnum(type: SocialDurationPeriod): SocialDurationPeriodEnum {
        switch (type) {
            case "day":
                return SocialDurationPeriodEnum.day;
            case "hour":
                return SocialDurationPeriodEnum.hour;
            case "minute":
                return SocialDurationPeriodEnum.minute;
            case "month":
                return SocialDurationPeriodEnum.month;
            case "second":
                return SocialDurationPeriodEnum.second;
            case "week":
                return SocialDurationPeriodEnum.week;
            case "year":
                return SocialDurationPeriodEnum.year;
        }
    }
    static socialPeriodFromEnum(type: SocialDurationPeriodEnum): SocialDurationPeriod {
        switch (type) {
            case SocialDurationPeriodEnum.day:
                return "day"
            case SocialDurationPeriodEnum.hour:
                return "hour"
            case SocialDurationPeriodEnum.minute:
                return "minute"
            case SocialDurationPeriodEnum.month:
                return "month"
            case SocialDurationPeriodEnum.second:
                return "second"
            case SocialDurationPeriodEnum.week:
                return "week";
            case SocialDurationPeriodEnum.year:
                return "year";
        }
    }
    getSocialLoginHash(type: SocialNetworkType, login: string) {
        const key = this.getSocialLoginKey(type, login);
        const keyBytes = ethers.utils.toUtf8Bytes(key);
        return ethers.utils.keccak256(keyBytes);
    }
    getSocialLoginKey(type: SocialNetworkType, login: string) {
        return `${SocialService.socialNewtoworkToEnum(type)}::${login}`;
    }

    async socialNameConfig() {
        const contract: SocialNameContractProxy = await this.appService.socialNameContractR();
        return contract.socialConfig();
    }

    async setSocialNameConfig(config: SocialNameConfig) {
        const contract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        await (await contract.setConfig(config)).wait();
    }

    private async listRegistrationFix(list: Promise<SocialNameRegistration[]>, decrypt = true): Promise<SocialNameRegistration[]> {
        if (!decrypt) {
            return list;
        }
        const tmp = await list;
        const wallet = await this.appService.authService.getWallet()
        const res: SocialNameRegistration[] = [];
        for (const t of tmp) {
            const copy = { ...t };
            const ut8 = ethers.utils.toUtf8String(t.encryptName)
            copy.encryptName = (await wallet.decryptLegacy(ut8, SocialService.signMethod));
            res.push(copy);
        }
        return res;
    }

    async getRegistrationForAddress(address: string, decrypt = true) {
        const contract: SocialNameContractProxy = await this.appService.socialNameContractR();
        return this.listRegistrationFix(contract.seeRegistration(address), decrypt);
    }

    async getRegistrationIdForLogin(network: SocialNetworkType, login: string) {
        const key = this.getSocialLoginHash(network, login);
        const contract: SocialNameContractProxy = await this.appService.socialNameContractR();
        const registrationId = await contract.registrationsByName(key);
        return registrationId;
    }

    async checkIfRegistrationExists(network: SocialNetworkType, login: string) {
        const id = await this.getRegistrationIdForLogin(network, login);
        return id.gt(0);
    }

    async getNamePrice() {
        const socialCampContract: SocialNameContractProxy = await this.appService.socialNameContractR();
        const pricePromise = await socialCampContract.getPrice(SocialService.REGISTRATION_SERVICE)
        return pricePromise;
    }

    async claimAllPayment(networkType: SocialNetworkType, login: string) {
        const hash = this.getSocialLoginHash(networkType, login);
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        await socialNameContract.claimAll(hash);
    }

    async claimOnePayment(networkType: SocialNetworkType, login: string, idPayment:BigNumberish) {
        const hash = this.getSocialLoginHash(networkType, login);
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        await socialNameContract.claimOne(hash,idPayment);
    }

    async cancelOnePayment(idPayment:BigNumberish) {
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        await socialNameContract.cancelOne(idPayment);
    }

    async listPaymentSent(claimed:TriState) {
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        const sent = await socialNameContract.listPaymentSendForMe(claimed)
        return sent;
    }

    async listPaymentSentFor(claimed:TriState, address:string) {
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        const sent = await socialNameContract.listPaymentSendForAddress(address,claimed)
        return sent.filter(e=>e.id.gt(0));
    }

    async listPaymentReceived(claimed:TriState) {
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        const sent = await socialNameContract.listPaymentReceivedForMe(claimed)
        return sent.flatMap(sub=>sub).filter(e=>e.id.gt(0));
    }

    async listPaymentReceivedForHash(networkType: SocialNetworkType, login: string, claimed:TriState) {
        const hash = this.getSocialLoginHash(networkType, login);
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        const sent = await socialNameContract.listPaymentReceivedForHash(hash, claimed)
        return sent.filter(e=>e.id.gt(0));
    }
    
    async registerName(networkType: SocialNetworkType, login: string) {
        const network = SocialService.socialNewtoworkToEnum(networkType)
        const hash = this.getSocialLoginHash(networkType, login);
        const userPromise = this.appService.authService.getUser()
        const walletPromise = this.appService.authService.getWallet()
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractR();
        const tokenContract: TokenContract = await this.appService.tokenContractRW();
        const user = await userPromise;
        const wallet = await walletPromise;
        const pricePromise = socialNameContract.getPrice(SocialService.REGISTRATION_SERVICE)
        const signature = await this.appService.signerService.socialNameHash(user.address, { hash, login, network });
        const encryptName = ethers.utils.toUtf8Bytes(await wallet.encryptLegacy(login, undefined, SocialService.signMethod));
        const userData = await socialNameContract.generateUserData({
            encryptName,
            id: 0,
            name: hash,
            network,
            owner: ethers.constants.AddressZero,
            signature
        })
        const price = await pricePromise;
        await (await tokenContract.send(socialNameContract.address, price.amount, userData)).wait();
    }

    async registerNameEstimate(networkType: SocialNetworkType, login: string) {
        const network = SocialService.socialNewtoworkToEnum(networkType)
        const hash = this.getSocialLoginHash(networkType, login);
        const userPromise = this.appService.authService.getUser()
        const walletPromise = this.appService.authService.getWallet()
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractR();
        const tokenContract: TokenContract = await this.appService.tokenContractR();
        const user = await userPromise;
        const wallet = await walletPromise;
        const pricePromise = socialNameContract.getPrice(SocialService.REGISTRATION_SERVICE)
        const signature = await this.appService.signerService.socialNameHash(user.address, { hash, login, network });
        const encryptName = ethers.utils.toUtf8Bytes(await wallet.encryptLegacy(login, undefined, SocialService.signMethod));
        const userData = await socialNameContract.generateUserData({
            id: 0,
            encryptName,
            name: hash,
            network,
            owner: ethers.constants.AddressZero,
            signature,
        })
        const price = await pricePromise;
        return (await tokenContract.estimateGas.send(socialNameContract.address, price.amount, userData));
    }

    async unregister(network: SocialNetworkType, login: string) {
        const id = await this.getRegistrationIdForLogin(network, login);
        if (!(id && id.gt(0))) {
            appErrors.socialNameNotFound()
        }
        await this.unregisterById(id);
    }

    async unregisterById(id: BigNumberish) {
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        await (await socialNameContract.unregister(id)).wait();
    }

    async unregisterEstimate(network: SocialNetworkType, login: string) {
        const id = await this.getRegistrationIdForLogin(network, login);
        if (!(id && id.gt(0))) {
            appErrors.socialNameNotFound()
        }
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractR();
        return (await socialNameContract.estimateGas.unregister(id));
    }

    async deleteRegistration(network: SocialNetworkType, login: string) {
        const hash = this.getSocialLoginHash(network, login);
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        await (await socialNameContract.deleteRegistration(hash)).wait();
    }

    async updateRegistrationById(id: BigNumberish, payload: { newNetwork: SocialNetworkType, newLogin: string, newOwner: string }) {
        const { newLogin, newNetwork, newOwner } = payload;
        const network = SocialService.socialNewtoworkToEnum(newNetwork)
        const hash = this.getSocialLoginHash(newNetwork, newLogin);
        const walletPromise = this.appService.authService.getWallet()
        const user = await this.appService.authService.getUser()
        const signature = await this.appService.signerService.socialNameHash(user.address, { hash, login: newLogin, network });
        const wallet = await walletPromise;
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        const encryptName = ethers.utils.toUtf8Bytes(await wallet.encryptLegacy(newLogin, undefined, SocialService.signMethod));
        await (await socialNameContract.updateRegistration(id, newOwner, hash, encryptName, signature)).wait();
    }

    async updateRegistrationByIdEstimate(id: BigNumberish, payload: { newNetwork: SocialNetworkType, newLogin: string, newOwner: string }) {
        const { newLogin, newNetwork, newOwner } = payload;
        const network = SocialService.socialNewtoworkToEnum(newNetwork)
        const hash = this.getSocialLoginHash(newNetwork, newLogin);
        const walletPromise = this.appService.authService.getWallet()
        const user = await this.appService.authService.getUser()
        const signature = await this.appService.signerService.socialNameHash(user.address, { hash, login: newLogin, network });
        const wallet = await walletPromise;
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractR();
        const encryptName = ethers.utils.toUtf8Bytes(await wallet.encryptLegacy(newLogin, undefined, SocialService.signMethod));
        return (await socialNameContract.estimateGas.updateRegistration(id, newOwner, hash, encryptName, signature));
    }

    async applyFeesAndApprove(amount: BigNumberish, currency: string, withFee: boolean, serviceId: string):Promise<ComputedFees>{
        const fees = await this.applyFees(amount, currency, withFee, serviceId);
        const signer = await this.appService.authService.getSigner();
        const user = await this.appService.authService.getUser();
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        const promises = Array.from( fees.approve.entries()).map(async entry=>{
            const toApprove = this.appService.utilService.toBigNumber(entry[1]);
            const fromContract = await this.appService.tokenService.getERC20(entry[0]);
            const allowed = await fromContract.allowance(user.address, socialNameContract.address);
            if (toApprove.gt(allowed)) {
                const approveAmount = this.appService.getApproveLimitFromPrecision(toApprove);
                await (await fromContract.connect(signer).approve(socialNameContract.address, approveAmount)).wait();
            }
        })
        await Promise.all(promises);
        return fees;
    }

    async applyFeesAndApproveEstimate(amount: BigNumberish, currency: string, withFee: boolean, serviceId: string):Promise<BigNumber>{
        const fees = await this.applyFees(amount, currency, withFee, serviceId);
        const signer = await this.appService.authService.getSigner();
        const user = await this.appService.authService.getUser();
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        const promises = Array.from( fees.approve.entries()).map(async entry=>{
            const toApprove = this.appService.utilService.toBigNumber(entry[1]);
            const fromContract = await this.appService.tokenService.getERC20(entry[0]);
            const allowed = await fromContract.allowance(user.address, socialNameContract.address);
            if (toApprove.gt(allowed)) {
                const approveAmount = this.appService.getApproveLimitFromPrecision(toApprove);
                return (await fromContract.connect(signer).estimateGas.approve(socialNameContract.address, approveAmount));
            }
            return BigNumber.from(0);
        })
        const val = await Promise.all(promises);
        return val.reduce((p, c)=>p.add(c), BigNumber.from(0))
    }

    async applyFees(amount: BigNumberish, currency: string, withFee: boolean, serviceId: string):Promise<ComputedFees>{
        const isSendCoin = this.appService.utilService.compareAddress(currency, ethers.constants.AddressZero);
        const approve = new Map<string, BigNumberish>();
        const addToApprove = (c:string, val:BigNumberish) =>{
            const newVal = this.appService.utilService.toBigNumber(val);
            if(newVal.eq(0)){
                return;
            }
            const old = this.appService.utilService.toBigNumber(approve.get(c) || 0);
            approve.set(c, old.add(newVal));
        }
        if(withFee){
            const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
            const price = await socialNameContract.getPrice(serviceId)
            const isFeeCoin = this.appService.utilService.compareAddress(price.currency, ethers.constants.AddressZero);
            const amountBg = this.appService.utilService.toBigNumber(amount);
            //APPROVE IF SEND TOKEN
            if(!isSendCoin){
                addToApprove(currency, amountBg);
            }
            //APPLY FEES
            if(price.paymentType == PaymentType.PAY_PROPORTIONNAL){
                const fee = amountBg.mul(price.amount).div(100); 
                if(isSendCoin){
                    //FEE AND AMOUNT IN COIN
                    return {msgValue: amountBg.add(fee), tokenValue:0, approve};
                }else{
                    //FEE AND AMOUNT IN TOKEN
                    addToApprove(currency, fee);
                    return {msgValue: 0, tokenValue:amountBg, approve};
                }
            }else if(price.paymentType == PaymentType.PAY){
                const fee = (price.amount);
                if(isFeeCoin){
                    if(isSendCoin){
                        //FEE COIN AND AMOUNT IN COIN
                        return {msgValue: amountBg.add(fee), tokenValue:0, approve};
                    }else{
                        //FEE COIN / AMOUNT IN TOKEN
                        return {msgValue: fee, tokenValue:amountBg, approve};
                    }
                }else{
                    addToApprove(price.currency, fee);
                    if(isSendCoin){
                        //FEE TOKEN / AMOUNT IN COIN
                        return {msgValue: amountBg, tokenValue:fee, approve};
                    }else{
                        //FEE TOKEN1 / AMOUNT IN TOKEN2
                        return {msgValue: 0, tokenValue:amountBg, approve};
                    }
                }
            }else{
                if(isSendCoin){
                    //NO FEE / AMOUNT COIN
                    return {msgValue: amount, tokenValue:0, approve};
                }else{
                    //NO FEE / AMOUNT TOKEN
                    return {msgValue: 0, tokenValue:amountBg, approve};
                }
            }
        }else{
            //NO FEE
            if(isSendCoin){
                return {msgValue: amount, tokenValue:0, approve};
            }else{
                return {msgValue: 0, tokenValue: amount, approve};
            }
        }
    }

    async getDepositId(receiver:string|undefined,_currency:string){
        if(receiver){
            const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
            return socialNameContract.piggyBankHash(receiver!, _currency)
        }else{
            const randomBytes32 = ethers.utils.randomBytes(128)
            return ethers.utils.keccak256(randomBytes32);
        }
    }

    async depositCoin(receiver:string|undefined, amount: BigNumberish, withFee= true) {
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        const precision = UnitUtils.addPrecision(amount);
        const service = SocialService.SERVICE_DEPOSIT;
        const piggyBankHash = await this.getDepositId(receiver, ethers.constants.AddressZero);
        const fees = await this.applyFeesAndApprove(precision, ethers.constants.AddressZero, withFee,service);
        await (await socialNameContract.depositCoin(piggyBankHash, !!receiver, {value: fees.msgValue})).wait()
        return piggyBankHash
    }

    async depositToken(receiver:string|undefined, _token: string, amount:number, withFee= true) {
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        const precision = UnitUtils.addPrecision(amount);
        const service = SocialService.SERVICE_DEPOSIT;
        const piggyBankHash = await this.getDepositId(receiver, _token);
        const fees = await this.applyFeesAndApprove(precision, _token, withFee,service);
        await (await socialNameContract.depositToken(piggyBankHash, !!receiver, _token, fees.tokenValue, {value: fees.msgValue})).wait()
        return piggyBankHash
    }

    async claimPiggybank(_token: string, id?:string) {
        const secure = !id;
        const user = await this.appService.authService.getUser();
        const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
        const _piggyBankHash = secure? await this.getDepositId(user.address, _token):id;
        await (await socialNameContract.claimPiggybank(_piggyBankHash, secure)).wait()
    }

    async sendCoin(network: SocialNetworkType, login: string, amount: BigNumberish, eventNotExists:boolean, withFee = true) {
        if (network == "address") {
            await this.appService.tokenService.sendCoin(amount, login);
        } else {
            const hash = this.getSocialLoginHash(network, login);
            const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
            const precision = UnitUtils.addPrecision(amount);
            const service = SocialService.SERVICE_FEE;
            const fees = await this.applyFeesAndApprove(precision, ethers.constants.AddressZero, withFee, service);
            await (await socialNameContract.sendCoin(hash, eventNotExists, { value: fees.msgValue })).wait();
        }
    }

    async sendCoinEstimate(network: SocialNetworkType, login: string, amount: BigNumberish, eventNotExists:boolean, withFee = true) {
        if (network == "address") {
            return this.appService.tokenService.sendCoinEstimate(amount, login);
        } else {
            const hash = this.getSocialLoginHash(network, login);
            const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractR();
            const precision = UnitUtils.addPrecision(amount);
            const service = SocialService.SERVICE_FEE;
            const fees = await this.applyFeesAndApproveEstimate(precision, ethers.constants.AddressZero, withFee, service);
            return (await socialNameContract.estimateGas.sendCoin(hash, eventNotExists, { value: precision })).add(fees);
        }
    }

    async sendToken(network: SocialNetworkType, login: string, amount: BigNumberish, fromTokenAddress: string, eventNotExists:boolean, withFee = true) {
        if (network == "address") {
            await this.appService.tokenService.sendToken(amount, login, fromTokenAddress);
        } else {
            const hash = this.getSocialLoginHash(network, login);
            const precision = UnitUtils.addPrecision(amount);
            const service = SocialService.SERVICE_FEE;
            const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
            const fees = await this.applyFeesAndApprove(precision, fromTokenAddress, withFee, service);
            await (await socialNameContract.send(hash, fromTokenAddress, fees.tokenValue, eventNotExists, {value:fees.msgValue})).wait();
        }
    }

    async sendTokenEstimation(network: SocialNetworkType, login: string, amount: BigNumberish, fromTokenAddress: string, eventNotExists:boolean, withFee = true) {
        if (network == "address") {
            return this.appService.tokenService.sendTokenEstimate(amount, login, fromTokenAddress);
        } else {
            const hash = this.getSocialLoginHash(network, login);
            const precision = UnitUtils.addPrecision(amount);
            const service = SocialService.SERVICE_FEE;
            const socialNameContract: SocialNameContractProxy = await this.appService.socialNameContractRW();
            let tmp: BigNumber = await this.applyFeesAndApproveEstimate(precision, fromTokenAddress, withFee, service);
            tmp = tmp.add(await socialNameContract.estimateGas.send(hash, fromTokenAddress, precision, eventNotExists));
            return tmp;
        }
    }

    async socialCampaignConfig() {
        const contract: SocialCampaignContractProxy = await this.appService.socialCampaignContractR();
        return contract.socialConfig();
    }

    async setSocialCampaignConfig(config: SocialCampaignConfig) {
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        await (await socialContract.setConfig(config)).wait();
    }



    private async listCampaignsFix(list: Promise<SocialCampaign[]>, {withParticipation}:SocialCampaignFilter): Promise<SocialCampaignExt[]> {
        const tmp = await list;
        const res: SocialCampaignExt[] = [];
        const participations = withParticipation==true? await this.listMyParticipations(0,0, false):[];
        for (const t of tmp) {
            const copy = { ...t } as SocialCampaignExt;
            copy.balance = {...copy.balance}
            copy.uri = ethers.utils.toUtf8String(t.uri)
            copy.name = ethers.utils.toUtf8String(ethers.utils.hexStripZeros(t.name))
            copy.balance.description = ethers.utils.toUtf8String(ethers.utils.hexStripZeros(t.balance.description))
            copy.participation = "unknown";
            if(withParticipation){
                const found = participations.filter(e => e.campaignId.eq(copy.id));
                copy.participation = found.length > 0 ? "yes" : "no";
            }
            res.push(copy);
        }
        return res;
    }

    async listCampaigns(start: number, limit: number, filter:SocialCampaignFilter={}) {
        const viewContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        return this.listCampaignsFix(viewContract.listCampaigns(start, limit),filter);
    }

    async listMyCampaigns(start: number, limit: number, filter:SocialCampaignFilter={}) {
        const viewContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        return this.listCampaignsFix(viewContract.listMyCampaigns(start, limit), filter);
    }

    async listMyParticipations(start: number, limit: number, decrypt = false) {
        const viewContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        return this.listParticipantsFix(viewContract.listMyParticipations(start, limit),decrypt);
    }

    async listMyParticipationsCampaign(start: number, limit: number, filter:SocialCampaignFilter={withParticipation: true}) {
        const viewContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        const participationsPromise = viewContract.listMyParticipations(start, limit);
        const campaigns = await this.listCampaignsFix(viewContract.listMyParticipationsCampaign(start, limit), {...filter, withParticipation: false});
        const participations = await participationsPromise;
        const mapping = new Map<string, SocialCampaignParticipant>();
        const result:SocialCampaignMine[] = [];
        for(const part of participations){
            mapping.set(part.campaignId.toString(), part);
        }
        for(const campaign of campaigns){
            const participant = mapping.get(campaign.id.toString());
            if(participant){
                result.push({campaign,participant})
            }
        }
        return result;
    }


    private async listParticipantsFix(list: Promise<SocialCampaignParticipant[]>, decrypt = true): Promise<SocialCampaignParticipant[]> {
        if (!decrypt) {
            return list;
        }
        const tmp = await list;
        const wallet = await this.appService.authService.getWallet()
        const res: SocialCampaignParticipant[] = [];
        for (const t of tmp) {
            const copy = { ...t };
            const ut8 = ethers.utils.toUtf8String(t.handleEncrypt)
            copy.handleEncrypt = (await wallet.decryptLegacy(ut8, SocialService.signMethod));
            res.push(copy);
        }
        return res;
    }

    async countParticipantsByCampaign(id: BigNumberish) {
        const viewContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        return viewContract.countParticipationsForCampaign(id);
    }

    async getCampaignById(id: BigNumberish) {
        const viewContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        return viewContract.getCampaignsById(id);
    }

    async listParticipantsByCampaign(id: BigNumberish, start: number, limit: number, decryp = true) {
        const viewContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        return this.listParticipantsFix(viewContract.listParticipantsByCampaign(id, start, limit), decryp);
    }

    async getCampaignPrice() {
        const socialCampContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractR();
        const pricePromise = await socialCampContract.getPrice(SocialService.SERVICE_CAMPAIGN)
        return pricePromise;
    }

    async createCampaign(campaign: SocialCampaign) {
        const socialCampContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        const tokenContract: TokenContract = await this.appService.tokenContractRW();
        const pricePromise = socialCampContract.getPrice(SocialService.SERVICE_CAMPAIGN)
        const wallet = await this.appService.authService.getWallet();
        if(typeof campaign.name == "string"){
            try{
                campaign.name = ethers.utils.hexZeroPad(ethers.utils.toUtf8Bytes(campaign.name as string), 32)
            }catch(e){}
        }
        if(typeof campaign.balance.description == "string"){
            try{
                campaign.balance.description = ethers.utils.toUtf8Bytes(campaign.balance.description as string)
            }catch(e){}
        }
        if(typeof campaign.uri == "string"){
            try{
                campaign.uri = ethers.utils.toUtf8Bytes(campaign.uri as string)
            }catch(e){}
        }
        campaign.pubKey = ethers.utils.toUtf8Bytes(await wallet.getPublicKeyLegacy(SocialService.signMethod));
        const userData = await socialCampContract.generateUserDataCampaign(campaign)
        const price = await pricePromise;
        await (await tokenContract.send(socialCampContract.address, price.amount, userData)).wait();
    }

    async createCampaignEstimate(campaign: SocialCampaign) {
        const socialCampContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        const tokenContract: TokenContract = await this.appService.tokenContractRW();
        const pricePromise = socialCampContract.getPrice(SocialService.SERVICE_CAMPAIGN)
        const wallet = await this.appService.authService.getWallet();
        if(typeof campaign.name == "string"){
            try{
                campaign.name = ethers.utils.hexZeroPad(ethers.utils.toUtf8Bytes(campaign.name as string), 32)
            }catch(e){}
        }
        if(typeof campaign.balance.description == "string"){
            try{
                campaign.balance.description = ethers.utils.toUtf8Bytes(campaign.balance.description as string)
            }catch(e){}
        }
        if(typeof campaign.uri == "string"){
            try{
                campaign.uri = ethers.utils.toUtf8Bytes(campaign.uri as string)
            }catch(e){}
        }
        campaign.pubKey = ethers.utils.toUtf8Bytes(await wallet.getPublicKeyLegacy(SocialService.signMethod));
        const userData = await socialCampContract.generateUserDataCampaign(campaign)
        const price = await pricePromise;
        return (await tokenContract.estimateGas.send(socialCampContract.address, price.amount, userData));
    }

    async pauseCampaign(campaignId: BigNumberish, pause: boolean) {
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        await (await socialContract.pauseCampaign(campaignId, pause)).wait();
    }

    async addCampaignBalanceUsingCoin(campaignId: BigNumberish, amount: number) {
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        const precision = UnitUtils.addPrecision(amount);
        await (await socialContract.addBalance(campaignId, precision, { value: precision })).wait();
    }

    async addCampaignBalanceUsingCoinEstimate(campaignId: BigNumberish, amount: number) {
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractR();
        const precision = UnitUtils.addPrecision(amount);
        return (await socialContract.estimateGas.addBalance(campaignId, precision, { value: precision }));
    }

    async addCampaignBalanceUsingToken(campaignId: BigNumberish, amount: number, fromTokenAddress: string) {
        const precision = UnitUtils.addPrecision(amount);
        const signer = await this.appService.authService.getSigner();
        const user = await this.appService.authService.getUser();
        const fromContract = await this.appService.tokenService.getERC20(fromTokenAddress);
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        const allowed = await fromContract.allowance(user.address, socialContract.address);
        if (precision.gt(allowed)) {
            const approveAmount = this.appService.getApproveLimitFromPrecision(precision);
            await (await fromContract.connect(signer).approve(socialContract.address, approveAmount)).wait();
        }
        await (await socialContract.addBalance(campaignId, precision)).wait();
    }

    async addCampaignBalanceUsingTokenEstimate(campaignId: BigNumberish, amount: number, fromTokenAddress: string) {
        const precision = UnitUtils.addPrecision(amount);
        const user = await this.appService.authService.getUser();
        const fromContract = await this.appService.tokenService.getERC20(fromTokenAddress);
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractR();
        const allowed = await fromContract.allowance(user.address, socialContract.address);
        let tmp = BigNumber.from(0)
        if (precision.gt(allowed)) {
            const approveAmount = this.appService.getApproveLimitFromPrecision(precision);
            tmp = tmp.add(await fromContract.estimateGas.approve(socialContract.address, approveAmount));
        }
        tmp = tmp.add(await socialContract.estimateGas.addBalance(campaignId, precision));
        return tmp;
    }

    async deleteCampaign(campaignId: BigNumberish) {
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        await (await socialContract.deleteCampaign(campaignId)).wait();
    }

    async deleteCampaignEstimate(campaignId: BigNumberish) {
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractR();
        return (await socialContract.estimateGas.deleteCampaign(campaignId));
    }

    async allowClaimMany(users: string[], campaignId: BigNumberish, allow: boolean) {
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        await (await socialContract.allowClaimMany(users, campaignId, allow)).wait();
    }

    async allowClaimManyEstimate(users: string[], campaignId: BigNumberish, allow: boolean) {
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractR();
        return (await socialContract.estimateGas.allowClaimMany(users, campaignId, allow));
    }

    async allowClaimAll(campaignId: BigNumberish, allow: boolean) {
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        await (await socialContract.allowClaimAll(campaignId, allow)).wait();
    }

    async allowClaimAllEstimate(campaignId: BigNumberish, allow: boolean) {
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractR();
        return (await socialContract.estimateGas.allowClaimAll(campaignId, allow));
    }

    async participateToCampaign(campaignId: BigNumberish, login: string, network: SocialNetworkType) {
        const wallet = await this.appService.authService.getWallet()
        const user = await this.appService.authService.getUser()
        const hash = this.getSocialLoginHash(network, login);
        const display = this.getSocialLoginKey(network, login);
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        const campaign = await socialContract.getCampaignsById(campaignId);
        const pubKey = ethers.utils.toUtf8String(campaign.pubKey);
        const encrypt = ethers.utils.toUtf8Bytes(await wallet.encryptLegacy(display, pubKey));
        const signature = await this.appService.signerService.socialCampaignHash(user.address, hash);
        await (await socialContract.participateToCampaign(campaignId, hash, encrypt, signature)).wait();
    }

    async participateToCampaignEstimate(campaignId: BigNumberish, login: string, network: SocialNetworkType) {
        const wallet = await this.appService.authService.getWallet()
        const user = await this.appService.authService.getUser()
        const hash = this.getSocialLoginHash(network, login);
        const display = this.getSocialLoginKey(network, login);
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractR();
        const campaign = await socialContract.getCampaignsById(campaignId);
        const pubKey = ethers.utils.toUtf8String(campaign.pubKey);
        const encrypt = await wallet.encryptLegacy(display, pubKey);
        const signature = await this.appService.signerService.socialCampaignHash(user.address, hash);
        return (await socialContract.estimateGas.participateToCampaign(campaignId, hash, encrypt, signature));
    }

    async campaignClaimMany(campaignId: BigNumberish[]) {
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        await (await socialContract.campaignClaimMany(campaignId)).wait();
    }

    async campaignClaimManyEstimate(campaignId: BigNumberish[]) {
        const socialContract: SocialCampaignContractProxy = await this.appService.socialCampaignContractR();
        return (await socialContract.estimateGas.campaignClaimMany(campaignId));
    }

    async setSocialCampaign(config: SocialCampaignConfig) {
        const contract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        await (await contract.setConfig(config)).wait();
    }

    async deleteACampaign(campaignId: BigNumberish) {
        const contract: SocialCampaignContractProxy = await this.appService.socialCampaignContractRW();
        await (await contract.deleteACampaign(campaignId)).wait();
    }

    async getAdById(id: BigNumberish) {
        const viewContract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        return viewContract.getAdsById(id);
    }

    async listAds(start: number, limit: number) {
        const contract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        return contract.listAds(start, limit);
    }

    async listAdsByStatus(start: number, limit: number, lifecycle: Lifecycle) {
        const contract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        return contract.listAdsByStatus(start, limit,lifecycle);
    }

    async listMyAds(start: number, limit: number) {
        const contract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        return contract.listMyAds(start, limit);
    }

    private async listPropositionFix(list: Promise<SocialAdProposition[]>, decrypt = true): Promise<SocialAdProposition[]> {
        if (!decrypt) {
            return list;
        }
        const tmp = await list;
        const wallet = await this.appService.authService.getWallet()
        const res: SocialAdProposition[] = [];
        for (const t of tmp) {
            const copy = { ...t };
            copy.description = (await wallet.decryptLegacy(t.description, SocialService.signMethod));
            res.push(copy);
        }
        return res;
    }

    async listMyPropositions(start: number, limit: number, decrypt = true) {
        const contract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        return this.listPropositionFix(contract.listMyPropositions(start, limit), decrypt);
    }

    async listMyPropositionsForAds(adId: BigNumberish, decrypt = true) {
        const contract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        return this.listPropositionFix(contract.listMyPropositions(0, 0).then(all=>{
            return all.filter(prop=>{
                return prop.adsId.toString() == adId.toString();
            })
        }), decrypt);
    }

    async listPropositionsForAds(id: BigNumberish, start: number, limit: number, decrypt = true) {
        const contract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        return this.listPropositionFix(contract.listPropositionsForAds(id, start, limit), decrypt);
    }

    async socialAdsConfig() {
        const contract: SocialAdsContractProxy = await this.appService.socialAdsContractR();
        return contract.socialConfig();
    }

    async getAdsPrice() {
        const socialCampContract: SocialAdsContractProxy = await this.appService.socialAdsContractR();
        const pricePromise = await socialCampContract.getPrice(SocialService.SERVICE_ADS)
        return pricePromise;
    }

    async createAds(social: SocialNetworkType, login: string, ads: SocialAds) {
        const hash = login;
        const wallet = await this.appService.authService.getWallet()
        const user = await this.appService.authService.getUser()
        const socialAdsContract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        const tokenContract: TokenContract = await this.appService.tokenContractRW();
        const pricePromise = socialAdsContract.getPrice(SocialService.SERVICE_ADS)
        ads.handle = hash;
        ads.pubKey = ethers.utils.toUtf8Bytes(await wallet.getPublicKeyLegacy(SocialService.signMethod));
        ads.signature = await this.appService.signerService.socialAdsHash(user.address, hash);
        const userData = await socialAdsContract.generateAdsUserData(ads)
        const price = await pricePromise;
        await (await tokenContract.send(socialAdsContract.address, price.amount, userData)).wait();
    }

    async createAdsEstimate(social: SocialNetworkType, login: string, ads: SocialAds) {
        const hash = login;
        const user = await this.appService.authService.getUser()
        const socialAdsContract: SocialAdsContractProxy = await this.appService.socialAdsContractR();
        const tokenContract: TokenContract = await this.appService.tokenContractR();
        const pricePromise = socialAdsContract.getPrice(SocialService.SERVICE_ADS)
        ads.handle = hash;
        ads.signature = await this.appService.signerService.socialAdsHash(user.address, hash);
        const userData = await socialAdsContract.generateAdsUserData(ads)
        const price = await pricePromise;
        return (await tokenContract.estimateGas.send(socialAdsContract.address, price.amount, userData));
    }

    async deleteAd(adsId: BigNumberish) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        await (await socialContract.deleteAd(adsId)).wait();
    }

    async updateAds(ads: SocialAds) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        const wallet = await this.appService.authService.getWallet();
        ads.pubKey = ethers.utils.toUtf8Bytes(await wallet.getPublicKeyLegacy(SocialService.signMethod));
        await (await socialContract.updateAds(ads.id, ads)).wait();
    }

    async updateAdsEstimate(ads: SocialAds) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractR();
        return (await socialContract.estimateGas.updateAds(ads.id, ads));
    }

    async createProposition(proposition: SocialAdsProposition) {
        const walletPromise = this.appService.authService.getWallet();
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        const ads = await socialContract.getAdsById(proposition.adsId);
        const override: ethers.PayableOverrides = {}
        const precision = UnitUtils.addPrecision(proposition.amount);
        proposition.amount = precision;
        const wallet = await walletPromise;
        proposition.pubKey = ethers.utils.toUtf8Bytes(await wallet.getPublicKeyLegacy(SocialService.signMethod));
        const pubKey = ethers.utils.toUtf8String(ads.pubKey);
        proposition.description = await wallet.encryptLegacy(proposition.description, pubKey);
        if (proposition.currency == ethers.constants.AddressZero) {
            override.value = precision;
        } else {
            const signer = await this.appService.authService.getSigner();
            const user = await this.appService.authService.getUser();
            const fromContract = await this.appService.tokenService.getERC20(proposition.currency);
            const allowed = await fromContract.allowance(user.address, socialContract.address);
            if (precision.gt(allowed)) {
                const approveAmount = this.appService.getApproveLimitFromPrecision(precision);
                await (await fromContract.connect(signer).approve(socialContract.address, approveAmount)).wait();
            }
        }
        await (await socialContract.createProposition(proposition, override)).wait();
    }

    async createPropositionEstimate(proposition: SocialAdsProposition) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractR();
        const override: ethers.PayableOverrides = {}
        const precision = UnitUtils.addPrecision(proposition.amount);
        proposition.amount = precision;
        let tmp = BigNumber.from(0)
        if (proposition.currency == ethers.constants.AddressZero) {
            override.value = precision;
        } else {
            const user = await this.appService.authService.getUser();
            const fromContract = await this.appService.tokenService.getERC20(proposition.currency);
            const allowed = await fromContract.allowance(user.address, socialContract.address);
            if (precision.gt(allowed)) {
                const approveAmount = this.appService.getApproveLimitFromPrecision(precision);
                tmp = tmp.add(await fromContract.estimateGas.approve(socialContract.address, approveAmount));
            }
        }
        tmp = tmp.add(await socialContract.estimateGas.createProposition(proposition, override));
        return tmp;
    }

    async updateProposition(proposition: SocialAdsProposition) {
        const walletPromise = this.appService.authService.getWallet();
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        const ads = await socialContract.getAdsById(proposition.adsId);
        const wallet = await walletPromise;
        proposition.pubKey = ethers.utils.toUtf8Bytes(await wallet.getPublicKeyLegacy(SocialService.signMethod));
        const pubKey = ethers.utils.toUtf8String(ads.pubKey);
        proposition.description = await wallet.encryptLegacy(proposition.description, pubKey);
        await (await socialContract.updateProposition(proposition)).wait();
    }

    async updatePropositionEstimate(proposition: SocialAdsProposition) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractR();
        return (await socialContract.estimateGas.updateProposition(proposition));
    }

    async deleteProposition(propositionId: BigNumberish) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        await (await socialContract.deleteProposition(propositionId)).wait();
    }

    async deletePropositionEstimate(propositionId: BigNumberish) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractR();
        return (await socialContract.estimateGas.deleteProposition(propositionId));
    }

    async approveProposition(propositionId: BigNumberish, approve: boolean) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        await (await socialContract.approveProposition(propositionId, approve)).wait();
    }

    async approvePropositionEstimate(propositionId: BigNumberish, approve: boolean) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractR();
        return (await socialContract.estimateGas.approveProposition(propositionId, approve));
    }

    async allowClaimProposition(propositionId: BigNumberish, canClaim: boolean) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        await (await socialContract.allowClaimProposition(propositionId, canClaim)).wait();
    }

    async allowClaimPropositionEstimate(propositionId: BigNumberish, canClaim: boolean) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        return (await socialContract.estimateGas.allowClaimProposition(propositionId, canClaim));
    }

    async claimProposition(propositionId: BigNumberish) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        await (await socialContract.claimProposition(propositionId)).wait();
    }

    async claimPropositionEstimate(propositionId: BigNumberish) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractR();
        return (await socialContract.estimateGas.claimProposition(propositionId));
    }

    async deleteAds(adIds: BigNumberish) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        await (await socialContract.deleteAds(adIds)).wait();
    }

    async deleteAdsEstimate(adIds: BigNumberish) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractR();
        return (await socialContract.estimateGas.deleteAds(adIds));
    }

    async setSocialAdsConfig(config: SocialAdsConfig) {
        const socialContract: SocialAdsContractProxy = await this.appService.socialAdsContractRW();
        await (await socialContract.setConfig(config)).wait();
    }
}

export type SocialNameRegistration = {
    id: BigNumber;
    owner: string;
    name: string;
    network: BigNumber;
    encryptName: string;
    signature: string;
}

export type SocialNameConfig = {
    tokenAddress: string;
    registration: {
        amount: BigNumberish;
        service: BytesLike;
        currency: string;
        paymentType: BigNumberish;
    };
    fee: {
        amount: BigNumberish;
        service: BytesLike;
        currency: string;
        paymentType: BigNumberish;
    };
    deposit: {
        amount: BigNumberish;
        service: BytesLike;
        currency: string;
        paymentType: BigNumberish;
    };
    libAddress: string
    validatorRequire: boolean;
    validator: string;
    allowChangeOwner: boolean;
}

export type SocialCampaign = {
    id: BigNumberish;
    uri: ethers.utils.BytesLike;
    network: BigNumberish;
    actions: BigNumberish[];
    name: ethers.utils.BytesLike;
    price: BigNumberish;
    priceCurrency: string;
    startat: BigNumberish;
    endat: BigNumberish;
    duration: BigNumberish;
    durationPeriod: BigNumberish;
    owner: string;
    status: Lifecycle
    balance: {
        description: ethers.utils.BytesLike;
        current: BigNumberish;
        pendingBalance: BigNumberish
        accBalance: BigNumberish;
    }
    pubKey: ethers.utils.BytesLike
}

export type SocialCampaignExt = SocialCampaign & {
    participation:"unknown" | "yes" | "no"
}
export type SocialCampaignFilter = {
    withParticipation?:boolean
}
export type SocialCampaignConfig = {
    tokenAddress: string;
    validatorRequire: boolean;
    validator: string;
    libAddress:string
    deleteDefinitely:boolean
    campaign: {
        amount: BigNumberish;
        service: BytesLike;
        currency: string;
        paymentType: BigNumberish;
    };
}

export type SocialAds = {
    id: BigNumberish;
    network: BigNumberish;
    handle: string;
    audiences: string[];
    followers: BigNumberish;
    price: BigNumberish;
    priceCurrency: string;
    duration: BigNumberish;
    durationPeriod: BigNumberish;
    owner: string;
    signature: BytesLike;
    pubKey: BytesLike;
    description: string
    stats: {
      countProposition: BigNumberish;
      countPropositionAccepted: BigNumberish;
    };
    status: number;
}

export type SocialAdsProposition = {
    id: BigNumberish;
    adsId: BigNumberish;
    startat: BigNumberish;
    endat: BigNumberish;
    amount: BigNumberish;
    currency: string;
    owner: string;
    accepted: TriState;
    canClaim: TriState;
    claimed: boolean;
    pubKey: BytesLike;
    description: string;
}

export type SocialAdsConfig = {
    tokenAddress: string;
    validatorRequire: boolean;
    validator: string;
    libAddress:string
    deleteDefinitely:boolean
    ads: {
        amount: BigNumberish;
        service: BytesLike;
        currency: string;
        paymentType: BigNumberish;
    };
    proposition: {
        amount: BigNumberish;
        service: BytesLike;
        currency: string;
        paymentType: BigNumberish;
    };
}

export type SocialAdProposition = {
    id: BigNumberish;
    adsId: BigNumberish;
    startat: BigNumberish;
    endat: BigNumberish;
    amount: BigNumberish;
    currency: string;
    owner: string;
    accepted: TriState;
    canClaim: TriState;
    claimed: boolean;
    description: string;
    pubKey: string;
}

export type SocialCampaignParticipant = {
    id: BigNumber;
    user: string;
    handleHash: string;
    handleEncrypt: string;
    date: BigNumber;
    claimed: boolean;
    canClaim: TriState;
    campaignId: BigNumber;
}

export type SocialCampaignMine={
    participant: SocialCampaignParticipant
    campaign: SocialCampaign
}

export type ComputedFees={
    msgValue:BigNumberish, 
    tokenValue:BigNumberish
    approve:Map<string, BigNumberish>
}