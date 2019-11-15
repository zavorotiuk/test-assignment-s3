import { Transform } from 'stream';
import { createWriteStream, mkdirSync, existsSync } from 'fs';

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
                if (!existsSync(`./_temp/${entry.path}`)){
                    mkdirSync(`./_temp/${entry.path}`, {recursive: true});
                } 
                cb();
            } else {
                entry.pipe(createWriteStream(`./_temp/${entry.path}`)).on('finish',cb);
            }
        }
    }
}

export default FilterEntries;