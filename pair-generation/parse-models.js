#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const draco = require("ndraco-core");
const stringHash = require("string-hash");
const { facts2data } = require("./facts2data");
const { spawnSync } = require("child_process");
const cluster = require("cluster");
const os = require("os");
const { Draco, Result, Model, Facts, Constraint } = draco;

if (cluster.isMaster) {
  const modelsPath = path.resolve(__dirname, "out/models.json");
  let models = JSON.parse(fs.readFileSync(modelsPath));

  models = models.map((m, i) => {
    return {
      id: i,
      model: m
    };
  });

  models.sort(() => Math.random() - 0.5);

  if (!fs.existsSync(path.resolve(__dirname, "out/pairs"))) {
    fs.mkdirSync(path.resolve(__dirname, "out/pairs"));
  }

  if (!fs.existsSync(path.resolve(__dirname, "out/png"))) {
    fs.mkdirSync(path.resolve(__dirname, "out/png"));
  }

  const cores = os.cpus().length;
  // const cores = 1;

  const step = Math.floor(models.length / cores);

  const workersFinished = [];

  process.on("exit", (signal, code) => {
    if (signal) {
      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }
    }
  });

  let completed = 0;

  for (let i = 0; i < cores; i += 1) {
    let slice;
    if (i < cores - 1) {
      slice = models.slice(i * step, (i + 1) * step);
    } else {
      slice = models.slice(i * step);
    }

    const worker = cluster.fork({ id: i });
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
      }
    });

    worker.on("message", msg => {
      if (msg.cmd === "update") {
        completed += 1;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`${completed} / ${models.length}`);
      }
    });
  }
} else {
  process.on("message", msg => {
    if (msg.cmd === "slice") {
      const models = JSON.parse(msg.slice);

      parseModels(models);

      process.send({ cmd: "results" }, undefined, undefined, () =>
        process.exit(0)
      );
    }
  });
}

function parseModels(models) {
  let i = 0;
  for (const { id, model } of models) {
    // const c1 = model.c1;
    // const c2 = model.c2;
    const facts = model.model.facts;

    const specs = Facts.toVegaLiteSpecDictionary(facts);
    const data = facts2data(facts);

    // const hash = stringHash(JSON.stringify(data));
    // if (!datas.hasOwnProperty(hash)) {
    //   datas[hash] = data;
    // }

    for (const [v, spec] of Object.entries(specs)) {
      spec.data = {
        values: data
      };
      // spec.data = {
      //   url: `data/${hash}.json`
      // };
    }

    // specPairs[`${id}`] = {
    //   type: c1,
    //   c2,
    //   comparator: "<",
    //   left: {
    //     vlSpec: specs["v1"]
    //   },
    //   right: {
    //     vlSpec: specs["v2"]
    //   }
    // };

    const concat = {
      hconcat: [specs["v1"], specs["v2"]]
    };

    const specOut = path.resolve(
      __dirname,
      `out/pairs/${id}.json`
    );
    fs.writeFile(specOut, JSON.stringify(concat, null, 2), {}, () => {});

    const pngOut = path.resolve(
      __dirname,
      `out/png/${id}.png`
    );
    spawnSync("yarn", ["vl2png", specOut, pngOut]);

    process.send({
      cmd: "update"
    });

    i += 1;
  }
}

// const specPairsPath = path.resolve(__dirname, "out/pairs.json");
// fs.writeFile(specPairsPath, JSON.stringify(specPairs, null, 2), {}, () => {});

// for (const [hash, data] of Object.entries(datas)) {
//   const dataPath = path.resolve(__dirname, `out/data/${hash}.json`);
//   fs.writeFile(dataPath, JSON.stringify(data));
// }
