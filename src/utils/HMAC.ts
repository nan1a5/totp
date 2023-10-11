import hmacSHA256 from 'crypto-js/hmac-sha256';

export const getHmacKey = async (serverCode: string, clientCode: string): Promise<string> => {
    const hmacKey = await HMAC_SHA256(serverCode, clientCode);
    return hmacKey;
}

export const HMAC_SHA256 = async (hmacKey: string, hmacValue: string): Promise<string> => {
    const hmacSha256 = hmacSHA256(hmacValue, hmacKey);
    // 转为十六进制字符串
    const hmacSha256Hex = hmacSha256.toString();

    return hmacSha256Hex;

    
}
