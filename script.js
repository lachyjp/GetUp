//This API URL allows me to grab my accounts details
const accURL = "https://api.up.com.au/api/v1/accounts";
//This gets my transactions. It's a let because [size]= at the end of the URL lets me choose how many transactions I want to grab
let txnURL = "https://api.up.com.au/api/v1/transactions?page[size]=";
const httpAccStatus = ['acc-status-successful', 'acc-status-failed'];
const httpTxnStatus = ['txn-status-successful', 'txn-status-failed'];
const authStatus = ['auth-status-successful', 'auth-status-failed'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Lets me create transaction objects
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

//Create account objects
class Account {
    constructor(name, balance, type, owner) {
        this.name = name;
        this.balance = balance;
        this.type = type;
        this.owner = owner;
    }
}

//A reusable function I can use to add HTML anywhere, the parameters are: n
//NewMessage = "string of whatever i want", 
//type = the type of element e.g. "p" or "h1", 
//id = what element in my html (identified by css) will I manipulate e.g. "user-name" span id)
//e.g. use case: newTextNode(`Welcome, ${userName}!`, "h1", "user-name");
function newTextNode(newMessage, type , id) {
    let p = document.createElement(type);
    let node = document.createTextNode(newMessage);
    p.appendChild(node);
    let element = document.getElementById(id)
    element.appendChild(p);
};

//the same concept as above, but instead using .innerHTML to ADD an element with many lines e.g. an accordion. 
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
                            <span style="font-family: Circular-Black">Time received:</span> ${time} <br> <span style="font-family: Circular-Black">Status:</span> ${status} <br> <span style="font-family: Circular-Black"> Merchant details: </span> ${text} <br> <span style="font-family: Circular-Black"> Message: </span> ${message} <br> <span style="font-family: Circular-Black"> Round up: </span>${roundup}
                            </div>
                            </div>
                        </div> `;

    document.getElementById('activity').appendChild(accordion);
}

//Dialog popup to enter API key and # of transactions
function submitUpKey() {
    let upKey = document.getElementById("upKeyInput").value;
    let txnUserAmount = document.getElementById("txnUserAmountInput").value;
    let userName = document.getElementById("userNameInput").value;

    //if txnUserAmount is null, set to 3 for demo
    if (txnUserAmount == "") {
        txnUserAmount = 7;
    }

    getAcc(upKey);
    getTxn(upKey, txnUserAmount);
    newTextNode(`Welcome, ${userName}!`, "h1", "user-name");
    newTextNode(``, "br", "user-name");
};

//The actual API call for my accounts
//1. Grabs my accounts e.g. spending, savings etc. and its details
//2. Puts them into an array
//3. Creates a new text node for each account and pushes to 'accounts' span-ID in my HTML
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

        for (i = 0; i < 1; i++) {
            let accName = obj.data[i].attributes.displayName;
            let accValue = parseFloat(obj.data[i].attributes.balance.value);
            let accType = obj.data[i].attributes.accountType;
            let accOwner = obj.data[i].attributes.ownershipType;

            //new array
            accArray[i] = new Account(accName, accValue, accType, accOwner);
            account.push(accArray[i]);

            if (account[i].name == "Spending") {
                newTextNode(`Your 💸 ${account[i].name} balance is $${account[i].balance}`, "p", "accounts");
                newTextNode(``, "hr", "accounts");
            }
            else {
                newTextNode(`Your ${account[i].name} balance is $${account[i].balance}`, "p", "accounts");
                newTextNode(``, "hr", "accounts");
            }

            
            balanceTotal = balanceTotal + account[i].balance;
         };

        balanceTotal = balanceTotal.toFixed(2);

        document.getElementById("total-balance").innerHTML = `Total &#128175 balance: $${balanceTotal} <hr>`;

    } else {
        //ERROR
        response = await response.json();
        document.getElementById(httpAccStatus[1]).innerHTML = `${response.errors[0].status}: ${response.errors[0].title} - ${response.errors[0].detail}`
        console.log(response);
    };
};

//Same as above but for my transactions which has more details like descriptions, dates, times, etc.
//Except I use the addAccordion function I made instead 
async function getTxn(upKey, txnUserAmount) {
    let response = await fetch(txnURL + txnUserAmount, {
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
        for (i = 4; i < obj.data.length; i++) {
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

            for (y = 0; y < txn.length; y++) {
                if (txn[y].date == dates[i]) {     
                    addAccordion(txn[y].desc, txn[y].type, txn[y].val, txn[y].time, txn[y].status, txn[y].text, txn[y].msg, txn[y].roundup, y);   
                }
            }
            newTextNode(``, "br", "activity")
            newTextNode(``, "br", "activity")
        }   

    countTransactions(txn);
    countMerchants(txn);
    
    document.getElementById("thebutton").remove();
    } else {
        //ERROR
        response = await response.json();
        document.getElementById(httpTxnStatus[1]).innerHTML = `${response.errors[0].status}: ${response.errors[0].title} - ${response.errors[0].detail}`
        console.log(response);
    };
};

function removeDuplicates(dates) {
    return dates.filter((item,
        index) => dates.indexOf(item) === index);
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

    if (newTime > 12) {
        let pmTime = newTime - 12;
        shorterTime = pmTime + shorterTime.slice(2);
    }
    return shorterTime;
}

//calculate the sum of all transactions not including transactions with descriptions containing "Transfer" in them
function countTransactions(txn) {
    let sum = 0;
    for (i = 0; i < txn.length; i++) {
        if (txn[i].desc.includes("Transfer") == false) {
            sum = sum + txn[i].val;
        }
    }

    //calculate the total of all transactions that include a type of "+"
    let sumPlus = 0;
    for (i = 0; i < txn.length; i++) {
        if (txn[i].desc.includes("Transfer") == false && txn[i].type == "+") {
            sumPlus = sumPlus + txn[i].val;
        }
    }

    //minus sumPlus from sum   
    let sumMinus = sum - sumPlus;

    console.log(sum, sumPlus, sumMinus);

    //round sumMinus to 2 decimal places
    sumMinus = sumMinus.toFixed(2);

    //calculate the amount of days between the first and last transactions
    let firstDate = txn[0].date;
    let lastDate = txn[txn.length-1].date;
    let firstDateSplit = firstDate.split("-");
    let lastDateSplit = lastDate.split("-");
    let firstDateYear = firstDateSplit[0];
    let firstDateMonth = firstDateSplit[1];
    let firstDateDay = firstDateSplit[2];
    let lastDateYear = lastDateSplit[0];
    let lastDateMonth = lastDateSplit[1];
    let lastDateDay = lastDateSplit[2];
    let firstDateDate = new Date(firstDateYear, firstDateMonth, firstDateDay);
    let lastDateDate = new Date(lastDateYear, lastDateMonth, lastDateDay);
    let daysBetween = Math.round((lastDateDate - firstDateDate) / (1000 * 60 * 60 * 24));

    //calculate the average amount of transactions per day using sumMinus
    let average = sumMinus / daysBetween;

    //round average to 2 decimal places
    average = average.toFixed(2);
    //convert to positive number
    average = Math.abs(average);

    //convert daysBetween to a positive number
    daysBetween = Math.abs(daysBetween);

    newTextNode(`$${sumMinus} spent over the last ${daysBetween} days`, "p", "totalSpent")
    newTextNode(``, "hr", "totalSpent")

    newTextNode(`$${average} average spent per day`, "p", "totalSpent")
    newTextNode(``, "hr", "totalSpent")
}

//count the amount of unique merchants
//do not include merchants with a description of "Transfer from Spending" or "Transfer to Savings" or "Beem"
function countMerchants(txn) {
    let uniqueMerchants = [];
    for (i = 0; i < txn.length; i++) {
        if (txn[i].desc != "Transfer from Spending" && txn[i].desc != "Transfer to Savings" && txn[i].desc != "Beem") {
            uniqueMerchants.push(txn[i].text);
        }
    }
    let uniqueMerchantsCount = removeDuplicates(uniqueMerchants).length;
    newTextNode(`${uniqueMerchantsCount} unique merchants`, "p", "totalSpent")
    newTextNode(``, "hr", "totalSpent")
    newTextNode(``, "br", "totalSpent")
}