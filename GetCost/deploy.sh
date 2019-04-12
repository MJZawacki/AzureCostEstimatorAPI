az group create -n mzratecard -l westus

 az storage account create -n mzratecard -g mzratecard -l westus --sku Standard_LRS
# wait for storage account to be deployed
connectionstring=$(az storage account show-connection-string  -n mzratecard -g mzratecard -o tsv)

 az storage queue create -n meters --connection-string $connectionstring
 az storage queue create -n skus --connection-string $connectionstring
#  az functionapp list-consumption-locations
az functionapp create -n mzratecardfunc -g mzratecard -s mzratecard -c westus
func azure functionapp fetch-app-settings mzratecardfunc
func settings add MyStorageConnectionAppSetting "$connectionstring"