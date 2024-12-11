const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const StakingToken = await ethers.getContractFactory("StakingToken");
    const stakingToken = await StakingToken.deploy("Staking Token", "STK");

    const RewardToken = await ethers.getContractFactory("RewardToken");
    const rewardToken = await RewardToken.deploy("Reward Token", "RTK");

    const StakingDapp = await ethers.getContractFactory("StakingDapp");
    const stakingDapp = await StakingDapp.deploy(await stakingToken.getAddress(), await rewardToken.getAddress());

    console.log("Contracts deployed:");
    console.log("Staking Token:", await stakingToken.getAddress());
    console.log("Reward Token:", await rewardToken.getAddress());
    console.log("Staking Dapp:", await stakingDapp.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
