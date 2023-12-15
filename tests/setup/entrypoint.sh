#!/bin/bash

cd /root || exit
mkdir setup
cd setup || exit

go mod init setup
go get github.com/zksync-sdk/zksync2-go@v0.3.2

mkdir crown_l1
cat << EOF > crown_l1/crown_l1.go
// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package crown_l1

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// Crownl1MetaData contains all meta data concerning the Crownl1 contract.
var Crownl1MetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"string\",\"name\":\"name_\",\"type\":\"string\"},{\"internalType\":\"string\",\"name\":\"symbol_\",\"type\":\"string\"},{\"internalType\":\"uint8\",\"name\":\"decimals_\",\"type\":\"uint8\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"decimals\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"subtractedValue\",\"type\":\"uint256\"}],\"name\":\"decreaseAllowance\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"addedValue\",\"type\":\"uint256\"}],\"name\":\"increaseAllowance\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"_amount\",\"type\":\"uint256\"}],\"name\":\"mint\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]",
	Bin: "0x60806040523480156200001157600080fd5b5060405162001a8038038062001a80833981810160405281019062000037919062000254565b828281600390816200004a919062000539565b5080600490816200005c919062000539565b50505080600560006101000a81548160ff021916908360ff16021790555050505062000620565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b620000ec82620000a1565b810181811067ffffffffffffffff821117156200010e576200010d620000b2565b5b80604052505050565b60006200012362000083565b9050620001318282620000e1565b919050565b600067ffffffffffffffff821115620001545762000153620000b2565b5b6200015f82620000a1565b9050602081019050919050565b60005b838110156200018c5780820151818401526020810190506200016f565b60008484015250505050565b6000620001af620001a98462000136565b62000117565b905082815260208101848484011115620001ce57620001cd6200009c565b5b620001db8482856200016c565b509392505050565b600082601f830112620001fb57620001fa62000097565b5b81516200020d84826020860162000198565b91505092915050565b600060ff82169050919050565b6200022e8162000216565b81146200023a57600080fd5b50565b6000815190506200024e8162000223565b92915050565b60008060006060848603121562000270576200026f6200008d565b5b600084015167ffffffffffffffff81111562000291576200029062000092565b5b6200029f86828701620001e3565b935050602084015167ffffffffffffffff811115620002c357620002c262000092565b5b620002d186828701620001e3565b9250506040620002e4868287016200023d565b9150509250925092565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200034157607f821691505b602082108103620003575762000356620002f9565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302620003c17fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8262000382565b620003cd868362000382565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b60006200041a620004146200040e84620003e5565b620003ef565b620003e5565b9050919050565b6000819050919050565b6200043683620003f9565b6200044e620004458262000421565b8484546200038f565b825550505050565b600090565b6200046562000456565b620004728184846200042b565b505050565b5b818110156200049a576200048e6000826200045b565b60018101905062000478565b5050565b601f821115620004e957620004b3816200035d565b620004be8462000372565b81016020851015620004ce578190505b620004e6620004dd8562000372565b83018262000477565b50505b505050565b600082821c905092915050565b60006200050e60001984600802620004ee565b1980831691505092915050565b6000620005298383620004fb565b9150826002028217905092915050565b6200054482620002ee565b67ffffffffffffffff81111562000560576200055f620000b2565b5b6200056c825462000328565b620005798282856200049e565b600060209050601f831160018114620005b157600084156200059c578287015190505b620005a885826200051b565b86555062000618565b601f198416620005c1866200035d565b60005b82811015620005eb57848901518255600182019150602085019450602081019050620005c4565b868310156200060b578489015162000607601f891682620004fb565b8355505b6001600288020188555050505b505050505050565b61145080620006306000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c806340c10f191161007157806340c10f19146101a357806370a08231146101d357806395d89b4114610203578063a457c2d714610221578063a9059cbb14610251578063dd62ed3e14610281576100b4565b806306fdde03146100b9578063095ea7b3146100d757806318160ddd1461010757806323b872dd14610125578063313ce567146101555780633950935114610173575b600080fd5b6100c16102b1565b6040516100ce9190610cc1565b60405180910390f35b6100f160048036038101906100ec9190610d7c565b610343565b6040516100fe9190610dd7565b60405180910390f35b61010f610366565b60405161011c9190610e01565b60405180910390f35b61013f600480360381019061013a9190610e1c565b610370565b60405161014c9190610dd7565b60405180910390f35b61015d61039f565b60405161016a9190610e8b565b60405180910390f35b61018d60048036038101906101889190610d7c565b6103b6565b60405161019a9190610dd7565b60405180910390f35b6101bd60048036038101906101b89190610d7c565b6103ed565b6040516101ca9190610dd7565b60405180910390f35b6101ed60048036038101906101e89190610ea6565b610403565b6040516101fa9190610e01565b60405180910390f35b61020b61044b565b6040516102189190610cc1565b60405180910390f35b61023b60048036038101906102369190610d7c565b6104dd565b6040516102489190610dd7565b60405180910390f35b61026b60048036038101906102669190610d7c565b610554565b6040516102789190610dd7565b60405180910390f35b61029b60048036038101906102969190610ed3565b610577565b6040516102a89190610e01565b60405180910390f35b6060600380546102c090610f42565b80601f01602080910402602001604051908101604052809291908181526020018280546102ec90610f42565b80156103395780601f1061030e57610100808354040283529160200191610339565b820191906000526020600020905b81548152906001019060200180831161031c57829003601f168201915b5050505050905090565b60008061034e6105fe565b905061035b818585610606565b600191505092915050565b6000600254905090565b60008061037b6105fe565b90506103888582856107cf565b61039385858561085b565b60019150509392505050565b6000600560009054906101000a900460ff16905090565b6000806103c16105fe565b90506103e28185856103d38589610577565b6103dd9190610fa2565b610606565b600191505092915050565b60006103f98383610ad1565b6001905092915050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60606004805461045a90610f42565b80601f016020809104026020016040519081016040528092919081815260200182805461048690610f42565b80156104d35780601f106104a8576101008083540402835291602001916104d3565b820191906000526020600020905b8154815290600101906020018083116104b657829003601f168201915b5050505050905090565b6000806104e86105fe565b905060006104f68286610577565b90508381101561053b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161053290611048565b60405180910390fd5b6105488286868403610606565b60019250505092915050565b60008061055f6105fe565b905061056c81858561085b565b600191505092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610675576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161066c906110da565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036106e4576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106db9061116c565b60405180910390fd5b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040516107c29190610e01565b60405180910390a3505050565b60006107db8484610577565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146108555781811015610847576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161083e906111d8565b60405180910390fd5b6108548484848403610606565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036108ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108c19061126a565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610939576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610930906112fc565b60405180910390fd5b610944838383610c27565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050818110156109ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109c19061138e565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610ab89190610e01565b60405180910390a3610acb848484610c2c565b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610b40576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b37906113fa565b60405180910390fd5b610b4c60008383610c27565b8060026000828254610b5e9190610fa2565b92505081905550806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610c0f9190610e01565b60405180910390a3610c2360008383610c2c565b5050565b505050565b505050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610c6b578082015181840152602081019050610c50565b60008484015250505050565b6000601f19601f8301169050919050565b6000610c9382610c31565b610c9d8185610c3c565b9350610cad818560208601610c4d565b610cb681610c77565b840191505092915050565b60006020820190508181036000830152610cdb8184610c88565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610d1382610ce8565b9050919050565b610d2381610d08565b8114610d2e57600080fd5b50565b600081359050610d4081610d1a565b92915050565b6000819050919050565b610d5981610d46565b8114610d6457600080fd5b50565b600081359050610d7681610d50565b92915050565b60008060408385031215610d9357610d92610ce3565b5b6000610da185828601610d31565b9250506020610db285828601610d67565b9150509250929050565b60008115159050919050565b610dd181610dbc565b82525050565b6000602082019050610dec6000830184610dc8565b92915050565b610dfb81610d46565b82525050565b6000602082019050610e166000830184610df2565b92915050565b600080600060608486031215610e3557610e34610ce3565b5b6000610e4386828701610d31565b9350506020610e5486828701610d31565b9250506040610e6586828701610d67565b9150509250925092565b600060ff82169050919050565b610e8581610e6f565b82525050565b6000602082019050610ea06000830184610e7c565b92915050565b600060208284031215610ebc57610ebb610ce3565b5b6000610eca84828501610d31565b91505092915050565b60008060408385031215610eea57610ee9610ce3565b5b6000610ef885828601610d31565b9250506020610f0985828601610d31565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680610f5a57607f821691505b602082108103610f6d57610f6c610f13565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610fad82610d46565b9150610fb883610d46565b9250828201905080821115610fd057610fcf610f73565b5b92915050565b7f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760008201527f207a65726f000000000000000000000000000000000000000000000000000000602082015250565b6000611032602583610c3c565b915061103d82610fd6565b604082019050919050565b6000602082019050818103600083015261106181611025565b9050919050565b7f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b60006110c4602483610c3c565b91506110cf82611068565b604082019050919050565b600060208201905081810360008301526110f3816110b7565b9050919050565b7f45524332303a20617070726f766520746f20746865207a65726f20616464726560008201527f7373000000000000000000000000000000000000000000000000000000000000602082015250565b6000611156602283610c3c565b9150611161826110fa565b604082019050919050565b6000602082019050818103600083015261118581611149565b9050919050565b7f45524332303a20696e73756666696369656e7420616c6c6f77616e6365000000600082015250565b60006111c2601d83610c3c565b91506111cd8261118c565b602082019050919050565b600060208201905081810360008301526111f1816111b5565b9050919050565b7f45524332303a207472616e736665722066726f6d20746865207a65726f20616460008201527f6472657373000000000000000000000000000000000000000000000000000000602082015250565b6000611254602583610c3c565b915061125f826111f8565b604082019050919050565b6000602082019050818103600083015261128381611247565b9050919050565b7f45524332303a207472616e7366657220746f20746865207a65726f206164647260008201527f6573730000000000000000000000000000000000000000000000000000000000602082015250565b60006112e6602383610c3c565b91506112f18261128a565b604082019050919050565b60006020820190508181036000830152611315816112d9565b9050919050565b7f45524332303a207472616e7366657220616d6f756e742065786365656473206260008201527f616c616e63650000000000000000000000000000000000000000000000000000602082015250565b6000611378602683610c3c565b91506113838261131c565b604082019050919050565b600060208201905081810360008301526113a78161136b565b9050919050565b7f45524332303a206d696e7420746f20746865207a65726f206164647265737300600082015250565b60006113e4601f83610c3c565b91506113ef826113ae565b602082019050919050565b60006020820190508181036000830152611413816113d7565b905091905056fea2646970667358221220000337f45cfac5d1f414a2e9ac8d9051c93d7cab29f64c5a5d1f8167426908db64736f6c63430008130033",
}

// Crownl1ABI is the input ABI used to generate the binding from.
// Deprecated: Use Crownl1MetaData.ABI instead.
var Crownl1ABI = Crownl1MetaData.ABI

// Crownl1Bin is the compiled bytecode used for deploying new contracts.
// Deprecated: Use Crownl1MetaData.Bin instead.
var Crownl1Bin = Crownl1MetaData.Bin

// DeployCrownl1 deploys a new Ethereum contract, binding an instance of Crownl1 to it.
func DeployCrownl1(auth *bind.TransactOpts, backend bind.ContractBackend, name_ string, symbol_ string, decimals_ uint8) (common.Address, *types.Transaction, *Crownl1, error) {
	parsed, err := Crownl1MetaData.GetAbi()
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	if parsed == nil {
		return common.Address{}, nil, nil, errors.New("GetABI returned nil")
	}

	address, tx, contract, err := bind.DeployContract(auth, *parsed, common.FromHex(Crownl1Bin), backend, name_, symbol_, decimals_)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &Crownl1{Crownl1Caller: Crownl1Caller{contract: contract}, Crownl1Transactor: Crownl1Transactor{contract: contract}, Crownl1Filterer: Crownl1Filterer{contract: contract}}, nil
}

// Crownl1 is an auto generated Go binding around an Ethereum contract.
type Crownl1 struct {
	Crownl1Caller     // Read-only binding to the contract
	Crownl1Transactor // Write-only binding to the contract
	Crownl1Filterer   // Log filterer for contract events
}

// Crownl1Caller is an auto generated read-only Go binding around an Ethereum contract.
type Crownl1Caller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// Crownl1Transactor is an auto generated write-only Go binding around an Ethereum contract.
type Crownl1Transactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// Crownl1Filterer is an auto generated log filtering Go binding around an Ethereum contract events.
type Crownl1Filterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// Crownl1Session is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type Crownl1Session struct {
	Contract     *Crownl1          // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// Crownl1CallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type Crownl1CallerSession struct {
	Contract *Crownl1Caller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts  // Call options to use throughout this session
}

// Crownl1TransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type Crownl1TransactorSession struct {
	Contract     *Crownl1Transactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts  // Transaction auth options to use throughout this session
}

// Crownl1Raw is an auto generated low-level Go binding around an Ethereum contract.
type Crownl1Raw struct {
	Contract *Crownl1 // Generic contract binding to access the raw methods on
}

// Crownl1CallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type Crownl1CallerRaw struct {
	Contract *Crownl1Caller // Generic read-only contract binding to access the raw methods on
}

// Crownl1TransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type Crownl1TransactorRaw struct {
	Contract *Crownl1Transactor // Generic write-only contract binding to access the raw methods on
}

// NewCrownl1 creates a new instance of Crownl1, bound to a specific deployed contract.
func NewCrownl1(address common.Address, backend bind.ContractBackend) (*Crownl1, error) {
	contract, err := bindCrownl1(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Crownl1{Crownl1Caller: Crownl1Caller{contract: contract}, Crownl1Transactor: Crownl1Transactor{contract: contract}, Crownl1Filterer: Crownl1Filterer{contract: contract}}, nil
}

// NewCrownl1Caller creates a new read-only instance of Crownl1, bound to a specific deployed contract.
func NewCrownl1Caller(address common.Address, caller bind.ContractCaller) (*Crownl1Caller, error) {
	contract, err := bindCrownl1(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &Crownl1Caller{contract: contract}, nil
}

// NewCrownl1Transactor creates a new write-only instance of Crownl1, bound to a specific deployed contract.
func NewCrownl1Transactor(address common.Address, transactor bind.ContractTransactor) (*Crownl1Transactor, error) {
	contract, err := bindCrownl1(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &Crownl1Transactor{contract: contract}, nil
}

// NewCrownl1Filterer creates a new log filterer instance of Crownl1, bound to a specific deployed contract.
func NewCrownl1Filterer(address common.Address, filterer bind.ContractFilterer) (*Crownl1Filterer, error) {
	contract, err := bindCrownl1(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &Crownl1Filterer{contract: contract}, nil
}

// bindCrownl1 binds a generic wrapper to an already deployed contract.
func bindCrownl1(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := Crownl1MetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Crownl1 *Crownl1Raw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Crownl1.Contract.Crownl1Caller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Crownl1 *Crownl1Raw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Crownl1.Contract.Crownl1Transactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Crownl1 *Crownl1Raw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Crownl1.Contract.Crownl1Transactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Crownl1 *Crownl1CallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Crownl1.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Crownl1 *Crownl1TransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Crownl1.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Crownl1 *Crownl1TransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Crownl1.Contract.contract.Transact(opts, method, params...)
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(address owner, address spender) view returns(uint256)
func (_Crownl1 *Crownl1Caller) Allowance(opts *bind.CallOpts, owner common.Address, spender common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Crownl1.contract.Call(opts, &out, "allowance", owner, spender)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(address owner, address spender) view returns(uint256)
func (_Crownl1 *Crownl1Session) Allowance(owner common.Address, spender common.Address) (*big.Int, error) {
	return _Crownl1.Contract.Allowance(&_Crownl1.CallOpts, owner, spender)
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(address owner, address spender) view returns(uint256)
func (_Crownl1 *Crownl1CallerSession) Allowance(owner common.Address, spender common.Address) (*big.Int, error) {
	return _Crownl1.Contract.Allowance(&_Crownl1.CallOpts, owner, spender)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address account) view returns(uint256)
func (_Crownl1 *Crownl1Caller) BalanceOf(opts *bind.CallOpts, account common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Crownl1.contract.Call(opts, &out, "balanceOf", account)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address account) view returns(uint256)
func (_Crownl1 *Crownl1Session) BalanceOf(account common.Address) (*big.Int, error) {
	return _Crownl1.Contract.BalanceOf(&_Crownl1.CallOpts, account)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address account) view returns(uint256)
func (_Crownl1 *Crownl1CallerSession) BalanceOf(account common.Address) (*big.Int, error) {
	return _Crownl1.Contract.BalanceOf(&_Crownl1.CallOpts, account)
}

// Decimals is a free data retrieval call binding the contract method 0x313ce567.
//
// Solidity: function decimals() view returns(uint8)
func (_Crownl1 *Crownl1Caller) Decimals(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Crownl1.contract.Call(opts, &out, "decimals")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// Decimals is a free data retrieval call binding the contract method 0x313ce567.
//
// Solidity: function decimals() view returns(uint8)
func (_Crownl1 *Crownl1Session) Decimals() (uint8, error) {
	return _Crownl1.Contract.Decimals(&_Crownl1.CallOpts)
}

// Decimals is a free data retrieval call binding the contract method 0x313ce567.
//
// Solidity: function decimals() view returns(uint8)
func (_Crownl1 *Crownl1CallerSession) Decimals() (uint8, error) {
	return _Crownl1.Contract.Decimals(&_Crownl1.CallOpts)
}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() view returns(string)
func (_Crownl1 *Crownl1Caller) Name(opts *bind.CallOpts) (string, error) {
	var out []interface{}
	err := _Crownl1.contract.Call(opts, &out, "name")

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() view returns(string)
func (_Crownl1 *Crownl1Session) Name() (string, error) {
	return _Crownl1.Contract.Name(&_Crownl1.CallOpts)
}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() view returns(string)
func (_Crownl1 *Crownl1CallerSession) Name() (string, error) {
	return _Crownl1.Contract.Name(&_Crownl1.CallOpts)
}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() view returns(string)
func (_Crownl1 *Crownl1Caller) Symbol(opts *bind.CallOpts) (string, error) {
	var out []interface{}
	err := _Crownl1.contract.Call(opts, &out, "symbol")

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() view returns(string)
func (_Crownl1 *Crownl1Session) Symbol() (string, error) {
	return _Crownl1.Contract.Symbol(&_Crownl1.CallOpts)
}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() view returns(string)
func (_Crownl1 *Crownl1CallerSession) Symbol() (string, error) {
	return _Crownl1.Contract.Symbol(&_Crownl1.CallOpts)
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() view returns(uint256)
func (_Crownl1 *Crownl1Caller) TotalSupply(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Crownl1.contract.Call(opts, &out, "totalSupply")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() view returns(uint256)
func (_Crownl1 *Crownl1Session) TotalSupply() (*big.Int, error) {
	return _Crownl1.Contract.TotalSupply(&_Crownl1.CallOpts)
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() view returns(uint256)
func (_Crownl1 *Crownl1CallerSession) TotalSupply() (*big.Int, error) {
	return _Crownl1.Contract.TotalSupply(&_Crownl1.CallOpts)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(address spender, uint256 amount) returns(bool)
func (_Crownl1 *Crownl1Transactor) Approve(opts *bind.TransactOpts, spender common.Address, amount *big.Int) (*types.Transaction, error) {
	return _Crownl1.contract.Transact(opts, "approve", spender, amount)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(address spender, uint256 amount) returns(bool)
func (_Crownl1 *Crownl1Session) Approve(spender common.Address, amount *big.Int) (*types.Transaction, error) {
	return _Crownl1.Contract.Approve(&_Crownl1.TransactOpts, spender, amount)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(address spender, uint256 amount) returns(bool)
func (_Crownl1 *Crownl1TransactorSession) Approve(spender common.Address, amount *big.Int) (*types.Transaction, error) {
	return _Crownl1.Contract.Approve(&_Crownl1.TransactOpts, spender, amount)
}

// DecreaseAllowance is a paid mutator transaction binding the contract method 0xa457c2d7.
//
// Solidity: function decreaseAllowance(address spender, uint256 subtractedValue) returns(bool)
func (_Crownl1 *Crownl1Transactor) DecreaseAllowance(opts *bind.TransactOpts, spender common.Address, subtractedValue *big.Int) (*types.Transaction, error) {
	return _Crownl1.contract.Transact(opts, "decreaseAllowance", spender, subtractedValue)
}

// DecreaseAllowance is a paid mutator transaction binding the contract method 0xa457c2d7.
//
// Solidity: function decreaseAllowance(address spender, uint256 subtractedValue) returns(bool)
func (_Crownl1 *Crownl1Session) DecreaseAllowance(spender common.Address, subtractedValue *big.Int) (*types.Transaction, error) {
	return _Crownl1.Contract.DecreaseAllowance(&_Crownl1.TransactOpts, spender, subtractedValue)
}

// DecreaseAllowance is a paid mutator transaction binding the contract method 0xa457c2d7.
//
// Solidity: function decreaseAllowance(address spender, uint256 subtractedValue) returns(bool)
func (_Crownl1 *Crownl1TransactorSession) DecreaseAllowance(spender common.Address, subtractedValue *big.Int) (*types.Transaction, error) {
	return _Crownl1.Contract.DecreaseAllowance(&_Crownl1.TransactOpts, spender, subtractedValue)
}

// IncreaseAllowance is a paid mutator transaction binding the contract method 0x39509351.
//
// Solidity: function increaseAllowance(address spender, uint256 addedValue) returns(bool)
func (_Crownl1 *Crownl1Transactor) IncreaseAllowance(opts *bind.TransactOpts, spender common.Address, addedValue *big.Int) (*types.Transaction, error) {
	return _Crownl1.contract.Transact(opts, "increaseAllowance", spender, addedValue)
}

// IncreaseAllowance is a paid mutator transaction binding the contract method 0x39509351.
//
// Solidity: function increaseAllowance(address spender, uint256 addedValue) returns(bool)
func (_Crownl1 *Crownl1Session) IncreaseAllowance(spender common.Address, addedValue *big.Int) (*types.Transaction, error) {
	return _Crownl1.Contract.IncreaseAllowance(&_Crownl1.TransactOpts, spender, addedValue)
}

// IncreaseAllowance is a paid mutator transaction binding the contract method 0x39509351.
//
// Solidity: function increaseAllowance(address spender, uint256 addedValue) returns(bool)
func (_Crownl1 *Crownl1TransactorSession) IncreaseAllowance(spender common.Address, addedValue *big.Int) (*types.Transaction, error) {
	return _Crownl1.Contract.IncreaseAllowance(&_Crownl1.TransactOpts, spender, addedValue)
}

// Mint is a paid mutator transaction binding the contract method 0x40c10f19.
//
// Solidity: function mint(address _to, uint256 _amount) returns(bool)
func (_Crownl1 *Crownl1Transactor) Mint(opts *bind.TransactOpts, _to common.Address, _amount *big.Int) (*types.Transaction, error) {
	return _Crownl1.contract.Transact(opts, "mint", _to, _amount)
}

// Mint is a paid mutator transaction binding the contract method 0x40c10f19.
//
// Solidity: function mint(address _to, uint256 _amount) returns(bool)
func (_Crownl1 *Crownl1Session) Mint(_to common.Address, _amount *big.Int) (*types.Transaction, error) {
	return _Crownl1.Contract.Mint(&_Crownl1.TransactOpts, _to, _amount)
}

// Mint is a paid mutator transaction binding the contract method 0x40c10f19.
//
// Solidity: function mint(address _to, uint256 _amount) returns(bool)
func (_Crownl1 *Crownl1TransactorSession) Mint(_to common.Address, _amount *big.Int) (*types.Transaction, error) {
	return _Crownl1.Contract.Mint(&_Crownl1.TransactOpts, _to, _amount)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(address to, uint256 amount) returns(bool)
func (_Crownl1 *Crownl1Transactor) Transfer(opts *bind.TransactOpts, to common.Address, amount *big.Int) (*types.Transaction, error) {
	return _Crownl1.contract.Transact(opts, "transfer", to, amount)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(address to, uint256 amount) returns(bool)
func (_Crownl1 *Crownl1Session) Transfer(to common.Address, amount *big.Int) (*types.Transaction, error) {
	return _Crownl1.Contract.Transfer(&_Crownl1.TransactOpts, to, amount)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(address to, uint256 amount) returns(bool)
func (_Crownl1 *Crownl1TransactorSession) Transfer(to common.Address, amount *big.Int) (*types.Transaction, error) {
	return _Crownl1.Contract.Transfer(&_Crownl1.TransactOpts, to, amount)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(address from, address to, uint256 amount) returns(bool)
func (_Crownl1 *Crownl1Transactor) TransferFrom(opts *bind.TransactOpts, from common.Address, to common.Address, amount *big.Int) (*types.Transaction, error) {
	return _Crownl1.contract.Transact(opts, "transferFrom", from, to, amount)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(address from, address to, uint256 amount) returns(bool)
func (_Crownl1 *Crownl1Session) TransferFrom(from common.Address, to common.Address, amount *big.Int) (*types.Transaction, error) {
	return _Crownl1.Contract.TransferFrom(&_Crownl1.TransactOpts, from, to, amount)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(address from, address to, uint256 amount) returns(bool)
func (_Crownl1 *Crownl1TransactorSession) TransferFrom(from common.Address, to common.Address, amount *big.Int) (*types.Transaction, error) {
	return _Crownl1.Contract.TransferFrom(&_Crownl1.TransactOpts, from, to, amount)
}

// Crownl1ApprovalIterator is returned from FilterApproval and is used to iterate over the raw logs and unpacked data for Approval events raised by the Crownl1 contract.
type Crownl1ApprovalIterator struct {
	Event *Crownl1Approval // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *Crownl1ApprovalIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(Crownl1Approval)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(Crownl1Approval)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *Crownl1ApprovalIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *Crownl1ApprovalIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// Crownl1Approval represents a Approval event raised by the Crownl1 contract.
type Crownl1Approval struct {
	Owner   common.Address
	Spender common.Address
	Value   *big.Int
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterApproval is a free log retrieval operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: event Approval(address indexed owner, address indexed spender, uint256 value)
func (_Crownl1 *Crownl1Filterer) FilterApproval(opts *bind.FilterOpts, owner []common.Address, spender []common.Address) (*Crownl1ApprovalIterator, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var spenderRule []interface{}
	for _, spenderItem := range spender {
		spenderRule = append(spenderRule, spenderItem)
	}

	logs, sub, err := _Crownl1.contract.FilterLogs(opts, "Approval", ownerRule, spenderRule)
	if err != nil {
		return nil, err
	}
	return &Crownl1ApprovalIterator{contract: _Crownl1.contract, event: "Approval", logs: logs, sub: sub}, nil
}

// WatchApproval is a free log subscription operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: event Approval(address indexed owner, address indexed spender, uint256 value)
func (_Crownl1 *Crownl1Filterer) WatchApproval(opts *bind.WatchOpts, sink chan<- *Crownl1Approval, owner []common.Address, spender []common.Address) (event.Subscription, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var spenderRule []interface{}
	for _, spenderItem := range spender {
		spenderRule = append(spenderRule, spenderItem)
	}

	logs, sub, err := _Crownl1.contract.WatchLogs(opts, "Approval", ownerRule, spenderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(Crownl1Approval)
				if err := _Crownl1.contract.UnpackLog(event, "Approval", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseApproval is a log parse operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: event Approval(address indexed owner, address indexed spender, uint256 value)
func (_Crownl1 *Crownl1Filterer) ParseApproval(log types.Log) (*Crownl1Approval, error) {
	event := new(Crownl1Approval)
	if err := _Crownl1.contract.UnpackLog(event, "Approval", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// Crownl1TransferIterator is returned from FilterTransfer and is used to iterate over the raw logs and unpacked data for Transfer events raised by the Crownl1 contract.
type Crownl1TransferIterator struct {
	Event *Crownl1Transfer // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *Crownl1TransferIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(Crownl1Transfer)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(Crownl1Transfer)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *Crownl1TransferIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *Crownl1TransferIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// Crownl1Transfer represents a Transfer event raised by the Crownl1 contract.
type Crownl1Transfer struct {
	From  common.Address
	To    common.Address
	Value *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterTransfer is a free log retrieval operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: event Transfer(address indexed from, address indexed to, uint256 value)
func (_Crownl1 *Crownl1Filterer) FilterTransfer(opts *bind.FilterOpts, from []common.Address, to []common.Address) (*Crownl1TransferIterator, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _Crownl1.contract.FilterLogs(opts, "Transfer", fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return &Crownl1TransferIterator{contract: _Crownl1.contract, event: "Transfer", logs: logs, sub: sub}, nil
}

// WatchTransfer is a free log subscription operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: event Transfer(address indexed from, address indexed to, uint256 value)
func (_Crownl1 *Crownl1Filterer) WatchTransfer(opts *bind.WatchOpts, sink chan<- *Crownl1Transfer, from []common.Address, to []common.Address) (event.Subscription, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _Crownl1.contract.WatchLogs(opts, "Transfer", fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(Crownl1Transfer)
				if err := _Crownl1.contract.UnpackLog(event, "Transfer", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseTransfer is a log parse operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: event Transfer(address indexed from, address indexed to, uint256 value)
func (_Crownl1 *Crownl1Filterer) ParseTransfer(log types.Log) (*Crownl1Transfer, error) {
	event := new(Crownl1Transfer)
	if err := _Crownl1.contract.UnpackLog(event, "Transfer", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
EOF


cat << 'EOF' > setup.go
package main

import (
	"context"
	"crypto/ecdsa"
	"encoding/json"
	"fmt"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/zksync-sdk/zksync2-go/accounts"
	"github.com/zksync-sdk/zksync2-go/clients"
	"setup/crown_l1"
	"log"
	"math/big"
	"os"
)

const TokenPath = "./token.json"

type Token struct {
	L1Address string `json:"l1Address"`
	L2Address string `json:"l2Address"`
}

func readToken() *Token {
	file, err := os.Open(TokenPath)
	if err != nil {
		log.Printf("Could not find token.json, creating new one")
		return nil
	}
	defer func(file *os.File) {
		errClose := file.Close()
		if errClose != nil {
			log.Fatalf("Error closing file: %s", err)
		}
	}(file)

	var token Token
	decoder := json.NewDecoder(file)
	if errDecode := decoder.Decode(&token); err != nil {
		log.Fatalf("Error decoding JSON: %s", errDecode)
	}
	return &token
}

func writeToken(token Token) {
	file, err := os.Create(TokenPath)
	if err != nil {
		log.Fatalf("Error creating file: %s", err)
	}
	defer func(file *os.File) {
		errClose := file.Close()
		if errClose != nil {
			log.Fatalf("Error closing file: %s", err)
		}
	}(file)

	// Marshal data to JSON
	jsonData, err := json.MarshalIndent(token, "", "  ")
	if err != nil {
		log.Fatalf("Error marshaling to JSON: %s", err)
	}

	// Write JSON data to the file
	_, err = file.Write(jsonData)
	if err != nil {
		log.Fatalf("Error writing JSON to file: %s", err)
	}

	log.Println("Token: ", token)
}

func checkIfTokenNeedsToBeCreated(client clients.Client, ethClient *ethclient.Client) (bool, bool) {
	token := readToken()
	if token == nil {
		return true, true
	}
	_, err := ethClient.CodeAt(context.Background(), common.HexToAddress(token.L1Address), nil)
	if err != nil {
		return false, false
	}
	_, err = client.CodeAt(context.Background(), common.HexToAddress(token.L2Address), nil)
	if err != nil {
		return true, false
	}

	return true, true
}

func createTokenL1(ethClient *ethclient.Client, privateKey *ecdsa.PrivateKey, publicKey common.Address) common.Address {
	chainID, err := ethClient.ChainID(context.Background())
	if err != nil {
		log.Fatal(err)
	}
	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		log.Fatal(err)
	}

	address, tx, token, err := crown_l1.DeployCrownl1(auth, ethClient, "DAI", "DAI", 18)
	if err != nil {
		log.Fatal(err)
	}

	_, err = bind.WaitDeployed(context.Background(), ethClient, tx)
	if err != nil {
		log.Fatal(err)
	}

	symbol, err := token.Symbol(nil)
	if err != nil {
		log.Fatal(err)
	}
	decimals, err := token.Decimals(nil)
	if err != nil {
		log.Fatal(nil)
	}

	auth, err = bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		log.Fatal(err)
	}
	tx, err = token.Mint(auth, publicKey, big.NewInt(100_000_000))
	if err != nil {
		log.Fatal(err)
	}

	_, err = bind.WaitMined(context.Background(), ethClient, tx)
	if err != nil {
		log.Fatal("Wait mint: ", err)
	}

	balance, err := token.BalanceOf(nil, publicKey)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Token address: ", address)
	log.Println("Symbol:", symbol)
	log.Println("Decimals:", decimals)
	log.Println("Balance L1: ", balance)

	return address
}

func createTokenL2(wallet *accounts.Wallet, client clients.Client, ethClient *ethclient.Client, l1Token common.Address) common.Address {
	tx, err := wallet.Deposit(nil, accounts.DepositTransaction{
		Token:           l1Token,
		Amount:          big.NewInt(30),
		To:              wallet.Address(),
		ApproveERC20:    true,
		RefundRecipient: wallet.Address(),
	})
	if err != nil {
		log.Fatal(err)
	}

	_, err = bind.WaitMined(context.Background(), ethClient, tx)
	if err != nil {
		log.Fatal(err)
	}

	l1Receipt, err := ethClient.TransactionReceipt(context.Background(), tx.Hash())
	if err != nil {
		log.Fatal(err)
	}

	l2Tx, err := client.L2TransactionFromPriorityOp(context.Background(), l1Receipt)
	if err != nil {
		log.Fatal(err)
	}
	_, err = client.WaitMined(context.Background(), l2Tx.Hash)
	if err != nil {
		log.Fatal(err)
	}

	tokenL2Address, err := client.L2TokenAddress(context.Background(), l1Token)
	if err != nil {
		log.Panic(err)
	}

	tokenL2Balance, err := wallet.Balance(context.Background(), tokenL2Address, nil)
	if err != nil {
		log.Panic(err)
	}

	fmt.Println("Balance L2: ", tokenL2Balance)

	return tokenL2Address
}

func main() {
	var (
		PrivateKey        = "7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110"
		ZkSyncEraProvider = "http://127.0.0.1:3050"
		EthereumProvider  = "http://127.0.0.1:8545"
	)

	client, err := clients.Dial(ZkSyncEraProvider)
	if err != nil {
		log.Panic(err)
	}
	defer client.Close()

	ethClient, err := ethclient.Dial(EthereumProvider)
	if err != nil {
		log.Fatal(err)
	}

	privateKey, err := crypto.HexToECDSA(PrivateKey)
	if err != nil {
		log.Fatal(err)
	}

	publicKeyECDSA, ok := privateKey.Public().(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("cannot assert type: publicKey is not of type *ecdsa.PublicKey")
	}
	publicKey := crypto.PubkeyToAddress(*publicKeyECDSA)

	wallet, err := accounts.NewWallet(common.Hex2Bytes(PrivateKey), &client, ethClient)
	if err != nil {
		log.Fatal(err)
	}

	shouldCreateL1Token, shouldCreateL2Token := checkIfTokenNeedsToBeCreated(client, ethClient)
	if shouldCreateL1Token {
		l1TokenAddress := createTokenL1(ethClient, privateKey, publicKey)
		l2TokenAddress := createTokenL2(wallet, client, ethClient, l1TokenAddress)
		writeToken(Token{L1Address: l1TokenAddress.Hex(), L2Address: l2TokenAddress.Hex()})

	} else if !shouldCreateL1Token && shouldCreateL2Token {
		l1TokenAddress := readToken().L1Address
		l2TokenAddress := createTokenL2(wallet, client, ethClient, common.HexToAddress(l1TokenAddress))
		writeToken(Token{L1Address: l1TokenAddress, L2Address: l2TokenAddress.Hex()})
	} else {
		fmt.Println("Token has been already created.")
	}
}
EOF

go mod tidy
go run setup.go
