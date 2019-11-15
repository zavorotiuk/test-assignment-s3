import { createReadStream } from 'fs';
import { Parse } from 'unzip-stream';
import { config, S3 } from 'aws-sdk';

import FilterEntries from './src/filterEntries';
import zipDirectory from './src/zipDirectory';
import rimrafAsync from './utils/rimrafAsync';

const FILE_KEY = 'archive.zip';

config.update(
  {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
  }
);

const s3 = new S3();
const options = {
    Bucket: 'test-task-bucket-1',
    Key: FILE_KEY,
};

const uploadToMultipleBuckets = (bucketsNames, filePath) => {
  const promises = bucketsNames.map((name) => {
    return new Promise((resolve, reject) => {
      s3.upload({
        Bucket: name,
        Body: createReadStream(filePath),
        Key: FILE_KEY
      }, (err, data) => err == null ? resolve(data) : reject(err));
    });
  })

  return Promise.all(promises);
}

const saveFilteredEntries = () => {
  return new Promise((resolve, reject) => {
    s3.getObject(options)
    .createReadStream()
    .pipe(Parse())
    .pipe(new FilterEntries())
    .on('finish', () => resolve())
    .on('error', () => reject())
  });
}

saveFilteredEntries()
  .then(() => zipDirectory('./_temp', 'archive.zip'))
  .then(() => rimrafAsync('./_temp'))
  .then(() => uploadToMultipleBuckets(['test-task-bucket-2', 'test-task-bucket-3'], './archive.zip'))
  .then(() => rimrafAsync('./archive.zip'))
  .catch(err => console.log(err));

