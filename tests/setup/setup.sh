#!/bin/bash

docker create -it --name golang --network host --entrypoint /usr/local/bin/entrypoint.sh golang:1.20
docker cp entrypoint.sh golang:/usr/local/bin/entrypoint.sh
docker start -i golang # this will wait for container to execute only if the script is run in interactive mode
docker wait golang
docker logs golang
docker cp golang:/root/setup/token.json ../token.json || exit 1
docker rm golang
cat ../token.json