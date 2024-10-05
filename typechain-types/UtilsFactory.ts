/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { Utils } from "./Utils";

export class UtilsFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<Utils> {
    return super.deploy(overrides || {}) as Promise<Utils>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): Utils {
    return super.attach(address) as Utils;
  }
  connect(signer: Signer): UtilsFactory {
    return super.connect(signer) as UtilsFactory;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Utils {
    return new Contract(address, _abi, signerOrProvider) as Utils;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "bool",
        name: "validatorRequire",
        type: "bool",
      },
      {
        internalType: "address",
        name: "validator",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "checkSignature",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "values",
        type: "address[]",
      },
      {
        internalType: "address",
        name: "value",
        type: "address",
      },
    ],
    name: "containsAddress",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "values",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "containsUint",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "service",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "serviceId",
        type: "uint256",
      },
    ],
    name: "generateServiceKey",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "a",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "b",
        type: "bytes",
      },
    ],
    name: "memcmp",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "a",
        type: "string",
      },
      {
        internalType: "string",
        name: "b",
        type: "string",
      },
    ],
    name: "strcmp",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x610a7261003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe730000000000000000000000000000000000000000301460806040526004361061006c5760003560e01c80630249b66014610071578063372182c214610097578063496b7994146100ba5780638df02a60146100cd5780639cfbe1a6146100e0578063ba4887b0146100f3575b600080fd5b61008461007f36600461092b565b610106565b6040519081526020015b60405180910390f35b6100aa6100a53660046108a4565b610147565b604051901515815260200161008e565b6100aa6100c836600461094c565b610232565b6100aa6100db36600461075c565b610259565b6100aa6100ee36600461094c565b6102cd565b6100aa61010136600461080c565b6102d9565b6000808383604051602001610125929190918252602082015260400190565b60408051601f1981840301815291905280516020909101209150505b92915050565b6000600185151514156102275760006101bd836101b786805190602001206040517b0ca2ba3432b932bab69029b4b3b732b21026b2b9b9b0b3b29d05199960211b6020820152603c8101829052600090605c01604051602081830303815290604052805190602001209050919050565b90610331565b9050806001600160a01b0316856001600160a01b0316146102255760405162461bcd60e51b815260206004820152601e60248201527f636865636b5369676e61747572653a20496e76616c6964207369676e6572000060448201526064015b60405180910390fd5b505b506001949350505050565b600081518351148015610252575081805190602001208380519060200120145b9392505050565b6000805b83518110156102c35783818151811061028657634e487b7160e01b600052603260045260246000fd5b60200260200101516001600160a01b0316836001600160a01b031614156102b1576001915050610141565b806102bb816109ff565b91505061025d565b5060009392505050565b60006102528383610232565b6000805b83518110156102c35783818151811061030657634e487b7160e01b600052603260045260246000fd5b602002602001015183141561031f576001915050610141565b80610329816109ff565b9150506102dd565b60008060006103408585610355565b9150915061034d816103c5565b509392505050565b60008082516041141561038c5760208301516040840151606085015160001a610380878285856105c4565b945094505050506103be565b8251604014156103b657602083015160408401516103ab8683836106a7565b9350935050506103be565b506000905060025b9250929050565b60008160048111156103e757634e487b7160e01b600052602160045260246000fd5b14156103f05750565b600181600481111561041257634e487b7160e01b600052602160045260246000fd5b141561045b5760405162461bcd60e51b815260206004820152601860248201527745434453413a20696e76616c6964207369676e617475726560401b604482015260640161021c565b600281600481111561047d57634e487b7160e01b600052602160045260246000fd5b14156104cb5760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e67746800604482015260640161021c565b60038160048111156104ed57634e487b7160e01b600052602160045260246000fd5b14156105465760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b606482015260840161021c565b600481600481111561056857634e487b7160e01b600052602160045260246000fd5b14156105c15760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c604482015261756560f01b606482015260840161021c565b50565b6000806fa2a8918ca85bafe22016d0b997e4df60600160ff1b038311156105f1575060009050600361069e565b8460ff16601b1415801561060957508460ff16601c14155b1561061a575060009050600461069e565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa15801561066e573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b0381166106975760006001925092505061069e565b9150600090505b94509492505050565b6000806001600160ff1b03831660ff84901c601b016106c8878288856105c4565b935093505050935093915050565b80356001600160a01b03811681146106ed57600080fd5b919050565b600082601f830112610702578081fd5b81356001600160401b0381111561071b5761071b610a26565b61072e601f8201601f19166020016109ac565b818152846020838601011115610742578283fd5b816020850160208301379081016020019190915292915050565b6000806040838503121561076e578182fd5b82356001600160401b03811115610783578283fd5b8301601f81018513610793578283fd5b803560206107a86107a3836109dc565b6109ac565b80838252828201915082850189848660051b88010111156107c7578788fd5b8795505b848610156107f0576107dc816106d6565b8352600195909501949183019183016107cb565b50955061080090508682016106d6565b93505050509250929050565b6000806040838503121561081e578182fd5b82356001600160401b03811115610833578283fd5b8301601f81018513610843578283fd5b803560206108536107a3836109dc565b80838252828201915082850189848660051b8801011115610872578788fd5b8795505b84861015610894578035835260019590950194918301918301610876565b5098969091013596505050505050565b600080600080608085870312156108b9578182fd5b843580151581146108c8578283fd5b93506108d6602086016106d6565b925060408501356001600160401b03808211156108f1578384fd5b6108fd888389016106f2565b93506060870135915080821115610912578283fd5b5061091f878288016106f2565b91505092959194509250565b6000806040838503121561093d578182fd5b50508035926020909101359150565b6000806040838503121561095e578182fd5b82356001600160401b0380821115610974578384fd5b610980868387016106f2565b93506020850135915080821115610995578283fd5b506109a2858286016106f2565b9150509250929050565b604051601f8201601f191681016001600160401b03811182821017156109d4576109d4610a26565b604052919050565b60006001600160401b038211156109f5576109f5610a26565b5060051b60200190565b6000600019821415610a1f57634e487b7160e01b81526011600452602481fd5b5060010190565b634e487b7160e01b600052604160045260246000fdfea2646970667358221220f2c37d99c834ec606307cda0ed7517439b4d160948ee8bb3f7f3a69625ae454f64736f6c63430008040033";
