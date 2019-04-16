import { expect } from 'chai';
import 'mocha';
import { RateTable, Sku, Meter, CostInput } from './RateTable';

describe('RateTable', () => {

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
    }
    
    let rate = RateTable.pickRate(sku, input);
    expect(rate).to.equal(0.24);
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