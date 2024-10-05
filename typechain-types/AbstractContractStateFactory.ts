/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { AbstractContractState } from "./AbstractContractState";

export class AbstractContractStateFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<AbstractContractState> {
    return super.deploy(overrides || {}) as Promise<AbstractContractState>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): AbstractContractState {
    return super.attach(address) as AbstractContractState;
  }
  connect(signer: Signer): AbstractContractStateFactory {
    return super.connect(signer) as AbstractContractStateFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): AbstractContractState {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as AbstractContractState;
  }
}

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "balanceCoin",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    name: "balanceToken",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
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
        internalType: "bytes32",
        name: "service",
        type: "bytes32",
      },
    ],
    name: "getPrice",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "service",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "currency",
            type: "address",
          },
          {
            internalType: "enum AbstractContractState.PaymentType",
            name: "paymentType",
            type: "uint8",
          },
        ],
        internalType: "struct AbstractContractState.Price",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lockCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "locked",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "service",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "currency",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "serviceId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        internalType: "bool",
        name: "unlocked",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "pricing",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "service",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "currency",
        type: "address",
      },
      {
        internalType: "enum AbstractContractState.PaymentType",
        name: "paymentType",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawCoin",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    name: "withdrawToken",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b506200001d33620000c5565b6000805460ff60a01b19169055600180556200005a7fcd43a244c971ec991f6cf3dffd092aaf7f5a7600d3e706361a518ee2dd67e2613362000115565b620000867ff206625bad3d9112d5609b8d356e6fbd514cd1f69980d4ce2b3e6e68e1789ace3362000115565b620000b27f7d26d95f8ae6390bb30573972090129bd7a3bc0405a4903023e177077b473eed3362000115565b620000bf60003362000115565b620001c9565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b62000121828262000125565b5050565b60008281526002602090815260408083206001600160a01b038516845290915290205460ff16620001215760008281526002602090815260408083206001600160a01b03851684529091529020805460ff19166001179055620001853390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b61112780620001d96000396000f3fe6080604052600436106100f35760003560e01c806301ffc9a7146100ff5780630249b660146101345780630459901214610189578063248a9ca3146101a95780632f2ff15d146101c957806331d98b3f146101eb57806336568abe146102185780634179f788146102385780635c975abb1461024d5780636220aea81461026c578063715018a61461028157806389476069146102965780638da5cb5b146102b657806391d14854146102d85780639b10b6f5146102f8578063a217fddf1461030e578063b10567ce14610323578063cbe9e76414610384578063d547741f14610423578063f2fde38b1461044357600080fd5b366100fa57005b600080fd5b34801561010b57600080fd5b5061011f61011a366004610e7e565b610463565b60405190151581526020015b60405180910390f35b34801561014057600080fd5b5061017b61014f366004610e5d565b604080516020808201949094528082019290925280518083038201815260609092019052805191012090565b60405190815260200161012b565b34801561019557600080fd5b5061017b6101a4366004610de0565b61049a565b3480156101b557600080fd5b5061017b6101c4366004610e1a565b610555565b3480156101d557600080fd5b506101e96101e4366004610e32565b61056a565b005b3480156101f757600080fd5b5061020b610206366004610e1a565b61058c565b60405161012b9190610fcb565b34801561022457600080fd5b506101e9610233366004610e32565b61064f565b34801561024457600080fd5b5061017b6106cd565b34801561025957600080fd5b50600054600160a01b900460ff1661011f565b34801561027857600080fd5b5061011f610703565b34801561028d57600080fd5b506101e96107bf565b3480156102a257600080fd5b5061011f6102b1366004610de0565b6107fa565b3480156102c257600080fd5b506102cb610949565b60405161012b9190610f4f565b3480156102e457600080fd5b5061011f6102f3366004610e32565b610958565b34801561030457600080fd5b5061017b60075481565b34801561031a57600080fd5b5061017b600081565b34801561032f57600080fd5b5061037461033e366004610e1a565b6005602052600090815260409020805460018201546002909201549091906001600160a01b03811690600160a01b900460ff1684565b60405161012b949392919061100a565b34801561039057600080fd5b506103e561039f366004610e1a565b60066020526000908152604090208054600182015460028301546003840154600490940154929391926001600160a01b039182169291811690600160a01b900460ff1686565b6040805196875260208701959095526001600160a01b03938416948601949094526060850191909152166080830152151560a082015260c00161012b565b34801561042f57600080fd5b506101e961043e366004610e32565b610983565b34801561044f57600080fd5b506101e961045e366004610de0565b6109a0565b60006001600160e01b03198216637965db0b60e01b148061049457506301ffc9a760e01b6001600160e01b03198316145b92915050565b6000336104a5610949565b6001600160a01b0316146104d45760405162461bcd60e51b81526004016104cb90610f96565b60405180910390fd5b6040516370a0823160e01b81526001600160a01b038316906370a0823190610500903090600401610f4f565b60206040518083038186803b15801561051857600080fd5b505afa15801561052c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104949190610ea6565b919050565b60009081526002602052604090206001015490565b61057382610555565b61057d8133610a40565b6105878383610aa4565b505050565b6105b46040805160808101825260008082526020820181905291810182905290606082015290565b6000828152600560209081526040918290208251608081018452815481526001820154928101929092526002808201546001600160a01b03811694840194909452909283916060840191600160a01b900460ff169081111561062657634e487b7160e01b600052602160045260246000fd5b600281111561064557634e487b7160e01b600052602160045260246000fd5b9052509392505050565b6001600160a01b03811633146106bf5760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201526e103937b632b9903337b91039b2b63360891b60648201526084016104cb565b6106c98282610b2a565b5050565b6000336106d8610949565b6001600160a01b0316146106fe5760405162461bcd60e51b81526004016104cb90610f96565b504790565b60006000805160206110d283398151915261071e8133610a40565b4780156107b657600061072f610949565b90506000816001600160a01b03166108fc849081150290604051600060405180830381858888f1945050505081151560011490506107ab5760405162461bcd60e51b815260206004820152601960248201527815da5d1a191c985dce881d1c985b9cd9995c8819985a5b1959603a1b60448201526064016104cb565b600194505050505090565b60009250505090565b336107c8610949565b6001600160a01b0316146107ee5760405162461bcd60e51b81526004016104cb90610f96565b6107f86000610b91565b565b60006000805160206110d28339815191526108158133610a40565b6040516370a0823160e01b815283906000906001600160a01b038316906370a0823190610846903090600401610f4f565b60206040518083038186803b15801561085e57600080fd5b505afa158015610872573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108969190610ea6565b9050801561093c5760006108a8610949565b60405163a9059cbb60e01b81526001600160a01b0380831660048301526024820185905291925060009185169063a9059cbb90604401602060405180830381600087803b1580156108f857600080fd5b505af115801561090c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109309190610dfa565b95506109439350505050565b6000935050505b50919050565b6000546001600160a01b031690565b60009182526002602090815260408084206001600160a01b0393909316845291905290205460ff1690565b61098c82610555565b6109968133610a40565b6105878383610b2a565b336109a9610949565b6001600160a01b0316146109cf5760405162461bcd60e51b81526004016104cb90610f96565b6001600160a01b038116610a345760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084016104cb565b610a3d81610b91565b50565b610a4a8282610958565b6106c957610a62816001600160a01b03166014610be1565b610a6d836020610be1565b604051602001610a7e929190610ee0565b60408051601f198184030181529082905262461bcd60e51b82526104cb91600401610f63565b610aae8282610958565b6106c95760008281526002602090815260408083206001600160a01b03851684529091529020805460ff19166001179055610ae63390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b610b348282610958565b156106c95760008281526002602090815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b60606000610bf0836002611055565b610bfb90600261103d565b6001600160401b03811115610c2057634e487b7160e01b600052604160045260246000fd5b6040519080825280601f01601f191660200182016040528015610c4a576020820181803683370190505b509050600360fc1b81600081518110610c7357634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a905350600f60fb1b81600181518110610cb057634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a9053506000610cd4846002611055565b610cdf90600161103d565b90505b6001811115610d73576f181899199a1a9b1b9c1cb0b131b232b360811b85600f1660108110610d2157634e487b7160e01b600052603260045260246000fd5b1a60f81b828281518110610d4557634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a90535060049490941c93610d6c816110a4565b9050610ce2565b508315610dc25760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e7460448201526064016104cb565b9392505050565b80356001600160a01b038116811461055057600080fd5b600060208284031215610df1578081fd5b610dc282610dc9565b600060208284031215610e0b578081fd5b81518015158114610dc2578182fd5b600060208284031215610e2b578081fd5b5035919050565b60008060408385031215610e44578081fd5b82359150610e5460208401610dc9565b90509250929050565b60008060408385031215610e6f578182fd5b50508035926020909101359150565b600060208284031215610e8f578081fd5b81356001600160e01b031981168114610dc2578182fd5b600060208284031215610eb7578081fd5b5051919050565b60038110610edc57634e487b7160e01b600052602160045260246000fd5b9052565b76020b1b1b2b9b9a1b7b73a3937b61d1030b1b1b7bab73a1604d1b815260008351610f12816017850160208801611074565b7001034b99036b4b9b9b4b733903937b6329607d1b6017918401918201528351610f43816028840160208801611074565b01602801949350505050565b6001600160a01b0391909116815260200190565b6020815260008251806020840152610f82816040850160208701611074565b601f01601f19169190910160400192915050565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b81518152602080830151908201526040808301516001600160a01b031690820152606080830151608083019161100390840182610ebe565b5092915050565b848152602081018490526001600160a01b0383166040820152608081016110346060830184610ebe565b95945050505050565b60008219821115611050576110506110bb565b500190565b600081600019048311821515161561106f5761106f6110bb565b500290565b60005b8381101561108f578181015183820152602001611077565b8381111561109e576000848401525b50505050565b6000816110b3576110b36110bb565b506000190190565b634e487b7160e01b600052601160045260246000fdfe7d26d95f8ae6390bb30573972090129bd7a3bc0405a4903023e177077b473eeda2646970667358221220c1a11e331a87a2aa13f48318ca7c50da5aeecbc9e54f37c68161af56be3772c664736f6c63430008040033";
