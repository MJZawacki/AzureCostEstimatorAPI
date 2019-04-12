import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as request from "request-promise";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');




    var options = { method: 'GET',
        url: 'https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/oauth2/token',
        headers: 
        { 
            'Content-Type': 'application/x-www-form-urlencoded' },
        form: 
        { grant_type: 'client_credentials',
            client_id: 'ee682fb4-e490-4553-b28f-a82ee49c0d81',
            resource: 'https://management.azure.com',
            client_secret: ')]]d$|=1g}:[tZ@.$0#_-&^[+:.}}+&r]8-' } 
    };

    return request(options).then( (response) => {
        return JSON.parse(response).access_token;
        console.log(response.body);
    }).then((accesstoken) => {
                //$filter=OfferDurableId eq 'MS-AZR-0121p' and Currency eq 'USD' and Locale eq 'en-US' and RegionInfo eq 'US'");

        var options = { method: 'GET',
        url: 'https://management.azure.com/subscriptions/8e95e0bb-d7cc-4454-9443-75ca862d34c1/providers/Microsoft.Commerce/RateCard',
        qs: 
        { 'api-version': '2016-08-31-preview',
            //'$filter': 'OfferDurableId%20eq%20%27MS-AZR-0121p%27%20and%20Currency%20eq%20%27USD%27%20and%20Locale%20eq%20%27en-US%27%20and%20RegionInfo%20eq%20%27US%27',
            '$filter': "OfferDurableId eq 'MS-AZR-0121p' and Currency eq 'USD' and Locale eq 'en-US' and RegionInfo eq 'US'"
           
          },
        headers: 
        { 
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accesstoken 
            } 
        };

        return request(options);

    }).then((response) => {
        return JSON.parse(response);
    }).then((ratecard) => {
        let meters = ratecard.Meters;

        // send to Queue and then upload to Cosmos
        context.bindings.meterqueue = meters;
    
        
        return context.res = {
            body: "Meters Updated"
        }
    }).catch((error) => {
        if (error) throw new Error(error);
    });



};

export default httpTrigger;
