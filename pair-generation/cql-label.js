const cql = require("~/compassql/src");
const path = require("path");
const fs = require("fs");
const cluster = require("cluster");
const yargs = require("yargs");
const os = require("os");
const vl2cql = require("./vl2cql");

if (cluster.isMaster) {
  const argv = yargs.argv;

  if (argv.input === undefined) {
    console.log("Provide an input directory.");
    exit(1);
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

  setInterval(() => {
    if (workersFinished.every(i => i)) {
      console.log("all done");
      if (!fs.existsSync(path.resolve(__dirname, "out"))) {
        fs.mkdirSync(path.resolve(__dirname, "out"));
      }

      fs.writeFileSync(
        path.join(__dirname, "out/labeledPairs.json"),
        JSON.stringify(labeledPairs, null, 2)
      );

      process.exit(0);
    }
  }, 1000);

  let completed = 0;

  for (let i = 0; i < cores; i += 1) {
    let slice;
    if (i < cores - 1) {
      slice = labeledPairs.slice(i * step, (i + 1) * step);
    } else {
      slice = labeledPairs.slice(i * step);
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

        labeledPairs = labeledPairs.concat(result.labeled);
      }
    });

    worker.on("message", msg => {
      if (msg.cmd === "update") {
        completed += 1;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`${completed} / ${labeledPairs.length}`);
      }
    });
  }
} else {
  process.on("message", msg => {
    if (msg.cmd === "slice") {
      const result = [];

      const pairFiles = JSON.parse(msg.slice);

      for (const pairFile of pairFiles) {
        const pair = JSON.parse(fs.readFileSync(pairFile));
        const left = pair.left;
        const right = pair.right;

        const cqlSpecLeft = vl2cql(left.vegalite);
        const cqlSpecRight = vl2cql(right.vegalite);

        const score = cql.ranking.effectiveness(cqlSpecLeft).score;

        console.log(score);
        process.exit(1);
      }

      process.send({ cmd: "results", result }, undefined, undefined, () =>
        process.exit(0)
      );
    }
  });
}
