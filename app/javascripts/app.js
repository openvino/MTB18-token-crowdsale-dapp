import "../stylesheets/app.css";

import { default as Web3 } from 'web3';
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
      document.getElementById("address").innerHTML = account;

      self.supply();
      self.raised();
      self.leftTime();
      self.refreshBalance();
    });
  },

  buy: function() {
    var self = this;

    document.getElementById("buy-spin").style.display = "block";

    MIKETANGOBRAVO18Crowdsale.deployed().then(function(instance) {
      return instance.buyTokens(account, {from: account, value: 100000000000000000});
    }).then(function(result) {
      //self.setStatus("Initiating transaction... (please wait)");
      self.interval(result.receipt);
    }).catch(function(e) {
      console.log(e);
    }).finally(function() {
      document.getElementById("buy-spin").style.display = "none";
    });
  },

  interval: function(receipt, cb) {
    var self = this;

    var refreshId = setInterval(function() {
      if (self.blockMined(receipt)) {
        self.supply();
        self.raised();
        self.leftTime();
        self.refreshBalance();
        document.getElementById("buy-spin").style.display = "none";
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

    document.getElementById("supply-spin").style.display = "block";

    MIKETANGOBRAVO18.deployed().then(function(instance) {
      return instance.totalSupply.call({from: account});
    }).then(function(result) {
      document.getElementById("supply").innerHTML = web3.fromWei(result.toString());
    }).catch(function(e) {
      console.log(e);
    }).finally(function() {
      document.getElementById("supply-spin").style.display = "none";
    });
  },

  raised: function() {
    var self = this;

    document.getElementById("raised-spin").style.display = "block";

    MIKETANGOBRAVO18Crowdsale.deployed().then(function(instance) {
      return instance.weiRaised.call({from: account});
    }).then(function(result) {
      document.getElementById("raised").innerHTML = web3.fromWei(result.toString());
    }).catch(function(e) {
      console.log(e);
    }).finally(function() {
      document.getElementById("raised-spin").style.display = "none";
    });
  },

  burn: function() {
    var self = this;

    document.getElementById("burn-spin").style.display = "block";

    MIKETANGOBRAVO18.deployed().then(function(instance) {
      return instance.burn(web3.toWei(1), {from: account});
    }).then(function(result) {
      document.getElementById("burn-spin").style.display = "none";
      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];
        if (log.event == "Burn") {
          console.log(log.args.burner + " just burned " + web3.fromWei(log.args.value.toString()) + " MTB18 Token")
          break;
        }
      }
      self.supply();
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      //self.setStatus("Error; see log.");
    }).finally(function() {
      document.getElementById("burn-spin").style.display = "none";
    });
  },

  leftTime: function() {
    var self = this;

    document.getElementById("left-spin").style.display = "block";

    MIKETANGOBRAVO18Crowdsale.deployed().then(function(instance) {
      return instance.endTime.call({from: account});
    }).then(function(result) {
      var today = new Date();
      var christmasDay = new Date(result.toString()*1000);
      var diffSec = Date.parse(christmasDay) - Date.parse(today);
      document.getElementById("left").innerHTML = Math.ceil(diffSec / (1000*60*60*24));
    }).catch(function(e) {
      console.log(e);
    }).finally(function() {
      document.getElementById("left-spin").style.display = "none";
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;

    document.getElementById("balance-spin").style.display = "block";

    var mtb18;
    MIKETANGOBRAVO18.deployed().then(function(instance) {
      mtb18 = instance;
      return mtb18.balanceOf.call(account, {from: account});
    }).then(function(value) {
      document.getElementById("balance").innerHTML = web3.fromWei(value.valueOf());
    }).catch(function(e) {
      console.log(e);
    }).finally(function() {
      document.getElementById("balance-spin").style.display = "none";
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
