#!/usr/bin/env node
const draco = require("ndraco-core");
const fs = require("fs");
const path = require("path");
const { Draco, Result, Model, Constraint } = draco;

function generatePairs(constraintPairs) {
  const models = [];
  const info = [];

  constraintPairs.forEach(([c1, c2], i) => {
    const program = `c1(${c1.subtype},${c1.name}).
  c2(${c2.subtype},${c2.name}).`;

    const compObj = {
      c1: Constraint.getUniqueName(c1),
      c2: Constraint.getUniqueName(c2)
    };

    const result = Draco.run(program, { optimize: false, generateData: true }, [
      path.resolve(__dirname, "query.lp")
    ]);

    if (!Result.isSat(result)) {
      info.push({
        ...compObj,
        info: "UNSAT"
      });
    } else {
      const resultWitnesses = Result.toWitnesses(result);

      info.push({
        ...compObj,
        info: "SAT"
      });

      models.push({
        ...compObj,
        model: resultWitnesses[0]
      });
    }

    process.send({
      cmd: "update"
    });
  });

  return {
    models,
    info
  };
}

module.exports = {
  generatePairs
};
