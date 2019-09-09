const fs = require("fs");
const path = require("path");

const random = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "out-random/coverage.json"))
);
const structured = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "out-structured-choose-dim-big/coverage.json"))
);

const result = [];

for (let i = 0; i < random.length; i += 1) {
  const name = random[i].name;
  const value = random[i].value;
  const randomPerc = random[i].count;

  let structuredPerc = 0;
  for (const rec of structured) {
    if (rec.name === name && rec.value === value) {
      structuredPerc = rec.count;
    }
  }

  result.push({
    name: random[i].name,
    value: random[i].value,
    random: random[i].count,
    structured: structuredPerc
  });
}

for (let i = 0; i < structured.length; i += 1) {
  const name = structured[i].name;
  const value = structured[i].value;
  const structuredPerc = structured[i].count;

  let randomPerc = 0;
  for (const rec of random) {
    if (rec.name === name && rec.value === value) {
      randomPerc = rec.count;
    }
  }

  let seen = false;
  for (const rec of result) {
    if (result.name === name && result.value === value) {
      seen = true;
      break;
    }
  }

  if (seen) {
    continue;
  }

  result.push({
    name,
    value,
    random: randomPerc,
    structured: structuredPerc
  });
}

fs.writeFileSync(
  path.resolve(__dirname, "coverage.json"),
  JSON.stringify(result, null, 2)
);
