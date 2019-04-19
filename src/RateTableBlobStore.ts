import { RateTable } from "./RateTable";
import * as Azure from "@azure/storage-blob";
import * as fs from 'fs';

import * as config from "config";
import { SharedKeyCredential } from "@azure/storage-blob";

let filecache = config.get('filecache') as string; 
let account = config.get('storageaccount') as string;
let accountKey = config.get('storageaccountkey') as string;

const sharedKeyCredential = new SharedKeyCredential(account, accountKey)
const pipeline = Azure.StorageURL.newPipeline(sharedKeyCredential);

 const serviceURL = new Azure.ServiceURL(
    // When using AnonymousCredential, following url should include a valid SAS or support public access
    `https://${account}.blob.core.windows.net`,
    pipeline
  );

  const blobName = "lookuptables.json";

export class RateTableFileStore {

    public async saveRateTable(id : string, rates : RateTable) {
        this._ratetable = rates;
        // save to file
        let ratestring = JSON.stringify(rates);

        // does file exist?

        // does container exist?
        let containerUrl = await this.createContainer(id);
        this.uploadBlobFromText(ratestring,containerUrl);
       
    }

    public async getRateTable(id : string) : Promise<RateTable> {
        if (this._ratetable == null) {
            // load from file
            if (fs.existsSync(filecache)) {
                this._ratetable = new RateTable(fs.readFileSync(filecache, 'utf8'));
            } else {
                return null;
            }
        }
        return this._ratetable;
    }


    private async createContainer(name: string) {
        // Create a container
        const containerName = `${name}`;
        const containerURL = Azure.ContainerURL.fromServiceURL(serviceURL, containerName);
        const createContainerResponse = await containerURL.create(Azure.Aborter.none);
        console.log(
            `Create container ${containerName} successfully`,
            createContainerResponse.requestId
        );
        return containerURL;
    }

    private async getTextFromBlob(id: string) {
        blobURL = BlobURL.fromContainerURL(containerURL, blobName);
        blockBlobURL = BlockBlobURL.fromBlobURL(blobURL);
        await blockBlobURL.upload(Aborter.none, content, content.length);
    }
    private async uploadBlobFromText(text: string, containerUrl: Azure.ContainerURL) {
        // Create a blob
        
        const blobURL = Azure.BlobURL.fromContainerURL(containerUrl, blobName);
        const blockBlobURL = Azure.BlockBlobURL.fromBlobURL(blobURL);
        // TODO UTF8 option?
        const uploadBlobResponse = await blockBlobURL.upload(
            Azure.Aborter.none,
            text,
            text.length
        );
        console.log(
            `Upload lookup table blob ${blobName} successfully`,
            uploadBlobResponse.requestId
        );
    }

    private _ratetable : RateTable
}