import {
  BlockModel,
  EventModel,
  ReceiptModel,
  TransactionModel,
  utils,
  ValidatorModel,
} from '@muta-extra/common';
import { addressFromPublicKey } from '@mutajs/utils';
import { RawBlock, RawReceipt, RawTransaction } from './types';

const hexToNum = utils.hexToNum;

interface ExecutedOption {
  readonly rawBlock: RawBlock;

  readonly rawTransactions: RawTransaction[];

  readonly rawReceipts: RawReceipt[];

  readonly lastTransactionOrder: number
}

export class Executed {
  private readonly executed: ExecutedOption;

  constructor(executed: ExecutedOption) {
    this.executed = executed;
  }

  height(): number {
    return hexToNum(this.executed.rawBlock.header.height);
  }

  execHeight(): number {
    return hexToNum(this.executed.rawBlock.header.execHeight);
  }

  getBlock(): BlockModel {
    const {
      rawBlock: rawBlock,
      rawTransactions: rawTransactions,
    } = this.executed;

    const header = rawBlock.header;

    return {
      blockHash: rawBlock.hash,
      height: hexToNum(header.height),
      execHeight: hexToNum(header.execHeight),
      transactionsCount: rawTransactions.length,
      timestamp: header.timestamp,
      orderRoot: header.orderRoot,
      stateRoot: header.stateRoot,
      proposer: header.proposer,
      proofBitmap: header.proof.bitmap,
      proofRound: header.proof.round,
      proofSignature: header.proof.signature,
      prevHash: header.prevHash,
      validatorVersion: header.validatorVersion,
    };
  }

  getTransactions(): TransactionModel[] {
    const block = hexToNum(this.executed.rawBlock.header.height);
    const startOrder = this.executed.lastTransactionOrder;
    return this.executed.rawTransactions.map<TransactionModel>((tx, i) => ({
      ...tx,
      from: addressFromPublicKey(tx.pubkey).toString('hex'),
      block,
      order: startOrder + i + 1,
    }));
  }

  getReceipts(): ReceiptModel[] {
    const block = this.height();
    return this.executed.rawReceipts.map<ReceiptModel>((receipt) => ({
      block: block,
      txHash: receipt.txHash,
      cyclesUsed: receipt.cyclesUsed,
      isError: Number(receipt.response.response.code) !== 0,
      ret: receipt.response.response.succeedData,
    }));
  }

  getEvents(): EventModel[] {
    return this.executed.rawReceipts.flatMap<EventModel>((receipt) => {
      const events = receipt.events;
      if (!events || events.length === 0) return [];

      return events.map((e) => ({
        service: e.service,
        data: e.data,
        txHash: receipt.txHash,
      }));
    });
  }

  getValidators(): ValidatorModel[] {
    return this.executed.rawBlock.header.validators.map((address) => ({
      version: this.executed.rawBlock.header.validatorVersion,
      ...address,
    }));
  }
}
