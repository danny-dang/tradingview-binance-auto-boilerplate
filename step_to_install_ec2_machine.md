1. Update apt:
```
sudo apt update
```
2. Install git:
```
sudo apt install git
```
3. Install node:
```
sudo apt install nodejs
```
4. Install npm
```
sudo apt install npm
```

5. Install pm2:
```
sudo npm install pm2@latest -g
```
6. Upgrade nodejs:
```
curl -sL https://deb.nodesource.com/setup_16.x | sudo bash - 
sudo apt install -y nodejs
```
7. Clone the repo:
```
git clone https://github.com/danny-dang/tradingview-binance-auto-boilerplate.git
```
8. Install dependencies:
```
cd tradingview-binance-auto-boilerplate
npm install
```
9. Run the server using pm2
```
pm2 start npm --name "trading-server" -- start
```