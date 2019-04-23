import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { RateTable, Sku, Meter, CostInput, CostOutput } from "../src/RateTable";
import { RateTableBlobStore } from "../src/RateTableBlobStore";
import { FunctionUtil } from "../src/FunctionUtil";
import { VMSku } from "../src/VMSku";
import { StorageSku } from "../src/StorageSku";

var ratecard = {};

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

    var input = req.body;
    var inputarray: CostInput[] = [];
   
    let totalcost : number = 0.0;
    // input can be a single object or an array
    if (Array.isArray(input)) {
        inputarray = input;
    } else if (typeof(input) == 'object') {
        inputarray.push(input);
    }

    let output = ratecard[offercard].CalculateCosts(inputarray);
   
    context.res = {
        body: output
    }
   
};





export default httpTrigger;
