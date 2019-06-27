const chance = require("chance");
const faker = require("faker");

const NUM_ROWS_REGEX = /num_rows\((\d+)\)./;
const DATA_FIELD_TYPE_REGEX = /fieldtype\((\w+),(\w+)\)./;
const CARDINALITY_REGEX = /cardinality\((\w+),(\d+)\)./;
const EXTENT_REGEX = /cardinality\((\w+),(\d+),(\d+)\)./;

function doesMatchRegex(s, r) {
  return s.match(r) !== null;
}

function facts2data(facts) {
  // extract fields
  const fields = facts.reduce((dict, value) => {
    if (doesMatchRegex(value, DATA_FIELD_TYPE_REGEX)) {
      const [fullMatch, field, type] = DATA_FIELD_TYPE_REGEX.exec(value);
      dict[field] = {
        type
      };
    }

    return dict;
  }, {});

  let rows = 0;

  facts.forEach(value => {
    if (doesMatchRegex(value, CARDINALITY_REGEX)) {
      const [fullMatch, field, cardinality] = CARDINALITY_REGEX.exec(value);
      fields[field]["cardinality"] = cardinality;
    } else if (doesMatchRegex(value, EXTENT_REGEX)) {
      const [fullMatch, field, min, max] = EXTENT_REGEX.exec(value);
      fields[field]["min"] = min;
      fields[field]["max"] = max;
    } else if (doesMatchRegex(value, NUM_ROWS_REGEX)) {
      const [fullMatch, numRows] = NUM_ROWS_REGEX.exec(value);
      rows = numRows;
    }
  });

  const fieldMapping = {};
  const fieldValues = {};

  for (const field of Object.keys(fields)) {
    const descriptor = fields[field];
    const { newName, values } = generateColumn(field, descriptor, rows);
    fieldMapping[field] = newName;
    fieldValues[newName] = values;
  }

  const data = [];
  for (let i = 0; i < rows; i += 1) {
    const row = {};
    for (const [f, d] of Object.entries(fieldValues)) {
      row[f] = d[i];
    }

    data.push(row);
  }

  return {
    data,
    fieldMapping
  };
}

function generateColumn(fieldName, descriptor, numRows) {
  const seen = new Set();

  let options;
  const n = descriptor.cardinality;
  const min = descriptor.min;
  const max = descriptor.max;
  let name;
  switch (descriptor.type) {
    case "number":
      options = chance.unique(chance.floating, n, { min, max });
      name = "GDP";
      break;
    case "integer":
      options = chance.unique(chance.integer, n, { min, max });
      name = "Population";
      break;
    case "date":
      options = chance.unique(
        faker.date.between(new Date(min), new Date(max)),
        n
      );
      name = "Date";
      break;
    case "string":
      options = chance.unique(chance.country, n, { full: true });
      name = "Country";
      break;
    case "boolean":
      options = chance.unique(chance.bool, n);
      name = "Island";
      break;
  }

  const values = populateToN(
    morphToRequiredValues(options, [min, max]),
    numRows
  );

  return {
    newName: name,
    values
  };
}

function morphToRequiredValues(arr, values) {
  const shuffled = chance.shuffle(arr);
  for (let i = 0; i < values; i += 1) {
    arr[i] = values[i];
  }

  return shuffled;
}

function populateToN(arr, n) {
  return chance.shuffle(
    arr.concat(chance.n(chance.pickone, n - arr.length, arr))
  );
}

module.exports = {
  facts2data
};
