import { SendTransactionOptions, WalletAccountError, WalletName, WalletNotConnectedError, WalletPublicKeyError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import { BaseWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import { Connection, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { sign } from 'tweetnacl';

export const CherryWalletName = 'Cherry' as WalletName<'Cherry'>;

 //(*1) URL : 체리 로컬/개발/QA/운영 체크 필요
export class CherryWalletAdapter extends BaseWalletAdapter {
    feePayer?: PublicKey | undefined;
    private _publicKey!: PublicKey | null;
    protected _connecting!: boolean;
    private _connected!: boolean;
    //private _feePayer?: string;
    private _userSn?: number;
    private _wallet: PublicKey | null | undefined;//alpha가 연동 안돼서 추가. 테스트 필요 
    //private _autoApprove = false;

    name = CherryWalletName;
    url = 'https://github.com/solana-labs/wallet-adapter#usage';
    icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDA1IDc5LjE2NDU5MCwgMjAyMC8xMi8wOS0xMTo1Nzo0NCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpiMjRiMWVhZC0yYTljLTQ4OWItODA4My1mY2JjMjE3OGY0NWMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QUZFNTM4Rjc1MjFFMTFFQkFFRDhBQ0U2OTNBNkQ2NDQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QUZFNTM4RjY1MjFFMTFFQkFFRDhBQ0U2OTNBNkQ2NDQiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozODlhODE4MS02M2I3LTQwMzMtODAzYS02ZWNjMGVlNmVjY2EiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDplYjM4N2MxYy03Y2IzLWRmNDMtYTk4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';

    constructor() {
        super();
        this._connecting = false;
    }

    get connecting() {
        return this._connecting;
    }
    get publicKey() {
        return this._publicKey;
    }
    get readyState() {
        return WalletReadyState.Installed;
    }
    // get autoApprove(): boolean {return this._autoApprove;}
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
            
            if (this.connected || this.connecting) { return };
            this._connecting = true;
            
            window.open(process.env.NEXT_PUBLIC_CHERRY_LOGIN_PRD, "_blank", 
            "width=" + _width + ", height=" + _height + ", left=" + _left + ", top=" + _top + ", scrollbars=no, location=no");  //(*1) URL

            async function cherryReceivePage(e: any) {
                if (e.origin == process.env.NEXT_PUBLIC_CHERRY_PRD) { //(*1) URL
                    //console.log('[체리] e======'+ e + ', e.data======' + e.data);

                    return e.data;
                }
            }
            window.addEventListener('message', async (e) => {
                let buffer: Buffer;
                let bufferFee: Buffer;
                let cherryData = await cherryReceivePage(e);
                //console.log('[체리] cherryData==', cherryData);

                if(cherryData) {
                    try {
                        cherryAdres = cherryData.publicKey;
                        this._userSn = cherryData.userSn;
                        //console.log('[체리]cherryAdres==' + cherryAdres + ', [체리]this._userSn==' + this._userSn);

                        buffer = new PublicKey(cherryAdres).toBuffer(); 
                        bufferFee = new PublicKey(cherryData.feePayer).toBuffer(); 
                        //console.log('[체리]bufferFee==' + bufferFee + ', [체리]cherryData.feePayer==' + cherryData.feePayer);
                    } catch (error: any) {
                        throw new WalletAccountError(error?.message, error);
                    }

                    let publicKey: PublicKey;
                    try {
                        publicKey = new PublicKey(buffer);
                        this.feePayer = new PublicKey(bufferFee);
                    } catch (error: any) {
                        throw new WalletPublicKeyError(error?.message, error);
                    }
                    this._publicKey = publicKey;
                    this._wallet = publicKey; //alpha가 연동 안돼서 추가. 테스트 필요 
                    this.emit('connect', this._publicKey);
                    console.log('this._wallet===', this._wallet);//alpha가 연동 안돼서 추가. 테스트 필요 
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

            console.log("------------------signing 이전 feepayer 설정전 --------------------");
            for (const {signature, publicKey} of transaction.signatures) {
                if (signature) {
                    const pubstr = publicKey.toBase58();
                    const sigstr = bs58.encode(signature as Buffer) ;
                    console.log("[체리]signature : %s, pubkey : %s", sigstr, pubstr);
                }
                else {
                    console.log("[체리]signature : NULL, pubkey : %s", publicKey.toBase58());
                }
            }
    
            let transactionBuffer = transaction.serializeMessage(); 
            let pubSignature: string;
            let feeSignature: string;
            let bs58TxStr = bs58.encode(transactionBuffer);
            console.log("[체리]TR STRING BUFFER : ", bs58TxStr);

            try {
                await fetch(process.env.NEXT_PUBLIC_CHERRY_SIGN_PRD as string, { //(*1) URL
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            bs58TxStr: bs58TxStr,
                            userSn: this._userSn,
                            feePayer: this.feePayer
                        }),
                    })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data != 'undefined' && data != null) { 
                            console.log('[체리] fetch result :: data==' + data + ', data.data==' + data.data);
                            pubSignature = data.data.pubKeySignedSig;
                            console.log('[체리][pubSignature] signature 주입 후==', pubSignature);

                            let signedSigOrgStr = bs58.decode(pubSignature);
                            console.log("[체리][signedSigOrgStr]SIGNED SINATURE : ", signedSigOrgStr);
                            transaction.addSignature(this._publicKey as PublicKey, new Buffer(signedSigOrgStr)); //[owner]

                            console.log("[체리]===transaction:", transaction);
                            return transaction;
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    });

                    // [feePayer] 위 결과를 재 serialize 후 사이닝 진행 : 보안
                    transactionBuffer = transaction.serializeMessage();
                    bs58TxStr = bs58.encode(transactionBuffer);
                    
                    await fetch(process.env.NEXT_PUBLIC_CHERRY_SIGN_PRD as string, { //(*1) URL
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            bs58TxStr: bs58TxStr,
                            userSn: -1, // 동일한 로직 타도록 -1로 지정해서 전달
                            feePayer: this.feePayer
                        }),
                    })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data != 'undefined' && data != null) { 
                            console.log('[체리] fetch result :: data==' + data + ', data.data==' + data.data);
                            feeSignature = data.data.pubKeySignedSig;
                            console.log('[체리][feeSignature] signature 주입 후==', feeSignature);

                            let signedSigFeeStr = bs58.decode(feeSignature);
                            console.log("[체리][signedSigFeeStr]SIGNED SINATURE : ", signedSigFeeStr);
                            transaction.addSignature(this.feePayer as PublicKey, new Buffer(signedSigFeeStr)); //[feePayer]

                            // 결과값이 true여야 트랜젝션 성공
                            let isVerifiedSignature = transaction.verifySignatures();
                            console.log("[체리] isVerifiedSignature:", isVerifiedSignature);

                            console.log("[체리]===transaction:", transaction);
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
        console.log('[체리][signAllTransactions]transactions==', transactions);
        
        let signature: Uint8Array | string[];
        const a =
            Keypair.fromSecretKey(bs58.decode('1wKzhmG5497Fo8Gj7wmxF2cKR2wbUtDwD9a6EFCSuxRouEnJX9gZQj4sG9tVBNohxEas6cEpztDrj9Z1bX3eVmV'));
        
        const signatures = transactions.map((tx) => {
            return new Buffer( sign.detached(tx.serializeMessage(), a.secretKey))
        }); 
        
        transactions = transactions.map((tx, idx) => {
            tx.addSignature(a.publicKey, signatures[idx]);
            console.log('[체리][signAllTransactions]tx==', tx);
            console.log('[체리][signAllTransactions]tx.verifySignatures()==', tx.verifySignatures());
            return tx;
        })

        return transactions;
    }
}

