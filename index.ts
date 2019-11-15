import { createReadStream } from 'fs';
import { Parse } from 'unzip-stream';
import { config, S3 } from 'aws-sdk';

import FilterEntries from './src/filterEntries';
import zipDirectory from './src/zipDirectory';
import rimrafAsync from './utils/rimrafAsync';
import CONSTANTS from './src/constants';

config.update(
  {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
  }
);

const s3 = new S3();

const uploadToMultipleBuckets = (bucketsNames, filePath) => {
  const promises = bucketsNames.map((name) => {
    return new Promise((resolve, reject) => {
      s3.upload({
        Bucket: name,
        Body: createReadStream(filePath),
        Key: CONSTANTS.FILE_KEY
      }, (err, data) => err == null ? resolve(data) : reject(err));
    });
  })

  return Promise.all(promises);
}

const saveFilteredEntries = () => {
  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: CONSTANTS.FIRST_BUCKET_NAME,
      Key: CONSTANTS.FILE_KEY,
    })
    .createReadStream()
    .pipe(Parse())
    .pipe(new FilterEntries())
    .on('finish', () => resolve())
    .on('error', () => reject())
  });
}

saveFilteredEntries()
  .then(() => zipDirectory(CONSTANTS.TEMP_FOLDER_PATH, CONSTANTS.FILE_KEY))
  .then(() => rimrafAsync(CONSTANTS.TEMP_FOLDER_PATH))
  .then(() => uploadToMultipleBuckets([CONSTANTS.SECOND_BUCKET_NAME, CONSTANTS.THIRD_BUCKET_NAME], CONSTANTS.FILE_KEY))
  .then(() => rimrafAsync(CONSTANTS.FILE_KEY))
  .catch(err => console.log(err));

