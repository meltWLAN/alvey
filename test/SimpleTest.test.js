const { expect } = require("chai");
const { ethers } = require("./hardhat-ethers-helpers");

describe("SimpleTest", function () {
  let simpleTest;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    const SimpleTest = await ethers.getContractFactory("SimpleTest");
    simpleTest = await SimpleTest.deploy();
  });

  it("Should return the correct greeting", async function () {
    expect(await simpleTest.greeting()).to.equal("Hello, World!");
  });

  it("Should set greeting correctly", async function () {
    await simpleTest.setGreeting("Hello, Alvey!");
    expect(await simpleTest.greeting()).to.equal("Hello, Alvey!");
  });

  it("Should get greeting correctly", async function () {
    await simpleTest.setGreeting("Test Greeting");
    expect(await simpleTest.getGreeting()).to.equal("Test Greeting");
  });
}); 