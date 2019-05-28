#!/usr/bin/env node
const util = require("util");
const draco = require("ndraco-core");

const Draco = draco.Draco;

function print(obj) {
  console.dir(obj, { depth: null, colors: true });
}

const softConstraints = Draco.getSoftConstraints();

const constraintPairs = [];
for (const [key1, c1] of Object.entries(softConstraints)) {
  for (const [key2, c2] of Object.entries(softConstraints)) {
    if (key1 !== key2) {
      constraintPairs.push([c1, c2]);
    }
  }
}

for (const [c1, c2] of constraintPairs) {
  const program = `c1(${c1.subtype},${c1.name}).
c2(${c2.subtype},${c2.name}).`;

  const result = Draco.run(program, ["../pair-generation/query.lp"]);
  print(result);
  break;
}
