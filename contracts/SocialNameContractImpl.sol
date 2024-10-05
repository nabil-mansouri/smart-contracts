// SPDX-License-Identifier: Private Use
pragma solidity ^0.8.0;
import "./SocialNameContractAbstract.sol";
import "./AbstractContract.sol";
import "hardhat/console.sol";
import "./MessageContractImpl.sol";

//removed IERC777Sender
contract SocialNameContractImpl is SocialNameContractAbstract, MessageContractImpl {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    constructor(SocialNameConfig memory config) SocialNameContractAbstract(config) {}  
    
    //ADMIN ACTION
    function createRegistration(Registration memory original) external onlyRole(ROLE_MANAGER) {
        uint256 oldId = registrationsByName[original.name];
        require(oldId == 0, "SocialNameService: registration already exists");
        registrationCount++;
        _registrationCounter.increment();
        uint256 id = _registrationCounter.current();
        registrationsById[id] = Registration({
            owner: original.owner,
            encryptName: original.encryptName,
            signature: original.signature,
            network: original.network,
            name: original.name,
            id: id
        });
        registrationsByName[original.name] = id;
        registrationsOwner[original.owner].push(id);
    }

    function deleteRegistration(bytes32 _hash) external onlyRole(ROLE_MANAGER) {
        uint256 id = registrationsByName[_hash];
        require(id > 0, "SocialNameService: registration does not exists");
        if(registrationCount > 0){
            registrationCount--;
        }
        Registration storage old = registrationsById[id];
        removeByValue(registrationsOwner[old.owner], id);
        delete registrationsByName[_hash];
        delete registrationsById[id];
    }
    
    //PUBLIC ACTIONS
    function sendCoin(bytes32 _hash, bool eventIfNotExist) external payable nonReentrant whenNotPaused {
        bytes32 senderHash = keccak256(abi.encodePacked(msg.sender));
        uint256 id = registrationsByName[_hash];
        //check if exists
        if(!eventIfNotExist){
            require(id > 0, "SocialNameService: could not found receiver");
        }
        //paymentId
        _paymentCounter.increment();
        uint256 idPayment = _paymentCounter.current();
        //apply fees
        uint256 amount = applyFees(address(0), msg.value, msg.sender, msg.value,SERVICE_FEE);
        //send if exists
        bool claimed = false;
        if(id > 0){   
            Registration storage reg = registrationsById[id];
            address payable receiver = payable(reg.owner);
            bool res = receiver.send(amount);
            require(res==true, "SocialNameService: transfer failed");
            claimed = true;
        }
        //register payment
        paymantById[idPayment] = Payment({
            id: idPayment,
            from: senderHash,
            to: _hash,
            date: block.timestamp,
            amount: amount,
            currency: address(0),
            claimed: claimed,
            cancel: false
        });
        paymentReceived[_hash].push(idPayment);
        paymentSent[senderHash].push(idPayment);
    }

    function send(bytes32 _hash, address _token, uint256 amount, bool eventIfNotExist) external payable nonReentrant whenNotPaused {
        bytes32 senderHash = keccak256(abi.encodePacked(msg.sender));
        uint256 id = registrationsByName[_hash];
        //check if exists
        if(!eventIfNotExist){
            require(id > 0, "SocialNameService: could not found receiver");
        }
        //paymentId
        _paymentCounter.increment();
        uint256 idPayment = _paymentCounter.current();
        //apply fees
        amount = applyFees(_token, amount, msg.sender, msg.value,SERVICE_FEE);
        //send if exists
        bool claimed = false;
        IERC20 tokenContract = IERC20(_token);
        if(id > 0){
            Registration storage reg = registrationsById[id];
            bool res = tokenContract.transferFrom(msg.sender, reg.owner, amount);
            require(res==true, "SocialNameService: transfer failed");
            claimed = true;
        }else{
            bool res = tokenContract.transferFrom(msg.sender, address(this), amount);
            require(res==true, "SocialNameService: transfer failed");
        }
        //register payment
        paymantById[idPayment] = Payment({
            id: idPayment,
            from: senderHash,
            to: _hash,
            date: block.timestamp,
            amount: amount,
            currency: _token,
            claimed: claimed,
            cancel: false
        });
        paymentReceived[_hash].push(idPayment);
        paymentSent[senderHash].push(idPayment);
    }

    function claimAll(bytes32 _hash) external whenNotPaused {
        uint256[] storage paymentIds = paymentReceived[_hash];
        for (uint j = 0; j < paymentIds.length; j++) {
            uint256 paymentId = paymentIds[j];
            Payment storage payment = paymantById[paymentId];
            if(payment.claimed == false){
                claimOne(_hash, paymentId);
            }
        }
    }

    function claimOne(bytes32 _hash, uint256 paymentId) public nonReentrant whenNotPaused {
        uint256 id = registrationsByName[_hash];
        Payment storage payment = paymantById[paymentId];
        require(id > 0, "SocialNameService: could not found receiver");
        require(payment.id > 0, "SocialNameService: could not found payment");
        require(payment.claimed == false, "SocialNameService: Already claimed");
        Registration storage reg = registrationsById[id];
        payment.claimed = true;
        if(payment.currency==address(0)){
            address payable receiver = payable(reg.owner);
            bool res = receiver.send(payment.amount);
            require(res==true, "SocialNameService: transfer failed");
        }else{
            IERC20 tokenContract = IERC20(payment.currency);
            bool res = tokenContract.transfer(reg.owner, payment.amount);
            require(res==true, "SocialNameService: transfer failed");
        }
    }

    function cancelOne(uint256 paymentId) external nonReentrant whenNotPaused {
        bytes32 senderHash = keccak256(abi.encodePacked(msg.sender));
        Payment storage payment = paymantById[paymentId];
        require(payment.id > 0, "SocialNameService: could not found payment");
        require(payment.claimed == false, "SocialNameService: Already claimed");
        require(payment.cancel == false, "SocialNameService: Already canceled");
        require(payment.from == senderHash, "SocialNameService: you are not the owner");
        if(payment.currency==address(0)){
            address payable receiver = payable(msg.sender);
            bool res = receiver.send(payment.amount);
            require(res==true, "SocialNameService: transfer failed");
        }else{
            IERC20 tokenContract = IERC20(payment.currency);
            bool res = tokenContract.transfer(msg.sender, payment.amount);
            require(res==true, "SocialNameService: transfer failed");
        }
        payment.claimed = true;
        payment.cancel = true;
    }

    function register(Registration memory registration) external {
        Price memory price = getPrice(SERVICE_REGISTRATION);
        doRegister(msg.sender, registration, price.amount, true);
    }

    function updateRegistration(uint256 id, address newOwner, bytes32 newName, bytes memory newEncryptName, bytes calldata signature) external nonReentrant whenNotPaused {
        Registration storage old = registrationsById[id];
        require(checkSignature(abi.encode(newOwner, newName, address(this)), signature)==true, "SocialNameService: invalid signature");
        require(newOwner != address(0), "SocialNameService: missing user address");
        require(newName != "", "SocialNameService: missing social login");
        require(old.owner == msg.sender, "SocialNameService: you are not the owner of the registration");
        require((registrationsByName[newName]==0 || registrationsByName[newName]==old.id), "SocialNameService: the login is already used");
        bytes32 oldName = old.name;
        if(oldName != newName){
            require(registrationsByName[newName]==0, "SocialNameService: the login is already used");
            old.name = newName;
            old.encryptName = newEncryptName;
            registrationsByName[newName] = old.id;
            //must be after old manipulation
            delete registrationsByName[oldName];
        }
        if(msg.sender != newOwner){
            require(allowChangeOwner==true, "SocialNameService: you can't change the owner");
            old.owner = newOwner;
            removeByValue(registrationsOwner[msg.sender], old.id);
            registrationsOwner[newOwner].push(old.id);
            bytes32 key = generateServiceKey(SERVICE_REGISTRATION, old.id);
            if(locked[key].amount > 0){
                locked[key].payer = newOwner;
            }
            //must be after old manipulation
            delete registrationsOwner[msg.sender];
        }
    }

    function unregister(uint256 id) external nonReentrant whenNotPaused {
        Registration storage old = registrationsById[id];
        require(old.owner != address(0), "SocialNameService: registration not found");
        require(old.owner == msg.sender, "SocialNameService: you are not the owner of the registration");
        if(registrationCount > 0){
            registrationCount--;
        }
        endPayment(SERVICE_REGISTRATION, old.id, msg.sender);
        emit OnUnRegister(msg.sender, old);
        delete registrationsByName[old.name];
        removeByValue(registrationsOwner[msg.sender], id);
        delete registrationsById[id];
    }

    function doRegisterPublic(address owner, Registration memory original, uint256 amount, bool makeTransfer) public {
        doRegister(owner, original, amount, makeTransfer);
    }


    function depositCoin(bytes32 piggyBankHash, bool secure) external payable nonReentrant whenNotPaused {
        bytes32 piggyBankId = piggyBankHashSecure(piggyBankHash, secure);
        //apply fees
        uint256 amount = applyFees(address(0), msg.value, msg.sender, msg.value, SERVICE_DEPOSIT);
        //check if exists
        if(piggyBankById[piggyBankId].id == 0x0){
            //register piggybank
            piggyBankById[piggyBankId] = PiggyBank({
                id: piggyBankId,
                date: block.timestamp,
                amount: 0,
                currency: address(0),
                claimed: 0,
                secure: secure
            });
        }
        PiggyBank storage piggybank = piggyBankById[piggyBankId];
        require(piggybank.currency == address(0), "SocialNameService: invalid currency");
        require(amount > 0, "SocialNameService: msgValue is null");
        piggybank.amount += amount;
    }

    function depositToken(bytes32 piggyBankHash, bool secure, address _token, uint256 amount) external payable nonReentrant whenNotPaused {
        amount = applyFees(_token, amount, msg.sender, msg.value, SERVICE_DEPOSIT);
        IERC20 tokenContract = IERC20(_token);
        bool res = tokenContract.transferFrom(msg.sender, address(this), amount);
        require(res==true, "SocialNameService: transfer failed");
        bytes32 piggyBankId = piggyBankHashSecure(piggyBankHash, secure);
        //apply fees
        //check if exists
        if(piggyBankById[piggyBankId].id == 0x0){
            //register piggybank
            piggyBankById[piggyBankId] = PiggyBank({
                id: piggyBankId,
                date: block.timestamp,
                amount: 0,
                currency: _token,
                claimed: 0,
                secure: secure
            });
        }
        PiggyBank storage piggybank = piggyBankById[piggyBankId];
        require(piggybank.currency == _token, "SocialNameService: invalid currency");
        require(amount > 0, "SocialNameService: msgValue is null");
        piggybank.amount += amount;
    }

    function claimPiggybank(bytes32 _piggyBankHash, bool secure) external nonReentrant whenNotPaused {
        bytes32 piggyBankId = piggyBankHashSecure(_piggyBankHash, secure);
        PiggyBank storage piggy = piggyBankById[piggyBankId];
        uint256 remain = piggy.amount - piggy.claimed;
        require(piggy.id != 0x0, "SocialNameService: could not found piggy bank");
        require(0 < remain, "SocialNameService: Already claimed");
        if(secure){
            bytes32 tryHash = piggyBankHash(msg.sender, piggy.currency);
            require(tryHash == _piggyBankHash, "SocialNameService: you are not allowed to claim");
        }
        if(piggy.currency==address(0)){
            address payable receiver = payable(msg.sender);
            bool res = receiver.send(remain);
            require(res==true, "SocialNameService: transfer failed");
        }else{
            IERC20 tokenContract = IERC20(piggy.currency);
            bool res = tokenContract.transfer(msg.sender, remain);
            require(res==true, "SocialNameService: transfer failed");
        }
        piggy.claimed += remain;
    }


    //PRIVATE
    function applyFees(address currency, uint256 amount, address payer, uint256 msgValue, bytes32 _service) internal returns (uint256) {
        Price storage price = pricing[_service];
        //if no fee return
        if(price.amount == 0){
            return amount;
        }
        require(payer != address(0), "SocialNameService: invalid payer");
        if(price.paymentType == PaymentType.PAY_PROPORTIONNAL){
            uint256 fee = amount * price.amount / 100;
            if(currency == address(0)){
                //IF COIN
                require(amount > fee, "SocialNameService: fees greater than amount");
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
                    require(amount > fee, "SocialNameService: fees greater than amount");
                    return amount - fee;
                }else{
                    //IF NOT SAME => CHECK IF COIN HAS BEEN SENT
                    require(msgValue >= fee, "SocialNameService: insufficient fees");
                    return amount;
                }
            }else{
                //TRANSFER FEE EVEN IF SAME TOKEN
                applyFeesToken(price.currency, payer, fee);
                return amount;
            }
        }else {
            //ONLY PAY AND PAY_PROPORTIONNAL
            return amount;
        }
    }

    function applyFeesToken(address currency, address owner, uint256 amount) internal {
        IERC20 tContract = IERC20(currency);
        bool res0 = tContract.transferFrom(owner, address(this), amount);
        require(res0 == true, "SocialNameService: transfer failed");
    }

    function doRegister(address owner, Registration memory original, uint256 amount, bool makeTransfer) internal override nonReentrant whenNotPaused {
        require(registrationsByName[original.name]==0, "SocialNameService: the login is already registered");
        require(checkSignature(abi.encode(owner, original.name, address(this)), original.signature)==true, "SocialNameService: invalid signature");
        require(owner != address(0), "SocialNameService: missing user address");
        registrationCount++;
        _registrationCounter.increment();
        uint256 id = _registrationCounter.current();
        registrationsById[id] = Registration({
            owner: owner,
            encryptName: original.encryptName,
            signature: original.signature,
            network: original.network,
            name: original.name,
            id: id
        });
        registrationsByName[original.name] = id;
        registrationsOwner[owner].push(id);
        if(makeTransfer){
            IERC20 tContract = IERC20(tokenAddress);
            bool res0 = tContract.transferFrom(owner, address(this), amount);
            require(res0 == true, "SocialNameService: transfer failed");
        }
        startPayment(SERVICE_REGISTRATION, id, tokenAddress, amount, owner);
        emit OnRegister(owner, registrationsById[id]);
    }
}