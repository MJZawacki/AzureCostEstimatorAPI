import * as request from "request-promise";
import { Sku, Meter } from "./RateTable";
import config = require("config");
export class AzRestAPI {

    private static client_id = config.get('client_id') as string; 
    private static client_secret = config.get('client_secret') as string;
    private static client_tenant = config.get('client_tenant') as string;
    private static client_subscription = config.get('client_subscription') as string;

    static downloadSkus() : Promise<Sku[]> {
        
            
        var options = { method: 'GET',
        url: 'https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/oauth2/token',
        headers: 
        { 
            'Content-Type': 'application/x-www-form-urlencoded' },
        form: 
        { grant_type: 'client_credentials',
            client_id: this.client_id,
            resource: 'https://management.azure.com',
            client_secret: this.client_secret } 
        };

        return request(options).then( (response) => {
            return JSON.parse(response).access_token;
            console.log(response.body);
        }).then((accesstoken) => {
        
            var options = { method: 'GET',
            url: 'https://management.azure.com/subscriptions/8e95e0bb-d7cc-4454-9443-75ca862d34c1/providers/Microsoft.Compute/skus',
            qs: 
            {   
                'api-version': '2017-09-01',
            },
            headers: 
            { 
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + accesstoken 
                } 
            };

            return request(options);

        }).then((response) => {
            let skuresponse =  JSON.parse(response);
            return skuresponse.value;
        }).catch((error) => {
            if (error) throw new Error(error);
        });

    }

    static downloadMeters(offer: string): Promise<Meter[]> {

        
        var options = { method: 'GET',
        url: 'https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/oauth2/token',
        headers: 
        { 
            'Content-Type': 'application/x-www-form-urlencoded' },
        form: 
        { grant_type: 'client_credentials',
            client_id: this.client_id,
            resource: 'https://management.azure.com',
            client_secret: this.client_secret } 
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
                '$filter': `OfferDurableId eq '${offer}' and Currency eq 'USD' and Locale eq 'en-US' and RegionInfo eq 'US'`
            
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

            return meters;
        }).catch((error) => {
            if (error) throw new Error(error);
        });


     
    }

}
