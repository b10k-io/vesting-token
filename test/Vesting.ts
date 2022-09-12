import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Vesting", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployVestingFixture() {
        const TWENTY_ONE_MILLION_ETHER = ethers.utils.parseEther("21000000")
        const TWENTY_ONE_DAYS_IN_SECS = 21 * 24 * 60 * 60;

        const totalSupply = TWENTY_ONE_MILLION_ETHER
        const duration = TWENTY_ONE_DAYS_IN_SECS

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Vesting");
        const token = await Token.deploy(totalSupply, duration);

        return { token, owner, otherAccount, totalSupply, duration };
    }

    describe("Deployment", function () {

        it("Should set the right supply", async function () {
            const { token, totalSupply } = await loadFixture(deployVestingFixture);
            expect(await token.totalSupply()).to.equal(totalSupply);
        });

        it("Should set the right vesting period", async function () {
            const { token, duration } = await loadFixture(deployVestingFixture);
            expect(await token.duration()).to.equal(duration);
        });

        it("Should set the ownership", async function () {
            const { token, owner } = await loadFixture(deployVestingFixture);
            expect(await token.owner()).to.equal(owner.address);
        });

    })
})
