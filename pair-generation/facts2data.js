const Chance = require("chance");
const faker = require("faker");

const NUM_ROWS_REGEX = /num_rows\((.*)\)/;
const DATA_FIELD_TYPE_REGEX = /fieldtype\((.*),(.*)\)/;
const CARDINALITY_REGEX = /cardinality\((.*),(.*)\)/;
const EXTENT_REGEX = /extent\((.*),(.*),(.*)\)/;

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
      fields[field]["cardinality"] = +cardinality;
    } else if (doesMatchRegex(value, EXTENT_REGEX)) {
      const [fullMatch, field, min, max] = EXTENT_REGEX.exec(value);
      fields[field]["min"] = +min;
      fields[field]["max"] = +max;
    } else if (doesMatchRegex(value, NUM_ROWS_REGEX)) {
      const [fullMatch, numRows] = NUM_ROWS_REGEX.exec(value);
      rows = +numRows;
    }
  });

  const fieldMapping = {};
  const fieldValues = {};

  const seenFields = new Set();

  for (const field of Object.keys(fields)) {
    const descriptor = fields[field];
    let { newName, values } = generateColumn(
      field,
      descriptor,
      rows,
      seenFields
    );

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

function generateColumn(fieldName, descriptor, numRows, seenFields) {
  const chance = new Chance();

  let options;
  const n = descriptor.cardinality;
  const min = descriptor.min;
  const max = descriptor.max;

  let name;
  let names;
  switch (descriptor.type) {
    case "number":
      options = chance.unique(chance.floating, n, { min, max });
      names = ["GDP", "Land Area", "CO2 Emission Index", "Imports", "Exports"];
      break;
    case "integer":
      options = chance.unique(chance.integer, n, { min, max });
      names = ["Population", "Power Rank", "Housing Index", "Livability Index"];
      break;
    case "date":
      options = chance.unique(() => faker.date.toString(), n);
      names = ["Date", "Founded", "Target", "Last Election"];
      break;
    case "string":
      options = chance.unique(chance.country, n, { full: true });
      names = ["Country", "Region", "Province", "State"];
      break;
    case "boolean":
      options = chance.unique(chance.bool, n);
      names = ["United Nations", "NATO", "OPEG", "Democracy", "Communist"];
      break;
  }

  for (const n of names) {
    if (seenFields.has(n)) {
      continue;
    } else {
      name = n;
      break;
    }
  }

  seenFields.add(name);

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
  const chance = new Chance();

  const shuffled = chance.shuffle(arr);
  for (let i = 0; i < values; i += 1) {
    arr[i] = values[i];
  }

  return shuffled;
}

function populateToN(arr, n) {
  const chance = new Chance();

  return chance.shuffle(
    arr.concat(chance.n(chance.pickone, n - arr.length, arr))
  );
}

module.exports = {
  facts2data
};
