import { json2String, str2ab } from "./format";
import { KEYUTIL } from 'jsrsasign';

export class Request {
    keyPairs: any = null;
    public_key: any = null;
    private_key: string = '';

    public async getServerCode(username:string, clientCode:string): Promise<string> {
        // 获取publicKey

        if(window.crypto.subtle.generateKey === undefined) {
            throw new Error('浏览器不支持window.crypto.subtle.generateKey');
        }

        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"]
        );
    
        const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey).then((publicKey: any) => {
            const base64PublicKey = btoa(String.fromCharCode(...Array.from(new Uint8Array(publicKey))));
            const pemHeader = "-----BEGIN PUBLIC KEY-----";
            const pemFooter = "-----END PUBLIC KEY-----";
    
            // 给中间的内容添加换行符，每64个字符一行
            const base64PublicKeyGroup = [];
            for (let i = 0; i < base64PublicKey.length; i += 64) {
                base64PublicKeyGroup.push(base64PublicKey.substr(i, 64));
            }
            const base64PublicKeyGroupWithLineBreak = base64PublicKeyGroup.join("\n");

            const s = pemHeader + "\n" + base64PublicKeyGroupWithLineBreak + "\n" + pemFooter + "\n";
    
            return s;
        });

        const privateKey:string = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey).then((privateKey: any) => {
            const base64PrivateKey = btoa(String.fromCharCode(...Array.from(new Uint8Array(privateKey))));

            return base64PrivateKey;
        });
        this.private_key = privateKey;

        const base64ClientCode = btoa(clientCode);

        // 给publicKey添加'\\n'
        const formatedPublicKey = publicKey.replace(/[\r\n]/g, '\\n');
        this.public_key = formatedPublicKey;
        console.log('this.public_key',this.public_key);
        
        const data = {
            public_key: this.public_key,
            username,
            client_code: base64ClientCode
        };
        // console.log('data',data);
        
        // 分割字符串,190个字符一组
        const dataStr = json2String(data);
        console.log('dataStr',dataStr);
        
        // dataStr.replace(/[\\n]/g, '\n');
        const dataStrGroup = [];
        for (let i = 0; i < dataStr.length; i += 190) {
            dataStrGroup.push(dataStr.substr(i, 190));
        }
        

        // 加密
        const buffers = [];
        for (let i = 0; i < dataStrGroup.length; i++) {
            const arraybuffer:any = await this.encrypt(dataStrGroup[i], {
                base64:false
            });

            buffers.push(arraybuffer);
        }
        
        const totalLength = buffers.reduce((acc, cur) => acc + cur.byteLength, 0);
        const encryptedData = new Uint8Array(totalLength);
        let offset = 0;
        for (const buffer of buffers) {
            encryptedData.set(new Uint8Array(buffer), offset);
            offset += buffer.byteLength;
        }

        // 转为base64
        const encryptedDataBase64 = btoa(String.fromCharCode(...Array.from(encryptedData)));
        console.log('encryptedDataBase64',encryptedDataBase64);
        


        const jsondata = {
            s: encryptedDataBase64
        }

        // 发送
        const serverCode = await fetch('https://totp.wuliaomj.com/index/totp/init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsondata),
        }).then(res => res.json()).then(async res => {
            // console.log('res',res);

            // 解密
            const codeObj = await this.decrypt(res.data);
            // 转为json
            const codeJson = JSON.parse(codeObj);
            // bsa64解码
            const serverCode = atob(codeJson.server_code);
            console.log('serverCode',serverCode);
            return serverCode;
        });

        return serverCode;
    }

    public async getServerPublicKey(): Promise<string> {
        const serverPublicKey = await fetch('https://totp.wuliaomj.com/index/index/public_key', {
            method: 'GET',
        }).then(res => res.json()).then(res => {
            console.log(res);
            
            return res.data.public;
        });

        return serverPublicKey;
    }

    private async encrypt(message:string, option:{
        base64?:boolean
    } = {
        base64:true
    }): Promise<string | ArrayBuffer> {
        const serverPublicKey = await this.getServerPublicKey();
        // 去除‘\r\n’
        const formatedServerPublicKey = serverPublicKey.replace(/[\r\n]/g, '');
        const pemHeader = "-----BEGIN PUBLIC KEY-----";
        const pemFooter = "-----END PUBLIC KEY-----";
        const pemContents = formatedServerPublicKey.substring(pemHeader.length, formatedServerPublicKey.length - pemFooter.length);

        let enc = new TextEncoder();
        const encodedMsg = enc.encode(message);

        const binaryDerString = window.atob(pemContents);
        // convert from a binary string to an ArrayBuffer
        const binaryDer = str2ab(binaryDerString);

        const cryptoKey = await window.crypto.subtle.importKey(
            "spki",
            binaryDer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            true,
            ["encrypt"]
        );
        
        const chipertext = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            cryptoKey,
            encodedMsg
        );
        const ciphertextArray:Uint8Array = new Uint8Array(chipertext);
        const ciphertextBase64: string = btoa(String.fromCharCode(...Array.from(ciphertextArray)));
    
        // 返回base64的密文
        // console.log('ciphertextBase64',ciphertextBase64);
        
        if(option.base64) {
            return ciphertextBase64;
        } else {
            return chipertext;
        }
    }

    // 
    private async decrypt(message:string): Promise<string> {
        const bufferedMessage = str2ab(window.atob(message));
        console.log('this.private_key',this.private_key);
        

        const privateKey = await window.crypto.subtle.importKey(
            "pkcs8",
            str2ab(window.atob(this.private_key)),
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            true,
            ["decrypt"]
        );
        // 使用自己的私钥解密
        const text = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
            },
            privateKey,
            bufferedMessage
        );

        const dec = new TextDecoder();
        const decryptedMessage = dec.decode(text);
        return decryptedMessage;

    }
}