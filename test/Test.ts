import assert from "assert";
import { ZERO_BD, ZERO_BI } from "../src/handlers/utils/constants";
import { CHAIN_CONFIGS } from "../src/handlers/utils/chains";
import { TestHelpers, Pool, BigDecimal, Token } from "generated";
import { getRefBundle, getRefFactory, getrefPool, getRefToken0, getRefToken1 } from "./refObjects";

const { MockDb, UniswapV3Factory, UniswapV3Pool } = TestHelpers;
const chainId = 42161;
const chainConfigs = CHAIN_CONFIGS[chainId];
const poolId = '0xd9b59bbdbcc70ba07da0a8f061d4a662781e67d0'.toLowerCase();
const token0 = '0x14d88a24b32d4f2243fc3f1e3094ad0e4819de5a'.toLowerCase();
const token1 = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'.toLowerCase();
const tickSpacing = 200n;
const fee = 10000n;
const timestamp = 1722420503;
const number = 317209663;
const tick = BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc502a');
const sqrtPriceX96 = 449160622870717593378474n;

const PoolCreatedEvent = UniswapV3Factory.PoolCreated.createMockEvent({
    token0,
    token1,
    fee,
    tickSpacing,
    pool: poolId,
    mockEventData: {
        chainId,
        block: { timestamp, number }
    }
});

const initializedEvent = UniswapV3Pool.Initialize.createMockEvent({
    sqrtPriceX96,
    tick,
    mockEventData: {
        srcAddress: poolId,
        chainId,
        block: { timestamp, number }
    }
});


it('UniswapV3Factory Pool created event tests', async () => {
    const PoolCreatedEvent = UniswapV3Factory.PoolCreated.createMockEvent({
        token0,
        token1,
        fee,
        tickSpacing,
        pool: poolId,
        mockEventData: {
            chainId,
            block: { timestamp, number }
        }
    });

    const expectedPool = getrefPool();
    expectedPool.createdAtTimestamp = BigInt(PoolCreatedEvent.block.timestamp);
    expectedPool.createdAtBlockNumber = BigInt(PoolCreatedEvent.block.number);
    expectedPool.feeTier = fee;
    expectedPool.tick = tickSpacing;

    const expectedBundle = getRefBundle();
    const expectedToken0 = getRefToken0();
    expectedToken0.whitelistPools = [expectedPool.id];

    const expectedToken1 = getRefToken1();
    const expectedFactory = getRefFactory();
    expectedFactory.poolCount = 1n;

    const mockDb = MockDb.createMockDb();
    const mockDbUpdated = await UniswapV3Factory.PoolCreated.processEvent({ event: PoolCreatedEvent, mockDb });
    const pool = mockDbUpdated.entities.Pool.get(`${chainId}-${poolId}`);
    const bundle = mockDbUpdated.entities.Bundle.get(chainId.toString());
    const actualToken0 = mockDbUpdated.entities.Token.get(`${chainId}-${token0}`);
    const actualToken1 = mockDbUpdated.entities.Token.get(`${chainId}-${token1}`);
    const actualFactory = mockDbUpdated.entities.Factory.get(`${chainId}-${chainConfigs.factoryAddress.toLowerCase()}`);

    assert.deepEqual(expectedPool, pool);
    assert.deepEqual(expectedBundle, bundle);
    assert.deepEqual(expectedToken0, actualToken0);
    assert.deepEqual(expectedToken1, actualToken1);
    assert.deepEqual(expectedFactory, actualFactory);
});


it('Initialize pool tests', async () => {
    const mockDb = MockDb.createMockDb();
    const mockDb1 = await UniswapV3Factory.PoolCreated.processEvent({ event: PoolCreatedEvent, mockDb: mockDb });
    const mockDb2 = await UniswapV3Pool.Initialize.processEvent({ event: initializedEvent, mockDb: mockDb1 });

    const expectedPool: Pool = {
        id: `${chainId}-${poolId}`,
        createdAtTimestamp: BigInt(timestamp),
        createdAtBlockNumber: BigInt(number),
        token0_id: `${chainId}-${token0}`,
        token1_id: `${chainId}-${token1}`,
        feeTier: fee,
        liquidity: ZERO_BI,
        sqrtPrice: sqrtPriceX96,
        token0Price: ZERO_BD,
        token1Price: ZERO_BD,
        tick,
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

    const expectedBundle = {
        id: chainId.toString(),
        ethPriceUSD: ZERO_BD
    };

    const expectedToken0 = {
        id: `${chainId}-${token0}`,
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
        whitelistPools: [expectedPool.id]
    };

    const expectedToken1 = {
        id: `${chainId}-${token1}`,
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
        derivedETH: new BigDecimal('1'),
        whitelistPools: []
    };

    const actualPool = mockDb2.entities.Pool.get(`${chainId}-${poolId}`);
    const actualBundle = mockDb2.entities.Bundle.get(chainId.toString());
    const actualToken0 = mockDb2.entities.Token.get(`${chainId}-${token0}`);
    const actualToken1 = mockDb2.entities.Token.get(`${chainId}-${token1}`);

    assert.deepEqual(expectedPool, actualPool);
    assert.deepEqual(expectedBundle, actualBundle);
    assert.deepEqual(expectedToken0, actualToken0);
    assert.deepEqual(expectedToken1, actualToken1);
});

//
// it('Mint tests', async () => {
//     const sender = '0xc36442b4a4522e871399cd717abdd847ab11fe88';
//     const owner = '0xc36442b4a4522e871399cd717abdd847ab11fe88';
//     const { factoryAddress } = CHAIN_CONFIGS[chainId];
//     const mintEvent = UniswapV3Pool.Mint.createMockEvent({
//         sender,
//         owner,
//         tickLower: 10n,
//         tickUpper: 20n,
//         amount: 194694371634706n,
//         amount0: 0n,
//         amount1: 1000000n,
//         mockEventData: {
//             srcAddress: poolId,
//             chainId,
//             block: { timestamp, number }
//         }
//     });
//
//     const poolStart = structuredClone(refPool);
//     const factoryStart = structuredClone(refFactory);
//     const token0Start = structuredClone(refToken0);
//     const token1Start = structuredClone(refToken1);
//
//     let mockDb = MockDb.createMockDb();
//     mockDb = mockDb.entities.Pool.set(poolStart);
//     mockDb = mockDb.entities.Factory.set(factoryStart);
//     mockDb = mockDb.entities.Token.set(token0Start);
//     mockDb = mockDb.entities.Token.set(token1Start);
//     mockDb = await UniswapV3Pool.Mint.processEvent({ event: mintEvent, mockDb });
//
//     const expectedPool = structuredClone(refPool);
//     expectedPool.txCount += 1n;
//
//     const expectedFactory = structuredClone(refFactory);
//     expectedFactory.txCount += 1n;
//
//     const actualPool = mockDb.entities.Pool.get(`${chainId}-${poolId}`);
//     const actualFactory = mockDb.entities.Factory.get(`${chainId}-${factoryAddress}`);
//     assert.deepEqual(actualPool, expectedPool);
// });


// it('Collect tests', async () => {
//     const poolStart = getrefPool();
//     const bundleStart = getRefBundle();
//     const factoryStart = getRefFactory();
//     const token0Start = getRefToken0();
//     const token1Start = getRefToken1();

//     poolStart.totalValueLockedETH = new BigDecimal('1000');
//     factoryStart.totalValueLockedETH = new BigDecimal('5000');

//     let mockDb = MockDb.createMockDb().entities.Pool.set(poolStart);
//     mockDb = mockDb.entities.Bundle.set(bundleStart);
//     mockDb = mockDb.entities.Factory.set(factoryStart);
//     mockDb = mockDb.entities.Token.set(token0Start);
//     mockDb = mockDb.entities.Token.set(token1Start);

//     const owner = '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45';
//     const recipient = '0xbeba4adea76979849e4615e91ac72600ffd6a695';
//     const collectEvent = UniswapV3Pool.Collect.createMockEvent({
//         owner,
//         recipient,
//         tickLower: 10n,
//         tickUpper: 20n,
//         amount0: 0n,
//         amount1: 1000000n,
//         mockEventData: {
//             srcAddress: poolId,
//             chainId,
//             block: { timestamp, number },
//             transaction: {
//                 gasPrice: 10000000n,
//                 hash: "0xbc1bf3fe35e9816edc861dcf880b870d072fe9111da1074cbd70fbec383bf6f5"
//             }
//         }
//     });
//     mockDb = await UniswapV3Pool.Collect.processEvent({ event: collectEvent, mockDb });

//     const expectedFactory = getRefFactory();
//     expectedFactory.totalValueLockedETH = expectedFactory.totalValueLockedETH.minus(
//         poolStart.totalValueLockedETH
//     );

//     const expectedToken0 = getRefToken0();
//     expectedToken0.txCount = expectedToken0.txCount + 1n;

//     const actualFactory = mockDb.entities.Factory.get(`${chainId}-${chainConfigs.factoryAddress}`);
//     const actualToken0 = mockDb.entities.Factory.get(`${chainId}-${token0.toLowerCase()}`);
//     // assert.deepEqual(actualFactory, expectedFactory);
//     assert.deepEqual(actualToken0, expectedToken0);
// });


it('Burn tests', async () => {

});


it('Swap tests', async () => {

});

