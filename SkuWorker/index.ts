import { AzureFunction, Context } from "@azure/functions"

const queueTrigger: AzureFunction = async function (context: Context, sku: any, meters: any, skuDocs: any): Promise<void> {
    context.log('Queue trigger function processed work item', sku);
    // update meterIds
    var meterIds = [];
    for (var i in meters) {
        meterIds.push(meters[i].MeterId);
    }
    if (skuDocs.length == 1) {
        sku.id = skuDocs[0].id;
    } else {
        context.log("More than one sku found in db");
    }
    sku.meterIds = meterIds;
    context.bindings.skusOut = sku;
    context.done();
};

export default queueTrigger;
