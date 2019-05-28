#!/usr/bin/env node
const util = require("util");
const draco = require("ndraco-core");
const fs = require("fs");
const path = require("path");
const parallel = require("run-parallel");
const os = require("os");
const { generatePairs } = require("./generate-pairs");
const { Draco, Result, Model, Constraint } = draco;

function print(obj) {
  console.dir(obj, { depth: null, colors: true });
}

const softConstraints = Draco.getSoftConstraints();

const constraintPairs = [];
for (const [key1, c1] of Object.entries(softConstraints)) {
  for (const [key2, c2] of Object.entries(softConstraints)) {
    // dont want them to be identical and also enforce order to reduce space by 2.
    if (key1 < key2) {
      constraintPairs.push([c1, c2]);
    }
  }
}

const cores = os.cpus().length;
const step = Math.floor(constraintPairs.length / cores);

const fns = [];
let specPairs = [];
let models = [];
let info = [];

function store(output, childNo) {
  console.log(`${childNo} done!`);
  specPairs = specPairs.concat(output.specPairs);
  models = models.concat(output.models);
  info = info.concat(output.info);
}

for (let i = 0; i < cores; i += 1) {
  fns.push(function(callback) {
    const output = generatePairs(
      constraintPairs.slice(i * step, (i + 1) * step)
    );

    callback(output, i);
  });
}

if (step * cores < constraintPairs.length) {
  fns.push(function(callback) {
    const output = generatePairs(constraintPairs.slice(step * cores));
    callback(output, cores + 1);
  });
}

parallel(fns, store);

fs.writeFileSync(
  path.join(__dirname, "models.json"),
  JSON.stringify(models, null, 2)
);
fs.writeFileSync(
  path.join(__dirname, "pairs.json"),
  JSON.stringify(specPairs, null, 2)
);
fs.writeFileSync(
  path.join(__dirname, "info.json"),
  JSON.stringify(info, null, 2)
);
