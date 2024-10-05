import { BigNumber, BigNumberish, Contract, Signer, VoidSigner, Wallet } from "ethers";
import { DateUtils, UnitUtils } from "./utils";
import { AppService } from "./appService";
import { ethers } from "ethers";


export class UtilService {
    public ADDRESS_ZERO = ethers.constants.AddressZero;
    constructor(private appService: AppService) { }
    get authService() { return this.appService.authService }
    public async getGasPrice() {
        const wallet = await this.authService.getWallet();
        return wallet.provider.getGasPrice();
    }

    public toDate(bignumberish: BigNumberish) {
        return DateUtils.fromBigNumber(bignumberish);
    }

    public toDateNumber(bignumberish: BigNumberish) {
        return DateUtils.fromBigNumber(bignumberish).getTime();
    }

    public toDateSecond(bignumberish: BigNumberish) {
        return DateUtils.toSeconds(DateUtils.fromBigNumber(bignumberish));
    }

    public toSecond(bignumberish: Date) {
        return DateUtils.toSeconds(bignumberish);
    }

    public dateToBigNumber(date: Date|number|string):BigNumber {
        if(typeof date == "string"){
            date = new Date(date);
        }
        let num = date instanceof Date? date.getTime(): date;
        return BigNumber.from(Math.round(num / 1000));
    }

    public toBigNumber(bignumberish: BigNumberish) {
        if(typeof bignumberish == "undefined"){
            return BigNumber.from(0);
        }
        return BigNumber.from(bignumberish);
    }

    public addPrecision(numb: BigNumberish, precision: number = UnitUtils.DECIMAL) {
        return UnitUtils.addPrecisionFrom(numb, precision)
    }

    public removePrecision(numb: BigNumberish, precision = UnitUtils.DECIMAL, fixed: number = 3) {
        return UnitUtils.removePrecisionStrFromNumWithPrecision(numb, precision, fixed)
    }

    public formatError(e:any){
        let message = `${((e as any).data && (e as any).data.message) || ((e as any).message) || e}`;
        message = message.trim().replace("\b�y�","").replace("\u0000","").replace("Error: VM Exception while processing transaction: reverted with reason string '","");
        if(message.endsWith("'")){
            message = message.substring(0, message.length-1);
        }
        return message;
    }

    public gweiToEth(wei:BigNumberish){
        return UnitUtils.gweiToEth(wei);
    }

    public weiToEth(wei:BigNumberish){
        return UnitUtils.weiToEth(wei);
    }

    public ethToWei(wei:BigNumberish){
        return UnitUtils.ethToWei(wei);
    }

    public compareAddress(address?:string, other?:string){
        return address?.toLowerCase() == other?.toLowerCase();
    }

    public bytesToStr(str: ethers.utils.BytesLike){
        return ethers.utils.toUtf8String(str)
    }

    public strToBytes(str: string){
        return ethers.utils.toUtf8Bytes(str)
    }
}