https://github.com/0xMacro/student.zouvier/tree/a766f033af2d41d156284158688091a49e7ca822/crowdfund

Audited By: Leoni Mella (MrLeoni)

# General Comments

Hi Zoumana! Great work on your Crowdfund project! I found some vulnerabilities in the project and described them in the following topics. Cudos for the usage of `indexed` params in your events and for the custom errors implementation!

I need to add some points because of the extra imports from OZ libraries (Reentrancy and Ownable) since these imports were not allowed for this project.

# Design Exercise

Your answer to the Design Exercise is on the right track! Actually you did an awesome job and your answer was very thoroughly commented on! Another good structure to associate a NFT Tier information is `enum`s. Where each enum position is a tier.

Then you can follow the same id association process as you described in your answer.

# Issues

## **[H-1]** Owner can reset funding time and project's goal (3 points)

Instead of defining the project's goal and duration at deployment time (i.e: in the `construct`) you created a `startCfunding` method to apply these parameters.

But this function can be called multiple times by the owner resetting the `cFundingEndTime` of the project. Consider this scenario:

1. Owner deploys a new Project and calls `startCfunding` with a goal of `10 eth`.
2. After 29 days, users have contributed a total of `9.5 eth` to the project.
   1. At this point the project is not completed or expired, so no refunds are available.
3. Now the owner calls `startCfunding` again with a goal of `9.6 eth`, and make a contribution of `0.1 eth`.
4. The project is marked as funded and the owner can withdraw all the balance of the project.

Here is a test for this scenario:

```typescript
it.only("Reverts if project funding goal is reseted", async () => {
  await projectFactory.connect(alice).create("Project1", "P1", "Description1");
  const projectAddress1 = await projectFactory.projects(0);
  const project1 = await ethers.getContractAt("Project", projectAddress1);

  await project1.connect(alice).startCfunding(ethers.utils.parseEther("10"));

  await expect(
    project1.connect(alice).startCfunding(ethers.utils.parseEther("15"))
  ).revertedWith("ProjectFundingReset");
});
```

You can fix this with two approaches:

- `startCfunding` can be called only one time.
- Project goal and deadline are set in the construct method (preferable way according to project specs).

## **[M-1]** Contributor cannot mint NFTs after calling `refund` (2 points)

In Project.sol line 157, `refundContributors` sets contributors mapping to zero:

```solidity
ContributionsSentByAddress[msg.sender] = 0;
```

However, function `mintNFT` relies on this value to determine if NFTs can be minted. If a project is canceled and a contributor gets their refund, they may be unable to claim their NFTs.

This is not expected behavior in the project spec, and may grief users expecting to be able to mint their NFTs at any point, even if the project has canceled and they've refunded their ETH.

Consider using a separate storage variable mapping to keep track of how many NFTs a contributor is owed, and that way you can decrease `ContributionsSentByAddress` to 0 without error.

## **[M-2]** Contributors can exploit NFT awards to get more than deserved (2 points)

A contributor should be awarded an NFT for each 1 ETH contributed to a project.

When you calculate the number of NFTs to award, you're basing it on a contributor's total contributions to date and the number of NFTs they currently own.

Edge cases where this can be manipulated:

1. A contributor buys NFTs from someone else
2. A contributor sells previously awarded NFTs or transfers them away

This exposes an exploit whereby a contributor can continually transfer NFTs to an associate or to another account they own, while getting replacement NFTs in exchange for minimal subsequent contributions.

Also the project specs dictates the claim NFT function should award all the badges owed to the user in one call, and your `mintNFT` can't do that, the user would have to call it multiple times to get multiple badges.

Consider checking deserved NFTs against past NFTs awarded instead of NFTs currently owned.

## **[M-3]** Incorrect accounting for total contributions (2 points)

In line 245 of Project.sol you have the following snippet of code:

```solidity
if (msg.value + address(this).balance >= cFundingGoal) {
    cFundingIsDone = true;
}
```

which checks if the funding goal has been met. However, this calculation is incorrect because in any payable function, the `address(this).balance` **already has been incremented by the value of `msg.value`**. So you check should instead look like:

```solidity
if (address(this).balance >= cFundingGoal) {
    cFundingIsDone = true;
}
```

This will likely result in a Project being marked as funded when really it has not reached the `cFundingGoal`. For instance, if a project's goal is 10 ETH and it currently has 8 ETH in it, then if a user contributes 1 ETH this will cause the `if` statement's expression to evaluate to `true`, and `cFundingIsDone = true;`, despite the contract only have a balance of 9 ETH.

Consider using the suggested check above.

## **[L-1]** Usage of `address(this).balance` directly could lead to unwanted effects/consequences (1 point)

The balance of a contract can be modified by external factors. For example, if some malicious contract with ETH balance executes a `selfdestruct` with a Crowdfund Project's contract address, the `address(this).balance` will increase and create a discrepancy with the state of `ContributionsSentByAddress[msg.sender]` - specifically, the sum of all contributions would be less than the current project's balance. In general, you should be extra cautious when some of the relevant values can only be modified by function calls to your contract while others can be modified by external actions that don't call your contract's functions.

This is not a big problem in this project because the creator can withdraw all the project's balance at will if the project is successful. But there are a few unexpected scenarios that can arise.

- A malicious actor could force-send enough ETH to the contract that we the goal is reached, and then make a small contribution leading to goalReached = true, such that the project goal is reached but not NFTs are ever claimable
- Similarly, if the ETH transfer that puts the project past the goal is a force-send, then it will still be possible for the next user to make a contribution even though the goal is already reached, which should not be possible.

Consider creating a `projectContributions` variable that will increment in value for each contribution made and use it instead of `address(this).balance` to determine the project success.

## **[Extra feature]** Importing code not specified in the project spec (Ownable and ReentrancyGuard) (1 point)

For this project, you were only permitted to import ERC721. We want you to gain experience implementing functionality yourself, so that when you're writing code for production, you will understand how the OpenZeppelin contracts and any other imports work.

## **[Q-1]** Leaving hardhat/console.sol in production project

Your contract imports hardhat/console.sol, which is a development package.

Consider removing hardhat/console.sol from your production code.

## **[Q-2]** Some state variables can be marked as `immutable`

In your Project contract, some variables can marked as `immutable` since their values will never change:

```solidity
uint256 public cFundingEndTime;
    uint256 public cFundingGoal;
```

What's the difference? In both cases, the variables cannot be modified after the contract has been constructed. For `constant` variables, the value has to be fixed at compile-time, while for `immutable`, it can still be assigned at construction time.

Compared to regular state variables, the gas costs of `constant` and `immutable` variables are much lower. For a `constant` variable, the expression assigned to it is copied to all the places where it is accessed and also re-evaluated each time. This allows for local optimizations. `Immutable` variables are evaluated once at construction time and their value is copied to all the places in the code where they are accessed. For these values, 32 bytes are reserved, even if they would fit in fewer bytes. Due to this, `constant` values can sometimes be cheaper than `immutable` values.

Consider marking unchanged storage variables as either `constant` or `immutable`.

## **[Q-3]** Inconsistent naming convention

In your Project.sol contract some functions names are in camelCase while others are in PascalCase for no apparent reason. It's better to follow one of these conventions for the whole project since it will improve the consistency of your names and help with readability.

Consider changing all function names to camelCase instead of PascalCase.

## **[Q-4]** Inconsistent usage of errors/validation handling and modifiers

Throughout your project you have used a mix of `requires`, custom errors and modifiers.

You have well defined and implemented custom errors, for example:

```solidity
error CfundingHasNotEnded(
  uint256 currentTime,
  uint256 TimeLeft,
  uint256 currentBalance,
  uint256 targetBalance
);

//

revert CfundingHasNotEnded(
  {
    currentTime: block.timestamp,
    TimeLeft: cFundingEndTime,
    currentBalance: address(this).balance,
    targetBalance: cFundingGoal
  }
);
```

Consider replacing the usage of `require` in favor of those custom errors for now on.

The same thing happened with your modifiers. You wrote four different modifiers to handle function flow, but in some cases you ended up calling the state variable directly inside a `require` block to check if the function could be executed, this is the case of the `refundContributors` method, for example.

This kind of mixed usage of state variables and modifiers create a difficulty in the maintainability of your code and also increase the difficulty in tests.

# Score

| Reason                     | Score |
| -------------------------- | ----- |
| Late                       | 0     |
| Unfinished features        | 0     |
| Extra features             | 1     |
| Vulnerability              | 10    |
| Unanswered design exercise | 0     |
| Insufficient tests         | 0     |
| Technical mistake          | 0     |

Total: 11

Great Job!
