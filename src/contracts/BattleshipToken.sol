// This Solidity code was written with the help of Dapp University's free guides.
// Thanks to Dapp University for providing such valuable resources to the community!

pragma solidity ^0.5.0;

import "./ERC721Full.sol";

contract BattleshipToken is ERC721Full  {

    constructor() ERC721Full("Battleship Token", "BATTLESHIP") public {
    }

    function mint(address _to, string memory _tokenURI) public returns(bool) {
       uint _tokenId = totalSupply().add(1);
       _mint(_to, _tokenId);
       _setTokenURI(_tokenId, _tokenURI);
       return true;
    }
}
