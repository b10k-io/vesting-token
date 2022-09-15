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
        const TWENTY_ONE_SECS = 21;

        const totalSupply = TWENTY_ONE_MILLION_ETHER
        const defaultDuration = TWENTY_ONE_DAYS_IN_SECS
        const defaultCliff = TWENTY_ONE_SECS

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Vesting");
        const token = await Token.deploy(totalSupply, defaultCliff, defaultDuration);

        return { token, owner, otherAccount, thirdAccount, totalSupply, defaultCliff, defaultDuration };
    }

    describe("Deployment", () => {

        it("Should set the right supply", async () => {
            const { token, totalSupply } = await loadFixture(deployVestingFixture);
            expect(await token.totalSupply()).to.equal(totalSupply);
        });

        it("Should set the right vesting period", async () => {
            const { token, defaultDuration } = await loadFixture(deployVestingFixture);
            expect(await token.defaultDuration()).to.equal(defaultDuration);
        });

        it("Should set the right cliff", async () => {
            const { token, defaultCliff } = await loadFixture(deployVestingFixture);
            expect(await token.defaultCliff()).to.equal(defaultCliff);
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
            const { token, otherAccount, totalSupply, defaultCliff, defaultDuration } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const tx = await token.transfer(otherAccount.address, amount);
            const receipt = await tx.wait()
            const { timestamp } = await ethers.provider.getBlock(receipt.blockHash)

            const [startTime, cliff, duration, totalAmount, releasedAmount] = await token.getScheduleByAddressAndIndex(otherAccount.address, 0);
            expect(startTime).to.equal(timestamp);
            expect(cliff).to.equal(defaultCliff);
            expect(duration).to.equal(defaultDuration);
            expect(totalAmount).to.equal(amount);
            expect(releasedAmount).to.equal(ethers.utils.parseEther("0"));
        })

        it("Should get vested amount by address and index", async () => {
            const { token, otherAccount, totalSupply, defaultCliff, defaultDuration } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const tx = await token.transfer(otherAccount.address, amount);
            const receipt = await tx.wait()
            const { timestamp } = await ethers.provider.getBlock(receipt.blockHash)

            const ONE_HALF_TS = timestamp + defaultCliff + (defaultDuration / 2)
            await time.setNextBlockTimestamp(ONE_HALF_TS)
            await mine()

            const vestedAmount = amount.div(2)

            expect(await token.getVestedAmountByAddressAndIndex(otherAccount.address, 0)).to.equal(vestedAmount);
        })

        it("Should get releasable amount by address and index", async () => {
            const { token, owner, otherAccount, totalSupply, defaultCliff, defaultDuration } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const tx = await token.transfer(otherAccount.address, amount);
            const receipt = await tx.wait()
            const { timestamp } = await ethers.provider.getBlock(receipt.blockHash)

            const releasableAmount = amount.div(4)

            const ONE_FOURTH_TS = timestamp + defaultCliff + (defaultDuration / 4)
            await time.setNextBlockTimestamp(ONE_FOURTH_TS)
            await mine()
            expect(await token.getReleasableAmountByAddressAndIndex(otherAccount.address, 0)).to.equal(releasableAmount);
            await token.connect(otherAccount).transfer(owner.address, releasableAmount);

            const ONE_HALF_TS = timestamp + defaultCliff + (defaultDuration / 2)
            await time.setNextBlockTimestamp(ONE_HALF_TS)
            await mine()

            expect(await token.getReleasableAmountByAddressAndIndex(otherAccount.address, 0)).to.equal(releasableAmount);
        })

        it("Should get total releasable amount for address", async () => {
            const { token, owner, otherAccount, totalSupply, defaultCliff, defaultDuration } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const tx = await token.transfer(otherAccount.address, amount.div(2));
            const receipt = await tx.wait()
            const { timestamp } = await ethers.provider.getBlock(receipt.blockHash)

            const ONE_FOURTH_TS = timestamp + defaultCliff + (defaultDuration / 4)
            const ONE_HALF_TS = timestamp + defaultCliff + (defaultDuration / 2)
            const THREE_FOURTH_TS = timestamp + defaultCliff + (defaultDuration / 3 * 4)

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

            const { token, owner, otherAccount, totalSupply } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            await token.transfer(otherAccount.address, amount.div(4));
            await token.transfer(otherAccount.address, amount.div(4));
            await token.transfer(otherAccount.address, amount.div(4));
            await token.transfer(otherAccount.address, amount.div(4));

            await expect(token.connect(otherAccount).transfer(owner.address, amount)).to.be.revertedWith("Vesting: amount if greater than releasable.")
        })

        it("Should get total vested amount for address", async () => {
            const { token, otherAccount, totalSupply, defaultCliff, defaultDuration } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const tx = await token.transfer(otherAccount.address, amount.div(2));
            const receipt = await tx.wait()
            const { timestamp } = await ethers.provider.getBlock(receipt.blockHash)

            const ONE_FOURTH_TS = timestamp + defaultCliff + (defaultDuration / 4)
            const ONE_HALF_TS = timestamp + defaultCliff + (defaultDuration / 2)

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

    describe("Custom Schedule", () => {

        it("Should revert if non owner calls createCustomSchedule", async () => {
            const { token, otherAccount, thirdAccount, totalSupply } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const cliff = 21 * 24 * 60 * 60 * 2;
            const duration = 21 * 60 / 10 * 2;

            await expect(token.connect(otherAccount).createCustomSchedule(thirdAccount.address, cliff, duration, amount)).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Should revert if cliff less than defaultCliff", async () => {
            const { token, otherAccount, totalSupply } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const cliff = 10
            const duration = 21 * 24 * 60 * 60 * 2

            await expect(token.createCustomSchedule(otherAccount.address, cliff, duration, amount)).to.be.revertedWith("Schedule: cliff less than defaultCliff.");
        })

        it("Should revert if duration less than defaultDuration", async () => {
            const { token, otherAccount, totalSupply } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const cliff = 30
            const duration = 21 * 24 * 60 * 60 / 2

            await expect(token.createCustomSchedule(otherAccount.address, cliff, duration, amount)).to.be.revertedWith("Schedule: duration less than defaultDuration.");
        })

        it("Should create a custom schedule", async () => {
            const { token, otherAccount, totalSupply } = await loadFixture(deployVestingFixture);
            const amount = totalSupply.div(100);

            const expCliff = 21 * 60
            const expDuration = 210 * 24 * 60 * 60

            await expect(token.getScheduleByAddressAndIndex(otherAccount.address, 0)).to.be.reverted
            
            await token.createCustomSchedule(otherAccount.address, expCliff, expDuration, amount)

            const [startTime, cliff, duration, totalAmount, releasedAmount] = await token.getScheduleByAddressAndIndex(otherAccount.address, 0)

            expect(cliff).to.equal(expCliff)
            expect(duration).to.equal(expDuration)

            expect(await token.balanceOf(otherAccount.address)).to.equal(amount)

        })



    })
})
