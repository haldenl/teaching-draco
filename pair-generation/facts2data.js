const DATA_FACT_REGEX = /data_fact\((\w+),(\w+)\)/;
const DATA_FIELD_TYPE_REGEX = /fieldtype\((\w+),(\w+)\)/;

const PROP_ORDER = [
  "negative_min",
  "negative_or_zero_min",
  "cardinality_gt_8",
  "cardinality_gt_20",
  "min_minus_max_gt_min_or_max_minus_zero",
  "extent_includes_zero",
  "cardinality_high",
  "cardinality_medium",
  "cardinality_low",
  "cardinality_very_low",
  "cardinality_very_very_low"
];

export default function facts2data(facts) {
  // extract fields
  const fields = facts.reduce((dict, value) => {
    if (doesMatchRegex(value, DATA_FIELD_TYPE_REGEX)) {
      const [fullMatch, field, type] = DATA_FIELD_TYPE_REGEX.exec(value);
      dict[field] = {
        type,
        props: [],
        multiProps: []
      };
    }

    return dict;
  }, {});

  let rows = 0;

  facts.forEach(value => {
    if (doesMatchRegex(value, DATA_FACT_REGEX)) {
      const [fullMatch, name, parameters] = DATA_FACT_REGEX.exec(value);

      switch (name) {
        case "rows_high":
          rows = 1000;
          break;
        case "rows_medium":
          rows = 100;
          break;
        case "rows_low":
          rows = 50;
          break;
        case "rows_very_low":
          rows = 10;
          break;
        case "negative_min":
        case "negative_or_zero_min":
        case "cardinality_gt_8":
        case "cardinality_gt_20":
        case "min_minus_max_gt_min_or_max_minus_zero":
        case "extent_includes_zero":
        case "cardinality_very_high":
        case "cardinality_high":
        case "cardinality_medium":
        case "cardinality_low":
        case "cardinality_very_low":
        case "cardinality_very_very_low":
          fields[parameters].props.push(name);
          break;
        case "definitely_overlap_fields":
        case "definitely_not_overlap_fields":
          const [f1, f2] = parameters
            .slice(1, parameters.length - 1)
            .split(",");
          fields[f1].multiProps.push({ name, f2 });
          fields[f2].multiProps.push({ name, f1 });
      }
    }
  });

  const dataPropsByField = {};

  // single props
  for (const [field, description] of Object.entries(fields)) {
    const type = description.type;

    description.props = PROP_ORDER.filter(p => description.props.includes(p));

    let cardinality = 0;
    let min = 1;
    let max = 2;
    for (const prop of description.props) {
      switch (prop) {
        case "negative_min":
          min = -100;
          break;
        case "negative_or_zero_min":
          min = 0;
          break;
        case "cardinality_gt_8":
          cardinality = Math.max(8, cardinality);
          break;
        case "cardinality_gt_20":
          cardinality = Math.max(20, cardinality);
          break;
        case "cardinality_very_high":
          cardinality = Math.max(1000, cardinality);
          break;
        case "cardinality_high":
          cardinality = Math.max(100, cardinality);
          break;
        case "cardinality_medium":
          cardinality = Math.max(20, cardinality);
          break;
        case "cardinality_low":
          cardinality = Math.max(10, cardinality);
          break;
        case "cardinality_very_low":
          cardinality = Math.max(5, cardinality);
          break;
        case "cardinality_very_very_low":
          cardinality = Math.max(3, cardinality);
          break;
        case "min_minus_max_gt_min_or_max_minus_zero":
          if (min <= 0) {
            max = Math.floor(Math.abs(min) / 2);
          } else {
            max = min * 2;
          }
          break;
        case "extent_includes_zero":
          if (min <= 0) {
            max = Math.abs(min);
          }
          break;
      }
    }

    dataPropsByField[field] = {
      type,
      min,
      max,
      cardinality
    };
  }

  // multi props
  for (const [f1, description] of Object.entries(fields)) {
    for (const { name, f2 } of description.multiProps) {
      switch (name) {
        case "definitely_overlap_fields":
          if (
            rows <=
            dataPropsByField[f1].cardinality * dataPropsByField[f2].cardinality
          ) {
            rows =
              dataPropsByField[f1].cardinality *
              dataPropsByField[f2].cardinality *
              2;
          }
          break;
        case "definitely_not_overlap_fields":
          if (
            rows !==
            dataPropsByField[f1].cardinality * dataPropsByField[f2].cardinality
          ) {
            rows =
              dataPropsByField[f1].cardinality *
              dataPropsByField[f2].cardinality;
          }
          break;
      }
    }
  }

  const dataByField = {};

  for (const [field, props] of Object.entries(dataPropsByField)) {
    const data = [];

    if (props.type === "number") {
      if (props.cardinality > 0.9 * rows) {
        for (let i = 0; i < rows; i += 1) {
          data.push(Math.random() * (props.max - props.min) + props.min);
        }
      } else {
        const choices = [];
        const step = (props.max - props.min) / props.cardinality;
        for (let i = props.min; i < props.max; i += step) {
          choices.push(Math.round(i * 100) / 100);
        }

        for (let i = 0; i < rows; i += 1) {
          data.push(choices[Math.floor(Math.random() * choices.length)]);
        }
      }
    } else if (props.type === "string") {
      const vocab = randomWords(props.cardinality);
      for (let i = 0; i < rows; i += 1) {
        data.push(vocab[Math.floor(Math.random() * vocab.length)]);
      }
    } else if (props.type === "boolean") {
      const choices = [true, false];
      for (let i = 0; i < rows; i += 1) {
        data.push(choices[Math.floor(Math.random() * choices.length)]);
      }
    }

    dataByField[field] = data;
  }

  const data = [];
  for (let i = 0; i < rows; i += 1) {
    const row = {};
    for (const [f, d] of Object.entries(dataByField)) {
      row[f] = d[i];
    }

    data.push(row);
  }

  return data;
}
