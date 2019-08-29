const cql = require("compassql");

module.exports = function vl2cql(vlSpec) {
  const data = vlSpec.data.values;

  const schema = cql.schema.build(data);
  const specQ = cql.fromSpec(vlSpec);

  const query = cql.model.SpecQueryModel.build(specQ, schema, {});

  console.log(query);
  return query;
};
