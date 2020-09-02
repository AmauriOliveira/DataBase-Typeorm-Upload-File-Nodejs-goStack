import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
// cria uma interface
interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  private transactionsRepository: TransactionsRepository;

  constructor(transactionsRepository: TransactionsRepository) {
    this.transactionsRepository = transactionsRepository;
  }

  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    // cria um repositorio
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);
    //
    const allTransactions = await transactionsRepository.find({
      select: ['type', 'value'],
    });
    // verefica se tem saldo
    const { total } = await this.transactionsRepository.getBalance(
      allTransactions,
    );
    // verefica se tem saldo
    if (total < value && type === 'outcome') {
      throw new AppError(
        'The requested amount above the available amount in the account',
        400,
      );
    }
    // verefica se a categoria já existe
    const checkCategoryExist = await categoriesRepository.findOne({
      select: ['id'],
      where: { title: category },
    });
    // caso não exitir
    if (!checkCategoryExist) {
      // cadastre uma nova categoria
      // cria instancia da Category
      const categories = categoriesRepository.create({
        title: category,
      });
      // salva no banco a instancia
      await categoriesRepository.save(categories);
    }
    // recupera o ID da categoria gravada
    const categories = await categoriesRepository.findOne({
      where: { title: category },
    });
    // verefica se realmente tem a categoria no banco de dados
    if (!categories) {
      throw new AppError('Failed to register in the database', 400);
    }
    // cadastre uma nova Transaction
    // cria instancia da Transaction
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categories?.id,
    });
    // salva no banco a instancia
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
