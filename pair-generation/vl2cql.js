const cql = require("compassql");

export default function vl2cql(vlSpec) {
  const data = vlSpec.data.values;

  const schema = cql.build(data);
  const specQ = cql.fromSpec(vlSpec);

  const query = cql.SpecQueryModel.build(specQ, schema, {});

  return query;
}
