import { ZERO_BD, ZERO_BI, ADDRESS_ZERO } from "../src/handlers/utils/constants";
import { CHAIN_CONFIGS } from "../src/handlers/utils/chains";

const chainId = 42161;
const chainConfigs = CHAIN_CONFIGS[chainId];
const poolId = '0xd9b59bbdbcc70ba07da0a8f061d4a662781e67d0'.toLowerCase();
const token0 = '0x14d88a24b32d4f2243fc3f1e3094ad0e4819de5a'.toLowerCase();
const token1 = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'.toLowerCase();

export const getRefBundle = () => ({
    id: chainId.toString(),
    ethPriceUSD: ZERO_BD
});

export const getrefPool = () => ({
    id: `${chainId}-${poolId}`,
    createdAtTimestamp: 0n,
    createdAtBlockNumber: 0n,
    token0_id: `${chainId}-${token0.toLowerCase()}`,
    token1_id: `${chainId}-${token1.toLowerCase()}`,
    feeTier: 0n,
    liquidity: ZERO_BI,
    sqrtPrice: ZERO_BI,
    token0Price: ZERO_BD,
    token1Price: ZERO_BD,
    tick: 0n,
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
});

export const getRefFactory = () => ({
    id: `${chainId}-${chainConfigs.factoryAddress.toLowerCase()}`,
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
});

export const getRefToken0 = () => ({
    id: `${chainId}-${token0.toLowerCase()}`,
    symbol: 'TEST5',
    name: 'REDACTED',
    decimals: 18n,
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
    whitelistPools: [] as string[]
});

export const getRefToken1 = () => ({
    id: `${chainId}-${token1.toLowerCase()}`,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18n,
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
    whitelistPools: [] as string[]
});
