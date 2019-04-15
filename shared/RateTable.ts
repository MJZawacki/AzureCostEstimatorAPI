import * as request from "request-promise";

export class RateTable {

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
            return JSON.parse(response);
        }).then((skus) => {
            // send to Queue and then upload to Cosmos
            let vms : Array<any> = skus.value.filter((x) => { return x.resourceType == 'virtualMachines'});
            
            for (var vm in vms) {
                // set basename
                vms[vm].location = vms[vm].locations[0];
                vms[vm].basename = vms[vm].size.replace("_"," ");
                vms[vm].meterregion = this.lookupmeterregion(vms[vm].location);
                vms[vm].ratecards = this.lookupmeters(vms[vm].basename, vms[vm].meterregion );
            }
            
            
            return vms;

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
        let skus : Array<any> = this._skus.filter((x) => { return ((x.location == location) && (x.name == skuname))});
        return skus;
    }

    public async refresh() {

        var fs = require('fs');
        this._datacenters = JSON.parse(fs.readFileSync('datacenters.json', 'utf8'));

        
        this._meters = await this.updateMeters();
        this._skus = await this.updateSkus();


    }

    private lookupmeters(basename : string, meterregion : string ) : Meter[] {
        let meters : Array<any> = this._meters.filter((x) => { return ((x.MeterRegion == meterregion) && (x.MeterName.includes(basename)))});
        return meters;
    }

    private lookupmeterregion(location) : string {

  
        let regions : Array<any> = this._datacenters.filter((x) => { return x.location == location});
    
        
        var region = (regions.length >= 1) ? regions[0].MeterRegion : '';
        if (region == '')
            console.log('No Region for ' + location);
        return region;
    }
    
    private _datacenters: any[];
    private _skus: Sku[];
    private _meters: Meter[];
}

interface Sku {
    id: string;
    name: string;
    ratecards: string[];
    location;
    basename;
}

interface Meter {
    id: string;
    MeterId: string;
    MeterRegion: string;
    MeterName: string;
}