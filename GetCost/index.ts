import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient, FeedOptions } from "@azure/cosmos";
import * as config from "config";

let endpoint = config.get('endpoint') as string; 
let primaryKey = config.get('primaryKey') as string;
let databaseId = config.get('databaseId') as string;
let containerId = config.get('ratecontainer') as string;

const client = new CosmosClient({ endpoint: endpoint as string, auth: { masterKey: primaryKey } });
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, documents: any): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let skuname = context.bindingData.skuname;
    let location = context.bindingData.location;

    var sku : any = {};
    // check meterIds and populate
    if (documents.length >= 1) {
        sku = documents[0]
        if (sku.meterIds.length >= 1) {
            // lookup meters
            return findMeters(sku.meterIds).then(function(meters) {
                sku.ratecards = meters.result;
                context.res = {
                    body: sku
                }
            }).catch((error) => {
                context.log(error);
            });
        }
        else 
        {
            sku.ratecards = [];
        }
    }
    else 
    {
        sku = {};
    }
    context.res = {
            // status: 200, /* Defaults to 200 */
            body: sku
        };

};

var findMeters = async function(meters: [any]) {


    // SELECT * FROM c WHERE c.MeterId IN("ccebde6c-ccc9-43be-a10c-3f356e625b99", "4cd40933-1f64-47e2-b3d9-9534ef57e7f4")
    var meterlist : string = '';
    for (var i in meters) {
        meterlist += '"' + meters[i] + '"' + ','
    }
    meterlist = meterlist.substring(0, meterlist.length - 1)
    const querySpec = {
        query: "SELECT * FROM c WHERE c.MeterId IN (" + meterlist + ")",
        // parameters: [
        //     {
        //         name: "@meters",
        //         value: meterlist
        //     }
        // ]
    };
    const feedOptions: FeedOptions = {
        "enableCrossPartitionQuery": true
    }
    
    return client.database(databaseId).container(containerId).items.query(querySpec, feedOptions).toArray();
    // for (var queryResult of results) {
    //     let resultString = JSON.stringify(queryResult);
    //     console.log(`\tQuery returned ${resultString}\n`);
    // }
}

export default httpTrigger;
