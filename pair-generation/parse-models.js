#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const draco = require("ndraco-core");
const stringHash = require("string-hash");
const { facts2data } = require("./facts2data");
const { spawnSync } = require("child_process");

const { Draco, Result, Model, Facts, Constraint } = draco;

const modelsPath = path.resolve(__dirname, "out/models.json");
const models = JSON.parse(fs.readFileSync(modelsPath));

const specPairs = {};
let id = 0;
const datas = {};

if (!fs.existsSync(path.resolve(__dirname, "out/pairs"))) {
  fs.mkdirSync(path.resolve(__dirname, "out/pairs"));
}

if (!fs.existsSync(path.resolve(__dirname, "out/png"))) {
  fs.mkdirSync(path.resolve(__dirname, "out/png"));
}

let i = 0;
for (const model of models) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`\x1b[35m ${i++} / ${models.length}`);

  const c1 = model.c1;
  const c2 = model.c2;
  const facts = model.model.facts;

  const specs = Facts.toVegaLiteSpecDictionary(facts);
  const data = facts2data(facts);

  const hash = stringHash(JSON.stringify(data));
  if (!datas.hasOwnProperty(hash)) {
    datas[hash] = data;
  }

  for (const [v, spec] of Object.entries(specs)) {
    spec.data = {
      values: data
    };
    // spec.data = {
    //   url: `data/${hash}.json`
    // };
  }

  specPairs[`${id}`] = {
    type: c1,
    c2,
    comparator: "<",
    left: {
      vlSpec: specs["v1"]
    },
    right: {
      vlSpec: specs["v2"]
    }
  };

  const concat = {
    hconcat: [specs["v1"], specs["v2"]]
  };

  const specOut = path.resolve(__dirname, `out/pairs/${id}.json`);
  fs.writeFile(specOut, JSON.stringify(concat, null, 2), {}, () => {});

  const pngOut = path.resolve(__dirname, `out/png/${id}.png`);
  spawnSync("yarn vl2png", [specOut, pngOut]);
  id += 1;
}

const specPairsPath = path.resolve(__dirname, "out/pairs.json");
fs.writeFile(specPairsPath, JSON.stringify(specPairs, null, 2), {}, () => {});

// for (const [hash, data] of Object.entries(datas)) {
//   const dataPath = path.resolve(__dirname, `out/data/${hash}.json`);
//   fs.writeFile(dataPath, JSON.stringify(data));
// }
