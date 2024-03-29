import { expect, assert } from 'chai';
import 'mocha';
import { RateTable, Sku, Meter, CostInput } from './RateTable';
import { RateTableBlobStore } from './RateTableBlobStore';
import { FunctionUtil } from './FunctionUtil';
import * as fs from 'fs';
import { AssertionError, doesNotReject } from 'assert';
import { exponentialRetryPolicy } from '@azure/ms-rest-js';
import * as config from "config";

describe('RateTableBlobStore', () => {

  it('saveRateTable should save file to BlobStore', async function() {
    this.timeout(20000);

    let store = new RateTableBlobStore();

    let testobj = {
        "_skus": [{}],
        "_datacenters": [{}]
    };
    let url = await store.saveRateTable('test', new RateTable(testobj));
    expect(url).to.not.be.null;
    // assert.doesNotThrow(await store.saveRateTable('test', <RateTable>testobj));

  });
 
  it('getRateTable should return rates lookuptable', async function() {
    this.timeout(20000);
    let store = new RateTableBlobStore();

    let rates = await store.getRateTable('test');
    
    expect(rates).to.be.a('object');
    expect(rates).to.have.property('_skus');
    expect(rates).to.have.property('_datacenters');
   
  });

});