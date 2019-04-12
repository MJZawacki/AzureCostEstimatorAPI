import { AzureFunction, Context } from "@azure/functions"

const queueTrigger: AzureFunction = async function (context: Context, metercard: string): Promise<void> {
    context.log('Queue trigger function processed work item', metercard);
    context.bindings.metersOut = metercard;
    context.done();
};

export default queueTrigger;
