// ----------------------------------------------------------------------------
// REQUIRED: Instructions
// ----------------------------------------------------------------------------
/*
  For this first project, we've provided a significant amount of scaffolding
  in your test suite. We've done this to:

    1. Set expectations, by example, of where the bar for testing is.
    3. Reduce the amount of time consumed this week by "getting started friction".

  Please note that:

    - We will not be so generous on future projects!
    - The tests provided are about ~90% complete.
    - IMPORTANT:
      - We've intentionally left out some tests that would reveal potential
        vulnerabilities you'll need to identify, solve for, AND TEST FOR!

      - Failing to address these vulnerabilities will leave your contracts
        exposed to hacks, and will certainly result in extra points being
        added to your micro-audit report! (Extra points are _bad_.)

  Your job (in this file):

    - DO NOT delete or change the test names for the tests provided
    - DO complete the testing logic inside each tests' callback function
    - DO add additional tests to test how you're securing your smart contracts
         against potential vulnerabilties you identify as you work through the
         project.

    - You will also find several places where "FILL_ME_IN" has been left for
      you. In those places, delete the "FILL_ME_IN" text, and replace with
      whatever is appropriate.
*/
// ----------------------------------------------------------------------------

import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, BigNumberish } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Project,
  ProjectFactory,
  ProjectFactory__factory,
} from "../typechain-types"; // eslint-disable-line

// ----------------------------------------------------------------------------
// OPTIONAL: Constants and Helper Functions
// ----------------------------------------------------------------------------
// We've put these here for your convenience, and to make you aware these built-in
// Hardhat functions exist. Feel free to use them if they are helpful!
const SECONDS_IN_DAY: number = 60 * 60 * 24;
const ONE_ETHER: BigNumber = ethers.utils.parseEther("1");

// Bump the timestamp by a specific amount of seconds
const timeTravel = async (seconds: number): Promise<number> => {
  return time.increase(seconds);
};

// Or, set the time to be a specific amount (in seconds past epoch time)
const timeTravelTo = async (seconds: number): Promise<void> => {
  return time.increaseTo(seconds);
};

// Compare two BigNumbers that are close to one another.
//
// This is useful for when you want to compare the balance of an address after
// it executes a transaction, and you don't want to worry about accounting for
// balances changes due to paying for gas a.k.a. transaction fees.
const closeTo = async (
  a: BigNumberish,
  b: BigNumberish,
  margin: BigNumberish
) => {
  expect(a).to.be.closeTo(b, margin);
};
// ----------------------------------------------------------------------------

describe("Crowdfundr", () => {
  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let charlie: SignerWithAddress;

  let ProjectFactory: ProjectFactory__factory;
  let projectFactory: ProjectFactory;

  beforeEach(async () => {
    [deployer, alice, bob, charlie] = await ethers.getSigners();

    // NOTE: You may need to pass arguments to the `deploy` function if your
    //       ProjectFactory contract's constructor has input parameters
    ProjectFactory = (await ethers.getContractFactory(
      "ProjectFactory"
    )) as ProjectFactory__factory;
    projectFactory =
      (await ProjectFactory.deploy(/* FILL_ME_IN: */)) as ProjectFactory;
    await projectFactory.deployed();
  });

  describe("ProjectFactory: Additional Tests", () => {
    /*
      TODO: You may add additional tests here if you need to

      NOTE: If you wind up writing Solidity code to protect against a
            vulnerability that is not tested for below, you should add
            at least one test here.

      DO NOT: Delete or change the test names for the tests provided below
    */
  });

  describe("ProjectFactory", () => {
    it("Deploys a contract", async () => {
      expect(projectFactory.address).to.exist;
    });
  
    // NOTE: This test is just for demonstrating/confirming that eslint is set up to warn about floating promises.
    // If you do not see an error in the `it` test below you must enable ESLint in your editor. You are likely
    // missing important bugs in your tests and contracts without it.
    // it("Flags floating promises", async () => {
    //   const txReceiptUnresolved = await projectFactory.connect(alice).create();
    //   expect(txReceiptUnresolved.wait()).to.be.reverted;
    // });
  
    it("Can register a single project", async () => {
      await projectFactory.connect(alice).create("Project1", "P1", "Description1");
      expect(await projectFactory.projects(0)).to.exist;
    });
  
    it("Can register multiple projects", async () => {
      await projectFactory.connect(alice).create("Project1", "P1", "Description1");
      await projectFactory.connect(alice).create("Project2", "P2", "Description2");
      expect(await projectFactory.projects(0)).to.exist;
      expect(await projectFactory.projects(1)).to.exist;
    });
  
    it("Registers projects with the correct creator", async () => {
      await projectFactory.connect(alice).create("Project1", "P1", "Description1");
      const projectAddress = await projectFactory.projects(0);
      const project = await ethers.getContractAt("Project", projectAddress);
      expect(await project.owner()).to.equal(alice.address);
    });
  
    it("Registers projects with a preset funding goal (in units of wei)", async () => {
      await projectFactory.connect(alice).create("Project1", "P1", "Description1");
      const projectAddress = await projectFactory.projects(0);
      const project = await ethers.getContractAt("Project", projectAddress);
      await project.connect(alice).startCfunding(ethers.utils.parseEther("10"));
      expect(await project.cFundingGoal()).to.equal(ethers.utils.parseEther("10"));
    });
  
    it('Emits a "ProjectCreated" event after registering a project', async () => {
      await expect(projectFactory.connect(alice).create("Project1", "P1", "Description1"))
        .to.emit(projectFactory, "ProjectCreated");
    });
  
    it("Allows multiple contracts to accept ETH simultaneously", async () => {
      await projectFactory.connect(alice).create("Project1", "P1", "Description1");
      await projectFactory.connect(alice).create("Project2", "P2", "Description2");
      const projectAddress1 = await projectFactory.projects(0);
      const projectAddress2 = await projectFactory.projects(1);
      const project1 = await ethers.getContractAt("Project", projectAddress1);
      const project2 = await ethers.getContractAt("Project", projectAddress2);
  
      await project1.connect(alice).startCfunding(ethers.utils.parseEther("10"));
      await project2.connect(alice).startCfunding(ethers.utils.parseEther("10"));
  
      await project1.connect(alice).ContributeEther({value: ethers.utils.parseEther("5")});
      await project2.connect(alice).ContributeEther({value: ethers.utils.parseEther("5")});
  
      expect(await ethers.provider.getBalance(project1.address)).to.equal(ethers.utils.parseEther("5"));
      expect(await ethers.provider.getBalance(project2.address)).to.equal(ethers.utils.parseEther("5"));
    });
  });

  describe("Project: Additional Tests", () => {
    /*
      TODO: You may add additional tests here if you need to

      NOTE: If you wind up protecting against a vulnerability that is not
            tested for below, you should add at least one test here.

      DO NOT: Delete or change the test names for the tests provided below
    */
  });

  describe("Project", () => {
    let projectAddress: string;
    let project: Project;

    beforeEach(async () => {
      // TODO: Your ProjectFactory contract will need a `create` method, to
      //       create new Projects
      const txReceiptUnresolved = await projectFactory.create("Project1", "P1", "Description1");
      // console.log(txReceiptUnresolved);
      const txReceipt = await txReceiptUnresolved.wait();
      // console.log(txReceipt);
      projectAddress = txReceipt.events![0].address;
      // console.log(projectAddress);
      project = (await ethers.getContractAt(
        "Project",
        projectAddress
      )) as Project;
    });

    describe("Contributions", () => {
      describe("Contributors", () => {
        it("Allows the creator to contribute", async () => {
          await project.startCfunding(ethers.utils.parseEther("10"));
          await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("0.01") });
          expect(await project.contributors(alice.address)).to.equal(ethers.utils.parseEther("0.01"));
        });
  
        it("Allows any EOA to contribute", async () => {
          await project.startCfunding(ethers.utils.parseEther("10"));
          await project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("0.01") });
          expect(await project.contributors(bob.address)).to.equal(ethers.utils.parseEther("0.01"));
        });
  
        it("Allows an EOA to make many separate contributions", async () => {
          await project.startCfunding(ethers.utils.parseEther("10"));
          await project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("0.01") });
          await project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("0.02") });
          expect(await project.contributors(bob.address)).to.equal(ethers.utils.parseEther("0.03"));
        });
  
        it('Emits a "Contribution" event after a contribution is made', async () => {
          await project.startCfunding(ethers.utils.parseEther("10"));
          await expect(project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("0.01") }))
            .to.emit(project, "Contribution")
            .withArgs(bob.address,project.address, ethers.utils.parseEther("0.01"));
        });
      });
  
      describe("Minimum ETH Per Contribution", () => {
        it("Reverts contributions below 0.01 ETH", async () => {
          await project.startCfunding(ethers.utils.parseEther("10"));
          await expect(project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("0.009") }))
            .to.be.revertedWithCustomError(project,"InsufficientAmount");
        });
  
        it("Accepts contributions of exactly 0.01 ETH", async () => {
          await project.startCfunding(ethers.utils.parseEther("10"));
          await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("0.01") });
          expect(await project.contributors(alice.address)).to.equal(ethers.utils.parseEther("0.01"));
        });
      });
  
      describe("Final Contributions", () => {
        it("Allows the final contribution to exceed the project funding goal", async () => {
          await project.startCfunding(ethers.utils.parseEther("3"));
          await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("1") });
          await project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("3") });
          expect(await project.totalContributed()).to.equal(ethers.utils.parseEther("4"));
        });
  
        it("Prevents additional contributions after a project is fully funded", async () => {
          await project.startCfunding(ethers.utils.parseEther("1"));
          await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("1") });
          await expect(project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("1") }))
            .to.be.revertedWith("the Crowdfunding has ended");
        });

        it("Prevents additional contributions after 30 days have passed since Project instance deployment", async () => {
          await project.startCfunding(ethers.utils.parseEther("2"));
          await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // Mine the next block
      
          await expect(project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("1") }))
              .to.be.revertedWith("The crowdfunding has expired, call the refund function to recieve all sent eth ");
      });

        describe("Withdrawals", () => {
          describe("Project Status: Active", () => {
            it("Prevents the creator from withdrawing any funds", async () => {
              await project.startCfunding(ethers.utils.parseEther("10"));
              await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("1") });
            
              await expect(project.withdrawFunds(ethers.utils.parseEther("1")))
                .to.be.revertedWithCustomError(project,"CfundingHasNotEnded");
            });
      
            it("Prevents contributors from withdrawing any funds", async () => {
              await project.startCfunding(ethers.utils.parseEther("2"));
              await project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("1") });
      
              await expect(project.connect(bob).withdrawFunds(ethers.utils.parseEther("1")))
                .to.be.revertedWith("Ownable: caller is not the owner");
            });
      
            it("Prevents non-contributors from withdrawing any funds", async () => {
              await project.startCfunding(ethers.utils.parseEther("1"));
              
              await expect(project.connect(charlie).withdrawFunds(ethers.utils.parseEther("1")))
                .to.be.revertedWith("Ownable: caller is not the owner");
            });
          });
      
          describe("Project Status: Success", () => {
            it("Allows the creator to withdraw some of the contribution balance", async () => {
              await project.startCfunding(ethers.utils.parseEther("4"));
              await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("4") });
          
              await project.withdrawFunds(ethers.utils.parseEther("1"));
              const balanceAfterWithdraw = await ethers.provider.getBalance(project.address);
          
              expect(ethers.utils.formatEther(balanceAfterWithdraw)).to.equal("3.0");
            });
    
            it("Allows the creator to withdraw the entire contribution balance", async () => {
              await project.startCfunding(ethers.utils.parseEther("2"));
              await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("2") });
          
              await project.withdrawFunds(ethers.utils.parseEther("2"));
              const balanceAfterWithdraw = await ethers.provider.getBalance(project.address);
          
              expect(ethers.utils.formatEther(balanceAfterWithdraw)).to.equal("0.0");
          });
          
    
          it("Allows the creator to make multiple withdrawals", async () => {
            await project.startCfunding(ethers.utils.parseEther("3"));
            await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("3") });
        
            await project.withdrawFunds(ethers.utils.parseEther("1.5"));
            await project.withdrawFunds(ethers.utils.parseEther("1.5"));
        
            const balanceAfterWithdraw = await ethers.provider.getBalance(project.address);
            expect(ethers.utils.formatEther(balanceAfterWithdraw)).to.equal("0.0");
          });
        
    
          it("Prevents the creator from withdrawing more than the contribution balance", async () => {
            await project.startCfunding(ethers.utils.parseEther("2"));
            await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("2") });
        
            await expect(project.withdrawFunds(ethers.utils.parseEther("3")))
                .to.be.revertedWithCustomError(project,"FailedToRefund");
          });
    
          it('Emits a "Withdraw" event after a withdrawal is made by the creator', async () => {
            await project.startCfunding(ethers.utils.parseEther("2"));
            await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("2") });
        
            await expect(project.withdrawFunds(ethers.utils.parseEther("2")))
                .to.emit(project, "Withdraw")
                .withArgs(deployer.address, project.address, ethers.utils.parseEther("2"));
          });
      
    
          it("Prevents contributors from withdrawing any funds", async () => {
              await project.startCfunding(ethers.utils.parseEther("2"));
              await project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("2") });
          
              await expect(project.connect(bob).withdrawFunds(ethers.utils.parseEther("2")))
                  .to.be.revertedWith("Ownable: caller is not the owner");
          });
        
          it("Prevents non-contributors from withdrawing any funds", async () => {
              await project.startCfunding(ethers.utils.parseEther("3"));
              await project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("2") });
          
              await expect(project.connect(charlie).withdrawFunds(ethers.utils.parseEther("2")))
                  .to.be.revertedWith("Ownable: caller is not the owner");
          });
        
          });
    
          // Note: The terms "withdraw" and "refund" are distinct from one another.
          // Withdrawal = Creator extracts all funds raised from the contract.
          // Refund = Contributors extract the funds they personally contributed.
          describe("Project Status: Failure", () => {
            it("Prevents the creator from withdrawing any funds raised", async () => {
              await project.startCfunding(ethers.utils.parseEther("4"));
              await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("1") });
      
              // Simulate project failure
              await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // Increase time by 30 days
              // Mine the next block
      
              await expect(project.withdrawFunds(ethers.utils.parseEther("1")))
                  .to.be.revertedWithCustomError(project, "CfundingHasNotEnded");
            });
    
            it("Prevents contributors from withdrawing any funds raised", async () => {
              await project.startCfunding(ethers.utils.parseEther("3"));
              await project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("1") });
              await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("1") });
              // Simulate project failure
              // await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // Increase time by 30 days
              // Mine the next block
      
              await expect(project.connect(bob).withdrawFunds(ethers.utils.parseEther("1")))
                  .to.be.revertedWith("Ownable: caller is not the owner");
            });
    
            it("Prevents non-contributors from withdrawing any funds", async () => {
              await project.startCfunding(ethers.utils.parseEther("2"));
              await project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("1") });
              // Simulate project failure
              await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // Increase time by 30 days
               // Mine the next block
      
              await expect(project.connect(charlie).withdrawFunds(ethers.utils.parseEther("1")))
                  .to.be.revertedWith("Ownable: caller is not the owner");
            });

          });
        });
    
        describe("Refunds", () => {
          it("Allows contributors to be refunded when a project fails", async () => {
            await project.startCfunding(ethers.utils.parseEther("4"));
            await project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("1") });
            await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("1") });
    
            // Simulate project failure
            await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // Increase time by 30 days
             // Mine the next block
    
            await expect(project.connect(bob).refundContributors())
                .to.not.be.reverted;
          });
    
          it("Prevents contributors from being refunded if a project has not failed", async () => {
            await project.startCfunding(ethers.utils.parseEther("2"));
            await project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("1") });
    
            await expect(project.connect(bob).refundContributors())
                .to.be.revertedWith("The crowdfunding must have either been cancelled, or failed to reach its goal within time to for a refund");
          });
    
          it('Emits a "Refund" event after a a contributor receives a refund', async () => {
            await project.startCfunding(ethers.utils.parseEther("4"));
            await project.connect(bob).ContributeEther({ value: ethers.utils.parseEther("1") });
    
            // Simulate project failure
            await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // Increase time by 30 days
             // Mine the next block
    
            await expect(project.connect(bob).refundContributors())
                .to.emit(project, "Refund")
                .withArgs(bob.address,project.address, ethers.utils.parseEther("1"));
          });
        });
    
        describe("Cancelations (creator-triggered project failures)", () => {
          it("Allows the creator to cancel the project if < 30 days since deployment has passed", async () => {
            await project.startCfunding(ethers.utils.parseEther("1"));
            await project.cancelCfunding();
            const isCancelled = await project.cFundingIsCancelled();
            expect(isCancelled).to.be.true;
          });
    
          it("Prevents the creator from canceling the project if at least 30 days have passed", async () => {
            await project.startCfunding(ethers.utils.parseEther("1"));
            await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // Increase time by 30 days
             // Mine the next block
    
            await expect(project.cancelCfunding())
                .to.be.revertedWith("The crowdfunding has expired, call the refund function to recieve all sent eth ");
          });
    
          it("Prevents the creator from canceling the project if it has already reached its funding goal", async () => {
            await project.startCfunding(ethers.utils.parseEther("1"));
            await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("1") });
    
            await expect(project.cancelCfunding())
                .to.be.revertedWith("the Crowdfunding has ended");
          });
    
          it("Prevents the creator from canceling the project if it has already been canceled", async () => {
            await project.startCfunding(ethers.utils.parseEther("1"));
            await project.cancelCfunding();
    
            await expect(project.cancelCfunding())
                .to.be.revertedWith("The crowdfunding was cancelled, call the refund function to recieve all sent eth ");
          });
    
          it("Prevents non-creators from canceling the project", async () => {
            await project.startCfunding(ethers.utils.parseEther("1"));
            await expect(project.connect(bob).cancelCfunding())
                .to.be.revertedWith("Ownable: caller is not the owner");
          });
    
          it('Emits a "CanceledCfunding" event after a project is canceled by the creator', async () => {
            await project.startCfunding(ethers.utils.parseEther("1"));
            await expect(project.cancelCfunding())
                .to.emit(project, "CanceledCfunding")
                .withArgs("the crowdfunding has been cancelled");
          });
        });
    
        describe("NFT Contributor Badges", () => {
          it("A contributor who makes a single contribution of at least 1 ETH can claim a badge", async () => {
            await project.startCfunding(ethers.utils.parseEther("2"));
            await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("1") });
            await project.connect(alice).mintNFT();
            const nftCount = await project.balanceOf(alice.address);
            expect(nftCount).to.equal(1);
          });
    
          it("A contributor who makes multiple contributions that sum to at least 1 ETH can claim a badge", async () => {
            await project.startCfunding(ethers.utils.parseEther("2"));
            await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("0.5") });
            await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("0.5") });
            await project.connect(alice).mintNFT();
            const nftCount = await project.balanceOf(alice.address);
            expect(nftCount).to.equal(1);
          });
    
          it("Does not award a contributor with a badge if their total contribution to a single project sums to < 1 ETH", async () => {
            await project.startCfunding(ethers.utils.parseEther("2"));
            await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("0.5") });
            await expect(project.connect(alice).mintNFT()).to.be.revertedWithCustomError(project,"CanMintNFT");
          });
    
          it("Awards a contributor with a second badge when their total contribution to a single project sums to at least 2 ETH", async () => {
            await project.startCfunding(ethers.utils.parseEther("3"));
            await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("2") });
            await project.connect(alice).mintNFT();
            await project.connect(alice).mintNFT();
            const nftCount = await project.balanceOf(alice.address);
            expect(nftCount).to.equal(2);
          });
    
          it("Does not award a contributor with a second badge if their total contribution to a single project is > 1 ETH but < 2 ETH", async () => {
            await project.startCfunding(ethers.utils.parseEther("3"));
            await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("1.5") });
            await project.connect(alice).mintNFT();
            await expect(project.connect(alice).mintNFT()).to.be.revertedWithCustomError(project,"CanMintNFT");
          });
    
    
          it("Awards contributors with different NFTs for contributions to different projects", async () => {
            // Set up the second project
            const Project = await ethers.getContractFactory("Project");
            const project2 = await Project.deploy("My Second Project", "MSP", "This is my second project", deployer.address);
            await project2.deployed();
    
            await project.startCfunding(ethers.utils.parseEther("2"));
            await project2.startCfunding(ethers.utils.parseEther("2"));
    
            await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("1") });
            await project2.connect(alice).ContributeEther({ value: ethers.utils.parseEther("1") });
    
            await project.connect(alice).mintNFT();
            await project2.connect(alice).mintNFT();
            const nftCount1 = await project.balanceOf(alice.address);
            const nftCount2 = await project2.balanceOf(alice.address);
            expect(nftCount1).to.equal(1);
            expect(nftCount2).to.equal(1);
          });
    
          it("Allows contributor badge holders to transfer the NFT to another address", async () => {
            await project.startCfunding(ethers.utils.parseEther("2"));
            await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("1") });
            await project.connect(alice).mintNFT();
            await project.connect(alice).transferFrom(alice.address, bob.address, 0);
            const nftCountAlice = await project.balanceOf(alice.address);
            const nftCountBob = await project.balanceOf(bob.address);
            expect(nftCountAlice).to.equal(0);
            expect(nftCountBob).to.equal(1);
          });
    
          it("Allows contributor badge holders to transfer the NFT to another address even after its related project fails", async () => {
            await project.startCfunding(ethers.utils.parseEther("2"));
            await project.connect(alice).ContributeEther({ value: ethers.utils.parseEther("1") });
            await project.connect(alice).mintNFT();
        
            // Time travel to fail the project
            await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // Mine the next block
        
            await project.connect(alice).transferFrom(alice.address, bob.address, 0);
            const nftCountAlice = await project.balanceOf(alice.address);
            const nftCountBob = await project.balanceOf(bob.address);
            expect(nftCountAlice).to.equal(0);
            expect(nftCountBob).to.equal(1);
          });
        });
      })
    })
  })
});
