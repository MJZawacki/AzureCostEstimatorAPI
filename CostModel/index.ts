import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { RateTable, Sku, Meter, CostInput, CostOutput } from "../src/RateTable";
import { RateTableBlobStore } from "../src/RateTableBlobStore";
import { FunctionUtil } from "../src/FunctionUtil";
import { VMSku } from "../src/VMSku";
import { StorageSku } from "../src/StorageSku";
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

    var input = req.body;
    var inputarray: CostInput[] = [];
   
    let totalcost : number = 0.0;
    // input can be a single object or an array
    if (Array.isArray(input)) {
        inputarray = input;
    } else if (typeof(input) == 'object') {
        inputarray.push(input);
    }

    let output = ratecard[offercode].CalculateCosts(inputarray);
   
    context.res = {
        body: output
    }
   
};





export default httpTrigger;
