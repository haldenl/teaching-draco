const cql = require("~/compassql/src");
const spec = require("~/compassql/src/spec");

export default function vl2cql(vlSpec) {
  const data = vlSpec.data.values;

  const schema = cql.schema.build(data);
  const specQ = spec.fromSpec(vlSpec);

  const query = cql.model.SpecQueryModel.build(specQ, schema, {});

  return query;
}
