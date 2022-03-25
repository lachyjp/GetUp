const accURL = "https://api.up.com.au/api/v1/accounts";
const txnURL = "https://api.up.com.au/api/v1/transactions";

function submitUpKey() {
    var upKey = document.getElementById("upKeyInput").value;

    getUp(upKey);
    getTxn(upKey);
}

async function getUp(upKey) {
    //REQUESTING JSON OBJECT
    let response = await fetch(accURL, {
        headers: {
            Authorization: 'Bearer ' + upKey
        }
    })
    
    let obj = await response.json();
    let status = response.status;
    
    //CONFIRMING SUCCESSFUL REQUEST
    if (status == 200) {
        document.getElementById("acc-status").innerHTML = "Accounts HTTP Status: " + status + ", Success!";
    } else {
        document.getElementById("acc-status").innerHTML = "Accounts HTTP Status: " + status + ", Error: check your Up API Key is correct and try again";
    }

    let balances = [];
    let accounts = [];
    let total = 0;
    let arrayLength = obj["data"].length;

    for (i = 0; i < arrayLength; i++) {
        balances.push(parseFloat(obj["data"][i]["attributes"]["balance"]["value"]));
        accounts.push(obj["data"][i]["attributes"]["displayName"])
        total = total + balances[i];

        //ADDING EACH ACCOUNT IN HTML
        let p = document.createElement("p");
        let node = document.createTextNode(`Your ${accounts[i]} balance is $${balances[i]}`);
        p.appendChild(node);
        let element = document.getElementById("div1");
        element.appendChild(p); 
    }

    document.getElementById("total-balance").innerHTML = "Your total balance: $" + total;
    console.log(balances);
}

async function getTxn(upKey) {
    //REQUESTING JSON OBJECT
    let response = await fetch(txnURL, {
        headers: {
            Authorization: 'Bearer ' + upKey
        }
    })
    
    let obj = await response.json();
    let status = response.status;
    
    //CONFIRMING SUCCESSFUL REQUEST
    if (status == 200) {
        document.getElementById("txn-status").innerHTML = "Transactions HTTP status " + status + ", Success!";
    } else {
        document.getElementById("txn-status").innerHTML = "Transactions HTTP status " + status + ", Error: check your Up API Key is correct and try again";
    }

    let lastTxnDesc = obj["data"][0]["attributes"]["description"];
    let lastTxnAmount = parseFloat(obj["data"][0]["attributes"]["amount"]["value"]);

    let p = document.createElement("p");
    let node = document.createTextNode("Your last transaction was from " + lastTxnDesc + " for $" + lastTxnAmount);
    p.appendChild(node);
    let element = document.getElementById("div1");
    element.appendChild(p); 
}