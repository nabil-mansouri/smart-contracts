/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import type { MessageContractAbstract } from "./MessageContractAbstract";

export class MessageContractAbstractFactory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MessageContractAbstract {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as MessageContractAbstract;
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