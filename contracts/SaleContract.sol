// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//import "@openzeppelin/contracts/token/ERC777/IERC777Sender.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./AbstractContract.sol";
//removed IERC777Sender
contract SaleContract is IERC777Recipient, AbstractContract {
    using SafeMath for uint256;
    IERC1820Registry private _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
    bytes32 constant private TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");
    bytes32 private constant _TOKENS_SENDER_INTERFACE_HASH = keccak256("ERC777TokensSender");
    //uint256 public saleMax;
    uint256 public saled;
    address[] public whitelistAdresses;
    mapping(address => Whitelist) public whitelist;
    mapping(address => uint256) public whitelistSponsor;
    //PRIVATE MEMBERS CONFIG
    uint256 private maxPerUser;
    uint256 private tokenPerCoin;
    uint256 private startDate;
    uint256 private endDate;
    address private tokenAddress;
    IERC20 private tokenContract;
    TokenQuote[] private tokenQuotes;
    mapping(address => uint256) private tokenPerToken;
    //PRIVATE MEMBERS MUTABLE
    uint256 private countSale;
    uint256 private countHolders;
    mapping(address => UserInfos) private history;
    //EVENTS
    event UserBuyed(address from, uint256 amount);

    constructor(SaleConfig memory config) {
        setConfig(config);
        _erc1820.setInterfaceImplementer(address(this), TOKENS_RECIPIENT_INTERFACE_HASH, address(this));
        //_erc1820.setInterfaceImplementer(address(this), _TOKENS_SENDER_INTERFACE_HASH, address(this));
    }  
    //VIEWS
    function canBuyMax() public view returns (uint256) {
        if(maxPerUser <= 0){
            return saleRemain();
        }
        uint256 totalBal = tokenContract.balanceOf(msg.sender);
        if(maxPerUser >= totalBal){
            uint256 remain = maxPerUser - totalBal;
            return remain;
        }
        return 0;
    }

    function historyOf(address account) public view returns (UserInfos memory) {
        return history[account];
    }

    function saleRemain() public view returns (uint256) {
        return tokenContract.balanceOf(address(this));
    }

    function saleInfos() public view returns (SaleInfos memory) {
        uint256 _saleRemain = saleRemain();
        uint256 saleMax = _saleRemain.add(saled);
        return SaleInfos({
            startAt: startDate,
            endAt: endDate,
            saleMax: saleMax,
            saleRemain: _saleRemain,
            saleCommit: saled,
            countHolders: countHolders,
            countSale: countSale
        });
    } 

    function saleConfig() public view returns (SaleConfig memory) {
        return SaleConfig({
            endDate: endDate,
            startDate: startDate,
            maxPerUser: maxPerUser,
            tokenAddress: tokenAddress,
            tokenPerCoin: tokenPerCoin,
            tokenQuotes: tokenQuotes,
            validator: validator,
            validatorRequire: validatorRequire
        });
    }

    function hashNative(address sender, uint256 _amount) public view returns (bytes32) {
        require(onlyValidator()==true, "Sale: not validator");
        return keccak256(abi.encode(sender, _amount, address(this)));
    }

    function hashToken(address sender, uint256 _amount, address _otherToken) public view returns (bytes32) {
        require(onlyValidator()==true, "Sale: not validator");
        return keccak256(abi.encode(sender, _amount, _otherToken, address(this)));
    }

    function seeSponsorship(address sponsor) public view returns (Whitelist[] memory) {
        uint len = whitelistAdresses.length;
        uint count = whitelistSponsor[sponsor];
        uint index = 0;
        Whitelist[] memory result = new Whitelist[](count);
        for (uint j = 0; j < len; j++) {
            address addr = whitelistAdresses[j];
            Whitelist storage tmp = whitelist[addr];
            if(tmp.sponsor == sponsor){
                result[index++] = tmp;
            }
        }
        return result;
    }


    function seeSponsorshipCount(address sponsor) public view returns (uint256) {
        uint count = whitelistSponsor[sponsor];
        return count;
    }

    function seeWhitelist(uint256 start, uint256 limit) public view returns (Whitelist[] memory) {
        uint len = whitelistAdresses.length;
        Whitelist[] memory result = new Whitelist[](limit);
        uint end = start + limit;
        uint index = 0;
        for (uint j = start; j < end && j < len; j++) {
            address addr = whitelistAdresses[j];
            Whitelist storage tmp = whitelist[addr];
            result[index++] = tmp;
        }
        return result;
    }

    function whitelistCount() public view returns (uint256) {
        uint len = whitelistAdresses.length;
        return len;
    }

    //HOOK
    function tokensReceived(
        address operator,
        address from,
        address /*to*/,
        uint256 _amount,
        bytes calldata userData,
        bytes calldata /*operatorData*/
    ) external override {
    //    if(msg.sender==tokenAddress && from==owner()){
    //        saleMax = saleMax.add(_amount);
    //    }
        //if operator is not self and token sent is not token saled and token can be exchanged
        if(operator != address(this) && msg.sender != tokenAddress){
            //atomic send and sale
            require(_saleToken(from, _amount, msg.sender, userData, false) == true, "Sale: sale failed");  
        }
    }


    //function tokensToSend(
    //    address /*operator*/,
    //    address /*from*/,
    //    address to,
    //    uint256 _amount,
    //    bytes calldata /*userData*/,
    //    bytes calldata /*operatorData*/
    //) external override {
    //    if(msg.sender==tokenAddress && to==owner()){
    //        saleMax = saleMax.sub(_amount);
    //    }
    //}

    //ADMIN ACTION
    function decrease(uint256 _amount) external onlyOwner returns (bool) {
        bool res = tokenContract.transfer(msg.sender, _amount);
        require(res==true, "Sale: decrease transfer failed");
        return true;
    }
    //PUBLIC ACTIONS
    function registerWhitelist(address _buyer, address _token, uint256 _amount, address _sponsor) external returns (bool) {
        require(_amount > 0, "Whitelist: amount should be positive");
        require(_buyer != address(0), "Whitelist: missing buyer address");
        require(_token != address(0), "Whitelist: missing currency");
        require(_buyer != _sponsor, "Whitelist: should not sponsor yourself");
        Whitelist storage old = whitelist[_buyer];
        if(old.buyer == address(0)){
            whitelistAdresses.push(_buyer);
        }
        if(_sponsor != address(0)){
            if(old.sponsor != _sponsor){
                whitelistSponsor[_sponsor] = whitelistSponsor[_sponsor] + 1;
                if(old.sponsor != address(0) && whitelistSponsor[old.sponsor] > 0){
                    whitelistSponsor[old.sponsor] = whitelistSponsor[old.sponsor] - 1;
                }
            }
        }
        whitelist[_buyer] = Whitelist({
            buyer: _buyer,
            sponsor:_sponsor,
            amount: _amount,
            token: _token
        });
        return true;
    }

    function saleNative(bytes calldata signature) external payable nonReentrant whenNotPaused ifNotFinished returns (bool) {
        require(checkSignature(abi.encode(msg.sender, msg.value, address(this)), signature)==true, "Sale: sender not allowed");
        //init
        uint256 balance = tokenContract.balanceOf(address(this));
        uint256 token = tokenPerCoin * msg.value;
        //check
        require(msg.value > 0, "Sale: Amount should be positive");
        require(token <= balance, "Sale: Not enough balance");
        if(maxPerUser > 0){
            uint256 senderBal = tokenContract.balanceOf(msg.sender);
            uint256 totalBal = senderBal.add(token);
            require(totalBal <= maxPerUser, "Sale: maxPerUser failed");
        }
        //transfer
        bool res = tokenContract.transfer(msg.sender, token);
        require(res == true, "Sale: transfer failed");
        _pushHistory(msg.sender, token, msg.value, address(0));
        return true;
    }

    function saleToken(uint _amount, address _otherToken, bytes calldata signature) external returns (bool) {
        return _saleToken(msg.sender,_amount, _otherToken, signature, true);  
    }

    function setConfig(SaleConfig memory config) public onlyOwner returns (bool) {
        endDate =  config.endDate;
        startDate =  config.startDate;
        maxPerUser =  config.maxPerUser;
        tokenAddress =  config.tokenAddress;
        tokenPerCoin =  config.tokenPerCoin;
        tokenContract = IERC20(tokenAddress);
        validator = config.validator;
        validatorRequire = config.validatorRequire;
        uint len = config.tokenQuotes.length;
        delete tokenQuotes;
        for (uint j = 0; j < len; j++) {
            TokenQuote memory quote = config.tokenQuotes[j];
            tokenPerToken[quote.token] = quote.quote;
            tokenQuotes.push(quote);
        }
        return true;
    }

    //PRIVATE
    modifier ifNotFinished {
      if(startDate > 0){
          require(block.timestamp >= startDate, "Sale: not started");
      }
      if(endDate > 0){
          require(block.timestamp <= endDate, "Sale: Finished");
      }
      _;
    }

    function _pushHistory(address from, uint256 _amount, uint256 _cost, address _token) private returns (uint) {
        countSale = countSale.add(1);
        saled = saled.add(_amount);
        UserInfos storage infos = history[from];
        if(infos.sales.length==0){
            countHolders = countHolders.add(1);
        }
        infos.sales.push(UserSale({
            buyAt: block.timestamp,
            amount:_amount,
            cost: _cost,
            token: _token
        }));
        return infos.sales.length;
    }

    function _saleToken(address sender, uint _amount, address _otherToken, bytes calldata signature, bool shouldTransferToken) internal nonReentrant whenNotPaused ifNotFinished returns (bool) {
        require(checkSignature(abi.encode(sender, _amount, _otherToken, address(this)), signature)==true, "Sale: sender not allowed");
        //init
        uint256 _tokenPerToken = tokenPerToken[_otherToken];
        //check
        require(_amount > 0, "Sale: Amount should be positive");
        require(_tokenPerToken > 0, "Sale: token not accepted");
        //compute
        uint256 balance = tokenContract.balanceOf(address(this));
        uint256 token = _tokenPerToken * _amount;
        //check balance
        require(token <= balance, "Sale: Not enough balance");
        if(maxPerUser > 0){
            uint256 senderBal = tokenContract.balanceOf(sender);
            uint256 totalBal = senderBal.add(token);
            require(totalBal <= maxPerUser, "Sale: maxPerUser failed");
        }
        //transfer
        if(shouldTransferToken){
            IERC20 tContract = IERC20(_otherToken);
            bool res0 = tContract.transferFrom(sender, address(this), _amount);
            require(res0 == true, "Sale: transfer from failed");
        }
        bool res = tokenContract.transfer(sender, token);
        require(res == true, "Sale: transfer failed");
        _pushHistory(sender, token, _amount, _otherToken);
        return true;
    }


    //STRUCT
    struct SaleConfig{
        uint256 endDate;
        uint256 startDate;
        uint256 maxPerUser;
        address tokenAddress;
        uint256 tokenPerCoin;
        TokenQuote[] tokenQuotes;
        address validator;
        bool validatorRequire;
    }

    struct SaleInfos{
        uint256 startAt;
        uint256 endAt;
        uint256 saleMax;
        uint256 saleRemain;
        uint256 saleCommit;
        uint256 countHolders;
        uint256 countSale;
    }

    struct UserInfos{
        UserSale[] sales;
    }

    struct UserSale{
        uint256 buyAt;
        uint256 amount;
        uint256 cost;
        address token;
    }

    struct TokenQuote{
        address token;
        uint256 quote;
    }

    struct Whitelist{
        address buyer;
        address token;
        uint256 amount;
        address sponsor;
    }
}