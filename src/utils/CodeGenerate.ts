import { HMAC_SHA256 } from './HMAC';

export class CodeGenerate {
    static code_chars:string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    /**
     * totp算法生成code
     * 
     * @param {number} length
     * @param {string} hmacKey
     * @param {number} timeStep
     * @param {number} timeStartStamp
     * 
     * @returns {Promise<string>} code
     */
    public static async totpCode(length: number, hmacKey: string, timeStep: number, timeStartStamp: number): Promise<string> {
        const jsTimeStamp = BigInt(Math.floor(Date.now() / 1000));
        // console.log('jsTimeStamp', jsTimeStamp);
      
        const timeSlice = jsTimeStamp / BigInt(timeStep);

        const hmacValue = timeSlice.toString();
        // console.log('hmacValue', hmacValue);
        
        const hmacSha256 = await HMAC_SHA256(hmacKey, hmacValue);
        // console.log('hmacSha256', hmacSha256);
        

        // 取出最后一个字节转为十进制作为偏移量offset
        const offset = parseInt(hmacSha256.substr(-1), 16);
        // console.log('offset', offset);
        
        // 将剩余的按三个字节一组分组
        const _hmacSha256Group = hmacSha256.substr(0, hmacSha256.length - 1).split('');
        const hmacSha256Group = [];
        for (let i = 0; i < _hmacSha256Group.length; i += 3) {
            hmacSha256Group.push(_hmacSha256Group[i] + _hmacSha256Group[i + 1] + _hmacSha256Group[i + 2]);
        }
        // console.log(hmacSha256Group);
        
        // 转为number数组
        if (!hmacSha256Group) {
            throw new Error('hmacSha256Group is null');
        }
        const hmacSha256GroupNumber = hmacSha256Group.map((item: string) => {
            return parseInt(item, 16);
        });
        // console.log('hmacSha256GroupNumber', hmacSha256GroupNumber);
        
        // 将number数组中的每一项与offset相加然后对code_chars长度取余，并取出对应的字符
        const code = hmacSha256GroupNumber.map((item: number) => {
            return this.code_chars[(item + offset) % this.code_chars.length];
        }).join('');

        return code.substr(0, length);
    }
}

