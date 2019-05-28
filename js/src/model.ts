import { TopLevelUnitSpec } from 'vega-lite/build/src/spec/unit';
import asp2vl from './asp2vl';

export interface ModelObject {
  costs: number[];
  facts: string[];
}

export type VegaLiteSpecDictionaryObject = { [name: string]: TopLevelUnitSpec };

export class Model {
  static toVegaLiteSpecDictionary(model: ModelObject): VegaLiteSpecDictionaryObject {
    return asp2vl(model.facts);
  }
}
