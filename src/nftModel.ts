import Moralis from "moralis";

export type NFTType = "sell" | "bid";

export type NFTModel = {
    name: string;
    description: string;
    createdAt: number;
    owner: string;
    moderate: boolean;
    nftType: NFTType
    votes: number;
    bidDetails: NFTBid
    sellDetails: NFTSell
    bidEntries: NFTBidEntry[]
    uri: string,
    metaUri: string
}

export type NFTSell = {
    amount: number
    quantity: number
}

export type NFTBid = {
    startAt: number
    endAt: number
    initial: number
    current: number
}

export type NFTBidEntry = {
    from: string,
    amount: number,
    at: number
}

export type NFTCreate = {
    //file
    file: Blob | File | string, fileType?: string,
    //meta
    name: string,
    description: string,
    //details
    nftType: NFTType
    details: NFTBid | NFTSell
}

export type NFTMetadata = { uri: string | Moralis.File, name: string, description: string, metaUri: string | Moralis.File }

export function toModel(){

}