import { TopLevelUnitSpec } from 'vega-lite/src/spec/unit';
import { doesMatchRegex } from './util';

export type VegaLiteSpecDictionaryObject = { [name: string]: TopLevelUnitSpec };

export type FactsObject = string[];

export class Facts {
  static toVegaLiteSpecDictionary(facts: FactsObject): VegaLiteSpecDictionaryObject {
    return facts2vl(facts);
  }

  static toViews(facts: FactsObject): string[] {
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

    return views;
  }
}

const VIEW_REGEX_CAPTURE = /view\((.*)\)/;
const FACT_REGEX = /(\w+)\(([\w\.\/]+)(,([\w\.]+))?(,([\w\.]+))?\)/;

function facts2vl(facts: string[]): VegaLiteSpecDictionaryObject {
  const views = facts2views(facts);

  const result = views.reduce(
    (dict, v) => {
      dict[v] = facts2vl_single(facts, v);
      return dict;
    },
    {} as any
  );

  return result;
}

function facts2views(facts: string[]): string[] {
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

  return views;
}

function facts2vl_single(facts: string[], view: string): TopLevelUnitSpec {
  let mark;
  const encodings: { [enc: string]: any } = {};

  for (const value of facts) {
    const extract = FACT_REGEX.exec(value);
    if (!extract) {
      continue;
    }

    const [_, predicate, viz, __, first, ___, second] = extract;

    if (viz !== view) {
      continue;
    }

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

    const insert = {
      type: enc.type,
      ...(enc.aggregate ? { aggregate: enc.aggregate } : {}),
      ...(enc.field ? { field: enc.field } : {}),
      ...(enc.stack ? { stack: enc.stack } : {}),
      ...(enc.bin ? { bin: true } : {}),
      ...scale,
    };

    if (enc.aggregate) {
      encoding;
    }

    encoding[enc.channel] = insert;
  }

  const spec = {
    mark,
    encoding,
  } as TopLevelUnitSpec;

  return spec;
}
