import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { RateTable } from "../src/RateTable";
import { RateTableFileStore } from "../src/RateTableFileStore"
import { FunctionUtil } from "../src/FunctionUtil"



const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let store = new RateTableFileStore();
    let ratecard = await FunctionUtil.getRateTable(store);

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
