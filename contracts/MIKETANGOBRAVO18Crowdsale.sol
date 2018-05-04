pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import './MIKETANGOBRAVO18.sol';

contract MIKETANGOBRAVO18Crowdsale is CappedCrowdsale, FinalizableCrowdsale, Pausable {

  uint256 public rate;
  uint256 public totalTokenCapToCreate;
  address public fundWallet;

  function MIKETANGOBRAVO18Crowdsale (
  	uint256 _startTime,
  	uint256 _endTime,
  	uint256 _rate,
    address _fundWallet,
    uint256 _totalCapInEthToRaise,
    uint256 _totalTokenCapToCreate,
    uint256 _initialTokenFundBalance
  	) public
    Crowdsale(_startTime, _endTime, _rate, _fundWallet)
    CappedCrowdsale(_totalCapInEthToRaise)
    FinalizableCrowdsale() {
      rate = _rate;
      fundWallet = _fundWallet;
      totalTokenCapToCreate = _totalTokenCapToCreate;
      token.mint(fundWallet, _initialTokenFundBalance);
    }

  function createTokenContract() internal returns (MintableToken) {
    return new MIKETANGOBRAVO18();
  }

  // overriding CappedCrowdsale#validPurchase
  // @return true if investors can buy at the moment
  function validPurchase() internal view returns (bool) {
    bool withinTokenCap = token.totalSupply().add(msg.value.mul(rate)) <= totalTokenCapToCreate;
    bool nonZeroPurchase = msg.value != 0;
    return super.validPurchase() && withinTokenCap && nonZeroPurchase;
  }

  // overriding CappedCrowdsale#hasEnded
  // @return true if crowdsale event has ended
  function hasEnded() public view returns (bool) {
    uint256 threshold = totalTokenCapToCreate.div(100).mul(99);
    bool thresholdReached = token.totalSupply() >= threshold;
    return super.hasEnded() || thresholdReached;
  }

  // overriding FinalizableCrowdsale#finalization
  // - To store remaining MTB18 tokens.
  function finalization() internal {
    uint256 remaining = totalTokenCapToCreate.sub(token.totalSupply());

    if (remaining > 0) {
      token.mint(fundWallet, remaining);
    }

    // change Token owner to fundWallet Fund.
    token.transferOwnership(fundWallet);

    super.finalization();
  }

  function remaining() public returns (uint256) {
    return totalTokenCapToCreate.sub(token.totalSupply());
  }

  // overriding Crowdsale#buyTokens
  function buyTokens(address beneficiary) public payable {
    require(!paused);
    require(beneficiary != address(0));
    require(validPurchase());

    uint256 weiAmount = msg.value;

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(rate);

    // update state
    weiRaised = weiRaised.add(weiAmount);

    token.mint(beneficiary, tokens);
    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

    forwardFunds();
  }

}