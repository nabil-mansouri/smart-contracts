import {providers} from "ethers";

export type Web3ProviderImpl = providers.ExternalProvider;
export type Web3ProviderDisplay = {
    logo: string,
    name: string
    description: string
};
export type Web3ProviderOptions = {
    injected: {
        display: Web3ProviderDisplay;
        package: null;
    };
} | {
    walletconnect: {
        display?: Web3ProviderDisplay;
        package: any; //required import WalletConnectProvider from "@walletconnect/web3-provider";
        options: {
            infuraId: string;
        };
    };
} | {
    fortmatic: {
        display?: Web3ProviderDisplay;
        package: any; // required import Fortmatic from "fortmatic";
        options: {
            key: string; // required
        };
    };
} | {
    torus: {
        display?: Web3ProviderDisplay;
        package: any; // required import Torus from "@toruslabs/torus-embed";
        options: {
            networkParams: {
                host?: string; // optional
                chainId?: number; // optional
                networkId?: number; // optional
            };
            config: {
                buildEnv?: string; // optional
            };
        };
    };
} | {
    portis: {
        display?: Web3ProviderDisplay;
        package: any; // required  import Portis from "@portis/web3"
        options: {
            id: string; // required
        };
    };
} | {
    authereum: {
        display?: Web3ProviderDisplay;
        package: any; // required import Authereum from "authereum";
    };
} | {
    frame: {
        display?: Web3ProviderDisplay;
        package: any; // import ethProvider from "eth-provider";
    };
} | {
    bitski: {
        display?: Web3ProviderDisplay;
        package: any; // required import { Bitski } from "bitski";
        options: {
            clientId: string; // required
            callbackUrl: string; // required
        };
    };
} | {
    arkane: {
        display?: Web3ProviderDisplay;
        package: any; // required import Arkane from "@arkane-network/web3-arkane-provider";
        options: {
            clientId: string; // required
        };
    };
} | {
    dcentwallet: {
        display?: Web3ProviderDisplay;
        package: any; // required import DcentProvider from "dcent-provider";
        options: {
            rpcUrl: string; // required
        };
    };
} | {
    burnerconnect: {
        display?: Web3ProviderDisplay;
        package: any; // required import BurnerConnectProvider from "@burner-wallet/burner-connect-provider";
        options: {
            defaultNetwork: string;
        };
    };
} | {
    mewconnect: {
        display?: Web3ProviderDisplay;
        package: any; // required import MewConnect from "@myetherwallet/mewconnect-web-client";
        options: {
            infuraId: "INFURA_ID"; // required
        };
    };
} | {
    [key: string]: {
        display: Web3ProviderDisplay;
        package: any; //import ExampleProvider from "example-provider";
        options: any; //{apiKey:....}
        connector: (ExampleProvider: any, options: any) => Web3ProviderImpl;
    };
};
