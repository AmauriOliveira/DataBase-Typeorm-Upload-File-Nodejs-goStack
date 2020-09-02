import multer from 'multer';
import path from 'path';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp'); // equivale a '../../tmp

export default {
  directory: tmpFolder,

  storage: multer.diskStorage({
    destination: tmpFolder,
    filename(request, file, callback) {
      // cria um nome
      const fileName = file.originalname;
      // retorna um callback, primero parametro caso acontecer erro, segundo é o nome gerado
      return callback(null, fileName);
    },
  }),
};
