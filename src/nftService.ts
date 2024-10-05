//import { NFTStorage, File as NFTFile } from 'nft.storage'
import Moralis from 'moralis';
import { NFTBid, NFTCreate, NFTMetadata, NFTModel, NFTSell, NFTType } from "./nftModel";
import { AppService } from "./appService";
import { appErrors } from "./errors";
import { NFTContract } from "typechain-types";
export const NFTData :any= {}

//nft.storage for web browser (pb si quelqu'un utilise api key)
//https://github.com/nftstorage/nft.storage/blob/main/packages/client/examples/browser/store.html
//https://github.com/nftstorage/nft.storage/tree/main/packages/client/examples/node.js

export class NFTService {
    //private nftStorage = new NFTStorage({ token: AppService.NFT_STORAGE_KEY })
    constructor(private appService: AppService) { }
    get authService() {
        return this.appService.authService;
    }
    get nftContract(): NFTContract {
        return this.appService.nftContract as any;
    }

    async listMine(): Promise<NFTModel[]> {
        if (!this.authService.isAuthenticated) {
            appErrors.notAuthenticated();
        }
        //TODO
        return [];
        /*
        return this.nftContract.nftFor(this.appService.currentAddress!).then(nfts => {
            return nfts.map(nft => {
                const { bidDetails: bidDetailsOrig, createdAt: createdAtBig, votes: votesBig, sellDetails: sellDetailsOrig, owner, nftType, name, moderate, description } = nft;
                const { current: currentOrig, startAt: startAtOrig, initial: initialOrig, endAt: endAtOrig } = bidDetailsOrig || {} as NFTBid;
                const { quantity: quantityOrig, amount: amountOrig } = sellDetailsOrig || {} as NFTSell;
                const createdAt = createdAtBig.toNumber();
                const votes = votesBig.toNumber();
                const current = currentOrig.toNumber();
                const startAt = startAtOrig.toNumber();
                const endAt = endAtOrig.toNumber();
                const initial = initialOrig.toNumber();
                const quantity = quantityOrig.toNumber();
                const amount = amountOrig.toNumber();
                const bidDetails: NFTBid = { current, endAt, initial, startAt };
                const sellDetails: NFTSell = { amount, quantity };
                return { bidDetails, bidEntries: [], createdAt, description, metaUri: '', moderate, name, nftType, owner, sellDetails, uri: '', votes } as NFTModel;
            })
        })
        */
    }

    async list({ moderate, sort, sortOrder, type }: { moderate?: boolean, sort?: "date" | "popular" | "amount" | "name", type?: NFTType, sortOrder?: "asc" | "desc" } = {}): Promise<NFTModel[]> {
        if (!this.authService.isAuthenticated) {
            appErrors.notAuthenticated();
        }
        const query = new Moralis.Query(NFTData)
        if (typeof moderate == "boolean") {
            query.equalTo("moderate", moderate);
        }
        if (typeof type == "string") {
            query.equalTo("nftType", type);
        }
        switch (sort) {
            case "amount":
                const attr = type == "sell" ? "sellDetails.amount" : "bidDetails.current";
                sortOrder == "asc" ? query.ascending(attr) : query.descending(attr);
                break;
            case "name":
                sortOrder == "asc" ? query.ascending("name") : query.descending("name");
                break;
            case "popular":
                sortOrder == "asc" ? query.ascending("votes") : query.descending("votes");
                break;
            case "date":
            default:
                sortOrder == "asc" ? query.ascending("createdAt") : query.descending("createdAt");
                break;
        }
        query.select("metadata").select("details").select("owner")
        const res = await query.find();
        const fresh = await Promise.all(res.map(e => {
            const model = NFTData.toModel(e);
            return this.nftContract.nftModel(model.metaUri)
        }))
        return fresh.map(nft => {
            const { bidDetails: bidDetailsOrig, createdAt: createdAtBig, votes: votesBig, sellDetails: sellDetailsOrig, owner, nftType, name, moderate, description } = nft;
            const { current: currentOrig, startAt: startAtOrig, initial: initialOrig, endAt: endAtOrig } = bidDetailsOrig || {} as NFTBid;
            const { quantity: quantityOrig, amount: amountOrig } = sellDetailsOrig || {} as NFTSell;
            const createdAt = createdAtBig.toNumber();
            const votes = votesBig.toNumber();
            const current = currentOrig.toNumber();
            const startAt = startAtOrig.toNumber();
            const endAt = endAtOrig.toNumber();
            const initial = initialOrig.toNumber();
            const quantity = quantityOrig.toNumber();
            const amount = amountOrig.toNumber();
            const bidDetails: NFTBid = { current, endAt, initial, startAt };
            const sellDetails: NFTSell = { amount, quantity };
            return { bidDetails, bidEntries: [], createdAt, description, metaUri: '', moderate, name, nftType, owner, sellDetails, uri: '', votes } as NFTModel;
        })
    }

    async create(args: NFTCreate): Promise<NFTModel> {
        if (!this.authService.isAuthenticated) {
            appErrors.notAuthenticated();
        }
        //PUSH TO STORAGE
        const start1 = new Date().getTime();
        const metadata = await this.storeToMoralis(args, false);
        console.log("IPFS profile:", (new Date().getTime() - start1) / 1000)
        //PUSH TO DB
        const model = await this.storeToMoralisDB(args, metadata);
        //PUSH TO BLOCKCHAIN
        const start = new Date().getTime();
        await this.nftContract.mintNft(model.metaUri, model);
        console.log("CONTRACT profile:", (new Date().getTime() - start) / 1000)
        return model;
    }

    private async storeToMoralisDB(args: NFTCreate, metadata: NFTMetadata): Promise<NFTModel> {
        const nft = new NFTData();
        nft.withMetdata(metadata);
        nft.withNFTCreate(args);
        nft.withInfo({
            owner: this.appService.currentAddress!
        })
        const acl = new Moralis.ACL(Moralis.User.current());
        acl.setPublicWriteAccess(false);
        acl.setPublicReadAccess(true);
        nft.setACL(acl)
        await nft.save();
        return nft.toModel();
    }
    /*
        private async storeToNFTStorage(args: NFTCreate): Promise<NFTMetadata> {
            let file: File | Blob;
            if (args.file instanceof Blob) {
                file = args.file;
            } else {
                const fs = this.safeRequire("fs");
                file = new NFTFile([await fs.promises.readFile(args.file)], args.file, {
                    type: args.nftType || 'image/jpg',
                })
            }
            const metadata = await this.nftStorage.store({
                name: args.name,
                description: args.description,
                image: file
            })
            return {
                name: metadata.data.name,
                description: metadata.data.description,
                uri: metadata.data.image.toString(),
                metaUri: metadata.url
            };
        }
    */
    private safeRequire(lib: string) {
        //avoid static error
        if (this.appService.isNode) {
            return require(lib)
        } else {
            return null;
        }
    }

    private async storeToMoralis(args: NFTCreate, ipfs: boolean): Promise<NFTMetadata> {
        //GET FILE DATA
        let dataFile: File | Blob | { base64: string };
        let fileName = args.name;
        if (this.appService.isNode) {
            const fs = this.safeRequire("fs");
            const path = this.safeRequire("path");
            fileName = path.basename(args.file)
            const base64 = fs.readFileSync(args.file, { encoding: 'base64' })
            dataFile = { base64 }
        } else {
            dataFile = args.file as Blob;
        }
        //SAVE FILE
        const file = new Moralis.File(fileName, dataFile, args.fileType);
        if (ipfs) {
            await file.saveIPFS({})
        } else {
            await file.save({})
        }
        //SAVE META
        const uri: string = ipfs ? (file as any).ipfs() : file.url();
        const metadata = {
            name: args.name,
            description: args.description,
            uri
        };
        const fileMeta = new Moralis.File('metadata.json', { base64: btoa(JSON.stringify(metadata)) });
        if (ipfs) {
            await fileMeta.saveIPFS({})
        } else {
            await fileMeta.save({})
        }
        //const metaUri: string = ipfs ? (fileMeta as any).ipfs() : fileMeta.url();
        return { ...metadata, metaUri: fileMeta, uri: file };
    }
}
