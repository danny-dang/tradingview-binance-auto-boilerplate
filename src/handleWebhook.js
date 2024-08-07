import Binance from 'binance-api-node';
import config from './config';
import { SYMBOLS } from './symbols';

const client = Binance({
  apiKey: config.apiKey,
  apiSecret: config.apiSecret,
  // httpFutures: "https://testnet.binancefuture.com", // For testing
  // httpBase: "https://testnet.binance.vision", // For testing
});

let symbolInfoAPI = null;

const getSymbolInfo = async () => {
  try {
    const { symbols } = await client.futuresExchangeInfo();
    symbolInfoAPI = {};
    symbols.forEach((symbolInfo) => {
      const { symbol, pricePrecision, quantityPrecision } = symbolInfo;
      symbolInfoAPI[symbol] = {
        pricePrecision,
        quantityPrecision,
      };
    });
    console.log('----SUCCESSFULLY getting Symbol info----');
  } catch (error) {
    console.log('----FAILED getting Symbol info----');
  }
};
getSymbolInfo();

export const handleWebhook = async (req, res) => {
  const alert = req.body;
  console.log('----RECEVING order----\n', alert);
  if (!alert?.symbol) {
    return res.json({ message: 'ok' });
  }

  try {
    //Ignore TP/ SL orders
    //Trading view is sending a TP/SL order
    //We ignore this alert because TP/SL is set at position entry
    if (
      alert.strategy.order_id.includes('TP') ||
      alert.strategy.order_id.includes('SL')
    ) {
      console.log('---TP/SL order ignore---', alert?.symbol);
      return res.json({ message: 'ok' });
    }

    //When Tradingview sends alert, we will get the order contracts sent from Tradingview
    //We use this quanity to open position in Binance
    //we also need to change the contract precision because the one got from TV is different for Binnace
    const allSymbols = symbolInfoAPI ? symbolInfoAPI : SYMBOLS;
    let quantity = Number(
      (
        Number(alert.strategy.order_contracts) * (config.volumnMultipler || 1)
      ).toFixed(allSymbols[alert?.symbol].quantityPrecision),
    );

    //Get the take profit price from Tradingview order
    const take_profit_price = Number(
      Number(alert.strategy.meta_data?.tp_price || 0).toFixed(
        allSymbols[alert?.symbol].pricePrecision,
      ),
    );

    //Get the stop loss price from Tradingview order
    const stop_loss_price = Number(
      Number(alert.strategy.meta_data?.sl_price || 0).toFixed(
        allSymbols[alert?.symbol].pricePrecision,
      ),
    );

    //Get order action from Tradingview. Either 'BUY' or 'SELL'
    const side = alert.strategy.order_action.toUpperCase();

    //Entry the position with MARKET PRICE
    if (alert.strategy.strategy_action === 'entry') {
      let options = {
        symbol: alert?.symbol,
        side: side,
        type: 'MARKET',
        quantity,
      };
      console.log('---ENTRY Order Starting---\n', options);
      let result = await client.futuresOrder(options);
      console.log('---ENTRY Order successful---\n', result);

      //Set a TP order when entrying a position
      if (take_profit_price) {
        const tp_side = side === 'BUY' ? 'SELL' : 'BUY';

        let tp_options = {};

        //Here we can use either LIMIT order or TAKE PROFIT MARKET order
        //I would recommend TAKE PROFIT MARKET order to prevent unexpected behavior
        if (alert?.strategy?.use_limit_tp_sl === 'true') {
          tp_options = {
            symbol: alert.symbol,
            side: tp_side,
            stopPrice: take_profit_price,
            type: 'TAKE_PROFIT',
            quantity,
            reduceOnly: true,
            price: take_profit_price,
            timeInForce: 'GTE_GTC',
          };
        } else {
          tp_options = {
            symbol: alert.symbol,
            side: tp_side,
            stopPrice: take_profit_price,
            type: 'TAKE_PROFIT_MARKET',
            closePosition: true,
            timeInForce: 'GTE_GTC',
          };
        }

        console.log('---TP Order Starting---\n', tp_options);
        let result = await client.futuresOrder(tp_options);
        console.log('---TP Order successful---\n', result);
      }

      //Set a SL order when entrying a position
      if (stop_loss_price) {
        const sl_side = side === 'BUY' ? 'SELL' : 'BUY';

        let sl_options = {};

        //Here we can use either LIMIT order or TAKE PROFIT MARKET order
        //I would recommend TAKE PROFIT MARKET order to prevent unexpected behavior
        if (alert?.strategy?.use_limit_tp_sl === 'true') {
          sl_options = {
            symbol: alert.symbol,
            side: sl_side,
            stopPrice: stop_loss_price,
            type: 'STOP',
            quantity,
            reduceOnly: true,
            price: stop_loss_price,
            priceProtect: true,
            timeInForce: 'GTE_GTC',
          };
        } else {
          sl_options = {
            symbol: alert.symbol,
            side: sl_side,
            stopPrice: stop_loss_price,
            type: 'STOP_MARKET',
            closePosition: true,
            priceProtect: true,
            timeInForce: 'GTE_GTC',
          };
        }

        console.log('---SL Order starting---\n', sl_options);
        let result = await client.futuresOrder(sl_options);
        console.log('---SL Order successful---\n', result);
      }
    }

    //Handle close the position
    if (alert.strategy.strategy_action === 'full_close') {
      let options = {
        symbol: alert?.symbol,
        side: side,
        type: 'MARKET',
        quantity,
      };
      console.log('---CLOSE Order starting---\n', options);

      let result = await client.futuresOrder(options);
      console.log('---CLOSE Order successful---\n', result);
    }

    //Handle reduce the position
    if (alert.strategy.strategy_action === 'reduce') {
      let options = {
        symbol: alert?.symbol,
        side: side,
        type: 'MARKET',
        quantity,
      };
      console.log('---REDUCE Order starting---\n', options);

      let result = await client.futuresOrder(options);
      console.log('---REDUCE Order successful---\n', result);
    }
  } catch (error) {
    console.log('---Order error---', alert.symbol, error);
  }

  return res.json({ message: 'ok' });
};

export const checkAccountInfo = async (req, res) => {
  const acocuntInfo = await client.futuresAccountBalance();

  return res.json(acocuntInfo);
};
