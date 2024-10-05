import { providers, Signer } from "ethers";
import { AppService } from "./appService";
import { appErrors } from "./errors";
import { Web3Api, Web3Wallet, EventController } from "./web3/web3Api";
import { Web3Id, Web3Provider } from "./web3/web3Provider";

type User = {
    address: string;
}
enum AuthEvents{
    CONNECT= 'CONNECT',
    AUTHENTICATE= 'AUTHENTICATE',
    DISCONNECT= 'DISCONNECT',
    ACCOUNT_CHANGED = 'ACCOUNT_CHANGED',
    NETWORK_CHANGED = 'NETWORK_CHANGED'
}
export class AuthService {
    private _user?: User;
    private _wallet?: Web3Wallet;
    private eventController = new EventController;
    public ready?:Promise<Web3Wallet|undefined>; 
    constructor(private appService: AppService) { }

    async checkCurrentNetwork(){
        if(!this._wallet){
            appErrors.notAuthenticated();
        }
        const { network } = this.appService.appConfig.authenticate;
        const forcedChainId = Web3Api.getChainId(network!);
        const chainId = await this._wallet?.getChainId();
        return chainId == forcedChainId;
    }


    async switchToNetwork(){
        const { network, createNetworkIfNeeded } = this.appService.appConfig.authenticate;
        const forcedChainId = Web3Api.getChainId(network!);
        await this._wallet?.switchToChain(forcedChainId,!!createNetworkIfNeeded,createNetworkIfNeeded);
        return this.checkCurrentNetwork();
    }

    async tryConnect(logoutIfNeeded:boolean):Promise<Web3Wallet|undefined>{
        const r = async ()=>{
            if(this.appService.isNode) return;
            const { signMessage, switchToNetwork, createNetworkIfNeeded, providerOptions, network } = this.appService.appConfig.authenticate;
            const cached = Web3Api.getCached({ network, createNetworkIfNeeded, providerOptions, signMessage, switchToNetwork, cacheProvider: true })
            try{
                if(logoutIfNeeded){
                    await this.logout();
                }
                const res = await this.connect(cached);
                return res;
            }catch(e){
                return undefined;
            }
        }
        this.ready = r();
        return this.ready;
    }

    protected registerCallback<T>(event:AuthEvents, callback: (arg?:T) => void){
        const eventObj = { event, callback };
        this.eventController.on(eventObj)
        return () => {
            this.eventController.off(eventObj)
        }
    }

    onAuthenticated(callback: () => void): () => void {
        return this.registerCallback(AuthEvents.AUTHENTICATE, callback);
    }

    onConnect(callback: () => void): () => void {
        return this.registerCallback(AuthEvents.CONNECT, callback);
    }

    onDisconnect(callback: () => void) {
        return this.registerCallback(AuthEvents.DISCONNECT, callback);
    }

    onAccountChanged(callback: () => void) {
        return this.registerCallback(AuthEvents.ACCOUNT_CHANGED, callback);
    }

    onNetworkChanged(callback: () => void) {
        return this.registerCallback(AuthEvents.NETWORK_CHANGED, callback);
    }

    checkInjectedProvider(id:Web3Id){
        return Web3Api.checkInjectedProvider(id);
    }

    getAvailableInjectedProvider(){
        return Web3Api.getAvailableInjectedProvider();
    }

    async connect(source:Web3Id){
        if (this._wallet) {
            return this._wallet;
        }
        if(!source){
            appErrors.notAuthenticated();
        }
        const { signMessage, switchToNetwork, createNetworkIfNeeded, providerOptions, network } = this.appService.appConfig.authenticate;
        this._wallet = await Web3Api.connectTo(source, { network, createNetworkIfNeeded, providerOptions, signMessage, switchToNetwork, cacheProvider: true })
        this._user = { address: await this._wallet.getAddress() };
        this._wallet.onConnectChanged(()=>{
            this.eventController.trigger(AuthEvents.CONNECT);
        })
        this._wallet.onDisconnectChanged(()=>{
            this.eventController.trigger(AuthEvents.DISCONNECT);
        })
        this._wallet.onAccounChanged(async ()=>{
            this.eventController.trigger(AuthEvents.ACCOUNT_CHANGED);
        })
        this._wallet.onNetworkChanged(()=>{
            this.eventController.trigger(AuthEvents.NETWORK_CHANGED);
        })
        this._wallet.onChainChanged(()=>{
            this.eventController.trigger(AuthEvents.NETWORK_CHANGED);
        })
        this.eventController.trigger(AuthEvents.AUTHENTICATE)
        return this._wallet;
    }

    async getWallet() {
        if (this._wallet) {
            return this._wallet;
        }
        if(!this.appService.isNode) {
            const { signMessage, switchToNetwork, createNetworkIfNeeded, providerOptions, network } = this.appService.appConfig.authenticate;
            const cached = Web3Api.getCached({ network, createNetworkIfNeeded, providerOptions, signMessage, switchToNetwork, cacheProvider: true })
            if(cached){
                return this.connect(cached);
            }
        }
        const source = await Web3Api.web3ProviderSource();
        return this.connect(source);
    }

    async getUser() {
        await this.getWallet();
        return this._user!;
    }

    async getSigner(): Promise<Signer> {
        const wallet = await this.getWallet();
        return wallet.getSignerForUser(this._user?.address!);
    }

    public get currentUser() {
        return this._user;
    }

    public get currentUserAddress() {
        return this._user?.address;
    }

    get isAuthenticated() {
        const res = this._user;
        const wallet = this._wallet;
        return typeof res != "undefined" && res != null && typeof wallet != "undefined" && wallet != null;
    }

    forceProvider(provider: providers.Web3Provider) {
        const { providerOptions, network } = this.appService.appConfig.authenticate;
        const web3Modal = typeof window.navigator=="undefined"?null: new Web3Provider({ providerOptions, network });
        this._wallet = new Web3Wallet(provider, web3Modal!);
    }

    forceUser(address: string) {
        this._user = { address };
        this._wallet && (this._wallet.forceAddress = address);
    }

    async logout() {
        try{
            localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
        }catch(e){}
        this._wallet?.w3Provider.clearCachedProvider();
        this._wallet = undefined;
        this._user = undefined;
    }

    isProviderAvailable(id: Web3Id) { return Web3Api.isProviderAvailable(id); }
}