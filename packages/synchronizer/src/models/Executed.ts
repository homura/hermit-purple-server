import {
  BlockModel,
  EventModel,
  ReceiptModel,
  TransactionModel,
  utils,
  ValidatorModel,
} from '@muta-extra/common';
import { RawBlock, RawReceipt, RawTransaction } from './types';

const hexToNum = utils.hexToNum;

interface ExecutedOption {
  readonly rawBlock: RawBlock;

  readonly rawTransactions: RawTransaction[];

  readonly rawReceipts: RawReceipt[];

  readonly startSequence: number;
}

export class Executed {
  private readonly executed: ExecutedOption;

  #block: BlockModel | undefined;
  #transactions: TransactionModel[] | undefined;
  #receipts: ReceiptModel[] | undefined;
  #events: EventModel[] | undefined;
  #validators: ValidatorModel[] | undefined;

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
    if (!this.#block) {
      const {
        rawBlock: rawBlock,
        rawTransactions: rawTransactions,
      } = this.executed;

      const header = rawBlock.header;

      this.#block = {
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

    return this.#block;
  }

  getTransactions(): TransactionModel[] {
    if (!this.#transactions) {
      const block = hexToNum(this.executed.rawBlock.header.height);
      const startSequence = this.executed.startSequence;
      this.#transactions = this.executed.rawTransactions.map<TransactionModel>(
        (tx, i) => ({
          ...tx,
          blockHeight: block,
          sequence: startSequence + i + 1,
        }),
      );
    }
    return this.#transactions;
  }

  getReceipts(): ReceiptModel[] {
    if (!this.#receipts) {
      const block = this.height();
      this.#receipts = this.executed.rawReceipts.map<ReceiptModel>(
        (receipt) => ({
          blockHeight: block,
          txHash: receipt.txHash,
          cyclesUsed: receipt.cyclesUsed,
          isError: Number(receipt.response.response.code) !== 0,
          ret: receipt.response.response.succeedData,
        }),
      );
    }

    return this.#receipts;
  }

  getEvents(): EventModel[] {
    if (!this.#events) {
      this.#events = this.executed.rawReceipts.flatMap<EventModel>(
        (receipt) => {
          const events = receipt.events;
          if (!events || events.length === 0) return [];

          return events.map((e) => ({
            service: e.service,
            data: e.data,
            name: e.name,
            txHash: receipt.txHash,
          }));
        },
      );
    }

    return this.#events;
  }

  getValidators(): ValidatorModel[] {
    if (!this.#validators) {
      this.#validators = this.executed.rawBlock.header.validators.map(
        (address) => ({
          version: this.executed.rawBlock.header.validatorVersion,
          ...address,
        }),
      );
    }

    return this.#validators;
  }
}
