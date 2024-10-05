import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import {utils} from "ethers";

export enum TriState{ UNDEFINED, FALSE, TRUE }
export enum Lifecycle{ DELETE,LIVE, PAUSED }
export enum PaymentType { LOCK = 0, PAY = 1, PAY_PROPORTIONNAL = 2 }
export class DateUtils {
    static fromBigNumber(bignumberish: BigNumberish){
        const tmp = BigNumber.from(bignumberish);
        return new Date(tmp.toNumber()*1000)
    }
    static addMinutes(time:number, minutes:number){
        return time + (minutes * 60);
    }

    static addHours(time:number, hours:number){
        return time + (hours * 60 * 60);
    }

    static addDays(time:number, days:number){
        return time + (days * 60 * 60 * 24);
    }

    static now(){
        return Math.round(new Date().getTime() / 1000);
    }  

    static nowSeconds(){
        return Math.round(new Date().getTime() / 1000);
    }  

    static toSeconds(date:Date){
        return date.getTime() / 1000;
    }  

    static fromSeconds(sec:number | BigNumber){
        if(sec instanceof BigNumber){
            return new Date(sec.mul(1000).toNumber())
        }
        return new Date(sec*1000);
    }    
}


export class UnitUtils {
    static DECIMAL = 18;
    static PRECISION = BigNumber.from(10).pow(UnitUtils.DECIMAL);
    static ZER0_32 = "0x0000000000000000000000000000000000000000000000000000000000000000"
    static weiToEth(wei:BigNumberish){
        return utils.formatEther(wei);
    }

    static gweiToEth(wei:BigNumberish){
        return utils.formatUnits(wei, "gwei");
    }

    static ethToWei(wei:BigNumberish){
        return utils.parseUnits(wei.toString(), "ether");
    }

    static addPrecision(numb:BigNumberish, precision = UnitUtils.DECIMAL):BigNumber{
        //18 decimals
        return utils.parseUnits(numb.toString(), precision);
        //return BigNumber.from(toWei(numb.toString()));
        //return BigNumber.from(numb).mul(UnitUtils.PRECISION);
    }
    static addPrecisionFrom(numb:BigNumberish, precision = UnitUtils.DECIMAL):BigNumber{
        //18 decimals
        return utils.parseUnits(numb.toString(), precision);
        //return BigNumber.from(toWei(numb.toString()));
        //return BigNumber.from(numb).mul(UnitUtils.PRECISION);
    }

    static removePrecision(numb:BigNumberish):number{
        return parseFloat(utils.formatUnits(numb, UnitUtils.DECIMAL));
    }  

    static removePrecisionStr(numb:BigNumber, fixed:number=3):string{
        const tmp = utils.formatUnits(numb, UnitUtils.DECIMAL);
        return (+tmp).toFixed(fixed);
    } 

    static removePrecisionStrFromNum(numb:BigNumberish, fixed:number=3):string{
        if(typeof numb == "undefined") return "";
        const tmp = utils.formatUnits(numb, UnitUtils.DECIMAL);
        return (+tmp).toFixed(fixed);
    }

    static removePrecisionStrFromNumWithPrecision(numb:BigNumberish,precision=UnitUtils.DECIMAL, fixed:number=3):string{
        if(typeof numb == "undefined") return "";
        const tmp = utils.formatUnits(numb, precision);
        return (+tmp).toFixed(fixed);
    }
}
