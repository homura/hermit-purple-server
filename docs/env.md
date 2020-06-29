# Environment Variables(Outdated)

## MUTA_ENDPOINT:

- type: String
- default: http://127.0.0.1:8000/graphql
- description: The Muta framework GraphQL RPC endpoint

## MUTA_CHAINID:

- type: String
- default: 0xb6a4d7da21443f5e816e8700eea87610e6d769657d6b8ec73028457bf2ca4036
- description: The Muta ChainID

## HERMIT_PORT:

- type: Number
- default: 4040
- description: The GraphQL API cache server listening port.

## HERMIT_DATABASE_URL

- type: String
- description: The database connection URI

## HERMIT_MAX_SKIP_SIZE

- type: Number
- default: 10000
- description: The maximum skip size of page turning during list query

## HERMIT_FETCH_CONCURRENCY:

- type: Number
- default: 50
- description: The concurrency when sync block data from a Muta instance

## HERMIT_MAX_COMPLEXITY:

- type: Number
- default: 100
- description: A large query would be baned when complexity over this value

## HERMIT_CORS_ORIGIN:

- type: String
- default:
- description: set `*` to enable all [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## HERMIT_BYPASS_CHAIN

- type: String
- default: chain
- description: Path to forward requests to Muta
