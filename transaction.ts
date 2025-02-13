export class Transaction {
    constructor(
        public sender: string,
        public recipient: string,
        public amount: number
    ) {}
}
