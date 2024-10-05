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

interface MessageContractImplInterface extends ethers.utils.Interface {
  functions: {
    "messageAddressHash(address)": FunctionFragment;
    "messageById(uint256)": FunctionFragment;
    "messageByReceiver(bytes32,uint256)": FunctionFragment;
    "messageBySender(bytes32,uint256)": FunctionFragment;
    "messageBySubjectId(bytes32,uint256)": FunctionFragment;
    "messageSubjectByAddress(bytes32,uint256)": FunctionFragment;
    "messageSubjectCount(bytes32)": FunctionFragment;
    "sendMessage(bytes32,tuple)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "messageAddressHash",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "messageById",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "messageByReceiver",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "messageBySender",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "messageBySubjectId",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "messageSubjectByAddress",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "messageSubjectCount",
    values: [BytesLike]
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
    functionFragment: "messageAddressHash",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "messageById",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "messageByReceiver",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "messageBySender",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "messageBySubjectId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "messageSubjectByAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "messageSubjectCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "sendMessage",
    data: BytesLike
  ): Result;

  events: {
    "OnSend(tuple)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OnSend"): EventFragment;
}

export class MessageContractImpl extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: MessageContractImplInterface;

  functions: {
    messageAddressHash(
      _addr: string,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "messageAddressHash(address)"(
      _addr: string,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    messageById(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
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
    }>;

    "messageById(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
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
    }>;

    messageByReceiver(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "messageByReceiver(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    messageBySender(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "messageBySender(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    messageBySubjectId(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "messageBySubjectId(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    messageSubjectByAddress(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "messageSubjectByAddress(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    messageSubjectCount(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "messageSubjectCount(bytes32)"(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
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

  messageAddressHash(_addr: string, overrides?: CallOverrides): Promise<string>;

  "messageAddressHash(address)"(
    _addr: string,
    overrides?: CallOverrides
  ): Promise<string>;

  messageById(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<{
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
  }>;

  "messageById(uint256)"(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<{
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
  }>;

  messageByReceiver(
    arg0: BytesLike,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "messageByReceiver(bytes32,uint256)"(
    arg0: BytesLike,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  messageBySender(
    arg0: BytesLike,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "messageBySender(bytes32,uint256)"(
    arg0: BytesLike,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  messageBySubjectId(
    arg0: BytesLike,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "messageBySubjectId(bytes32,uint256)"(
    arg0: BytesLike,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  messageSubjectByAddress(
    arg0: BytesLike,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  "messageSubjectByAddress(bytes32,uint256)"(
    arg0: BytesLike,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  messageSubjectCount(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "messageSubjectCount(bytes32)"(
    arg0: BytesLike,
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
    messageAddressHash(
      _addr: string,
      overrides?: CallOverrides
    ): Promise<string>;

    "messageAddressHash(address)"(
      _addr: string,
      overrides?: CallOverrides
    ): Promise<string>;

    messageById(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
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
    }>;

    "messageById(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
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
    }>;

    messageByReceiver(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "messageByReceiver(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    messageBySender(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "messageBySender(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    messageBySubjectId(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "messageBySubjectId(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    messageSubjectByAddress(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    "messageSubjectByAddress(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    messageSubjectCount(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "messageSubjectCount(bytes32)"(
      arg0: BytesLike,
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

  filters: {
    OnSend(message: null): EventFilter;
  };

  estimateGas: {
    messageAddressHash(
      _addr: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "messageAddressHash(address)"(
      _addr: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    messageById(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "messageById(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    messageByReceiver(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "messageByReceiver(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    messageBySender(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "messageBySender(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    messageBySubjectId(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "messageBySubjectId(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    messageSubjectByAddress(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "messageSubjectByAddress(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    messageSubjectCount(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "messageSubjectCount(bytes32)"(
      arg0: BytesLike,
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
    messageAddressHash(
      _addr: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "messageAddressHash(address)"(
      _addr: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    messageById(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "messageById(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    messageByReceiver(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "messageByReceiver(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    messageBySender(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "messageBySender(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    messageBySubjectId(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "messageBySubjectId(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    messageSubjectByAddress(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "messageSubjectByAddress(bytes32,uint256)"(
      arg0: BytesLike,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    messageSubjectCount(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "messageSubjectCount(bytes32)"(
      arg0: BytesLike,
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
