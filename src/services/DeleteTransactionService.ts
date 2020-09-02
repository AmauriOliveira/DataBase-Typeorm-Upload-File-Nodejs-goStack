import { getRepository, DeleteResult } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface RequestDTO {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: RequestDTO): Promise<DeleteResult> {
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
