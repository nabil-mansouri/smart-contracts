// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;

import "./SocialCampaignContractAbstract.sol";

//removed IERC777Sender
contract SocialCampaignContractImpl is SocialCampaignContractAbstract, AbstractContract {
    using Counters for Counters.Counter;

    constructor(SocialCampaignConfig memory config) SocialCampaignContractAbstract(config) {}  
  
    
    //PUBLIC ACTIONS
    function createCampaign(Campaign calldata campaign) external {
        Price memory price = getPrice(SERVICE_CAMPAIGN);
        doCreateCampaign(campaign, msg.sender, price.amount, true);
    }

    function addBalance(uint256 campaignId, uint256 amount) external payable nonReentrant whenNotPaused {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id > 0, "Campaign: campaign not found");
        require(campaign.owner == msg.sender, "Campaign: you are not the owner of the campaign");
        if(campaign.priceCurrency == address(0)){
            campaign.balance.current = campaign.balance.current + (msg.value);
            campaign.balance.accBalance = campaign.balance.accBalance + (msg.value);
        }else{
            require(msg.value==0, "Campaign: currency does not match sent value");
            bool res0 = IERC20(campaign.priceCurrency).transferFrom(msg.sender, address(this), amount);
            require(res0 == true, "Campaign: transfer failed");
            campaign.balance.current = campaign.balance.current + (amount);
            campaign.balance.accBalance = campaign.balance.accBalance + (amount);
        }
    }

    function setCampaignStatus(uint256 id, Lifecycle _status) external nonReentrant whenNotPaused {
        Campaign storage campaign = campaigns[id];
        require(campaign.owner != address(0), "Campaign: campaign not found");
        require(campaign.owner == msg.sender, "Campaign: you are not the owner of the campaign");
        campaign.status = _status;
    }

    function deleteCampaign(uint256 id) external nonReentrant whenNotPaused {
        Campaign storage campaign = campaigns[id];
        require(campaign.owner != address(0), "Campaign: campaign not found");
        require(campaign.owner == msg.sender, "Campaign: you are not the owner of the campaign");
        endPayment(SERVICE_CAMPAIGN, campaign.id, msg.sender);
        if(campaign.balance.current >= 0){
            if(campaign.priceCurrency == address(0)){
                address payable receiver = payable(msg.sender);
                bool res0 = receiver.send(campaign.balance.current);
                require(res0 == true, "Campaign: transfer failed");
                campaign.balance.current = 0;
            }else{
                bool res0 = IERC20(campaign.priceCurrency).transfer(msg.sender, campaign.balance.current);
                require(res0 == true, "Campaign: transfer failed");
                campaign.balance.current = 0;
            }
        }
        if(deleteDefinitely){
            uint256[] storage _myCampaigns = myCampaigns[msg.sender];
            removeByValue(campaignIds, campaign.id);
            removeByValue(_myCampaigns, campaign.id);
            //must be after
            delete campaigns[campaign.id];
        }else{
            campaign.status = Lifecycle.DELETE;
        }
        emit OnDeleteCampaign(msg.sender, campaign);
    }

    function allowClaimMany(address[] calldata users, uint256 id, bool allow) external nonReentrant whenNotPaused {
        Campaign storage campaign = campaigns[id];
        require(campaign.id > 0, "Campaign: campaign not found");
        require(campaign.owner == msg.sender, "Campaign: you are not the owner of the campaign");
        uint256[] storage participationIds = participantsByCampaign[id];
        for(uint256 i = 0 ; i < participationIds.length; i++){
            CampaignParticipant storage participation = participants[participationIds[i]];
            if(containsAddress(users, participation.user)){
                if(allow == false && participation.canClaim != TriState.FALSE && campaign.balance.pendingBalance >= campaign.price){
                    campaign.balance.pendingBalance = campaign.balance.pendingBalance - (campaign.price);
                }
                if(allow == true && participation.canClaim == TriState.FALSE){
                    campaign.balance.pendingBalance = campaign.balance.pendingBalance + (campaign.price);
                }
                participation.canClaim = allow?TriState.TRUE:TriState.FALSE;
                emit OnAllowClaim(msg.sender, participation);
            }
        }
    }

    function allowClaimAll(uint256 id, bool allow) external nonReentrant whenNotPaused {
        Campaign storage campaign = campaigns[id];
        require(campaign.id > 0, "Campaign: campaign not found");
        require(campaign.owner == msg.sender, "Campaign: you are not the owner of the campaign");
        uint256[] storage participationIds = participantsByCampaign[id];
        for(uint256 i = 0 ; i < participationIds.length; i++){
            CampaignParticipant storage participation = participants[participationIds[i]];
            if(allow == false && participation.canClaim != TriState.FALSE && campaign.balance.pendingBalance >= campaign.price){
                campaign.balance.pendingBalance = campaign.balance.pendingBalance - (campaign.price);
            }
            if(allow == true && participation.canClaim == TriState.FALSE){
                campaign.balance.pendingBalance = campaign.balance.pendingBalance + (campaign.price);
            }
            participation.canClaim = allow?TriState.TRUE:TriState.FALSE;
        }
    }

    function participateToCampaign(uint256 campId, bytes32 handleHash, bytes calldata handleEncrypt, bytes memory signature) external nonReentrant whenNotPaused {
        uint256[] storage _mine = myParticipations[msg.sender];
        Campaign storage old = campaigns[campId];
        require(handleHash.length > 0, "Campaign: missing login hash");
        require(handleEncrypt.length > 0, "Campaign: missing login encrypted");        
        require(checkSignature(abi.encode(msg.sender, handleHash, address(this)), signature)==true, "Campaign: invalid signature");
        require(old.id > 0, "Campaign: campaign not found");
        require(old.status == Lifecycle.LIVE, "Campaign: not live");
        require(!containsUint(_mine, campId), "Campaign: you already participate to this campaign");
        require(old.startat <= block.timestamp, "Campaign: campaign not started");
        require(block.timestamp <= old.endat, "Campaign: campaign ended");
        _participantCounter.increment();
        CampaignParticipant memory participant = CampaignParticipant({
            user: msg.sender,
            handleHash: handleHash,
            handleEncrypt: handleEncrypt,
            date: block.timestamp,
            claimed: false,
            canClaim: TriState.UNDEFINED,
            campaignId: campId,
            id: _participantCounter.current()
        });
        old.balance.pendingBalance = old.balance.pendingBalance + old.price;
        participants[participant.id] = participant;
        myParticipations[msg.sender].push(participant.id);
        participantsByCampaign[campId].push(participant.id);
        emit OnParticipate(msg.sender, participant);
    }

    function campaignClaimMany(uint256[] calldata _participationIds) external nonReentrant whenNotPaused {
        for(uint256 i = 0 ; i < _participationIds.length; i++){
            CampaignParticipant storage participation = participants[_participationIds[i]];
            require(participation.id > 0, "Campaign: participation not found");
            require(participation.user==msg.sender, "Campaign: you are not the user allowed to claim");
            require(participation.claimed == false, "Campaign: already claimed");
            require(participation.canClaim == TriState.TRUE, "Campaign: not allowed to claim");
            Campaign storage _campaign = campaigns[participation.campaignId];
            address payable payableSender = payable(msg.sender);
            require(_campaign.balance.current >= _campaign.price,"Campaign: not enough balance for this campaign");
            if(_campaign.priceCurrency == address(0)){
                bool res = payableSender.send(_campaign.price);
                require(res==true, "Campaign: transfer failed");
            }else{
                bool res = IERC20(_campaign.priceCurrency).transfer(msg.sender, _campaign.price);
                require(res==true, "Campaign: transfer failed");
            }
            _campaign.balance.current = _campaign.balance.current - (_campaign.price);
            if(_campaign.balance.pendingBalance >= _campaign.price){
                _campaign.balance.pendingBalance = _campaign.balance.pendingBalance - (_campaign.price);
            }
            participation.claimed = true;
            emit OnClaim(msg.sender, participation);
        }
    }
    //ADMIN ACTION

    function deleteACampaign(uint256 id) external onlyRole(ROLE_MANAGER) {
        Campaign storage campaign = campaigns[id];
        require(campaign.id > 0, "Campaign: campaign not found");
        uint256[] storage _myCampaigns = myCampaigns[campaign.owner];
        removeByValue(campaignIds, campaign.id);
        removeByValue(_myCampaigns, campaign.id);
        //must be after
        delete campaigns[campaign.id];
    }
    function doCreateCampaignPublic(Campaign memory campaign, address sender, uint256 amount, bool makeTransfer) public whenNotPaused {
        doCreateCampaign(campaign, sender, amount,makeTransfer);
    }
    //PRIVATE
    function doCreateCampaign(Campaign memory campaign, address sender, uint256 amount, bool makeTransfer) override internal nonReentrant whenNotPaused {
        require(campaign.network > 0, "Campaign: missing social network");
        require(campaign.uri.length > 0, "Campaign: missing URL");
        require(campaign.actions.length > 0, "Campaign: missing actions");
        require(campaign.name != "", "Campaign: missing name");
        require(campaign.price > 0, "Campaign: missing price");
        require(campaign.startat > 0, "Campaign: missing start at");
        require(campaign.duration > 0, "Campaign: missing duration");
        require(campaign.durationPeriod > 0, "Campaign: missing duration period");
        _campaignCounter.increment();
        campaign.id = _campaignCounter.current();
        campaign.owner = sender;
        campaign.balance.current = 0;
        campaign.balance.pendingBalance = 0;
        campaign.balance.accBalance = 0;
        if(makeTransfer){
            bool res0 = IERC20(tokenAddress).transferFrom(sender, address(this), amount);
            require(res0 == true, "Campaign: transfer failed");
        }
        startPayment(SERVICE_CAMPAIGN, campaign.id, tokenAddress, amount, sender);
        //add to mapping
        campaignIds.push(campaign.id);
        campaigns[campaign.id] = campaign;
        myCampaigns[sender].push(campaign.id);
        emit OnCampaign(sender, campaign);
    }
}