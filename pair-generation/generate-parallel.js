#!/usr/bin/env node
const draco = require("ndraco-core");
const fs = require("fs");
const path = require("path");
const os = require("os");
const cluster = require("cluster");
const { generatePairs } = require("./generate-pairs");
const { Draco, Result, Model, Constraint } = draco;
const yargs = require("yargs");

const argv = yargs.argv;

if (argv.output === undefined) {
  console.log("provide an output directory, --output");
  process.exit(1);
}

function print(obj) {
  console.dir(obj, { depth: null, colors: true });
}

if (cluster.isMaster) {
  const softConstraints = Object.values(Draco.getSoftConstraints());

  let constraintPairs = [];
  // for (const [key1, c1] of Object.entries(softConstraints)) {
  //   for (const [key2, c2] of Object.entries(softConstraints)) {
  //     // dont want them to be identical and also enforce order to reduce space by 2.
  //     if (key1 < key2) {
  //       constraintPairs.push([c1, c2]);
  //     }
  //   }
  // }

  softConstraints.sort(() => Math.random() - 0.5);

  const cores = os.cpus().length;
  // const cores = 1;

  const step = Math.floor(softConstraints.length / cores);

  let models = [];
  let info = [];

  const workersFinished = [];

  process.on("exit", (signal, code) => {
    if (signal) {
      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }
    }
  });

  setInterval(() => {
    if (workersFinished.every(i => i)) {
      console.log("all done");
      if (!fs.existsSync(argv.output)) {
        fs.mkdirSync(argv.output);
      }

      fs.writeFileSync(
        `${argv.output}/models.json`,
        JSON.stringify(models, null, 2)
      );

      fs.writeFileSync(
        `${argv.output}/info.json`,
        JSON.stringify(info, null, 2)
      );

      process.exit(0);
    }
  }, 1000);

  let completed = 0;

  for (let i = 0; i < cores; i += 1) {
    let slice;
    if (i < cores - 1) {
      slice = softConstraints.slice(i * step, (i + 1) * step);
    } else {
      slice = softConstraints.slice(i * step);
    }

    const worker = cluster.fork();
    workersFinished.push(false);
    worker.send({
      slice: JSON.stringify(slice),
      cmd: "slice"
    });

    worker.on("exit", (signal, code) => {
      if (signal) {
        for (const id in cluster.workers) {
          cluster.workers[id].kill();
        }
      }
      workersFinished[i] = true;
    });

    worker.on("message", msg => {
      if (msg.cmd === "results") {
        const result = JSON.parse(msg.result);

        models = models.concat(result.models);
        info = info.concat(result.info);
      }
    });

    worker.on("message", msg => {
      if (msg.cmd === "update") {
        completed += 1;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`${completed} / ${softConstraints.length}`);
      }
    });
  }
} else {
  process.on("message", msg => {
    if (msg.cmd === "slice") {
      const softConstraints = JSON.parse(msg.slice);

      const result = JSON.stringify(generatePairs(softConstraints));

      process.send({ cmd: "results", result }, undefined, undefined, () =>
        process.exit(0)
      );
    }
  });
}
