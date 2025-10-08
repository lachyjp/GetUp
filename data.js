// Data models and processing functions for the GetUp application

// Transaction class for creating transaction objects
class Transaction {
    constructor(description, type, value, status, date, time, text, message, roundup) {
        this.desc = description;
        this.type = type;
        this.val = value;
        this.status = status;
        this.date = date;
        this.time = time;
        this.text = text;
        this.msg = message;
        this.roundup = roundup;
    }
}

// Account class for creating account objects
class Account {
    constructor(name, balance, type, owner) {
        this.name = name;
        this.balance = balance;
        this.type = type;
        this.owner = owner;
    }
}

// Process account data from API response using modern JS features
const processAccountData = (obj) => {
    // Use modern array methods and destructuring
    const account = obj.data.map(({ attributes }) => {
        const { displayName: accName, balance, accountType: accType, ownershipType: accOwner } = attributes;
        const accValue = parseFloat(balance.value);
        
        return new Account(accName, accValue, accType, accOwner);
    });

    return { account };
};

// Process transaction data from API response using modern JS features
const processTransactionData = (obj) => {
    // Use modern array methods and destructuring
    const txn = obj.data
        .slice(4) // Skip first 4 items
        .map(({ attributes }) => {
            const {
                description: txnDesc,
                amount,
                status: txnStatus,
                createdAt: txnRawDate,
                rawText: txnRawText,
                message: txnMessage,
                roundUp: txnRoundUp
            } = attributes;
            
            let txnVal = parseFloat(amount.value);
            const txnValType = txnVal < 0 ? "" : "+";
            
            if (txnVal < 0) {
                txnVal = Math.abs(txnVal);
            }

            const [txnDate, rawTime] = formatDate(txnRawDate);
            const txnTime = formatTime(rawTime);

            // Handle null values with nullish coalescing
            const processedRawText = txnRawText ?? "N/A";
            const processedMessage = txnMessage ?? "N/A";
            const processedRoundUp = txnRoundUp ?? "false";

            // Sanitize transaction data before creating object
            const sanitizedDesc = sanitizeInput(txnDesc);
            const sanitizedRawText = sanitizeInput(processedRawText);
            const sanitizedMessage = sanitizeInput(processedMessage);
            
            return new Transaction(
                sanitizedDesc, 
                txnValType, 
                txnVal, 
                txnStatus, 
                txnDate, 
                txnTime, 
                sanitizedRawText, 
                sanitizedMessage, 
                processedRoundUp
            );
        });

    return { txn };
};

// Calculate spending statistics using modern array methods for better performance
function calculateSpendingStats(txn) {
    if (!txn || txn.length === 0) {
        return {
            totalSpent: "0.00",
            daysBetween: 0,
            averageDaily: "0.00"
        };
    }

    // Filter out transfers and calculate totals in one pass
    const nonTransferTxn = txn.filter(transaction => !transaction.desc.includes("Transfer"));
    
    const sum = nonTransferTxn.reduce((total, transaction) => total + transaction.val, 0);
    const sumPlus = nonTransferTxn
        .filter(transaction => transaction.type === "+")
        .reduce((total, transaction) => total + transaction.val, 0);

    // Calculate net spending
    const sumMinus = sum - sumPlus;
    const roundedSumMinus = sumMinus.toFixed(2);

    // Calculate days between first and last transaction using Date objects
    const firstDate = new Date(txn[0].date);
    const lastDate = new Date(txn[txn.length - 1].date);
    const daysBetween = Math.abs(Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)));

    // Calculate average daily spending
    const average = daysBetween > 0 ? Math.abs(sumMinus / daysBetween).toFixed(2) : "0.00";

    return {
        totalSpent: roundedSumMinus,
        daysBetween,
        averageDaily: average
    };
}

// Count unique merchants using modern array methods
function countUniqueMerchants(txn) {
    if (!txn || txn.length === 0) return 0;
    
    const excludedDescriptions = ["Transfer from Spending", "Transfer to Savings", "Beem"];
    
    const uniqueMerchants = txn
        .filter(transaction => !excludedDescriptions.includes(transaction.desc))
        .map(transaction => transaction.text)
        .filter((text, index, array) => array.indexOf(text) === index); // Remove duplicates
    
    return uniqueMerchants.length;
}
