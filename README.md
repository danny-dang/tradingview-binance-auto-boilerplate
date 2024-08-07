# Trading Binance Auto Boilerplate

Version v2.0.1

Last update: July 19th, 2024

This is boilerplate for Trading Server for Binance exchange. Currently it's only meant for trading Futures.

## Tradingview Alert payload

Use this Pinescript boilerplate: https://www.tradingview.com/script/HwTFuzDO-Trading-Auto-Boilerplate/

And then use this text in the Alert message.

```
{
  "symbol": "ETHUSDT",
  "time": "{{timenow}}",
  "strategy": {
    "order_id": "{{strategy.order.id}}",
    "order_action": "{{strategy.order.action}}",
    "order_contracts": "{{strategy.order.contracts}}",
    "order_price": "{{strategy.order.price}}",
    "meta_data": {{strategy.order.alert_message}},
    "strategy_action": "{{strategy.order.comment}}",
    "use_limit_tp_sl": "false"
  }
}
```

You just need to update 2 things:

- `symbol`: Trading pair you want to trade, must match with your exchange's
- `use_limit_tp_sl`: `"false"` or `"true"`. This option is for who wants to use TP/SL. If it's `"false"`, the strategy will use `TAKE_PROFIT_MARKET` and `STOP_MARKET` order. If it's `"true"`, the strategy will use `TAKE_PROFIT` and `STOP` order.

Example what you will receive:

```json
{
  "symbol": "ETHUSDT",
  "time": "2023-02-12T15:19:00Z",
  "strategy": {
    "order_id": "short",
    "order_action": "sell",
    "order_contracts": "0.5098",
    "order_price": "1538.5",
    "meta_data": { "tp_price": "1523.115", "sl_price": "1553.885" },
    "strategy_action": "entry",
    "use_limit_tp_sl": "false"
  }
}
```

## How to run the server

1. Install dependencies

```
yarn install
```

2. Create a `.env` file, copy from the file `.env.example`, then fill in your API keys:

```
BINANCE_API_KEY=
BINANCE_API_SECRET=
VOLUME_MULTIPLER=
```

- `BINANCE_API_KEY`: Your Binance API key.
- `BINANCE_API_SECRET`: Your Binance API secret.
- `VOLUME_MULTIPLER`: Volume multipler with the volume received from Tradingview

3. Run the server

```
yarn start
```
