// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;
import "./AbstractContract.sol";

interface IStructSocialCampaignContract {
    struct Campaign {
        uint256 id;
        uint256 network;
        bytes uri;
        uint256[] actions;
        uint256 price;
        address priceCurrency;
        uint256 startat;
        uint256 endat;
        uint256 duration;
        uint256 durationPeriod;
        address owner;
        CampaignBalance balance;
        bytes pubKey;
        bytes32 name;
        AbstractContract.Lifecycle status;
    }

    struct CampaignBalance{
        uint256 current;
        uint256 accBalance;
        uint256 pendingBalance;
        bytes description;
    }

    struct CampaignParticipant {
        uint256 id;
        address user;
        bytes32 handleHash;
        bytes handleEncrypt;
        uint256 date;
        bool claimed;
        AbstractContract.TriState canClaim;
        uint256 campaignId;
    }

    struct SocialCampaignConfig{
        address tokenAddress;
        bool validatorRequire;
        address validator;
        AbstractContract.Price campaign;
        address libAddress;
        bool deleteDefinitely;
    }
}
interface ISocialCampaignContract is IStructSocialCampaignContract{
    function countCampaigns() external view returns (uint256);
    function getCampaignsById(uint256 id) external view returns (Campaign memory);
    function getCampaignsByIndex(uint256 index) external view returns (Campaign memory);
    function countCampaignsFor(address addr) external view returns (uint256);
    function getMyCampaignsByIndex(address myaddrr,uint256 index) external view returns (Campaign memory);
    function countParticipationsFor(address addr) external view returns (uint256);
    function getParticipationsFor(address addr, uint256 index) external view returns (CampaignParticipant memory) ;
    function getParticipationsCampaignFor(address addr, uint256 index) external view returns (Campaign memory);
    function countParticipationsForCampaign(uint256 id) external view returns (uint256);
    function getParticipationsCampaignFor(uint256 campaignId, uint256 index) external view returns (CampaignParticipant memory);
    function getParticipationsById(uint256 id) external view returns (CampaignParticipant memory);
}