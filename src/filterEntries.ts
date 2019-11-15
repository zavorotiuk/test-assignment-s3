import { Transform } from 'stream';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import CONSTANTS from './constants';

class FilterEntries extends Transform {
    constructor() {
        super({ objectMode: true });
    }

    _transform(entry, e, cb) {
        const filePath = entry.path;
        const type = entry.type; // 'Directory' or 'File'
        const size = entry.size;
          
        const shouldSkipEntry = filePath.startsWith('__MACOSX') || (type === 'File' && size === 0); 
          
        if (shouldSkipEntry) {
            entry.autodrain();
            cb();
        } else {
            if (entry.isDirectory) {
                const directoryFullPath =`${CONSTANTS.TEMP_FOLDER_PATH}/${entry.path}`;

                if (!existsSync(directoryFullPath)){
                    mkdirSync(directoryFullPath, {recursive: true});
                } 

                cb();
            } else {
                entry.pipe(createWriteStream(`${CONSTANTS.TEMP_FOLDER_PATH}/${entry.path}`)).on('finish',cb);
            }
        }
    }
}

export default FilterEntries;