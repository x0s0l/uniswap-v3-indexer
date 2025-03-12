// import { ethereum } from '@graphprotocol/graph-ts';
import { ONE_BI, ZERO_BD, ZERO_BI } from './constants';
import {
  Bundle,
  Factory,
  handlerContext,
  Pool,
  PoolDayData,
  PoolHourData,
  Token,
  TokenDayData,
  TokenHourData,
  UniswapDayData,
} from 'generated';

/**
 * Tracks global aggregate data over daily windows
 * @param event
 */
// export function updateUniswapDayData(event: ethereum.Event, factoryAddress: string): UniswapDayData {
//   const uniswap = Factory.load(factoryAddress)!
//   const timestamp = event.block.timestamp.toI32()
//   const dayID = timestamp / 86400 // rounded
//   const dayStartTimestamp = dayID * 86400
//   let uniswapDayData = UniswapDayData.load(dayID.toString())
//   if (uniswapDayData === null) {
//     uniswapDayData = new UniswapDayData(dayID.toString())
//     uniswapDayData.date = dayStartTimestamp
//     uniswapDayData.volumeETH = ZERO_BD
//     uniswapDayData.volumeUSD = ZERO_BD
//     uniswapDayData.volumeUSDUntracked = ZERO_BD
//     uniswapDayData.feesUSD = ZERO_BD
//   }
//   uniswapDayData.tvlUSD = uniswap.totalValueLockedUSD
//   uniswapDayData.txCount = uniswap.txCount
//   uniswapDayData.save()
//   return uniswapDayData as UniswapDayData
// }

export async function updatePoolDayData(
  poolId: string, 
  timestamp: number, 
  context: handlerContext
): Promise<PoolDayData | null> {
  const dayID = Math.floor(timestamp / 86400);
  const dayStartTimestamp = dayID * 86400;
  const dayPoolID = `${poolId}-${dayID}`;
  const pool = (await context.Pool.get(poolId));
  if (!pool) return null;

  let temp = await context.PoolDayData.get(dayPoolID);

  if (!temp) {
    temp = {
      id: dayPoolID,
      date: dayStartTimestamp,
      pool_id: pool.id,
      // things that dont get initialized always
      volumeToken0: ZERO_BD,
      volumeToken1: ZERO_BD,
      volumeUSD: ZERO_BD,
      feesUSD: ZERO_BD,
      txCount: ZERO_BI,
      openingPrice: pool.token0Price,
      high: pool.token0Price,
      low: pool.token0Price,
      close: pool.token0Price,

      liquidity: pool.liquidity,
      sqrtPrice: pool.sqrtPrice,
      token0Price: pool.token0Price,
      token1Price: pool.token1Price,
      tick: pool.tick,
      tvlUSD: pool.totalValueLockedUSD,
    };
  }

  const poolDayData = {...temp};

  if (pool.token0Price.gt(poolDayData.high)) {
    poolDayData.high = pool.token0Price;
  }
  
  if (pool.token0Price.lt(poolDayData.low)) {
    poolDayData.low = pool.token0Price;
  }

  poolDayData.liquidity = pool.liquidity;
  poolDayData.sqrtPrice = pool.sqrtPrice;
  poolDayData.token0Price = pool.token0Price;
  poolDayData.token1Price = pool.token1Price;
  poolDayData.close = pool.token0Price;
  poolDayData.tick = pool.tick;
  poolDayData.tvlUSD = pool.totalValueLockedUSD;
  poolDayData.txCount = poolDayData.txCount + ONE_BI;
  
  context.PoolDayData.set(poolDayData);
  return poolDayData as PoolDayData
}

export async function updatePoolHourData(
  poolId: string, 
  timestamp: number, 
  context: handlerContext
): Promise<PoolHourData | null> {
  const hourIndex = Math.floor(timestamp / 3600); // get unique hour within unix history
  const hourStartUnix = hourIndex * 3600; // want the rounded effect
  const hourPoolID = `${poolId}-${hourIndex}`;
  const pool = (await context.Pool.get(poolId));
  if (!pool) return null;

  let temp = await context.PoolHourData.get(hourPoolID);

  if (!temp) {
    temp = {
      id: hourPoolID,
      periodStartUnix: hourStartUnix,
      pool_id: pool.id,
      // things that dont get initialized always
      volumeToken0: ZERO_BD,
      volumeToken1: ZERO_BD,
      volumeUSD: ZERO_BD,
      txCount: ZERO_BI,
      feesUSD: ZERO_BD,
      openingPrice: pool.token0Price,
      high: pool.token0Price,
      low: pool.token0Price,
      close: pool.token0Price,

      liquidity: ZERO_BI,
      sqrtPrice: ZERO_BI,
      token0Price: ZERO_BD,
      token1Price: ZERO_BD,
      tick: undefined,
      tvlUSD: ZERO_BD,
    };
  }
  
  const poolHourData = {...temp};

  if (pool.token0Price.gt(poolHourData.high)) {
    poolHourData.high = pool.token0Price;
  }

  if (pool.token0Price.lt(poolHourData.low)) {
    poolHourData.low = pool.token0Price;
  }

  poolHourData.liquidity = pool.liquidity;
  poolHourData.sqrtPrice = pool.sqrtPrice;
  poolHourData.token0Price = pool.token0Price;
  poolHourData.token1Price = pool.token1Price;
  poolHourData.close = pool.token0Price;
  poolHourData.tick = pool.tick;
  poolHourData.tvlUSD = pool.totalValueLockedUSD;
  poolHourData.txCount = poolHourData.txCount + ONE_BI;

  context.PoolHourData.set(poolHourData);
  // test
  return poolHourData as PoolHourData
}

// export function updateTokenDayData(token: Token, event: ethereum.Event): TokenDayData {
//   const bundle = Bundle.load('1')!
//   const timestamp = event.block.timestamp.toI32()
//   const dayID = timestamp / 86400
//   const dayStartTimestamp = dayID * 86400
//   const tokenDayID = token.id.toString().concat('-').concat(dayID.toString())
//   const tokenPrice = token.derivedETH.times(bundle.ethPriceUSD)

//   let tokenDayData = TokenDayData.load(tokenDayID)
//   if (tokenDayData === null) {
//     tokenDayData = new TokenDayData(tokenDayID)
//     tokenDayData.date = dayStartTimestamp
//     tokenDayData.token = token.id
//     tokenDayData.volume = ZERO_BD
//     tokenDayData.volumeUSD = ZERO_BD
//     tokenDayData.feesUSD = ZERO_BD
//     tokenDayData.untrackedVolumeUSD = ZERO_BD
//     tokenDayData.open = tokenPrice
//     tokenDayData.high = tokenPrice
//     tokenDayData.low = tokenPrice
//     tokenDayData.close = tokenPrice
//   }

//   if (tokenPrice.gt(tokenDayData.high)) {
//     tokenDayData.high = tokenPrice
//   }

//   if (tokenPrice.lt(tokenDayData.low)) {
//     tokenDayData.low = tokenPrice
//   }

//   tokenDayData.close = tokenPrice
//   tokenDayData.priceUSD = token.derivedETH.times(bundle.ethPriceUSD)
//   tokenDayData.totalValueLocked = token.totalValueLocked
//   tokenDayData.totalValueLockedUSD = token.totalValueLockedUSD
//   tokenDayData.save()

//   return tokenDayData as TokenDayData
// }

// export function updateTokenHourData(token: Token, event: ethereum.Event): TokenHourData {
//   const bundle = Bundle.load('1')!
//   const timestamp = event.block.timestamp.toI32()
//   const hourIndex = timestamp / 3600 // get unique hour within unix history
//   const hourStartUnix = hourIndex * 3600 // want the rounded effect
//   const tokenHourID = token.id.toString().concat('-').concat(hourIndex.toString())
//   let tokenHourData = TokenHourData.load(tokenHourID)
//   const tokenPrice = token.derivedETH.times(bundle.ethPriceUSD)

//   if (tokenHourData === null) {
//     tokenHourData = new TokenHourData(tokenHourID)
//     tokenHourData.periodStartUnix = hourStartUnix
//     tokenHourData.token = token.id
//     tokenHourData.volume = ZERO_BD
//     tokenHourData.volumeUSD = ZERO_BD
//     tokenHourData.untrackedVolumeUSD = ZERO_BD
//     tokenHourData.feesUSD = ZERO_BD
//     tokenHourData.open = tokenPrice
//     tokenHourData.high = tokenPrice
//     tokenHourData.low = tokenPrice
//     tokenHourData.close = tokenPrice
//   }

//   if (tokenPrice.gt(tokenHourData.high)) {
//     tokenHourData.high = tokenPrice
//   }

//   if (tokenPrice.lt(tokenHourData.low)) {
//     tokenHourData.low = tokenPrice
//   }

//   tokenHourData.close = tokenPrice
//   tokenHourData.priceUSD = tokenPrice
//   tokenHourData.totalValueLocked = token.totalValueLocked
//   tokenHourData.totalValueLockedUSD = token.totalValueLockedUSD
//   tokenHourData.save()

//   return tokenHourData as TokenHourData
// }
