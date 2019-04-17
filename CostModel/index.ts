import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { RateTable, Sku, Meter, CostInput, CostOutput } from "../src/RateTable";
import { RateTableFileStore } from "../src/RateTableFileStore";
import { FunctionUtil } from "../src/FunctionUtil";
import { VMSku } from "../src/VMSku";
import { StorageSku } from "../src/StorageSku";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let store = new RateTableFileStore();
    let ratecard = await FunctionUtil.getRateTable(store);

    var input = req.body;
    var inputarray: CostInput[] = [];
   
    let totalcost : number = 0.0;
    // input can be a single object or an array
    if (Array.isArray(input)) {
        inputarray = input;
    } else if (typeof(input) == 'object') {
        inputarray.push(input);
    }

    let output = ratecard.CalculateCosts(inputarray);
   
    context.res = {
        body: output
    }
   
};





export default httpTrigger;
