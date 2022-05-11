const accURL = "https://api.up.com.au/api/v1/accounts";
const txnURL = "https://api.up.com.au/api/v1/transactions";
const httpAccStatus = ['acc-status-successful', 'acc-status-failed'];
const httpTxnStatus = ['txn-status-successful', 'txn-status-failed'];
const authStatus = ['auth-status-successful', 'auth-status-failed'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

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
        var balanceTotal = 0;
        var account = [];
        var accArray = [];

        for (i = 0; i < obj.data.length; i++) {
            let accName = obj.data[i].attributes.displayName;
            let accValue = parseFloat(obj.data[i].attributes.balance.value);
            let accType = obj.data[i].attributes.accountType;
            let accOwner = obj.data[i].attributes.ownershipType;

            //new array
            accArray[i] = new Account(accName, accValue, accType, accOwner);
            account.push(accArray[i]);

            newTextNode(`Your ${account[i].name} balance is $${account[i].balance}, account type is ${account[i].type} and owned by ${account[i].owner}`, "p", "accounts");
            balanceTotal = balanceTotal + account[i].balance;
         };

        balanceTotal = balanceTotal.toFixed(2);

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
        var txnArray = [];

        //ADD TRANSACTIONS
        for (i = 0; i < obj.data.length; i++) {
            let txnDesc = obj.data[i].attributes.description;
            let txnValType = "";
            let txnVal = parseFloat(obj.data[i].attributes.amount.value);
            let txnStatus = obj.data[i].attributes.status;
            let txnRawDate =  obj.data[i].attributes.createdAt;
            let txnRawText = obj.data[i].attributes.rawText;
            let txnMessage = obj.data[i].attributes.message;
            let txnRoundUp = obj.data[i].attributes.roundUp;

            let dateTime = formatDate(txnRawDate);
            let txnDate = dateTime[0];
            let txnTime = formatTime(dateTime[1]);
            

            //Formatting data
            if (txnVal < 0) {
                txnVal = txnVal * -1;
                txnValType = "";
            }
            else {
                txnValType = "+";
            };
            if (txnRawText == null) {
                txnRawText = "N/A";
            };
            if (txnMessage == null) {
                txnMessage = "N/A";
            };
            if (txnRoundUp == null) {
                txnRoundUp = "false";
            };

            //Push transactions as objects
            txnArray[i] = new Transaction(txnDesc, txnValType, txnVal, txnStatus, txnDate, txnTime, txnRawText, txnMessage, txnRoundUp);
            txn.push(txnArray[i])
        };

        //Creating dates
        var dates = [];
        for (i = 0; i < txn.length; i++) {
            dates.push(txn[i].date);
        }
        dates = removeDuplicates(dates);
        console.log(dates);

        //Converting date to long date
        let newDate = []
        for (i = 0; i < dates.length; i++) {
            let dateSplit = dates[i].split("-");
            let dayFloat = parseFloat(dateSplit[2]);

            let monthFloat = parseFloat(dateSplit[1]);

            monthFloat = months[monthFloat-1];
            newDate.push(`${dayFloat} ${monthFloat}`)
        }

        //Print transactions
        for (i = 0; i < dates.length; i++) {
            newTextNode(`${newDate[i]}`, "h4", "activity")

            for (y = 0; y < 20; y++) {
                if (txn[y].date == dates[i]) {     
                    addAccordion(txn[y].desc, txn[y].type, txn[y].val, txn[y].time, txn[y].status, txn[y].text, txn[y].msg, txn[y].roundup, y);   
                }
            }
            newTextNode(``, "br", "activity")
            newTextNode(``, "br", "activity")
        }
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

function removeDuplicates(dates) {
    return dates.filter((item,
        index) => dates.indexOf(item) === index);
}

function Transaction (description, type, value, status, date, time, text, message, roundup) {
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

function Account (name, balance, type, owner) {
    this.name = name;
    this.balance = balance;
    this.type = type;
    this.owner = owner;
}

function formatDate(time) {
    let splitTimeDate = time.split("T")
    return splitTimeDate;
}

function formatTime(time) {
    let shortTime = time.split("+")
    let shorterTime = shortTime[0].slice(0,5)

    if (shorterTime.charAt(0) == "0") {
        shorterTime = shorterTime.slice(1,5);
    }
    
    let newTime = parseFloat(shorterTime.slice(0,2))

    if (newTime < 12) {
        shorterTime = shorterTime + "am"
    }
    else {
        shorterTime = shorterTime + "pm"
    }

    if (newTime > 13) {
        let pmTime = newTime - 12;
        console.log(pmTime);
        shorterTime = pmTime + shorterTime.slice(2);
    }

    return shorterTime;
}

////////////////
function addAccordion(desc, type, val, time, status, text, message, roundup, count) {
    var accordion = document.createElement('div');
    accordion.className = 'panel-group';
    accordion.id = 'accordion';

    accordion.innerHTML = `<div class="accordion-item">
                            <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${count}">
                                ${desc} / ${type}$${val}         
                            </button>
                            </h2>
                            <div id="collapse${count}" class="accordion-collapse collapse">
                            <div class="accordion-body">
                            Time received: ${time} <br> Status: ${status} <br> Merchant details: ${text} <br> Message: ${message} <br> Round up?: ${roundup}
                            </div>
                            </div>
                        </div> `;

    document.getElementById('activity').appendChild(accordion);
}