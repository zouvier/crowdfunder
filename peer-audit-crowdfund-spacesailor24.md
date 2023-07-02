# Table of Contents

- [Repository](#repository)
- [Commit](#commit)
- [Vulnerabilities](#vulnerabilities)
  - [HIGH](#high)
    - [**\[H-1\]** `Project.sol Line 181`: `mintNFT` doesn't correctly account for previously minted NFTs, allowing a uint256 amount of NFTs to be minted for a single contribution greater than or equal to 1 ETH](#h-1-projectsol-line-181-mintnft-doesnt-correctly-account-for-previously-minted-nfts-allowing-a-uint256-amount-of-nfts-to-be-minted-for-a-single-contribution-greater-than-or-equal-to-1-eth)
      - [The vulnerable code](#the-vulnerable-code)
      - [The vulnerability](#the-vulnerability)
      - [Example exploitation](#example-exploitation)
      - [A solution](#a-solution)
    - [**\[H-2\]** `Project.sol Line 245`: Contributions are counted twice when `ContributeEther` calculates if the `Project`'s goal has been met, causing a premature success state](#h-2-projectsol-line-245-contributions-are-counted-twice-when-contributeether-calculates-if-the-projects-goal-has-been-met-causing-a-premature-success-state)
      - [The vulnerable code](#the-vulnerable-code-1)
      - [The vulnerability](#the-vulnerability-1)
      - [Example exploitation](#example-exploitation-1)
      - [A solution](#a-solution-1)
    - [**\[H-3\]** `Project.sol Line 89 - 95`: Lack of restrictions for when `startCfunding` can be called means a `Project`'s goal and end time can be updated at any time](#h-3-projectsol-line-89---95-lack-of-restrictions-for-when-startcfunding-can-be-called-means-a-projects-goal-and-end-time-can-be-updated-at-any-time)
      - [The code (`Line 89 - 95`)](#the-code-line-89---95)
      - [A solution](#a-solution-2)
- [Quality](#quality)
    - [\[Q-1\] `Project.sol Line 245 - 247`: No event is emitted when a `Project` reaches it's goal](#q-1-projectsol-line-245---247-no-event-is-emitted-when-a-project-reaches-its-goal)
- [NitPicks](#nitpicks)
    - [**\[NP-1\]** `ProjectFactory.sol Line 12`: An array of all `Project`'s wasn't required by spec and increases the gas cost of creating a `Project`](#np-1-projectfactorysol-line-12-an-array-of-all-projects-wasnt-required-by-spec-and-increases-the-gas-cost-of-creating-a-project)
      - [The code](#the-code)
      - [A solution](#a-solution-3)
    - [**\[NP-2\]** `ProjectFactory.sol Line 13`: A mapping of a `Project`'s creator to an array of `Project`s created by them wasn't required by spec and increases the gas cost of creating a `Project`](#np-2-projectfactorysol-line-13-a-mapping-of-a-projects-creator-to-an-array-of-projects-created-by-them-wasnt-required-by-spec-and-increases-the-gas-cost-of-creating-a-project)
      - [The code](#the-code-1)
      - [A solution](#a-solution-4)
    - [Gas savings of implementing solutions of \[NP-1\] and \[NP-2\]](#gas-savings-of-implementing-solutions-of-np-1-and-np-2)
      - [The revised code](#the-revised-code)
    - [**\[NP-3\]** `Project.sol Line 76`: A description for a `Project` wasn't required by the spec, and it's inclusion increases the gas cost of creating a `Project`](#np-3-projectsol-line-76-a-description-for-a-project-wasnt-required-by-the-spec-and-its-inclusion-increases-the-gas-cost-of-creating-a-project)
      - [The code (`Line 15 and 73 - 81`)](#the-code-line-15-and-73---81)
      - [A solution](#a-solution-5)
    - [**\[NP-4\]** `Project.sol Line 89 - 95`: A function to start the funding period of a `Project` wasn't required by the spec and increases the gas cost of creating a fundable `Project`](#np-4-projectsol-line-89---95-a-function-to-start-the-funding-period-of-a-project-wasnt-required-by-the-spec-and-increases-the-gas-cost-of-creating-a-fundable-project)
      - [The code (`Line 89 - 95`)](#the-code-line-89---95-1)
      - [A solution](#a-solution-6)
    - [\[NP-5\] `Project.sol Line 48`: Function modifier `expiredCfunding` is checking that a `Project` has **not** expired, but it's name implies a `Project` has expired](#np-5-projectsol-line-48-function-modifier-expiredcfunding-is-checking-that-a-project-has-not-expired-but-its-name-implies-a-project-has-expired)
      - [Example usage (`Line 102 - 111`)](#example-usage-line-102---111)
      - [A solution](#a-solution-7)
    - [\[NP-6\] `Project.sol Line 53`: Function modifier `cFundCompleted` is checking that a `Project` has not been completed (`!cFundingIsDone`), but it's name implies a `Project` has a completed status](#np-6-projectsol-line-53-function-modifier-cfundcompleted-is-checking-that-a-project-has-not-been-completed-cfundingisdone-but-its-name-implies-a-project-has-a-completed-status)
      - [Example usage (`Line 102 - 111`)](#example-usage-line-102---111-1)
      - [A solution](#a-solution-8)
    - [\[NP-7\] `Project.sol Line 54`: All other error messages start with a capital `T` for `The`, but the error message for `cFundCompleted` starts with a lowercase `t`](#np-7-projectsol-line-54-all-other-error-messages-start-with-a-capital-t-for-the-but-the-error-message-for-cfundcompleted-starts-with-a-lowercase-t)
      - [The code (`Line 53 - 56`)](#the-code-line-53---56)
    - [\[NP-8\] `Project.sol Line 54`: All other error messages use `crowdfunding` with a lower case `c`, but the error message on `Line 54` uses a capital `C`](#np-8-projectsol-line-54-all-other-error-messages-use-crowdfunding-with-a-lower-case-c-but-the-error-message-on-line-54-uses-a-capital-c)
      - [The code (`Line 53 - 56`)](#the-code-line-53---56-1)
    - [\[NP-9\] `Project.sol Line 110`: The name of the event `CanceledCfunding` implies that a project has been cancelled and it's error string doesn't provide additional context, using more gas then necessary as a result](#np-9-projectsol-line-110-the-name-of-the-event-canceledcfunding-implies-that-a-project-has-been-cancelled-and-its-error-string-doesnt-provide-additional-context-using-more-gas-then-necessary-as-a-result)
      - [The code (Line 102 - 111)](#the-code-line-102---111)
      - [A solution](#a-solution-9)
    - [\[NP-10\] `Project.sol Line 136 - 140 and 156 - 160`: `RefundSent` argument for `FailedToRefund` error will always be `false`](#np-10-projectsol-line-136---140-and-156---160-refundsent-argument-for-failedtorefund-error-will-always-be-false)
      - [The code](#the-code-2)
        - [`Line 119 - 142`](#line-119---142)
        - [`Line 150 - 170`](#line-150---170)
      - [A solution](#a-solution-10)
    - [\[NP-11\] `Project.sol Line 157 - 159`: Consider creating a specific custom error for failed withdraws](#np-11-projectsol-line-157---159-consider-creating-a-specific-custom-error-for-failed-withdraws)
      - [The code (Line 150 - 170)](#the-code-line-150---170)
      - [A solution](#a-solution-11)
    - [\[NP-12\] `Project.sol Line 141`: It's not necessary to provide `address(this)` as an argument of the `Refund` event, address is already known](#np-12-projectsol-line-141-its-not-necessary-to-provide-addressthis-as-an-argument-of-the-refund-event-address-is-already-known)
      - [The code (`Line 31 and 119 - 142`)](#the-code-line-31-and-119---142)
      - [A solution](#a-solution-12)
    - [\[NP-13\] `Project.sol Line 161`: It's not necessary to provide `address(this)` as an argument of the `Withdraw` event, address is already known](#np-13-projectsol-line-161-its-not-necessary-to-provide-addressthis-as-an-argument-of-the-withdraw-event-address-is-already-known)
      - [The code (`Line 32 and 150 - 170`)](#the-code-line-32-and-150---170)
      - [A solution](#a-solution-13)
    - [\[NP-14\] `Project.sol Line 150 - 170`: Consider adding something similar to `InsufficientFunds` custom error to `withdrawFunds`](#np-14-projectsol-line-150---170-consider-adding-something-similar-to-insufficientfunds-custom-error-to-withdrawfunds)
      - [Existing code (`Line 150 - 170`)](#existing-code-line-150---170)
      - [Revised Code](#revised-code)
    - [\[NP-15\] `Project.sol Line 180`: A `balanceOf(msg.sender)` call is made, but nothing is done with the response](#np-15-projectsol-line-180-a-balanceofmsgsender-call-is-made-but-nothing-is-done-with-the-response)
      - [The code](#the-code-3)
      - [A solution](#a-solution-14)
    - [\[NP-16\] `Project.sol Line 211 - 214`: Duplicate getter function for getting contributions by address](#np-16-projectsol-line-211---214-duplicate-getter-function-for-getting-contributions-by-address)
      - [The code (`Line 26 and 211 - 214`)](#the-code-line-26-and-211---214)
      - [A solution](#a-solution-15)
    - [\[NP-17\] `Project.sol Line 221 - 224`: Unnecessary `totalContributed` getter function](#np-17-projectsol-line-221---224-unnecessary-totalcontributed-getter-function)
      - [The code (`Line 221 - 224`)](#the-code-line-221---224)
      - [A solution](#a-solution-16)

# Repository

https://github.com/0xMacro/student.zouvier/tree/master/crowdfund

# Commit

`fd2d479c1dca43f901d6040dfe87ea89fe001c67`

# Vulnerabilities

## HIGH

### **[H-1]** `Project.sol Line 181`: `mintNFT` doesn't correctly account for previously minted NFTs, allowing a uint256 amount of NFTs to be minted for a single contribution greater than or equal to 1 ETH

The function `mintNFT` on `Line 177` of `Project.sol` contains a critical error that enables a contributor to mint a uint256 amount of NFTs after a total contribution of 1 or more ETH has been made. This occurs because the NFT balance check doesn't account for the contributor transferring minted NFTs to another address:

#### The vulnerable code

```solidity
/**
* @dev Mints an NFT for the contributor.
* @notice Can be called by any contributor.
*/
function mintNFT() external
nonReentrant
{
    balanceOf(msg.sender);
    if( (ContributionsSentByAddress[msg.sender] / 1 ether - balanceOf(msg.sender))  > 0){

        _safeMint(msg.sender, tokenIds);
    
        tokenIds += 1;
    }
    else{
        revert CanMintNFT({
            NFTsUserCanMint: ContributionsSentByAddress[msg.sender] / 1 ether - balanceOf(msg.sender)
        });
    }
}
```

#### The vulnerability

On `Line 181` of `Project.sol`, the check: 

```solidity
if( (ContributionsSentByAddress[msg.sender] / 1 ether - balanceOf(msg.sender)) > 0)
```

is made to determine if a contributor has any NFTs that are available to mint. This check is assuming that all previously minted NFTs for the function caller have remained owned by the function caller's address. What this check doesn't account for is the function caller transferring their NFTs to another address resulting in `balanceOf(msg.sender)` to be less than the total amount of NFTs minted for the function caller.

#### Example exploitation

The following code is assuming a `Project` has been created with a `cFundingGoal` of any value. The following code also assumes an `ethers.js` contract wrapper (called `project`) has already been instantiated for the previously mentioned deployed `Project`, and an `ethers.js` signer has been configured (called `alice`):

```solidity
// This makes alice eligable to claim 1 NFT
await project.connect(alice).ContributeEther({ value: ONE_ETHER });

// This mints Alice a NFT with token id 0
await project.connect(alice).mintNFT();

// Alice transfers the minted NFT (with token id 0) to any address
await project.transferFrom(alice.address, '0x...', 0);

// Alice mints a second NFT (with token id 1) for her single contribution of ONE_ETHER.
await project.connect(alice).mintNFT();
```

This is possible because when `mintNFT` is called the second time, it executes the previously mentioned check on `Line 181`:

```solidity
if( (ContributionsSentByAddress[msg.sender] / 1 ether - balanceOf(msg.sender)) > 0)
```

and `ContributionsSentByAddress[msg.sender] / 1 ether` is equal to `1` and `balanceOf(msg.sender)` is equal to `0`. So, Alice is minted a second NFT for her single contribution of `ONE_ETHER`. This process can be repeated with the only restriction being the maximum value for `uint256` (the token id).

#### A solution

The total number of NFTs minted for each contributor needs to be tracked explicitly instead of relying on `balanceOf(msg.sender)` in the check on `Line 181`. This could be done by creating a mapping of addresses to the number of NFTs minted:

```solidity
mapping(address => uint256) public numberOfMintedNFTs;
```

comparing the following in place of the current check on `Line 181`:

```solidity
if(((ContributionsSentByAddress[msg.sender] / 1 ether) - numberOfMintedNFTs[msg.sender]) > 0)
```

and if the check passes, increase `numberOfMintedNFTs[msg.sender]` by `1` like so:

```solidity
// The new mapping to track the number of NFTs minted for each address
mapping(address => uint256) public numberOfMintedNFTs;

/**
* @dev Mints an NFT for the contributor.
* @notice Can be called by any contributor.
*/
function mintNFT() external
nonReentrant
{
    balanceOf(msg.sender);
    // The updated check
    if(((ContributionsSentByAddress[msg.sender] / 1 ether) - numberOfMintedNFTs[msg.sender]) > 0){

        // Increasing the number of minted NFTs for the function caller by 1
        numberOfMintedNFTs[msg.sender] += 1;

        _safeMint(msg.sender, tokenIds);
    
        tokenIds += 1;
    }
    else{
        revert CanMintNFT({
            NFTsUserCanMint: ContributionsSentByAddress[msg.sender] / 1 ether - balanceOf(msg.sender)
        });
    }
}
```

---

### **[H-2]** `Project.sol Line 245`: Contributions are counted twice when `ContributeEther` calculates if the `Project`'s goal has been met, causing a premature success state

The function `ContributeEther` on `Line 230` of `Project.sol` contains a critical error when calculating if a `Project`'s total contributions has met or exceeded the `Project`'s goal (`cFundingGoal`), causing the `Project` to go into a success state (`cFundingIsDone = true`) before the `Project` has actually met it's goal. This occurs because `Line 245` adds `msg.value` (i.e. the contributor's contribution) to the current balance of the `Project`, however the `Project`'s balance already includes the balance increase of the contribution since it's paid in Ether.

#### The vulnerable code

```solidity
/**
* @dev a function to accept contributions and emit the Contribution event.
* @notice Can be called by any contributor.
*/
function ContributeEther() external payable
cFundingStarted
activeCfunding
expiredCfunding
cFundCompleted
{
    if(msg.value < MIN_CONTRIBUTIONS){
        revert InsufficientAmount({
            sent: msg.value,
            required: MIN_CONTRIBUTIONS
        });
    }
    ContributionsSentByAddress[msg.sender] += msg.value;
    emit Contribution(msg.sender, address(this), msg.value);

    if (msg.value + address(this).balance >= cFundingGoal) {
        cFundingIsDone = true;
    }
}
```

#### The vulnerability

On `Line 245`:

```solidity
if (msg.value + address(this).balance >= cFundingGoal)
```

`address(this).balance` already includes the contributor's contribution that was sent as `msg.value`. The addition of the executing transaction's `value` to the `Project`'s balance happens before the function (`ContributeEther`) starts to execute it's logic. So when `msg.value` is explicitly added to `address(this).balance`, the contribution of the executing transaction is counted for twice.

#### Example exploitation

The following code is assuming a `Project` has been created with a `cFundingGoal` of `2 ether`. The following code also assumes an `ethers.js` contract wrapper (called `project`) has already been instantiated for the previously mentioned deployed `Project`, and an `ethers.js` signer has been configured (called `alice`):

```solidity
// Alice contributes ONE_ETHER to the Project, this triggers the
// vunerability causing cFundingIsDone to equal true
await project.connect(alice).ContributeEther({ value: ONE_ETHER });
```

When the EVM begins to process the above transaction, `ONE_ETHER` is added to the balance of the `Project` before `ContributeEther`'s logic begins to process. So when `Line 245` calculates whether the `Project`'s goal has been met, the `value` of the transaction (`ONE_ETHER`) is added to the balance of `Project` (`ONE_ETHER`) resulting in the check to pass causing the `Project`'s `cFundingIsDone` variable to be updated to `true`. This is supposed to signal that the `Project`'s goal (`2 ether`) has been met, but the balance of the `Project` will only be `1 ether`.

#### A solution

Removing `msg.value +` from `Line 245` will result in the correct calculation of whether the `Project`'s current balance meets or exceeds the `Project`'s goal:

```solidity
/**
* @dev a function to accept contributions and emit the Contribution event.
* @notice Can be called by any contributor.
*/
function ContributeEther() external payable
cFundingStarted
activeCfunding
expiredCfunding
cFundCompleted
{
    if(msg.value < MIN_CONTRIBUTIONS){
        revert InsufficientAmount({
            sent: msg.value,
            required: MIN_CONTRIBUTIONS
        });
    }
    ContributionsSentByAddress[msg.sender] += msg.value;
    emit Contribution(msg.sender, address(this), msg.value);

    // msg.value + has been removed from this check
    if (address(this).balance >= cFundingGoal) {
        cFundingIsDone = true;
    }
}
```

---

### **[H-3]** `Project.sol Line 89 - 95`: Lack of restrictions for when `startCfunding` can be called means a `Project`'s goal and end time can be updated at any time

The function, `startCfunding` (`Line 89`), is intended to only be callable once, but there are no restrictions in place to enforce this. Instead, the `Owner` of the `Project` is able to call `startCfunding` at any point regardless of the `Project`'s state, updating the `Project`'s goal and end time after the project has already been started.

#### The code (`Line 89 - 95`)

The only restriction on when `startCfunding` can be called is the `onlyOwner` function modifier that only checks if the function caller is the `Owner` of the `Project`.

```solidity
/**
* @dev Starts the crowdfunding campaign with a specified goal.
* @notice Can only be called by the contract owner.
* @param _cFundingGoal The funding goal for the crowdfunding campaign.
*/

function startCfunding(uint256 _cFundingGoal) external 
onlyOwner
{
    cFundingGoal = _cFundingGoal;
    cFundingEndTime = block.timestamp + PROJ_DURATION;
    cFundingHasStarted = true;
}
```

#### A solution

This vulnerability can be avoided if a check to see if the `Project` has already been started (i.e. `cFundingHasStarted = true`) is required at the beginning of the function `startCfunding`:

```solidity
/**
* @dev Starts the crowdfunding campaign with a specified goal.
* @notice Can only be called by the contract owner.
* @param _cFundingGoal The funding goal for the crowdfunding campaign.
*/

function startCfunding(uint256 _cFundingGoal) external 
onlyOwner
{
    // This check prohibits the Owner of the Project from
    // calling this function more than once
    require(!cFundingHasStarted);
    cFundingGoal = _cFundingGoal;
    cFundingEndTime = block.timestamp + PROJ_DURATION;
    cFundingHasStarted = true;
}
```

---

# Quality

### [Q-1] `Project.sol Line 245 - 247`: No event is emitted when a `Project` reaches it's goal

While not necessary, it would be expected that an event similar to:

```solidity
event ProjectCompleted();
```

would be emitted after `Line 246` when a `Project`'s `cFundingIsDone` variable is set to `true`.

# NitPicks

### **[NP-1]** `ProjectFactory.sol Line 12`: An array of all `Project`'s wasn't required by spec and increases the gas cost of creating a `Project`

Related to [NP-2]

There was no requirement by the spec to track every `Project` that has been created. While the `projects` array (`Line 12`) is a more straightforward way to obtain all the created projects, the same could be accomplished by listening for the `ProjectCreated` events emitted on `Line 41`. Additionally, pushing the new `Project` (`Line 37`) onto the `projects` array increases the gas cost of creating a `Project`.

#### The code

```solidity
Project[] public projects;

/**
* @dev Creates a new instance of the Project contract.
* @notice Can be called by any user to create a new crowdfunding campaign.
* @param _name The name of the ERC721 token for the new project.
* @param _Symbol The symbol of the ERC721 token for the new project.
* @param _cFundingDescription The description of the crowdfunding campaign for the new project.
*/
function create( 
    string calldata _name,
    string calldata _Symbol,
    string calldata _cFundingDescription) 
    external {
        Project newProject = new Project(
            _name,
            _Symbol,
            _cFundingDescription,
            msg.sender
        );
    
        uint256 newProjectIndex = projects.length;
        ProjectCreationPerOwner[msg.sender].push(newProjectIndex);
        projects.push(newProject);
    
    

    emit ProjectCreated(address(newProject), msg.sender, newProjectIndex);
}
```

#### A solution

Remove the `projects` array on `Line 12` - this will result in subsequent refactorings for `Line 35 - 41` as `newProjectIndex` (on `Line 35`) will no longer be available.

---

### **[NP-2]** `ProjectFactory.sol Line 13`: A mapping of a `Project`'s creator to an array of `Project`s created by them wasn't required by spec and increases the gas cost of creating a `Project`

Related to [NP-1]

There was no requirement by the spec to track all the `Project`s created by a specific address. Pushing the `newProjectIndex` (`Line 36`) onto the `ProjectCreationPerOwner` mapping (`Line 13`) increases the gas cost of creating a `Project`. Additionally, all the `Project`s created by a specific address can be obtained by parsing the `ProjectCreated` events that are emitted when a `Project` is created (`Line 41`) since they contain the address of the created `Project` and the address of the creator.

#### The code

```solidity
mapping(address => uint[]) public ProjectCreationPerOwner;

/**
* @dev Creates a new instance of the Project contract.
* @notice Can be called by any user to create a new crowdfunding campaign.
* @param _name The name of the ERC721 token for the new project.
* @param _Symbol The symbol of the ERC721 token for the new project.
* @param _cFundingDescription The description of the crowdfunding campaign for the new project.
*/
function create( 
    string calldata _name,
    string calldata _Symbol,
    string calldata _cFundingDescription) 
    external {
        Project newProject = new Project(
            _name,
            _Symbol,
            _cFundingDescription,
            msg.sender
        );
    
        uint256 newProjectIndex = projects.length;
        ProjectCreationPerOwner[msg.sender].push(newProjectIndex);
        projects.push(newProject);
    
    

    emit ProjectCreated(address(newProject), msg.sender, newProjectIndex);
}
```

#### A solution

Remove the `ProjectCreationPerOwner` mapping on `Line 13` and `Line 36` that sets a value in the `ProjectCreationPerOwner` mapping

---

### Gas savings of implementing solutions of [NP-1] and [NP-2]

After implementing the proposed solutions of [NP-1] and [NP-2], a total of `69,245` gas is saved every time a `Project` is created. Additionally, the deployment cost of `ProjectFactory` is reduced by `82,000` gas.

#### The revised code

```solidity
//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.17;

import "./Project.sol";

/**
 * @title ProjectFactory
 * @dev Smart contract for creating and managing instances of the Project contract.
 */

contract ProjectFactory {
    event ProjectCreated(address indexed CrowdFundingAddress, address indexed Owner);

    /**
     * @dev Creates a new instance of the Project contract.
     * @notice Can be called by any user to create a new crowdfunding campaign.
     * @param _name The name of the ERC721 token for the new project.
     * @param _Symbol The symbol of the ERC721 token for the new project.
     * @param _cFundingDescription The description of the crowdfunding campaign for the new project.
     */
    function create( 
        string calldata _name,
        string calldata _Symbol,
        string calldata _cFundingDescription) 
        external {
            Project newProject = new Project(
                _name,
                _Symbol,
                _cFundingDescription,
                msg.sender
            );

        emit ProjectCreated(address(newProject), msg.sender);
    }
}
```

---

### **[NP-3]** `Project.sol Line 76`: A description for a `Project` wasn't required by the spec, and it's inclusion increases the gas cost of creating a `Project`

#### The code (`Line 15 and 73 - 81`)

```solidity
string public cFundingDescription;

/**
* @dev Constructor for the Project smart contract.
* @notice Initializes the ERC721 token, sets the crowdfunding description, and transfers ownership.
* @param _name The name of the ERC721 token.
* @param _Symbol The symbol of the ERC721 token.
* @param _cFundingDescription The description of the crowdfunding campaign.
* @param _cFundingOwner The address of the owner of the crowdfunding campaign.
*/

constructor(
    string memory _name,
    string memory _Symbol,
    string memory _cFundingDescription,
    address _cFundingOwner
    ) ERC721(_name, _Symbol) {
    cFundingDescription = _cFundingDescription;
    transferOwnership(_cFundingOwner);
}
```

#### A solution

Remove `cFundingDescription` variable (`Line 15`), and the usage of `_cFundingDescription` in `Project`'s `constructor` (`Line 76 and 79`)

---

### **[NP-4]** `Project.sol Line 89 - 95`: A function to start the funding period of a `Project` wasn't required by the spec and increases the gas cost of creating a fundable `Project`

A function, `startCfunding` on `Line 89`, to start the funding period of a `Project` wasn't required by the spec, and by not automatically starting the funding period when the `Project` is created, an extra step in creating a fundable `Project` is introduced increasing the gas cost for a `Project`'s `Owner` to create a fundable `Project`.

#### The code (`Line 89 - 95`)

```solidity
/**
* @dev Starts the crowdfunding campaign with a specified goal.
* @notice Can only be called by the contract owner.
* @param _cFundingGoal The funding goal for the crowdfunding campaign.
*/

function startCfunding(uint256 _cFundingGoal) external 
onlyOwner
{
    cFundingGoal = _cFundingGoal;
    cFundingEndTime = block.timestamp + PROJ_DURATION;
    cFundingHasStarted = true;
}
```

#### A solution

Set the variables `cFundingGoal`, `cFundingEndTime`, and `cFundingHasStarted` inside the `Project`'s `constructor`.

---

### [NP-5] `Project.sol Line 48`: Function modifier `expiredCfunding` is checking that a `Project` has **not** expired, but it's name implies a `Project` has expired

When the function modifier `expiredCfunding` is used e.g. `Line 106`, it's intended use is to keep a function from being used after a `Project` has reached it's deadline (`block.timestamp < cFundingEndTime`), however when the modifier is used with a function, it looks like a `Project`'s expiration is a requirement of the function.

#### Example usage (`Line 102 - 111`)

When calling `cancelCfunding` on `Line 102`, a `Project`'s `Owner` should understand that the function will revert if the `Project` has expired (`block.timestamp >= cFundingEndTime`), but the name of the function modifier, `expiredCfunding`, implies that the function is only callable if the `Project` is expired

```solidity
/**
* @dev Cancels the ongoing crowdfunding campaign.
* @notice Can only be called by the contract owner.
*/

function cancelCfunding() external 
onlyOwner 
cFundingStarted
activeCfunding
expiredCfunding
cFundCompleted
{
    cFundingIsCancelled = true;
    emit CanceledCfunding("the crowdfunding has been cancelled");
}
```

#### A solution

Consider renaming the modifier, `expiredCfunding` (`Line 48`), to something similar to `CFundingNotExpired` to provide a better context when using functions that have this modifier.

---

### [NP-6] `Project.sol Line 53`: Function modifier `cFundCompleted` is checking that a `Project` has not been completed (`!cFundingIsDone`), but it's name implies a `Project` has a completed status

When the function modifier `cFundCompleted` is used e.g. `Line 107`, it's intended use is to keep a function from being used after a `Project` has reached a completed status (`cFundingIsDone = true`), however when the modifier is used with a function, it looks like a `Project`'s completed status is a requirement of the function.

#### Example usage (`Line 102 - 111`)

When calling `cancelCfunding` on `Line 102`, a `Project`'s `Owner` should understand that the function will revert if the `Project` has already been complete (`cFundingIsDone = true`), but the name of the function modifier, `cFundCompleted`, implies that the function is only callable if the `Project` is completed

```solidity
/**
* @dev Cancels the ongoing crowdfunding campaign.
* @notice Can only be called by the contract owner.
*/

function cancelCfunding() external 
onlyOwner 
cFundingStarted
activeCfunding
expiredCfunding
cFundCompleted
{
    cFundingIsCancelled = true;
    emit CanceledCfunding("the crowdfunding has been cancelled");
}
```

#### A solution

Consider renaming the modifier, `cFundCompleted` (`Line 53`), to something similar to `CFundingNotCompleted` to provide a better context when using functions that have this modifier.

---

### [NP-7] `Project.sol Line 54`: All other error messages start with a capital `T` for `The`, but the error message for `cFundCompleted` starts with a lowercase `t`

For consistency when parsing error messages returned by the contract, consider capitalizing the `t` in `the` for the error message on `Line 54` (`"the Crowdfunding has ended"`).

#### The code (`Line 53 - 56`)

```solidity
modifier cFundCompleted() {
    require(!cFundingIsDone, "the Crowdfunding has ended");
    _;
}
```

---

### [NP-8] `Project.sol Line 54`: All other error messages use `crowdfunding` with a lower case `c`, but the error message on `Line 54` uses a capital `C`

For consistency when parsing error messages returned by the contract, consider lower casing the `C` in `Crowfunding` for the error message on `Line 54` (`"the Crowdfunding has ended"`).

#### The code (`Line 53 - 56`)

```solidity
modifier cFundCompleted() {
    require(!cFundingIsDone, "the Crowdfunding has ended");
    _;
}
```

---

### [NP-9] `Project.sol Line 110`: The name of the event `CanceledCfunding` implies that a project has been cancelled and it's error string doesn't provide additional context, using more gas then necessary as a result

The name of the event `CanceledCfunding` implies that a project has been cancelled and the emitted string: `"the crowdfunding has been cancelled"`, doesn't provide any extra value to the user, but increases the gas cost of calling the function.

#### The code (Line 102 - 111)

```solidity
/**
* @dev Cancels the ongoing crowdfunding campaign.
* @notice Can only be called by the contract owner.
*/

function cancelCfunding() external 
onlyOwner 
cFundingStarted
activeCfunding
expiredCfunding
cFundCompleted
{
    cFundingIsCancelled = true;
    emit CanceledCfunding("the crowdfunding has been cancelled");
}
```

#### A solution

Consider removing the error string from `Line 110`, and because `CanceledCfunding` is not used elsewhere, consider removing the `message` argument from the event on `Line 33`.

With the above recommendations implemented, `15,037` gas is saved upon creation of a `Project`, and `1,138` is saved when `cancelCfunding` is called.

```solidity
event CanceledCfunding();

/**
* @dev Cancels the ongoing crowdfunding campaign.
* @notice Can only be called by the contract owner.
*/

function cancelCfunding() external 
onlyOwner 
cFundingStarted
activeCfunding
expiredCfunding
cFundCompleted
{
    cFundingIsCancelled = true;
    emit CanceledCfunding();
}
```

---

### [NP-10] `Project.sol Line 136 - 140 and 156 - 160`: `RefundSent` argument for `FailedToRefund` error will always be `false`

Every time `FailedToRefund` is reverted (`Line 137 and 157`), it's argument `RefundSent` is going to be false, otherwise the revert wouldn't have been triggered.

#### The code

##### `Line 119 - 142`

```solidity
/**
* @dev Refunds contributors if the crowdfunding is cancelled or has failed to reach its goal within the specified time.
* @notice Can be called by any contributor.
*/

function refundContributors() external  
cFundingStarted
nonReentrant
{
    require(cFundingIsCancelled || (block.timestamp >= cFundingEndTime && !cFundingIsDone),
        "The crowdfunding must have either been cancelled, or failed to reach its goal within time to for a refund");

    if(ContributionsSentByAddress[msg.sender] < MIN_CONTRIBUTIONS){
            revert InsufficientAmount({
                sent: ContributionsSentByAddress[msg.sender],
                required: MIN_CONTRIBUTIONS
            });
        }

    uint256 addressContributions = ContributionsSentByAddress[msg.sender];
    ContributionsSentByAddress[msg.sender] = 0;
    (bool success, ) = msg.sender.call{ value: addressContributions }("");
    if(!success){
        revert FailedToRefund({
            RefundSent: success
        });
    }
    emit Refund(msg.sender, address(this), addressContributions);
}
```

On `Line 136`, the success of the `call` to refund the function caller is checked. If `false`, the function reverts with the custom error `FailedToRefund`, passing it the `success` variable as it's `RefundSent` argument. In order for `FailedToRefund` to be reverted, `success` **has** to be `false`, meaning the `RefundSent` argument for `FailedToRefund` will never be anything other than `false` making is an unnecessary gas expenditure.

##### `Line 150 - 170`

The following code operates in the same way as `Line 119 - 142` described above:

```solidity
/**
* @dev Allows the owner to withdraw the collected funds once the crowdfunding goal is reached.
* @notice Can only be called by the contract owner.
*/

function withdrawFunds(uint _amount) external 
onlyOwner
{

    if(cFundingIsDone){
        (bool success, ) = msg.sender.call{ value: _amount }("");
        if(!success){
            revert FailedToRefund({
                RefundSent: success 
            });
        }
        emit Withdraw(msg.sender, address(this), _amount);
    }
    else {
        revert CfundingHasNotEnded({
            currentTime: block.timestamp, 
            TimeLeft: cFundingEndTime,
            currentBalance:address(this).balance,
            targetBalance: cFundingGoal});
    }
}
```

#### A solution

Remove the `RefundSent` argument for the `FailedToRefund` custom error. Removing the argument provides a gas savings of `1,605` upon creation of a `Project`, and `32` gas when the revert is triggered.

---

### [NP-11] `Project.sol Line 157 - 159`: Consider creating a specific custom error for failed withdraws

The function `withdrawFunds` (`Line 150`) uses the same custom error, `FailedToRefund`, as `refundContributors` does (`Line 137`) even though refunds and withdraw are two separate and unrelated actions of the `Project`'s state machine.

#### The code (Line 150 - 170)

```solidity
/**
* @dev Allows the owner to withdraw the collected funds once the crowdfunding goal is reached.
* @notice Can only be called by the contract owner.
*/

function withdrawFunds(uint _amount) external 
onlyOwner
{

    if(cFundingIsDone){
        (bool success, ) = msg.sender.call{ value: _amount }("");
        if(!success){
            revert FailedToRefund({
                RefundSent: success 
            });
        }
        emit Withdraw(msg.sender, address(this), _amount);
    }
    else {
        revert CfundingHasNotEnded({
            currentTime: block.timestamp, 
            TimeLeft: cFundingEndTime,
            currentBalance:address(this).balance,
            targetBalance: cFundingGoal});
    }
}
```

#### A solution

Consider creating a specific custom error for failed withdraws e.g. `FailedToWithdraw` to provide better context to the creator of the `Project` when their withdraw fails to process.

---

### [NP-12] `Project.sol Line 141`: It's not necessary to provide `address(this)` as an argument of the `Refund` event, address is already known

Whomever is parsing the `Refund` event will already know the address of the `Project` contract (as either the `to` property of the transaction the event they're parsing belongs to, or because they're subscribed to the events of the `Project` which requires the address to be known).

#### The code (`Line 31 and 119 - 142`)

```solidity
event Refund(address indexed receiver, address indexed cfund, uint256 indexed amount);

/**
* @dev Refunds contributors if the crowdfunding is cancelled or has failed to reach its goal within the specified time.
* @notice Can be called by any contributor.
*/

function refundContributors() external  
cFundingStarted
nonReentrant
{
    require(cFundingIsCancelled || (block.timestamp >= cFundingEndTime && !cFundingIsDone),
        "The crowdfunding must have either been cancelled, or failed to reach its goal within time to for a refund");

    if(ContributionsSentByAddress[msg.sender] < MIN_CONTRIBUTIONS){
            revert InsufficientAmount({
                sent: ContributionsSentByAddress[msg.sender],
                required: MIN_CONTRIBUTIONS
            });
        }

    uint256 addressContributions = ContributionsSentByAddress[msg.sender];
    ContributionsSentByAddress[msg.sender] = 0;
    (bool success, ) = msg.sender.call{ value: addressContributions }("");
    if(!success){
        revert FailedToRefund({
            RefundSent: success
        });
    }
    emit Refund(msg.sender, address(this), addressContributions);
}
```

#### A solution

Remove the `cfund` argument from the `Refund` event (`Line 31`). Removing the argument provides a gas savings of `380` every time `refundContributors` is called.

---

### [NP-13] `Project.sol Line 161`: It's not necessary to provide `address(this)` as an argument of the `Withdraw` event, address is already known

Whomever is parsing the `Withdraw` event will already know the address of the `Project` contract (as either the `to` property of the transaction the event they're parsing belongs to, or because they're subscribed to the events of the `Project` which requires the address to be known).

#### The code (`Line 32 and 150 - 170`)

```solidity
event Withdraw(address indexed receiver, address indexed cfund, uint256 indexed amount);

/**
* @dev Allows the owner to withdraw the collected funds once the crowdfunding goal is reached.
* @notice Can only be called by the contract owner.
*/

function withdrawFunds(uint _amount) external 
onlyOwner
{

    if(cFundingIsDone){
        (bool success, ) = msg.sender.call{ value: _amount }("");
        if(!success){
            revert FailedToRefund({
                RefundSent: success 
            });
        }
        emit Withdraw(msg.sender, address(this), _amount);
    }
    else {
        revert CfundingHasNotEnded({
            currentTime: block.timestamp, 
            TimeLeft: cFundingEndTime,
            currentBalance:address(this).balance,
            targetBalance: cFundingGoal});
    }
}
```

#### A solution

Remove the `cfund` argument from the `Withdraw` event (`Line 32`). Removing the argument provides a gas savings of `380` every time `withdrawFunds` is called.

---

### [NP-14] `Project.sol Line 150 - 170`: Consider adding something similar to `InsufficientFunds` custom error to `withdrawFunds`

If the `Project`'s `Owner` calls `withdrawFunds` (`Line 150`) with an `_amount` greater than the `Project`'s balance, the transaction reverts because the `call` on `Line 155` fails. However, gas could be saved by explicitly checking if the amount of the withdraw being requested exceeds the balance of the `Project`.

#### Existing code (`Line 150 - 170`)

```solidity
/**
* @dev Allows the owner to withdraw the collected funds once the crowdfunding goal is reached.
* @notice Can only be called by the contract owner.
*/

function withdrawFunds(uint _amount) external 
onlyOwner
{

    if(cFundingIsDone){
        (bool success, ) = msg.sender.call{ value: _amount }("");
        if(!success){
            revert FailedToRefund({
                RefundSent: success 
            });
        }
        emit Withdraw(msg.sender, address(this), _amount);
    }
    else {
        revert CfundingHasNotEnded({
            currentTime: block.timestamp, 
            TimeLeft: cFundingEndTime,
            currentBalance:address(this).balance,
            targetBalance: cFundingGoal});
    }
}
```

#### Revised Code

```solidity
error InsufficientFunds(uint request, uint available);

/**
* @dev Allows the owner to withdraw the collected funds once the crowdfunding goal is reached.
* @notice Can only be called by the contract owner.
*/

function withdrawFunds(uint _amount) external 
onlyOwner
{

    if(cFundingIsDone){
	    // Here a check has been added to insure the withdraw _amount doesn't
	    // exceed the Project's balance
        if (_amount > address(this).balance) revert InsufficientFunds(_amount, address(this).balance);

        (bool success, ) = msg.sender.call{ value: _amount }("");
        if(!success){
            revert FailedToRefund({
                RefundSent: success 
            });
        }
        emit Withdraw(msg.sender, address(this), _amount);
    }
    else {
        revert CfundingHasNotEnded({
            currentTime: block.timestamp, 
            TimeLeft: cFundingEndTime,
            currentBalance:address(this).balance,
            targetBalance: cFundingGoal});
    }
}
```

Implementing the suggested code would provide a gas savings of `6,870` every time `withdrawFunds` reverted because of a failed `call` due to the `_amount` exceeded the `Project`'s balance.

---

### [NP-15] `Project.sol Line 180`: A `balanceOf(msg.sender)` call is made, but nothing is done with the response

It looks like a `balanceOf(msg.sender)` was erroneously added.

#### The code

```solidity
/**
* @dev Mints an NFT for the contributor.
* @notice Can be called by any contributor.
*/
function mintNFT() external
nonReentrant
{
	// The return value of this function is ignored
    balanceOf(msg.sender);
    if( (ContributionsSentByAddress[msg.sender] / 1 ether - balanceOf(msg.sender))  > 0){

        _safeMint(msg.sender, tokenIds);
    
        tokenIds += 1;
    }
    else{
        revert CanMintNFT({
            NFTsUserCanMint: ContributionsSentByAddress[msg.sender] / 1 ether - balanceOf(msg.sender)
        });
    }
}
```

#### A solution

Remove the unused call on `Line 180`.

---

### [NP-16] `Project.sol Line 211 - 214`: Duplicate getter function for getting contributions by address

The getter function, `contributors` (`Line 211`) is unnecessary because the mapping, `ContributionsSentByAddress` (`Line 26`) is public, so a getter function will automatically be created for it.

#### The code (`Line 26 and 211 - 214`)

```solidity
mapping(address => uint256) public ContributionsSentByAddress;

/**
* @dev Retrieves the total contributions sent by a given user.
* @notice Call this function to check the total contributions made by a specific user.
* @param _user The address of the user whose contributions are being queried.
* @return The total amount of contributions (in wei) made by the specified user.
*/
function contributors(address _user) external view returns(uint)
{
    return ContributionsSentByAddress[_user];
} 
```

#### A solution

The usage of the function `contributors` (`Line 211`) can be replaced with a direct call to the mapping `ContributionsSentByAddress` (`Line 26`).

The following code is assuming a `Project` has been created with any goal. The following code also assumes an `ethers.js` contract wrapper (called `project`) has already been instantiated for the previously mentioned deployed `Project`, and an `ethers.js` signer has been configured (called `alice`):

```solidity
// Alice contributes ONE_ETHER to the Project
await project.connect(alice).ContributeEther({ value: ONE_ETHER });

// The amount contributed by Alice's address can be retrieved without
// having to call the getter function, contributors (Line 211), like so:
await project.ContributionsSentByAddress(alice.address);
```

---

### [NP-17] `Project.sol Line 221 - 224`: Unnecessary `totalContributed` getter function

Because the total amount contributed to a `Project` is tracked by the current balance of the `Project`, the usage of the function `totalContributed` (`Line 221 - 224`) can be replaced with an `eth_getBalance` RPC call to any Ethereum node.

#### The code (`Line 221 - 224`)

```solidity
/**
* @dev Calculates the total contributions received by the contract.
* @notice Call this function to check the total amount of contributions received by the contract.
* @return The total amount of contributions (in wei) received by the contract.
*/
function totalContributed() public view returns(uint)
{
    return(address(this).balance);
}
```

#### A solution

```solidity
await ethers.provider.getBalance(project.address);
```
