import { Transaction } from './transaction';

class Block {
    public hash: string;
    public nonce: number = 0;
    public previousHash: string;
    public timestamp: number;
    public transactions: Transaction[];

    constructor(
        transactions: Transaction[],
        previousHash = ''
    ) {
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.timestamp = Date.now();
        this.hash = this.calculateHash();
    }

    calculateHash(): string {
        const crypto = require('crypto');
        return crypto
            .createHash('sha256')
            .update(
                this.previousHash +
                this.timestamp +
                JSON.stringify(this.transactions) +
                this.nonce
            )
            .digest('hex');
    }

    mineBlock(difficulty: number): void {
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
    private chain: Block[];
    private difficulty: number;
    private pendingTransactions: Transaction[] = [];
    private miningReward: number;

    constructor(difficulty: number = 4, miningReward: number = 100) {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = difficulty;
        this.miningReward = miningReward;
    }

    private createGenesisBlock(): Block {
        return new Block([], "0");
    }

    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction: Transaction): void {
        if (!transaction.sender || !transaction.recipient) {
            console.error('Transaction must include sender and recipient');
            return;
        }

        if (transaction.amount <= 0) {
            console.error('Transaction amount should be higher than 0');
            return;
        }

        if (this.getBalanceOfAddress(transaction.sender) < transaction.amount) {
            console.error('Not enough balance');
            return;
        }

        console.log(`Adding transaction from ${transaction.sender} to ${transaction.recipient} for ${transaction.amount}`);
        this.pendingTransactions.push(transaction);
    }

    minePendingTransactions(minerAddress: string): void {
        if (this.pendingTransactions.length === 0) {
            console.error('No transactions to mine');
            return;
        }

        const block = new Block(this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, minerAddress, this.miningReward)
        ];
    }

    getBalanceOfAddress(address: string): number {
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

    isChainValid(): boolean {
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

    getChain(): Block[] {
        return this.chain;
    }
}

// Example usage
const myCoin = new Blockchain(4, 100);

// Create transactions
myCoin.addTransaction(new Transaction('John', 'Alice', 50));
myCoin.addTransaction(new Transaction('Alice', 'Bob', 30));
myCoin.addTransaction(new Transaction('Bob', 'John', 20));

// Mine pending transactions
console.log('Starting the miner...');
myCoin.minePendingTransactions('miner-address');

console.log('Balance of John is', myCoin.getBalanceOfAddress('John'));
console.log('Balance of Alice is', myCoin.getBalanceOfAddress('Alice'));
console.log('Balance of Bob is', myCoin.getBalanceOfAddress('Bob'));
console.log('Balance of miner is', myCoin.getBalanceOfAddress('miner-address'));

// Mine again to get the reward for the previous block
console.log('Starting the miner again...');
myCoin.minePendingTransactions('miner-address');

console.log('Balance of miner is', myCoin.getBalanceOfAddress('miner-address'));