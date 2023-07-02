//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.17;

import "./Project.sol";

/**
 * @title ProjectFactory
 * @dev Smart contract for creating and managing instances of the Project contract.
 */

contract ProjectFactory {
    Project[] public projects;
    mapping(address => uint[]) public ProjectCreationPerOwner;
    event ProjectCreated(address indexed CrowdFundingAddress, address indexed Owner, uint indexed cFundingIndex);

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
}
