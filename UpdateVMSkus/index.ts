import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as request from "request-promise";

var fs = require('fs');
var datacenters = JSON.parse(fs.readFileSync('datacenters.json', 'utf8'));

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    

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
            vms[vm].meterregion = lookupmeterregion(vms[vm].location);
        }
        context.bindings.skuqueue = vms;
    
        
        return context.res = {
            body: skus
        }
    }).catch((error) => {
        if (error) throw new Error(error);
    });



};

var lookupmeterregion = function(location) {

  
    let regions : Array<any> = datacenters.filter((x) => { return x.location == location});

    
    var region = (regions.length >= 1) ? regions[0].MeterRegion : '';
    if (region == '')
        console.log('No Region for ' + location);
    return region;
}

export default httpTrigger;
