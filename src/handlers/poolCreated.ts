import {
  UniswapV3Factory,
  Bundle,
  Token,
  Pool,
} from "generated";
import { ZERO_BD, ZERO_BI, ONE_BI, ADDRESS_ZERO } from "./utils/constants";
import { CHAIN_CONFIGS } from "./utils/chains";
import { getTokenMetadata } from "./utils/tokenMetadata";

UniswapV3Factory.PoolCreated.contractRegister(({ event, context }) => {
  context.addUniswapV3Pool(event.params.pool);
});
// }, { preRegisterDynamicContracts: true });

UniswapV3Factory.PoolCreated.handler(async ({ event, context }) => {
  const {
    factoryAddress,
    whitelistTokens,
    poolsToSkip,
  } = CHAIN_CONFIGS[event.chainId];
  let tokens: [Token, Token];

  // temp fix
  if (poolsToSkip.includes(event.params.pool)) {
    return;
  }

  const temp = await context.Factory.get(factoryAddress);
  let factory;

  if (temp) {
    factory = {...temp};
  } else {
    factory = {
      id: factoryAddress,
      poolCount: ZERO_BI,
      totalVolumeETH: ZERO_BD,
      totalVolumeUSD: ZERO_BD,
      untrackedVolumeUSD: ZERO_BD,
      totalFeesUSD: ZERO_BD,
      totalFeesETH: ZERO_BD,
      totalValueLockedETH: ZERO_BD,
      totalValueLockedUSD: ZERO_BD,
      totalValueLockedUSDUntracked: ZERO_BD,
      totalValueLockedETHUntracked: ZERO_BD,
      txCount: ZERO_BI,
      owner: ADDRESS_ZERO
    };

    // create new bundle for tracking eth price
    const bundle: Bundle = {
      id: '1',
      ethPriceUSD: ZERO_BD
    };

    context.Bundle.set(bundle);

    // Do we need this?
    // populateEmptyPools(event, poolMappings, whitelistTokens, tokenOverrides)
  }

  factory.poolCount = factory.poolCount + ONE_BI;

  try {
    tokens = await Promise.all([
      context.Token.get(event.params.token0),
      context.Token.get(event.params.token1)
    ]) as [Token, Token];

    const arr = [];

    if (!tokens[0]) {
      arr.push(
        getToken(event.params.token0, event.chainId)
        .then(token => tokens[0] = token)
      );
    }

    if (!tokens[1]) {
      arr.push(
        getToken(event.params.token1, event.chainId)
        .then(token => tokens[1] = token)
      );
    }

    if (arr.length) {
      await Promise.all(arr);
    }
  } catch (err) {
    console.log('Error loading tokens');
    return;
  }

  const pool: Pool = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    createdAtTimestamp: BigInt(event.block.timestamp),
    createdAtBlockNumber: BigInt(event.block.number),
    token0_id: tokens[0].id,
    token1_id: tokens[1].id,
    feeTier: event.params.fee,
    liquidity: ZERO_BI,
    sqrtPrice: ZERO_BI,
    token0Price: ZERO_BD,
    token1Price: ZERO_BD,
    tick: BigInt(event.params.tickSpacing),
    observationIndex: ZERO_BI,
    volumeToken0: ZERO_BD,
    volumeToken1: ZERO_BD,
    volumeUSD: ZERO_BD,
    untrackedVolumeUSD: ZERO_BD,
    feesUSD: ZERO_BD,
    txCount: ZERO_BI,
    collectedFeesToken0: ZERO_BD,
    collectedFeesToken1: ZERO_BD,
    collectedFeesUSD: ZERO_BD,
    totalValueLockedToken0: ZERO_BD,
    totalValueLockedToken1: ZERO_BD,
    totalValueLockedETH: ZERO_BD,
    totalValueLockedUSD: ZERO_BD,
    totalValueLockedUSDUntracked: ZERO_BD,
    liquidityProviderCount: ZERO_BI
  };

  // update white listed pools
  if (whitelistTokens.includes(tokens[0].id)) {
    tokens[1].whitelistPools.push(pool.id);
  }
  if (whitelistTokens.includes(tokens[1].id)) {
    tokens[0].whitelistPools.push(pool.id);
  }

  // What's this?
  // PoolTemplate.create(event.params.pool);

  context.Pool.set(pool);
  context.Token.set(tokens[0]);
  context.Token.set(tokens[1]);
  context.Factory.set(factory);
});


async function getToken(id: string, chainId: number): Promise<Token> {
  const tokenMetadata = await getTokenMetadata(id, chainId);
  
  return {
    id,
    symbol: tokenMetadata.symbol,
    name: tokenMetadata.name,
    decimals: BigInt(tokenMetadata.decimals),
    totalSupply: 0n,
    volume: ZERO_BD,
    volumeUSD: ZERO_BD,
    untrackedVolumeUSD: ZERO_BD,
    feesUSD: ZERO_BD,
    txCount: ZERO_BI,
    poolCount: ZERO_BI,
    totalValueLocked: ZERO_BD,
    totalValueLockedUSD: ZERO_BD,
    totalValueLockedUSDUntracked: ZERO_BD,
    derivedETH: ZERO_BD,
    whitelistPools: []
  };
}
