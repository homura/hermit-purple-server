// This module is used to clean hexadecimal data.
// It is used to ensure the uniformity of hexadecimal
// data presented in the form of strings.

import { BigNumber } from '@mutadev/shared';
import { Address, Hash, Uint64 } from '@mutadev/types';
import { rm0x } from '@mutadev/utils';
import { parse } from 'lossless-json';

export function hexWithout0x(
  x: string | BigNumber | number,
  base: number,
  padZeroToLength: number = 0,
) {
  x = typeof x === 'string' ? x.toLowerCase() : x;
  return new BigNumber(x, base)
    .toString(16)
    .padStart(padZeroToLength, '0')
    .toLowerCase();
}

export function hexU64(x: string | BigNumber | number): Uint64 {
  return hexWithout0x(x, 10, 16);
}

export function hexUint64(x: string): Uint64 {
  return rm0x(x).toLowerCase().padStart(16, '0');
}

export function hexHash(x: string): Hash {
  return rm0x(x).toLowerCase().padStart(64, '0');
}

export function hexAddress(x: string): Address {
  return rm0x(x).toLowerCase().padStart(40, '0');
}

export function hex(x: string) {
  return rm0x(x).toLowerCase();
}

export enum SourceDataType {
  /**
   * A decimal number without wrap quote, e.g. 18446744073709551615
   */
  u64 = 'u64',

  /**
   * A hex string that max length is 16 (or 18 if starts with `0x`),
   * e.g. "ffff", "0xffff"
   */
  Uint64 = 'Uint64',

  /**
   * An address hex
   */
  Address = 'Address',

  /**
   * A 64 (or 66 if starts with `0x`) length hex string,
   * e.g. "0x0000000000000000000000000000000000000000000000000000000000000000"
   */
  Hash = 'Hash',

  /**
   * A plain text, use as a serviceName or a method name, e.g. transfer
   */
  String = 'String',
}

export type HexSchema = { [key: string]: SourceDataType };

export type JSONHex<Schema extends HexSchema> = {
  [key in keyof Schema]: Schema[key] extends SourceDataType.Uint64
    ? Uint64
    : Schema[key] extends SourceDataType.u64
    ? Uint64
    : Schema[key] extends SourceDataType.Hash
    ? Hash
    : string;
};

/**
 * Given a schema, parse a string to JSON. The numbers will be parsed to hex string.
 * Results the hexadecimal are all lowercase letters and do **NOT** begin with 0x
 * @param x a JSON formatted string
 * @param properties the schema
 */
export function hexJSONParse<T extends HexSchema>(
  x: string,
  properties: T,
): JSONHex<T> {
  return parse(x, (key: keyof T, value) => {
    const valueType = properties[key];

    if (valueType === SourceDataType.Uint64) {
      return hexUint64(value);
    } else if (valueType === SourceDataType.u64) {
      return hexU64(value);
    } else if (valueType === SourceDataType.Hash) {
      return hexHash(value);
    } else if (valueType === SourceDataType.Address) {
      return hexAddress(value);
    }
    return value;
  });
}
