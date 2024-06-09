import dotenv from 'dotenv';
dotenv.config();

import Web3 from 'web3';

const { PRIVATE_KEY, SWEEP_ADDRESS, SEPOLIA_INFURA_API_KEY, MAINNET_INFURA_API_KEY } = process.env;

// Setup Web3 instance for Sepolia Testnet
const sepoliaWeb3 = new Web3(new Web3.providers.HttpProvider(`https://sepolia.infura.io/v3/${SEPOLIA_INFURA_API_KEY}`));
const mainnetWeb3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${MAINNET_INFURA_API_KEY}`));

const account = sepoliaWeb3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
sepoliaWeb3.eth.accounts.wallet.add(account);
mainnetWeb3.eth.accounts.wallet.add(account);

if (!PRIVATE_KEY || !SEPOLIA_INFURA_API_KEY || !SWEEP_ADDRESS) {
    console.error('Please set PRIVATE_KEY, SEPOLIA_INFURA_API_KEY, and SWEEP_ADDRESS in your .env file.');
    process.exit(1);
}

const getGasPrice = async web3 => await web3.eth.getGasPrice();

const sweepFunds = async web3 => {
    try {
        const balance = await web3.eth.getBalance(account.address);
        console.log(`Balance: ${web3.utils.fromWei(balance, 'ether')} ETH`);

        if (balance > 0.00001) {
            const gasPrice = await getGasPrice(web3);
            const gasLimit = 21000;
            const gasFee = BigInt(gasPrice) * BigInt(gasLimit);
            const valueToSend = BigInt(balance) - gasFee;

            if (valueToSend <= 0) {
                console.log('Not enough balance to cover gas fees');
                return;
            }

            const tx = {
                from: account.address,
                to: SWEEP_ADDRESS,
                value: valueToSend.toString(),
                gas: gasLimit,
                gasPrice: gasPrice,
            };

            console.log('Transaction object:', tx);

            const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
            console.log('Signed transaction:', signedTx);

            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log('Transaction successful with hash:', receipt.transactionHash);
        } else {
            console.log('No funds to sweep');
        }
    } catch (error) {
        console.error('Error sweeping funds:', error);
    }
};

const monitorBalance = async web3 => {
    let previousBalance = await web3.eth.getBalance(account.address);
    console.log(`Initial balance: ${web3.utils.fromWei(previousBalance, 'ether')} ETH`);
    setInterval(async () => {
        const currentBalance = await web3.eth.getBalance(account.address);
        if (currentBalance !== previousBalance) {
            console.log(`Balance changed: ${web3.utils.fromWei(currentBalance, 'ether')} ETH`);
            await sweepFunds(web3);
            previousBalance = currentBalance;
        }
    }, 15000); // Check balance every 15 seconds
};

const main = async () => {
    await monitorBalance(sepoliaWeb3);
    await sweepFunds(sepoliaWeb3)
    await monitorBalance(mainnetWeb3);
    // await sweepFunds(mainnetWeb3)
};

main();
