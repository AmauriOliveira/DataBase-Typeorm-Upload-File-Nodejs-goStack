import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
// cria uma interface
interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    // cria um repositorio
    const categoriesRepository = getRepository(Category);
    // verefica se a categoria já existe
    const checkCategoryExist = await categoriesRepository.findOne({
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
    // cria um repositorio
    const transactionsRepository = getRepository(Transaction);
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
