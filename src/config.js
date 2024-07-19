export default {
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
  volumnMultipler: Number(process.env.VOLUME_MULTIPLER) || 1,
};
