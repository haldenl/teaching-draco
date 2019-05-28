import asp2vl from '../src/asp2vl';

describe('ASP <-> VegaLite', () => {
  describe('ASP -> VL', () => {
    test('Scatterplot', () => {
      expect(asp2vl(SCATTER.facts)).toEqual(SCATTER.specs);
    });
  });
});

const SCATTER = {
  facts: [
    'view(v1)',
    'view(v2)',
    'fieldtype(f1,number)',
    'fieldtype(f2,number)',
    'encoding(v1,e1)',
    'encoding(v1,e2)',
    'encoding(v2,e1)',
    'encoding(v2,e2)',
    'type(v1,e1,quantitative)',
    'type(v1,e2,quantitative)',
    'type(v2,e1,quantitative)',
    'type(v2,e2,quantitative)',
    'field(v1,e1,f1)',
    'field(v1,e2,f2)',
    'field(v2,e1,f1)',
    'field(v2,e2,f2)',
    'channel(v1,e1,x)',
    'channel(v1,e2,y)',
    'channel(v2,e1,x)',
    'channel(v2,e2,y)',
    'mark(v1,point)',
    'mark(v2,point)',
    'soft(subtype,name,v1,param)',
    'soft(subtype,name,v2,param)',
  ],
  specs: {
    v1: {
      mark: 'point',
      encoding: {
        x: {
          field: 'f1',
          type: 'quantitative',
        },
        y: {
          field: 'f2',
          type: 'quantitative',
        },
      },
    },
    v2: {
      mark: 'point',
      encoding: {
        x: {
          field: 'f1',
          type: 'quantitative',
        },
        y: {
          field: 'f2',
          type: 'quantitative',
        },
      },
    },
  },
};
