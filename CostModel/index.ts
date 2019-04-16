import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { RateTable, Sku, Meter } from "../src/RateTable";
import { RateTableFileStore } from "../src/RateTableFileStore";
import { FunctionUtil } from "../src/FunctionUtil";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    let store = new RateTableFileStore();
    let ratecard = await FunctionUtil.getRateTable(store);

    var input = req.body;
    let output = [];
    let totalcost : number = 0.0;
    // input can be a single object or an array
    if (!Array.isArray(input) && typeof(input == 'object')) {
        input = [input];
    }
    for (var i in input)
    {
        var outputsku = input[i]
        var sku = ratecard.findSku(input[i].name, input[i].location );
        if (sku.length >= 1) {
            // determine correct cards

            let rate = RateTable.pickRate(sku[0], input[i]);

            if (rate != 'Unknown') {
               
                var costval = Number.parseFloat(rate);
                outputsku.monthlycost = costval * input[i].quantity * 730;
                outputsku.annualcost = costval * input[i].quantity * 730 * 12;
                totalcost += outputsku.monthlycost;
                outputsku.otherrates = RateTable.getRateNames(sku[0]);
            } else {
                outputsku.monthlycost = 'Unknown';
            }
        } else {
            outputsku.monthlycost = 'Unknown';
        }
        output.push(outputsku);
    }
    output.push({ "total_monthly_cost": totalcost.toFixed(2), "total_annual_cost": (totalcost * 12).toFixed(2)})
    context.res = {
        body: output
    }
   
};





export default httpTrigger;
