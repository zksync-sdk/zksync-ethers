#!/bin/bash

output=$(docker exec local-setup_zksync_1 cat /deployed_contracts.log)
address=$(echo "$output" | grep CONTRACTS_DIAMOND_PROXY_ADDR | cut -d'=' -f2 | tr -d '[:space:]')
echo "{\"address\": \"$address\"}" > ../tests/files/diamondProxy.json
