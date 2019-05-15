import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { RateTable } from "../src/RateTable";
import { RateTableBlobStore } from "../src/RateTableBlobStore"
import { FunctionUtil } from "../src/FunctionUtil"
import * as config from "config";

var ratecard : any = {};
let defaultoffer = config.get('defaultoffer') as string;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let store = new RateTableBlobStore();
    var offercode;
    if (req.query.offercode || (req.body && req.body.offercode)) {
        offercode = (req.query.offercode || req.body.offercode)
    } else {
        offercode = defaultoffer; // default PAYG sku
    }
    if (ratecard[offercode] === undefined) {
        ratecard[offercode] = await FunctionUtil.getRateTable(offercode, store);
    }
    
    let skuname = context.bindingData.skuname;
    let location = context.bindingData.location;
    var sku;
    if (location !== undefined) {
        sku = ratecard[offercode].findSku(location, skuname);
    }
   
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: sku
    };
    
};

export default httpTrigger;
