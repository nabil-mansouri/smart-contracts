/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { MessageContractProxy } from "./MessageContractProxy";

export class MessageContractProxyFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<MessageContractProxy> {
    return super.deploy(overrides || {}) as Promise<MessageContractProxy>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): MessageContractProxy {
    return super.attach(address) as MessageContractProxy;
  }
  connect(signer: Signer): MessageContractProxyFactory {
    return super.connect(signer) as MessageContractProxyFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MessageContractProxy {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as MessageContractProxy;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "subjectId",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "senderPubKey",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "receiverPubKey",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "encryptMessage",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "myEncryptMessage",
            type: "bytes",
          },
          {
            internalType: "bytes32",
            name: "sender",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "receiver",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "date",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct MessageContractInterface.Message",
        name: "message",
        type: "tuple",
      },
    ],
    name: "OnSend",
    type: "event",
  },
  {
    inputs: [],
    name: "counMessage",
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
        name: "_addr",
        type: "address",
      },
    ],
    name: "counMessageReceivedBy",
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
    inputs: [],
    name: "counMessageReceivedByMe",
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
        name: "_addr",
        type: "address",
      },
    ],
    name: "counMessageSentBy",
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
    inputs: [],
    name: "counMessageSentByMe",
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
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "deleteMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_id",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "listMessageBySubject",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "subjectId",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "senderPubKey",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "receiverPubKey",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "encryptMessage",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "myEncryptMessage",
            type: "bytes",
          },
          {
            internalType: "bytes32",
            name: "sender",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "receiver",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "date",
            type: "uint256",
          },
        ],
        internalType: "struct MessageContractInterface.Message[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_addr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "listMessageReceivedBy",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "subjectId",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "senderPubKey",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "receiverPubKey",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "encryptMessage",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "myEncryptMessage",
            type: "bytes",
          },
          {
            internalType: "bytes32",
            name: "sender",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "receiver",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "date",
            type: "uint256",
          },
        ],
        internalType: "struct MessageContractInterface.Message[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "listMessageReceivedByMe",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "subjectId",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "senderPubKey",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "receiverPubKey",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "encryptMessage",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "myEncryptMessage",
            type: "bytes",
          },
          {
            internalType: "bytes32",
            name: "sender",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "receiver",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "date",
            type: "uint256",
          },
        ],
        internalType: "struct MessageContractInterface.Message[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_addr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "listMessageSentBy",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "subjectId",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "senderPubKey",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "receiverPubKey",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "encryptMessage",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "myEncryptMessage",
            type: "bytes",
          },
          {
            internalType: "bytes32",
            name: "sender",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "receiver",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "date",
            type: "uint256",
          },
        ],
        internalType: "struct MessageContractInterface.Message[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "listMessageSentByMe",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "subjectId",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "senderPubKey",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "receiverPubKey",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "encryptMessage",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "myEncryptMessage",
            type: "bytes",
          },
          {
            internalType: "bytes32",
            name: "sender",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "receiver",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "date",
            type: "uint256",
          },
        ],
        internalType: "struct MessageContractInterface.Message[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_addr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "listMessageSubjectBy",
    outputs: [
      {
        internalType: "bytes32[]",
        name: "",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "listMessageSubjectByMe",
    outputs: [
      {
        internalType: "bytes32[]",
        name: "",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_addr",
        type: "address",
      },
    ],
    name: "messageAddressHash",
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
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "messageById",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "subjectId",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "senderPubKey",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "receiverPubKey",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "encryptMessage",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "myEncryptMessage",
        type: "bytes",
      },
      {
        internalType: "bytes32",
        name: "sender",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "receiver",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "date",
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
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "messageByReceiver",
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
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "messageBySender",
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
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "messageBySubjectId",
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
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "messageSubjectByAddress",
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
        name: "",
        type: "bytes32",
      },
    ],
    name: "messageSubjectCount",
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
        internalType: "bytes",
        name: "_addr",
        type: "bytes",
      },
    ],
    name: "messageSubjectHash",
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
        name: "subjectId",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "subjectId",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "senderPubKey",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "receiverPubKey",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "encryptMessage",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "myEncryptMessage",
            type: "bytes",
          },
          {
            internalType: "bytes32",
            name: "sender",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "receiver",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "date",
            type: "uint256",
          },
        ],
        internalType: "struct MessageContractInterface.Message",
        name: "message",
        type: "tuple",
      },
    ],
    name: "sendMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506115e1806100206000396000f3fe608060405234801561001057600080fd5b50600436106101125760003560e01c80630181bbc9146101175780630f1b3f6b1461013d5780632185cf9d146101505780632215d08214610163578063239180251461018357806349b2cb0114610196578063573f3f461461019e57806364754775146101be5780637169b999146101d15780637d47d037146101d957806382fb42c6146101ec57806391fa32e61461020c578063943051f01461021f57806398e883ea14610232578063a12c37fc14610245578063b888690a14610258578063c81eb78d1461026d578063cdccc5c714610280578063d8690bbf146102a8578063e963248d146102bb578063ee18f9e8146102ce578063fef7422f146102d6575b600080fd5b61012a610125366004611065565b6102e9565b6040519081526020015b60405180910390f35b61012a61014b366004610fb6565b61031a565b61012a61015e366004611065565b610355565b61012a610171366004611002565b60036020526000908152604090205481565b61012a610191366004611065565b610371565b61012a61038d565b6101b16101ac366004610fd0565b61039d565b604051610134919061120f565b61012a6101cc366004610fb6565b6103cc565b61012a6103f2565b61012a6101e7366004610fb6565b6103fd565b6101ff6101fa366004611065565b61040c565b60405161013491906111cb565b6101b161021a366004611065565b610422565b6101b161022d366004611086565b61042f565b6101ff610240366004610fd0565b61044b565b6101b1610253366004610fd0565b610472565b61026b610266366004611002565b610484565b005b6101b161027b366004611065565b6105b3565b61029361028e366004611002565b6105c0565b60405161013499989796959493929190611400565b61026b6102b636600461101a565b610827565b61012a6102c93660046110b1565b6108ef565b61012a610902565b61012a6102e4366004611065565b61090d565b6004602052816000526040600020818154811061030557600080fd5b90600052602060002001600091509150505481565b6040516001600160601b0319606083901b1660208201526000906034015b604051602081830303815290604052805190602001209050919050565b6002602052816000526040600020818154811061030557600080fd5b6001602052816000526040600020818154811061030557600080fd5b6000610398336103cc565b905090565b60606103c4600260006103af8761031a565b81526020019081526020016000208484610929565b949350505050565b6000600260006103db8461031a565b815260208101919091526040016000205492915050565b600061039860065490565b6000600160006103db8461031a565b606061041933848461044b565b90505b92915050565b6060610419338484610472565b60008381526004602052604090206060906103c4908484610929565b60606103c46005600061045d8761031a565b81526020019081526020016000208484610d37565b60606103c4600160006103af8761031a565b60008181526020819052604081209061049c3361031a565b9050808260060154146104ed5760405162461bcd60e51b815260206004820152601460248201527326b2b9b9b0b3b2b99d103737ba1039b2b73232b960611b60448201526064015b60405180910390fd5b6006820154600090815260016020526040902061050a9084610e3a565b50600782015460009081526002602052604090206105289084610e3a565b50600182015460009081526004602052604090206105469084610e3a565b506000838152602081905260408120818155600181018290559061056d6002830182610f44565b61057b600383016000610f44565b610589600483016000610f44565b610597600583016000610f44565b5060006006820181905560078201819055600890910155505050565b606061041933848461039d565b600060208190529081526040902080546001820154600283018054929391926105e890611529565b80601f016020809104026020016040519081016040528092919081815260200182805461061490611529565b80156106615780601f1061063657610100808354040283529160200191610661565b820191906000526020600020905b81548152906001019060200180831161064457829003601f168201915b50505050509080600301805461067690611529565b80601f01602080910402602001604051908101604052809291908181526020018280546106a290611529565b80156106ef5780601f106106c4576101008083540402835291602001916106ef565b820191906000526020600020905b8154815290600101906020018083116106d257829003601f168201915b50505050509080600401805461070490611529565b80601f016020809104026020016040519081016040528092919081815260200182805461073090611529565b801561077d5780601f106107525761010080835404028352916020019161077d565b820191906000526020600020905b81548152906001019060200180831161076057829003601f168201915b50505050509080600501805461079290611529565b80601f01602080910402602001604051908101604052809291908181526020018280546107be90611529565b801561080b5780601f106107e05761010080835404028352916020019161080b565b820191906000526020600020905b8154815290600101906020018083116107ee57829003601f168201915b5050505050908060060154908060070154908060080154905089565b60075460405160009182916001600160a01b039091169061084e9086908690602401611300565b60408051601f198184030181529181526020820180516001600160e01b031663d8690bbf60e01b1790525161088391906111af565b600060405180830381855af49150503d80600081146108be576040519150601f19603f3d011682016040523d82523d6000602084013e6108c3565b606091505b50915091508181906108e85760405162461bcd60e51b81526004016104e491906113ed565b5050505050565b60008160405160200161033891906111af565b6000610398336103fd565b6005602052816000526040600020818154811061030557600080fd5b8254606090600090808085156109495785925061094683886114ca565b90505b6000836001600160401b0381111561097157634e487b7160e01b600052604160045260246000fd5b6040519080825280602002602001820160405280156109fa57816020015b6109e76040518061012001604052806000815260200160008019168152602001606081526020016060815260200160608152602001606081526020016000801916815260200160008019168152602001600081525090565b81526020019060019003908161098f5790505b509050875b8281108015610a0d57508381105b15610d2a5760008a8281548110610a3457634e487b7160e01b600052603260045260246000fd5b906000526020600020015490506000806000838152602001908152602001600020905080604051806101200160405290816000820154815260200160018201548152602001600282018054610a8890611529565b80601f0160208091040260200160405190810160405280929190818152602001828054610ab490611529565b8015610b015780601f10610ad657610100808354040283529160200191610b01565b820191906000526020600020905b815481529060010190602001808311610ae457829003601f168201915b50505050508152602001600382018054610b1a90611529565b80601f0160208091040260200160405190810160405280929190818152602001828054610b4690611529565b8015610b935780601f10610b6857610100808354040283529160200191610b93565b820191906000526020600020905b815481529060010190602001808311610b7657829003601f168201915b50505050508152602001600482018054610bac90611529565b80601f0160208091040260200160405190810160405280929190818152602001828054610bd890611529565b8015610c255780601f10610bfa57610100808354040283529160200191610c25565b820191906000526020600020905b815481529060010190602001808311610c0857829003601f168201915b50505050508152602001600582018054610c3e90611529565b80601f0160208091040260200160405190810160405280929190818152602001828054610c6a90611529565b8015610cb75780601f10610c8c57610100808354040283529160200191610cb7565b820191906000526020600020905b815481529060010190602001808311610c9a57829003601f168201915b505050505081526020016006820154815260200160078201548152602001600882015481525050848980610cea90611564565b9a5081518110610d0a57634e487b7160e01b600052603260045260246000fd5b602002602001018190525050508080610d2290611564565b9150506109ff565b5098975050505050505050565b825460609060009080808515610d5757859250610d5483886114ca565b90505b6000836001600160401b03811115610d7f57634e487b7160e01b600052604160045260246000fd5b604051908082528060200260200182016040528015610da8578160200160208202803683370190505b509050875b8281108015610dbb57508381105b15610d2a5760008a8281548110610de257634e487b7160e01b600052603260045260246000fd5b9060005260206000200154905080838880610dfc90611564565b995081518110610e1c57634e487b7160e01b600052603260045260246000fd5b60209081029190910101525080610e3281611564565b915050610dad565b8154600090610e4b5750600061041c565b60005b82848281548110610e6f57634e487b7160e01b600052603260045260246000fd5b906000526020600020015414158015610e885750835481105b15610e9f5780610e9781611564565b915050610e4e565b83548490610eaf906001906114e2565b81548110610ecd57634e487b7160e01b600052603260045260246000fd5b9060005260206000200154848281548110610ef857634e487b7160e01b600052603260045260246000fd5b906000526020600020018190555083805480610f2457634e487b7160e01b600052603160045260246000fd5b600190038181906000526020600020016000905590558091505092915050565b508054610f5090611529565b6000825580601f10610f60575050565b601f016020900490600052602060002090810190610f7e9190610f81565b50565b5b80821115610f965760008155600101610f82565b5090565b80356001600160a01b0381168114610fb157600080fd5b919050565b600060208284031215610fc7578081fd5b61041982610f9a565b600080600060608486031215610fe4578182fd5b610fed84610f9a565b95602085013595506040909401359392505050565b600060208284031215611013578081fd5b5035919050565b6000806040838503121561102c578182fd5b8235915060208301356001600160401b03811115611048578182fd5b8301610120818603121561105a578182fd5b809150509250929050565b60008060408385031215611077578182fd5b50508035926020909101359150565b60008060006060848603121561109a578283fd5b505081359360208301359350604090920135919050565b6000602082840312156110c2578081fd5b81356001600160401b03808211156110d8578283fd5b818401915084601f8301126110eb578283fd5b8135818111156110fd576110fd611595565b604051601f8201601f19908116603f0116810190838211818310171561112557611125611595565b8160405282815287602084870101111561113d578586fd5b826020860160208301379182016020019490945295945050505050565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b6000815180845261119b8160208601602086016114f9565b601f01601f19169290920160200192915050565b600082516111c18184602087016114f9565b9190910192915050565b6020808252825182820181905260009190848201906040850190845b81811015611203578351835292840192918401916001016111e7565b50909695505050505050565b60006020808301818452808551808352604092508286019150828160051b870101848801865b838110156112f257603f19898403018552815161012081518552888201518986015287820151818987015261126c82870182611183565b915050606080830151868303828801526112868382611183565b92505050608080830151868303828801526112a18382611183565b9250505060a080830151868303828801526112bc8382611183565b60c0858101519089015260e080860151908901526101009485015194909701939093525050509386019390860190600101611235565b509098975050505050505050565b828152604060208201528135604082015260208201356060820152600061132a604084018461147f565b6101208060808601526113426101608601838561115a565b9250611351606087018761147f565b9250603f19808786030160a088015261136b85858461115a565b945061137a608089018961147f565b94509150808786030160c088015261139385858461115a565b94506113a260a089018961147f565b94509150808786030160e0880152506113bc84848361115a565b935050610100915060c08601358286015260e086013581860152508085013561014085015250809150509392505050565b6020815260006104196020830184611183565b60006101208b83528a60208401528060408401526114208184018b611183565b90508281036060840152611434818a611183565b905082810360808401526114488189611183565b905082810360a084015261145c8188611183565b60c0840196909652505060e0810192909252610100909101529695505050505050565b6000808335601e19843603018112611495578283fd5b83016020810192503590506001600160401b038111156114b457600080fd5b8036038313156114c357600080fd5b9250929050565b600082198211156114dd576114dd61157f565b500190565b6000828210156114f4576114f461157f565b500390565b60005b838110156115145781810151838201526020016114fc565b83811115611523576000848401525b50505050565b600181811c9082168061153d57607f821691505b6020821081141561155e57634e487b7160e01b600052602260045260246000fd5b50919050565b60006000198214156115785761157861157f565b5060010190565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fdfea2646970667358221220a96224fa380b507082fe6b3d0b141e8d163571eceede5a846a7fc1da962a22d664736f6c63430008040033";
