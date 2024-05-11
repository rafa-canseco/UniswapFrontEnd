import Utils from "../utils/Utils";
import { pools} from "../constants";
import {getPool} from "./ContractService"
import {tokenInfos} from "../constants";
import {getQuoter2} from "./ContractService"

export const getPriceImpact = async (inputAmount, inSymbol, outSymbol) => {
  if (Utils.isSymbolsEthAndWeth(inSymbol, outSymbol)) {
    return;
  }

  const { inputSymbol, outputSymbol } = Utils.EthtoWethString(
    inSymbol,
    outSymbol
  );

  const poolAddress = pools[inputSymbol][outputSymbol][3000];

  const poolContract = getPool(poolAddress);
  const slot0 = await poolContract.slot0();

  const sqrtPriceX96 =  slot0.sqrtPriceX96;

  const token0 = await poolContract.token0();
  const isToken0Input = inputSymbol === token0;

  let token0Decimals;
  let token1Decimals;
  if (isToken0Input) {
    token0Decimals = tokenInfos[inputSymbol].decimals;
    token1Decimals = tokenInfos[outputSymbol].decimals;
  } else {
    token0Decimals = tokenInfos[outputSymbol].decimals;
    token1Decimals = tokenInfos[inputSymbol].decimals;
  }

  const inputAddress = tokenInfos[inputSymbol].address;
  const outputAddress = tokenInfos[outputSymbol].address;
  const inputTokenDecimals = tokenInfos[inputSymbol].decimals;
  const amountIn = Utils.tokensToWei(inputAmount, inputTokenDecimals); ////posible mod
  const params = {
    tokenIn: inputAddress,
    tokenOut: outputAddress,
    amountIn,
    fee: 3000,
    sqrtPriceLimitX96: "0",
  };

  const quoter = getQuoter2();


  const quote = await quoter.quoteExactInputSingle.staticCall(params);
  const sqrtPriceX96After = quote.sqrtPriceX96After;
  const after = Number(sqrtPriceX96After);
  const sqrtPriceX96Number = Number(sqrtPriceX96);

  const price = Utils.sqrtToPrice(
      sqrtPriceX96Number,
      token0Decimals,
      token1Decimals,
      isToken0Input
  );
  const priceAfter = Utils.sqrtToPrice(after, token0Decimals, token1Decimals, isToken0Input);
  console.log(price-priceAfter)

  const absoluteChange = Math.abs(price - priceAfter);
  console.log(absoluteChange)
  const percentChange = absoluteChange / price
  console.log(percentChange)
  return Utils.decimalToPercent(percentChange,3)
};
























//