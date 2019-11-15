
import * as rimraf from 'rimraf';

const rimrafAsync = (path) => {
    return new Promise((resolve, reject) => {
        rimraf(path, (err) => err == null ? resolve() : reject(err))
    })
};

export default rimrafAsync;
  