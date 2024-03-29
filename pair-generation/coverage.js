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
for (const pair of pairs.slice(0, 1000)) {
  i += 1;
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`${i} / ${pairs.length}`);

  const leftSoft = getSoftConstraintsFromFacts(pair.left.draco);
  const rightSoft = getSoftConstraintsFromFacts(pair.right.draco);

  for (const name of Object.keys(coverage)) {
    if ((leftSoft.includes(name) && !rightSoft.includes(name)) ||
        (!leftSoft.includes(name) && rightSoft.includes(name))) {

        coverage[name] += 1;
    }

    // for (const [soft, multiplier] of [[leftSoft, 1], [rightSoft, -1]]) {
    //   const value = soft.filter(s => s === name).length;

    //   // if (value !== 0) {
    //   if (coverage[name][value] === undefined) {
    //     coverage[name][value] = 0;
    //   }

    //   coverage[name][value] += 1 * multiplier;
    //   // }
    // }
  }

  // leftSoft.forEach(name => (coverage[name] += 1));
  // rightSoft.forEach(name => (coverage[name] += 1));
}

console.log(coverage);

const out = [];

for (const [name, value] of Object.entries(coverage)) {
  out.push({
    name: name.substring(5),
    appearance: value / pairs.length
  });
}

// for (const name of Object.keys(coverage)) {
//   let total = 0;
//   for (const value of Object.keys(coverage[name])) {
//     total += coverage[name][value];
//   }

//   for (const value of Object.keys(coverage[name])) {
//     out.push({
//       name: name.substring(5),
//       value: +value,
//       count: coverage[name][value] / total
//     });
//   }
// }

fs.writeFileSync(argv.output, JSON.stringify(out, null, 2));
