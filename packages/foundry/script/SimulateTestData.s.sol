// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "forge-std/StdUtils.sol";
import "../contracts/TaskToken.sol";
import "../contracts/DisputeResolver.sol";
import "../contracts/task/FixedPaymentTask.sol";
import "../contracts/task/BiddingTask.sol";
import "../contracts/task/MilestonePaymentTask.sol";
import "../contracts/UserInfoNFT.sol";

/**
 * @notice Script to create test data and simulate transactions after contracts are deployed
 * @dev This script should be run after DeployYourContract.s.sol to create test data
 */
contract SimulateTestData is Script {
    TaskToken public taskToken;
    DisputeResolver public disputeResolver;
    SoulboundUserNFT public userInfo;
    FixedPaymentTask public fixedPaymentTask;
    BiddingTask public biddingTask;
    MilestonePaymentTask public milestonePaymentTask;

    // Test accounts - using actual addresses from local testnet
    uint256 public constant worker1PrivateKey = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
    address public constant worker1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;

    uint256 public constant worker2PrivateKey = 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a;
    address public constant worker2 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;

    uint256 public constant worker3PrivateKey = 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6;
    address public constant worker3 = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;

    uint256 public constant admin1PrivateKey = 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a;
    address public constant admin1 = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;

    uint256 public constant admin2PrivateKey = 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba;
    address public constant admin2 = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;

    uint256 public constant admin3PrivateKey = 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e;
    address public constant admin3 = 0x976EA74026E726554dB657fA54763abd0C3a0aa9;

    uint256 public constant client1PrivateKey = 0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356;
    address public constant client1 = 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955;

    uint256 public constant client2PrivateKey = 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97;
    address public constant client2 = 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f;

    uint256 public constant freelancer1PrivateKey = 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6;
    address public constant freelancer1 = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;

    uint256 public constant freelancer2PrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    address public constant freelancer2 = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    // Contract addresses - update these with actual deployed addresses
    address public constant TASK_TOKEN_ADDRESS = 0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35;
    address public constant DISPUTE_RESOLVER_ADDRESS = 0xA15BB66138824a1c7167f5E85b957d04Dd34E468;
    address public constant USER_INFO_ADDRESS = 0xb19b36b1456E65E3A6D514D3F715f204BD59f431;
    address public constant FIXED_PAYMENT_TASK_ADDRESS = 0x8ce361602B935680E8DeC218b820ff5056BeB7af;
    address public constant BIDDING_TASK_ADDRESS = 0xe1Aa25618fA0c7A1CFDab5d6B456af611873b629;
    address public constant MILESTONE_PAYMENT_TASK_ADDRESS = 0xe1DA8919f262Ee86f9BE05059C9280142CF23f48;

    /**
     * @dev Create test data after contracts are deployed
     */
    function run() external {
        // Load deployed contracts
        _loadContracts();

        // Create test data
        _createTestData();

        console.log("Test data creation completed!");
    }

    function _loadContracts() internal {
        taskToken = TaskToken(TASK_TOKEN_ADDRESS);
        disputeResolver = DisputeResolver(DISPUTE_RESOLVER_ADDRESS);
        userInfo = SoulboundUserNFT(USER_INFO_ADDRESS);
        fixedPaymentTask = FixedPaymentTask(FIXED_PAYMENT_TASK_ADDRESS);
        biddingTask = BiddingTask(BIDDING_TASK_ADDRESS);
        milestonePaymentTask = MilestonePaymentTask(MILESTONE_PAYMENT_TASK_ADDRESS);
    }

    function _createTestData() internal {
        console.log("Creating test data...");

        // Mint some tokens to test accounts
        // 使用TaskToken合约的水龙头功能来铸造代币
        vm.startBroadcast(freelancer2PrivateKey);
        taskToken.faucetMint();
        vm.stopBroadcast();

        vm.startBroadcast(worker1PrivateKey);
        taskToken.faucetMint();
        vm.stopBroadcast();

        vm.startBroadcast(worker2PrivateKey);
        taskToken.faucetMint();
        vm.stopBroadcast();

        vm.startBroadcast(worker3PrivateKey);
        taskToken.faucetMint();
        vm.stopBroadcast();

        vm.startBroadcast(admin1PrivateKey);
        taskToken.faucetMint();
        vm.stopBroadcast();

        vm.startBroadcast(admin2PrivateKey);
        taskToken.faucetMint();
        vm.stopBroadcast();

        vm.startBroadcast(admin3PrivateKey);
        taskToken.faucetMint();
        vm.stopBroadcast();

        // Set up user info for test accounts
        // Worker 1 profile
        vm.startBroadcast(worker1PrivateKey);
        string[] memory skills1 = new string[](3);
        skills1[0] = "Solidity";
        skills1[1] = "Smart Contracts";
        skills1[2] = "Web3";
        userInfo.updateUserProfile("Experienced developer", "https://example.com/worker1", skills1);
        vm.stopBroadcast();

        // Worker 2 profile
        vm.startBroadcast(worker2PrivateKey);
        string[] memory skills2 = new string[](2);
        skills2[0] = "React";
        skills2[1] = "TypeScript";
        userInfo.updateUserProfile("Frontend specialist", "https://example.com/worker2", skills2);
        vm.stopBroadcast();

        // Worker 3 profile
        vm.startBroadcast(worker3PrivateKey);
        string[] memory skills3 = new string[](2);
        skills3[0] = "Node.js";
        skills3[1] = "MongoDB";
        userInfo.updateUserProfile("Backend engineer", "https://example.com/worker3", skills3);
        vm.stopBroadcast();

        // Client 1 profile
        vm.startBroadcast(client1PrivateKey);
        string[] memory skills4 = new string[](1);
        skills4[0] = "Project Management";
        userInfo.updateUserProfile("Project manager", "https://example.com/client1", skills4);
        vm.stopBroadcast();

        // Client 2 profile
        vm.startBroadcast(client2PrivateKey);
        string[] memory skills5 = new string[](2);
        skills5[0] = "Agile";
        skills5[1] = "Scrum";
        userInfo.updateUserProfile("Product owner", "https://example.com/client2", skills5);
        vm.stopBroadcast();

        // Freelancer 1 profile
        vm.startBroadcast(freelancer1PrivateKey);
        string[] memory skills6 = new string[](4);
        skills6[0] = "JavaScript";
        skills6[1] = "Python";
        skills6[2] = "React";
        skills6[3] = "Node.js";
        userInfo.updateUserProfile("Full Stack Developer", "https://example.com/freelancer1", skills6);
        vm.stopBroadcast();

        // Freelancer 2 profile
        vm.startBroadcast(freelancer2PrivateKey);
        string[] memory skills7 = new string[](3);
        skills7[0] = "Solidity";
        skills7[1] = "Security Audit";
        skills7[2] = "Formal Verification";
        userInfo.updateUserProfile("Smart Contract Auditor", "https://example.com/freelancer2", skills7);
        vm.stopBroadcast();

        // Admins are now determined by their NFT grade (顶级游民)

        // No need to restart broadcasting here as we're immediately going to create tasks
        // Create fixed payment tasks
        _createFixedPaymentTasks();

        // Create bidding tasks
        _createBiddingTasks();

        // Create milestone payment tasks
        _createMilestonePaymentTasks();

        // Create disputes
        _createDisputes();
    }

    /**
     * @dev Approve all contracts for a given user
     */
    function _approveContracts(uint256 privateKey) internal {
        vm.startBroadcast(privateKey);
        taskToken.approve(address(fixedPaymentTask), type(uint256).max);
        taskToken.approve(address(biddingTask), type(uint256).max);
        taskToken.approve(address(milestonePaymentTask), type(uint256).max);
        taskToken.approve(address(disputeResolver), type(uint256).max);
        vm.stopBroadcast();
    }

    /**
     * @dev Approve dispute resolver for admins
     */
    function _approveDisputeResolver(uint256 privateKey) internal {
        vm.startBroadcast(privateKey);
        taskToken.approve(address(disputeResolver), type(uint256).max);
        vm.stopBroadcast();
    }

    function _createFixedPaymentTasks() internal {
        console.log("Creating fixed payment tasks...");

        // Approve contracts to spend tokens
        vm.startBroadcast(freelancer2PrivateKey);
        taskToken.approve(address(fixedPaymentTask), type(uint256).max);

        // Create a simple fixed payment task - using freelancer2 account
        fixedPaymentTask.createTask("Simple Task", "This is a simple fixed payment task", block.timestamp + 30 days);

        uint256 taskId1 = fixedPaymentTask.taskCounter();
        console.log("Created fixed payment task with ID:", taskId1);

        // Add a worker to the task
        fixedPaymentTask.addWorker(taskId1, worker1, 100 * 10 ** 18);
        console.log("Added worker to fixed payment task");
        vm.stopBroadcast();

        // Stop broadcasting to allow worker to submit proof of work
        vm.startBroadcast(worker1PrivateKey);
        fixedPaymentTask.submitProofOfWork(taskId1, "Completed the simple task");
        vm.stopBroadcast();
        console.log("Submitted proof of work for fixed payment task");

        console.log("Task is in progress, proceeding to approve proof of work");

        // Approve the proof of work
        vm.startBroadcast(freelancer2PrivateKey);
        fixedPaymentTask.approveProofOfWork(taskId1);
        vm.stopBroadcast();
        console.log("Approved proof of work for fixed payment task");

        // Stop broadcasting to allow worker to pay the task
        vm.startBroadcast(worker1PrivateKey);
        // Pay the task
        fixedPaymentTask.payTask(taskId1);
        vm.stopBroadcast();
        console.log("Paid fixed payment task");
    }

    function _createBiddingTasks() internal {
        console.log("Creating bidding tasks...");

        // Approve contracts to spend tokens
        vm.startBroadcast(freelancer2PrivateKey);
        taskToken.approve(address(biddingTask), type(uint256).max);

        // Create a bidding task - using freelancer2 account
        biddingTask.createTask("Bidding Task", "This is a task with bidding", block.timestamp + 30 days);
        vm.stopBroadcast();
        uint256 taskId1 = biddingTask.taskCounter();
        console.log("Created bidding task with ID:", taskId1);

        // Stop broadcasting to allow workers to submit bids
        vm.startBroadcast(worker1PrivateKey);
        biddingTask.submitBid(taskId1, 80 * 10 ** 18, "I can do this for 80 tokens", 5 days);
        vm.stopBroadcast();

        vm.startBroadcast(worker2PrivateKey);
        biddingTask.submitBid(taskId1, 90 * 10 ** 18, "I can do this for 90 tokens", 7 days);
        vm.stopBroadcast();

        // Restart broadcasting
        vm.startBroadcast(freelancer2PrivateKey);
        console.log("Submitted bids for bidding task");

        // Accept a worker
        biddingTask.acceptBid(taskId1, 0);
        console.log("Accepted worker for bidding task");
        // Stop broadcasting to allow worker to submit proof
        vm.stopBroadcast();

        vm.startBroadcast(worker1PrivateKey);
        // Submit proof of work
        biddingTask.submitProofOfWork(taskId1, "Completed the bidding task");
        vm.stopBroadcast();
        console.log("Submitted proof of work for bidding task");

        // Approve the proof of work
        vm.startBroadcast(freelancer2PrivateKey);
        biddingTask.approveProofOfWork(taskId1);
        vm.stopBroadcast();
        console.log("Approved proof of work for bidding task");

        // Stop broadcasting to allow worker to pay the task
        vm.startBroadcast(worker1PrivateKey);
        // Pay the task
        biddingTask.payTask(taskId1);
        vm.stopBroadcast();
        console.log("Paid bidding task");
    }

    function _createMilestonePaymentTasks() internal {
        console.log("Creating milestone payment tasks...");

        // Approve contracts to spend tokens
        vm.startBroadcast(freelancer2PrivateKey);
        taskToken.approve(address(milestonePaymentTask), type(uint256).max);
        // Create a milestone payment task - using freelancer2 account
        milestonePaymentTask.createTask("Milestone Task", "This is a task with milestones", block.timestamp + 60 days);

        uint256 taskId1 = milestonePaymentTask.taskCounter();
        console.log("Created milestone payment task with ID:", taskId1);

        // Add milestones - using freelancer2 account
        milestonePaymentTask.addMilestone(taskId1, "First milestone", 50 * 10 ** 18);
        milestonePaymentTask.addMilestone(taskId1, "Second milestone", 70 * 10 ** 18);
        milestonePaymentTask.addMilestone(taskId1, "Final milestone", 80 * 10 ** 18);
        console.log("Added milestones");

        // Add worker
        milestonePaymentTask.addWorker(taskId1, worker2);
        vm.stopBroadcast();
        console.log("Added worker to milestone payment task");

        // Submit and process each milestone
        for (uint256 i = 0; i < 3; i++) {
            // Start broadcasting for worker2
            vm.startBroadcast(worker2PrivateKey);

            // Submit proof for milestone
            milestonePaymentTask.submitMilestoneProofOfWork(
                taskId1, i, string.concat("Completed milestone ", vm.toString(i))
            );
            vm.stopBroadcast();
            console.log("Submitted proof of work for milestone:", i);

            // Start broadcasting for freelancer2
            vm.startBroadcast(freelancer2PrivateKey);

            // Approve milestone
            milestonePaymentTask.approveMilestone(taskId1, i);
            console.log("Approved milestone:", i);

            // Stop broadcasting to allow worker to pay for milestone
            vm.stopBroadcast();
            vm.startBroadcast(worker2PrivateKey);

            // Pay for milestone
            milestonePaymentTask.payMilestone(taskId1, i);
            vm.stopBroadcast();
            console.log("Paid for milestone:", i);
        }

        // Finalize task after all milestones completed
        // milestonePaymentTask.finalizeTask(taskId1);
        console.log("Finalized milestone payment task");
    }

    function _createDisputes() internal {
        console.log("Creating disputes...");

        // Create a fixed payment task with dispute - using freelancer2 account
        vm.startBroadcast(freelancer2PrivateKey);
        taskToken.approve(address(fixedPaymentTask), type(uint256).max);
        fixedPaymentTask.createTask(
            "Disputed Fixed Payment Task", "This task will have a dispute", block.timestamp + 30 days
        );
        uint256 taskId1 = fixedPaymentTask.taskCounter();
        console.log("Created fixed payment task for dispute with ID:", taskId1);

        // Add a worker to the task
        fixedPaymentTask.addWorker(taskId1, worker3, 150 * 10 ** 18);

        // Stop broadcasting to allow worker to submit proof
        // Submit proof of work
        vm.stopBroadcast();
        vm.startBroadcast(worker3PrivateKey);
        fixedPaymentTask.submitProofOfWork(taskId1, "Completed the disputed task");
        vm.stopBroadcast();
        console.log("Submitted proof of work for dispute task");

        // Now have the task creator terminate the task to create a dispute
        vm.startBroadcast(freelancer2PrivateKey);
        // Approve dispute processing fee
        uint256 processingReward = (150 * 10 ** 18 * disputeResolver.getDisputeProcessingRewardBps()) / 10000;
        taskToken.approve(address(fixedPaymentTask), processingReward);
        console.log("Approved dispute processing fee:", processingReward);

        // Terminate task to create dispute
        fixedPaymentTask.terminateTask(taskId1);
        uint256 fixedPaymentTaskDisputeId = disputeResolver.disputeCounter() - 1;
        vm.stopBroadcast();
        console.log("Terminated task to create dispute with ID:", fixedPaymentTaskDisputeId);

        // Create a milestone task with dispute - using freelancer2 account
        vm.startBroadcast(freelancer2PrivateKey);
        taskToken.approve(address(milestonePaymentTask), type(uint256).max);
        milestonePaymentTask.createTask(
            "Disputed Milestone Task", "This milestone task will have a dispute", block.timestamp + 60 days
        );
        uint256 taskId2 = milestonePaymentTask.taskCounter();
        console.log("Created milestone payment task for dispute with ID:", taskId2);

        // Add milestones
        milestonePaymentTask.addMilestone(taskId2, "Disputed milestone", 100 * 10 ** 18);

        milestonePaymentTask.addMilestone(taskId2, "Second milestone", 150 * 10 ** 18);
        console.log("Added milestones to disputed milestone task");

        // Add worker
        milestonePaymentTask.addWorker(taskId2, worker3);
        vm.stopBroadcast();
        console.log("Added worker to disputed milestone task");

        // Stop broadcasting to allow worker to submit proof
        vm.startBroadcast(worker3PrivateKey);
        // Submit proof for first milestone
        milestonePaymentTask.submitMilestoneProofOfWork(taskId2, 0, "Completed disputed milestone");
        vm.stopBroadcast();
        console.log("Submitted proof of work for disputed milestone");

        // Now have the task creator terminate the task to create a dispute
        vm.startBroadcast(freelancer2PrivateKey);
        // Approve dispute processing fee
        uint256 processingReward2 = (100 * 10 ** 18 * disputeResolver.getDisputeProcessingRewardBps()) / 10000;
        taskToken.approve(address(milestonePaymentTask), processingReward2);
        console.log("Approved dispute processing fee for milestone task:", processingReward2);

        // Terminate task to create dispute
        milestonePaymentTask.terminateTask(taskId2);
        uint256 milestoneTaskDisputeId = disputeResolver.disputeCounter() - 1;
        vm.stopBroadcast();
        console.log("Terminated milestone task to create dispute with ID:", milestoneTaskDisputeId);

        // Stop broadcasting to allow admins to vote on dispute
        vm.startBroadcast(admin1PrivateKey);
        // Vote on the milestone task dispute
        disputeResolver.voteOnDispute(milestoneTaskDisputeId, 100 * 10 ** 18);
        vm.stopBroadcast();

        vm.startBroadcast(admin2PrivateKey);
        disputeResolver.voteOnDispute(milestoneTaskDisputeId, 100 * 10 ** 18);
        vm.stopBroadcast();

        vm.startBroadcast(admin3PrivateKey);
        disputeResolver.voteOnDispute(milestoneTaskDisputeId, 0);
        vm.stopBroadcast();

        // Process votes to resolve the dispute
        vm.startBroadcast(freelancer2PrivateKey);
        disputeResolver.processVotes(milestoneTaskDisputeId);
        vm.stopBroadcast();

        console.log("Admins have voted on the dispute and dispute is processed");
    }
}
