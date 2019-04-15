#!/bin/bash

# Call this from the function project development directory 

rg='mzconfigurator'
loc='westus'
functionappname = 'mzconfigurator'
cosmosdbname='mzconfigurator'
az group create -n $rg -l $loc

 az storage account create -n mzratecard -g $rg -l $loc --sku Standard_LRS
# wait for storage account to be deployed
connectionstring=$(az storage account show-connection-string  -n mzratecard -g $rg -o tsv)

 az storage queue create -n meters --connection-string $connectionstring
 az storage queue create -n skus --connection-string $connectionstring
#  az functionapp list-consumption-locations
az functionapp create -n $functionappname -g $rg -s mzratecard -c $loc
func azure functionapp fetch-app-settings mzratecardfunc
func settings add MyStorageConnectionAppSetting "$connectionstring"

az cosmosdb create -n $cosmosdbname -g $rg

cosmosconstring=$(az cosmosdb list-connection-strings -g $rg -n $cosmosdbname | jq -r '.connectionStrings[0]')

az cosmosdb database create -d Configurator -n $cosmosdbname -g $rg
az cosmosdb collection create -d Configurator -c Rates -n $cosmosdbname -g $rg  # uniquename = /MeterId; partitionkey = /MeterSubCategory
az cosmosdb collection create -d Configurator -c Skus -n cosmosdbname -g $rg  # uniquename = /name,/location; partitionkey = /location
