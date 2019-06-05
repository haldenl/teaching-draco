#!/usr/bin/env node
const draco = require("ndraco-core");
const fs = require("fs");
const path = require("path");
const os = require("os");
const cluster = require("cluster");
const { generatePairs } = require("./generate-pairs");
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

  // constraintPairs = constraintPairs.slice(0, 50);

  const cores = os.cpus().length;
  // const cores = 1;

  const step = Math.floor(constraintPairs.length / cores);

  let models = [];
  let info = [];

  const workersFinished = [];

  setInterval(() => {
    if (workersFinished.every(i => i)) {
      console.log("all done");
      fs.writeFileSync(
        path.join(__dirname, "out/models.json"),
        JSON.stringify(models, null, 2)
      );

      fs.writeFileSync(
        path.join(__dirname, "out/info.json"),
        JSON.stringify(info, null, 2)
      );

      process.exit(0);
    }
  }, 1000);

  for (let i = 0; i < cores; i += 1) {
    let slice;
    if (i < cores - 1) {
      slice = constraintPairs.slice(i * step, (i + 1) * step);
    } else {
      slice = constraintPairs.slice(i * step);
    }

    const worker = cluster.fork();
    workersFinished.push(false);
    worker.send({
      slice: JSON.stringify(slice),
      cmd: "slice"
    });

    worker.on("exit", () => {
      workersFinished[i] = true;
    });

    worker.on("message", msg => {
      if (msg.cmd === "results") {
        const result = JSON.parse(msg.result);

        models = models.concat(result.models);
        info = info.concat(result.info);
      }
    });
  }
} else {
  process.on("message", msg => {
    if (msg.cmd === "slice") {
      const constraintPairs = JSON.parse(msg.slice);

      const result = JSON.stringify(generatePairs(constraintPairs));

      process.send({ cmd: "results", result }, undefined, undefined, () =>
        process.exit(0)
      );
    }
  });
}
