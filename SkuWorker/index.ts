import { AzureFunction, Context } from "@azure/functions"

const queueTrigger: AzureFunction = async function (context: Context, sku: any, meters: any, skusOut: any): Promise<void> {
    context.log('Queue trigger function processed work item', sku);
    // update 
    var meterIds = [];
    for (var i in meters) {
        meterIds.push(meters[i].MeterId);
    }
    sku.location = sku.locations[0];
    sku.meterIds = meterIds;
    context.bindings.skusOut = sku;
    context.done();
};

export default queueTrigger;
