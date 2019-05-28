#!/usr/bin/env node
const draco = require("ndraco-core");
const fs = require("fs");
const path = require("path");
const { Draco, Result, Model, Constraint } = draco;

function generatePairs(constraintPairs) {
  const specPairs = [];
  const models = [];
  const info = [];

  process.stdout.write("Generating pairs...\n");
  constraintPairs.forEach(([c1, c2], i) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(
      `\x1b[35m ${i} / ${constraintPairs.length} | ${c1.subtype}-${c1.name} : ${
        c2.subtype
      }-${c2.name}`
    );

    const program = `c1(${c1.subtype},${c1.name}).
  c2(${c2.subtype},${c2.name}).`;

    const compObj = {
      c1: Constraint.getUniqueName(c1),
      c2: Constraint.getUniqueName(c2)
    };
    const result = Draco.run(program, ["../pair-generation/query.lp"]);

    if (!Result.isSat(result)) {
      info.push({
        ...compObj,
        info: "UNSAT"
      });
    } else {
      const resultModels = Result.toModels(result);
      const specs = Model.toVegaLiteSpecDictionary(resultModels[0]);

      info.push({
        ...compObj,
        info: "SAT"
      });

      models.push({
        ...compObj,
        model: resultModels[0]
      });

      specPairs.push({
        left: {
          constraint: compObj.c1,
          vlSpec: specs["v1"]
        },
        right: {
          constraint: compObj.c2,
          vlSpec: specs["v2"]
        }
      });
    }
  });

  return {
    models,
    specPairs,
    info
  };
}

module.exports = {
  generatePairs
};
