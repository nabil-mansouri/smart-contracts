// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./AbstractContract.sol";

contract StakingContract is IERC777Recipient, AbstractContract {
    using SafeMath for uint256;
    IERC1820Registry private _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
    bytes32 constant private TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");
    //PRIVATE MEMBERS CONFIG
    uint256 private endDate;
    uint256 private startDate;
    uint256 private rewardTotal;
    IERC20 private tokenContract;
    address private tokenAddress;
    uint256 private rewardPercent;
    //PRIVATE MEMBERS MUTABLE
    uint256 private stakeTotal = 0;
    uint256 private rewardDistribute = 0;
    mapping(address => UserReward) private userReward;
    mapping(address => UserInfos) private userCurrent;
    mapping(address => UserInfos[]) private userHistory;
    //EVENTS
    //event TokenReceived(address operator, address from, address to, uint256 amount, bytes userData, bytes operatorData);
    event UserStaked(address from, uint256 amount);
    event UserWithdrawed(address from, uint256 amount);
    event UserCollected(address from, uint256 amount);

    constructor(StakeConfig memory config) {
        setConfig(config);
        _erc1820.setInterfaceImplementer(address(this), TOKENS_RECIPIENT_INTERFACE_HASH, address(this));
    }  
    //VIEWS
    function historyOf(address account) public view returns (UserInfos[] memory) {
        return userHistory[account];
    }

    function stakingOf(address account) public view returns (UserInfos memory) {
        uint256 endAt_ = block.timestamp;
        UserInfos memory current = userCurrent[account];
        //update pending rewards
        current.earned = _computeRewards(current.startAt, endAt_, current.staked);
        return current;
    }

    function rewardOf(address account) public view returns (UserReward memory) {
        return userReward[account];
    } 

    function stackingInfos() public view returns (StakeInfos memory) {
        uint256 stakeRemain = _maxRemainStake();
        uint256 stakeMax = _maxTotalStaked();
        uint256 rewardRemain = rewardTotal.sub(rewardDistribute);
        return StakeInfos({
            startAt: startDate,
            endAt: endDate,
            stakeMax: stakeMax,
            stakeRemain: stakeRemain,
            stakeTotal: stakeTotal,
            rewardTotal: rewardTotal,
            rewardRemain: rewardRemain,
            rewardDistribute: rewardDistribute,
            rewardPercent: rewardPercent
        });
    } 

    function stakeConfig() public view onlyOwner returns (StakeConfig memory) {
        return StakeConfig({
            endDate: endDate,
            startDate: startDate,
            rewardTotal: rewardTotal,
            tokenAddress: tokenAddress,
            rewardPercent: rewardPercent
        });
    }

    //HOOK
    function tokensReceived(
        address /*operator*/,
        address from,
        address /*to*/,
        uint256 _amount,
        bytes calldata /*userData*/,
        bytes calldata /*operatorData*/
    ) external nonReentrant override {
        require(msg.sender == tokenAddress, "Staking: Invalid token");
        if(from == tokenAddress || from == owner()){
            return;//deposit
        }
        require(paused()==false, "Stake: stake paused");
        require(_stake(from, _amount)==true, "Stake: stake failed");
        emit UserStaked(from, _amount);
        //emit TokenReceived(operator, from, to, amount, userData, operatorData);
    }

    //ADMIN ACTION

    function stakeCheck(uint _amount) external onlyOwner returns (bool) {
        require(_amount > 0, "Staking: Stake should be positive");
        bool res = tokenContract.transferFrom(msg.sender, address(this), _amount);
        require(res==true, "Staking: Need to approve the transfer");
        require(_stake(msg.sender, _amount)==true, "Stake: stake failed");
        return true;
    }

    function withdrawCheck(uint _amount) external nonReentrant onlyOwner returns (bool) {
        require(_unstake(msg.sender, _amount)==true, "Stake: unstake failed");
        bool res = tokenContract.transfer(msg.sender, _amount);
        require(res==true, "Staking: Transfer failed");
        emit UserWithdrawed(msg.sender, _amount);
        return true;
    }

    function collectRewardsCheck() public nonReentrant onlyOwner returns (uint) {
        return _collectRewards(true);
    }

    //PUBLIC ACTIONS
    function stake(uint _amount) external whenNotPaused returns (bool) {
        require(_amount > 0, "Staking: Stake should be positive");
        bool res = tokenContract.transferFrom(msg.sender, address(this), _amount);
        require(res==true, "Staking: Need to approve the transfer");
        return true;
    }

    function withdraw(uint _amount, bool _collect) external nonReentrant whenNotPaused returns (bool) {
        require(_unstake(msg.sender, _amount)==true, "Stake: unstake failed");
        bool res = tokenContract.transfer(msg.sender, _amount);
        require(res==true, "Staking: Transfer failed");
        emit UserWithdrawed(msg.sender, _amount);
        if(_collect){
            _collectRewards(false);
            return true;
        } else {
            return true;
        }
    }

    function collectRewards() public nonReentrant whenNotPaused returns (uint) {
        return _collectRewards(true);
    }

    function setConfig(StakeConfig memory config) public onlyOwner returns (bool) {
        endDate =  config.endDate;
        startDate =  config.startDate;
        rewardTotal =  config.rewardTotal;
        tokenAddress =  config.tokenAddress;
        rewardPercent =  config.rewardPercent;
        tokenContract = IERC20(tokenAddress);
        return true;
    }

    //PRIVATE FUNCTION
    function _collectRewards(bool failedIfNull) private returns (uint) {
        UserReward storage old = userReward[msg.sender];
        UserInfos storage current = userCurrent[msg.sender];
        uint256 remain = old.earned.sub(old.paid);
        //add current reward
        if(current.staked > 0 && current.closed == false){
            uint256 endAt_ = block.timestamp;
            current.earned = _computeRewards(current.startAt, endAt_, current.staked);
            remain = remain.add(current.earned.sub(current.paid));
        }
        //check
        if(failedIfNull){
            require(remain > 0, "Staking: No rewards available");
        }
        //update paid
        old.paid = old.earned;
        current.paid = current.earned;
        //update counter and transfer
        rewardDistribute = rewardDistribute.add(remain);
        if(remain > 0){
            bool res = tokenContract.transfer(msg.sender, remain);
            require(res==true, "Staking: Transfer failed");
            emit UserCollected(msg.sender, remain);
        }
        return remain;
    }


    function _stake(address from, uint _amount) private returns (bool) {
        uint256 started = block.timestamp;
        require(_amount > 0, "Staking: accept only positive amout");
        require(from != address(0), "Staking: accept only non zero address");
        require(started < endDate, "Staking: staking is finished");
        require(_canAddStake(_amount), "Staking: Pool full");
        //closed old entry
        UserInfos storage old = _endCurrent(from, started);
        //add new entry
        userCurrent[from] = UserInfos({
            startAt: started,
            endAt: 0,
            staked: old.staked.add(_amount),
            earned: 0,
            paid: 0,
            closed: false
        });
        //add total amount
        stakeTotal = stakeTotal.add(_amount);
        return true;
    }

    function _unstake(address from, uint _amount) private returns (bool) {
        require(_amount > 0, "Staking: accept only positive amout");
        require(from != address(0), "Staking: accept only non zero address");
        uint256 started = block.timestamp;
        UserInfos storage old = _endCurrent(from, started);
        require(old.staked >= _amount, "Staking: Withdraw too much");
        //add new entry
        userCurrent[from] = UserInfos({
            startAt: started,
            endAt: 0,
            staked: old.staked.sub(_amount),
            earned: 0,
            paid: 0,
            closed: false
        });
        //remove amount from total
        stakeTotal = stakeTotal.sub(_amount);
        return true;
    }

    function _endCurrent(address from, uint256 _endAt) private returns (UserInfos storage) {
        UserInfos storage old = userCurrent[from];
        if(old.staked > 0 && old.closed == false){
            old.earned = _computeRewards(old.startAt, _endAt, old.staked);
            old.endAt = _endAt;
            old.closed = true;
            userHistory[from].push(old);
            UserReward storage reward = userReward[from];
            reward.earned = reward.earned.add(old.earned);
            reward.paid = reward.paid.add(old.paid);
        }
        return old;
    }

    function _computeRewards(uint256 _startAt, uint256 _endAt, uint256 _staked) private view returns (uint256) {
        uint256 safeStart = Math.max(startDate, _startAt);
        uint256 safeEnd = Math.min(endDate, _endAt);
        if(safeEnd < safeStart){
            return 0;
        }
        uint256 secondFullPeriod = endDate.sub(startDate);
        uint256 secondPartialPeriod = safeEnd.sub(safeStart);
        uint256 rewardForAllPeriod = _staked.mul(rewardPercent).div(100);
        //secondFullPeriod => rewardForAllPeriod
        //secondPartialPeriod => rewardForPartial
        uint256 rewardForPartial = secondPartialPeriod.mul(rewardForAllPeriod).div(secondFullPeriod);
        return rewardForPartial;
    }

    function _maxTotalStaked() private view returns (uint256) {
        return rewardTotal.div(rewardPercent).mul(100);
    }

    function _maxRemainStake() private view returns (uint256) {
        return _maxTotalStaked().sub(stakeTotal);
    }

    function _canAddStake(uint256 _amount) private view returns (bool) {
        return _amount <= _maxRemainStake();
    }

    //STRUCT
    struct StakeConfig{
        uint256 endDate;
        uint256 startDate;
        uint256 rewardTotal;
        address tokenAddress;
        uint256 rewardPercent;
    }

    struct StakeInfos{
        uint256 startAt;
        uint256 endAt;
        uint256 stakeMax;
        uint256 stakeRemain;
        uint256 stakeTotal;
        uint256 rewardTotal;
        uint256 rewardRemain;
        uint256 rewardDistribute;
        uint256 rewardPercent;
    }

    struct UserInfos{
        uint256 startAt;
        uint256 endAt;
        uint256 staked;
        uint256 earned;
        uint256 paid;
        bool closed;
    }

    struct UserReward{
        uint256 earned;
        uint256 paid;
    }
}