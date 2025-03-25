// import { Mint } from '../src/types/templates/Pool/Pool'
import assert from "assert";
import { convertTokenToDecimal, fastExponentiation, safeDiv } from '../src/handlers/utils'
import { ZERO_BD, ZERO_BI, ONE_BD, ADDRESS_ZERO } from '../src/handlers/utils/constants';
import { TestHelpers, Pool, Bundle, BigDecimal, Token, Factory } from "generated";
import {
    invokePoolCreatedWithMockedEthCalls,
    TEST_CONFIG,
    TEST_ETH_PRICE_USD,
    TEST_USDC_DERIVED_ETH,
    TEST_WETH_DERIVED_ETH,
    USDC_MAINNET_FIXTURE,
    USDC_WETH_03_MAINNET_POOL,
    WETH_MAINNET_FIXTURE,
    chainId,
    timestamp,
    blockNumber
} from './constants';

const { MockDb, UniswapV3Pool } = TestHelpers;

interface MintFixture {
    sender: string
    owner: string
    tickLower: bigint
    tickUpper: bigint
    amount: bigint
    amount0: bigint
    amount1: bigint
};

// https://etherscan.io/tx/0x0338617bb36e23bbd4074b068ea79edd07f7ef0db13fc0cd06ab8e57b9012764
const MINT_FIXTURE: MintFixture = {
    sender: '0xc36442b4a4522e871399cd717abdd847ab11fe88',
    owner: '0xc36442b4a4522e871399cd717abdd847ab11fe88',
    tickLower: 195600n,
    tickUpper: 196740n,
    amount: 386405747494368n,
    amount0: 1000000000n,
    amount1: 66726312884609397n,
}

const mintEvent = UniswapV3Pool.Mint.createMockEvent({
    sender: MINT_FIXTURE.sender,
    owner: MINT_FIXTURE.owner,
    tickLower: MINT_FIXTURE.tickLower,
    tickUpper: MINT_FIXTURE.tickUpper,
    amount: MINT_FIXTURE.amount,
    amount0: MINT_FIXTURE.amount0,
    amount1: MINT_FIXTURE.amount1,
    mockEventData: {
        srcAddress: USDC_WETH_03_MAINNET_POOL,
        chainId,
        block: { timestamp, number: blockNumber }
    }
});

describe('handleMint', async () => {
    let mockDb = await invokePoolCreatedWithMockedEthCalls(TEST_CONFIG, MockDb.createMockDb());

    const bundle: Bundle = {
        id: chainId.toString(),
        ethPriceUSD: TEST_ETH_PRICE_USD
    };
    
    mockDb = mockDb.entities.Bundle.set(bundle);

    const usdcEntity: Token = {
        ...mockDb.entities.Token.get(`${chainId}-${USDC_MAINNET_FIXTURE.address.toLowerCase()}`),
        derivedETH: TEST_USDC_DERIVED_ETH
    };

    mockDb = mockDb.entities.Token.set(usdcEntity);

    const wethEntity: Token = {
        ...mockDb.entities.Token.get(`${chainId}-${WETH_MAINNET_FIXTURE.address.toLowerCase()}`),
        derivedETH: TEST_WETH_DERIVED_ETH
    };

    mockDb = mockDb.entities.Token.set(wethEntity);

    it('success - mint event, pool tick is between tickUpper and tickLower', async () => {
        // // put the pools tick in range
        // const poolId = `${chainId}-${USDC_WETH_03_MAINNET_POOL.toLowerCase()}`;
        // const pool: Pool = {
        //     ...mockDb.entities.Pool.get(poolId),
        //     tick: BigInt(MINT_FIXTURE.tickLower + MINT_FIXTURE.tickUpper) / 2n
        // };
    
        // let newMockdb = mockDb.entities.Pool.set(pool);

        // newMockdb = await UniswapV3Pool.Mint.processEvent({ event: mintEvent, mockDb: newMockdb });

        // const amountToken0 = convertTokenToDecimal(MINT_FIXTURE.amount0, BigInt(USDC_MAINNET_FIXTURE.decimals));
        // const amountToken1 = convertTokenToDecimal(MINT_FIXTURE.amount1, BigInt(WETH_MAINNET_FIXTURE.decimals));
        // const poolTotalValueLockedETH = amountToken0
        //                                 .times(TEST_USDC_DERIVED_ETH)
        //                                 .plus(amountToken1.times(TEST_WETH_DERIVED_ETH));
        // const poolTotalValueLockedUSD = poolTotalValueLockedETH.times(TEST_ETH_PRICE_USD);

        // const factory: Factory = newMockdb.entities.Factory.get(
        //     `${chainId}-${TEST_CONFIG.factoryAddress.toLowerCase()}`
        // );

        // assert.deepEqual(factory.txCount, 1n);
        // assert.deepEqual(factory.totalValueLockedETH, poolTotalValueLockedETH);
        // assert.deepEqual(factory.totalValueLockedUSD, poolTotalValueLockedUSD);

        // const actualPool: Pool = newMockdb.entities.Pool.get(poolId);
        // assert.deepEqual(actualPool.txCount, 1n);
        // assert.deepEqual(actualPool.liquidity, MINT_FIXTURE.amount);
        // assert.deepEqual(actualPool.totalValueLockedToken0, amountToken0);
        // assert.deepEqual(actualPool.totalValueLockedToken1, amountToken1);
        // assert.deepEqual(actualPool.totalValueLockedETH, poolTotalValueLockedETH);
        // assert.deepEqual(actualPool.totalValueLockedUSD, poolTotalValueLockedUSD);

        // assertObjectMatches('Token', USDC_MAINNET_FIXTURE.address, [
        //     ['txCount', '1'],
        //     ['totalValueLocked', amountToken0.toString()],
        //     ['totalValueLockedUSD', amountToken0.times(TEST_USDC_DERIVED_ETH.times(TEST_ETH_PRICE_USD)).toString()],
        // ])

        // assertObjectMatches('Token', WETH_MAINNET_FIXTURE.address, [
        //     ['txCount', '1'],
        //     ['totalValueLocked', amountToken1.toString()],
        //     ['totalValueLockedUSD', amountToken1.times(TEST_WETH_DERIVED_ETH.times(TEST_ETH_PRICE_USD)).toString()],
        // ])

        // assertObjectMatches('Mint', MOCK_EVENT.transaction.hash.toHexString() + '-' + MOCK_EVENT.logIndex.toString(), [
        //     ['transaction', MOCK_EVENT.transaction.hash.toHexString()],
        //     ['timestamp', MOCK_EVENT.block.timestamp.toString()],
        //     ['pool', USDC_WETH_03_MAINNET_POOL],
        //     ['token0', USDC_MAINNET_FIXTURE.address],
        //     ['token1', WETH_MAINNET_FIXTURE.address],
        //     ['owner', MINT_FIXTURE.owner.toHexString()],
        //     ['sender', MINT_FIXTURE.sender.toHexString()],
        //     ['origin', MOCK_EVENT.transaction.from.toHexString()],
        //     ['amount', MINT_FIXTURE.amount.toString()],
        //     ['amount0', amountToken0.toString()],
        //     ['amount1', amountToken1.toString()],
        //     ['amountUSD', poolTotalValueLockedUSD.toString()],
        //     ['tickUpper', MINT_FIXTURE.tickUpper.toString()],
        //     ['tickLower', MINT_FIXTURE.tickLower.toString()],
        //     ['logIndex', MOCK_EVENT.logIndex.toString()],
        // ])

        // const lowerTickPrice = fastExponentiation(BigDecimal.fromString('1.0001'), MINT_FIXTURE.tickLower)
        // assertObjectMatches('Tick', USDC_WETH_03_MAINNET_POOL + '#' + MINT_FIXTURE.tickLower.toString(), [
        //     ['tickIdx', MINT_FIXTURE.tickLower.toString()],
        //     ['pool', USDC_WETH_03_MAINNET_POOL],
        //     ['poolAddress', USDC_WETH_03_MAINNET_POOL],
        //     ['createdAtTimestamp', MOCK_EVENT.block.timestamp.toString()],
        //     ['createdAtBlockNumber', MOCK_EVENT.block.number.toString()],
        //     ['liquidityGross', MINT_FIXTURE.amount.toString()],
        //     ['liquidityNet', MINT_FIXTURE.amount.toString()],
        //     ['price0', lowerTickPrice.toString()],
        //     ['price1', safeDiv(ONE_BD, lowerTickPrice).toString()],
        // ])

        // const upperTickPrice = fastExponentiation(BigDecimal.fromString('1.0001'), MINT_FIXTURE.tickUpper)
        // assertObjectMatches('Tick', USDC_WETH_03_MAINNET_POOL + '#' + MINT_FIXTURE.tickUpper.toString(), [
        //     ['tickIdx', MINT_FIXTURE.tickUpper.toString()],
        //     ['pool', USDC_WETH_03_MAINNET_POOL],
        //     ['poolAddress', USDC_WETH_03_MAINNET_POOL],
        //     ['createdAtTimestamp', MOCK_EVENT.block.timestamp.toString()],
        //     ['createdAtBlockNumber', MOCK_EVENT.block.number.toString()],
        //     ['liquidityGross', MINT_FIXTURE.amount.toString()],
        //     ['liquidityNet', MINT_FIXTURE.amount.neg().toString()],
        //     ['price0', upperTickPrice.toString()],
        //     ['price1', safeDiv(ONE_BD, upperTickPrice).toString()],
        // ])
    });

    // it('success - mint event, pool tick is not between tickUpper and tickLower', () => {
    //     // put the pools tick out of range
    //     const pool = Pool.load(USDC_WETH_03_MAINNET_POOL)!
    //     pool.tick = BigInt.fromI32(MINT_FIXTURE.tickLower - 1)
    //     const liquidityBeforeMint = pool.liquidity
    //     pool.save()

    //     handleMintHelper(MINT_EVENT, TEST_CONFIG)

    //     // liquidity should not be updated
    //     assertObjectMatches('Pool', USDC_WETH_03_MAINNET_POOL, [['liquidity', liquidityBeforeMint.toString()]])
    // });
});
