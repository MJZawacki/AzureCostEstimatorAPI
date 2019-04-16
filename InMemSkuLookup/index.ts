import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { RateTable } from "../src/RateTable";

let ratecard = new RateTable();

ratecard.refresh();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let skuname = context.bindingData.skuname;
    let location = context.bindingData.location;

    let sku = ratecard.findSku(skuname, location);
   
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: sku
    };
    
};

export default httpTrigger;
