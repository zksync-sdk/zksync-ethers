#!/bin/bash

docker create --name abi-gen --entrypoint /usr/local/bin/entrypoint.sh node:18
docker cp entrypoint.sh abi-gen:/usr/local/bin/entrypoint.sh
docker start -i abi-gen
docker cp abi-gen:/abi/. ../abi
docker rm abi-gen