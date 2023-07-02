// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Project
 * @dev Smart contract representing a crowdfunding campaign with NFT minting capabilities.
 *      Inherits from Ownable, ERC721, and ReentrancyGuard OpenZeppelin contracts.
 */
contract Project is Ownable, ERC721, ReentrancyGuard {
    // state variables, events, and Error messages =
    string public cFundingDescription;
    uint256 public constant MIN_CONTRIBUTIONS = 0.01 ether;
    uint256 public constant PROJ_DURATION = 30 days;
    uint256 public cFundingEndTime;
    uint256 public cFundingGoal;
    uint256 public tokenIds;

    bool public cFundingIsCancelled = false;
    bool public cFundingIsDone = false;
    bool public cFundingHasStarted = false;

    mapping(address => uint256) public ContributionsSentByAddress;
    mapping(address => uint256) public MintableAmount;


    event Contribution(address indexed sender, address indexed cfund, uint256 indexed amount);
    event Refund(address indexed receiver, address indexed cfund, uint256 indexed amount);
    event Withdraw(address indexed receiver, address indexed cfund, uint256 indexed amount);
    event CanceledCfunding(string message);

    error FailedToRefund(bool RefundSent);
    error InsufficientAmount(uint sent, uint required);
    error CfundingHasNotEnded(uint currentTime, uint TimeLeft, uint currentBalance, uint targetBalance);
    error CanMintNFT(uint NFTsUserCanMint);


    //modifiers
    
    modifier activeCfunding() {
        require(!cFundingIsCancelled, "The crowdfunding was cancelled, call the refund function to recieve all sent eth ");
        _;
    }
    
    modifier expiredCfunding() {
        require(block.timestamp < cFundingEndTime, "The crowdfunding has expired, call the refund function to recieve all sent eth ");
        _;
    }
    
    modifier cFundCompleted() {
        require(!cFundingIsDone, "the Crowdfunding has ended");
        _;
    }

    modifier cFundingStarted(){
        require(cFundingHasStarted, "The current crowdfunding has not started yet");
        _;
    }


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

    /**
     * @dev Checks the number of NFTs a contributor can mint.
     * @notice Can be called by any contributor.
     * @return The number of NFTs the contributor can mint.
     */
    function CheckMintableAmount() external view
    returns(uint)
    {
        return((ContributionsSentByAddress[msg.sender] / 1 ether) - balanceOf(msg.sender) );
    }
    
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

    /**
     * @dev Calculates the total contributions received by the contract.
     * @notice Call this function to check the total amount of contributions received by the contract.
     * @return The total amount of contributions (in wei) received by the contract.
     */
    function totalContributed() public view returns(uint)
    {
        return(address(this).balance);
    }

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
}