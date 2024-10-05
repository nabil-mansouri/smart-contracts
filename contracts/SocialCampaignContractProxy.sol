// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;

import "./SocialCampaignContractAbstract.sol";

//removed IERC777Sender
contract SocialCampaignContractProxy is SocialCampaignContractAbstract, ISocialCampaignContract {
    using Counters for Counters.Counter;
    
    constructor(SocialCampaignConfig memory config) SocialCampaignContractAbstract(config) {}  
    //VIEWS

    function countCampaigns() external override view returns (uint256) {
        return campaignIds.length;
    }

    function countCampaignsFor(address addr) public override view returns (uint256) {
        return myCampaigns[addr].length;
    }

    function getCampaignsById(uint256 id) external override view returns (Campaign memory) {
        return campaigns[id];
    }

    function getMyCampaignsByIndex(address myaddrr,uint256 index) external override view returns (Campaign memory) {
        uint256 id = myCampaigns[myaddrr][index];
        return campaigns[id];
    }

    function getCampaignsByIndex(uint256 index) external override view returns (Campaign memory) {
        uint256 id = campaignIds[index];
        return campaigns[id];
    }

    function countParticipationsFor(address addr) public override view returns (uint256) {
        return myParticipations[addr].length;
    }

    function getParticipationsById(uint256 id) external override view returns (CampaignParticipant memory) {
        return participants[id];
    }

    function getParticipationsFor(address addr, uint256 index) external override view returns (CampaignParticipant memory) {
        uint id = myParticipations[addr][index];
        return participants[id];
    }

    function getParticipationsCampaignFor(address addr, uint256 index) external override view returns (Campaign memory) {
        uint id = myParticipations[addr][index];
        CampaignParticipant storage part = participants[id];
        return campaigns[part.campaignId];
    }

    function countParticipationsForCampaign(uint256 id) external override view returns (uint256) {
        return participantsByCampaign[id].length;
    }

    function getParticipationsCampaignFor(uint256 campaignId, uint256 index) external override view returns (CampaignParticipant memory) {
        uint id = participantsByCampaign[campaignId][index];
        return participants[id];
    }


    function prepareSignatureCampaign(address owner, bytes32 _hash) external view returns (bytes32) {
        return keccak256(abi.encode(owner, _hash, address(this)));
    }

    function generateUserDataCampaign(ISocialCampaignContract.Campaign calldata cam) external pure returns (bytes memory) {
        return abi.encode(cam);
    }
    
    function countMyParticipations() external view returns (uint256) {
        return countParticipationsFor(msg.sender);
    }
    
    function countMyCampaigns() external view returns (uint256) {
        return countCampaignsFor(msg.sender);
    }

    function listMyCampaigns(uint256 start, uint256 limit) external view returns (ISocialCampaignContract.Campaign[] memory) {
        return listCampaignsFor(msg.sender, start, limit);
    }

    function listCampaigns(uint256 start, uint256 limit) external view returns (ISocialCampaignContract.Campaign[] memory) {
        return listCampaignByIds(campaignIds, start, limit);
    }
    
    function listCampaignsFor(address addr,uint256 start, uint256 limit) public view returns (ISocialCampaignContract.Campaign[] memory) {
        uint256[] storage mine = myCampaigns[addr];
        return listCampaignByIds(mine, start, limit);
    }

    function listCampaignByIds(uint256[] storage ids, uint256 start, uint256 limit) internal view returns (ISocialCampaignContract.Campaign[] memory) {
        uint len = ids.length;
        uint256 maxlen = len;
        uint index = 0;
        uint end = maxlen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        ISocialCampaignContract.Campaign[] memory result = new ISocialCampaignContract.Campaign[](len);
        for (uint j = start; j < end && j < maxlen; j++) {
            uint256 id = ids[j];
            ISocialCampaignContract.Campaign memory tmp = campaigns[id];
            result[index++] = tmp;
        }
        return result;
    }

    function listCampaignByStatus(uint256 start, uint256 limit, Lifecycle cycle) external view returns (Campaign[] memory) {
        uint len = campaignIds.length;
        uint256 arrayLen = len;
        uint end = arrayLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        uint index = 0;   
        Campaign[] memory result = new Campaign[](len);
        for (uint j = start; j < end && j < arrayLen; j++) {
            uint256 id = campaignIds[j];
            Campaign storage tmp = campaigns[id];
            if(tmp.status == cycle){
                result[index++] = tmp;
            }else{
                end++;
            }
        }
        return result;
    }

    function listMyParticipations(uint256 start, uint256 limit) external view returns (ISocialCampaignContract.CampaignParticipant[] memory) {
        return listParticipationsFor(msg.sender, start, limit);
    }

    function listParticipationsFor(address addr,uint256 start, uint256 limit) public view returns (ISocialCampaignContract.CampaignParticipant[] memory) {
        uint256[] storage mine = myParticipations[addr];      
        return filterParticipant(start, limit, mine);
    }

    function listCampaignIdsForMe(uint256 start, uint256 limit) external view returns (uint256[] memory) {
        return listCampaignIdsForParticipant(msg.sender, start, limit);
    }

    function listCampaignIdsForParticipant(address addr,uint256 start, uint256 limit) public view returns (uint256[] memory) {
        uint256[] storage mine = myParticipations[addr];
        uint index = 0;
        uint256 len = mine.length;
        uint256 maxlen = len;
        uint end = maxlen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        uint256[] memory result = new uint256[](len);
        for (uint j = start; j < end && j < maxlen; j++) {
            uint id = mine[j];
            CampaignParticipant storage part = participants[id];
            ISocialCampaignContract.Campaign memory tmp = campaigns[part.campaignId];
            result[index++] = tmp.id;
        }
        return result;
    }

    function listMyParticipationsCampaign(uint256 start, uint256 limit) external view returns (ISocialCampaignContract.Campaign[] memory) {
        return listParticipationsCampaignFor(msg.sender, start, limit);
    }

    function listParticipationsCampaignFor(address addr,uint256 start, uint256 limit) public view returns (ISocialCampaignContract.Campaign[] memory) {
        uint256[] storage mine = myParticipations[addr];
        uint index = 0;
        uint256 len = mine.length;
        uint256 maxlen = len;
        uint end = maxlen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        ISocialCampaignContract.Campaign[] memory result = new ISocialCampaignContract.Campaign[](len);
        for (uint j = start; j < end && j < maxlen; j++) {
            uint id = mine[j];
            CampaignParticipant storage part = participants[id];
            ISocialCampaignContract.Campaign memory tmp = campaigns[part.campaignId];
            result[index++] = tmp;
        }
        return result;
    }

    function listParticipantsByCampaign(uint256 id,uint256 start, uint256 limit) public view returns (ISocialCampaignContract.CampaignParticipant[] memory) {
        uint256[] storage mine = participantsByCampaign[id];
        return filterParticipant(start, limit, mine);
    }

    function filterParticipant(uint256 start, uint256 limit, uint256[] storage ids) internal view returns (CampaignParticipant[] memory) {
        uint index = 0;
        uint len = ids.length;
        uint256 arrayLen = len;
        uint end = arrayLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        CampaignParticipant[] memory result = new CampaignParticipant[](len);
        for (uint j = start; j < end && j < arrayLen; j++) {
            uint256 curId = ids[j];
            CampaignParticipant storage tmp = participants[curId];
            result[index++] = tmp;
        }
        return result;
    }

    function countCanClaimParticipationsForCampaign(uint256 id, AbstractContract.TriState canClaim) external view returns (uint256) {
        uint256[] storage mine = participantsByCampaign[id];
        uint256 len = mine.length;
        uint256 count = 0;
        for (uint j = 0; j < len; j++) {
            uint _id = mine[j];
            ISocialCampaignContract.CampaignParticipant memory part = participants[_id];
            if(part.canClaim == canClaim){
                count++;
            }
        }
        return count;
    }
    

    //PUBLIC ACTIONS
    function createCampaign(Campaign calldata campaign) external {
        Price memory price = getPrice(SERVICE_CAMPAIGN);
        doCreateCampaign(campaign, msg.sender, price.amount, true);
    }

    function addBalance(uint256 campaignId, uint256 amount) external payable  whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("addBalance(uint256,uint256)", campaignId, amount)
        );
        require(success, string(data));
    }

    function pauseCampaign(uint256 id, bool pause) external  whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("pauseCampaign(uint256,bool)", id, pause)
        );
        require(success, string(data));
    }

    function deleteCampaign(uint256 id) external  whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("deleteCampaign(uint256)", id)
        );
        require(success, string(data));
    }

    function allowClaimMany(address[] calldata users, uint256 id, bool allow) external  whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("allowClaimMany(address[],uint256,bool)", users, id, allow)
        );
        require(success, string(data));
    }

    function allowClaimAll(uint256 id, bool allow) external  whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("allowClaimAll(uint256,bool)", id, allow)
        );
        require(success, string(data));
    }

    function participateToCampaign(uint256 campId, bytes32 handleHash, bytes calldata handleEncrypt, bytes memory signature) external  whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("participateToCampaign(uint256,bytes32,bytes,bytes)", campId, handleHash, handleEncrypt, signature)
        );
        require(success, string(data));
    }

    function campaignClaimMany(uint256[] calldata _participationIds) external  whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("campaignClaimMany(uint256[])",_participationIds)
        );
        require(success, string(data));
    }



    function setCampaignStatus(uint256 id, Lifecycle _status) external whenNotPaused {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("setCampaignStatus(uint256,uint8)",id,_status)
        );
        require(success, string(data));  
    }
    //ADMIN ACTION

    function deleteACampaign(uint256 id) external onlyRole(ROLE_MANAGER) {
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("deleteACampaign(uint256)",id)
        );
        require(success, string(data));  
    }

    //PRIVATE
    function doCreateCampaign(Campaign memory campaign, address sender, uint256 amount, bool makeTransfer) override internal  whenNotPaused {
        //GET SIGNATURE FROM D.TS
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("doCreateCampaignPublic((uint256,uint256,bytes,uint256[],uint256,address,uint256,uint256,uint256,uint256,address,(uint256,uint256,uint256,bytes),bytes,bytes32,uint8),address,uint256,bool)", campaign, sender, amount, makeTransfer)
        );
        require(success, string(data));
    }
}