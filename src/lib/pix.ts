import { PIX_KEY, PIX_MERCHANT_NAME, PIX_MERCHANT_CITY } from '@/types';

function formatAmount(amount: number): string {
  return amount.toFixed(2).replace('.', '');
}

function generateGUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const hexCode = code.toString(16).padStart(2, '0');
    hex += hexCode;
  }
  return hex;
}

function addField(payload: string, fieldId: string, value: string): string {
  const valueHex = stringToHex(value);
  const length = valueHex.length / 2;
  return payload + fieldId + length.toString().padStart(2, '0') + valueHex;
}

export function generatePIXPayload(
  amount: number,
  merchantName: string,
  merchantCity: string,
  txid: string
): string {
  let payload = '000201';

  // Payload Format Indicator (02 = POS-based)
  payload = addField(payload, '00', '01');

  // Merchant Account Information
  const gui = 'br.gov.bcb.pix';
  const key = PIX_KEY;

  let merchantAccountInfo = addField(payload, '01', gui);
  merchantAccountInfo += '0216' + stringToHex(key);
  merchantAccountInfo += '0309' + stringToHex(txid);

  const merchantAccountInfoHex = merchantAccountInfo.slice(4);
  const merchantAccountInfoLength = (merchantAccountInfoHex.length / 2).toString().padStart(2, '0');

  payload += '26' + merchantAccountInfoLength + merchantAccountInfoHex;

  // Merchant Category Code (0000 = no category)
  payload = addField(payload, '52', '0000');

  // Transaction Currency (986 = BRL)
  payload = addField(payload, '53', '986');

  // Transaction Amount
  payload = addField(payload, '54', formatAmount(amount));

  // Country Code
  payload = addField(payload, '58', 'BR');

  // Merchant Name
  payload = addField(payload, '59', merchantName);

  // Merchant City
  payload = addField(payload, '60', merchantCity);

  // Additional Data Field - TXID
  const txidField = addField('', '05', txid);
  const txidFieldHex = txidField.slice(4);
  const txidLength = (txidFieldHex.length / 2).toString().padStart(2, '0');
  payload += '05' + txidLength + txidFieldHex;

  // CRC16 Calculation
  payload += '6304';

  const crc16 = calculateCRC16(payload);
  payload += crc16;

  return payload;
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

export function generateTransactionId(userName: string, subscriptionId: string): string {
  const timestamp = Date.now().toString().slice(-10);
  const namePart = userName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5);
  const idPart = subscriptionId.slice(-5).toUpperCase();
  return `SPOT${namePart}${idPart}${timestamp}`.slice(0, 25);
}