declare class RSAKey{
    n :any;
    e :any;
    d :any;
    p :any;
    q :any;
    dmp1 :any;
    dmq1 :any;
    coeff :any;
  }
  
declare module "cryptico-js" {
   
    function generateRSAKey(passphrase:string, bitlength:number):RSAKey;
  
    
    function publicKeyString(rsakey:string): string;
    
    
    function encrypt(plaintext:string, publickeystring:string, signingkey?:string): { status:number, cipher:string };
    
    function decrypt(ciphertext:string, key:RSAKey): { status:number, plaintext:string, signature:string, publicKeyString:string};
  
    function publicKeyID(publicKeyString: string):string;
}