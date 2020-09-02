import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
// cria contante que recebe multer e upload config como parametro
const upload = multer(uploadConfig);

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

  // cria o objeto
  const deleteTransactionService = new DeleteTransactionService();
  // execulta o metodo de apagar
  const transaction = await deleteTransactionService.execute({ id });

  return response.json(transaction);
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // cria o objeto
    const importTransactionsService = new ImportTransactionsService();
    // execulta o metodo de apagar
    const transaction = await importTransactionsService.execute(
      request.file.path,
    );
    response.json(transaction);
  },
);

export default transactionsRouter;
