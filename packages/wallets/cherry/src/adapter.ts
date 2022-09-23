import { SendTransactionOptions, WalletAccountError, WalletName, WalletNotConnectedError, WalletPublicKeyError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import { BaseWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import { Connection, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { sign } from 'tweetnacl';

export const CherryWalletName = 'Cherry Wallet' as WalletName<'Cherry Wallet'>;

 //(*1) URL : 체리 로컬/개발/QA/운영 체크 필요
export class CherryWalletAdapter extends BaseWalletAdapter {
    feePayer?: PublicKey | null | undefined;
    private _publicKey!: PublicKey | null;
    protected _connecting!: boolean;
    private _connected!: boolean;
    //private _feePayer?: string;
    private _userSn?: number;
    //private _autoApprove = false;

    name = CherryWalletName;
    url = 'https://github.com/solana-labs/wallet-adapter#usage';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zNCAxMC42djIuN2wtOS41IDE2LjVoLTQuNmw2LTEwLjVhMi4xIDIuMSAwIDEgMCAyLTMuNGw0LjgtOC4zYTQgNCAwIDAgMSAxLjMgM1ptLTQuMyAxOS4xaC0uNmw0LjktOC40djQuMmMwIDIuMy0yIDQuMy00LjMgNC4zWm0yLTI4LjRjLS4zLS44LTEtMS4zLTItMS4zaC0xLjlsLTIuNCA0LjNIMzBsMS43LTNabS0zIDVoLTQuNkwxMC42IDI5LjhoNC43TDI4LjggNi40Wk0xOC43IDBoNC42bC0yLjUgNC4zaC00LjZMMTguNiAwWk0xNSA2LjRoNC42TDYgMjkuOEg0LjJjLS44IDAtMS43LS4zLTIuNC0uOEwxNSA2LjRaTTE0IDBIOS40TDcgNC4zaDQuNkwxNCAwWm0tMy42IDYuNEg1LjdMMCAxNi4ydjhMMTAuMyA2LjRaTTQuMyAwaC40TDAgOC4ydi00QzAgMiAxLjkgMCA0LjMgMFoiIGZpbGw9IiM5OTQ1RkYiLz48L3N2Zz4=';

    constructor() {
        super();
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
        var _width = 500;
        var _height = 700;
        var _left = Math.round(window.screenX + (window.outerWidth/2) - (_width/2));
        var _top = Math.round(window.screenY + (window.outerHeight/2) - (_height/2));

        try {
            var cherryAdres : string = "";
            this._connecting = true;
            
            if (this.connected || this.connecting) { return };
            
            window.open(process.env.NEXT_PUBLIC_CHERRY_LOGIN_LOCAL, "_blank", 
            "width=" + _width + ", height=" + _height + ", left=" + _left + ", top=" + _top + ", scrollbars=no, location=no");  //(*1) URL

            async function cherryReceivePage(e: any) {
                if (e.origin == process.env.NEXT_PUBLIC_CHERRY_LOCAL) { //(*1) URL
                    console.log('e======', e);
                    console.log('e.data======', e.data);

                    return e.data;
                }
            }
            window.addEventListener('message', async (e) => {
                let buffer: Buffer;
                let buffer2: Buffer;
                let cherryData = await cherryReceivePage(e);
                console.log('cherryData==', cherryData);

                if(cherryData) {
                    try {
                        cherryAdres = cherryData.publicKey;
                        this._userSn = cherryData.userSn;
                        //this.feePayer = cherryData.feePayer;

                        console.log('cherryAdres==', cherryAdres);
                        console.log('this._userSn==', this._userSn);
                        //console.log('this._feePayer==', this.feePayer);

                        buffer = new PublicKey(cherryAdres).toBuffer(); 
                        buffer2 = new PublicKey(cherryData.feePayer).toBuffer(); 
                        console.log('buffer2==', buffer2);
                        console.log('cherryData.feePayer==', cherryData.feePayer);
                    } catch (error: any) {
                        throw new WalletAccountError(error?.message, error);
                    }

                    let publicKey: PublicKey;
                    try {
                        publicKey = new PublicKey(buffer);
                        this.feePayer = new PublicKey(buffer2);
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


    async signTransaction(transaction: Transaction): Promise < Transaction > {
        try {
            if (!this._publicKey) throw new WalletNotConnectedError();
    
            try {
                //1wKzhmG5497Fo8Gj7wmxF2cKR2wbUtDwD9a6EFCSuxRouEnJX9gZQj4sG9tVBNohxEas6cEpztDrj9Z1bX3eVmV(수연 prv)
                //const prvKey ="4vzAo8fP9k5P6HbgES94MgmEwq82GuTd3GfGW3NfN6zZn26qBijyB6R8Qoou2jQj1HZbMc8EycPr9mJjErBpcPgF";
                //const payer = Keypair.fromSecretKey(bs58.decode(prvKey)); // 내 지갑으로 대납
                let transactionBuffer = transaction.serializeMessage(); // 메시지 자체를 (bytes)로 바꿈 == serialize
                let signature: string;
                let bs58TxStr = bs58.encode(transactionBuffer); // 메시지 해시값 string 변경 > 체리 전송
                console.log("TR STRING BUFFER : ", bs58TxStr);

                await fetch(process.env.NEXT_PUBLIC_CHERRY_SIGN_LOCAL as string, { //(*1) URL
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            bs58TxStr: bs58TxStr,
                            userSn: this._userSn
                        }),
                    })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data != 'undefined' && data != null) { // 랜더링 시 undefined 나오는거 해결 위함?
                            console.log('post/stringify서버에서 받은 데이터(뷰)==', JSON.stringify(data));
                            console.log('post서버에서 받은 데이터(뷰)==', data);
                            console.log('post(뷰)==', data.data);
    
                            signature = data.data.signedSig;
                            console.log('signature 주입 후==', signature);

                            let signedSigOrgStr = bs58.decode(signature); // 해석하면 퍼블릭키와 해시값을 도출할수있음 
                            console.log("SIGNED SINATURE : ", signedSigOrgStr);
    
                            transaction.addSignature(this._publicKey as PublicKey, new Buffer(signedSigOrgStr));
                            let isVerifiedSignature = transaction.verifySignatures();

                            console.log("isVerifiedSignature:", isVerifiedSignature);
                            console.log("===transaction:", transaction);

                            return transaction;
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    });
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

