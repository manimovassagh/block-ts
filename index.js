"use strict";
class Block {
    constructor(data, previousHash = '') {
        this.data = data;
        this.nonce = 0;
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
            JSON.stringify(this.data) +
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
    constructor(difficulty = 4) {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = difficulty;
    }
    createGenesisBlock() {
        return new Block({ message: "Genesis Block" }, "0");
    }
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    addBlock(data) {
        const previousBlock = this.getLatestBlock();
        const newBlock = new Block(data, previousBlock.hash);
        console.log('Mining new block...');
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
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
const myCoin = new Blockchain(6); // Create blockchain with difficulty 4
// Add some blocks
console.log('Adding first block...');
myCoin.addBlock({ amount: 10, sender: "John", recipient: "Alice" });
console.log('Adding second block...');
myCoin.addBlock({ amount: 20, sender: "Alice", recipient: "Bob" });
// Verify the chain
console.log('Is chain valid?', myCoin.isChainValid());
// Display the full chain
console.log('Full blockchain:', JSON.stringify(myCoin.getChain(), null, 2));
