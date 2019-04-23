import { RateTable } from "./RateTable";
import * as Azure from "@azure/storage-blob";

import * as config from "config";
import { SharedKeyCredential } from "@azure/storage-blob";
import { IRateTableStore } from "./IRateTableStore";

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

export class RateTableBlobStore implements IRateTableStore {

    public async saveRateTable(id : string, rates : RateTable) : Promise<string> {
        id = id.toLowerCase();
        this._ratetable = rates;
        // save to file
        let ratestring = JSON.stringify(rates);

        

        // does container exist?
        let containerUrl = await this.createContainer(id);
        return this.uploadBlobFromText(ratestring,containerUrl);
       
    }

    public async getRateTable(id : string) : Promise<RateTable> {
        id = id.toLowerCase();
        if (this._ratetable == null) {
            // load from file
            // does file exist?
            var result;
            if (await this.getContainer(id) !== null) {
                if (await this.getResourceBlob(id) !== null) {
                    let ratestr = await this.getTextFromBlob(id);
                    this._ratetable = new RateTable(ratestr);
                    result = this._ratetable;
                } 
                else {
                    result = null;
                }
            }
            else {
                result = null;;
            }
        }
        return result;
    }


    private async getContainer(name: string) : Promise<string> {
        const containerName = `${name}`;
        const containerURL = Azure.ContainerURL.fromServiceURL(serviceURL, containerName);

        const result = await serviceURL.listContainersSegment(
            Azure.Aborter.none,
            undefined,
            {
              include: "metadata",
              maxresults: 1,
              prefix: name
            }
        );
        if (result.containerItems.length == 1) {
            return result.containerItems[0].name;
        } else {
            return null;
        }
    }

    private async getResourceBlob(name: string) : Promise<string> {
        const containerName = `${name}`;
        const containerURL = Azure.ContainerURL.fromServiceURL(serviceURL, containerName);
        let blobURL = Azure.BlobURL.fromContainerURL(containerURL, blobName);
        let blockBlobURL = Azure.BlockBlobURL.fromBlobURL(blobURL);
        const result = await containerURL.listBlobFlatSegment(
            Azure.Aborter.none,
            undefined,
            {
                maxresults: 1,
                prefix: blobName
            }
        )
       
        if (result.segment.blobItems.length == 1) {
            return result.segment.blobItems[0].name;
        } else {
            return null;
        }
       

    }

    private async createContainer(name: string) {
        // Create a container
        const containerName = `${name}`;
        const containerURL = Azure.ContainerURL.fromServiceURL(serviceURL, containerName);
        let containercheck = await this.getContainer(name);
        if (containercheck === null) {
            const createContainerResponse = await containerURL.create(Azure.Aborter.none);
            console.log(
                `Create container ${containerName} successfully`,
                createContainerResponse.requestId
            );
        }
        return containerURL;
    }

    private async getTextFromBlob(id: string) : Promise<string> {
        const containerName = `${id}`;
        const containerURL = Azure.ContainerURL.fromServiceURL(serviceURL, containerName);
        let blobURL = Azure.BlobURL.fromContainerURL(containerURL, blobName);
        let blockBlobURL = Azure.BlockBlobURL.fromBlobURL(blobURL);
        
        let downloadResponse = await blockBlobURL.download(Azure.Aborter.none, 0);
        const downloadedContent = await this.streamToString(downloadResponse.readableStreamBody);
        return downloadedContent;
    }

    private async uploadBlobFromText(text: string, containerUrl: Azure.ContainerURL) : Promise<string> {
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
        return blobURL.url;
    }

    // A helper method used to read a Node.js readable stream into string
    private async streamToString(readableStream: NodeJS.ReadableStream) : Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: string[] = [];
      readableStream.on("data", data => {
        chunks.push(data.toString());
      });
      readableStream.on("end", () => {
        resolve(chunks.join(""));
      });
      readableStream.on("error", reject);
    });
  }

  
    private _ratetable : RateTable
}