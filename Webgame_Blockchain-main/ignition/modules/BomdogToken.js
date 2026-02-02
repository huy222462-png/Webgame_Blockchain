const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BomdogTokenModule", (m) => {
  const initialSupply = m.getParameter("initialSupply", "10000000000000000000000000"); // 10M tokens with 18 decimals

  const bomdogToken = m.contract("BomdogToken", [initialSupply]);

  return { bomdogToken };
});
