# Azure Cost Estimator API

## Overview

This API wraps the Azure RateCard API and helps map Azure sku id's to the latest rate cards. It can be used to build cost estimation products built around spreadsheets and/or ARM template editors

Valid Offer's supported by this API are listed at https://azure.microsoft.com/en-us/support/legal/offer-details/. Prefix the codes with `MS-AZR-` before passing them to the API

## Build and Test Details

### Prerequisites

### Build

1. Edit /config/default.json to add storage account info
1. npm install
2. npm start

### Test

#### Unit Tests
1. npm run test

#### Integration Tests

1. Run `generatetestdata.sh` to create local json files used during integration tests
2. `npm run integration_tests`

## Usage

See the /tests/Functions.spec.ts for examples on how to use the api. This integration test will hit the API after it is deployed to Azure functions



1. /api/costmodel - takes a json document and returns details on the costs for each sku in the document

    Sample Input:

    Optional Parameter: offercode=MS-AZR-0121p

    Offer will default to MS-AZR-0003p if none is provided


2. /api/cost/{location}/ - returns  rate card values for all skus in a particular region

    Optional Parameter: offercode=MS-AZR-0121p

    Offer will default to MS-AZR-0003p if none is provided

    Example: http://localhost:7071/api/cost/eastus

3. /api/cost/{location}/{sku name} - returns single rate card applied to sku in specific region

    Optional Parameter: offercode=MS-AZR-0121p

    Offer will default to MS-AZR-0003p if none is provided

    Example: http://localhost:7071/api/cost/eastus/A3_standard