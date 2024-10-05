import { BigNumber, BigNumberish, BytesLike, ethers } from "ethers";
import { SocialAdsContractProxy, SocialCampaignContractProxy, SocialNameContractProxy, TokenContract } from "../typechain-types";
import { AppService } from "./appService";
import { AuthService } from "./authService";
import { appErrors } from "./errors";
import { SocialAds, SocialAdsProposition, SocialCampaignExt, SocialService } from "./socialService";
import { Lifecycle, TriState, UnitUtils, PaymentType } from "./utils";



export class MessageService {
    constructor(private appService: AppService) { }

    get contractR(): Promise<SocialNameContractProxy> {
        return this.appService.socialNameContractR();
    }

    get authService(): AuthService {
        return this.appService.authService;
    }

    get contractRW(): Promise<SocialNameContractProxy> {
        return this.appService.socialNameContractRW();
    }

    private getAdsKey(id: BigNumberish){
        return `ads:${id.toString()}`;
    }

    private getAdsPropsKey(id: BigNumberish, adIds:BigNumberish){
        return `ads:${id.toString()}:${adIds.toString()}`;
    }

    private getCampaignKey(id: BigNumberish){
        return `campaign:${id.toString()}`;
    }
    
    async sendMessageForAdsProps(ads: SocialAdsProposition, message: string) {
        const adRoot = await this.appService.socialService.getAdById(ads.adsId);
        const propPubKey = ethers.utils.toUtf8String(ads.pubKey);
        const adPubKey = ethers.utils.toUtf8String(adRoot.pubKey);
        const wallet = await this.authService.getWallet();
        const myAddress = await wallet.getAddress();
        const receiverKey = this.appService.utilService.compareAddress(myAddress, adRoot.owner)? propPubKey: adPubKey;
        await this.sendMessage(this.getAdsPropsKey(ads.id, ads.adsId), message, ads.owner, receiverKey);
    }

    async sendMessageForAds(ads: SocialAds, message: string) {
        await this.sendMessage(this.getAdsKey(ads.id), message, ads.owner, ethers.utils.toUtf8String(ads.pubKey));
    }

    async addressHash(receiverAddress:string){
        const contract = await this.contractR;
        return contract.messageAddressHash(receiverAddress);
    }

    async sendMessageForAdsId(id: BigNumberish, message: string, receiver: string, receiverPubKey?: string) {
        await this.sendMessage(this.getAdsKey(id), message, receiver, receiverPubKey);
    }

    async sendMessageForCampaign(campaign: SocialCampaignExt, message: string) {
        await this.sendMessage(this.getCampaignKey(campaign.id), message, campaign.owner, ethers.utils.toUtf8String(campaign.pubKey));
    }

    async sendMessageForCampaignId(id: BigNumberish, message: string, receiver: string, receiverPubKey?: string) {
        await this.sendMessage(this.getCampaignKey(id), message, receiver, receiverPubKey);
    }

    async getMyHash(){
        const contract = await this.contractRW;
        const user = await this.authService.getUser();
        const myHash = await contract.messageAddressHash(user.address);
        return myHash;
    }

    async deleteMessage(id:BigNumberish){
        const contract = await this.contractRW;
        await (await contract.deleteMessage(id)).wait();
    }

    async sendMessage(subject: string, message: string, receiverAddress: string, receiverPubKeyStr?: string) {
        const contract = await this.contractRW;
        const wallet = await this.authService.getWallet();
        const senderPubKeyStr = await wallet.getPublicKeyLegacy(SocialService.signMethod);
        const senderPubKey = ethers.utils.toUtf8Bytes(senderPubKeyStr);
        const receiverPubKey = receiverPubKeyStr? ethers.utils.toUtf8Bytes(receiverPubKeyStr): UnitUtils.ZER0_32
        const myEncryptMessage = ethers.utils.toUtf8Bytes(await wallet.encryptLegacy(message, senderPubKeyStr, SocialService.signMethod));
        const encryptMessage = ethers.utils.toUtf8Bytes(await wallet.encryptLegacy(message, receiverPubKeyStr, SocialService.signMethod));
        const subjectId = await contract.messageSubjectHash(ethers.utils.toUtf8Bytes(subject));
        const receiver = await contract.messageAddressHash(receiverAddress);
        await (await contract.sendMessage(subjectId, {
            id: 0,
            date: 0,
            encryptMessage,
            myEncryptMessage,
            receiver,
            receiverPubKey,
            sender: UnitUtils.ZER0_32,
            senderPubKey,
            subjectId,
        })).wait()
    }

    async replyMessage(messageId: BigNumberish, message: string) {
        const contract = await this.contractRW;
        const messageModel = await contract.messageById(messageId);
        const user = await this.authService.getUser();
        const wallet = await this.authService.getWallet();
        const myHash = await contract.messageAddressHash(user.address);
        const senderPubKey = ethers.utils.toUtf8Bytes(await wallet.getPublicKeyLegacy(SocialService.signMethod));
        const subjectId = messageModel.subjectId;
        const iwasSender = messageModel.sender == myHash;
        const receiver = iwasSender? messageModel.receiver : messageModel.sender;
        const receiverPubKey = iwasSender? messageModel.receiverPubKey : messageModel.senderPubKey;
        const senderPubKeyStr = ethers.utils.toUtf8String(senderPubKey)
        const receiverPubKeyStr = ethers.utils.toUtf8String(receiverPubKey)
        const myEncryptMessage = ethers.utils.toUtf8Bytes(await wallet.encryptLegacy(message, senderPubKeyStr, SocialService.signMethod));
        const encryptMessage = ethers.utils.toUtf8Bytes(await wallet.encryptLegacy(message, receiverPubKeyStr, SocialService.signMethod));
        await (await contract.sendMessage(subjectId, {
            id: 0,
            date: 0,
            encryptMessage,
            myEncryptMessage,
            receiver,
            receiverPubKey,
            sender: UnitUtils.ZER0_32,
            senderPubKey,
            subjectId,
        })).wait()
    }

    async counMessage() {
        const contract = await this.contractR;
        return contract.counMessage();
    }

    async counMessageReceivedBy(address: string) {
        const contract = await this.contractR;
        return contract.counMessageReceivedBy(address);
    }

    async counMessageSentBy(address:string) {
        const contract = await this.contractR;
        return contract.counMessageSentBy(address);
    }

    async counMessageReceivedByMe() {
        const contract = await this.contractR;
        return contract.counMessageReceivedByMe();
    }

    async counMessageSentByMe() {
        const contract = await this.contractR;
        return contract.counMessageSentByMe();
    }

    async listMessageBySubjectForAdsProps(props: SocialAdsProposition, start: number, limit: number, decrypt = true) {
        return this.listMessageBySubject(this.getAdsPropsKey(props.id, props.adsId), start, limit, decrypt);
    }

    async listMessageBySubjectForAds(id: BigNumberish, start: number, limit: number, decrypt = true) {
        return this.listMessageBySubject(this.getAdsKey(id), start, limit, decrypt);
    }

    async listMessageBySubjectForCampaign(id: BigNumberish, start: number, limit: number, decrypt = true) {
        return this.listMessageBySubject(this.getCampaignKey(id), start, limit, decrypt);
    }

    async listMessageBySubject(subject: string, start: number, limit: number, decrypt = true) {
        const contract = await this.contractR;
        const subjectid = await contract.messageSubjectHash(ethers.utils.toUtf8Bytes(subject));
        return this.fixMessage(contract.listMessageBySubject(subjectid, start, limit), decrypt);
    }

    async listMessageReceivedBy(address: string, start: number, limit: number, decrypt = true) {
        const contract = await this.contractR;
        return this.fixMessage(contract.listMessageReceivedBy(address, start, limit), decrypt);
    }

    async listMessageSentBy(address: string, start: number, limit: number, decrypt = true) {
        const contract = await this.contractR;
        return this.fixMessage(contract.listMessageSentBy(address, start, limit), decrypt);
    }

    async listMessageReceivedByMe(start: number, limit: number, decrypt = true) {
        const contract = await this.contractR;
        return this.fixMessage(contract.listMessageReceivedByMe(start, limit), decrypt);
    }

    async listMessageSentByMe(start: number, limit: number, decrypt = true) {
        const contract = await this.contractR;
        return this.fixMessage(contract.listMessageSentByMe(start, limit), decrypt);
    }

    async listMessageSubjectBy(address: string, start: number, limit: number) {
        const contract = await this.contractR;
        return contract.listMessageSubjectBy(address, start, limit);
    }

    async listMessageSubjectByMe(start: number, limit: number) {
        const contract = await this.contractR;
        return contract.listMessageSubjectByMe(start, limit);
    }

    private async fixMessage(list: Promise<MessageModel[]>, decrypt = true): Promise<MessageModelDecrypted[]> {
        if (!decrypt) {
            return list;
        }
        const tmp = await list;
        const contract = await this.contractRW;
        const wallet = await this.appService.authService.getWallet()
        const res: MessageModel[] = [];
        const user = await this.authService.getUser();
        const myHash = await contract.messageAddressHash(user.address);
        for (const t of tmp) {
            const copy = { ...t } as MessageModelDecrypted;
            if (myHash.toLowerCase() == t.sender.toString().toLowerCase()) {
                const ut8 = ethers.utils.toUtf8String(t.myEncryptMessage)
                copy.decrypted = (await wallet.decryptLegacy(ut8, SocialService.signMethod));
            } else {
                const ut8 = ethers.utils.toUtf8String(t.encryptMessage)
                copy.decrypted = (await wallet.decryptLegacy(ut8, SocialService.signMethod));
            }
            res.push(copy);
        }
        return res;
    }
}

export type MessageModel = {
    id: BigNumberish;
    date: BigNumberish
    subjectId: BytesLike;
    senderPubKey: BytesLike;
    receiverPubKey: BytesLike;
    encryptMessage: BytesLike;
    myEncryptMessage: BytesLike;
    sender: BytesLike;
    receiver: BytesLike;
}

export type MessageModelDecrypted = MessageModel & {
    decrypted?: string
}