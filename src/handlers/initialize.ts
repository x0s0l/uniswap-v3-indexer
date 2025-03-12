import { UniswapV3Pool, Token } from "generated";
import { CHAIN_CONFIGS } from "./utils/chains";
import { findNativePerToken, getNativePriceInUSD } from "./utils/pricing";
import { updatePoolDayData, updatePoolHourData } from "./utils/intervalUpdates";

UniswapV3Pool.Initialize.handler(async ({event, context}) => {
    const {
        stablecoinWrappedNativePoolId,
        stablecoinIsToken0,
        wrappedNativeAddress,
        stablecoinAddresses,
        minimumNativeLocked,
    } = CHAIN_CONFIGS[event.chainId];

    let pool = await context.Pool.get(event.srcAddress);
    if (!pool) return;

    // update pool sqrt price and tick
    pool = {
        ...pool,
        sqrtPrice: event.params.sqrtPriceX96,
        tick: BigInt(event.params.tick)
    };
    
    context.Pool.set(pool);

    let bundle = await context.Bundle.get('1');
    if (!bundle) return;

    // update ETH price now that prices could have changed
    bundle = {
        ...bundle,
        ethPriceUSD: await getNativePriceInUSD(
            context, 
            event.chainId, 
            stablecoinWrappedNativePoolId, 
            stablecoinIsToken0
        )
    };

    context.Bundle.set(bundle);

    updatePoolDayData(event.srcAddress, event.block.timestamp, context);
    updatePoolHourData(event.srcAddress, event.block.timestamp, context);

    // update token prices
    let token0 = await context.Token.get(pool.token0_id);
    let token1 = await context.Token.get(pool.token1_id);

    if (token0 && token1) {
        const [derivedETH_t0, derivedETH_t1] = await Promise.all([
            findNativePerToken(
                context,
                token0 as Token,
                wrappedNativeAddress,
                stablecoinAddresses,
                minimumNativeLocked,
            ),
            findNativePerToken(
                context,
                token1 as Token,
                wrappedNativeAddress,
                stablecoinAddresses,
                minimumNativeLocked,
            )
        ]);

        token0 = {
            ...token0,
            derivedETH: derivedETH_t0
        };

        token1 = {
            ...token1,
            derivedETH: derivedETH_t1
        };

        context.Token.set(token0);
        context.Token.set(token1);
    }
});