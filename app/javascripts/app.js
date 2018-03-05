import "../stylesheets/app.css";
import "../../node_modules/tingle.js/dist/tingle.min.css";

import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'
import tingle from 'tingle.js'

import MIKETANGOBRAVO18_artifacts from '../../build/contracts/MIKETANGOBRAVO18.json'
import MIKETANGOBRAVO18Crowdsale_artifacts from '../../build/contracts/MIKETANGOBRAVO18Crowdsale.json'

var MIKETANGOBRAVO18 = contract(MIKETANGOBRAVO18_artifacts);
var MIKETANGOBRAVO18Crowdsale = contract(MIKETANGOBRAVO18Crowdsale_artifacts);

var accounts;
var account;
var modal;
var ethRate;
var remaining;
var dummyClose;

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
      self.getTicker();
      self.remaining();
    });
  },

  openBuy: function() {
    dummyClose = true;

    modal = new tingle.modal({
      footer: true,
      stickyFooter: false,
      closeMethods: ['overlay', 'button', 'escape'],
      closeLabel: "Close",
      cssClass: ['custom-tingle'],
      onOpen: function() {
      },
      onClose: function() {
      },
      beforeClose: function() {
        if (!dummyClose) {
          App.buy();
        }
        return true;
      }
    });

    modal.setContent("<form oninput='x.value=parseInt(inputRange.value)*parseFloat(rate.value);y.value=inputRange.value'><p>Amount of tokens.</p><div class='selecteurPrix'><div class='prixMin'>1 MTB18</div><div class='range-slider'><input class='input-range' id='inputRange' type='range' value='1' min='1' max='"+remaining+"' step='1'><input id='rate' type='number' value='"+ethRate+"' disabled='disabled' style='display:none'><div class='valeurPrix'><span class='range-value'><output name='y' id='y' for='a'>1</output> MTB18 (~ <output name='x' id='x' for='inputRange rate'>"+ethRate+"</output> ETH)</span></div></div><div class='prixMax'>"+remaining+"</div></div>");
    modal.addFooterBtn('BUY', 'tingle-buy-button', function() {
      dummyClose = false;
      modal.close();
    });
    modal.open();
  },

  buy: function() {
    var self = this;

    document.getElementById("buy-spin").style.display = "block";

    MIKETANGOBRAVO18Crowdsale.deployed().then(function(instance) {
      return instance.buyTokens(account, {from: account, value: web3.toWei(parseFloat(document.getElementById("x").value))});
    }).then(function(result) {
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
  },

  getTicker: function() {
    var self = this;

    fetch("https://api.coinmarketcap.com/v1/ticker/ethereum/")
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error('Something went wrong on api server!');
        }
      })
      .then(response => {
        self.rate(response[0]);
      }).catch(error => {
        console.error(error);
      });
  },

  rate: function(ticker) {
    var self = this;

    MIKETANGOBRAVO18Crowdsale.deployed().then(function(instance) {
      return instance.rate.call();
    }).then(function(result) {
      var result = result.valueOf();
      ethRate = self.truncate(1 / result, 5);
      document.getElementById("ticker").innerHTML = "1 MTB18 will cost <br>" + ethRate + " ETH (~ " + self.truncate(ticker.price_usd / result, 2) + " usd)";
    }).catch(function(e) {
      console.log(e);
    });
  },

  truncate: function(num, places) {
    return Math.trunc(num * Math.pow(10, places)) / Math.pow(10, places);
  },

  remaining: function() {
    var self = this;

    MIKETANGOBRAVO18Crowdsale.deployed().then(function(instance) {
      return instance.remaining.call();
    }).then(function(result) {
      remaining = web3.fromWei(result).toNumber();
    }).catch(function(e) {
      console.log(e);
    });
  },

};

window.addEventListener('load', function() {
  if (typeof web3 !== 'undefined' && web3.currentProvider != null) {
    window.web3 = new Web3(web3.currentProvider);
    web3.version.getNetwork((err, netId) => {
      switch (netId) {
        case "3":
          document.getElementById("web3").style.display = "block";
          break
        default:
          document.getElementById("ropsten").style.display = "block";
      }
    })
  } else {
    document.getElementById("metamask").style.display = "block";
  }

  App.start();
});
