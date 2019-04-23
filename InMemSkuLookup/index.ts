import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { RateTable } from "../src/RateTable";
import { RateTableBlobStore } from "../src/RateTableBlobStore"
import { FunctionUtil } from "../src/FunctionUtil"

var ratecard;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let store = new RateTableBlobStore();
    var offercard;
    if (req.query.offercard || (req.body && req.body.offercard)) {
        offercard = (req.query.offercard || req.body.offercard)
    } else {
        offercard = 'MS-AZR-0121p'; // default PAYG sku
    }
    if (ratecard[offercard] === undefined) {
        ratecard[offercard] = await FunctionUtil.getRateTable(offercard, store);
    }
    
    let skuname = context.bindingData.skuname;
    let location = context.bindingData.location;
    var sku;
    if (location !== undefined) {
        sku = ratecard.findSku(location, skuname);
    }
   
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: sku
    };
    
};

export default httpTrigger;
