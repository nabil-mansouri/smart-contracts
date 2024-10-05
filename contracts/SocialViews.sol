// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./SocialCampaignContractInterface.sol";
import "./SocialAdsContractInterface.sol";
import "./AbstractContract.sol";

contract SocialViews is Ownable, Pausable, ReentrancyGuard{
    address public addressAds;
    address public addressCampaign;

    constructor(SocialConfig memory config) {
        setConfig(config);
    } 

    //ADS
    function generateAdsUserData(ISocialAdsContract.Ads memory ads) external pure returns (bytes memory) {
        return abi.encode(ads);
    }

    function prepareAdsSignature(address owner, string memory _hash) external view returns (bytes32) {
        return keccak256(abi.encode(owner, _hash, addressAds));
    }

    function countMyAds() external view returns (uint256) {
        ISocialAdsContract social = ISocialAdsContract(addressAds);
        return social.countAdsFor(msg.sender);
    }

    function countMyPropositions() external view returns (uint256) {
        ISocialAdsContract social = ISocialAdsContract(addressAds);
        return social.countPropositionsFor(msg.sender);
    }

    function listAds(uint256 start, uint256 limit) external view returns (ISocialAdsContract.Ads[] memory) {
        ISocialAdsContract social = ISocialAdsContract(addressAds);
        uint len = social.countAds();
        uint256 arrayLen = len;
        uint end = arrayLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        uint index = 0;   
        ISocialAdsContract.Ads[] memory result = new ISocialAdsContract.Ads[](len);
        for (uint j = start; j < end && j < arrayLen; j++) {
            ISocialAdsContract.Ads memory tmp = social.getAdsByIndex(j);
            result[index++] = tmp;
        }
        return result;
    }

    function listAdsIds(uint256 start, uint256 limit) external view returns (uint256[] memory) {
        ISocialAdsContract social = ISocialAdsContract(addressAds);
        uint len = social.countAds();
        uint256 arrayLen = len;
        uint end = arrayLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        uint index = 0;   
        uint256[] memory result = new uint256[](len);
        for (uint j = start; j < end && j < arrayLen; j++) {
            result[index++] = social.getAdsId(j);
        }
        return result;
    }

    function listMyAds(uint256 start, uint256 limit) external view returns (ISocialAdsContract.Ads[] memory) {
        return listAdsFor(msg.sender, start, limit);
    }

    function listAdsFor(address addr,uint256 start, uint256 limit) public view returns (ISocialAdsContract.Ads[] memory) {
        ISocialAdsContract social = ISocialAdsContract(addressAds);
        uint len = social.countAdsFor(msg.sender);
        uint256 arrayLen = len;
        uint index = 0;
        uint end = arrayLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        ISocialAdsContract.Ads[] memory result = new ISocialAdsContract.Ads[](len);
        for (uint j = start; j < end && j < arrayLen; j++) {
            ISocialAdsContract.Ads memory tmp = social.getAdsByIndexAndAddress(addr, j);
            result[index++] = tmp;
        }
        return result;
    }

    function listMyPropositions(uint256 start, uint256 limit) external view returns (ISocialAdsContract.AdsProposition[] memory) {
        return listPropositionsFor(msg.sender, start, limit);
    }

    function listPropositionsFor(address addr,uint256 start, uint256 limit) public view returns (ISocialAdsContract.AdsProposition[] memory) {
        ISocialAdsContract social = ISocialAdsContract(addressAds);
        uint index = 0;
        uint len = social.countPropositionsFor(addr);
        uint256 arrayLen = len;
        uint end = arrayLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        ISocialAdsContract.AdsProposition[] memory result = new ISocialAdsContract.AdsProposition[](len);
        for (uint j = start; j < end && j < arrayLen; j++) {
            ISocialAdsContract.AdsProposition memory tmp = social.getPropositionByIndexAndAddress(addr, j);
            result[index++] = tmp;
        }
        return result;
    }

    function listPropositionsForAds(uint256 id, uint256 start, uint256 limit) public view returns (ISocialAdsContract.AdsProposition[] memory) {
        ISocialAdsContract social = ISocialAdsContract(addressAds);
        uint index = 0;
        uint len = social.countPropositionsForAds(id);
        uint256 arrayLen = len;
        uint end = arrayLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        ISocialAdsContract.AdsProposition[] memory result = new ISocialAdsContract.AdsProposition[](len);
        for (uint j = start; j < end && j < arrayLen; j++) {
            ISocialAdsContract.AdsProposition memory tmp = social.getPropositionByIndexAndAdsId(id, j);
            result[index++] = tmp;
        }
        return result;
    }

    //CAMPAIGN

    function prepareSignatureCampaign(address owner, bytes32 _hash) external view returns (bytes32) {
        return keccak256(abi.encode(owner, _hash, addressCampaign));
    }

    function generateUserDataCampaign(ISocialCampaignContract.Campaign calldata cam) external pure returns (bytes memory) {
        return abi.encode(cam);
    }
    
    function countMyParticipations() external view returns (uint256) {
        ISocialCampaignContract social = ISocialCampaignContract(addressCampaign);
        return social.countParticipationsFor(msg.sender);
    }
    
    function countMyCampaigns() external view returns (uint256) {
        ISocialCampaignContract social = ISocialCampaignContract(addressCampaign);
        return social.countCampaignsFor(msg.sender);
    }

    function listMyCampaigns(uint256 start, uint256 limit) external view returns (ISocialCampaignContract.Campaign[] memory) {
        return listCampaignsFor(msg.sender, start, limit);
    }

    function listCampaigns(uint256 start, uint256 limit) external view returns (ISocialCampaignContract.Campaign[] memory) {
        ISocialCampaignContract social = ISocialCampaignContract(addressCampaign);
        uint len = social.countCampaigns();
        uint maxLen = len;
        uint256 end = maxLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        uint index = 0;
        ISocialCampaignContract.Campaign[] memory result = new ISocialCampaignContract.Campaign[](len);
        for (uint j = start; j < end && j < maxLen; j++) {
            ISocialCampaignContract.Campaign memory tmp = social.getCampaignsByIndex(j);
            result[index++] = tmp;
        }
        return result;
    }
    
    function listCampaignsFor(address addr,uint256 start, uint256 limit) public view returns (ISocialCampaignContract.Campaign[] memory) {
        ISocialCampaignContract social = ISocialCampaignContract(addressCampaign);
        uint len = social.countCampaignsFor(addr);
        uint256 maxlen = len;
        uint index = 0;
        uint end = maxlen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        ISocialCampaignContract.Campaign[] memory result = new ISocialCampaignContract.Campaign[](len);
        for (uint j = start; j < end && j < maxlen; j++) {
            ISocialCampaignContract.Campaign memory tmp = social.getMyCampaignsByIndex(addr, j);
            result[index++] = tmp;
        }
        return result;
    }

    function listMyParticipations(uint256 start, uint256 limit) external view returns (ISocialCampaignContract.CampaignParticipant[] memory) {
        return listParticipationsFor(msg.sender, start, limit);
    }

    function listParticipationsFor(address addr,uint256 start, uint256 limit) public view returns (ISocialCampaignContract.CampaignParticipant[] memory) {
        ISocialCampaignContract social = ISocialCampaignContract(addressCampaign);
        uint index = 0;
        uint256 len = social.countParticipationsFor(addr);
        uint256 maxlen = len;
        uint end = maxlen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        ISocialCampaignContract.CampaignParticipant[] memory result = new ISocialCampaignContract.CampaignParticipant[](len);
        for (uint j = start; j < end && j < maxlen; j++) {
            ISocialCampaignContract.CampaignParticipant memory tmp = social.getParticipationsFor(addr, j);
            result[index++] = tmp;
        }
        return result;
    }

    function listCampaignIdsForMe(uint256 start, uint256 limit) external view returns (uint256[] memory) {
        return listCampaignIdsForParticipant(msg.sender, start, limit);
    }

    function listCampaignIdsForParticipant(address addr,uint256 start, uint256 limit) public view returns (uint256[] memory) {
        ISocialCampaignContract social = ISocialCampaignContract(addressCampaign);
        uint index = 0;
        uint256 len = social.countParticipationsFor(addr);
        uint256 maxlen = len;
        uint end = maxlen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        uint256[] memory result = new uint256[](len);
        for (uint j = start; j < end && j < maxlen; j++) {
            ISocialCampaignContract.Campaign memory tmp = social.getParticipationsCampaignFor(addr, j);
            result[index++] = tmp.id;
        }
        return result;
    }

    function listMyParticipationsCampaign(uint256 start, uint256 limit) external view returns (ISocialCampaignContract.Campaign[] memory) {
        return listParticipationsCampaignFor(msg.sender, start, limit);
    }

    function listParticipationsCampaignFor(address addr,uint256 start, uint256 limit) public view returns (ISocialCampaignContract.Campaign[] memory) {
        ISocialCampaignContract social = ISocialCampaignContract(addressCampaign);
        uint index = 0;
        uint256 len = social.countParticipationsFor(addr);
        uint256 maxlen = len;
        uint end = maxlen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        ISocialCampaignContract.Campaign[] memory result = new ISocialCampaignContract.Campaign[](len);
        for (uint j = start; j < end && j < maxlen; j++) {
            ISocialCampaignContract.Campaign memory tmp = social.getParticipationsCampaignFor(addr, j);
            result[index++] = tmp;
        }
        return result;
    }

    function listParticipantsByCampaign(uint256 id,uint256 start, uint256 limit) public view returns (ISocialCampaignContract.CampaignParticipant[] memory) {
        ISocialCampaignContract social = ISocialCampaignContract(addressCampaign);
        uint index = 0;
        uint256 len = social.countParticipationsForCampaign(id);
        uint256 maxlen = len;
        uint end = maxlen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        ISocialCampaignContract.CampaignParticipant[] memory result = new ISocialCampaignContract.CampaignParticipant[](len);
        for (uint j = start; j < end && j < maxlen; j++) {
            ISocialCampaignContract.CampaignParticipant memory part = social.getParticipationsCampaignFor(id, j);
            result[index++] = part;
        }
        return result;
    }

    function countCanClaimParticipationsForCampaign(uint256 id, AbstractContract.TriState canClaim) external view returns (uint256) {
        ISocialCampaignContract social = ISocialCampaignContract(addressCampaign);
        uint256 len = social.countParticipationsForCampaign(id);
        uint256 count = 0;
        for (uint j = 0; j < len; j++) {
            ISocialCampaignContract.CampaignParticipant memory part = social.getParticipationsCampaignFor(id, j);
            if(part.canClaim == canClaim){
                count++;
            }
        }
        return count;
    }
    //OTHER
    function generateServiceKey(bytes32 service, uint256 serviceId) public pure returns (bytes32) { 
        return keccak256(abi.encode(service, serviceId));
    }

    //ADMIN

    function socialConfig() external view returns (SocialConfig memory) {
        return SocialConfig({
            addressAds: addressAds,
            addressCampaign: addressCampaign
        });
    }

    function setConfig(SocialConfig memory config) public onlyOwner {
        addressAds = config.addressAds;
        addressCampaign = config.addressCampaign;
    }
    struct SocialConfig{
        address addressAds;
        address addressCampaign;
    }
}