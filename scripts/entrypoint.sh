#!/bin/bash

echo "Install required tools"

curl https://binaries.soliditylang.org/linux-amd64/solc-linux-amd64-v0.8.24+commit.e11b9ed9 -o /usr/local/bin/solc
chmod +x /usr/local/bin/solc
apt-get update && apt-get install -y jq

echo "Clone the matter-labs/era-contracts repository"
git clone https://github.com/matter-labs/era-contracts.git era-contracts
pushd era-contracts || exit 1
git checkout 8a70bbbc48125f5bde6189b4e3c6a3ee79631678

echo "Install dependencies"
yarn install


echo "Generate ABIs"
solc --base-path l1-contracts/  \
  --include-path l1-contracts/node_modules/ \
  -o l1-abi \
  --abi \
  l1-contracts/contracts/bridgehub/IBridgehub.sol \
  l1-contracts/contracts/bridge/interfaces/IL1SharedBridge.sol \
  l1-contracts/contracts/state-transition/chain-interfaces/IZkSyncHyperchain.sol \
  l1-contracts/contracts/dev-contracts/interfaces/ITestnetERC20Token.sol \
  l1-contracts/contracts/bridge/interfaces/IL1ERC20Bridge.sol \
  l1-contracts/contracts/bridge/interfaces/IL2Bridge.sol

curl https://binaries.soliditylang.org/linux-amd64/solc-linux-amd64-v0.8.20+commit.a1b79de6 -o /usr/local/bin/solc
chmod +x /usr/local/bin/solc

solc --base-path l2-contracts/  \
  --include-path l2-contracts/node_modules/ \
  -o l2-abi \
  --abi \
  l2-contracts/contracts/bridge/interfaces/IL2SharedBridge.sol

solc --base-path system-contracts \
  -o system-contracts-abi \
  --abi \
  system-contracts/contracts/interfaces/IContractDeployer.sol \
  system-contracts/contracts/interfaces/IL1Messenger.sol \
  system-contracts/contracts/interfaces/INonceHolder.sol \
  system-contracts/contracts/interfaces/IPaymasterFlow.sol

mkdir abi /abi
mv l1-abi/* system-contracts-abi/* l2-abi/* abi

contracts="IL2SharedBridge.abi IBridgehub.abi IL1SharedBridge.abi IZkSyncHyperchain.abi IL1ERC20Bridge.abi IL2Bridge.abi IContractDeployer.abi IL1Messenger.abi INonceHolder.abi IPaymasterFlow.abi ITestnetERC20Token.abi"

for filename in $contracts; do
    jq '.' "abi/$filename" > "/abi/${filename%.abi}.json"
done

echo "Folder content"
ls /abi
