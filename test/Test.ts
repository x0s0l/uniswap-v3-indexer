import assert from "assert";
import { ZERO_BD, ZERO_BI, ADDRESS_ZERO } from "../src/handlers/utils/constants";
import { CHAIN_CONFIGS } from "../src/handlers/utils/chains";
import { TestHelpers, Factory, Pool } from "generated";

const { MockDb, UniswapV3Factory, UniswapV3Pool } = TestHelpers;
const chainId = 42161;
const chainConfig = CHAIN_CONFIGS[chainId];
const poolId = '0xd9b59bbdbcc70ba07da0a8f061d4a662781e67d0'.toLowerCase();
const token0 = '0x14d88a24b32d4f2243fc3f1e3094ad0e4819de5a'.toLowerCase();
const token1 = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'.toLowerCase();
const tickSpacing = 200n;
const fee = 10000n;
const timestamp = 1722420503;
const number = 317209663;

it('Testing', async () => {
    const mockDb = MockDb.createMockDb();
    const sqrtPriceX96 = 449160622870717593378474n;
    const tick = BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc502a');
    const event = UniswapV3Factory.PoolCreated.createMockEvent({
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
    const event2 = UniswapV3Pool.Initialize.createMockEvent({
        sqrtPriceX96,
        tick,
        mockEventData: {
            srcAddress: poolId,
            chainId,
            block: { timestamp, number }
        }
    });

    const mockDbUpdated = await UniswapV3Factory.PoolCreated.processEvent({event, mockDb});
    const mockDb2 = await UniswapV3Pool.Initialize.processEvent({event: event2, mockDb: mockDbUpdated});

});




// it('UniswapV3Factory Pool created event tests', async () => {
//     const mockDb = MockDb.createMockDb();
//     const sqrtPriceX96 = 449160622870717593378474n;
//     const tick = BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc502a');
//     const event = UniswapV3Factory.PoolCreated.createMockEvent({
//         token0,
//         token1,
//         fee,
//         tickSpacing,
//         pool: poolId,
//         mockEventData: {
//             chainId,
//             block: { timestamp, number }
//         }
//     });
//     const event2 = UniswapV3Pool.Initialize.createMockEvent({
//         sqrtPriceX96,
//         tick,
//         mockEventData: {
//             srcAddress: poolId,
//             chainId,
//             block: { timestamp, number }
//         }
//     });

//     const expectedPool = {
//         id: `${chainId}-${poolId}`,
//         createdAtTimestamp: BigInt(event.block.timestamp),
//         createdAtBlockNumber: BigInt(event.block.number),
//         token0_id: `${chainId}-${token0}`,
//         token1_id: `${chainId}-${token1}`,
//         feeTier: fee,
//         liquidity: ZERO_BI,
//         sqrtPrice: ZERO_BI,
//         token0Price: ZERO_BD,
//         token1Price: ZERO_BD,
//         tick: tickSpacing,
//         observationIndex: ZERO_BI,
//         volumeToken0: ZERO_BD,
//         volumeToken1: ZERO_BD,
//         volumeUSD: ZERO_BD,
//         untrackedVolumeUSD: ZERO_BD,
//         feesUSD: ZERO_BD,
//         txCount: ZERO_BI,
//         collectedFeesToken0: ZERO_BD,
//         collectedFeesToken1: ZERO_BD,
//         collectedFeesUSD: ZERO_BD,
//         totalValueLockedToken0: ZERO_BD,
//         totalValueLockedToken1: ZERO_BD,
//         totalValueLockedETH: ZERO_BD,
//         totalValueLockedUSD: ZERO_BD,
//         totalValueLockedUSDUntracked: ZERO_BD,
//         liquidityProviderCount: ZERO_BI
//     };

//     const expectedBundle = {
//         id: chainId.toString(),
//         ethPriceUSD: ZERO_BD
//     };

//     const expectedToken0 = {
//         id: `${chainId}-${token0}`,
//         symbol: 'TEST5',
//         name: 'REDACTED',
//         decimals: 18n,
//         volume: ZERO_BD,
//         volumeUSD: ZERO_BD,
//         untrackedVolumeUSD: ZERO_BD,
//         feesUSD: ZERO_BD,
//         txCount: ZERO_BI,
//         poolCount: ZERO_BI,
//         totalValueLocked: ZERO_BD,
//         totalValueLockedUSD: ZERO_BD,
//         totalValueLockedUSDUntracked: ZERO_BD,
//         derivedETH: ZERO_BD,
//         whitelistPools: [expectedPool.id]
//     };

//     const expectedToken1 = {
//         id: `${chainId}-${token1}`,
//         symbol: 'WETH',
//         name: 'Wrapped Ether',
//         decimals: 18n,
//         volume: ZERO_BD,
//         volumeUSD: ZERO_BD,
//         untrackedVolumeUSD: ZERO_BD,
//         feesUSD: ZERO_BD,
//         txCount: ZERO_BI,
//         poolCount: ZERO_BI,
//         totalValueLocked: ZERO_BD,
//         totalValueLockedUSD: ZERO_BD,
//         totalValueLockedUSDUntracked: ZERO_BD,
//         derivedETH: ZERO_BD,
//         whitelistPools: []
//     };

//     const expectedFactory: Factory = {
//         id: chainConfig.factoryAddress,
//         poolCount: 1n,
//         totalVolumeETH: ZERO_BD,
//         totalVolumeUSD: ZERO_BD,
//         untrackedVolumeUSD: ZERO_BD,
//         totalFeesUSD: ZERO_BD,
//         totalFeesETH: ZERO_BD,
//         totalValueLockedETH: ZERO_BD,
//         totalValueLockedUSD: ZERO_BD,
//         totalValueLockedUSDUntracked: ZERO_BD,
//         totalValueLockedETHUntracked: ZERO_BD,
//         txCount: ZERO_BI,
//         owner: ADDRESS_ZERO
//     };

//     const mockDbUpdated = await UniswapV3Factory.PoolCreated.processEvent({event, mockDb});
//     const mockDb2 = await UniswapV3Pool.Initialize.processEvent({event: event2, mockDb: mockDbUpdated});
//     const pool = mockDbUpdated.entities.Pool.get(`${chainId}-${poolId}`);
//     const bundle = mockDbUpdated.entities.Bundle.get(chainId.toString());
//     const actualToken0 = mockDbUpdated.entities.Token.get(`${chainId}-${token0}`);
//     const actualToken1 = mockDbUpdated.entities.Token.get(`${chainId}-${token1}`);
//     const actualFactory = mockDbUpdated.entities.Factory.get(chainConfig.factoryAddress);

//     assert.deepEqual(expectedPool, pool);
//     assert.deepEqual(expectedBundle, bundle);
//     assert.deepEqual(expectedToken0, actualToken0);
//     assert.deepEqual(expectedToken1, actualToken1);
//     assert.deepEqual(expectedFactory, actualFactory);
// });


// it('Initialize pool tests', async () => {
//     const mockDb0 = MockDb.createMockDb();
//     const sqrtPriceX96 = 449160622870717593378474n;
//     const tick = BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc502a');
//     const event1 = UniswapV3Factory.PoolCreated.createMockEvent({
//         token0,
//         token1,
//         fee,
//         tickSpacing,
//         pool: poolId,
//         mockEventData: {
//             chainId,
//             block: { timestamp, number }
//         }
//     });
//     const event2 = UniswapV3Pool.Initialize.createMockEvent({
//         sqrtPriceX96,
//         tick,
//         mockEventData: {
//             srcAddress: poolId,
//             chainId,
//             block: { timestamp, number }
//         }
//     });

//     const mockDb1 = await UniswapV3Factory.PoolCreated.processEvent({event: event1, mockDb: mockDb0});
//     const mockDb2 = await UniswapV3Pool.Initialize.processEvent({event: event2, mockDb: mockDb1});

//     const expectedPool: Pool = {
//         id: `${chainId}-${poolId}`,
//         createdAtTimestamp: BigInt(timestamp),
//         createdAtBlockNumber: BigInt(number),
//         token0_id: `${chainId}-${token0}`,
//         token1_id: `${chainId}-${token1}`,
//         feeTier: fee,
//         liquidity: ZERO_BI,
//         sqrtPrice: sqrtPriceX96,
//         token0Price: ZERO_BD,
//         token1Price: ZERO_BD,
//         tick,
//         observationIndex: ZERO_BI,
//         volumeToken0: ZERO_BD,
//         volumeToken1: ZERO_BD,
//         volumeUSD: ZERO_BD,
//         untrackedVolumeUSD: ZERO_BD,
//         feesUSD: ZERO_BD,
//         txCount: ZERO_BI,
//         collectedFeesToken0: ZERO_BD,
//         collectedFeesToken1: ZERO_BD,
//         collectedFeesUSD: ZERO_BD,
//         totalValueLockedToken0: ZERO_BD,
//         totalValueLockedToken1: ZERO_BD,
//         totalValueLockedETH: ZERO_BD,
//         totalValueLockedUSD: ZERO_BD,
//         totalValueLockedUSDUntracked: ZERO_BD,
//         liquidityProviderCount: ZERO_BI
//     };

//     const actualPool = mockDb2.entities.Pool.get(`${chainId}-${poolId}`);
//     // assert.deepEqual(expectedPool, actualPool);
//     console.log(expectedPool)
//     console.log(actualPool)
// });


