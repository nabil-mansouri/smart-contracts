// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;
import "./SocialAdsContractAbstract.sol";

contract SocialAdsContractImpl is SocialAdsContractAbstract,AbstractContract {
    using Counters for Counters.Counter;

    constructor(SocialConfig memory config) SocialAdsContractAbstract(config) {}  
    //VIEW
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
    //ADMIN ACTIONS
    function deleteAd(uint256 id) external onlyRole(ROLE_MANAGER) {
        Ads storage ads = adsById[id];
        require(id > 0, "Ads: ads does not exists");
        uint256[] storage _myAds = myAds[ads.owner];
        removeByValue(adsIds, ads.id);
        removeByValue(_myAds, ads.id);
        //Must be after
        delete adsById[ads.id];
        emit OnDeleteAds(ads.owner, ads);
    }
    
    //PUBLIC ACTIONS
    function createAds(Ads calldata ads) external {
        Price memory price = getPrice(SERVICE_ADS);
        doCreateAds(ads, msg.sender, price.amount, true);
    }

    function updateAds(uint256 id, Ads memory ads) external nonReentrant whenNotPaused {
        Ads storage old = adsById[id];
        require(old.owner == msg.sender, "Ads: not the owner");
        ads.id = old.id;
        ads.owner = old.owner;
        ads.handle = old.handle;
        ads.stats = old.stats;
        adsById[id] = ads;
    }

    function createProposition(AdsProposition memory proposition) external payable nonReentrant whenNotPaused {
        Ads storage ads = adsById[proposition.adsId];
        require(ads.id > 0, "Ads: ads not found");
        require(ads.status == Lifecycle.LIVE, "Ads: ads not live");
        require(proposition.startat > 0, "Ads: missing start at");
        require(proposition.endat > 0, "Ads: missing end at");
        _propositionCounter.increment();
        proposition.id = _propositionCounter.current();
        proposition.accepted = TriState.UNDEFINED;
        proposition.canClaim = TriState.UNDEFINED;
        proposition.claimed = false;
        proposition.owner = msg.sender;
        //proposition.currency = ads.priceCurrency;
        if(proposition.currency == address(0)){
            require(msg.value > 0, "Ads: coin amount equal 0");
            proposition.amount = msg.value;
        }else{
            require(proposition.amount > 0, "Ads: token amount equal 0");
            bool res0 = IERC20(proposition.currency).transferFrom(msg.sender, address(this), proposition.amount);
            require(res0 == true, "Ads: transfer failed");
        }
        //CREATE PAYMENT
        proposition.amount = applyFees(ads.id,proposition.currency, proposition.amount, msg.sender, msg.value,SERVICE_ADS_PROPS);
        //add to mapping
        propositions[proposition.id] = proposition;
        myPropositions[msg.sender].push(proposition.id);
        propositionsByAds[ads.id].push(proposition.id);
        //STATS
        ads.stats.countProposition++;
        emit OnProposition(msg.sender, proposition);
    }

    function updateProposition(AdsProposition memory proposition) external payable nonReentrant whenNotPaused {
        Ads storage ads = adsById[proposition.adsId];
        AdsProposition storage old = propositions[proposition.id];
        require(ads.id > 0, "Ads: ads not found");
        require(old.id > 0, "Ads: proposition not found");
        require(proposition.startat > 0, "Ads: missing start at");
        require(proposition.endat > 0, "Ads: missing end at");
        old.description = proposition.description;
        old.endat = proposition.endat;
        old.startat = proposition.startat;
        emit OnProposition(msg.sender, proposition);
    }


    function deleteProposition(uint256 id) external nonReentrant whenNotPaused {
        AdsProposition storage proposition = propositions[id];
        require(proposition.id > 0, "Ads: proposition not found");
        require(proposition.owner == msg.sender, "Ads: not the owner");
        uint256[] storage _myPropositions = myPropositions[msg.sender];
        uint256[] storage _proposAds = propositionsByAds[proposition.adsId];
        removeByValue(_myPropositions, proposition.id);
        removeByValue(_proposAds, proposition.id);
        if(proposition.amount >= 0 && proposition.claimed == false){
            if(proposition.currency == address(0)){
                bool res0 = payable(msg.sender).send(proposition.amount);
                require(res0 == true, "Ads: transfer failed");
                proposition.amount = 0;
            }else{
                bool res0 = IERC20(proposition.currency).transfer(msg.sender, proposition.amount);
                require(res0 == true, "Ads: transfer failed");
                proposition.amount = 0;
            }
        }
        //STATS
        Ads storage ads = adsById[proposition.adsId];
        if(ads.stats.countProposition > 0){
            ads.stats.countProposition--;
        }
        //MUST BE AFTER
        delete propositions[proposition.id];
        emit OnDeleteProposition(msg.sender, proposition);
    }

    function approveProposition(uint256 propositionId, bool approve) external nonReentrant whenNotPaused {
        AdsProposition storage proposition = propositions[propositionId];
        Ads storage ads = adsById[proposition.adsId];
        require(proposition.id > 0, "Ads: proposition not found");
        require(ads.id > 0, "Ads: ads not found");
        require(ads.owner == msg.sender, "Ads: not the owner");
        if(proposition.accepted != TriState.TRUE && approve){
            ads.stats.countPropositionAccepted++;
        }else if(proposition.accepted == TriState.TRUE && !approve){
            if(ads.stats.countPropositionAccepted > 0){
                ads.stats.countPropositionAccepted--;
            }
        }
        proposition.accepted = approve? TriState.TRUE:TriState.FALSE;
        emit OnPropositionApprove(msg.sender, proposition, approve);
    }

    function allowClaimProposition(uint256 propositionId, bool canClaim) external nonReentrant whenNotPaused {
        AdsProposition storage proposition = propositions[propositionId];
        require(proposition.id > 0, "Ads: proposition not found");
        require(proposition.owner == msg.sender, "Ads: not the owner");
        proposition.canClaim = canClaim? TriState.TRUE:TriState.FALSE;
        emit OnPropositionAllow(msg.sender, proposition, canClaim);
    }

    function claimProposition(uint256 propositionId) external nonReentrant whenNotPaused {
        AdsProposition storage proposition = propositions[propositionId];
        Ads storage ads = adsById[proposition.adsId];
        require(proposition.id > 0, "Ads: proposition not found");
        require(ads.id > 0, "Ads: ads not found");
        require(ads.owner == msg.sender, "Ads: not the owner");
        require(proposition.canClaim == TriState.TRUE, "Ads: not allowed to claim");
        require(proposition.claimed == false, "Ads: already claimed");
        if(ads.priceCurrency == address(0)){
            bool res0 = payable(msg.sender).send(proposition.amount);
            require(res0 == true, "Ads: transfer failed");
        }else{
            bool res0 = IERC20(ads.priceCurrency).transfer(msg.sender, proposition.amount);
            require(res0 == true, "Ads: transfer failed");
        }
        proposition.claimed = true;
        emit OnPropositionClaim(msg.sender, proposition);
    }

    function deleteAds(uint256 id) external nonReentrant whenNotPaused {
        Ads storage ads = adsById[id];
        require(ads.owner != address(0), "Ads: ads not found");
        require(ads.owner == msg.sender, "Ads: not the owner");
        endPayment(SERVICE_ADS, ads.id, msg.sender);
        if(deleteDefinitely){
            uint256[] storage _myAds = myAds[msg.sender];
            removeByValue(adsIds, ads.id);
            removeByValue(_myAds, ads.id);
            //Must be after
            delete adsById[ads.id];
        }else{
            ads.status = Lifecycle.DELETE;
        }
        emit OnDeleteAds(msg.sender, ads);
    }

    //PRIVATE
    function doCreateAdsPublic(Ads memory ads, address sender, uint256 amount, bool makeTransfer) public {
        doCreateAds(ads, sender, amount, makeTransfer);
    }

    function doCreateAds(Ads memory ads, address sender, uint256 amount, bool makeTransfer) override internal nonReentrant whenNotPaused {
        require(ads.network > 0, "Ads: missing social network");
        require(ads.audiences.length > 0, "Ads: missing audiences");
        require(ads.followers > 0, "Ads: missing followers");
        require(ads.price > 0, "Ads: missing price");
        require(ads.duration > 0, "Ads: missing duration");
        require(ads.durationPeriod > 0, "Ads: missing duration period");
        require(checkSignature(abi.encode(sender, ads.handle, address(this)), ads.signature)==true, "Ads: invalid signature");
        _adsCounter.increment();
        ads.id = _adsCounter.current();
        ads.stats = AdsStats({
            countProposition: 0,
            countPropositionAccepted: 0
        });
        ads.owner = sender;
        if(makeTransfer){
            bool res0 = IERC20(tokenAddress).transferFrom(sender, address(this), amount);
            require(res0 == true, "Ads: transfer failed");
        }
        startPayment(SERVICE_ADS, ads.id, tokenAddress, amount, sender);
        //add to mapping
        adsIds.push(ads.id);
        adsById[ads.id] = ads;
        myAds[sender].push(ads.id);
        emit OnAds(sender, ads);
    }

    //PRIVATE
    function applyFees(uint256 adId, address currency, uint256 amount, address payer, uint256 msgValue, bytes32 _service) internal returns (uint256) {
        Price storage price = pricing[_service];
        //if no fee return
        if(price.amount == 0){
            return amount;
        }
        require(payer != address(0), "Ads: invalid payer");
        if(price.paymentType == PaymentType.PAY_PROPORTIONNAL){
            uint256 fee = amount * price.amount / 100;
            if(currency == address(0)){
                //IF COIN
                require(amount > fee, "Ads: fees greater than amount");
                return amount - fee;
            }else{
                applyFeesToken(currency, payer, fee);
                return amount;
            }
        }else if(price.paymentType == PaymentType.PAY){
            uint256 fee = price.amount;
            if(price.currency == address(0)){
                //IF COIN
                if(currency == price.currency){
                    //IF CURRENCY SAME => SUBSTRACT
                    require(amount > fee, "Ads: fees greater than amount");
                    return amount - fee;
                }else{
                    //IF NOT SAME => CHECK IF COIN HAS BEEN SENT
                    require(msgValue >= fee, "Ads: insufficient fees");
                    return amount;
                }
            }else{
                //TRANSFER FEE EVEN IF SAME TOKEN
                applyFeesToken(price.currency, payer, fee);
                return amount;
            }
        }else {
            startPayment(_service, adId, tokenAddress, price.amount, payer);
            return amount - price.amount;
        }
    }

    function applyFeesToken(address currency, address owner, uint256 amount) internal {
        IERC20 tContract = IERC20(currency);
        bool res0 = tContract.transferFrom(owner, address(this), amount);
        require(res0 == true, "Ads: transfer failed");
    }
}