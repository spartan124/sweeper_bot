import dotenv from 'dotenv';
dotenv.config();

import Web3 from 'web3';

const { PRIVATE_KEY, SWEEP_ADDRESS, MAINNET_INFURA_API_KEY, SEPOLIA_INFURA_API_KEY } = process.env;

// Setup Web3 instances for Mainnet and Sepolia
const mainnetWeb3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${MAINNET_INFURA_API_KEY}`));
const sepoliaWeb3 = new Web3(new Web3.providers.HttpProvider(`https://sepolia.infura.io/v3/${SEPOLIA_INFURA_API_KEY}`));
const polygonWeb3 = new Web3(new Web3.providers.HttpProvider(`https://polygon-mainnet.infura.io/v3/${MAINNET_INFURA_API_KEY}`));
const baseWeb3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.base.org`));
const sepoliaBaseWeb3 = new Web3(new Web3.providers.HttpProvider(`https://sepolia.base.org`));

const account = sepoliaWeb3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
sepoliaWeb3.eth.accounts.wallet.add(account);
mainnetWeb3.eth.accounts.wallet.add(account);
polygonWeb3.eth.accounts.wallet.add(account);
baseWeb3.eth.accounts.wallet.add(account);
sepoliaBaseWeb3.eth.accounts.wallet.add(account)

if (!PRIVATE_KEY || !MAINNET_INFURA_API_KEY || !SEPOLIA_INFURA_API_KEY || !SWEEP_ADDRESS) {
    console.error('Please set PRIVATE_KEY, MAINNET_INFURA_API_KEY, SEPOLIA_INFURA_API_KEY, and SWEEP_ADDRESS in your .env file.');
    process.exit(1);
}

const coinTicker = {
    Mainnet: 'ETH',
    Base: 'baseETH',
    Sepolia: 'ETH',
    Polygon: 'MATIC',
    SepoliaBase: 'SepBaseETH'
}

const getGasPrice = async web3 => await web3.eth.getGasPrice();

const sweepFunds = async (web3, networkName) => {
    try {
        const balance = await web3.eth.getBalance(account.address);
        console.log(`${networkName} Balance: ${web3.utils.fromWei(balance, 'ether')} ${coinTicker[networkName]}`);

        if (BigInt(balance) >= BigInt(web3.utils.toWei('0.0001', 'ether'))) {
            const gasPrice = await getGasPrice(web3);
            const gasLimit = 21000;
            const gasFee = BigInt(gasPrice) * BigInt(gasLimit);
            const valueToSend = BigInt(balance) - gasFee;

            if (valueToSend <= 0) {
                console.log(`Not enough balance to cover gas fees on ${networkName}`);
                return;
            }

            const tx = {
                from: account.address,
                to: SWEEP_ADDRESS,
                value: valueToSend.toString(),
                gas: gasLimit,
                gasPrice: gasPrice,
            };

            console.log(`${networkName} Transaction object:`, tx);

            const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
            console.log(`${networkName} Signed transaction:`, signedTx);

            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log(`${networkName} Transaction successful with hash:`, receipt.transactionHash);
        } else {
            console.log(`No funds to sweep on ${networkName}`);
        }
    } catch (error) {
        console.error(`Error sweeping funds on ${networkName}:`, error);
    }
};

const monitorBalance = async (web3, networkName) => {
    let previousBalance = await web3.eth.getBalance(account.address);
    let transactionInProgress = false;

    console.log(`Initial ${networkName} balance: ${web3.utils.fromWei(previousBalance, 'ether')} ${coinTicker[networkName]}`);
    setInterval(async () => {
        if (transactionInProgress) {
            console.log(`${networkName} transaction in progress, skipping balance check`);
            return;
        }

        const currentBalance = await web3.eth.getBalance(account.address);
        if (currentBalance !== previousBalance) {
            console.log(`${networkName} balance changed: ${web3.utils.fromWei(currentBalance, 'ether')} ${coinTicker[networkName]}`);
            transactionInProgress = true;
            await sweepFunds(web3, networkName);
            previousBalance = currentBalance;
            transactionInProgress = false;
        }
    }, 15000); // Check balance every 15 seconds
};

const main = async () => {
    await Promise.all([
        // monitorBalance(mainnetWeb3, 'Mainnet'),
        monitorBalance(sepoliaWeb3, 'Sepolia'),
        monitorBalance(polygonWeb3, 'Polygon'),
        // monitorBalance(baseWeb3, 'Base'),
        monitorBalance(sepoliaBaseWeb3, 'SepoliaBase'),
        sweepFunds(polygonWeb3, 'Polygon'),
        sweepFunds(sepoliaBaseWeb3, 'SepoliaBase')
    ]);
};

main();
