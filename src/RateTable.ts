import * as request from "request-promise";
import * as fs from 'fs';
import { VMSku } from "../src/VMSku";
import { StorageSku } from "../src/StorageSku";

export class RateTable {

    constructor(jsonObj?: any) {
        if (jsonObj !== undefined) {
            if (typeof(jsonObj) == 'string') {
                jsonObj = JSON.parse(jsonObj);
                for (let prop in jsonObj) {
                    this[prop] = jsonObj[prop];
                }
            } else if (typeof(jsonObj) == 'object') {
                for (let prop in jsonObj) {
                    this[prop] = jsonObj[prop];
                }
            }
        }
    }

    public setData(skuapiresponse: Sku[], meterApiResponse: Meter[]) {

   
        this._datacenters = JSON.parse(fs.readFileSync('datacenters.json', 'utf8'));

        // must update meters first
     
        this._skus = this.filterSkus(skuapiresponse, meterApiResponse);
        this._meters = meterApiResponse;
    }

    public saveData(filepath: string) {
        let output = JSON.stringify(this._skus);
        fs.writeFileSync(filepath, 'utf8');
    }

    private filterVms(skus: Sku[], meters: Meter[]) : Sku[] {

        // send to Queue and then upload to Cosmos
        let vms : Array<any> = skus.filter((x) => { return x.resourceType == 'virtualMachines'});
        let cleanVMs : Sku[] = [];

        for (var i in vms) {
            let basename = vms[i].size.replace("_"," ");
            let location = vms[i].locations[0];
            let meterregion = this.lookupmeterregion(location);
            let vm : Sku = {
                "basename": basename,
                "id": vms[i].id,
                "location": location,
                "name": vms[i].name,
                "ratecards": this.lookupmeters(basename, meterregion, meters ),
                "meterregion": meterregion,
                "resourceType": vms[i].resourceType,
                "size": vms[i].size

            }
            cleanVMs.push(vm);
        }
        return cleanVMs;
    }

    private filterStorage(skus: Sku[], meters: Meter[]) : Sku[] {
        let disks : Array<any> = skus.filter((x) => { return x.resourceType == 'disks'});
        let cleanDisks : Sku[] = [];
        for (var i in disks) {
            let location = disks[i].locations[0];
            let meterregion = this.lookupmeterregion(location);
            let size = disks[i].size;
            let disk : Sku = {
                "basename": null,
                "id": null,
                "location": location,
                "name": disks[i].name + ' ' + disks[i].size,
                "ratecards": this.lookupmeters(size, meterregion, meters),
                "meterregion": meterregion,
                "resourceType": disks[i].resourceType,
                "size": size
            }
           cleanDisks.push(disk);

        }
        return cleanDisks;
            
    }

    private filterSkus(skus: Sku[], meters: Meter[]) : Sku[] {
  
        let vms = this.filterVms(skus, meters);
        let storage = this.filterStorage(skus, meters);
        return vms.concat(storage);
      
         
    }


    public findSku(location: string, skuname?: string): Sku[] {
        var skus: Array<any>;

        if (skuname === undefined) {
            skus = this._skus.filter((x) => { return ((x.location == location) )});

        } else {
            // eliminate '-#' from name
            skus = this._skus.filter((x) => { return ((x.location == location) && ((x.name == skuname) || (x.size.includes(skuname))))});
        }
        return skus;
    }



    public static getRateNames(sku: Sku) : string[]
{
    let output = [];
    for (var i in sku.ratecards)
    {
        output.push(sku.ratecards[i].MeterName)
    }
    return output;
}
    public static pickRate(sku: Sku, input: CostInput) : string {
        var ratecards = sku.ratecards;
        var output;
        var isWindows = ((input.os == 'Windows') || (input.os == 'windows'));
        var isLowPriority = ((input.priority == 'low') || (input.priority == 'Low'));
        if (ratecards.length >= 1) {
            if (input.type == 'vm') {
                if (isWindows) {
                    ratecards = ratecards.filter((x) => { return x.MeterSubCategory.includes("Windows") });
                } else {
                    ratecards = ratecards.filter((x) => { return !x.MeterSubCategory.includes("Windows") });
                }
                if (isLowPriority) {
                    // check MeterName for 'Low Priority'
                    ratecards = ratecards.filter((x) => { return x.MeterName.includes("Low Priority") });
                }  else {
                    ratecards = ratecards.filter((x) => { return !x.MeterName.includes("Low Priority") });
                }
                if (ratecards.length == 1) {
                    output =  ratecards[0].MeterRates["0"];
                } else if (ratecards.length >= 1) {
                    output = 'Indeterminate RateCards - ';
                    for (var i in ratecards) {
                        output += ratecards[i].MeterName + '; ';
                    }
                } else {
                    output = 'No rate cards found - are you sure this sku combination is valid?';
                }

            } else if (input.type == 'storage') {
                ratecards = ratecards.filter((x) => { return x.MeterSubCategory.includes("Managed Disks") });
                if (ratecards.length == 1) {
                    output =  ratecards[0].MeterRates["0"];
                } else if (ratecards.length >= 1) {
                    output = 'Indeterminate RateCards - ';
                    for (var i in ratecards) {
                        output += ratecards[i].MeterName + '; ';
                    }
                } else {
                    output = 'No rate cards found - are you sure this storage sku combination is valid?';
                }
            } else {
                output = 'No type provided';
            }
        } else {
            output = 'Unknown'
        }
        return output;
    }

    public CalculateCosts(inputarray: CostInput[]): CostResults {

        let totalcost = 0;
        let output: CostOutput[] = [];
        for (var i in inputarray)
        {
            var outputsku: CostOutput = <CostOutput> inputarray[i];
            var sku = this.findSku(inputarray[i].location , inputarray[i].name);
            if (sku.length >= 1) {
                // determine correct cards
                if (sku.length > 1) {
                  
                    // throw out Promo
                    sku = sku.filter((x) => { return (!x.name.includes('Promo')) })
                }

                if (sku.length > 1) {
                    outputsku.reason = 'Multiple skus found';
                 
                } else {

                    let rate = RateTable.pickRate(sku[0], inputarray[i]);
                    var costval = Number.parseFloat(rate);
                    if (!Number.isNaN(costval)) {
                        switch(inputarray[i].type) {
                            case "vm":
                                outputsku.monthlycost = VMSku.CalculateCost(costval, inputarray[i].quantity)
                            break;
                            case "storage":
                                outputsku.monthlycost = StorageSku.CalculateCost(costval, inputarray[i].quantity);
                            break;
                            default:
                                outputsku.monthlycost = NaN;
                        } 
                        outputsku.annualcost = outputsku.monthlycost * 12;
                        totalcost += outputsku.monthlycost;
                        outputsku.otherrates = RateTable.getRateNames(sku[0]);
                    
                    } else {
                        outputsku.reason = rate; // Rate is an error message
                    }
                }
            } else {
                outputsku.reason = 'No Skus found';
            }
            output.push(outputsku);
        }
    
        return { costs: output, monthlytotal: totalcost.toFixed(2), annualtotal: (totalcost * 12).toFixed(2) }

    }

    private groupby(xs) {
        return xs.reduce(function(rv, x) {
            var key = x.MeterName + '-' + x.MeterSubCategory;
          (rv[key] = rv[key] || []).push(x);
          return rv;
        }, {});
      };

    private lookupmeters(basename : string, meterregion : string, meters : Meter[] ) : Meter[] {
        var output = [];
        var metersout: Array<any> ;
        // need to watch out for v2 if it isn't in the basename

        var dashnum_regexp = new RegExp("-[1-9][1-9]?[a-z]? \\b", "i");
        //console.log(basename)
        basename = basename.replace(dashnum_regexp, " ");
        var basenameregexp = new RegExp(basename + "\\b", "g");
        //console.log(basename)
        if (!basename.includes('v2')) {
            // filter out v2
            metersout = meters.filter((x) => { return ((x.MeterStatus == 'Active') 
            && (x.MeterRegion == meterregion) 
            && (!x.MeterName.includes('Expired'))
            && ((basenameregexp.test(x.MeterName))  && (!x.MeterName.includes('v2')))
            && ((x.MeterCategory == 'Virtual Machines') || (x.MeterCategory == 'Storage')))});
        } else {

            metersout  = meters.filter((x) => { return ((x.MeterStatus == 'Active') 
                                                    && (x.MeterRegion == meterregion) 
                                                    && (!x.MeterName.includes('Expired'))
                                                    && (basenameregexp.test(x.MeterName)) 
                                                    && ((x.MeterCategory == 'Virtual Machines') || (x.MeterCategory == 'Storage')))});
        }
        // for each name+subcategory, take the first one
        var metergroups = this.groupby(metersout);
        Object.keys(metergroups).forEach(function (key) {
            var thisgroup = metergroups[key];
             // do something with key or value
             if (thisgroup.length > 1) {
                // sort by EffectiveDate and take first
             
                thisgroup.sort(function(a, b) {
                    a = new Date(a.dateModified);
                    b = new Date(b.dateModified);
                    return a>b ? -1 : a<b ? 1 : 0;
                });
                output.push(thisgroup[0])
            } else {
                output.push(thisgroup[0]);
            }
          });

        return output;
    }

    private lookupmeterregion(location) : string {

  
        let regions : Array<any> = this._datacenters.filter((x) => { return x.location.toLowerCase() == location.toLowerCase() });
    
        
        var region = (regions.length >= 1) ? regions[0].MeterRegion : '';
        if (region == '')
            console.log('No Region for ' + location);
        return region;
    }
    
    private _datacenters: any[];
    private _skus: Sku[];
    private _meters: Meter[];
}

export interface Sku {
    id: string;
    name: string;
    location: string;
    basename: string;
    ratecards: Meter[];
    resourceType: string;
    size: string;
    meterregion: string;
}

export interface Meter {
    MeterStatus: string;
    id: string;
    MeterId: string;
    MeterRegion: string;
    MeterName: string;
    MeterCategory: string;
    MeterSubCategory: string;
    MeterRates: {};
}

export interface CostInput
{
    name: string;
    location: string;
    hours: number;
    priority: string;
    os: string;
    quantity: number;
    type: string;
}

export interface CostOutput
{
    name: string;
    location: string;
    hours: number;
    priority: string;
    os: string;
    quantity: number;
    monthlycost: number;
    annualcost: number;
    otherrates: string[];
    type: string;
    reason: string;
}

export interface CostResults
{
    costs: CostOutput[];
    monthlytotal: string;
    annualtotal: string;
}