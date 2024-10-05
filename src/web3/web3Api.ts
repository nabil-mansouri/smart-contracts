import { providers, } from "ethers";
import * as web3Modal from "web3modal";
import { verifyInjectedProvider, checkInjectedProviders, IProviderInfo, getChainId, CHAIN_DATA_LIST, EventController } from "web3modal";
import { Web3Errors } from "./web3Errors";
import { IProviderControllerOptions, NetworkId as NID, Web3Id as WID, Web3Provider, IProviderOptionsExt as IPEXT } from "./web3Provider";
import { Web3Wallet, Web3Network as WEBN } from "./web3Wallet";
export type Web3Id = WID;
export type NetworkId = NID;
export type Web3Network = WEBN;
export type IProviderOptionsExt = IPEXT;
export { Web3Wallet, EventController }

export class Web3Api {
    public static web3ProviderSource: () => Promise<Web3Id> = () => {
        throw Web3Errors.Web3IdSourceNotInit;
    }

    static getChainData(network: NetworkId): web3Modal.ChainData | undefined {
        return Object.values(CHAIN_DATA_LIST).filter(e => e.network == network)[0];
    }

    static getChainId(network: NetworkId) {
        if (!CHAIN_DATA_LIST[97]) {
            CHAIN_DATA_LIST[97] = {
                chainId: 97,
                chain: "BSCTest",
                network: "binance-test",
                networkId: 97
            };
        }
        if (!CHAIN_DATA_LIST[31337]) {
            CHAIN_DATA_LIST[31337] = {
                chainId: 31337,
                chain: "HardhatLocal",
                network: "hardhat-local",
                networkId: 31337
            };

        }
        return getChainId(network);
    }

    static isProviderAvailable(id: Web3Id) {
        const injected = web3Modal.injected as any;
        const providers = web3Modal.providers as any;
        let info: IProviderInfo = injected[id];
        if (info) {
            const isAvailable = verifyInjectedProvider(info.check);
            return isAvailable;
        }
        info = providers[id];
        if (info) {
            //SHOULD we test non injected provider?
            //const isAvailable = verifyInjectedProvider(info.check);
            return true;
        }
        return false;
    }

    static getCached(options: Partial<Web3APiConnectOptions>): Web3Id {
        const web3Modal = new Web3Provider(options);
        return web3Modal.cachedProvider as any;
    }

    static async connectTo(id: Web3Id, options: Partial<Web3APiConnectOptions>): Promise<Web3Wallet> {
        const web3Modal = new Web3Provider(options);
        const provider = await web3Modal.connectTo(id);
        const wallet = new providers.Web3Provider(provider, 'any');
        const web3W = new Web3Wallet(wallet, web3Modal);
        await web3W.provider.ready;
        //force chain if needed
        if (options.switchToNetwork && options.network) {
            const chainId = await web3W.getChainId();
            const forcedChainId = Web3Api.getChainId(options.network as NetworkId);
            if (forcedChainId != chainId) {
                await web3W.switchToChain(forcedChainId, !!options.createNetworkIfNeeded, options.createNetworkIfNeeded);
            }
            const reload = async () => {
                const chainId = await web3W.getChainId();
                if (forcedChainId != chainId) {
                    await web3W.switchToChain(forcedChainId, !!options.createNetworkIfNeeded, options.createNetworkIfNeeded);
                }
            }
            //autoswitch
            web3W.onNetworkChanged(reload);
        }
        //sign if needed
        if (options.signMessage) {
            try {
                const signature = await web3W.signMessage(options.signMessage!);
                if (!signature) {
                    throw new Error(Web3Errors.SignFailed);
                }
                web3W.state.signature = signature;
            } catch (e) {
                throw new Error(Web3Errors.SignFailed);
            }
        }
        return web3W;
    }

    static checkInjectedProvider(id: Web3Id) {
        return verifyInjectedProvider(id);
    }

    static getAvailableInjectedProvider() {
        return checkInjectedProviders();
    }

}

export type Web3APiConnectOptions = IProviderControllerOptions & { switchToNetwork: boolean, signMessage: string, createNetworkIfNeeded: Web3Network }