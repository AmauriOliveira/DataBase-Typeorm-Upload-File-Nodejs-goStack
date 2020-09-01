import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();
  // pega o balanço
  const balance = await transactionsRepository.getBalance(transactions);
  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const transactionsRepository = new TransactionsRepository();
  // cria o objeto
  const createTransactionService = new CreateTransactionService(
    transactionsRepository,
  );
  // execulta o metodo de criação
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  // pega o id
  const { id } = request.params;

  const transactionsRepository = new TransactionsRepository();
  // cria o objeto
  const deleteTransactionService = new DeleteTransactionService(
    transactionsRepository,
  );
  // execulta o metodo de apagar
  const transaction = await deleteTransactionService.execute(id);

  return response.json(transaction);
});

transactionsRouter.post('/import', async (request, response) => {});

export default transactionsRouter;
