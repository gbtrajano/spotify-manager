import { PIX_KEY, PIX_MERCHANT_NAME, PIX_MERCHANT_CITY } from '@/types';

function toHexString(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    hex += code.toString(16).padStart(2, '0');
  }
  return hex;
}

function calculateCRC16(data: string): string {
  let crc = 0xFFFF;

  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i);
    crc ^= byte << 8;

    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generatePIXPayload(
  amount: number,
  merchantName: string,
  merchantCity: string,
  txid: string
): string {
  // Format: ID (2 chars) + Length (2 chars) + Value
  // For hex values (GUI, key), length is hex bytes / 2
  // For ASCII values (amount, name, city), length is character count

  const gui = 'br.gov.bcb.pix';
  const guiHex = toHexString(gui);
  const keyHex = toHexString(PIX_KEY);
  const txidHex = toHexString(txid.substring(0, 25));
  const nameHex = toHexString(merchantName.substring(0, 25));
  const cityHex = toHexString(merchantCity.substring(0, 15));
  const amountStr = amount.toFixed(2);

  let payload = '';

  // 00 - Payload Format Indicator
  payload += '00' + '01' + '01';

  // 26 - Merchant Account Information
  // 01 - GUI
  // 02 - Key
  // 03 - Description/TXID
  const guiLen = (guiHex.length / 2).toString().padStart(2, '0');
  const keyLen = (keyHex.length / 2).toString().padStart(2, '0');
  const descLen = (txidHex.length / 2).toString().padStart(2, '0');

  let merchantAccountInfo = '01' + guiLen + guiHex;
  merchantAccountInfo += '02' + keyLen + keyHex;
  merchantAccountInfo += '03' + descLen + txidHex;

  const accLen = (merchantAccountInfo.length / 2).toString().padStart(2, '0');
  payload += '26' + accLen + merchantAccountInfo;

  // 52 - Merchant Category Code (0000)
  payload += '52' + '04' + '0000';

  // 53 - Transaction Currency (986 = BRL)
  payload += '53' + '03' + '986';

  // 54 - Transaction Amount
  const amtLen = amountStr.length.toString().padStart(2, '0');
  payload += '54' + amtLen + amountStr;

  // 58 - Country Code (BR)
  payload += '58' + '02' + 'BR';

  // 59 - Merchant Name
  const nameLen = (nameHex.length / 2).toString().padStart(2, '0');
  payload += '59' + nameLen + nameHex;

  // 60 - Merchant City
  const cityLen = (cityHex.length / 2).toString().padStart(2, '0');
  payload += '60' + cityLen + cityHex;

  // 05 - Additional Data Field - TXID
  const txLen = (txidHex.length / 2).toString().padStart(2, '0');
  payload += '05' + txLen + txidHex;

  // 63 - CRC16
  payload += '6304';

  const crc = calculateCRC16(payload);
  payload += crc;

  return payload;
}

export function generateTransactionId(userName: string, subscriptionId: string): string {
  const namePart = userName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
  const idPart = subscriptionId.slice(-6).toUpperCase();
  return `SPOT${namePart}${idPart}`;
}