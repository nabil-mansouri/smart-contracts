/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { MessageContractImpl } from "./MessageContractImpl";

export class MessageContractImplFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<MessageContractImpl> {
    return super.deploy(overrides || {}) as Promise<MessageContractImpl>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): MessageContractImpl {
    return super.attach(address) as MessageContractImpl;
  }
  connect(signer: Signer): MessageContractImplFactory {
    return super.connect(signer) as MessageContractImplFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MessageContractImpl {
    return new Contract(address, _abi, signerOrProvider) as MessageContractImpl;
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
  "0x608060405234801561001057600080fd5b50610bda806100206000396000f3fe608060405234801561001057600080fd5b50600436106100785760003560e01c80630181bbc91461007d5780630f1b3f6b146100a35780632185cf9d146100b65780632215d082146100c957806323918025146100e9578063cdccc5c7146100fc578063d8690bbf14610124578063fef7422f14610139575b600080fd5b61009061008b3660046108c9565b61014c565b6040519081526020015b60405180910390f35b6100906100b1366004610838565b61017d565b6100906100c43660046108c9565b6101b7565b6100906100d7366004610866565b60036020526000908152604090205481565b6100906100f73660046108c9565b6101d3565b61010f61010a366004610866565b6101ef565b60405161009a99989796959493929190610a78565b61013761013236600461087e565b610456565b005b6100906101473660046108c9565b610783565b6004602052816000526040600020818154811061016857600080fd5b90600052602060002001600091509150505481565b6040516001600160601b0319606083901b166020820152600090603401604051602081830303815290604052805190602001209050919050565b6002602052816000526040600020818154811061016857600080fd5b6001602052816000526040600020818154811061016857600080fd5b6000602081905290815260409020805460018201546002830180549293919261021790610b42565b80601f016020809104026020016040519081016040528092919081815260200182805461024390610b42565b80156102905780601f1061026557610100808354040283529160200191610290565b820191906000526020600020905b81548152906001019060200180831161027357829003601f168201915b5050505050908060030180546102a590610b42565b80601f01602080910402602001604051908101604052809291908181526020018280546102d190610b42565b801561031e5780601f106102f35761010080835404028352916020019161031e565b820191906000526020600020905b81548152906001019060200180831161030157829003601f168201915b50505050509080600401805461033390610b42565b80601f016020809104026020016040519081016040528092919081815260200182805461035f90610b42565b80156103ac5780601f10610381576101008083540402835291602001916103ac565b820191906000526020600020905b81548152906001019060200180831161038f57829003601f168201915b5050505050908060050180546103c190610b42565b80601f01602080910402602001604051908101604052809291908181526020018280546103ed90610b42565b801561043a5780601f1061040f5761010080835404028352916020019161043a565b820191906000526020600020905b81548152906001019060200180831161041d57829003601f168201915b5050505050908060060154908060070154908060080154905089565b610464600680546001019055565b600061046f60065490565b9050600061047c3361017d565b905060008360e0013590506040518061012001604052808481526020018681526020018580604001906104af9190610af7565b8080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152505050908252506020016104f66060870187610af7565b8080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525050509082525060200161053d6080870187610af7565b8080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525050509082525060200161058460a0870187610af7565b8080601f016020809104026020016040519081016040528093929190818152602001838380828437600092018290525093855250505060208083018690526040808401869052426060909401939093528682528181529082902083518155838201516001820155918301518051610601926002850192019061079f565b506060820151805161061d91600384019160209091019061079f565b506080820151805161063991600484019160209091019061079f565b5060a0820151805161065591600584019160209091019061079f565b5060c0820151600682015560e0820151600782015561010090910151600890910155600082815260016020818152604080842080548085018255908552828520018790558484526002825280842080548085018255908552828520018790558884526004825280842080549384018155845281842090920186905587835260039052902054610718576000828152600560209081526040808320805460018181018355918552838520018990558484529083208054918201815583529120018590555b600085815260036020526040812080549161073283610b7d565b90915550506000838152602081905260409081902090517fba7bd8e2a108f1851efa0f8aee985bcc2e19270e75f88be9fe526cf4e16eb0c591610774916109d3565b60405180910390a15050505050565b6005602052816000526040600020818154811061016857600080fd5b8280546107ab90610b42565b90600052602060002090601f0160209004810192826107cd5760008555610813565b82601f106107e657805160ff1916838001178555610813565b82800160010185558215610813579182015b828111156108135782518255916020019190600101906107f8565b5061081f929150610823565b5090565b5b8082111561081f5760008155600101610824565b600060208284031215610849578081fd5b81356001600160a01b038116811461085f578182fd5b9392505050565b600060208284031215610877578081fd5b5035919050565b60008060408385031215610890578081fd5b8235915060208301356001600160401b038111156108ac578182fd5b830161012081860312156108be578182fd5b809150509250929050565b600080604083850312156108db578182fd5b50508035926020909101359150565b60008151808452815b8181101561090f576020818501810151868301820152016108f3565b818111156109205782602083870101525b50601f01601f19169290920160200192915050565b8054600090600181811c908083168061094f57607f831692505b602080841082141561096f57634e487b7160e01b86526022600452602486fd5b8388526020880182801561098a576001811461099b576109c6565b60ff198716825282820197506109c6565b60008981526020902060005b878110156109c0578154848201529086019084016109a7565b83019850505b5050505050505092915050565b6020815281546020820152600182015460408201526000610120806060840152610a04610140840160028601610935565b601f1980858303016080860152610a1e8260038801610935565b9150808583030160a0860152610a378260048801610935565b9150808583030160c086015250610a518160058701610935565b600686015460e0860152600786015461010086015260089095015491909301525090919050565b60006101208b83528a6020840152806040840152610a988184018b6108ea565b90508281036060840152610aac818a6108ea565b90508281036080840152610ac081896108ea565b905082810360a0840152610ad481886108ea565b60c0840196909652505060e0810192909252610100909101529695505050505050565b6000808335601e19843603018112610b0d578283fd5b8301803591506001600160401b03821115610b26578283fd5b602001915036819003821315610b3b57600080fd5b9250929050565b600181811c90821680610b5657607f821691505b60208210811415610b7757634e487b7160e01b600052602260045260246000fd5b50919050565b6000600019821415610b9d57634e487b7160e01b81526011600452602481fd5b506001019056fea2646970667358221220066a9ab1449d8c2bef3b1806cff50915f5c589c89e7b5214d19e5885d02a4cf164736f6c63430008040033";
