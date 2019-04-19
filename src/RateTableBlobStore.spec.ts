import { expect, assert } from 'chai';
import 'mocha';
import { RateTable, Sku, Meter, CostInput } from './RateTable';
import { RateTableBlobStore } from './RateTableBlobStore';
import { FunctionUtil } from './FunctionUtil';
import * as fs from 'fs';
import { AssertionError } from 'assert';

describe('RateTableBlobStore', () => {

  it('saveRateTable should save file to BlobStore', () => {

    let store = new RateTableBlobStore();

    let testobj = {
        "_skus": "[{}]",
        "_meters": "[{}]",
        "_datacenters": "[{}]"
    };

    assert.doesNotThrow(store.saveRateTable('test', testobj));
  });
 
  it('getRateTable should return rates lookuptable', () => {

    let store = new RateTableBlobStore();

    let rates = RateTableBlobStore.getRateTable('test');
    
    expect(rates).to.be.a('object');
    expect(rates).to.have.property('_skus');
    expect(rates).to.have.property('_meters');
    expect(rates).to.have.property('_datacenters');
  
  });

});