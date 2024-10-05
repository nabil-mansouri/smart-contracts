import axios from "axios";
import { BigNumber, ethers } from "ethers";
import { AppService } from "./appService";
import { UnitUtils } from "./utils";

export class SwapService {
    private _BASE_URL = 'https://api.1inch.exchange/v4.0/';
    constructor(private appService: AppService, private forceChain?: number) { }

    get baseUrl() {
        if (this.forceChain) {
            return this._BASE_URL + this.forceChain;
        }
        const { chainId } = this.appService.appConfig.swap;
        return this._BASE_URL + chainId;
    }

    async getApproveAddress(): Promise<ApproveSpender> {
        return this.wrap(async () => {
            const url = `${this.baseUrl}/approve/spender`;
            const result = await axios.get(url);
            return result.data;
        });
    }

    async getApproveRawTransaction(unsafeAmount: number | string, tokenAddress: string): Promise<ApproveTransaction> {
        return this.wrap(async () => {
            const decimals = await this.appService.tokenService.getDecimals(tokenAddress);
            const amount = UnitUtils.addPrecision(unsafeAmount, decimals).toString();
            const url = `${this.baseUrl}/approve/transaction`;
            const result = await axios.get(url, { params: { tokenAddress, amount } });
            return result.data;
        });
    }

    async getApproveAllowance(walletAddress: string, tokenAddress: string): Promise<ApproveAllowance> {
        return this.wrap(async () => {
            const url = `${this.baseUrl}/approve/allowance`;
            const result = await axios.get(url, { params: { tokenAddress, walletAddress } });
            return result.data;
        });
    }

    async getHealthCheck(): Promise<boolean> {
        return this.wrap(async () => {
            const url = `${this.baseUrl}/healthcheck`;
            const result = await axios.get(url);
            const data: HealthCheck = result.data;
            return data.status == "OK";
        });
    }

    async getListLiquiditySource(): Promise<LiquiditySources> {
        return this.wrap(async () => {
            const url = `${this.baseUrl}/liquidity-sources`;
            const result = await axios.get(url);
            const data: LiquiditySources = result.data;
            return data;
        });
    }

    _cacheTokens?: Tokens;

    async getListTokens(): Promise<Tokens> {
        return this.wrap(async () => {
            if (this._cacheTokens) return this._cacheTokens!;
            const url = `${this.baseUrl}/tokens`;
            const result = await axios.get(url);
            result.data.tokens = Object.values(result.data.tokens);
            const data: Tokens = result.data;
            this._cacheTokens = data;
            return data;
        })
    }

    async getPreset(): Promise<Preset> {
        return this.wrap(async () => {
            const url = `${this.baseUrl}/presets`;
            const result = await axios.get(url);
            const data: Preset = result.data;
            return data;
        });
    }

    async getQuote(unsafe: QuoteCustomArg): Promise<QuoteExt> {
        return this.wrap(async () => {
            const { fromTokenAddress, toTokenAddress, amount: unsafeAmount, ...others } = unsafe;
            const amount = UnitUtils.addPrecision(unsafeAmount, fromTokenAddress.decimals).toString();
            const safeArgs: QuoteArg = { ...others, amount, fromTokenAddress: fromTokenAddress.address, toTokenAddress: toTokenAddress.address }
            const url = `${this.baseUrl}/quote`;
            const result = await axios.get(url, { params: safeArgs });
            const data: Quote = result.data;
            return { ...data, estimatedGasCoin: UnitUtils.removePrecisionStrFromNum(data.estimatedGas, 6) };
        });
    }

    async getSwapTransaction(unsafe: SwapCustomArg): Promise<Swap> {
        return this.wrap(async () => {
            const { fromTokenAddress, toTokenAddress, amount: unsafeAmount, ...others } = unsafe;
            const amount = UnitUtils.addPrecision(unsafeAmount, fromTokenAddress.decimals).toString();
            const safeArgs: SwapArg = { ...others, amount, fromTokenAddress: fromTokenAddress.address, toTokenAddress: toTokenAddress.address }
            const url = `${this.baseUrl}/swap`;
            const result = await axios.get(url, { params: safeArgs });
            const data: Swap = result.data;
            return data;
        });
    }

    async makeApproveIfNeeded(unsafeAmount: number | string, unsafeTokenAddress: string | Token) {
        return this.wrap(async () => {
            const tokenAddress = (typeof unsafeTokenAddress == "string") ? unsafeTokenAddress : unsafeTokenAddress.address;
            const decimals = (typeof unsafeTokenAddress == "string") ? await this.appService.tokenService.getDecimals(tokenAddress) : unsafeTokenAddress.decimals;
            const signer = await this.appService.authService.getSigner();
            const address = await signer.getAddress();
            const allowBefore = await this.getApproveAllowance(address, tokenAddress);
            const safeAmount = UnitUtils.addPrecision(unsafeAmount, decimals);
            //allow < amount
            if (safeAmount.gt(allowBefore.allowance)) {
                const tx = await this.getApproveRawTransaction(unsafeAmount, tokenAddress);
                tx.gasPrice = BigNumber.from(tx.gasPrice).toHexString();
                tx.value = BigNumber.from(tx.value).toHexString();
                await (await signer.sendTransaction(tx)).wait();
                return this.getApproveAllowance(address, tokenAddress);
            } else {
                return allowBefore;
            }
        });
    }

    async makeSwap(unsafe: SwapCustomArg) {
        return this.wrap(async () => {
            await this.makeApproveIfNeeded(unsafe.amount, unsafe.fromTokenAddress);
            const swap = await this.getSwapTransaction(unsafe);
            const signer = await this.appService.authService.getSigner();
            await (await signer.sendTransaction(swap.tx)).wait();
            const tokenService = this.appService.tokenService;
            return {
                address: unsafe.fromAddress,
                fromBalance: await tokenService.getTokenBalanceFor(unsafe.fromTokenAddress.address, unsafe.fromAddress),
                toBalance: await tokenService.getTokenBalanceFor(unsafe.toTokenAddress.address, unsafe.fromAddress)
            };
        });
    }

    private async wrap<T>(callback: () => Promise<T>): Promise<T> {
        try {
            const tmp = await callback();
            return tmp;
        } catch (e) {
            if ((e as any).response && (e as any).response.data) {
                throw (e as any).response.data;
            } else {
                throw e;
            }
        }
    }

}
export type  Swap = {
    "fromToken": {
        "symbol": string,
        "name": string,
        "address": string,
        "decimals": number,
        "logoURI": string
    },
    "toToken": {
        "symbol": string,
        "name": string,
        "address": string,
        "decimals": number,
        "logoURI": string
    },
    "toTokenAmount": string,
    "fromTokenAmount": string,
    "protocols": string[],
    "tx": {
        "from": string,
        "to": string,
        "data": string,
        "value": string,
        "gasPrice": string,
        "gas": string
    }
}
export type  QuoteCustomArg = Omit<Omit<QuoteArg, "fromTokenAddress">, "toTokenAddress"> & {
    fromTokenAddress: Token
    toTokenAddress: Token
}
export type  SwapCustomArg = Omit<Omit<SwapArg, "fromTokenAddress">, "toTokenAddress"> & {
    fromTokenAddress: Token
    toTokenAddress: Token
}
export type  SwapArg = {
    fromTokenAddress: string;
    toTokenAddress: string
    amount: string | number;
    fromAddress: string;
    slippage: number //  min: 0; max: 50;
    //optional
    protocols?: "all" | string //default all
    destReceiver?: string //default fromAddress
    referrerAddress?: string
    fee?: "0" | "1" | "2" | "3" //default 0; max 3
    gasPrice?: string // default fast
    disableEstimate?: boolean
    burnChi?: boolean//deafault false
    allowPartialFill?: boolean
    virtualParts?: number // default: 40; max: 500;
    parts?: number //default: 40; max: 100
    mainRouteParts?: number //default 10; max 50 
    connectorTokens?: number //max: 5
    complexityLevel?: "0" | "1" | "2" | "3" //default 2; max 3
    gasLimit?: string
}
export type  QuoteArg = {
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string | number,
    //optional
    protocols?: "all" | string //default all
    fee?: "0" | "1" | "2" | "3" //default 0; max 3
    gasLimit?: string
    connectorTokens?: number //max: 5
    complexityLevel?: "0" | "1" | "2" | "3" //default 2; max 3
    mainRouteParts?: number //default 10; max 50 
    virtualParts?: number // default: 40; max: 500;
    parts?: number //default: 40; max: 100
    gasPrice?: string // default fast
}
export type  Quote = {
    "fromToken": {
        "symbol": string,
        "name": string,
        "address": string,
        "decimals": number,
        "logoURI": string
    },
    "toToken": {
        "symbol": string,
        "name": string,
        "address": string,
        "decimals": number,
        "logoURI": string
    },
    "toTokenAmount": string,
    "fromTokenAmount": string,
    "protocols": [
        {
            "name": string,
            "part": number,
            "fromTokenAddress": string,
            "toTokenAddress": string
        }
    ],
    "estimatedGas": number
}
export type  QuoteExt = Quote & {
    "estimatedGasCoin": string
}
export type  Preset = {
    "MAX_RESULT": [
        {
            "complexityLevel": number,
            "mainRouteParts": number,
            "parts": number,
            "virtualParts": number
        }
    ],
    "LOWEST_GAS": [
        {
            "complexityLevel": number,
            "mainRouteParts": number,
            "parts": number,
            "virtualParts": number
        }]
}
export type  Token = {
    "symbol": string,
    "name": string,
    "address": string,
    "decimals": number,
    "logoURI": string
}
export type  Tokens = {
    "tokens": Token[]
}
export type  LiquiditySource = {
    "id": string,
    "title": string,
    "img": string
}
export type  LiquiditySources = {
    "protocols": LiquiditySource[]
}
export type  HealthCheck = {
    "status": "OK" | "NOK"
}
export type  ApproveAllowance = {
    "allowance": string
}
export type  ApproveSpender = {
    "address": string
}
export type  ApproveTransaction = {
    "data": string,
    "gasPrice": string,
    "to": string,
    "value": string
}