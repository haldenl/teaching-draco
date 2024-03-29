const cql = require("compassql");
const path = require("path");
const fs = require("fs");
const cluster = require("cluster");
const yargs = require("yargs");
const os = require("os");
const vl2cql = require("./vl2cql");
const json = require("big-json");
const stringify = require("fast-json-stringify");

if (cluster.isMaster) {
  const argv = yargs.argv;

  if (argv.input === undefined) {
    console.log("Provide an input directory.");
    process.exit(1);
  }

  const pairsDir = `${argv.input}/pairs`;
  const pairFiles = fs.readdirSync(pairsDir);

  const cores = os.cpus().length;
  const step = Math.floor(pairFiles.length / cores);

  let labeledPairs = [];

  const workersFinished = [];

  process.on("exit", (signal, code) => {
    if (signal) {
      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }
    }
  });

  let writing = false;
  setInterval(() => {
    if (workersFinished.every(i => i)) {
      if (!writing) {
        console.log("writing...");
        writing = true;
        if (!fs.existsSync(path.resolve(__dirname, argv.input))) {
          fs.mkdirSync(path.resolve(__dirname, argv.input));
        }

        // const stream = json.createStringifyStream({
        //   body: labeledPairs
        // });

        const outputFile = path.resolve(
          __dirname,
          `${argv.input}/labeledPairs.json`
        );

        fs.writeFileSync(outputFile, JSON.stringify(labeledPairs));

        console.log("done");

        // if (!fs.existsSync(outputFile)) {
        //   fs.writeFileSync(outputFile, "[");
        // }

        // let o = 0;
        // for (const pair of labeledPairs) {
        //   fs.appendFileSync(outputFile, JSON.stringify(pair) + ",");
        //   process.stdout.clearLine();
        //   process.stdout.cursorTo(0);
        //   process.stdout.write(`Wrote ${o} of ${labeledPairs.length}`);
        //   o += 1;
        // }

        // fs.appendFileSync(outputFile, "]");
        // console.log("done writing.");

        // stream.on("data", chunk => {
        //   fs.appendFileSync(outputFile, chunk);
        // });

        // stream.on("end", () => {
        //   process.exit(0);
        // });
        process.exit(0);
      }
    }
  }, 1000);

  let completed = 0;

  for (let i = 0; i < cores; i += 1) {
    let slice;
    if (i < cores - 1) {
      slice = pairFiles.slice(i * step, (i + 1) * step);
    } else {
      slice = pairFiles.slice(i * step);
    }

    const worker = cluster.fork();
    workersFinished.push(false);
    worker.send({
      slice: JSON.stringify(slice),
      pairsDir,
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

        labeledPairs = labeledPairs.concat(result);
      }
    });

    worker.on("message", msg => {
      if (msg.cmd === "update") {
        completed += 1;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`${completed} / ${pairFiles.length}`);
      }
    });
  }
} else {
  process.on("message", msg => {
    if (msg.cmd === "slice") {
      const labeledPairs = [];

      const pairFiles = JSON.parse(msg.slice);

      for (const pairFile of pairFiles) {
        const pair = JSON.parse(
          fs.readFileSync(path.resolve(msg.pairsDir, pairFile))
        );
        const left = pair.left;
        const right = pair.right;

        const cqlSpecLeft = vl2cql(left.vegalite);
        const cqlSpecRight = vl2cql(right.vegalite);

        const leftScore = cql.ranking.effectiveness(cqlSpecLeft).score;
        const rightScore = cql.ranking.effectiveness(cqlSpecRight).score;

        comparator =
          leftScore < rightScore ? "<" : leftScore === rightScore ? "=" : ">";

        delete pair.left.vegalite.data;
        delete pair.right.vegalite.data;

        pair.comparator = comparator;
        labeledPairs.push(pair);

        process.send({ cmd: "update" });
      }

      const result = JSON.stringify(labeledPairs);

      process.send({ cmd: "results", result }, undefined, undefined, () =>
        process.exit(0)
      );
    }
  });
}
