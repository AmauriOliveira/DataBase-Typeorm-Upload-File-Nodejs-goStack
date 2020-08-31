/* eslint-disable no-unused-expressions */
import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(res: Transaction[]): Promise<Balance> {
    let income = 0;
    let outcome = 0;

    res.forEach((item: Transaction) => {
      item.type === 'income' ? (income += item.value) : (outcome += item.value);
    });

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
