# Crowdfund Project

## Setup

See [README-Setup.md](./README-Setup.md)

## Technical Spec

<!-- Here is the list the technical requirements of the project. We include them here by default for your first project, but for future projects we encourage you to develop a healthy habit of thinking + writing out the project specs in your README. You may find you come up with additional specifications, in which case you should add them here.

The goal here is to help you think through the possible edge cases of all your contracts -->

## Code Coverage Report
---------------------|----------|----------|----------|----------|----------------|
File                 |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
---------------------|----------|----------|----------|----------|----------------|
 contracts/          |    96.77 |    79.63 |    93.33 |       94 |                |
  Project.sol        |    96.15 |    79.63 |    92.86 |    93.33 |    129,139,204 |
  ProjectFactory.sol |      100 |      100 |      100 |      100 |                |
---------------------|----------|----------|----------|----------|----------------|
All files            |    96.77 |    79.63 |    93.33 |       94 |                |
---------------------|----------|----------|----------|----------|----------------|


## Design Exercise Answer


<!-- Answer the Design Exercise. -->
<!-- In your answer: (1) Consider the tradeoffs of your design, and (2) provide some pseudocode, or a diagram, to illustrate how one would get started. -->

> Smart contracts have a hard limit of 24kb. Crowdfundr hands out an NFT to everyone who contributes. However, consider how Kickstarter has multiple contribution tiers. How would you design your contract to support this, without creating three separate NFT contracts?

    creating a contribution tiers list can be implemented in the following way:

1. Create a single NFT contract with a struct to represent the contribution tiers and store metadata for each NFT.
2. Use a mapping to store contributors' NFTs, indexed by their addresses.
3. Use another mapping to store the total amount contributed by each address.
4. Implement a function to handle contributions, which will automatically assign the appropriate tier and mint the corresponding NFT.
5. Add an optional feature to allow upgrading to a higher tier by contributing more funds.


Considerations and Tradeoffs
 -  Reduces the complexity of managing multiple NFT contracts.
 -  Simplifies the process of upgrading to a higher tier.
 -  Requires management of tier-related data to ensure efficient storage and retrieval.
 -  The NFT metadata should be kept minimal to avoid exceeding the 24kb size constraint.


  Psuedo code

  struct Tier {
        uint256 minContribution;
        string name;
        string metadataURI;
    }

  Tier[] public tiers;
    mapping(address => uint256) public contributions;
    mapping(address => uint256) public ownedNFTs;
  
  constructor() ERC721("CrowdfundrNFT", "CFNFT") {
        // Initialize tiers
        tiers.push(Tier(1 * 10**18, "Silver", "silver"));
        tiers.push(Tier(10 * 10**18, "Gold", "gold"));
        tiers.push(Tier(100 * 10**18, "Platinum", "platinum"));
    }
function contribute() external payable {
        recieve contributions
        add contributions to users mapping
    }

  function mintFT() external {
    check msg.sender contributions
    mintNFT based on thier tier list dependent on amount contributed


  }






## Actual Technical Spec

- There should be a `ProjectFactory` contract with a `create` method that deploys instances of the `Project` contract using the factory create pattern.
  - Each `Project` instance should be able to receive contributions independent of the others.
  - Each project has a goal amount, in ETH, which cannot be changed after a project gets created.

- The requirements for contributions are as follows:
  - The contribution amount must be at least 0.01 ETH.
  - There is no upper limit on contribution size.
  - Anyone can contribute to the project, including the creator.
  - One address can contribute as many times as they like.
  - No one can withdraw their funds until the project either fails or gets cancelled.

- The requirements for contributor badges are as follows:
  - Each project should use its own NFT contract.
  - An address earns 1 badge for each 1 ETH in their **total contribution** for that project.
  - One address can earn multiple badges for a single project, but should only earn 1 badge per 1 ETH.
    - For example, if Alice contributes 0.4 ETH to Project A, she is owed 0 badges. If she then contributes 0.7 ETH to Project A, her total contribution to that project is now 1.1 ETH, so she is owed 1 badge. If she then contributes 1 ETH, her total contribution is now 2.1 ETH, and she has earned 2 badges total.
  - The minting of badges should not happen in the same contract call as the contribution. In other words, there should be a separate function for a user to claim the contributor badges they are owed.
    - When an address calls this claim function, they should receive the correct number of badges based on their total contribution so far, while accounting for any badges that were previously claimed.
    - When the claim function is called by a contract, that contract must [indicate it is able to handle NFTs](https://stackoverflow.com/a/71191158) or else the transaction should revert.
  - Regardless of the end result of the crowdfunding effort, the project's badges are left alone. They should still be transferable.

- The terminal states of a project are as follows:
  - If the project is not fully funded within 30 days:
    - The project goal is considered to have failed.
    - No one can contribute anymore.
    - Contributors can get a refund of their contribution.

  - Once a project becomes fully funded:
    - No one else can contribute (however, the last contribution can go over the goal).
    - The creator cannot cancel the project.
    - The creator can withdraw any amount of contributed funds.

  - Before the 30 days are over and if the project is not yet fully funded, the creator can cancel the project.
    - This should have the same effect as a project failing to reach its goal within the 30 days.
