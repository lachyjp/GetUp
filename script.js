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
        obj = await response.json();
        console.log(obj);
        document.getElementById(httpAccStatus[0]).innerHTML = `${response.status}: Success!`;

        //ADD ACCOUNTS
        let balanceTotal = 0;
        for (i = 0; i < 5; i++) {
            newTextNode(`Your ${obj.data[i].attributes.displayName} balance is $${parseFloat(obj.data[i].attributes.balance.value)}`, "p", "accounts");
            balanceTotal += parseFloat(obj.data[i].attributes.balance.value);
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
        obj = await response.json();
        document.getElementById(httpTxnStatus[0]).innerHTML = `${response.status}: Success!`;

        //ADD TRANSACTIONS
        console.log(obj);
        for (i = 0; i < 20; i++) {
            newTextNode(`${obj.data[i].attributes.description} for $${parseFloat(obj.data[i].attributes.amount.value)}`, "p", "activity");
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
    let element = document.getElementById(id);
    element.appendChild(p); 
};