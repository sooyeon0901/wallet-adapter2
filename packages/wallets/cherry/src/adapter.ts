import { EventEmitter, scopePollingDetectionStrategy, SendTransactionOptions, WalletAccountError, WalletError, WalletName, WalletNotConnectedError, WalletPublicKeyError, WalletSendTransactionError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import { BaseWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import { clusterApiUrl, Connection, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey, Signer, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { Sign, timingSafeEqual } from 'crypto';
import { SignatureKind } from 'typescript';
import { sign } from 'tweetnacl';

export const CherryWalletName = 'Cherry Wallet' as WalletName<'Cherry Wallet'>;


// const cherryReceivePage = (e: any) => {
//     return console.log('e======', e);
// }
export class CherryWalletAdapter extends BaseWalletAdapter {
    private _publicKey!: PublicKey | null;
    protected _connecting!: boolean;
    private _connected!: boolean;
    //private _autoApprove = false;

    name = CherryWalletName;
    url = 'https://github.com/solana-labs/wallet-adapter#usage';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zNCAxMC42djIuN2wtOS41IDE2LjVoLTQuNmw2LTEwLjVhMi4xIDIuMSAwIDEgMCAyLTMuNGw0LjgtOC4zYTQgNCAwIDAgMSAxLjMgM1ptLTQuMyAxOS4xaC0uNmw0LjktOC40djQuMmMwIDIuMy0yIDQuMy00LjMgNC4zWm0yLTI4LjRjLS4zLS44LTEtMS4zLTItMS4zaC0xLjlsLTIuNCA0LjNIMzBsMS43LTNabS0zIDVoLTQuNkwxMC42IDI5LjhoNC43TDI4LjggNi40Wk0xOC43IDBoNC42bC0yLjUgNC4zaC00LjZMMTguNiAwWk0xNSA2LjRoNC42TDYgMjkuOEg0LjJjLS44IDAtMS43LS4zLTIuNC0uOEwxNSA2LjRaTTE0IDBIOS40TDcgNC4zaDQuNkwxNCAwWm0tMy42IDYuNEg1LjdMMCAxNi4ydjhMMTAuMyA2LjRaTTQuMyAwaC40TDAgOC4ydi00QzAgMiAxLjkgMCA0LjMgMFoiIGZpbGw9IiM5OTQ1RkYiLz48L3N2Zz4=';

    constructor() {
        super();
        //this._autoApprove = true;
        // scopePollingDetectionStrategy(() => {
        //     if (this._connecting) {
        //         this._readyState = WalletReadyState.Installed;
        //         this.emit('readyStateChange', this._readyState);
        //         return true;
        //     }
        //     return false;
        // });
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
    // get autoApprove(): boolean {
    //     return this._autoApprove;
    // }
    get connected(): boolean {
        //this.connected = true;
        return this._connected;
    }

    

    async connect(): Promise<void> {
        try {
            console.log('connect 진입');
            var cherryAdres : string = "";
            this._connecting = true;
            
            if (this.connected || this.connecting) { return };
            // if (! this._publicKey) { 
            //     window.open("http://192.168.10.207:8080/public/metaplex/walletAdres", "_blank");
            //     //return
            // };
            window.open("http://192.168.10.207:8080/public/metaplex/walletAdres", "_blank");
            async function cherryReceivePage(e: any) {
                console.log('=e ==', e);
                if (e.origin == "http://localhost:8080" || e.origin == "http://192.168.10.207:8080") {
                    console.log('==========================================================================');
                    console.log('e======', e);
                    console.log('e.data======', e.data.publicKey);
                    
                    return e.data.publicKey;
                }
            }
            window.addEventListener('message', async (e) => {
                console.log('이벤트 리스너 확인');
                let buffer: Buffer;
                let cherryAdres = await cherryReceivePage(e)
                console.log('cherryAdres==', cherryAdres);
                if(cherryAdres) {
                    try {
                        buffer = new PublicKey(cherryAdres).toBuffer(); 
                        console.log('buffer==', buffer);
                    } catch (error: any) {
                        throw new WalletAccountError(error?.message, error);
                    }

                    let publicKey: PublicKey;
                    try {
                        publicKey = new PublicKey(buffer);
                        console.log('publicKey==', publicKey);
                    } catch (error: any) {
                        throw new WalletPublicKeyError(error?.message, error);
                    }

                    this._publicKey = publicKey;
                    this.emit('connect', this._publicKey);
                }
            }, false);
            //this._connecting = false;
            this._connected = true;

        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }
    

    // 세션 끊어야하지 않으면 별다른 로직 추가할 필요는 없음
    async disconnect(): Promise<void> {
        //this._publicKey = null; // 재 connect 시 null로 넘어가서 주석처리함. connect 및 disconnect 잘 작동함.
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
                //const prvKey ="4vzAo8fP9k5P6HbgES94MgmEwq82GuTd3GfGW3NfN6zZn26qBijyB6R8Qoou2jQj1HZbMc8EycPr9mJjErBpcPgF";
                //const payer = Keypair.fromSecretKey(bs58.decode(prvKey)); // 내 지갑으로 대납
                let transactionBuffer =  transaction.serializeMessage(); // 메시지 자체를 (bytes)로 바꿈 == serializ
                
                let bs58TxStr = bs58.encode(transactionBuffer); // 메시지 해시값 string 변경 > 체리 전송
                console.log("TR STRING BUFFER : ",bs58TxStr);
                
                let signature: string;
                await fetch('http://localhost:8080/public/metaplex/cherrySignTest', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        bs58TxStr: bs58TxStr,
                        userSn: "1000000000000001842"
                    }),
                })
                .then((res) => res.json())
                .then((data) => {
                    if(data != 'undefined' && data != null){ // 랜더링 시 undefined 나오는거 해결 위함?
                        console.log('post/stringify서버에서 받은 데이터(뷰)==', JSON.stringify(data));
                        console.log('post서버에서 받은 데이터(뷰)==', data);
                        console.log('post(뷰)==', data.data);

                        signature = data.data.signedSig;
                        console.log('signature 주입 후==', signature);
                        let signedSigOrgStr = bs58.decode(signature); // 해석하면 퍼블릭키와 해시값을 도출할수있음 
                        console.log("SIGNED SINATURE : ",signedSigOrgStr);

                        transaction.addSignature(this._publicKey as PublicKey, new Buffer(signedSigOrgStr));
                        let isVerifiedSignature = transaction.verifySignatures();
                        console.log("isVerifiedSignature:",isVerifiedSignature);
                        console.log("===transaction:",transaction);
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

    async signAllTransaction(transactions: Transaction[]): Promise<Transaction[]> {
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

