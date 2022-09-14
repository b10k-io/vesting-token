import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
import "hardhat-docgen";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
};

export default config;
