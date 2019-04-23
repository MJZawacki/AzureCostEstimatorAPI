import { expect, assert } from 'chai';
import 'mocha';

import { RateTable, Sku, Meter, CostInput } from '../src/RateTable';
import { RateTableBlobStore } from '../src/RateTableBlobStore';
import { FunctionUtil } from '../src/FunctionUtil';
import * as fs from 'fs';
import { doesNotReject } from 'assert';
import * as request from "request-promise";

describe('Azure Functions Integration Tests', function () {

    this.timeout(20000);
    var store, ratecard;
  
    before(async function() {
    });


    it('/api/costmodel should return correct costs', () => {

    
        let testskus = JSON.parse(fs.readFileSync('skus_eastus_linux_low.json', 'utf8'));
                
        return postrequest(testskus).then( (results) => {
       
        expect(results).to.not.be.null;
        expect(results.monthlytotal).to.equal("9386.70");
        expect(results.annualtotal).to.equal("112640.46");
        }).catch((error) => {
            if (error) throw new Error(error);
        });

  
    });

    it('/api/costmodel should return correct costs for B1ls', () => {

        let input : CostInput =  {
            "name": "Standard_B1ls",
            "location": "eastus",
            "hours": 730,
            "priority": "low",
            "os": "linux",
            "quantity": 1,
            "type": "vm"
          }
    
        return postrequest(input).then( (results) => {
       
        expect(results).to.not.be.null;
        //expect(results.monthlytotal).to.equal("9386.70");
        //expect(results.annualtotal).to.equal("112640.46");

        }).catch((error) => {
            if (error) throw new Error(error);
        });

  
    });


});

var postrequest = async function (jsonobj) {
    var options = { method: 'POST',
    url: 'https://mzratecardfunc.azurewebsites.net/api/costmodel',
    headers: 
    { 
        'Content-Type': 'application/json' },
    qs: 
    { code: 'FGhUffy0jIaVwck4uQ4kdHSTav4RUr3yMUtNIT/fOzyeff/MpeS/Kw==',
    },
    body: jsonobj,
    json: true 
    };

    return request(options);
}