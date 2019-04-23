import { expect, assert } from 'chai';
import 'mocha';

import { RateTable, Sku, Meter, CostInput } from './RateTable';
import { RateTableFileStore } from './RateTableFileStore';
import { FunctionUtil } from './FunctionUtil';
import * as fs from 'fs';
import { doesNotReject } from 'assert';

describe('RateTable', () => {

  var store, ratecard;
  before(async function() {
    // create local cache of ratecard if it doesn't exist
    this.timeout(50000);
    //setTimeout(done, 50000);
    store = new RateTableFileStore();
    ratecard = await FunctionUtil.getRateTable('MS-AZR-0121p', store);
    expect(ratecard).to.not.be.null;
    
  });


  it('getRateNames should return all ratecards', () => {

    let sku : Sku = loadtestsku();
    const result = RateTable.getRateNames(sku);
    expect(result.length).to.equal(sku.ratecards.length);
  });
 
  it('pickRate should return linux normal priority', () => {

    let sku : Sku = loadtestsku();
    let input : CostInput =  {
      "name": "Standard_A8_v2",
      "location": "eastus",
      "hours": 730,
      "priority": "normal",
      "os": "linux",
      "quantity": 3,
      "type": "vm"
    }
    
    let rate = RateTable.pickRate(sku, input);
    expect(rate).to.equal(0.4);
  });

  


  it('pickRate should return linux low priority', () => {

    let sku : Sku = loadtestsku();
    let input : CostInput =  {
      "name": "Standard_A8_v2",
      "location": "eastus",
      "hours": 730,
      "priority": "low",
      "os": "linux",
      "quantity": 3,
      "type": "vm"
    }
    
    let rate = RateTable.pickRate(sku, input);
    expect(rate).to.equal(0.08);
  });

  it('pickRate should return Windows normal priority', () => {

    let sku : Sku = loadtestsku();
    let input : CostInput =  {
      "name": "Standard_A8_v2",
      "location": "eastus",
      "hours": 730,
      "priority": "normal",
      "os": "linux",
      "quantity": 3,
      "type": "vm"
    }
    
    let rate = RateTable.pickRate(sku, input);
    expect(rate).to.equal(0.4);
  });

  it('pickRate should return Windows low priority', () => {

    let sku : Sku = loadtestsku();
    let input : CostInput =  {
      "name": "Standard_A8_v2",
      "location": "eastus",
      "hours": 730,
      "priority": "low",
      "os": "Windows",
      "quantity": 3,
      "type": "vm"
    }
    
    let rate = RateTable.pickRate(sku, input);
    expect(rate).to.equal(0.24);
  });

  it('pickRate should return linux low priority for Standard_B1ls sku', async () => {

    let store = new RateTableFileStore();
    let ratecard = await FunctionUtil.getRateTable('MS-AZR-0121p', store);

    let input : CostInput[] =  [{
      "name": "Standard_B1ls",
      "location": "eastus",
      "hours": 730,
      "priority": "low",
      "os": "linux",
      "quantity": 1,
      "type": "vm"
    }]
    


    let output = ratecard.CalculateCosts(input);
   
    expect(output.costs.length).to.equal(input.length);
    expect(output.costs[0].reason).to.contain('No rate cards found');


  
  });

  it('pickRate should handle F2s vs F2s_v2', async () => {

    


 
    let location = 'eastus';
    let skuname = 'Standard_F2s'
    let sku = ratecard.findSku(location, skuname)
   
    expect(sku.length).to.equal(1);
  });

  it('CalculateCosts should return correct costs for Standard_F2s vm', async () => {



    let input : CostInput[] =  [{
      "name": "Standard_F2s",
      "location": "eastus",
      "hours": 730,
      "priority": "normal",
      "os": "linux",
      "quantity": 1,
      "type": "vm"
    }];
    let output = ratecard.CalculateCosts(input);
   
    expect(output.monthlytotal).to.equal("72.27");
    expect(output.annualtotal).to.equal("867.24");
    expect(output.costs.length).to.equal(input.length);
  });
  it('CalculateCosts should return correct costs for Standard_A8_v2 vm', async () => {


    let input : CostInput[] =  [{
      "name": "Standard_A8_v2",
      "location": "eastus",
      "hours": 730,
      "priority": "low",
      "os": "Windows",
      "quantity": 3,
      "type": "vm"
    }];
    let output = ratecard.CalculateCosts(input);
   
    expect(output.monthlytotal).to.equal("525.60");
    expect(output.annualtotal).to.equal("6307.20");
    expect(output.costs.length).to.equal(input.length);
  });

  it('CalculateCosts should return correct costs for P60 sku', async () => {


    let input : CostInput[] =  [{
      "name": "P60",
      "location": "eastus",
      "hours": 730,
      "priority": null,
      "os": null,
      "quantity": 3,
      "type": "storage"
    }];
    let output = ratecard.CalculateCosts(input);
   
    expect(output.monthlytotal).to.equal("1419.12");
    expect(output.annualtotal).to.equal("17029.44");
    expect(output.costs.length).to.equal(input.length);
  });

  
});





var loadtestsku = function() {
  return JSON.parse(
    `
      {
        "resourceType": "virtualMachines",
        "name": "Standard_A8_v2",
        "tier": "Standard",
        "size": "A8_v2",
        "family": "standardAv2Family",
        "locations": [
          "eastus"
        ],
        "locationInfo": [
          {
            "location": "eastus",
            "zones": [
              "3",
              "2",
              "1"
            ]
          }
        ],
        "capabilities": [
          {
            "name": "MaxResourceVolumeMB",
            "value": "81920"
          },
          {
            "name": "OSVhdSizeMB",
            "value": "1047552"
          },
          {
            "name": "vCPUs",
            "value": "8"
          },
          {
            "name": "HyperVGenerations",
            "value": "V1"
          },
          {
            "name": "MemoryGB",
            "value": "16"
          },
          {
            "name": "MaxDataDiskCount",
            "value": "16"
          },
          {
            "name": "LowPriorityCapable",
            "value": "True"
          },
          {
            "name": "PremiumIO",
            "value": "False"
          },
          {
            "name": "vCPUsAvailable",
            "value": "8"
          },
          {
            "name": "ACUs",
            "value": "100"
          },
          {
            "name": "vCPUsPerCore",
            "value": "1"
          },
          {
            "name": "CombinedTempDiskAndCachedIOPS",
            "value": "8000"
          },
          {
            "name": "CombinedTempDiskAndCachedReadBytesPerSecond",
            "value": "167772160"
          },
          {
            "name": "CombinedTempDiskAndCachedWriteBytesPerSecond",
            "value": "83886080"
          },
          {
            "name": "EphemeralOSDiskSupported",
            "value": "False"
          }
        ],
        "restrictions": [],
        "location": "eastus",
        "basename": "A8 v2",
        "meterregion": "US East",
        "ratecards": [
          {
            "EffectiveDate": "2016-11-01T00:00:00Z",
            "IncludedQuantity": 0,
            "MeterCategory": "Virtual Machines",
            "MeterId": "5b056dd5-4e11-4b04-8f7c-c8f0534823bc",
            "MeterName": "A8 v2",
            "MeterRates": {
              "0": 0.4
            },
            "MeterRegion": "US East",
            "MeterStatus": "Active",
            "MeterSubCategory": "Av2 Series",
            "MeterTags": [],
            "Unit": "1 Hour"
          },
          {
            "EffectiveDate": "2017-04-01T00:00:00Z",
            "IncludedQuantity": 0,
            "MeterCategory": "Virtual Machines",
            "MeterId": "6a13f3f2-8b89-485c-9292-46117f133619",
            "MeterName": "A8 v2 Low Priority",
            "MeterRates": {
              "0": 0.08
            },
            "MeterRegion": "US East",
            "MeterStatus": "Active",
            "MeterSubCategory": "Av2 Series",
            "MeterTags": [],
            "Unit": "1 Hour"
          },
          {
            "EffectiveDate": "2017-04-01T00:00:00Z",
            "IncludedQuantity": 0,
            "MeterCategory": "Virtual Machines",
            "MeterId": "2be4732f-179f-4869-82c2-e808df842fe2",
            "MeterName": "A8 v2 Low Priority",
            "MeterRates": {
              "0": 0.24
            },
            "MeterRegion": "US East",
            "MeterStatus": "Active",
            "MeterSubCategory": "Av2 Series Windows",
            "MeterTags": [],
            "Unit": "1 Hour"
          },
          {
            "EffectiveDate": "2016-11-01T00:00:00Z",
            "IncludedQuantity": 0,
            "MeterCategory": "Virtual Machines",
            "MeterId": "2781f1d6-dbe4-4dbf-97c9-af5ccfd8a31b",
            "MeterName": "A8 v2",
            "MeterRates": {
              "0": 0.6
            },
            "MeterRegion": "US East",
            "MeterStatus": "Active",
            "MeterSubCategory": "Av2 Series Windows",
            "MeterTags": [],
            "Unit": "1 Hour"
          }
        ]
      }`);
}