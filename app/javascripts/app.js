import "../stylesheets/app.css";

import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import MIKETANGOBRAVO18_artifacts from '../../build/contracts/MIKETANGOBRAVO18.json'
import MIKETANGOBRAVO18Crowdsale_artifacts from '../../build/contracts/MIKETANGOBRAVO18Crowdsale.json'

var MIKETANGOBRAVO18 = contract(MIKETANGOBRAVO18_artifacts);
var MIKETANGOBRAVO18Crowdsale = contract(MIKETANGOBRAVO18Crowdsale_artifacts);

var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    MIKETANGOBRAVO18.setProvider(web3.currentProvider);
    MIKETANGOBRAVO18Crowdsale.setProvider(web3.currentProvider);

    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshBalance();
    });
  },

  buy: function() {
    var self = this;

    MIKETANGOBRAVO18Crowdsale.deployed().then(function(instance) {
      return instance.buyTokens(account, {from: account, value: 100000000000000000});
    }).then(function(result) {
      self.setStatus("Initiating transaction... (please wait)");
      self.interval(result.receipt);
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error buying coin; see log.");
    });
  },

  interval: function(receipt, cb) {
    var self = this;

    var refreshId = setInterval(function() {
      if (self.blockMined(receipt)) {
        self.refreshBalance();
        self.setStatus("Transaction complete!");
        if (typeof cb !== 'undefined') {
          cb();
        }
        clearInterval(refreshId);
      }
    }, 5000);
  },

  blockMined: function(receipt) {
    return receipt.blockHash || receipt.blockNumber || receipt.transactionIndex;
  },

  supply: function() {
    var self = this;

    MIKETANGOBRAVO18.deployed().then(function(instance) {
      return instance.totalSupply.call({from: account});
    }).then(function(result) {
      self.setStatus(web3.fromWei(result.toString()) + " MTB18 TOKENS");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error; see log.");
    });
  },

  raised: function() {
    var self = this;

    MIKETANGOBRAVO18Crowdsale.deployed().then(function(instance) {
      return instance.weiRaised.call({from: account});
    }).then(function(result) {
      self.setStatus(web3.fromWei(result.toString()) + " ETH");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error; see log.");
    });
  },

  burn: function() {
    var self = this;
    self.setStatus("Initiating transaction... (please wait)");

    MIKETANGOBRAVO18.deployed().then(function(instance) {
      return instance.burn(web3.toWei(1), {from: account});
    }).then(function(result) {
      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];
        if (log.event == "Burn") {
          console.log(log.args.burner + " just burned " + web3.fromWei(log.args.value.toString()) + " MTB18 Token")
          break;
        }
      }
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error; see log.");
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;

    var mtb18;
    MIKETANGOBRAVO18.deployed().then(function(instance) {
      mtb18 = instance;
      return mtb18.balanceOf.call(account, {from: account});
    }).then(function(value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = web3.fromWei(value.valueOf());
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  sendCoin: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var mtb18;
    MIKETANGOBRAVO18.deployed().then(function(instance) {
      mtb18 = instance;
      return mtb18.sendCoin(receiver, amount, {from: account});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MTB18, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Consider using Metamask. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    alert("No web3 detected. Consider using Metamask")
  }

  App.start();
});
