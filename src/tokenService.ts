import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { binance, OrderBook, Market, Order, OrderNotFound, Fee, Balances, OrderImmediatelyFillable } from "ccxt";
import { ethers } from "ethers";
import { ERC20 } from "typechain-types/ERC20";
import { AppService } from "./appService";
import { appErrors } from "./errors";
import { DateUtils, UnitUtils } from "./utils";

type TokenBalance = { balance: string, price?: string }

export class TokenService {
    private binance: binance;
    private erc20 = new Map<string, ERC20>();
    private decimals = new Map<string, number>();
    private symbols = new Map<string, string>();
    constructor(public appService: AppService) {
        this.binance = new binance({
            timeout: 30 * 1000,//30s
            recvWindow: 30 * 1000, //30s
            adjustForTimeDifference: true,
        })
        this.binance.fetchMarkets();
    }

    public getMyTokenInfos() {
        const conf = this.appService.appConfig.token;
        return {
            "symbol": conf.mySymbol,
            "name": conf.myName,
            "address": conf.myContract,
            "decimals": conf.myDecimals
        }
    }

    public async getERC20(tokenAddr: string) {
        if (!this.erc20.has(tokenAddr)) {
            const wallet = await this.appService.authService.getWallet();
            this.erc20.set(tokenAddr, wallet.getERC20(tokenAddr));
        }
        return this.erc20.get(tokenAddr)!;
    }

    public async getDecimals(tokenAddr: string) {
        const erc20 = await this.getERC20(tokenAddr);
        if (!this.decimals.has(tokenAddr)) {
            this.decimals.set(tokenAddr, await erc20.decimals());
        }
        return this.decimals.get(tokenAddr)!;
    }

    protected async getSymbol(tokenAddr: string) {
        const erc20 = await this.getERC20(tokenAddr);
        if (!this.symbols.has(tokenAddr)) {
            this.symbols.set(tokenAddr, await erc20.symbol());
        }
        return this.symbols.get(tokenAddr)!;
    }

    async getTokenContractInfos() {
        const token = await this.appService.tokenContractR();
        const owner = await token.owner();
        const balanceP = token.balanceOf(owner)
        const symbolP = token.symbol()
        const totalP = token.totalSupply()
        const decimalP = token.decimals()
        const nameP = token.name()
        const defautOp = token.defaultOperators()
        const contractAddress = token.address;
        return {
            owner,
            contractAddress,
            balance: await balanceP,
            symbol: await symbolP,
            total: await totalP,
            decimal: await decimalP,
            name: await nameP,
            defautOp: await defautOp,
        }
    }

    async getSaleContractInfos() {
        const sale = await this.appService.saleContractR();
        const owner = await sale.owner();
        const paused = sale.paused();
        const config = sale.saleConfig();
        const infos = sale.saleInfos();
        const remain = sale.saleRemain();
        const saled = sale.saled();
        const contractAddress = sale.address;
        return {
            owner,
            contractAddress,
            paused: await paused,
            config: await config,
            infos: await infos,
            remain: await remain,
            saled: await saled,
        }
    }


    async getStakeContractInfos() {
        const stake = await this.appService.stakeContractR();
        const owner = await stake.owner();
        const paused = stake.paused();
        const config = stake.stakeConfig();
        const infos = stake.stackingInfos();
        const contractAddress = stake.address;
        return {
            owner,
            contractAddress,
            paused: await paused,
            config: await config,
            infos: await infos,
        }
    }

    async setStakeConfig(config: StakeAdmin) {
        const stake = await this.appService.stakeContractRW();
        if (config.type == "pause") {
            if (config.make == "pause") {
                return (await stake.pause()).wait();
            } else {
                return (await stake.unpause()).wait();
            }
        }
        const { type, ...others } = config;
        return await (await stake.setConfig({ ...others })).wait()
    }

    async configSale(config: SaleAdmin) {
        const sale = await this.appService.saleContractRW();
        const token = await this.appService.tokenContractRW();
        if (config.type == "config") {
            const { type, ...others } = config;
            return (await sale.setConfig({ ...others })).wait();
        } else if (config.type == "pause") {
            if (config.make == "pause") {
                return (await sale.pause()).wait();
            } else {
                return (await sale.unpause()).wait();
            }
        } else if (config.type == "change") {
            const precision = UnitUtils.addPrecisionFrom(config.amount);
            if (config.make == "increase") {
                return (await token.send(sale.address, precision, [])).wait();
            } else {
                return (await sale.decrease(precision)).wait();
            }
        }
        return null;
    }

    async onBalanceChange(callback: (balance: string) => void) {
        const wallet = await this.appService.authService.getWallet();
        const user = await this.appService.authService.getUser();
        let loading = false;
        let previous: string;
        const cb = async () => {
            try {
                if (loading) return;
                loading = true;
                const balanceOf = await wallet.getBalance(user.address);
                const balance = UnitUtils.removePrecisionStr(balanceOf, 3);
                //add native balance if missing
                const current = balance.toString();
                if (current != previous) {
                    callback(current);
                    previous = current;
                }
            } finally {
                loading = false;
            }
        };
        wallet.provider.on("block", cb)
        return () => wallet.provider.off("block", cb)
    }

    async onMyTokenChange(callback: (balance: string) => void) {
        const wallet = await this.appService.authService.getWallet();
        const user = await this.appService.authService.getUser();
        const tokenContract = await this.appService.tokenContractR();
        let loading = false;
        let previous: string;
        const cb = async () => {
            try {
                if (loading) return;
                loading = true;
                const balanceOf = await tokenContract.balanceOf(user.address);
                const balance = UnitUtils.removePrecisionStr(balanceOf, 3);
                //add native balance if missing
                const current = balance.toString();
                if (current != previous) {
                    callback(current);
                    previous = current;
                }
            } finally {
                loading = false;
            }
        };
        wallet.provider.on("block", cb)
        return () => wallet.provider.off("block", cb)
    }

    async listenTransfer(tokenAddr: string, callback: (from?: string, to?: string, value?: string) => void) {
        const contract = await this.getERC20(tokenAddr);
        const filter = contract.interface.getEvent("Transfer").format();
        contract.on(filter, callback);
        return () => contract.off(filter, callback)
    }

    async listenApproval(tokenAddr: string, callback: (owner?: string, spender?: string, value?: string) => void) {
        const contract = await this.getERC20(tokenAddr);
        const filter = contract.interface.getEvent("Approval").format();
        contract.on(filter, callback);
        return () => contract.off(filter, callback)
    }

    async getQuoteForOne(symbol: string): Promise<string> {
        try {
            const { usdSymbol } = this.appService.appConfig.token;
            const tick = await this.binance.fetchTicker(symbol + usdSymbol);
            return `${tick!.last}`;
        } catch (e) {
            return "";
        }
    }

    async getQuoteFor(symbols: string[]): Promise<Map<string, string>> {
        const { usdSymbol } = this.appService.appConfig.token;
        const mapSymbol = new Map<string, string>();
        const allSymbols = symbols.map(s => {
            const sym1 = s + "/" + usdSymbol
            const sym2 = s + "_" + usdSymbol
            const sym3 = s + usdSymbol
            mapSymbol.set(s, s)
            mapSymbol.set(sym1, s)
            mapSymbol.set(sym2, s)
            mapSymbol.set(sym3, s)
            return [sym1, sym2, sym3]
        }).reduce((p, c) => [...p, ...c], [])
        const all = await this.binance.fetchTickers(allSymbols);
        const quotes: Map<string, string> = new Map;
        for (const a in all) {
            if (mapSymbol.has(a)) {
                quotes.set(mapSymbol.get(a)!, `${all[a]!.last}`)
            }
        }
        return quotes;
    }

    async getNativeTokenBalance(): Promise<TokenBalance> {
        const { nativeSymbol } = this.appService.appConfig.token;
        const wallet = await this.appService.authService.getWallet();
        const user = await this.appService.authService.getUser();
        const balance = await wallet.getBalance(user.address);
        //add native balance if missing
        const tok: TokenBalance = { balance: UnitUtils.removePrecisionStr(balance) || "0" };
        const price = await this.getQuoteForOne(nativeSymbol)
        tok.price = price;
        return tok;
    }

    async getNativeTokenBalanceFor(address: string): Promise<TokenBalance> {
        const { nativeSymbol } = this.appService.appConfig.token;
        const wallet = await this.appService.authService.getWallet();
        const balance = await wallet.getBalance(address);
        //add native balance if missing
        const tok: TokenBalance = { balance: UnitUtils.removePrecisionStr(balance) || "0" };
        const price = await this.getQuoteForOne(nativeSymbol)
        tok.price = price;
        return tok;
    }

    async getMyTokenBalance(): Promise<TokenBalance> {
        const user = await this.appService.authService.getUser();
        const tokenContract = await this.appService.tokenContractR();
        const balanceOf = await tokenContract.balanceOf(user.address);
        const balance = UnitUtils.removePrecisionStr(balanceOf, 3);
        //add native balance if missing
        const tok: TokenBalance = { balance };
        tok.price = await this.getMyTokenQuote();
        return tok;
    }

    async getTokenBalance(tokenAddr: string): Promise<TokenBalance> {
        const signer = await this.appService.authService.getSigner();
        const user = await this.appService.authService.getUser();
        const tokenContract = await this.getERC20(tokenAddr);
        const symbol = await this.getSymbol(tokenAddr);
        const balanceOf = await tokenContract.connect(signer).balanceOf(user.address);
        const balance = UnitUtils.removePrecisionStr(balanceOf, 3);
        //add native balance if missing
        const tok: TokenBalance = { balance };
        tok.price = await this.getQuoteForOne(symbol);
        return tok;
    }

    async getTokenBalanceFor(tokenAddr: string, forAddress?: string): Promise<TokenBalance> {
        const signer = await this.appService.authService.getSigner();
        const tokenContract = await this.getERC20(tokenAddr);
        const symbol = await this.getSymbol(tokenAddr);
        const user = await this.appService.authService.getUser();
        forAddress = forAddress || user.address;
        const balanceOf = await tokenContract.connect(signer).balanceOf(forAddress);
        const balance = UnitUtils.removePrecisionStr(balanceOf, 3);
        //add native balance if missing
        const tok: TokenBalance = { balance };
        tok.price = await this.getQuoteForOne(symbol);
        return tok;
    }

    async getMyTokenQuote() {
        //TODO
        const { price } = this.appService.appConfig.token;
        return price;
    }

    async buyInfos(): Promise<BuyInfos> {
        const saleContract = await this.appService.saleContractR();
        const saleContractRW = await this.appService.saleContractRW();
        const canBuyMaxP = saleContractRW.canBuyMax();
        const saleConfigP = saleContract.saleConfig();
        const saleInfoP = saleContract.saleInfos();
        const canBuyMax = await canBuyMaxP;
        const { endDate, maxPerUser, startDate, tokenAddress, tokenPerCoin, tokenQuotes, validator, validatorRequire } = await saleConfigP;
        const { countHolders, countSale, endAt, saleCommit, saleMax, saleRemain, startAt } = await saleInfoP;
        return { countHolders, countSale, endAt, saleCommit, saleMax, saleRemain, startAt, endDate, maxPerUser, startDate, tokenAddress, tokenPerCoin, tokenQuotes, validator, validatorRequire, canBuyMax };
    }

    async buyUsingCoin(coin: number): Promise<TokenBalance> {
        const user = await this.appService.authService.getUser();
        const saleContract = await this.appService.saleContractRW();
        const precision = ethers.utils.parseEther(coin.toString());
        const signature = await this.appService.signerService.saleHashNative(user.address, precision);
        await (await saleContract.saleNative(signature, { value: precision })).wait();
        return this.getMyTokenBalance();
    }

    async buyUsingCoinEstimate(coin: number): Promise<BigNumber> {
        const user = await this.appService.authService.getUser();
        const saleContract = await this.appService.saleContractRW();
        const precision = ethers.utils.parseEther(coin.toString());
        const signature = await this.appService.signerService.saleHashNative(user.address, precision);
        const gas = await saleContract.estimateGas.saleNative(signature, { value: precision });
        return gas;
    }

    async buyUsingToken(tokens: number, fromTokenAddress: string): Promise<TokenBalance> {
        const signer = await this.appService.authService.getSigner();
        const user = await this.appService.authService.getUser();
        const fromContract = await this.getERC20(fromTokenAddress);
        const saleContract = this.appService.saleContract;
        const decimals = await this.getDecimals(fromTokenAddress);
        const precision = UnitUtils.addPrecision(tokens, decimals)
        const signature = await this.appService.signerService.saleHashToken(user.address, precision, fromTokenAddress);
        //check allowance
        const allowed = await fromContract.allowance(user.address, saleContract.address);
        if (precision.gt(allowed)) {
            const approveAmount = this.appService.getApproveLimitFromPrecision(precision);
            await (await fromContract.connect(signer).approve(saleContract.address, approveAmount)).wait();
        }
        await (await saleContract.connect(signer).saleToken(precision, fromTokenAddress, signature)).wait();
        return this.getMyTokenBalance();
    }

    async buyUsingTokenEstimate(tokens: number, fromTokenAddress: string): Promise<BigNumber> {
        const signer = await this.appService.authService.getSigner();
        const user = await this.appService.authService.getUser();
        const fromContract = await this.getERC20(fromTokenAddress);
        const saleContract = this.appService.saleContract;
        const decimals = await this.getDecimals(fromTokenAddress);
        const precision = UnitUtils.addPrecision(tokens, decimals)
        const signature = await this.appService.signerService.saleHashToken(user.address, precision, fromTokenAddress);
        //check allowance
        const allowed = await fromContract.allowance(user.address, saleContract.address);
        let estimation = BigNumber.from(0);
        if (precision.gt(allowed)) {
            const approveAmount = this.appService.getApproveLimitFromPrecision(precision);
            const tmp = await fromContract.connect(signer).estimateGas.approve(saleContract.address, approveAmount);
            estimation = estimation.add(tmp);
        }
        const tmp = await saleContract.connect(signer).estimateGas.saleToken(precision, fromTokenAddress, signature);
        return estimation.add(tmp);
    }

    async sendCoin(coin: BigNumberish, receiver: string): Promise<TokenBalance> {
        const signer = await this.appService.authService.getSigner();
        const tx = {
            to: receiver,
            value: ethers.utils.parseEther(coin.toString()),
        }
        await (await signer.sendTransaction(tx)).wait();
        return this.getNativeTokenBalance();
    }

    async sendCoinEstimate(coin: BigNumberish, receiver: string): Promise<BigNumber> {
        const signer = await this.appService.authService.getSigner();
        const tx = {
            to: receiver,
            value: ethers.utils.parseEther(coin.toString()),
        }
        const tmp = (await signer.estimateGas(tx));
        return tmp;
    }

    async sendToken(coin: BigNumberish, receiver: string, tokenAddr: string): Promise<TokenBalance> {
        const signer = await this.appService.authService.getSigner();
        const tokenContract = await this.getERC20(tokenAddr);
        const decimals = await this.getDecimals(tokenAddr);
        const precision = UnitUtils.addPrecision(coin, decimals);
        await (await tokenContract.connect(signer).transfer(receiver, precision)).wait();
        return this.getTokenBalanceFor(tokenAddr);
    }

    async sendTokenEstimate(coin: BigNumberish, receiver: string, tokenAddr: string): Promise<BigNumber> {
        const signer = await this.appService.authService.getSigner();
        const tokenContract = await this.getERC20(tokenAddr);
        const decimals = await this.getDecimals(tokenAddr);
        const precision = UnitUtils.addPrecision(coin, decimals);
        const tmp = (await tokenContract.connect(signer).estimateGas.transfer(receiver, precision));
        return tmp;
    }

    async stakeToken(amount: number) {
        const now = DateUtils.nowSeconds();
        const tokenContract = await this.appService.tokenContractRW();
        const stakeContract = this.appService.stakeContract;
        const decimals = await this.getDecimals(tokenContract.address);
        const precision = UnitUtils.addPrecision(amount, decimals);
        const infos = await this.stakeInfos();
        const remain = + infos.stakeRemain;
        if (remain <= 0) {
            appErrors.stakeRemainEmpty();
        }
        if (infos.startAtBg.gt(now)) {
            appErrors.stakeNotStarted();
        }
        if (infos.endAtBg.lt(now)) {
            appErrors.stakeEnded();
        }
        await (await tokenContract.send(stakeContract.address, precision, [])).wait();
        return this.stakingOf();
    }

    async stakeInfos() {
        const stakeContract = await this.appService.stakeContractR();
        const { startAt, endAt, stakeTotal, stakeRemain, stakeMax, rewardTotal, rewardRemain, rewardPercent, rewardDistribute } = await stakeContract.stackingInfos();
        return {
            startAtBg: startAt,
            endAtBg: endAt,
            startAt: DateUtils.fromSeconds(startAt),
            endAt: DateUtils.fromSeconds(endAt),
            stakeTotal: UnitUtils.removePrecisionStr(stakeTotal),
            stakeRemain: UnitUtils.removePrecisionStr(stakeRemain),
            stakeMax: UnitUtils.removePrecisionStr(stakeMax),
            rewardTotal: UnitUtils.removePrecisionStr(rewardTotal),
            rewardRemain: UnitUtils.removePrecisionStr(rewardRemain),
            rewardPercent: rewardPercent.toString(),
            rewardDistribute: UnitUtils.removePrecisionStr(rewardDistribute),
        }
    }

    async stakeHistory(forAddress?: string) {
        const user = await this.appService.authService.getUser();
        forAddress = forAddress || user.address;
        const stakeContract = this.appService.stakeContract;
        return stakeContract.historyOf(forAddress);
    }

    async stakingOf(forAddress?: string) {
        const user = await this.appService.authService.getUser();
        forAddress = forAddress || user.address;
        const stakeContract = await this.appService.stakeContractR();
        const { closed, startAt, endAt, staked, paid, earned } = await stakeContract.stakingOf(forAddress);
        return {
            closed,
            startAtBg: startAt,
            endAtBg: endAt,
            startAt: DateUtils.fromSeconds(startAt),
            endAt: DateUtils.fromSeconds(endAt),
            staked: UnitUtils.removePrecisionStr(staked),
            paid: UnitUtils.removePrecisionStr(paid),
            earned: UnitUtils.removePrecisionStr(earned)
        };
    }

    async stakeWithdraw(amount?: number, collect: boolean = false) {
        const user = await this.appService.authService.getUser();
        const stakeContract = await this.appService.stakeContractRW();
        const infos = await stakeContract.stakingOf(user.address);
        if (infos.staked.lte(0)) {
            appErrors.noStakeToWithdraw();
        }
        const safeAmount = amount ? UnitUtils.addPrecision(amount) : infos.staked;
        await (await stakeContract.withdraw(safeAmount, collect)).wait();
        return this.stakingOf(user.address);
    }

    async stakeCollect() {
        const user = await this.appService.authService.getUser();
        const stakeContract = await this.appService.stakeContractRW();
        const total = await this.stakeComputeRewards(user.address);
        if ((+total.topay) <= 0) {
            appErrors.noStakeToCollect();
        }
        await (await stakeContract.collectRewards()).wait();
        return this.stakingOf(user.address);
    }

    async stakeComputeRewards(forAddress?: string) {
        const user = await this.appService.authService.getUser();
        forAddress = forAddress || user.address;
        const stakeContract = await this.appService.stakeContractR();
        const infosP = stakeContract.stakingOf(forAddress);
        const reward = await stakeContract.rewardOf(forAddress);
        const infos = await infosP;
        const earned = infos.earned.add(reward.earned);
        const paid = infos.paid.add(reward.paid);
        const topay = earned.sub(paid);
        return {
            paid: UnitUtils.removePrecisionStr(paid),
            earned: UnitUtils.removePrecisionStr(earned),
            topay: UnitUtils.removePrecisionStr(topay)
        };
    }

    async registerForWhitelist(buyer: string, amount: number, token: string, sponsor?: string) {
        const contract = await this.appService.saleContractRW();
        await (await contract.registerWhitelist(buyer, token, BigNumber.from(amount), sponsor || ethers.constants.AddressZero)).wait();
        const tmp = await contract.whitelist(buyer);
        return tmp;
    }

    async registerForWhitelistEstimate(buyer: string, amount: number, token: string, sponsor?: string) {
        const contract = await this.appService.saleContractR();
        const tmp = await contract.estimateGas.registerWhitelist(buyer, token, BigNumber.from(amount), sponsor || ethers.constants.AddressZero);
        return tmp;
    }

    async checkIfWhitelisted(buyer: string) {
        const contract = await this.appService.saleContractR();
        const tmp = await contract.whitelist(buyer);
        return tmp;
    }

    async seeSponsorShip(address:string) {
        const contract = await this.appService.saleContractR();
        const tmp = await contract.seeSponsorship(address);
        return tmp;
    }

    async seeSponsorShipCount(address:string) {
        const contract = await this.appService.saleContractR();
        const tmp = await contract.seeSponsorshipCount(address);
        return tmp;
    }

    async seeWhitelistCount() {
        const contract = await this.appService.saleContractR();
        const tmp = await contract.whitelistCount();
        return tmp;
    }

    async seeWhitelist(start?: number, limit?: number) {
        const contract = await this.appService.saleContractR();
        if (typeof start != "undefined" && typeof limit != "undefined") {
            const tmp = await contract.seeWhitelist(BigNumber.from(start), BigNumber.from(limit));
            return tmp;
        }
        const tmp = await contract.whitelistCount()
        const promises: Promise<{
            buyer: string;
            token: string;
            amount: BigNumber;
            sponsor: string;
        }>[] = []
        for (let i = 0; i < tmp.toNumber(); i++) {
            const exec = async () => {
                const addr = await contract.whitelistAdresses(i);
                const wh = await contract.whitelist(addr);
                return wh;
            }
            promises.push(exec())
        }
        return Promise.all(promises);
    }
}

export type BuyInfos = {
    canBuyMax: BigNumber
    countHolders: BigNumber;
    countSale: BigNumber;
    endAt: BigNumber;
    saleCommit: BigNumber;
    saleMax: BigNumber;
    saleRemain: BigNumber;
    startAt: BigNumber;
    endDate: BigNumber;
    maxPerUser: BigNumber;
    startDate: BigNumber;
    tokenAddress: string;
    tokenPerCoin: BigNumber;
    tokenQuotes: {
        token: string;
        quote: BigNumber;
        0: string;
        1: BigNumber;
    }[];
    validator: string;
    validatorRequire: boolean;
}

export type SaleAdmin = {
    type: "config",
    endDate: BigNumber;
    startDate: BigNumber;
    maxPerUser: BigNumber;
    tokenAddress: string;
    tokenPerCoin: BigNumber;
    tokenQuotes: { token: string; quote: BigNumber; 0: string; 1: BigNumber }[];
    validator: string;
    validatorRequire: boolean;
} | { type: "pause", make: "pause" | "unpause" }
    | { type: "change", make: "increase" | "decrease", amount: BigNumberish };

export type StakeAdmin = {
    type: "config";
    endDate: BigNumber;
    startDate: BigNumber;
    rewardTotal: BigNumber;
    tokenAddress: string;
    rewardPercent: BigNumber;
} | { type: "pause", make: "pause" | "unpause" }