const accURL = "https://api.up.com.au/api/v1/accounts";
const txnURL = "https://api.up.com.au/api/v1/transactions";
const httpAccStatus = ['acc-status-successful', 'acc-status-failed'];
const httpTxnStatus = ['txn-status-successful', 'txn-status-failed'];
const authStatus = ['auth-status-successful', 'auth-status-failed'];
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Host': 'contextualwebsearch-websearch-v1.p.rapidapi.com',
		'X-RapidAPI-Key': 'da494ecdc7msheef92a697e197f3p11fd65jsnf313d41588c9'
	}
};

function submitUpKey() {
    let upKey = document.getElementById("upKeyInput").value;
    getAcc(upKey);
    getTxn(upKey);
};

async function getAcc(upKey) {
    let response = await fetch(accURL, {
        headers: {
            Authorization: 'Bearer ' + upKey
        }
    })
    if (response.status >= 200 && response.status <= 299) {
        //SUCCESS
        let obj = await response.json();
        console.log(obj);
        document.getElementById(httpAccStatus[0]).innerHTML = `${response.status}: Success!`;

        //ADD ACCOUNTS
        let balanceTotal = 0;
        for (i = 0; i < obj.data.length; i++) {
            let accName = obj.data[i].attributes.displayName;
            let accValue = parseFloat(obj.data[i].attributes.balance.value);
            //let accType = obj.data[i].attributes.accountType;
            //let accOwner = obj.data[i].attributes.ownershipType;

            newTextNode(`Your ${accName} balance is $${accValue}`, "p", "accounts");
            balanceTotal += accValue;
        };
        document.getElementById("total-balance").innerHTML = "Your total balance: $" + balanceTotal;

    } else {
        //ERROR
        response = await response.json();
        document.getElementById(httpAccStatus[1]).innerHTML = `${response.errors[0].status}: ${response.errors[0].title} - ${response.errors[0].detail}`
        console.log(response);
    };
};

async function getTxn(upKey) {
    let response = await fetch(txnURL, {
        headers: {
            Authorization: 'Bearer ' + upKey
        }
    })
    if (response.status >= 200 && response.status <= 299) {
        //SUCCESS
        let obj = await response.json();
        console.log(obj);
        document.getElementById(httpTxnStatus[0]).innerHTML = `${response.status}: Success!`;

        var txn = [];

        //ADD TRANSACTIONS
        for (i = 0; i < 20; i++) {
            //let txnIcon = txnURL
            let txnDesc = obj.data[i].attributes.description;
            let txnValType = "";
            let txnVal = parseFloat(obj.data[i].attributes.amount.value);
            let txnStatus = obj.data[i].attributes.status;
            let txnRawDate =  obj.data[i].attributes.createdAt;
            let txnRawText = obj.data[i].attributes.rawText;
            let txnMessage = obj.data[i].attributes.message;
            let txnRoundUp = obj.data[i].attributes.roundUp;

            //formatting data
            if (txnVal < 0) {
                txnVal = txnVal * -1;
                txnValType = "";
            }
            else {
                txnValType = "+";
            };
            if (txnRawText == null) {
                txnRawText = "";
            };
            if (txnMessage == null) {
                txnMessage = "";
            };
            if (txnRoundUp == null) {
                txnRoundUp = "";
            };

            //new array
            let txnArray = [];
            txnArray[i] = new Transaction(txnDesc, txnValType, txnVal, txnStatus, txnRawDate, txnRawText, txnMessage, txnRoundUp);
            txn.push(txnArray[i])
           
        };

        for (i = 0; i < txn.length; i++) {
            newTextNode(`${txn[i].desc}, ${txn[i].type}$${txn[i].val}, ${txn[i].status}, ${txn[i].date}, ${txn[i].text} ${txn[i].msg} ${txn[i].roundup}`, "p", "activity");
        }
        console.log(txn);

    } else {
        //ERROR
        response = await response.json();
        document.getElementById(httpTxnStatus[1]).innerHTML = `${response.errors[0].status}: ${response.errors[0].title} - ${response.errors[0].detail}`
        console.log(response);
    };
};

function newTextNode(newMessage, type , id) {
    let p = document.createElement(type);
    let node = document.createTextNode(newMessage);
    p.appendChild(node);
    let element = document.getElementById(id)
    element.appendChild(p);
};

function Transaction (description, type, value, status, date, text, message, roundup) {
    this.desc = description;
    this.type = type;
    this.val = value;
    this.status = status;
    this.date = date;
    this.text = text;
    this.msg = message;
    this.roundup = roundup;
}