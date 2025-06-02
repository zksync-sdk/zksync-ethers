### ETH based chain tests

# Build
yarn install
yarn types
yarn build
yarn test:build

# Run local-setup
cd ../local-setup
./start-zk-chains.sh
cd ../zksync-ethers

# Extract custom token address
until docker exec local-setup-zksync-1 test -f /configs/erc20.yaml; do
    echo "Token config file not found yet, checking again in 5 seconds..."
    sleep 5
done
echo "Extracting deployed token address from inside zksync container..."
CUSTOM_TOKEN_ADDRESS=$(docker exec local-setup-zksync-1 awk -F": " '/tokens:/ {found_tokens=1} found_tokens && /DAI:/ {found_dai=1} found_dai && /address:/ {print $2; exit}' /configs/erc20.yaml)

if [ -z "$CUSTOM_TOKEN_ADDRESS" ]; then
    echo "❌ Error: Could not retrieve token address. Exiting."
    exit 1
fi

echo "Custom token address: $CUSTOM_TOKEN_ADDRESS"

# Prepare environment
export IS_ETH_CHAIN=true
export CUSTOM_TOKEN_ADDRESS=$CUSTOM_TOKEN_ADDRESS
yarn test:prepare

# Run tests
yarn test

### Non ETH based chain tests

# Build
yarn install
yarn types
yarn build
yarn test:build

# Run local-setup
cd ../local-setup
./start-zk-chains.sh
cd ../zksync-ethers

# Extract custom token address
echo "Waiting for token deployment..."
until docker exec local-setup-zksync-1 test -f /configs/erc20.yaml; do
    echo "Token config file not found yet, checking again in 5 seconds..."
    sleep 5
done

echo "Extracting deployed token address from inside zksync container..."
CUSTOM_TOKEN_ADDRESS=$(docker exec local-setup-zksync-1 awk -F": " '/tokens:/ {found_tokens=1} found_tokens && /DAI:/ {found_dai=1} found_dai && /address:/ {print $2; exit}' /configs/erc20.yaml)

if [ -z "$CUSTOM_TOKEN_ADDRESS" ]; then
    echo "❌ Error: Could not retrieve token address. Exiting."
    exit 1
fi

echo "Custom token address: $CUSTOM_TOKEN_ADDRESS"

# Prepare environment
export IS_ETH_CHAIN=false
export CUSTOM_TOKEN_ADDRESS=$CUSTOM_TOKEN_ADDRESS
yarn test:prepare

# Run tests
yarn test