

export class Errors{
    socialNameNotFound(){
        throw "social.name.notfound";
    }    
    notAuthenticated(){
        throw "not.authenticated";
    }
    notAppInitialized(){
        throw "not.app.initialized";
    }
    noStakeToWithdraw(){
        throw "staking.withdraw.empty";
    }
    noStakeToCollect(){
        throw "staking.collect.empty";
    }
    stakeRemainEmpty(){
        throw "staking.remain.empty";
    }
    stakeNotStarted(){
        throw "staking.not.start";
    }
    stakeEnded(){
        throw "staking.alread.end";
    }
}

export const appErrors = new Errors;