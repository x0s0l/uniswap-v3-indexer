
# Envio Uniswap V3 Indexer



## Queries for pool listing

Envio

```graphql
query PoolQuery {
  Pool {
    id
    token0 {
      id
      name
      decimals
    }
    token1 {
      id
      name
      decimals
    }
    createdAtBlockNumber
  }
}
```

Subgraph

```graphql
{
  pools {
    token0 {
      id
      name
      decimals
    }
    id
    token1 {
      id
      name
      decimals
    }
    createdAtBlockNumber
  }
}
```