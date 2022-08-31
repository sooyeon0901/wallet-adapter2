import { EventEmitter, SendTransactionOptions, WalletAccountError, WalletError, WalletName, WalletNotConnectedError, WalletPublicKeyError, WalletSendTransactionError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import { BaseWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import { clusterApiUrl, Connection, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey, Signer, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { Sign } from 'crypto';
import { SignatureKind } from 'typescript';
import { sign } from 'tweetnacl';

export const CherryWalletName = 'Cherry Wallet' as WalletName<'Cherry Wallet'>;

const sleep = async (ms: number) => {
    return new Promise((r) => setTimeout(r, ms));
};

export class CherryWalletAdapter extends BaseWalletAdapter {
    private _publicKey: PublicKey | null = null;
    private _autoApprove = false;

    name = CherryWalletName;
    url = 'https://github.com/solana-labs/wallet-adapter#usage';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zNCAxMC42djIuN2wtOS41IDE2LjVoLTQuNmw2LTEwLjVhMi4xIDIuMSAwIDEgMCAyLTMuNGw0LjgtOC4zYTQgNCAwIDAgMSAxLjMgM1ptLTQuMyAxOS4xaC0uNmw0LjktOC40djQuMmMwIDIuMy0yIDQuMy00LjMgNC4zWm0yLTI4LjRjLS4zLS44LTEtMS4zLTItMS4zaC0xLjlsLTIuNCA0LjNIMzBsMS43LTNabS0zIDVoLTQuNkwxMC42IDI5LjhoNC43TDI4LjggNi40Wk0xOC43IDBoNC42bC0yLjUgNC4zaC00LjZMMTguNiAwWk0xNSA2LjRoNC42TDYgMjkuOEg0LjJjLS44IDAtMS43LS4zLTIuNC0uOEwxNSA2LjRaTTE0IDBIOS40TDcgNC4zaDQuNkwxNCAwWm0tMy42IDYuNEg1LjdMMCAxNi4ydjhMMTAuMyA2LjRaTTQuMyAwaC40TDAgOC4ydi00QzAgMiAxLjkgMCA0LjMgMFoiIGZpbGw9IiM5OTQ1RkYiLz48L3N2Zz4=';

    constructor() {
        super();
        this._autoApprove = true;
    }

    get connecting() {
        return false;
    }
    get publicKey() {
        return this._publicKey;
    }
    get readyState() {
        return WalletReadyState.Installed;
    }
    get autoApprove(): boolean {
        return this._autoApprove;
    }
    async connect(): Promise<void> {
        var cherryAdres : string = "";
        console.log("1");
        //http://localhost:8080/public/member/loginUserPage
        //http://localhost:8080/public/metaplex/cherryLogin
        //http://localhost:8080/public/metaplex/cherryAdapterTest
        fetch('http://localhost:8080/public/metaplex/cherryAdapterTest', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userSn: "1000000000000001842"
            }),
            // req data 는 서버쪽에다가 작성 
        })
        .then((res) => res.json()) // 데이터 한번 정제해 줘야 함
        .then((data) => {
            if(data != 'undefined' && data != null){ // 랜더링 시 undefined 나오는거 해결 위함?
                console.log('post/stringify서버에서 받은 데이터(뷰)==', JSON.stringify(data));
                console.log('post서버에서 받은 데이터(뷰)==', data);
                console.log('post지갑 주소(뷰)==', data.data);

                cherryAdres = data.data;
                console.log("2");
                console.log('wallet 주입 후==', cherryAdres);
            }
        }).then(async () => {
            let buffer: Buffer;
            try {
                buffer = new PublicKey(cherryAdres).toBuffer(); 
            } catch (error: any) {
                throw new WalletAccountError(error?.message, error);
            }
            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(buffer);
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }
            this._publicKey = publicKey;

            this.emit('connect', this._publicKey);
            console.log("체리publicKey==", publicKey);
            console.log("체리this._publicKey==", this._publicKey);
            console.log("3");

            //this.emit('connect', publicKey);//this.publicKey as PublicKey
        })
        .catch(err => {console.log(err)});
    }

    // 세션 끊어야하지 않으면 별다른 로직 추가할 필요는 없음
    async disconnect(): Promise<void> {
        this._publicKey = null;
        this.emit('disconnect');
    }

    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {

        return '[sendTransaction] its CHERRY';
    }


    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            if (!this._publicKey) throw new WalletNotConnectedError();

            try {
                //1wKzhmG5497Fo8Gj7wmxF2cKR2wbUtDwD9a6EFCSuxRouEnJX9gZQj4sG9tVBNohxEas6cEpztDrj9Z1bX3eVmV(수연 prv)
                const prvKey ="4vzAo8fP9k5P6HbgES94MgmEwq82GuTd3GfGW3NfN6zZn26qBijyB6R8Qoou2jQj1HZbMc8EycPr9mJjErBpcPgF";
                const payer = Keypair.fromSecretKey(bs58.decode(prvKey)); // 내 지갑으로 대납
                let transactionBuffer =  transaction.serializeMessage(); // string 으로 변경 bs58TxStr가 출력
                
                let bs58TxStr = bs58.encode(transactionBuffer);
                console.log("TR STRING BUFFER : ",bs58TxStr);

                let testsignature = sign.detached(transactionBuffer, payer.secretKey); 
                let testsignedSigOrgStr = bs58.encode(testsignature); 
                //console.log('testsignature==', testsignature);
                console.log('testsignedSigOrgStr==', testsignedSigOrgStr);
                
                let signature: string;
                //let signature = nacl.sign.detached(transactionBuffer,payer.secretKey); 
                //(*) 이부분이 서버쪽에서 받아오는 값으로 변경됨 > decode 해서 addSignature
                // detached 안에 두가지. 1. 메시지를 해시. 해시값과 퍼블릭키를 합친 것을 프라이빗키로 암호화함 . sign한 암호화된 문장만 넘김 
                await fetch('http://localhost:8080/public/metaplex/cherrySignTest', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        bs58TxStr: bs58TxStr
                    }),
                })
                .then((res) => res.json())
                .then((data) => {
                    if(data != 'undefined' && data != null){ // 랜더링 시 undefined 나오는거 해결 위함?
                        console.log('post/stringify서버에서 받은 데이터(뷰)==', JSON.stringify(data));
                        console.log('post서버에서 받은 데이터(뷰)==', data);
                        console.log('post(뷰)==', data.data);

                        signature = data.data;
                        console.log('signature 주입 후==', signature);
                        let signedSigOrgStr = bs58.decode(signature); // 해석하면 퍼블릭키와 해시값을 도출할수있음 
                        console.log("SIGNED SINATURE : ",signedSigOrgStr);
                        
                        console.log("payer.publicKey:",payer.publicKey.toBase58());

                        transaction.addSignature(payer.publicKey, new Buffer(signedSigOrgStr));
                        let isVerifiedSignature = transaction.verifySignatures();
                        console.log("isVerifiedSignature:",isVerifiedSignature);
                        
                        return transaction;
                    }
                    
                })
                .catch(err => {console.log(err)});
                
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } 
        
        return transaction;
        
    }

    async signAllTransaction(
        transactions: Transaction[],
    ): Promise<Transaction[]> {
        console.log('[signAllTransactions]transactions==', transactions);
        
        let signature: Uint8Array | string[];
        const a =
            Keypair.fromSecretKey(bs58.decode('1wKzhmG5497Fo8Gj7wmxF2cKR2wbUtDwD9a6EFCSuxRouEnJX9gZQj4sG9tVBNohxEas6cEpztDrj9Z1bX3eVmV'));
        
        const signatures = transactions.map((tx) => {
            return new Buffer( sign.detached(tx.serializeMessage(), a.secretKey))
        }); 
        
        transactions = transactions.map((tx, idx) => {
            tx.addSignature(a.publicKey, signatures[idx]);
            console.log('[signAllTransactions]tx==', tx);
            console.log('[signAllTransactions]tx.verifySignatures()==', tx.verifySignatures());
            return tx;
        })

        return transactions;
    }
}

