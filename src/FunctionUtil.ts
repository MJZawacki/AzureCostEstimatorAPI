import { RateTableFileStore } from './RateTableFileStore'
import { RateTable } from './RateTable'
import { AzRestAPI } from './AzRestAPI'

export class FunctionUtil {

    static async getRateTable(store: RateTableFileStore) : Promise<RateTable> {

        
        var rates = store.getRateTable()
        if (rates == null) {
            // refresh from web api
            let skus =  await AzRestAPI.downloadSkus();
            let meters = await AzRestAPI.downloadMeters();
            rates = new RateTable();
            rates.setData(skus, meters);
            store.saveRateTable(rates);
        }
        return rates;
    }

}