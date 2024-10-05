import {
    IProviderUserOptions,
    SimpleFunction, Connector, IProviderDisplay
} from "web3modal";
import {
    CONNECT_EVENT,
    ERROR_EVENT,
    CLOSE_EVENT
} from "web3modal";
import { EventController, ProviderController } from "web3modal";
import { Web3Errors } from "./web3Errors";
import { Web3ProviderImpl, Web3ProviderOptions } from "./web3ProviderOptions";

const INITIAL_STATE = { show: false };

const defaultOpts: IProviderControllerOptions = {
    cacheProvider: false,
    disableInjectedProvider: false,
    providerOptions: {},
    network: ""
};
export type Web3Id = "injected" | "walletconnect" | "portis" | "fortmatic"
    | "torus" | "arkane" | "authereum" | "burnerconnect" |
    "mewconnect" | "dcentwallet" | "bitski" | "frame";
export type NetworkId = "mainnet" | "expanse" | "ropsten" | "rinkeby" | "goerli" | "kotti" | "ubiq" | "ubiq-testnet" | "optimism" | "metadium" | "metadium-testnet" | "thundercore-testnet" | "rsk" | "rsk-testnet" | "kovan" | "binance" | "binance-test" | "hardhat-local" | "gochain" | "etc" | "etc-morden" | "etc-testnet" | "ellaism" | "optimism-kovan" | "mix" | "poa-sokol" | "tomochain" | "poa-core" | "xdai" | "etherinc" | "thundercore" | "matic" | "sirius" | "lightstreams" | "freight" | "hpb" | "lisinski" | "callisto" | "callisto-testnet" | "arbitrum" | "mumbai" | "artis-s1" | "artis-t1" | "arbitrum-rinkeby";
export interface IProviderOptionsExt {
    [id: string]: {
        package: any;
        options?: Web3ProviderOptions;
        connector?: Connector;
        display?: Partial<IProviderDisplay>;
    };
}
export interface IProviderControllerOptions {
    disableInjectedProvider: boolean;
    cacheProvider: boolean;
    providerOptions: IProviderOptionsExt;
    network: NetworkId | "";
}
export class Web3Provider {
    static EVENTS = {
        CONNECT_EVENT: CONNECT_EVENT,
        CLOSE_EVENT: CLOSE_EVENT,
        ERROR_EVENT: ERROR_EVENT,
        UPDATE_STATE_EVENT: "UPDATE_STATE_EVENT"
    }
    private show: boolean = INITIAL_STATE.show;
    private eventController: EventController = new EventController();
    private providerController: ProviderController;
    private userOptions: IProviderUserOptions[];
    public state = { ...INITIAL_STATE }
    constructor(opts?: Partial<IProviderControllerOptions>) {
        const options: IProviderControllerOptions = {
            ...defaultOpts,
            ...opts
        };

        this.providerController = new ProviderController({
            disableInjectedProvider: options.disableInjectedProvider,
            cacheProvider: options.cacheProvider,
            providerOptions: options.providerOptions,
            network: options.network
        });

        this.providerController.on(CONNECT_EVENT, provider =>
            this.onConnect(provider)
        );
        this.providerController.on(ERROR_EVENT, error => this.onError(error));

        this.userOptions = this.providerController.getUserOptions();
    }

    get cachedProvider(): string {
        return this.providerController.cachedProvider;
    }

    // --------------- PUBLIC METHODS --------------- //

    public connect = (): Promise<any> =>
        new Promise(async (resolve, reject) => {
            try {
                this.on(CONNECT_EVENT, provider => resolve(provider));
                this.on(ERROR_EVENT, error => {
                    console.error("[Web3Provider.connect] onError", error);
                    reject(!!error ? Web3Errors.ProviderError : Web3Errors.NoProvider);
                });
                this.on(CLOSE_EVENT, () => reject(Web3Errors.ProviderClosed));
                await this.toggleModal();
            } catch (e) {
                console.error("[Web3Provider.connect] catch", e);
                reject(Web3Errors.ProviderError);
            }
        });

    public connectTo = (id: Web3Id): Promise<Web3ProviderImpl> =>
        new Promise(async (resolve, reject) => {
            try {
                this.on(CONNECT_EVENT, provider => resolve(provider));
                this.on(ERROR_EVENT, error => {
                    console.error("[Web3Provider.connectTo] onError", error);
                    reject(!!error ? Web3Errors.ProviderError : Web3Errors.NoProvider);
                });
                this.on(CLOSE_EVENT, () => reject(Web3Errors.ProviderClosed));
                const provider = this.providerController.getProvider(id);
                if (!provider) {
                    return reject(new Error(Web3Errors.UnknownProvider));
                }
                await this.providerController.connectTo(provider.id, provider.connector);
            } catch (e) {
                console.error("[Web3Provider.connectTo] catch", e);
                reject(Web3Errors.ProviderError);
            }
        });

    public async toggleModal(): Promise<void> {
        if (this.cachedProvider) {
            await this.providerController.connectToCachedProvider();
            return;
        }
        if (
            this.userOptions &&
            this.userOptions.length === 1 &&
            this.userOptions[0]!.name
        ) {
            await this.userOptions[0]!.onClick();
            return;
        }
        this._toggleModal();
    }

    public on(event: string, callback: SimpleFunction): SimpleFunction {
        this.eventController.on({
            event,
            callback
        });

        return () =>
            this.eventController.off({
                event,
                callback
            });
    }

    public off(event: string, callback?: SimpleFunction): void {
        this.eventController.off({
            event,
            callback
        });
    }

    public clearCachedProvider(): void {
        this.providerController.clearCachedProvider();
    }

    public setCachedProvider(id: string): void {
        this.providerController.setCachedProvider(id);
    }

    public getModalState() {
        return {
            state: this.state,
            userOptions: this.userOptions,
            onClose: this.onClose,
            resetState: this.resetState
        }
    }

    // --------------- PRIVATE METHODS --------------- //

    private _toggleModal = () => {
        this.updateState({ show: !this.show });
    };

    private onError = (error: any) => {
        if (this.show) {
            this._toggleModal();
        }
        this.eventController.trigger(ERROR_EVENT, error);
    };

    private onConnect = (provider: Web3ProviderImpl) => {
        if (this.show) {
            this._toggleModal();
        }
        this.eventController.trigger(CONNECT_EVENT, provider);
    };

    private onClose = () => {
        if (this.show) {
            this._toggleModal();
        }
        this.eventController.trigger(CLOSE_EVENT);
    };

    private updateState = (state: { show: boolean }) => {
        this.state = state;
        this.eventController.trigger(Web3Provider.EVENTS.UPDATE_STATE_EVENT, state);
    };

    private resetState = () => this.updateState({ ...INITIAL_STATE });
}

