#!/usr/bin/env node
const util = require("util");
const draco = require("ndraco-core");
const fs = require("fs");
const path = require("path");
const parallel = require("run-parallel");
const os = require("os");
const cluster = require("cluster");
const { generatePairs } = require("./generate-pairs");
const http = require("http");
const { Draco, Result, Model, Constraint } = draco;

function print(obj) {
  console.dir(obj, { depth: null, colors: true });
}

if (cluster.isMaster) {
  const softConstraints = Draco.getSoftConstraints();

  let constraintPairs = [];
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

  let specPairs = [];
  let models = [];
  let info = [];

  for (let i = 0; i < cores; i += 1) {
    let slice;
    if (i < cores - 1) {
      slice = constraintPairs.slice(i * step, (i + 1) * step);
    } else {
      slice = constraintPairs.slice(i * step);
    }

    const worker = cluster.fork({
      slice: JSON.stringify(slice)
    });

    worker.on("message", msg => {
      console.log(msg);
      if (msg.cmd === "results") {
        const result = JSON.parse(msg.result);

        specPairs = specPairs.concat(result.specPairs);
        models = models.concat(result.models);
        info = info.concat(result.info);

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
      }
    });
  }
} else {
  const constraintPairs = JSON.parse(process.env.slice);
  const result = JSON.stringify(generatePairs(constraintPairs));

  process.send({ cmd: "results", result });
  process.exit(0);
}
