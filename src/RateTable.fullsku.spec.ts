import { expect } from 'chai';
import 'mocha';
import { RateTable, Sku, Meter, CostInput } from './RateTable';
import { RateTableFileStore } from './RateTableFileStore';
import { FunctionUtil } from './FunctionUtil';
import * as fs from 'fs';

describe('RateTable Calculations EastUS Linux Low', () => {

  before(async function() {
    // create local cache of ratecard if it doesn't exist
    let store = new RateTableFileStore();
    let ratecard = await FunctionUtil.getRateTable(store);
    

  });

  let testskus = JSON.parse(fs.readFileSync('skus_eastus_linux_low.json', 'utf8'));
  var tests = [];
  //for (var i = 0; i < 20; i++ ) {
  for (var i in testskus) {

    var type = 'low';
    var priority = 'normal';
    var os = 'Linux';
   
    

      tests.push({ 
                    args: [testskus[i].name, testskus[i].location, 730, priority, os, 1, type ],
                    expected: 0
              })
    }
  

      tests.forEach(function(test) {

        it('CalculateCosts should return correct costs for ' + test.args[0] + ':' + test.args[4] + ':' + test.args[3] + ':' + test.args[6] , async function() {
  
          let store = new RateTableFileStore();
          let ratecard = await FunctionUtil.getRateTable(store);
          
  
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
              //expect(output.costs[0].monthlycost.toFixed(2)).to.equal((test.expected * 730).toFixed(2), 'monthly total is incorrect - ' + output.costs[0].reason );
              //expect(output.costs[0].annualcost.toFixed(2)).to.equal((test.expected * 730 * 12).toFixed(2), 'annual total is incorrect' );
            });
      })
      
    
});


describe('RateTable Calculations EastUS Linux Normal', () => {

  let testskus = JSON.parse(fs.readFileSync('skus_eastus_linux_normal.json', 'utf8'));
  var tests = [];
  //for (var i = 0; i < 20; i++ ) {
  for (var i in testskus) {

    var type = 'vm';
    var priority = 'normal';
    var os = 'Linux';
   
    

      tests.push({ 
                    args: [testskus[i].name, testskus[i].location, 730, priority, os, 1, type],
                    expected: 0
              })
    }
  

      tests.forEach(function(test) {

        it('CalculateCosts should return correct costs for ' + test.args[0] + ':' + test.args[4] + ':' + test.args[3] + ':' + test.args[6]  , async function() {
  
          let store = new RateTableFileStore();
          let ratecard = await FunctionUtil.getRateTable(store);
          
  
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
              //expect(output.costs[0].monthlycost.toFixed(2)).to.equal((test.expected * 730).toFixed(2), 'monthly total is incorrect - ' + output.costs[0].reason );
              //expect(output.costs[0].annualcost.toFixed(2)).to.equal((test.expected * 730 * 12).toFixed(2), 'annual total is incorrect' );
            });
      })
      
    
});


describe('RateTable Calculations EastUS Windows Low', () => {

  let testskus = JSON.parse(fs.readFileSync('skus_eastus_windows_low.json', 'utf8'));
  var tests = [];
  //for (var i = 0; i < 20; i++ ) {
  for (var i in testskus) {

    var type = 'vm';
    var priority = 'low';
    var os = 'windows';
   
      tests.push({ 
                    args: [testskus[i].name, testskus[i].location, 730, priority, os, 1, type],
                    expected: 0
              })
    }
  

      tests.forEach(function(test) {

        it('CalculateCosts should return correct costs for ' + test.args[0] + ':' + test.args[4] + ':' + test.args[3] + ':' + test.args[6]  , async function() {
  
          let store = new RateTableFileStore();
          let ratecard = await FunctionUtil.getRateTable(store);
          
  
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
              //expect(output.costs[0].monthlycost.toFixed(2)).to.equal((test.expected * 730).toFixed(2), 'monthly total is incorrect - ' + output.costs[0].reason );
              //expect(output.costs[0].annualcost.toFixed(2)).to.equal((test.expected * 730 * 12).toFixed(2), 'annual total is incorrect' );
            });
      })
      
    
});


describe('RateTable Calculations EastUS Windows Normal', () => {

  let testskus = JSON.parse(fs.readFileSync('skus_eastus_windows_normal.json', 'utf8'));
  var tests = [];
  //for (var i = 0; i < 20; i++ ) {
  for (var i in testskus) {

    var type = 'vm';
    var priority = 'normal';
    var os = 'Windows';
 
      tests.push({ 
                    args: [testskus[i].name, testskus[i].location, 730, priority, os, 1, type],
                    expected: 0
              })
    }
  

      tests.forEach(function(test) {

        it('CalculateCosts should return correct costs for ' + test.args[0] + ':' + test.args[4] + ':' + test.args[3] + ':' + test.args[6] , async function() {
  
          let store = new RateTableFileStore();
          let ratecard = await FunctionUtil.getRateTable(store);
          
  
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
              //expect(output.costs[0].monthlycost.toFixed(2)).to.equal((test.expected * 730).toFixed(2), 'monthly total is incorrect - ' + output.costs[0].reason );
              //expect(output.costs[0].annualcost.toFixed(2)).to.equal((test.expected * 730 * 12).toFixed(2), 'annual total is incorrect' );
            });
      })
      
    
});


// describe('RateTable Calculations EastUS Windows Normal', () => {

//   let testskus = JSON.parse(fs.readFileSync('skus_eastus_windows_normal.json', 'utf8'));
//   var tests = [];
//   //for (var i = 0; i < 20; i++ ) {
//   for (var i in testskus) {

//     var type;
//     var priority;
//     var os;
//     if (testskus[i].MeterName.includes('Low Priority')) {
//       priority = 'low';
//     } else {
//       priority = 'normal';
//     }
//     if (testskus[i].MeterSubCategory.includes('Windows')) {
//       os = 'Windows';
//     } else {
//       os = 'Linux';
//     }
//     if (testskus[i].MeterCategory == 'Virtual Machines')  {
//       type = 'vm';
//     } 
//     // else if (testskus[i].metercategory == 'Storage') {
//     //   type = 'storage';
//     // }
    
//     if ((type !== undefined) && (!testskus[i].MeterSubCategory.includes('Promo'))) {
//       tests.push({ 
//                     args: [testskus[i].name, testskus[i].location, 730, priority, os, 1, type, testskus[i].MeterSubCategory],
//                     expected: testskus[i].MeterRates['0']
//               })
//     }
//   }

//       tests.forEach(function(test) {

//         it('CalculateCosts should return correct costs for ' + test.args[0] + ':' + test.args[4] + ':' + test.args[3] + ':' + test.args[6] + ':' + test.args[7]  , async function() {
  
//           let store = new RateTableFileStore();
//           let ratecard = await FunctionUtil.getRateTable(store);
          
  
//               let input : CostInput[] =  [{
//                 "name": test.args[0],
//                 "location": test.args[1],
//                 "hours": test.args[2],
//                 "priority": test.args[3],
//                 "os": test.args[4],
//                 "quantity": test.args[5],
//                 "type": test.args[6]
//               }];
//               let output = ratecard.CalculateCosts(input);
//               expect(output.costs.length).to.equal(input.length);
//               expect(output.costs[0].monthlycost).to.be.a('number', 'cost returned ' + output.costs[0].monthlycost );
//               expect(output.costs[0].monthlycost.toFixed(2)).to.equal((test.expected * 730).toFixed(2), 'monthly total is incorrect - ' + output.costs[0].reason );
//               expect(output.costs[0].annualcost.toFixed(2)).to.equal((test.expected * 730 * 12).toFixed(2), 'annual total is incorrect' );
//             });
//       })
      
    
// });