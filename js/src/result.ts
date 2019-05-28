import { VegaLiteSpecDictionaryObject, ModelObject } from './model';
import { array } from 'vega';

export type ResultObject = any;

export class Result {
  static toModels(result: ResultObject): ModelObject[] {
    return (result.Call || []).reduce((arr: any[], el: any) => {
      el.Witnesses.forEach((d: any) => {
        const facts = d.Value;
        const costs = d.costs;

        arr.push({
          costs,
          facts,
        });
      });

      return arr;
    }, []);
  }
}
