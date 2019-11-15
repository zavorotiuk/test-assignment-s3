import { createWriteStream } from "fs";
import * as archiver from 'archiver';

const zipDirectory = (source, out) => {
    const archive = archiver('zip', { zlib: { level: 9 }});
    const stream = createWriteStream(out);
  
    return new Promise((resolve, reject) => {
      archive
        .directory(source, false)
        .on('error', err => reject(err))
        .pipe(stream)
      ;
  
      stream.on('close', () => resolve());
      archive.finalize();
    });
}

export default zipDirectory;