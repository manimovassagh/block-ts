"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_1 = require("./transaction");
class Block {
    constructor(transactions, previousHash = '') {
        this.nonce = 0;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.timestamp = Date.now();
        this.hash = this.calculateHash();
    }
    calculateHash() {
        const crypto = require('crypto');
        return crypto
            .createHash('sha256')
            .update(this.previousHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce)
            .digest('hex');
    }
    mineBlock(difficulty) {
        const target = Array(difficulty + 1).join('0');
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
            // Optional: Show mining progress
            if (this.nonce % 10000 === 0) {
                console.log(`Mining... Nonce: ${this.nonce}, Hash: ${this.hash}`);
            }
        }
        console.log(`Block mined! Hash: ${this.hash}`);
    }
}
class Blockchain {
    constructor(difficulty = 4, miningReward = 100) {
        this.pendingTransactions = [];
        this.chain = [this.createGenesisBlock()];
        this.difficulty = difficulty;
        this.miningReward = miningReward;
    }
    createGenesisBlock() {
        return new Block([], "0");
    }
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    addTransaction(transaction) {
        if (!transaction.sender || !transaction.recipient) {
            throw new Error('Transaction must include sender and recipient');
        }
        if (transaction.amount <= 0) {
            throw new Error('Transaction amount should be higher than 0');
        }
        this.pendingTransactions.push(transaction);
    }
    minePendingTransactions(minerAddress) {
        const block = new Block(this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
        console.log('Block successfully mined!');
        this.chain.push(block);
        this.pendingTransactions = [
            new transaction_1.Transaction('', minerAddress, this.miningReward)
        ];
    }
    getBalanceOfAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.sender === address) {
                    balance -= trans.amount;
                }
                if (trans.recipient === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            // Verify current block's hash
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.log('Invalid block hash');
                return false;
            }
            // Verify chain linkage
            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log('Invalid chain linkage');
                return false;
            }
        }
        return true;
    }
    getChain() {
        return this.chain;
    }
}
// Example usage
const myCoin = new Blockchain(4, 100);
// Create transactions
myCoin.addTransaction(new transaction_1.Transaction('address1', 'address2', 50));
myCoin.addTransaction(new transaction_1.Transaction('address2', 'address1', 30));
// Mine pending transactions
console.log('Starting the miner...');
myCoin.minePendingTransactions('miner-address');
console.log('Balance of miner is', myCoin.getBalanceOfAddress('miner-address'));
// Mine again to get the reward for the previous block
console.log('Starting the miner again...');
myCoin.minePendingTransactions('miner-address');
console.log('Balance of miner is', myCoin.getBalanceOfAddress('miner-address'));
