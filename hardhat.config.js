require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    alveychain: {
      url: "https://elves-core1.alvey.io/",
      chainId: 3797,
      accounts: [process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000"],
    },
  },
};
