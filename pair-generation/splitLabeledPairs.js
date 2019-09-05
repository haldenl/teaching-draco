const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const _ = require("lodash");

const CHUNKS = 5;

const argv = yargs.argv;

if (argv.input === undefined) {
  throw new Error("Please provide an input file.");
}

const file = argv.input;

const pairs = JSON.parse(fs.readFileSync(file));

const shuffled = _.shuffle(pairs);

const outDir = path.resolve(__dirname, "test-splits");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

const chunks = _.chunk(shuffled, shuffled.length / CHUNKS);

let i = 0;
for (const chunk of chunks) {
  fs.writeFileSync(
    path.resolve(outDir, `chunk_${i}.json`),
    JSON.stringify(chunk)
  );

  i += 1;
}

console.log("done");
