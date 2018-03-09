pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';

contract MIKETANGOBRAVO18 is MintableToken, BurnableToken {

	string public constant name = "MIKETANGOBRAVO18";
	string public constant symbol = "MTB18";
	uint public constant decimals = 18;

    function() public {}

}