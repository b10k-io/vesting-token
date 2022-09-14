import { time, mine, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Vesting", () => {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployVestingFixture() {
        const TWENTY_ONE_MILLION_ETHER = ethers.utils.parseEther("21000000")
        const TWENTY_ONE_DAYS_IN_SECS = 21 * 24 * 60 * 60;
        const TWO_POINT_ON_MINUTES_IN_SECS = 21 * 60 / 10;

        const totalSupply = TWENTY_ONE_MILLION_ETHER
        const duration = TWENTY_ONE_DAYS_IN_SECS
        const cliff = TWO_POINT_ON_MINUTES_IN_SECS

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Vesting");
        const token = await Token.deploy(totalSupply, cliff, duration);

        return { token, owner, otherAccount, totalSupply, cliff, duration };
    }

    describe("Deployment", () => {

        it("Should set the right supply", async () => {
            const { token, totalSupply } = await loadFixture(deployVestingFixture);
            expect(await token.totalSupply()).to.equal(totalSupply);
        });

        it("Should set the right vesting period", async () => {
            const { token, duration } = await loadFixture(deployVestingFixture);
            expect(await token.duration()).to.equal(duration);
        });

        it("Should set the right cliff", async () => {
            const { token, cliff } = await loadFixture(deployVestingFixture);
            expect(await token.cliff()).to.equal(cliff);
        });

        it("Should set the right ownership", async () => {
            const { token, owner } = await loadFixture(deployVestingFixture);
            expect(await token.owner()).to.equal(owner.address);
        });

        it("Should own the total supply", async () => {
            const { token, owner, totalSupply } = await loadFixture(deployVestingFixture);
            expect(await token.balanceOf(owner.address)).to.equal(totalSupply);
        });

    })

    describe("Transfers", () => {

        
    })
    
    describe("Schedules", () => {
        
        it("Should create a schedule", async () => {
            const { token, otherAccount, totalSupply } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);
    
            let startTimes;
            [startTimes] = await token.getSchedulesByAddress(otherAccount.address);
            expect(startTimes.length).to.equal(0);
    
            await token.transfer(otherAccount.address, amount);
    
            [startTimes] = await token.getSchedulesByAddress(otherAccount.address)
            expect(startTimes.length).to.equal(1);
        })

        it("Should get schedules by address", async () => {
            const { token, otherAccount, totalSupply } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const tx = await token.transfer(otherAccount.address, amount);
            const receipt = await tx.wait()
            const { timestamp } = await ethers.provider.getBlock(receipt.blockHash)

            const [startTimes] = await token.getSchedulesByAddress(otherAccount.address);
            expect(startTimes[0]).to.equal(timestamp);
        })

        it("Should get schedule by address and index", async () => {
            const { token, otherAccount, totalSupply } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const tx = await token.transfer(otherAccount.address, amount);
            const receipt = await tx.wait()
            const { timestamp } = await ethers.provider.getBlock(receipt.blockHash)

            const [startTime, totalAmount, releasedAmount] = await token.getScheduleByAddressAndIndex(otherAccount.address, 0);
            expect(startTime).to.equal(timestamp);
            expect(totalAmount).to.equal(amount);
            expect(releasedAmount).to.equal(ethers.utils.parseEther("0"));
        })

        it("Should get vested amount by address and index", async () => {
            const { token, otherAccount, totalSupply, cliff, duration } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const tx = await token.transfer(otherAccount.address, amount);
            const receipt = await tx.wait()
            const { timestamp } = await ethers.provider.getBlock(receipt.blockHash)

            const ONE_HALF_TS = timestamp + cliff + (duration / 2)
            await time.setNextBlockTimestamp(ONE_HALF_TS)
            await mine()

            const vestedAmount = amount.div(2)

            expect(await token.getVestedAmountByAddressAndIndex(otherAccount.address, 0)).to.equal(vestedAmount);
        })

        it("Should get releasable amount by address and index", async () => {
            const { token, owner, otherAccount, totalSupply, cliff, duration } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const tx = await token.transfer(otherAccount.address, amount);
            const receipt = await tx.wait()
            const { timestamp } = await ethers.provider.getBlock(receipt.blockHash)

            const releasableAmount = amount.div(4)

            const ONE_FOURTH_TS = timestamp + cliff + (duration / 4)
            await time.setNextBlockTimestamp(ONE_FOURTH_TS)
            await mine()
            expect(await token.getReleasableAmountByAddressAndIndex(otherAccount.address, 0)).to.equal(releasableAmount);
            await token.connect(otherAccount).transfer(owner.address, releasableAmount);

            const ONE_HALF_TS = timestamp + cliff + (duration / 2)
            await time.setNextBlockTimestamp(ONE_HALF_TS)
            await mine()

            expect(await token.getReleasableAmountByAddressAndIndex(otherAccount.address, 0)).to.equal(releasableAmount);
        })

        it("Should get total releasable amount for address", async () => {
            const { token, owner, otherAccount, totalSupply, cliff, duration } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const tx = await token.transfer(otherAccount.address, amount.div(2));
            const receipt = await tx.wait()
            const { timestamp } = await ethers.provider.getBlock(receipt.blockHash)

            const ONE_FOURTH_TS = timestamp + cliff + (duration / 4)
            const ONE_HALF_TS = timestamp + cliff + (duration / 2)
            const THREE_FOURTH_TS = timestamp + cliff + (duration / 3 * 4)

            await time.setNextBlockTimestamp(ONE_FOURTH_TS)
            await mine()

            await token.transfer(otherAccount.address, amount.div(2));

            await time.setNextBlockTimestamp(ONE_HALF_TS)
            await mine()

            let totalVested
            totalVested = await token.getTotalVestedAmountByAddress(otherAccount.address);
            const released = totalVested;

            await token.connect(otherAccount).transfer(owner.address, released);

            await time.setNextBlockTimestamp(THREE_FOURTH_TS);
            await mine()

            totalVested = await token.getTotalVestedAmountByAddress(otherAccount.address);
            const totalReleasable = totalVested.sub(released);

            expect(await token.getTotalReleasableAmountByAddress(otherAccount.address)).to.equal(totalReleasable);
        })

        it("Should revert if amount > total releasable", async () => {

            const { token, owner, otherAccount, totalSupply, cliff, duration } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            await token.transfer(otherAccount.address, amount.div(4));
            await token.transfer(otherAccount.address, amount.div(4));
            await token.transfer(otherAccount.address, amount.div(4));
            await token.transfer(otherAccount.address, amount.div(4));

            await expect(token.connect(otherAccount).transfer(owner.address, amount)).to.be.revertedWith("Vesting: amount if greater than releasable.")
        })

        it("Should get total vested amount for address", async () => {
            const { token, owner, otherAccount, totalSupply, cliff, duration } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const tx = await token.transfer(otherAccount.address, amount.div(2));
            const receipt = await tx.wait()
            const { timestamp } = await ethers.provider.getBlock(receipt.blockHash)

            const ONE_FOURTH_TS = timestamp + cliff + (duration / 4)
            const ONE_HALF_TS = timestamp + cliff + (duration / 2)

            await time.setNextBlockTimestamp(ONE_FOURTH_TS)
            await mine()

            await token.transfer(otherAccount.address, amount.div(2));

            await time.setNextBlockTimestamp(ONE_HALF_TS)
            await mine()

            const vestedAmount0 = await token.getVestedAmountByAddressAndIndex(otherAccount.address, 0);
            const vestedAmount1 = await token.getVestedAmountByAddressAndIndex(otherAccount.address, 1);

            const totalVestedAmount = vestedAmount0.add(vestedAmount1)

            expect(await token.getTotalVestedAmountByAddress(otherAccount.address)).to.equal(totalVestedAmount);
        })

    })
})
