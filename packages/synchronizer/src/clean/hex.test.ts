import { hexAddress, hexJSONParse, hexU64, SourceDataType } from './hex';

test('parse u64', () => {
  expect(hexU64('0')).toBe('0000000000000000');
  expect(hexU64('1')).toBe('0000000000000001');
  expect(hexU64('18446744073709551615')).toBe('ffffffffffffffff');
});

test('parse address', () => {
  expect(hexAddress('0x1000000000000000000000000000000000000000')).toBe(
    '1000000000000000000000000000000000000000',
  );

  expect(hexAddress('1000000000000000000000000000000000000000')).toBe(
    '1000000000000000000000000000000000000000',
  );

  expect(hexAddress('0FfFFFFFFFFFFFFFFFFFFFFFFfFFFFFFFFfFFFFF')).toBe(
    '0fffffffffffffffffffffffffffffffffffffff',
  );

  expect(hexAddress('0fffffffffffffffffffffffffffffffffffffff')).toBe(
    '0fffffffffffffffffffffffffffffffffffffff',
  );

  expect(hexAddress('FFfFFFFFFFFFFFFFFFFFFFFFFfFFFFFFFFfFFFFF')).toBe(
    'ffffffffffffffffffffffffffffffffffffffff',
  );
});

test('test JSONhexify', () => {
  const parsed = hexJSONParse(
    `{ 
    "u64": 18446744073709551615, 
    "Hash": "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    "String": "String",
    "Uint64": "0x000000000000ffff"
  }`,
    {
      u64: SourceDataType.u64,
      Uint64: SourceDataType.Uint64,
      String: SourceDataType.String,
      Hash: SourceDataType.Hash,
    },
  );

  expect(parsed).toEqual({
    u64: 'ffffffffffffffff',
    Hash: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    String: 'String',
    Uint64: '000000000000ffff',
  });
});

test('test a real transfer payload', () => {
  const parsed = hexJSONParse(
    `{
    "asset_id": "302bcda9544a599370bf3f77a3afbd39a05ca75ee8534685460b7e36073e910f",
    "to": "0x1234567890123456789012345678901234567890",
    "value": 10
  }`,
    {
      asset_id: SourceDataType.Hash,
      to: SourceDataType.Address,
      value: SourceDataType.u64,
    },
  );

  expect(parsed).toEqual({
    asset_id:
      '302bcda9544a599370bf3f77a3afbd39a05ca75ee8534685460b7e36073e910f',
    to: '1234567890123456789012345678901234567890',
    value: '000000000000000a',
  });
});
