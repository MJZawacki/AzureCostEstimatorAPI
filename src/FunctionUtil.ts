
import { RateTable } from './RateTable'
import { AzRestAPI } from './AzRestAPI'
import { IRateTableStore } from './IRateTableStore';

export class FunctionUtil {


    static async getRateTable(id: string, store: IRateTableStore) : Promise<RateTable> {

        
        var rates = await store.getRateTable(id)
        if (rates == null) {
            // refresh from web api
            let skus =  await AzRestAPI.downloadSkus();
            let meters = await AzRestAPI.downloadMeters(id);
            rates = new RateTable();
            rates.setData(skus, meters);
            store.saveRateTable(id, rates);
        }
        return rates;
    }

}