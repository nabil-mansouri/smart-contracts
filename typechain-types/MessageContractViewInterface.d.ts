/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface MessageContractViewInterfaceInterface extends ethers.utils.Interface {
  functions: {
    "counMessage()": FunctionFragment;
    "counMessageReceivedBy(address)": FunctionFragment;
    "counMessageReceivedByMe()": FunctionFragment;
    "counMessageSentBy(address)": FunctionFragment;
    "counMessageSentByMe()": FunctionFragment;
    "listMessageBySubject(bytes32,uint256,uint256)": FunctionFragment;
    "listMessageReceivedBy(address,uint256,uint256)": FunctionFragment;
    "listMessageReceivedByMe(uint256,uint256)": FunctionFragment;
    "listMessageSentBy(address,uint256,uint256)": FunctionFragment;
    "listMessageSentByMe(uint256,uint256)": FunctionFragment;
    "listMessageSubjectBy(address,uint256,uint256)": FunctionFragment;
    "listMessageSubjectByMe(uint256,uint256)": FunctionFragment;
    "sendMessage(bytes32,tuple)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "counMessage",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "counMessageReceivedBy",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "counMessageReceivedByMe",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "counMessageSentBy",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "counMessageSentByMe",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "listMessageBySubject",
    values: [BytesLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "listMessageReceivedBy",
    values: [string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "listMessageReceivedByMe",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "listMessageSentBy",
    values: [string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "listMessageSentByMe",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "listMessageSubjectBy",
    values: [string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "listMessageSubjectByMe",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "sendMessage",
    values: [
      BytesLike,
      {
        id: BigNumberish;
        subjectId: BytesLike;
        senderPubKey: BytesLike;
        receiverPubKey: BytesLike;
        encryptMessage: BytesLike;
        myEncryptMessage: BytesLike;
        sender: BytesLike;
        receiver: BytesLike;
        date: BigNumberish;
      }
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "counMessage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "counMessageReceivedBy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "counMessageReceivedByMe",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "counMessageSentBy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "counMessageSentByMe",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "listMessageBySubject",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "listMessageReceivedBy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "listMessageReceivedByMe",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "listMessageSentBy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "listMessageSentByMe",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "listMessageSubjectBy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "listMessageSubjectByMe",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "sendMessage",
    data: BytesLike
  ): Result;

  events: {};
}

export class MessageContractViewInterface extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: MessageContractViewInterfaceInterface;

  functions: {
    counMessage(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    "counMessage()"(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    counMessageReceivedBy(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "counMessageReceivedBy(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    counMessageReceivedByMe(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    "counMessageReceivedByMe()"(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    counMessageSentBy(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "counMessageSentBy(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    counMessageSentByMe(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    "counMessageSentByMe()"(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    listMessageBySubject(
      arg0: BytesLike,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[];
    }>;

    "listMessageBySubject(bytes32,uint256,uint256)"(
      arg0: BytesLike,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[];
    }>;

    listMessageReceivedBy(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[];
    }>;

    "listMessageReceivedBy(address,uint256,uint256)"(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[];
    }>;

    listMessageReceivedByMe(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[];
    }>;

    "listMessageReceivedByMe(uint256,uint256)"(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[];
    }>;

    listMessageSentBy(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[];
    }>;

    "listMessageSentBy(address,uint256,uint256)"(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[];
    }>;

    listMessageSentByMe(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[];
    }>;

    "listMessageSentByMe(uint256,uint256)"(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[];
    }>;

    listMessageSubjectBy(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string[];
    }>;

    "listMessageSubjectBy(address,uint256,uint256)"(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string[];
    }>;

    listMessageSubjectByMe(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string[];
    }>;

    "listMessageSubjectByMe(uint256,uint256)"(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string[];
    }>;

    sendMessage(
      subjectId: BytesLike,
      message: {
        id: BigNumberish;
        subjectId: BytesLike;
        senderPubKey: BytesLike;
        receiverPubKey: BytesLike;
        encryptMessage: BytesLike;
        myEncryptMessage: BytesLike;
        sender: BytesLike;
        receiver: BytesLike;
        date: BigNumberish;
      },
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "sendMessage(bytes32,(uint256,bytes32,bytes,bytes,bytes,bytes,bytes32,bytes32,uint256))"(
      subjectId: BytesLike,
      message: {
        id: BigNumberish;
        subjectId: BytesLike;
        senderPubKey: BytesLike;
        receiverPubKey: BytesLike;
        encryptMessage: BytesLike;
        myEncryptMessage: BytesLike;
        sender: BytesLike;
        receiver: BytesLike;
        date: BigNumberish;
      },
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  counMessage(overrides?: CallOverrides): Promise<BigNumber>;

  "counMessage()"(overrides?: CallOverrides): Promise<BigNumber>;

  counMessageReceivedBy(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "counMessageReceivedBy(address)"(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  counMessageReceivedByMe(overrides?: CallOverrides): Promise<BigNumber>;

  "counMessageReceivedByMe()"(overrides?: CallOverrides): Promise<BigNumber>;

  counMessageSentBy(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "counMessageSentBy(address)"(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  counMessageSentByMe(overrides?: CallOverrides): Promise<BigNumber>;

  "counMessageSentByMe()"(overrides?: CallOverrides): Promise<BigNumber>;

  listMessageBySubject(
    arg0: BytesLike,
    start: BigNumberish,
    limit: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    {
      id: BigNumber;
      subjectId: string;
      senderPubKey: string;
      receiverPubKey: string;
      encryptMessage: string;
      myEncryptMessage: string;
      sender: string;
      receiver: string;
      date: BigNumber;
      0: BigNumber;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: BigNumber;
    }[]
  >;

  "listMessageBySubject(bytes32,uint256,uint256)"(
    arg0: BytesLike,
    start: BigNumberish,
    limit: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    {
      id: BigNumber;
      subjectId: string;
      senderPubKey: string;
      receiverPubKey: string;
      encryptMessage: string;
      myEncryptMessage: string;
      sender: string;
      receiver: string;
      date: BigNumber;
      0: BigNumber;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: BigNumber;
    }[]
  >;

  listMessageReceivedBy(
    arg0: string,
    start: BigNumberish,
    limit: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    {
      id: BigNumber;
      subjectId: string;
      senderPubKey: string;
      receiverPubKey: string;
      encryptMessage: string;
      myEncryptMessage: string;
      sender: string;
      receiver: string;
      date: BigNumber;
      0: BigNumber;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: BigNumber;
    }[]
  >;

  "listMessageReceivedBy(address,uint256,uint256)"(
    arg0: string,
    start: BigNumberish,
    limit: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    {
      id: BigNumber;
      subjectId: string;
      senderPubKey: string;
      receiverPubKey: string;
      encryptMessage: string;
      myEncryptMessage: string;
      sender: string;
      receiver: string;
      date: BigNumber;
      0: BigNumber;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: BigNumber;
    }[]
  >;

  listMessageReceivedByMe(
    start: BigNumberish,
    limit: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    {
      id: BigNumber;
      subjectId: string;
      senderPubKey: string;
      receiverPubKey: string;
      encryptMessage: string;
      myEncryptMessage: string;
      sender: string;
      receiver: string;
      date: BigNumber;
      0: BigNumber;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: BigNumber;
    }[]
  >;

  "listMessageReceivedByMe(uint256,uint256)"(
    start: BigNumberish,
    limit: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    {
      id: BigNumber;
      subjectId: string;
      senderPubKey: string;
      receiverPubKey: string;
      encryptMessage: string;
      myEncryptMessage: string;
      sender: string;
      receiver: string;
      date: BigNumber;
      0: BigNumber;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: BigNumber;
    }[]
  >;

  listMessageSentBy(
    arg0: string,
    start: BigNumberish,
    limit: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    {
      id: BigNumber;
      subjectId: string;
      senderPubKey: string;
      receiverPubKey: string;
      encryptMessage: string;
      myEncryptMessage: string;
      sender: string;
      receiver: string;
      date: BigNumber;
      0: BigNumber;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: BigNumber;
    }[]
  >;

  "listMessageSentBy(address,uint256,uint256)"(
    arg0: string,
    start: BigNumberish,
    limit: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    {
      id: BigNumber;
      subjectId: string;
      senderPubKey: string;
      receiverPubKey: string;
      encryptMessage: string;
      myEncryptMessage: string;
      sender: string;
      receiver: string;
      date: BigNumber;
      0: BigNumber;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: BigNumber;
    }[]
  >;

  listMessageSentByMe(
    start: BigNumberish,
    limit: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    {
      id: BigNumber;
      subjectId: string;
      senderPubKey: string;
      receiverPubKey: string;
      encryptMessage: string;
      myEncryptMessage: string;
      sender: string;
      receiver: string;
      date: BigNumber;
      0: BigNumber;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: BigNumber;
    }[]
  >;

  "listMessageSentByMe(uint256,uint256)"(
    start: BigNumberish,
    limit: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    {
      id: BigNumber;
      subjectId: string;
      senderPubKey: string;
      receiverPubKey: string;
      encryptMessage: string;
      myEncryptMessage: string;
      sender: string;
      receiver: string;
      date: BigNumber;
      0: BigNumber;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: BigNumber;
    }[]
  >;

  listMessageSubjectBy(
    arg0: string,
    start: BigNumberish,
    limit: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string[]>;

  "listMessageSubjectBy(address,uint256,uint256)"(
    arg0: string,
    start: BigNumberish,
    limit: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string[]>;

  listMessageSubjectByMe(
    start: BigNumberish,
    limit: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string[]>;

  "listMessageSubjectByMe(uint256,uint256)"(
    start: BigNumberish,
    limit: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string[]>;

  sendMessage(
    subjectId: BytesLike,
    message: {
      id: BigNumberish;
      subjectId: BytesLike;
      senderPubKey: BytesLike;
      receiverPubKey: BytesLike;
      encryptMessage: BytesLike;
      myEncryptMessage: BytesLike;
      sender: BytesLike;
      receiver: BytesLike;
      date: BigNumberish;
    },
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "sendMessage(bytes32,(uint256,bytes32,bytes,bytes,bytes,bytes,bytes32,bytes32,uint256))"(
    subjectId: BytesLike,
    message: {
      id: BigNumberish;
      subjectId: BytesLike;
      senderPubKey: BytesLike;
      receiverPubKey: BytesLike;
      encryptMessage: BytesLike;
      myEncryptMessage: BytesLike;
      sender: BytesLike;
      receiver: BytesLike;
      date: BigNumberish;
    },
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    counMessage(overrides?: CallOverrides): Promise<BigNumber>;

    "counMessage()"(overrides?: CallOverrides): Promise<BigNumber>;

    counMessageReceivedBy(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "counMessageReceivedBy(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    counMessageReceivedByMe(overrides?: CallOverrides): Promise<BigNumber>;

    "counMessageReceivedByMe()"(overrides?: CallOverrides): Promise<BigNumber>;

    counMessageSentBy(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "counMessageSentBy(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    counMessageSentByMe(overrides?: CallOverrides): Promise<BigNumber>;

    "counMessageSentByMe()"(overrides?: CallOverrides): Promise<BigNumber>;

    listMessageBySubject(
      arg0: BytesLike,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[]
    >;

    "listMessageBySubject(bytes32,uint256,uint256)"(
      arg0: BytesLike,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[]
    >;

    listMessageReceivedBy(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[]
    >;

    "listMessageReceivedBy(address,uint256,uint256)"(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[]
    >;

    listMessageReceivedByMe(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[]
    >;

    "listMessageReceivedByMe(uint256,uint256)"(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[]
    >;

    listMessageSentBy(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[]
    >;

    "listMessageSentBy(address,uint256,uint256)"(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[]
    >;

    listMessageSentByMe(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[]
    >;

    "listMessageSentByMe(uint256,uint256)"(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      {
        id: BigNumber;
        subjectId: string;
        senderPubKey: string;
        receiverPubKey: string;
        encryptMessage: string;
        myEncryptMessage: string;
        sender: string;
        receiver: string;
        date: BigNumber;
        0: BigNumber;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: BigNumber;
      }[]
    >;

    listMessageSubjectBy(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string[]>;

    "listMessageSubjectBy(address,uint256,uint256)"(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string[]>;

    listMessageSubjectByMe(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string[]>;

    "listMessageSubjectByMe(uint256,uint256)"(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string[]>;

    sendMessage(
      subjectId: BytesLike,
      message: {
        id: BigNumberish;
        subjectId: BytesLike;
        senderPubKey: BytesLike;
        receiverPubKey: BytesLike;
        encryptMessage: BytesLike;
        myEncryptMessage: BytesLike;
        sender: BytesLike;
        receiver: BytesLike;
        date: BigNumberish;
      },
      overrides?: CallOverrides
    ): Promise<void>;

    "sendMessage(bytes32,(uint256,bytes32,bytes,bytes,bytes,bytes,bytes32,bytes32,uint256))"(
      subjectId: BytesLike,
      message: {
        id: BigNumberish;
        subjectId: BytesLike;
        senderPubKey: BytesLike;
        receiverPubKey: BytesLike;
        encryptMessage: BytesLike;
        myEncryptMessage: BytesLike;
        sender: BytesLike;
        receiver: BytesLike;
        date: BigNumberish;
      },
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    counMessage(overrides?: CallOverrides): Promise<BigNumber>;

    "counMessage()"(overrides?: CallOverrides): Promise<BigNumber>;

    counMessageReceivedBy(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "counMessageReceivedBy(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    counMessageReceivedByMe(overrides?: CallOverrides): Promise<BigNumber>;

    "counMessageReceivedByMe()"(overrides?: CallOverrides): Promise<BigNumber>;

    counMessageSentBy(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "counMessageSentBy(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    counMessageSentByMe(overrides?: CallOverrides): Promise<BigNumber>;

    "counMessageSentByMe()"(overrides?: CallOverrides): Promise<BigNumber>;

    listMessageBySubject(
      arg0: BytesLike,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "listMessageBySubject(bytes32,uint256,uint256)"(
      arg0: BytesLike,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    listMessageReceivedBy(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "listMessageReceivedBy(address,uint256,uint256)"(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    listMessageReceivedByMe(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "listMessageReceivedByMe(uint256,uint256)"(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    listMessageSentBy(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "listMessageSentBy(address,uint256,uint256)"(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    listMessageSentByMe(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "listMessageSentByMe(uint256,uint256)"(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    listMessageSubjectBy(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "listMessageSubjectBy(address,uint256,uint256)"(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    listMessageSubjectByMe(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "listMessageSubjectByMe(uint256,uint256)"(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    sendMessage(
      subjectId: BytesLike,
      message: {
        id: BigNumberish;
        subjectId: BytesLike;
        senderPubKey: BytesLike;
        receiverPubKey: BytesLike;
        encryptMessage: BytesLike;
        myEncryptMessage: BytesLike;
        sender: BytesLike;
        receiver: BytesLike;
        date: BigNumberish;
      },
      overrides?: Overrides
    ): Promise<BigNumber>;

    "sendMessage(bytes32,(uint256,bytes32,bytes,bytes,bytes,bytes,bytes32,bytes32,uint256))"(
      subjectId: BytesLike,
      message: {
        id: BigNumberish;
        subjectId: BytesLike;
        senderPubKey: BytesLike;
        receiverPubKey: BytesLike;
        encryptMessage: BytesLike;
        myEncryptMessage: BytesLike;
        sender: BytesLike;
        receiver: BytesLike;
        date: BigNumberish;
      },
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    counMessage(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "counMessage()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    counMessageReceivedBy(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "counMessageReceivedBy(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    counMessageReceivedByMe(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "counMessageReceivedByMe()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    counMessageSentBy(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "counMessageSentBy(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    counMessageSentByMe(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "counMessageSentByMe()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    listMessageBySubject(
      arg0: BytesLike,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "listMessageBySubject(bytes32,uint256,uint256)"(
      arg0: BytesLike,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    listMessageReceivedBy(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "listMessageReceivedBy(address,uint256,uint256)"(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    listMessageReceivedByMe(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "listMessageReceivedByMe(uint256,uint256)"(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    listMessageSentBy(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "listMessageSentBy(address,uint256,uint256)"(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    listMessageSentByMe(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "listMessageSentByMe(uint256,uint256)"(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    listMessageSubjectBy(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "listMessageSubjectBy(address,uint256,uint256)"(
      arg0: string,
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    listMessageSubjectByMe(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "listMessageSubjectByMe(uint256,uint256)"(
      start: BigNumberish,
      limit: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    sendMessage(
      subjectId: BytesLike,
      message: {
        id: BigNumberish;
        subjectId: BytesLike;
        senderPubKey: BytesLike;
        receiverPubKey: BytesLike;
        encryptMessage: BytesLike;
        myEncryptMessage: BytesLike;
        sender: BytesLike;
        receiver: BytesLike;
        date: BigNumberish;
      },
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "sendMessage(bytes32,(uint256,bytes32,bytes,bytes,bytes,bytes,bytes32,bytes32,uint256))"(
      subjectId: BytesLike,
      message: {
        id: BigNumberish;
        subjectId: BytesLike;
        senderPubKey: BytesLike;
        receiverPubKey: BytesLike;
        encryptMessage: BytesLike;
        myEncryptMessage: BytesLike;
        sender: BytesLike;
        receiver: BytesLike;
        date: BigNumberish;
      },
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
