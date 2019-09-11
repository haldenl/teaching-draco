#!/usr/bin/env node
const draco = require("ndraco-core");
const fs = require("fs");
const path = require("path");
const os = require("os");
const cluster = require("cluster");
const { Draco, Result, Model, Constraint } = draco;
const yargs = require("yargs");

const argv = yargs.argv;

if (argv.output === undefined) {
  console.log("Please provide an output directory.");
  process.exit(1);
}

if (argv.queryfile === undefined) {
  console.log("Please provide a query file.");
  process.exit(1);
}

const NUM = 1000;

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
      if (!fs.existsSync(argv.output)) {
        fs.mkdirSync(argv.output);
      }

      fs.writeFileSync(
        path.join(__dirname, `${argv.output}/models.json`),
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
    const numDimensions = Math.floor(Math.random() * 3) + 1;

    let program = "";
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
      [argv.queryfile]
    );

    if (!Result.isSat(result)) {
      // const hardViolations = Draco.runDebug(
      //   program,
      //   {
      //     optimize: false,
      //     generateData: true,
      //     generate: true,
      //     generateExtraEncodings: false,
      //     randomFreq: 1,
      //     models: 1,
      //     randomSeed: Math.floor(Math.random() * NUM * i * 1000)
      //   },
      //   [path.resolve(__dirname, "random.lp")]
      // );
      console.log("unsat!");
      console.log("unsat!");
      process.exit(1);
    }

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
