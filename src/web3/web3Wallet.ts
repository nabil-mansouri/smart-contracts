import { BigNumber, Contract, ContractFactory, ethers, providers, Wallet, } from "ethers";
import { ERC20Factory } from "../../typechain-types/ERC20Factory";
import { Web3Errors } from "./web3Errors";
import { Web3Provider } from "./web3Provider";
import ethUtil from 'ethereumjs-util';
import * as sigUtil from "eth-sig-util";
const cryptico = require("cryptico-js");
import { globalAppConfig } from "@config";

export type Web3Network = { chainId: string, chainName: string, rpcUrls: string[], nativeCurrency: { name: string, symbol: string, decimals: number, blockExplorerUrls: string[] } }

export class Web3Wallet {
    forceAddress?:string;
    public state: { signature?: string } = {
        signature: undefined
    }
    constructor(public provider: providers.Web3Provider, public w3Provider: Web3Provider) { };

    getBalance(address: string) { return this.provider.getBalance(address); }

    async getMyBalance() { return this.getBalance(await this.getAddress()); }

    getSigner() { return this.provider.getSigner(); }

    getSignerForUser(address: string) { return this.provider.getSigner(address); }

    getChainId(): Promise<number> { return this.provider.send("eth_chainId", []); }

    async getAddress(): Promise<string> { 
        if(this.forceAddress){
            return this.forceAddress!;
        }
        return (this.provider).listAccounts().then(e => e[0]!); 
    }

    signMessage(message: string) { return this.getSigner().signMessage(message); }

    onMessage(callback: () => void) {
        (this.provider.provider as any).on("message", callback);
    }

    onAccounChanged(callback: (accounts: string[]) => void) {
        (this.provider.provider as any).on("accountsChanged", callback);
    }

    onChainChanged(callback: (chain: number) => void) {
        (this.provider.provider as any).on("chainChanged", callback);
    }

    onConnectChanged(callback: (info: { chainId: number }) => void) {
        (this.provider.provider as any).on("connect", callback);
    }

    onDisconnectChanged(callback: (error: { code: number; message: string }) => void) {
        (this.provider.provider as any).on("disconnect", callback);
    }

    onUpdate(callback: (error: { code: number; message: string }) => void) {
        (this.provider.provider as any).on("update", callback);
    }

    onNetworkChanged(callback: (newNetwork: providers.Network, oldNetwork?: providers.Network) => void) {
        this.provider.on("network", callback);
    }

    async switchToChain(chainId: number, createIfNotExists: boolean, network?: Web3Network) {
        try {
            const toHex = ethers.utils.hexStripZeros(BigNumber.from(chainId).toHexString());
            await this.provider.send("wallet_switchEthereumChain", [{ chainId: toHex }]);
        } catch (error) {
            if ((error as any).code === 4902) {
                if (createIfNotExists) {
                    await this.createNetwork(network!);
                } else {
                    throw Web3Errors.NetworkNotFound;
                }
            } else {
                console.error("[switchToChain] ", error);
            }
        }
    }

    async createNetwork(network: Web3Network) {
        try {
            await this.provider.send("wallet_addEthereumChain", [network]);
        } catch (error) {
            throw Web3Errors.NetworkCreateFailed
        }
    }

    static passPhraseText = globalAppConfig.authenticate.encryptMessage;
    static cacheRSA = new Map<string, any>();
    static enableCacheRsa = true;
    static enableCachePassphrase = true;
    static enableEncryptLegacy = true;
    static signPassphrases = new Map<string, Promise<string>>();
    async signPassphrase(sign?:(text:string)=>Promise<string>):Promise<string>{
        const signer = this.getSigner();
        const address = await this.getAddress()
        if(Web3Wallet.enableCachePassphrase && Web3Wallet.signPassphrases.has(address)){
            return Web3Wallet.signPassphrases.get(address)!;
        }
        const tmp = sign ? sign(Web3Wallet.passPhraseText) : signer.signMessage(Web3Wallet.passPhraseText);
        if(Web3Wallet.enableCachePassphrase){
            Web3Wallet.signPassphrases.set(address, tmp)
        }
        return tmp;
    }

    async getRSAKeyLegacy(sign?:(text:string)=>Promise<string>){
        const address = await this.getAddress()
        if(Web3Wallet.enableCacheRsa && Web3Wallet.cacheRSA.has(address)){
            return Web3Wallet.cacheRSA.get(address);
        }
        const passPhrase = await this.signPassphrase(sign);
        const bits = 1024; 
        const rsaKey = cryptico.generateRSAKey(passPhrase, bits);
        if(Web3Wallet.enableCacheRsa){
            Web3Wallet.cacheRSA.set(address, rsaKey);
        }
        return rsaKey;
    }

    async getPublicKeyLegacy(sign?:(text:string)=>Promise<string>):Promise<string>{
        const rsaKey = await this.getRSAKeyLegacy(sign);
        const publicKey = cryptico.publicKeyString(rsaKey);       
        return publicKey;
    }

    async encryptLegacy(plainText:string, publicKey?:string|Uint8Array,sign?:(text:string)=>Promise<string>):Promise<string>{
        if(!Web3Wallet.enableEncryptLegacy){
            return plainText;
        }
        if(!publicKey){
            publicKey = await this.getPublicKeyLegacy(sign);
        }
        const res = cryptico.encrypt(plainText, publicKey);
        return res.cipher;
    }

    async decryptLegacy(cipherText:string,sign?:(text:string)=>Promise<string>):Promise<string>{
        if(!Web3Wallet.enableEncryptLegacy){
            return cipherText;
        }
        const rsaKey = await this.getRSAKeyLegacy(sign);
        const res = cryptico.decrypt(cipherText, rsaKey);
        return res.plaintext;
    }

    async decrypt(addrSender: string, ciphertext: string):Promise<string> {
        try {
            const signer = this.getSigner();
            if (signer instanceof Wallet) {
                const buffer = ethUtil.toBuffer(ciphertext);
                const json = JSON.parse(buffer.toString("utf-8")); 
                return sigUtil.decrypt(json, signer.privateKey)
            }
            return await this.provider.send("eth_decrypt", [ciphertext, addrSender]);
        } catch (error) {
            throw Web3Errors.DecryptError;
        }
    }

    async getEncryptPublicKey(): Promise<string> {
        const signer = this.getSigner();
        if (signer instanceof Wallet) {
            return signer.publicKey;
        }
        try {
            const res = await this.provider.send("eth_getEncryptionPublicKey", [signer._address]);
            return res;
        } catch (error) {
            try {
                const msgHash = ethers.utils.hashMessage("test");
                const msgHashBytes = ethers.utils.arrayify(msgHash);
                const signature = await signer.signMessage(msgHashBytes);
                const pubKey = ethers.utils.recoverPublicKey(msgHashBytes, signature);
                return pubKey;
            } catch (error) {
                throw Web3Errors.EncryptError;
            }
        }
    }

    async encrypt(pubKey: string, message: string) {
        try {
            const encryptedMessage = ethUtil.bufferToHex(
                Buffer.from(
                    JSON.stringify(
                        sigUtil.encrypt(pubKey, { data: message }, 'x25519-xsalsa20-poly1305')
                    ),
                    'utf8'
                )
            );
            return encryptedMessage;
        } catch (error) {
            throw Web3Errors.DecryptError;
        }
    }

    getERC20(address: string) {
        const signer = this.getSigner();
        const contract = new ERC20Factory(signer);
        return contract.attach(address)
    }

    async getContract<T extends Contract>(address: string, factory: ContractFactory) {
        const signer = this.getSigner();
        return factory.connect(signer).attach(address) as T;
    }
}