#!/usr/bin/env node
const draco = require("ndraco-core");
const fs = require("fs");
const path = require("path");
const os = require("os");
const cluster = require("cluster");
const { generatePairs } = require("./generate-pairs");
const { Draco, Result, Model, Constraint } = draco;

const NUM = 10000;

if (cluster.isMaster) {
  const cores = os.cpus().length;
  const n = NUM / cores;

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
      if (!fs.existsSync(path.resolve(__dirname, "out-random"))) {
        fs.mkdirSync(path.resolve(__dirname, "out-random"));
      }

      fs.writeFileSync(
        path.join(__dirname, "out-random/models.json"),
        JSON.stringify(models, null, 2)
      );

      process.exit(0);
    }
  }, 1000);

  let completed = 0;

  for (let i = 0; i < cores; i += 1) {
    const worker = cluster.fork({ n, i });
    workersFinished.push(false);

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
      }
    });

    worker.on("message", msg => {
      if (msg.cmd === "update") {
        completed += 1;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`${completed} / ${NUM}`);
      }
    });
  }
} else {
  const models = [];

  for (let i = 0; i < process.env.n; i += 1) {
    const result = Draco.run(
      null,
      {
        optimize: false,
        generateData: true,
        randomFreq: 1,
        models: 1,
        randomSeed: Math.floor(Math.random() * NUM * i * 1000)
      },
      [path.resolve(__dirname, "random.lp")]
    );

    const resultWitnesses = Result.toWitnesses(result);

    models.push({
      model: resultWitnesses[0]
    });

    process.send({
      cmd: "update"
    });
  }

  const result = JSON.stringify({ models });

  process.send({ cmd: "results", result }, undefined, undefined, () =>
    process.exit(0)
  );
}
