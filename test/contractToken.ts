//must be first (mock)
import { TestHelper } from "./testHelper";
//import
import { expect } from "chai";
import "mocha";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { TokenContract } from 'typechain-types';

describe("Token", function () {
  let contract: TokenContract;
  let owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress;
  before(async function () {
    await TestHelper.takeSnapshot()
    const testHelper = new TestHelper();
    [owner, addr1, addr2] = await testHelper.signerPromise;
    contract = await testHelper.contractTokenPromise;
  });

  after(async function(){
    await TestHelper.revertSnapshot();
  })

  it("Should set the right owner", async function () {
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("Should assign the total supply of tokens to the owner", async function () {
    const ownerBalance = await contract.balanceOf(owner.address);
    expect(await contract.totalSupply()).to.equal(ownerBalance);
  });

  it("Should transfer tokens between accounts", async function () {
    // Transfer 50 tokens from owner to addr1
    await contract.transfer(addr1.address, 50);
    const addr1Balance = await contract.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(50);
    // Transfer 50 tokens from addr1 to addr2
    // We use .connect(signer) to send a transaction from another account
    await contract.connect(addr1).transfer(addr2.address, 50);
    const addr2Balance = await contract.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(50);
  });

  it("Should fail if sender doesn’t have enough tokens", async function () {
    const initialOwnerBalance = await contract.balanceOf(owner.address);
    try {
      const addr1Balance = await contract.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(0);
      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        contract.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Not enough tokens");
      expect.fail("Should not transfer")
    } catch (e) { }
    finally {
      // Owner balance shouldn't have changed.
      expect(await contract.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    }
  });

  it("Should update balances after transfers", async function () {
    const initialOwnerBalance = await contract.balanceOf(owner.address);
    let addr2Balance = await contract.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(50);
    // Transfer 100 tokens from owner to addr1.
    await contract.transfer(addr1.address, 100);
    // Transfer another 50 tokens from owner to addr2.
    await contract.transfer(addr2.address, 50);
    // Check balances.
    const finalOwnerBalance = await contract.balanceOf(owner.address);
    expect(finalOwnerBalance).to.equal(initialOwnerBalance.add(- 150));
    const addr1Balance = await contract.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(100);
    addr2Balance = await contract.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(100);
  });

  it("Should not allow owner to transfer without allowance", async function () {
    try {
      expect(await contract.balanceOf(addr1.address)).to.equal(100);
      const tx = await contract.transferFrom(owner.address, addr1.address, 10)
      await tx.wait();
      expect.fail("should not allow owner to transfer without allowance")
    } catch (e) { } finally {
      expect(await contract.balanceOf(addr1.address)).to.equal(100);
    }
  });
});