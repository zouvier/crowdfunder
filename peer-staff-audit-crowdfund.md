**This is the staff audit for the code you performed a peer audit on. We give you this so you can compare your peer audit against a staff audit for the same project.**

https://github.com/0xMacro/student.anirudhnkl/tree/21e214e6b16d1e76e491d09d0d53a0c3eea38c61/crowdfund

Audited By: Karolis Ramanauskas (karooolis)

# General Comments

Great job on your first project! You have successfully applied the concepts learned in class, including (i) implementing the Check-Effects-Interaction pattern to prevent re-entrancy vulnerabilities and (ii) demonstrating a good understanding of the ERC721 standard by using `_safeMint()`. The code was easy to understand so kudos for writing it in clear manner, and I liked the usage of helper functions to track state of the project.

I found 1 medium vulnerability. There is also room for improvement in terms of code quality such as Natspec, event contents, custom errors, imports and overall structure.

# Design Exercise

Your design exercise solution is susceptible to `balanceOf()` attack where a contributor may be able to obtain contributor badges from other contributors, and then be able to mint higher tier badges than they actually deserve based on their NFT holdings. I'd consider tracking each user's contribution amount and minting badges based on that.

Also, while your described solution does describe how one may calculate NFT's tier, it is not clear how the tier is set during the actual minting. You may use two approaches:

1. Create a new mapping that tracks the tier of each NFT, and then mint the NFT based on the tier e.g.

```solidity
enum NFTLevel { BRONZE, SILVER, GOLD }
mapping (uint256 -> NFTLevel) nftTiers; // NFT ID => Level of NFT

uint256 nftID = 0;
function mintNFT(NFTLevel nftLevel) {
    nftID++;
    nftTier[nftID] = nftLEVEL;
    _safeMint(msg.sender, nftID);
}
```

This solution is great due to its simplicity. However, the size of the nftTiers mapping grows linearly with the number of NFTs to be minted, and as you know, storage writes are expensive in ETH!

2. Using an ID offset system, we track a separate ID for each tier. In the example below, we (arbitrarily) pick the ID 10,000 to start our silver IDs and 20,000 to start our gold IDs.

```solidity
enum NFTLevel { BRONZE, SILVER, GOLD }

uint256 bronzeID = 0;
uint256 silverID = 10_000;
uint256 goldID = 20_000;

function mintNFT(NFTLevel nftLevel) {
    if (nftLevel == NFTLevel.BRONZE) {
        bronzeID++;
        _safeMint(msg.sender, bronzeID);
    } else if (nftLevel == NFT.SILVER) {
        silverID++;
        _safeMint(msg.sender, silverID);
    } else if (nftLevel == NFT.GOLD) {
        goldID++;
        _safeMint(msg.sender, goldID);
    }
}
```

This solution holds a few extra variables to keep track of NFT IDs at each level, but the size of the data does not grow!

This system does have a few of its own trade-offs. For one thing, there is a finite number of NFTs that may be minted per level- for example if we set the first silver offset to 10,000, technically, we would only be able to mint up to 10,000 - 1 bronze NFTs before the system starts minting silver NFTs. This can be contrasted with the previous method- the additional mapping method would truly have unlimited that could be minted NFTs for each level.

# Issues

## **[M-1]** Contributors can exploit NFT awards to get more than deserved (2 points)

A contributor should be awarded an NFT for each 1 ETH contributed to a project.

When you calculate the number of NFTs to award, you're basing it on a contributor's total contributions to date and the number of NFTs they currently own.

Edge cases where this can be manipulated:

1. A contributor buys NFTs from someone else
2. A contributor sells previously awarded NFTs or transfers them away

This exposes an exploit whereby a contributor can continually transfer NFTs to an associate or to another account they own, while getting replacement NFTs in exchange for minimal subsequent contributions.

Consider checking deserved NFTs against past NFTs awarded instead of NFTs currently owned.

## **[Q-1]** Not using the most recent version of Solidity

Your contracts are using the `0.8.17` version of solidity, but the most recent version right now is the `0.8.19`. It's always a good practice to write our contracts in the most recent version.

## **[Q-2]** No need for `remainingAmount` and `raisedAmount` variables

You could simplify the codebase slightly by using a single variable for keeping track of the amount raised and the amount remaining. This is because the amount raised can increase only while the crowdfunding is active, and the same amount will only decrease when the crowdfunding is completed, and the project creator is withdrawing funds.

## **[Q-3]** Could make use of modifiers

You have repetitive checks such as `require(msg.sender == owner)` that could be refactored into a modifier, and used across all functions e.g:

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Only the owner can call this function.");
    _;
}

function cancel() external onlyOwner {
  ...
}
```

## **[Q-4]** Prefer Custom Errors over `require`

In your project you use the word `require` to check user input and contract state which reverts if the expression is false. The modern-Solidity way to do this is with custom errors, which are preferable because:

1. they allow you to include dynamic values (i.e. local variables) in the error
2. they are slightly more gas efficient

This is an excellent blog post by the Solidity team about custom errors if you are interested: https://blog.soliditylang.org/2021/04/21/custom-errors/

## **[Q-5]** No use of indexed parameters in events

Indexing parameters in events are a great way to keep track of specific outputs from events, allowing the creation of topics to sort and track data from them. For example:

```solidity
event ProjectCreated(
    address newProject,
    string projectName,
    uint targetAmount,
    address owner,
    uint projectIndex
);
```

Using `address indexed owner` in the event above, will allow dapps to track the specific `ProjectCreated` events of an address with ease.

## **[Q-6]** Use NatSpec format for comments

Solidity contracts can use a special form of comments to provide rich documentation for functions, return variables, and more. This special form is named the Ethereum Natural Language Specification Format (NatSpec).

It is recommended that Solidity contracts are fully annotated using NatSpec for all public interfaces (everything in the ABI).

Using NatSpec will make your contracts more familiar for others to audit and make your contracts look more standard.

For more info on NatSpec, check out [this guide](https://docs.soliditylang.org/en/develop/natspec-format.html).

Consider annotating your contract code via the NatSpec comment standard.

## **[Q-7]** Unchanged variables should be marked constant or immutable

Your contract includes storage variables that are not updated by any functions and do not change i.e. `projectName`, `owner`. For these cases, you can save gas and improve readability by marking these variables as either `constant` or `immutable`.

What's the difference? In both cases, the variables cannot be modified after the contract has been constructed. For `constant` variables, the value has to be fixed at compile-time, while for `immutable`, it can still be assigned at construction time.

Compared to regular state variables, the gas costs of `constant` and `immutable` variables are much lower. For a `constant` variable, the expression assigned to it is copied to all the places it is accessed and re-evaluated each time. This allows for local optimizations. `immutable` variables are evaluated once at construction time, and their value is copied to all the places in the code where they are accessed. For these values, 32 bytes are reserved, even if they would fit in fewer bytes. Due to this, `constant` values can sometimes be cheaper than `immutable` values.

Consider marking unchanged storage variables as either `constant` or `immutable`.

## **[Q-8]** Use of uint256 where a more compact uint8 or uint64 would suffice

You used uint256 for `START_TIME` and `DURATION` whose values will never change because they are constant. Those numbers do not need 256 bits to represent them, and instead you could have used `uint64` and `uint8` respectively. This would allow them to be packed into a single storage slot, and cause your SLOAD's to be cheaper.

See [this article's section on "Variable Packing"](https://medium.com/coinmonks/gas-optimization-in-solidity-part-i-variables-9d5775e43dde) for more detailed info.

Consider optimizing your uint sizes for optimal storage and gas efficiency.

## **[Q-9]** Leaving hardhat/console.sol in production project

Your contract imports hardhat/console.sol, which is a development package. Consider removing hardhat/console.sol from your production code.

## **[Q-10]** Unconventional order of variables, events, errors and functions

In Project.sol, the declaration order is quite unconventional. For example, immutable variables are mixed with storage variables, as well as mappings.

The idiomatic order for variables that I've seen is this:

1. constants/immutables
2. storage variables
3. structs/enums
4. modifiers
5. functions
6. events/errors

I see events come after modifiers sometimes, but 1-3 are almost always at the top of the contract.

Consider writing your contracts with the code declarations as given above. It's especially important because of how in upgradeable contracts the slot numbers of variables is a potential footgun.

## **[Q-11]** All projects share the same name, and `projectName` could be used for ERC721 token name

In your Project constructor, we have the following:

```solidity
constructor(
    ...
    string memory _name,
    ...
) ERC721("ProjectContributor", "PCB") {
    ...
    projectName = _name;
    ...
}
```

I'd consider using the `projectName` as ERC721 token name, and also add additional `symbol` parameter to set the token symbol, as such:

```solidity
constructor(
    ...
    string memory _name,
    string memory _symbol,
    ...
) ERC721(_name, _symbol) { ... }
```

## **[Q-12]** Store `END_TIME` rather than `START_TIME` and `DURATION`

You may save some gas if you stored `END_TIME` rather than `START_TIME` and `DURATION`. Then, when performing project state checks, you would only need to check if `block.timestamp` is more than `END_TIME` e.g.

```solidity
function _checkStatusWhenLive() internal {
  if (status == Status.Live && block.timestamp >= END_TIME) {
      _fail();
  }
}
```

## **[Q-13]** Avoid excessive storage writes

In `_checkAndMarkPendingBadge`, you have the following `for` loop:

```solidity
for (uint i = 0; i < numBadgesToBeCreated; i++) {
    pendingBadgeWithdrawals[contributor]++;
}
```

This will write to storage `numBadgesToBeCreated` times, and each of those writes is fairly expensive in terms of gas. Instead, you could do `pendingBadgeWithdrawals[contributor] += numBadgesToBeCreated` and only write to storage once.

# Nitpicks

**[N-1]** Use `uint256` instead of `uint` for consistency

Stylistically, `uint256` makes it clear that it is a 256 bit unsigned integer. Some readers (especially new contract devs) find `uint` ambiguous, mistaking it for a different, smaller numeric type.

Consider using `uint256` moving forward for explicitness.

# Score

| Reason                     | Score |
| -------------------------- | ----- |
| Late                       | 0     |
| Unfinished features        | 0     |
| Extra features             | 0     |
| Vulnerability              | 2     |
| Unanswered design exercise | 0     |
| Insufficient tests         | 0     |
| Technical mistake          | 0     |

Total: 2

Great job!
