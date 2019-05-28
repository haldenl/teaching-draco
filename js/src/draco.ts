import { ResultObject } from './result';

const tmp = require('tmp');
const fs = require('fs');
const { spawnSync } = require('child_process');
tmp.setGracefulCleanup();

export class Draco {
  static run(program: string, files: string[]): ResultObject {
    const tmpObj = tmp.fileSync();
    fs.writeFileSync(tmpObj.name, program);
    const fileArgs = files.concat([tmpObj.name]).join(' ');
    const result = spawnSync('clingo', ['--outf=2', '--quiet=1,2,2', fileArgs], {
      encoding: 'utf-8',
    });
    return JSON.parse(result.output[1]);
  }
}
