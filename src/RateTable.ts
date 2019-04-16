import * as request from "request-promise";
var fs = require('fs');

export class RateTable {

    constructor(jsonStr?: string) {

        if (jsonStr !== undefined) {

            let jsonObj: any = JSON.parse(jsonStr);
            for (let prop in jsonObj) {
                this[prop] = jsonObj[prop];
            }
        }
    }

    public setData(skuapiresponse: Sku[], meterApiResponse: Meter[]) {

        var fs = require('fs');
        this._datacenters = JSON.parse(fs.readFileSync('datacenters.json', 'utf8'));

        // must update meters first
        this._meters =   meterApiResponse;
        this._skus = this.filterSkus(skuapiresponse);
    }

    public saveData(filepath: string) {
        let output = JSON.stringify(this._skus);
        fs.writeFileSync(filepath, 'utf8');
    }

    private filterVms(skus: Sku[]) : Sku[] {

         // send to Queue and then upload to Cosmos
         let vms : Array<any> = skus.filter((x) => { return x.resourceType == 'virtualMachines'});
            
         for (var vm in vms) {
             // set basename
             vms[vm].location = vms[vm].locations[0];
             vms[vm].basename = vms[vm].size.replace("_"," ");
             vms[vm].meterregion = this.lookupmeterregion(vms[vm].location);
             vms[vm].ratecards = this.lookupmeters(vms[vm].basename, vms[vm].meterregion );
         }
         return vms;
    }

    private filterStorage(skus: Sku[]) : Sku[] {
        let disks : Array<any> = skus.filter((x) => { return x.resourceType == 'disks'});
        for (var i in disks) {

            disks[i].location = disks[i].locations[0];
            disks[i].meterregion = this.lookupmeterregion(disks[i].location);
            disks[i].name = disks[i].name + ' ' + disks[i].size;
            disks[i].ratecards = this.lookupmeters(disks[i].size, disks[i].meterregion );

        }
        return disks;
            
    }

    private filterSkus(skus: Sku[]) : Sku[] {
  
        let vms = this.filterVms(skus);
        let storage = this.filterStorage(skus);
        return vms.concat(storage);
      
         
    }

    
    private updateSkus() : Promise<Sku[]> {
        
            
        var options = { method: 'GET',
        url: 'https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/oauth2/token',
        headers: 
        { 
            'Content-Type': 'application/x-www-form-urlencoded' },
        form: 
        { grant_type: 'client_credentials',
            client_id: 'ee682fb4-e490-4553-b28f-a82ee49c0d81',
            resource: 'https://management.azure.com',
            client_secret: ')]]d$|=1g}:[tZ@.$0#_-&^[+:.}}+&r]8-' } 
        };

        return request(options).then( (response) => {
            return JSON.parse(response).access_token;
            console.log(response.body);
        }).then((accesstoken) => {
        
            var options = { method: 'GET',
            url: 'https://management.azure.com/subscriptions/8e95e0bb-d7cc-4454-9443-75ca862d34c1/providers/Microsoft.Compute/skus',
            qs: 
            {   
                'api-version': '2017-09-01',
            },
            headers: 
            { 
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + accesstoken 
                } 
            };

            return request(options);

        }).then((response) => {
            return this.filterSkus(response);
        }).catch((error) => {
            if (error) throw new Error(error);
        });

    }

    private updateMeters(): Promise<Meter[]> {

        
        var options = { method: 'GET',
        url: 'https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/oauth2/token',
        headers: 
        { 
            'Content-Type': 'application/x-www-form-urlencoded' },
        form: 
        { grant_type: 'client_credentials',
            client_id: 'ee682fb4-e490-4553-b28f-a82ee49c0d81',
            resource: 'https://management.azure.com',
            client_secret: ')]]d$|=1g}:[tZ@.$0#_-&^[+:.}}+&r]8-' } 
        };

        return request(options).then( (response) => {
            return JSON.parse(response).access_token;
            console.log(response.body);
        }).then((accesstoken) => {
                    //$filter=OfferDurableId eq 'MS-AZR-0121p' and Currency eq 'USD' and Locale eq 'en-US' and RegionInfo eq 'US'");

            var options = { method: 'GET',
            url: 'https://management.azure.com/subscriptions/8e95e0bb-d7cc-4454-9443-75ca862d34c1/providers/Microsoft.Commerce/RateCard',
            qs: 
            { 'api-version': '2016-08-31-preview',
                //'$filter': 'OfferDurableId%20eq%20%27MS-AZR-0121p%27%20and%20Currency%20eq%20%27USD%27%20and%20Locale%20eq%20%27en-US%27%20and%20RegionInfo%20eq%20%27US%27',
                '$filter': "OfferDurableId eq 'MS-AZR-0121p' and Currency eq 'USD' and Locale eq 'en-US' and RegionInfo eq 'US'"
            
            },
            headers: 
            { 
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + accesstoken 
                } 
            };

            return request(options);

        }).then((response) => {
            return JSON.parse(response);
        }).then((ratecard) => {
            let meters = ratecard.Meters;

            return meters;
        }).catch((error) => {
            if (error) throw new Error(error);
        });


     
    }

    public findSku(skuname: string, location: string): Sku[] {
        let skus : Array<any> = this._skus.filter((x) => { return ((x.location == location) && ((x.name.includes(skuname) || (x.size.includes(skuname)))))});
        return skus;
    }

    public async refresh() {

        var fs = require('fs');
        this._datacenters = JSON.parse(fs.readFileSync('datacenters.json', 'utf8'));

        
        this._meters = await this.updateMeters();
        this._skus = await this.updateSkus();


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
        if (ratecards.length >= 1) {
            if (input.type == 'vm') {
                if (input.os == 'Windows') {
                    ratecards = ratecards.filter((x) => { return x.MeterSubCategory.includes("Windows") });
                } else {
                    ratecards = ratecards.filter((x) => { return !x.MeterSubCategory.includes("Windows") });
                }
                if (input.priority == 'low') {
                    // check MeterName for 'Low Priority'
                    ratecards = ratecards.filter((x) => { return x.MeterName.includes("Low Priority") });
                }  else {
                    ratecards = ratecards.filter((x) => { return !x.MeterName.includes("Low Priority") });
                }
                if (ratecards.length == 1) {
                    output =  ratecards[0].MeterRates["0"];
                } else{
                    output = 'Indeterminate RateCards - ';
                    for (var i in ratecards) {
                        output += ratecards[i].MeterName + '; ';
                    }
                }

            } else if (input.type == 'storage') {
                ratecards = ratecards.filter((x) => { return x.MeterSubCategory.includes("Managed Disks") });
                if (ratecards.length == 1) {
                    output =  ratecards[0].MeterRates["0"];
                } else{
                    output = 'Indeterminate RateCards - ';
                    for (var i in ratecards) {
                        output += ratecards[i].MeterName + '; ';
                    }
                }
            }
        } else {
            output = 'Unknown'
        }
        return output;
    }

    private lookupmeters(basename : string, meterregion : string ) : Meter[] {
        let meters : Array<any> = this._meters.filter((x) => { return ((x.MeterRegion == meterregion) && (x.MeterName.includes(basename) && ((x.MeterCategory == 'Virtual Machines') || (x.MeterCategory == 'Storage'))))});
        return meters;
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
}

export interface Meter {
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