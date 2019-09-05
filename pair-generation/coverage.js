const fs = require("fs");
const { Draco } = require("ndraco-core");
const yargs = require("yargs");

const argv = yargs.argv;

if (argv.input === undefined) {
  console.log("Input file required");
  process.exit(1);
}

if (argv.output === undefined) {
  console.log("Output file required");
  process.exit(1);
}

const pairs = JSON.parse(fs.readFileSync(argv.input));

const constraints = Draco.getSoftConstraints();

const coverage = {};

for (const name of Object.keys(constraints)) {
  coverage[name] = 0;
}

let total = 0;

function getSoftConstraintsFromFacts(facts) {
  const result = [];

  for (const fact of facts) {
    if (fact.startsWith("soft")) {
      const regex = /soft\((\w+),(\w+),(\w+),(\w+)\)/;
      const [_, subtype, name, view, params] = regex.exec(fact);
      const uniqueName = `soft-${subtype}-${name}`;
      result.push(uniqueName);
    }
  }

  return result;
}

let i = 0;
console.log("parsing...");
for (const pair of pairs) {
  i += 1;
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`${i} / ${pairs.length}`);

  const leftSoft = getSoftConstraintsFromFacts(pair.left.draco);
  const rightSoft = getSoftConstraintsFromFacts(pair.right.draco);

  leftSoft.forEach(name => (coverage[name] += 1));
  rightSoft.forEach(name => (coverage[name] += 1));
}

const out = [];

for (const name of Object.keys(coverage)) {
  out.push({ name: name.substring(5), count: coverage[name] / i });
}

fs.writeFileSync(argv.output, JSON.stringify(out, null, 2));
