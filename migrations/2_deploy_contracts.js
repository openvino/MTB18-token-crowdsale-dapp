const fs = require('fs')
const MIKETANGOBRAVO18 = artifacts.require("./MIKETANGOBRAVO18.sol")
const MIKETANGOBRAVO18Crowdsale = artifacts.require("./MIKETANGOBRAVO18Crowdsale.sol")
const crowdsaleParams = JSON.parse(fs.readFileSync('../config/Crowdsale.json', 'utf8'))
const rate = crowdsaleParams.rate
const fundWallet = crowdsaleParams.fundWallet

module.exports = function(deployer, network, accounts) {
	return liveDeploy(deployer, accounts);
};

function latestTime() {
  return web3.eth.getBlock('latest').timestamp;
}

function bigWei(n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'));
}

const duration = {
  seconds: function(val) { return val},
  minutes: function(val) { return val * this.seconds(60) },
  hours:   function(val) { return val * this.minutes(60) },
  days:    function(val) { return val * this.hours(24) },
  weeks:   function(val) { return val * this.days(7) },
  years:   function(val) { return val * this.days(365) }kmn  
};

async function liveDeploy(deployer, accounts) {

	/* Deploy at March 24 - 22PM GMT-3 */

	// Start March 25 - 10AM GMT-3
	const startTime = latestTime() + duration.hours(12);
	// End April 1 - 23:59PM GMT-3
	const endTime = startTime + duration.weeks(1) + duration.hours(14);

	const wallet = accounts[0];
	const totalCapInEthToRaise = web3.toWei(crowdsaleParams.totalCapInEthToRaise, 'ether');
	const totalTokenCapToCreate = bigWei(crowdsaleParams.totalTokenCapToCreate);
	const initialTokenFundBalance = bigWei(crowdsaleParams.initialTokenFundBalance);

	console.log([startTime, endTime, rate, wallet, fundWallet, totalCapInEthToRaise, totalTokenCapToCreate.toPrecision(), initialTokenFundBalance.toPrecision()])

	return deployer.deploy(MIKETANGOBRAVO18Crowdsale, startTime, endTime, rate, wallet, fundWallet, totalCapInEthToRaise, totalTokenCapToCreate, initialTokenFundBalance).then(async () => {
		const instance = await MIKETANGOBRAVO18Crowdsale.deployed();
		const token = await instance.token.call();
		console.log("Token Address", token);
	})
}