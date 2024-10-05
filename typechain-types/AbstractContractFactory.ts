/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { AbstractContract } from "./AbstractContract";

export class AbstractContractFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<AbstractContract> {
    return super.deploy(overrides || {}) as Promise<AbstractContract>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): AbstractContract {
    return super.attach(address) as AbstractContract;
  }
  connect(signer: Signer): AbstractContractFactory {
    return super.connect(signer) as AbstractContractFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): AbstractContract {
    return new Contract(address, _abi, signerOrProvider) as AbstractContract;
  }
}

const _abi = [
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
    name: "pause",
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
      {
        internalType: "address",
        name: "payer",
        type: "address",
      },
    ],
    name: "unlockPayment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
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
  "0x60806040523480156200001157600080fd5b506200001d33620000c5565b6000805460ff60a01b19169055600180556200005a7fcd43a244c971ec991f6cf3dffd092aaf7f5a7600d3e706361a518ee2dd67e2613362000115565b620000867ff206625bad3d9112d5609b8d356e6fbd514cd1f69980d4ce2b3e6e68e1789ace3362000115565b620000b27f7d26d95f8ae6390bb30573972090129bd7a3bc0405a4903023e177077b473eed3362000115565b620000bf60003362000115565b620001c9565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b62000121828262000125565b5050565b60008281526002602090815260408083206001600160a01b038516845290915290205460ff16620001215760008281526002602090815260408083206001600160a01b03851684529091529020805460ff19166001179055620001853390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b6115bc80620001d96000396000f3fe6080604052600436106101145760003560e01c806301ffc9a7146101205780630249b660146101555780630459901214610183578063248a9ca3146101a35780632f2ff15d146101c357806331d98b3f146101e557806336568abe146102125780633f4ba83a146102325780634179f788146102475780635c975abb1461025c5780636220aea814610271578063715018a6146102865780638456cb591461029b57806389476069146102b05780638da5cb5b146102d057806391d14854146102f257806392816dea146103125780639b10b6f514610332578063a217fddf14610348578063b10567ce1461035d578063cbe9e764146103be578063d547741f1461045d578063f2fde38b1461047d57600080fd5b3661011b57005b600080fd5b34801561012c57600080fd5b5061014061013b3660046112cc565b61049d565b60405190151581526020015b60405180910390f35b34801561016157600080fd5b50610175610170366004611277565b6104d4565b60405190815260200161014c565b34801561018f57600080fd5b5061017561019e3660046111fa565b610500565b3480156101af57600080fd5b506101756101be366004611234565b6105bb565b3480156101cf57600080fd5b506101e36101de36600461124c565b6105d0565b005b3480156101f157600080fd5b50610205610200366004611234565b6105f2565b60405161014c9190611464565b34801561021e57600080fd5b506101e361022d36600461124c565b6106b5565b34801561023e57600080fd5b50610140610733565b34801561025357600080fd5b50610175610779565b34801561026857600080fd5b506101406107af565b34801561027d57600080fd5b506101406107bf565b34801561029257600080fd5b506101e361087b565b3480156102a757600080fd5b506101406108b6565b3480156102bc57600080fd5b506101406102cb3660046111fa565b6108ef565b3480156102dc57600080fd5b506102e5610a3a565b60405161014c919061139d565b3480156102fe57600080fd5b5061014061030d36600461124c565b610a49565b34801561031e57600080fd5b506101e361032d366004611298565b610a74565b34801561033e57600080fd5b5061017560075481565b34801561035457600080fd5b50610175600081565b34801561036957600080fd5b506103ae610378366004611234565b6005602052600090815260409020805460018201546002909201549091906001600160a01b03811690600160a01b900460ff1684565b60405161014c94939291906114a3565b3480156103ca57600080fd5b5061041f6103d9366004611234565b60066020526000908152604090208054600182015460028301546003840154600490940154929391926001600160a01b039182169291811690600160a01b900460ff1686565b6040805196875260208701959095526001600160a01b03938416948601949094526060850191909152166080830152151560a082015260c00161014c565b34801561046957600080fd5b506101e361047836600461124c565b610ab0565b34801561048957600080fd5b506101e36104983660046111fa565b610acd565b60006001600160e01b03198216637965db0b60e01b14806104ce57506301ffc9a760e01b6001600160e01b03198316145b92915050565b604080516020808201949094528082019290925280518083038201815260609092019052805191012090565b60003361050b610a3a565b6001600160a01b03161461053a5760405162461bcd60e51b81526004016105319061142f565b60405180910390fd5b6040516370a0823160e01b81526001600160a01b038316906370a082319061056690309060040161139d565b60206040518083038186803b15801561057e57600080fd5b505afa158015610592573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104ce91906112f4565b919050565b60009081526002602052604090206001015490565b6105d9826105bb565b6105e38133610b6d565b6105ed8383610bd1565b505050565b61061a6040805160808101825260008082526020820181905291810182905290606082015290565b6000828152600560209081526040918290208251608081018452815481526001820154928101929092526002808201546001600160a01b03811694840194909452909283916060840191600160a01b900460ff169081111561068c57634e487b7160e01b600052602160045260246000fd5b60028111156106ab57634e487b7160e01b600052602160045260246000fd5b9052509392505050565b6001600160a01b03811633146107255760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201526e103937b632b9903337b91039b2b63360891b6064820152608401610531565b61072f8282610c57565b5050565b60003361073e610a3a565b6001600160a01b0316146107645760405162461bcd60e51b81526004016105319061142f565b61076c610cbe565b6107746107af565b905090565b600033610784610a3a565b6001600160a01b0316146107aa5760405162461bcd60e51b81526004016105319061142f565b504790565b600054600160a01b900460ff1690565b60006000805160206115678339815191526107da8133610b6d565b4780156108725760006107eb610a3a565b90506000816001600160a01b03166108fc849081150290604051600060405180830381858888f1945050505081151560011490506108675760405162461bcd60e51b815260206004820152601960248201527815da5d1a191c985dce881d1c985b9cd9995c8819985a5b1959603a1b6044820152606401610531565b600194505050505090565b60009250505090565b33610884610a3a565b6001600160a01b0316146108aa5760405162461bcd60e51b81526004016105319061142f565b6108b46000610d50565b565b6000336108c1610a3a565b6001600160a01b0316146108e75760405162461bcd60e51b81526004016105319061142f565b61076c610da0565b600060008051602061156783398151915261090a8133610b6d565b6040516370a0823160e01b815283906000906001600160a01b038316906370a082319061093b90309060040161139d565b60206040518083038186803b15801561095357600080fd5b505afa158015610967573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061098b91906112f4565b90508015610a2d57600061099d610a3a565b90506000836001600160a01b031663a9059cbb83856040518363ffffffff1660e01b81526004016109cf9291906113b1565b602060405180830381600087803b1580156109e957600080fd5b505af11580156109fd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a219190611214565b9550610a349350505050565b6000935050505b50919050565b6000546001600160a01b031690565b60009182526002602090815260408084206001600160a01b0393909316845291905290205460ff1690565b7ff206625bad3d9112d5609b8d356e6fbd514cd1f69980d4ce2b3e6e68e1789ace610a9f8133610b6d565b610aaa848484610e23565b50505050565b610ab9826105bb565b610ac38133610b6d565b6105ed8383610c57565b33610ad6610a3a565b6001600160a01b031614610afc5760405162461bcd60e51b81526004016105319061142f565b6001600160a01b038116610b615760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610531565b610b6a81610d50565b50565b610b778282610a49565b61072f57610b8f816001600160a01b03166014610ffb565b610b9a836020610ffb565b604051602001610bab92919061132e565b60408051601f198184030181529082905262461bcd60e51b8252610531916004016113ca565b610bdb8282610a49565b61072f5760008281526002602090815260408083206001600160a01b03851684529091529020805460ff19166001179055610c133390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b610c618282610a49565b1561072f5760008281526002602090815260408083206001600160a01b0385168085529252808320805460ff1916905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b610cc66107af565b610d095760405162461bcd60e51b815260206004820152601460248201527314185d5cd8589b194e881b9bdd081c185d5cd95960621b6044820152606401610531565b6000805460ff60a01b191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa335b604051610d46919061139d565b60405180910390a1565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b610da86107af565b15610de85760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b6044820152606401610531565b6000805460ff60a01b1916600160a01b1790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258610d393390565b6000610e2f84846104d4565b600081815260066020526040902080549192509015801590610e5d57506004810154600160a01b900460ff16155b15610ff45760048101546001600160a01b03848116911614610ecf5760405162461bcd60e51b815260206004820152602560248201527f5061796d656e743a206f6e6c79206f776e65722063616e20756e6c6f636b20746044820152646f6b656e7360d81b6064820152608401610531565b60028101546001600160a01b0316610f2a578054604051600091339181156108fc02919084818181858888f194505050508115156001149050610f245760405162461bcd60e51b8152600401610531906113fd565b50610fde565b6002810154600480830154835460405163a9059cbb60e01b81526000946001600160a01b039081169463a9059cbb94610f6694921692016113b1565b602060405180830381600087803b158015610f8057600080fd5b505af1158015610f94573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fb89190611214565b9050600181151514610fdc5760405162461bcd60e51b8152600401610531906113fd565b505b60048101805460ff60a01b1916600160a01b1790555b5050505050565b6060600061100a8360026114ee565b6110159060026114d6565b6001600160401b0381111561103a57634e487b7160e01b600052604160045260246000fd5b6040519080825280601f01601f191660200182016040528015611064576020820181803683370190505b509050600360fc1b8160008151811061108d57634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a905350600f60fb1b816001815181106110ca57634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a90535060006110ee8460026114ee565b6110f99060016114d6565b90505b600181111561118d576f181899199a1a9b1b9c1cb0b131b232b360811b85600f166010811061113b57634e487b7160e01b600052603260045260246000fd5b1a60f81b82828151811061115f57634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a90535060049490941c9361118681611539565b90506110fc565b5083156111dc5760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e746044820152606401610531565b9392505050565b80356001600160a01b03811681146105b657600080fd5b60006020828403121561120b578081fd5b6111dc826111e3565b600060208284031215611225578081fd5b815180151581146111dc578182fd5b600060208284031215611245578081fd5b5035919050565b6000806040838503121561125e578081fd5b8235915061126e602084016111e3565b90509250929050565b60008060408385031215611289578182fd5b50508035926020909101359150565b6000806000606084860312156112ac578081fd5b83359250602084013591506112c3604085016111e3565b90509250925092565b6000602082840312156112dd578081fd5b81356001600160e01b0319811681146111dc578182fd5b600060208284031215611305578081fd5b5051919050565b6003811061132a57634e487b7160e01b600052602160045260246000fd5b9052565b76020b1b1b2b9b9a1b7b73a3937b61d1030b1b1b7bab73a1604d1b81526000835161136081601785016020880161150d565b7001034b99036b4b9b9b4b733903937b6329607d1b601791840191820152835161139181602884016020880161150d565b01602801949350505050565b6001600160a01b0391909116815260200190565b6001600160a01b03929092168252602082015260400190565b60208152600082518060208401526113e981604085016020870161150d565b601f01601f19169190910160400192915050565b60208082526018908201527714185e5b595b9d0e881d1c985b9cd9995c8819985a5b195960421b604082015260600190565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b81518152602080830151908201526040808301516001600160a01b031690820152606080830151608083019161149c9084018261130c565b5092915050565b848152602081018490526001600160a01b0383166040820152608081016114cd606083018461130c565b95945050505050565b600082198211156114e9576114e9611550565b500190565b600081600019048311821515161561150857611508611550565b500290565b60005b83811015611528578181015183820152602001611510565b83811115610aaa5750506000910152565b60008161154857611548611550565b506000190190565b634e487b7160e01b600052601160045260246000fdfe7d26d95f8ae6390bb30573972090129bd7a3bc0405a4903023e177077b473eeda2646970667358221220a12bf6e877565d886c0285637d95c59c7823a4177b7d6def0d0857e30b71a19664736f6c63430008040033";