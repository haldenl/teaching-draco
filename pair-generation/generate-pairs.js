#!/usr/bin/env node
const draco = require("ndraco-core");
const fs = require("fs");
const path = require("path");
const { Draco, Result, Model, Constraint } = draco;

const RANDOM_MAX = 32767;

const NUM_DUPLICATES = 10;

const LIMIT_TRIES = 10;

function generatePairs(softConstraints) {
  const models = [];
  const info = [];

  softConstraints.forEach(c, i) => {
    let success = false;

    // const compObj = {
    //   c1: Constraint.getUniqueName(c1),
    //   c2: Constraint.getUniqueName(c2)
    // };

    let program = `c(${c.subtype},${c.name}).
`;

    const result = Draco.run(
      program,
      {
        optimize: false,
        generateData: true,
        randomFreq: 1,
        models: 1,
        randomSeed: Math.floor(Math.random() * RANDOM_MAX)
      },
      [path.resolve(__dirname, "query.lp")]
    );

    if (Result.isSat(result)) {
      success = true;
      for (let i = 0; i < NUM_DUPLICATES; i += 1) {
        for (let j = 0; j < LIMIT_TRIES; j += 1) {
          let program = `c(${c.subtype},${c.name}).
`;

          const numDimensions = Math.floor(Math.random() * 4) + 1;

          for (let d = 1; d <= numDimensions; d += 1) {
            for (let v = 1; v <= 2; v += 1) {
              program += `encoding(v${v},e${d}).`;
              program += "\n";
            }
          }

          const result = Draco.run(
            program,
            {
              optimize: false,
              generateData: true,
              generate: true,
              generateExtraEncodings: false,
              randomFreq: 1,
              models: 1,
              randomSeed: Math.floor(Math.random() * 32767)
            },
            [path.resolve(__dirname, "query.lp")]
          );

          if (!Result.isSat(result)) {
            continue;
          } else {
            const resultWitnesses = Result.toWitnesses(result);

            models.push({
              constraint: c,
              model: resultWitnesses[0]
            });

            break;
          }
        }
      }
    } else {
      success = false;
    }

    info.push({
      ...compObj,
      info: success ? "SAT" : "UNSAT"
    });

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
