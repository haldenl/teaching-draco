#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const draco = require("ndraco-core");
const stringHash = require("string-hash");
const { facts2data } = require("./facts2data");
const deepcopy = require("deepcopy");
const { spawnSync } = require("child_process");
const cluster = require("cluster");
const os = require("os");
const { Draco, Result, Model, Facts, Constraint } = draco;

if (cluster.isMaster) {
  const modelsPath = path.resolve(__dirname, "out/models.json");
  let models = JSON.parse(fs.readFileSync(modelsPath));

  const seen = new Set();

  const unique = [];
  for (const model of models) {
    const serialized = JSON.stringify(model.model);
    if (!seen.has(serialized)) {
      seen.add(serialized);
      unique.push(model);
    }
  }

  models = unique;

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
    const facts = model.model.facts;
    const c1 = model.c1;
    const c2 = model.c2;

    const v1Facts = facts.filter(f => !f.includes("v2"));
    const v2Facts = facts.filter(f => !f.includes("v1"));

    const specs = Facts.toVegaLiteSpecDictionary(facts);
    const { data, fieldMapping } = facts2data(facts);

    // set data and field mapping
    for (const [v, spec] of Object.entries(specs)) {
      spec.data = {
        values: data
      };

      if (v === "v1") {
        spec["constraint"] = c1;
      } else {
        spec["constraint"] = c2;
      }

      for (const [channel, encoding] of Object.entries(spec["encoding"])) {
        const field = encoding["field"];
        if (field) {
          encoding["field"] = fieldMapping[field];
        }
      }
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

    concat.config = {
      background: "white"
    };

    const pairToWrite = {
      left: {
        vegalite: specs["v1"],
        draco: v1Facts,
        valid: null
      },
      right: {
        vegalite: specs["v2"],
        draco: v2Facts,
        valid: null
      },
      comparator: null
    };

    const specOut = path.resolve(__dirname, `out/pairs/${id}.json`);
    fs.writeFileSync(
      specOut,
      JSON.stringify(pairToWrite, null, 2),
      {},
      () => {}
    );

    const pngOut = path.resolve(__dirname, `out/png/${id}.png`);
    spawnSync("sh", [
      path.resolve(__dirname, "../node_modules/vega-lite/bin/vl2png"),
      specOut,
      pngOut
    ]);

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
