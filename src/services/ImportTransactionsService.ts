import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, In, getCustomRepository } from 'typeorm';

// import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface ResponseDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(cvsFileName: string): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    // vai até a pasta temp e abre o arquivo que veio por parametro

    // leia o arquivo
    const readCSVStream = fs.createReadStream(cvsFileName);
    // parâmetro from_line: 2 pra que ele descarte a primeira linha do arquivo
    // outros dois parâmetros servem pra remover espaços em branco desnecessários que ficam entre cada um dos valores
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    //  criamos uma variável que armazena o resultado da instrução
    const parseCSV = readCSVStream.pipe(parseStream);

    const processes: ResponseDTO[] = [];
    const categories: string[] = [];

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      categories.push(category);
      processes.push({ title, type, value, category });
    });

    /// /////
    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const transactions = transactionsRepository.create(
      processes.map(({ title, type, value }) => ({
        title,
        type,
        value,
        category: finalCategories.find(category => category.title),
      })),
    );
    await transactionsRepository.save(transactions);

    await fs.promises.unlink(cvsFileName);

    return transactions;
  }
}

export default ImportTransactionsService;
