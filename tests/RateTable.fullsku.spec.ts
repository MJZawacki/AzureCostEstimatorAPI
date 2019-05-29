import { expect } from 'chai';
import 'mocha';
import { RateTable, Sku, Meter, CostInput } from '../src/RateTable';
import { RateTableFileStore } from '../src/RateTableFileStore';
import { FunctionUtil } from '../src/FunctionUtil';
import * as fs from 'fs';
import * as config from "config";
var path = require('path');

describe('RateTable Calculations EastUS Linux Low', () => {

  var store, ratecard;
  before(async function() {
    let filecache = config.get('filecache') as string; 
    try { 
      expect(filecache).to.not.be.null;
      expect(filecache).to.not.equal('.');
      expect(filecache).to.not.equal('.\\');
      expect(filecache).to.not.equal('./');
      var cacheexists = fs.existsSync(filecache);
      if (cacheexists) 
      {
        var files = fs.readdirSync(filecache); 
        for (var i in files)
        {
          var ratefile = path.join(filecache, files[i]);
          fs.unlinkSync(ratefile)
        }
      }
     
    }
    catch(e) { 
      throw e; 
    }

    // create local cache of ratecard
    store = new RateTableFileStore();
    ratecard = await FunctionUtil.getRateTable('MS-AZR-0121p', store);
    

  });

  let testskus = JSON.parse(fs.readFileSync('skus_eastus_linux_low.json', 'utf8'));
  var tests = [];
  //for (var i = 0; i < 20; i++ ) {
  for (var i in testskus) {


      tests.push({ 
                    args: [testskus[i].name, testskus[i].location, 730, testskus[i].priority, testskus[i].os, 1, testskus[i].type, testskus[i].lowprioritycapable ],
                    expected: 0
              });
  }
  

      tests.forEach(function(test) {

        it('CalculateCosts should return correct costs for ' + test.args[0] + ':' + test.args[4] + ':' + test.args[3] + ':' + test.args[6] , async function() {
  
              let low_priority_capable : string = test.args[7];
              let input : CostInput[] =  [{
                "name": test.args[0],
                "location": test.args[1],
                "hours": test.args[2],
                "priority": test.args[3],
                "os": test.args[4],
                "quantity": test.args[5],
                "type": test.args[6]
              }];
              let output = ratecard.CalculateCosts(input);
              expect(output.costs.length).to.equal(input.length);
              if (low_priority_capable == 'False') {
                expect(output.costs[0].reason).to.be.not.null;
                expect(output.costs[0].reason).to.contain('No rate cards found');
              } else {
                expect(output.costs[0].monthlycost).to.be.a('number', 'cost returned ' + output.costs[0].monthlycost );
              }

            });
      })
      
    
});


describe('RateTable Calculations EastUS Linux Normal', () => {

  var store, ratecard;
  before(async function() {


    // create local cache of ratecard
    store = new RateTableFileStore();
    ratecard = await FunctionUtil.getRateTable('MS-AZR-0121p', store);
    

  });

  let testskus = JSON.parse(fs.readFileSync('skus_eastus_linux_normal.json', 'utf8'));
  var tests = [];
  //for (var i = 0; i < 20; i++ ) {
  for (var i in testskus) {


    
    tests.push({ 
      args: [testskus[i].name, testskus[i].location, 730, testskus[i].priority, testskus[i].os, 1, testskus[i].type ],
      expected: 0
    })

    }
  

      tests.forEach(function(test) {

        it('CalculateCosts should return correct costs for ' + test.args[0] + ':' + test.args[4] + ':' + test.args[3] + ':' + test.args[6]  , async function() {
  
          
          let input : CostInput[] =  [{
            "name": test.args[0],
            "location": test.args[1],
            "hours": test.args[2],
            "priority": test.args[3],
            "os": test.args[4],
            "quantity": test.args[5],
            "type": test.args[6]
          }];
          let output = ratecard.CalculateCosts(input);
          expect(output.costs.length).to.equal(input.length);

          expect(output.costs[0].monthlycost).to.be.a('number', 'cost returned ' + output.costs[0].monthlycost );

        });
      })
      
    
});


describe('RateTable Calculations EastUS Windows Low', () => {

  var store, ratecard;
  before(async function() {


    // create local cache of ratecard
    store = new RateTableFileStore();
    ratecard = await FunctionUtil.getRateTable('MS-AZR-0121p', store);
    

  });

  let testskus = JSON.parse(fs.readFileSync('skus_eastus_windows_low.json', 'utf8'));
  var tests = [];
  //for (var i = 0; i < 20; i++ ) {
  for (var i in testskus) {


    tests.push({ 
      args: [testskus[i].name, testskus[i].location, 730, testskus[i].priority, testskus[i].os, 1, testskus[i].type, testskus[i].lowprioritycapable ],
      expected: 0
    })
}
  

      tests.forEach(function(test) {

        it('CalculateCosts should return correct costs for ' + test.args[0] + ':' + test.args[4] + ':' + test.args[3] + ':' + test.args[6]  , async function() {
  

          let low_priority_capable : string = test.args[7];
          let input : CostInput[] =  [{
            "name": test.args[0],
            "location": test.args[1],
            "hours": test.args[2],
            "priority": test.args[3],
            "os": test.args[4],
            "quantity": test.args[5],
            "type": test.args[6]
          }];
          let output = ratecard.CalculateCosts(input);
          expect(output.costs.length).to.equal(input.length);
          if (low_priority_capable == 'False') {
            expect(output.costs[0].reason).to.be.not.null;
            expect(output.costs[0].reason).to.contain('No rate cards found');
          } else {
            expect(output.costs[0].monthlycost).to.be.a('number', 'cost returned ' + output.costs[0].monthlycost );
          }
        });
      })
      
    
});


describe('RateTable Calculations EastUS Windows Normal', () => {

  
  var store, ratecard;
  before(async function() {
    

    // create local cache of ratecard
    store = new RateTableFileStore();
    ratecard = await FunctionUtil.getRateTable('MS-AZR-0121p', store);
    

  });

  let testskus = JSON.parse(fs.readFileSync('skus_eastus_windows_normal.json', 'utf8'));
  var tests = [];
  //for (var i = 0; i < 20; i++ ) {
  for (var i in testskus) {


 
      tests.push({ 
                    args: [testskus[i].name, testskus[i].location, 730, testskus[i].priority, testskus[i].os, 1, testskus[i].type],
                    expected: 0
              })
    }
  

      tests.forEach(function(test) {

        it('CalculateCosts should return correct costs for ' + test.args[0] + ':' + test.args[4] + ':' + test.args[3] + ':' + test.args[6] , async function() {
  

  
              let input : CostInput[] =  [{
                "name": test.args[0],
                "location": test.args[1],
                "hours": test.args[2],
                "priority": test.args[3],
                "os": test.args[4],
                "quantity": test.args[5],
                "type": test.args[6]
              }];
              let output = ratecard.CalculateCosts(input);
              expect(output.costs.length).to.equal(input.length);
              expect(output.costs[0].monthlycost).to.be.a('number', 'cost returned ' + output.costs[0].monthlycost );

            });
      })
      
    
});

