export function str2ab(str:string) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

export function json2String(json:any) {
    // 遍历
    let str = '{';
    for (const key in json) {
        str += `"${key}":"${json[key]}",`;
    }
    // 去除最后一个逗号
    str = str.substr(0, str.length - 1);
    str += '}';

    return str;
}

// export function mergeUint8List2Base64String(list:Uint8Array[]) {
//     const list:List<number> = new List<number>();
//     for (let i = 0; i < list.length; i++) {
//         list.addAll(list[i]);
//     }
//     const uint8List = list.toUint8List();
//     const base64 = uint8ListToBase64(uint8List);

//     return base64;
// }

// function getMessageEncoding() {
//     const messageBox = document.querySelector(".rsa-oaep #message");
//     let message = messageBox.value;
//     let enc = new TextEncoder();
//     return enc.encode(message);
// }