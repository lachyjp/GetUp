const accURL = "https://api.up.com.au/api/v1/accounts";
const txnURL = "https://api.up.com.au/api/v1/transactions";

function submitUpKey() {
    var upKey = document.getElementById("upKeyInput").value;
    getUp(upKey);
    getTxn(upKey);
}

function newTextNode(newMessage, type , id) {
    let p = document.createElement(type);
    let node = document.createTextNode(newMessage);
    p.appendChild(node);
    let element = document.getElementById(id);
    element.appendChild(p); 
}

function checkStatus(status, id) {
    if (status == 200) {
        document.getElementById(id).innerHTML = status + ": Successful response!";
    } else if (status == 400) {
        document.getElementById(id).innerHTML = status + ": Bad request - Typically a problem with the query string or an encoding error";
    }  else if (status == 401) {
        document.getElementById(id).innerHTML = status + ": Request not authenticated - ensure API key is correct.";
    }  else if (status == 404) {
        document.getElementById(id).innerHTML = status + ": Not found - Either the endpoint does not exist, or the requested resource does not exist.";
    }  else if (status == 422) {
        document.getElementById(id).innerHTML = status + ": Invalid request - The request contains invalid data and was not processed.";
    }  else if (status == 429) {
        document.getElementById(id).innerHTML = status + ": Too many requests - You have been rate limited—try later, ideally with exponential backoff.";
    }  else if (status =+ 500) {
        document.getElementById(id).innerHTML = status + ": Server-side error - try again later.";
    }
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
    let id = "";
    
    if (status == 200) {
        id = "acc-status-successful";
    } else {
        id = "acc-status-failed";
    }
    
    //CONFIRMING SUCCESSFUL REQUEST
    checkStatus(status, id);

    let balances = [];
    let accounts = [];
    let total = 0;
    let arrayLength = obj["data"].length;

    for (i = 0; i < arrayLength; i++) {
        balances.push(parseFloat(obj["data"][i]["attributes"]["balance"]["value"]));
        accounts.push(obj["data"][i]["attributes"]["displayName"])
        total = total + balances[i];

        //ADDING EACH ACCOUNT IN HTML
        newTextNode(`Your ${accounts[i]} balance is $${balances[i]}`, "p", "accounts");
    }

    document.getElementById("total-balance").innerHTML = "Your total balance: $" + total;
    console.log(obj);
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
    let id = "";
    
    if (status == 200) {
        id = "txn-status-successful";
    } else {
        id = "txn-status-failed";
    }

    checkStatus(status, id);

    let txnDesc = [];
    let txnAmount = [];

    for (i = 0; i < 10; i++) {
        txnDesc.push(obj["data"][i]["attributes"]["description"]);
        txnAmount.push(parseFloat(obj["data"][i]["attributes"]["amount"]["value"]));

        newTextNode(`${txnDesc[i]} for $${txnAmount[i]}`, "p", "activity");
    }

    console.log(obj);
}