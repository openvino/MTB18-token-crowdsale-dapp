# MTB18 Crowdsale

Creation of the world's first wine-backed cryptoasset.

Would you like to know more about the project? [OpenVino Wiki](http://wiki.costaflores.com:8090)

## Getting Started

To run and interact with the contract.

```
$ npm install
$ truffle compile
$ truffle migrate --reset --network ropsten
```

### Prerequisites

We have to install ganache and web3 packages through npm. We will also install solc which is used to compile the contract.

```
$ sudo apt-get update
$ curl -sL https://deb.nodesource.com/setup_7.x -o nodesource_setup.sh
$ sudo bash nodesource_setup.sh
$ sudo apt-get install nodejs
npm install -g ganache-cli web3@0.20.1 solc
```

Geth is an Ethereum client which is written in the Go programming language. This software is used to download the blockchain and connect to the Ethereum network.

```
$ sudo apt-get install software-properties-common
$ sudo add-apt-repository -y ppa:ethereum/ethereum
$ sudo apt-get update
$ sudo apt-get install ethereum
$ geth --testnet --syncmode fast --rpc --rpcapi db,eth,net,web3,personal --cache=1024 --rpcport 8545 --rpcaddr 127.0.0.1 --rpccorsdomain "*" --bootnodes "enode://20c9ad97c081d63397d7b685a412227a40e23c8bdc6688c6f37e97cfbc22d2b4d1db1510d8f61e6a8866ad7f0e17c02b14182d37ea7c3c8b9c2683aeb6b733a1@52.169.14.227:30303,enode://6ce05930c72abc632c58e2e4324f7c7ea478cec0ed4fa2528982cf34483094e9cbc9216e7aa349691242576d552a2a56aaeae426c5303ded677ce455ba1acd9d@13.84.180.240:30303"
```

With geth running, let's install Truffle. Truffle is a development framework which makes building and managing your dapp very easy.

```
$ npm install -g truffle
```

## Authors

* **Federico J Elgarte** - [Shuffledex](https://github.com/Shuffledex)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
