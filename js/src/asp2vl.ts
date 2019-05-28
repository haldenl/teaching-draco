import { TopLevelUnitSpec } from 'vega-lite/src/spec/unit';
import { doesMatchRegex } from './util';
import { VegaLiteSpecDictionaryObject } from './model';

const VIEW_REGEX_CAPTURE = /view\((.*)\)./;
const FACT_REGEX = /(\w+)\(([\w\.\/]+)(,([\w\.]+))?(,([\w\.]+))?\)/;

export default function asp2vl(facts: string[]): VegaLiteSpecDictionaryObject {
  const views = facts
    .filter(fact => {
      return doesMatchRegex(fact, VIEW_REGEX_CAPTURE);
    })
    .map(fact => {
      const extract = VIEW_REGEX_CAPTURE.exec(fact);
      if (extract) {
        const [_, name] = extract;
        return name;
      }
      throw new Error(`Invalid view statement: ${fact}.`);
    });

  const result = views.reduce(
    (dict, v) => {
      dict[v] = asp2vl_view(facts, v);
      return dict;
    },
    {} as any
  );

  return result;
}

function asp2vl_view(facts: string[], view: string): TopLevelUnitSpec {
  let mark;
  const encodings: { [enc: string]: any } = {};

  for (const value of facts) {
    const extract = FACT_REGEX.exec(value);
    if (!extract) {
      throw new Error(`Invalid fact: ${value}`);
    }

    const [_, predicate, viz, __, first, ___, second] = extract;

    if (predicate === 'view') {
      continue;
    }

    switch (predicate) {
      case 'mark':
        mark = first;
        break;
      case 'field':
      case 'type':
      case 'channel':
      case 'scale':
      case 'bin':
      case 'aggregate':
      case 'stack':
        if (!encodings[first]) {
          encodings[first] = {};
        }

        encodings[first][predicate] = second;
    }
  }

  const encoding: { [channel: string]: any } = {};

  for (const e of Object.keys(encodings)) {
    const enc = encodings[e];

    const scale = {
      ...(enc.scale === 'log' ? { type: 'log' } : {}),
      ...(enc.scale === 'zero' ? { zero: true } : {}),
    };

    encoding[enc.channel] = {
      type: enc.type,
      ...(enc.aggregate ? { aggregate: enc.aggregate } : {}),
      ...(enc.field ? { field: enc.field } : {}),
      ...(enc.stack ? { stack: enc.stack } : {}),
      ...(enc.bin ? { bin: true } : {}),
      ...scale,
    };
  }

  const spec = {
    mark,
    encoding,
  } as TopLevelUnitSpec;

  return spec;
}
