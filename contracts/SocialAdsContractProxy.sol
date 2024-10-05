// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;
import "./SocialAdsContractAbstract.sol";
import "./AbstractContract.sol";

contract SocialAdsContractProxy is SocialAdsContractAbstract,ISocialAdsContract {

    constructor(SocialConfig memory config) SocialAdsContractAbstract(config) {}  
    //VIEWS
    function getAdsId(uint256 id) external override view returns (uint256){
        return adsIds[id];
    }

    function countAds() external override view returns (uint256) {
        return adsIds.length;
    }

    function countAdsFor(address addr) public override view returns (uint256) {
        return myAds[addr].length;
    }
    
    function getAdsById(uint256 id) external override view returns (Ads memory) {
        return adsById[id];
    }

    function getAdsByIndex(uint256 index) external override view returns (Ads memory){
        uint256 id = adsIds[index];
        Ads storage tmp = adsById[id];
        return tmp;
    }

    function getAdsByIndexAndAddress(address addr, uint256 index) external override view returns (Ads memory){
        uint256 id = myAds[addr][index];
        Ads storage tmp = adsById[id];
        return tmp;
    }

    function countPropositionsFor(address addr) public override view returns (uint256) {
        return myPropositions[addr].length;
    }

    function countPropositionsForAds(uint256 id) external override view returns (uint256) {
        return propositionsByAds[id].length;
    }

    function getPropositionById(uint256 id) external override view returns (AdsProposition memory) {
        return propositions[id];
    }

    function getPropositionByIndexAndAddress(address addr, uint256 index) external override view returns (AdsProposition memory){
        uint256 id = myPropositions[addr][index];
        AdsProposition storage tmp = propositions[id];
        return tmp;
    }

    function getPropositionByIndexAndAdsId(uint256 adsid, uint256 index) external override view returns (AdsProposition memory){
        uint256 id = propositionsByAds[adsid][index];
        AdsProposition storage tmp = propositions[id];
        return tmp;
    }

    function generateAdsUserData(ISocialAdsContract.Ads memory ads) external pure returns (bytes memory) {
        return abi.encode(ads);
    }

    function prepareAdsSignature(address owner, string memory _hash) external view returns (bytes32) {
        return keccak256(abi.encode(owner, _hash, address(this)));
    }

    function countMyAds() external view returns (uint256) {
        return countAdsFor(msg.sender);
    }

    function countMyPropositions() external view returns (uint256) {
        return countPropositionsFor(msg.sender);
    }

    function listAds(uint256 start, uint256 limit) external view returns (ISocialAdsContract.Ads[] memory) {
        uint len = adsIds.length;
        uint256 arrayLen = len;
        uint end = arrayLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        uint index = 0;   
        ISocialAdsContract.Ads[] memory result = new ISocialAdsContract.Ads[](len);
        for (uint j = start; j < end && j < arrayLen; j++) {
            uint256 id = adsIds[j];
            Ads storage tmp = adsById[id];
            result[index++] = tmp;
        }
        return result;
    }

    function listAdsByStatus(uint256 start, uint256 limit, Lifecycle cycle) external view returns (ISocialAdsContract.Ads[] memory) {
        uint len = adsIds.length;
        uint256 arrayLen = len;
        uint end = arrayLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        uint index = 0;   
        ISocialAdsContract.Ads[] memory result = new ISocialAdsContract.Ads[](len);
        for (uint j = start; j < end && j < arrayLen; j++) {
            uint256 id = adsIds[j];
            Ads storage tmp = adsById[id];
            if(tmp.status == cycle){
                result[index++] = tmp;
            }else{
                end++;
            }
        }
        return result;
    }

    function listAdsIds(uint256 start, uint256 limit) external view returns (uint256[] memory) {
        uint len = adsIds.length;
        uint256 arrayLen = len;
        uint end = arrayLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        uint index = 0;   
        uint256[] memory result = new uint256[](len);
        for (uint j = start; j < end && j < arrayLen; j++) {
            result[index++] = adsIds[j];
        }
        return result;
    }

    function listMyAds(uint256 start, uint256 limit) external view returns (ISocialAdsContract.Ads[] memory) {
        return listAdsFor(msg.sender, start, limit);
    }

    function listAdsFor(address addr,uint256 start, uint256 limit) public view returns (ISocialAdsContract.Ads[] memory) {
        uint256[] memory ids = myAds[addr];
        uint len = ids.length;
        uint256 arrayLen = len;
        uint index = 0;
        uint end = arrayLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        ISocialAdsContract.Ads[] memory result = new ISocialAdsContract.Ads[](len);
        for (uint j = start; j < end && j < arrayLen; j++) {
            uint256 id = ids[j];
            Ads storage tmp = adsById[id];
            result[index++] = tmp;
        }
        return result;
    }

    function listMyPropositions(uint256 start, uint256 limit) external view returns (ISocialAdsContract.AdsProposition[] memory) {
        return listPropositionsFor(msg.sender, start, limit);
    }

    function listPropositionsFor(address addr,uint256 start, uint256 limit) public view returns (ISocialAdsContract.AdsProposition[] memory) {
        uint256[] storage ids = myPropositions[addr];
        return filterProposition(start, limit, ids);
    }

    function listPropositionsForAds(uint256 adsid, uint256 start, uint256 limit) public view returns (ISocialAdsContract.AdsProposition[] memory) {
        uint256[] storage ids = propositionsByAds[adsid];
        return filterProposition(start, limit, ids);
    }

    function filterProposition(uint256 start, uint256 limit, uint256[] storage ids) internal view returns (ISocialAdsContract.AdsProposition[] memory) {
        uint index = 0;
        uint len = ids.length;
        uint256 arrayLen = len;
        uint end = arrayLen;
        if(limit > 0){
            len = limit;
            end = start + limit;
        }
        ISocialAdsContract.AdsProposition[] memory result = new ISocialAdsContract.AdsProposition[](len);
        for (uint j = start; j < end && j < arrayLen; j++) {
            uint256 curId = ids[j];
            AdsProposition storage tmp = propositions[curId];
            result[index++] = tmp;
        }
        return result;
    }

    //ADMIN ACTIONS
    function deleteAd(uint256 id) external onlyRole(ROLE_MANAGER) {
         (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("deleteAd(uint256)", id)
        );
        require(success, string(data));
    }
    
    //PUBLIC ACTIONS
    function createAds(Ads calldata ads) external {
        Price memory price = getPrice(SERVICE_ADS);
        doCreateAds(ads, msg.sender, price.amount, true);
    }

    function updateAds(uint256 id, Ads memory ads) external  whenNotPaused {
         //GET SIGNATURE FROM D.TS
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("updateAds(uint256,(uint256,uint256,string,string,string[],uint256,uint256,address,uint256,uint256,address,bytes,bytes,(uint256,uint256),uint8))", id, ads)
        );
        require(success, string(data));
    }

    function createProposition(AdsProposition memory proposition) external payable  whenNotPaused {
         //GET SIGNATURE FROM D.TS
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("createProposition((uint256,uint256,uint256,uint256,uint256,address,address,uint8,uint8,bool,string,bytes))", proposition)
        );
        require(success, string(data));
    }

    function updateProposition(AdsProposition memory proposition) external payable  whenNotPaused {
         //GET SIGNATURE FROM D.TS
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("updateProposition((uint256,uint256,uint256,uint256,uint256,address,address,uint8,uint8,bool,string,bytes))", proposition)
        );
        require(success, string(data));
    }


    function deleteProposition(uint256 id) external  whenNotPaused {
         (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("deleteProposition(uint256)", id)
        );
        require(success, string(data));
    }

    function approveProposition(uint256 propositionId, bool approve) external  whenNotPaused {
         (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("approveProposition(uint256,bool)", propositionId, approve)
        );
        require(success, string(data));
    }

    function allowClaimProposition(uint256 propositionId, bool canClaim) external  whenNotPaused {
         (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("allowClaimProposition(uint256,bool)",propositionId, canClaim)
        );
        require(success, string(data));
    }

    function claimProposition(uint256 propositionId) external  whenNotPaused {
         (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("claimProposition(uint256)",propositionId)
        );
        require(success, string(data));
    }

    function deleteAds(uint256 id) external  whenNotPaused {
         (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("deleteAds(uint256)",id)
        );
        require(success, string(data));
    }

    //PRIVATE
    function doCreateAds(Ads memory ads, address sender, uint256 amount, bool makeTransfer) override internal  whenNotPaused {
        //GET SIGNATURE FROM D.TS
        (bool success,bytes memory data) = libAddress.delegatecall(
            abi.encodeWithSignature("doCreateAdsPublic((uint256,uint256,string,string,string[],uint256,uint256,address,uint256,uint256,address,bytes,bytes,(uint256,uint256),uint8),address,uint256,bool)",ads, sender, amount, makeTransfer)
        );
        require(success, string(data));
    }

}