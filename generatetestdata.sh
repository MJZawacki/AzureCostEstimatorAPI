#!/bin/bash

az vm list-skus -l eastus -o json  --query '[?resourceType == `virtualMachines`]'  | jq -r '[.[] | { name:.name, location:.locationInfo[0].location,os:"linux",priority:"normal",type:"vm" }]' > skus_eastus_linux_normal.json
az vm list-skus -l eastus -o json  --query '[?resourceType == `virtualMachines`]' | jq -r '[.[] | { name:.name, location:.locationInfo[0].location,os:"linux",priority:"low",type:"vm" }]' > skus_eastus_linux_low.json
az vm list-skus -l eastus -o json  --query '[?resourceType == `virtualMachines`]' | jq -r '[.[] | { name:.name, location:.locationInfo[0].location,os:"windows",priority:"normal",type:"vm" }]' > skus_eastus_windows_normal.json
az vm list-skus -l eastus -o json  --query '[?resourceType == `virtualMachines`]' | jq -r '[.[] | { name:.name, location:.locationInfo[0].location,os:"windows",priority:"low",type:"vm" }]' > skus_eastus_windows_low.json