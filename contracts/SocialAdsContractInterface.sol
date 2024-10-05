// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;
import "./AbstractContract.sol";

interface IStructSocialAdsContract {

    struct Ads {
        uint256 id;
        uint256 network;
        string handle;
        string description;
        string[] audiences;
        uint256 followers;
        uint256 price;
        address priceCurrency;
        uint256 duration;
        uint256 durationPeriod;
        address owner;
        bytes signature;
        bytes pubKey;
        AdsStats stats;
        AbstractContract.Lifecycle status;
    }

    struct AdsStats{
        uint256 countProposition;
        uint256 countPropositionAccepted;
    }

    struct AdsProposition {
        uint256 id;
        uint256 adsId;
        uint256 startat;
        uint256 endat;
        uint256 amount;
        address currency;
        address owner;
        AbstractContract.TriState accepted;
        AbstractContract.TriState canClaim;
        bool claimed;
        string description;
        bytes pubKey;
    }

    //STRUCT
    struct SocialConfig{
        address tokenAddress;
        bool validatorRequire;
        address validator;
        address libAddress;
        AbstractContract.Price ads;
        AbstractContract.Price proposition;
        bool deleteDefinitely;
    }
}
interface ISocialAdsContract is IStructSocialAdsContract{
    function countAds() external view returns (uint256);
    function countAdsFor(address addr) external view returns (uint256);
    function getAdsByIndex(uint256 index) external view returns (Ads memory);
    function getAdsById(uint256 id) external view returns (Ads memory);
    function getAdsId(uint256 id) external view returns (uint256);
    function getAdsByIndexAndAddress(address addr, uint256 index) external view returns (Ads memory);
    function countPropositionsFor(address addr) external view returns (uint256);
    function countPropositionsForAds(uint256 id) external view returns (uint256);
    function getPropositionByIndexAndAddress(address addr, uint index) external view returns (AdsProposition memory);
    function getPropositionByIndexAndAdsId(uint256 adsid, uint256 index) external view returns (AdsProposition memory);
    function getPropositionById(uint256 id) external view returns (AdsProposition memory);
    
}