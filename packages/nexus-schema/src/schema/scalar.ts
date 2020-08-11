import { scalarType } from '@nexus/schema';

function id(x: any) {
  return x;
}

function stringScalar<T extends string>(name: T, description?: string) {
  return scalarType({
    name,
    description,
    serialize: id,
  });
}

export const AddressScalar = stringScalar(
  'Address',
  'The `Address` of an account, encoded to 40 length lowercase hex string',
);

export const Uint64Scalar = stringScalar(
  'Uint64',
  'Uint64，encoded to a hex string ',
);

export const HashScalar = stringScalar(
  'Hash',
  'A 64 length lowercase hex string, the output digest of [keccak](https://en.wikipedia.org/wiki/SHA-3) hash function',
);

export const BytesScalar = stringScalar(
  'Bytes',
  'Bytes corresponding hex string',
);

function toHex(v: unknown): string {
  if (typeof v === 'string') {
    return v.startsWith('0x') ? v : '0x' + v;
  } else if (typeof v === 'number' || typeof v === 'bigint') {
    return '0x' + v.toString(16);
  } else if (v == null) {
    return '0x00';
  }

  throw new Error(v + ' is not a timestamp');
}

export const TimestampScalar = scalarType({
  name: 'Timestamp',
  description: 'Millisecond timestamp',
  serialize(v) {
    const timestamp = Number(toHex(v));
    // If it is a timestamp in seconds,
    // it is converted into milliseconds
    if (timestamp < 10000000000) return timestamp * 1000;
    return timestamp;
  },
});
