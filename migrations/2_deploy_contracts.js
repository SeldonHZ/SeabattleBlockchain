const BattleshipToken = artifacts.require("BattleshipToken");

module.exports = function(deployer) {
  deployer.deploy(BattleshipToken);
};
