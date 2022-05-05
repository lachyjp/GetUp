const accURL = "https://api.up.com.au/api/v1/accounts";
const txnURL = "https://api.up.com.au/api/v1/transactions";
const httpAccStatus = ['acc-status-successful', 'acc-status-failed'];
const httpTxnStatus = ['txn-status-successful', 'txn-status-failed'];

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
        for (i = 0; i < 5; i++) {
            let accName = obj.data[i].attributes.displayName;
            let accValue = parseFloat(obj.data[i].attributes.balance.value);
            
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

        //ADD TRANSACTIONS
        for (i = 0; i < 20; i++) {
            let txnDesc = obj.data[i].attributes.description;
            let txnValue = parseFloat(obj.data[i].attributes.amount.value);
            newTextNode(`${txnDesc} for $${txnValue}`, "p", "activity");
        };

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