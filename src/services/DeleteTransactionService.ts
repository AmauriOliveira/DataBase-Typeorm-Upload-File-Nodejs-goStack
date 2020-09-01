import { getRepository, DeleteResult } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  private transactionsRepository: TransactionsRepository;

  constructor(transactionsRepository: TransactionsRepository) {
    this.transactionsRepository = transactionsRepository;
  }

  public async execute(id: string): Promise<DeleteResult> {
    const transactionsRepository = getRepository(Transaction);

    // verefica se a transsaction já existe
    const checkTransactionExist = await transactionsRepository.findOne({
      select: ['id'],
      where: { id },
    });
    // caso não exitir
    if (!checkTransactionExist) {
      //  lança um erro avisando que não há este id no banco
      throw new AppError('This id does not exist');
    }
    // const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactions = await transactionsRepository.delete(id);
    // return response.json(transactions);
    return transactions;
  }
}
export default DeleteTransactionService;
