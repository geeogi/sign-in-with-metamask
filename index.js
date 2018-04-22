
var sigUtil = require('eth-sig-util')
var Eth = require('ethjs')
window.Eth = Eth

////////Check if the user has Web3, set web3 provider and report web3 status//////

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
  console.log("You've got Web3");
  //If there's web3, make sure it's not locked
  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
    console.log(error);
    }
    else {
      if (accounts.length == 0){ //account is locked
      console.log("Your Web3 is locked");
      document.getElementById("user").innerHTML = "Please unlock MetaMask";
      }
      else {
        console.log("Your Web3 is unlocked");
        console.log("Your address is: " + accounts[0]);
        document.getElementById("user").innerHTML = "Your address is: " + accounts[0];
        account = accounts[0]
        GetBalance(account);
        web3.version.getNetwork(function(err, netId) { //check if testnet or mainnet
  switch (netId) {
    case "1":
      console.log("You're connected to Mainnet.");
      break
    case "2":
      console.log("You're connected to a testnet.");
      break
    case "3":
      console.log("You're connected to Ropsten.");
      break
    case "4":
      console.log("You're connected to a testnet.");
      break
    case "42":
      console.log("You're connected to a testnet.");
      break
    default:
      console.log("You're connected to a testnet.");
  }
})
      
    
      }
    }
  })

} else { // Else, if there's no web3, ask user to get web3 (Iphone/android/desktop each get a different message)
        console.log("You don't have Web3");
        document.getElementById("user").innerHTML = "You'll need MetaMask to sign-in here";  
   }

///////////////////////Get the balance of an ETH address////

function GetBalance(address) {
    var url =  "https://api.etherscan.io/" + "api?module=account&action=balance&address=" + address + "&tag=latest&apikey=K8BKKCIBTPMY9DT8RIXETN3VWHNE2DAGH7";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        console.log("Your balance on Mainnet is: " + round(WeiToEth(JSON.parse(xmlHttp.responseText).result),5));
        }
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
} 

////////utility functions////////

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function WeiToEth(wei) {
  return wei*0.000000000000000001;
}

////////////// Sign-in function /////////////


ethjsSignTypedDataButton.addEventListener('click', function(event) {
  event.preventDefault()

  const msgParams = [
    {
      type: 'string',
      name: 'Message',
      value: 'Hi, user! Please sign this message so that we can verify you have the private key to this address'
    },
    {
      type: 'uint32',
      name: 'A random nonce to prevent this signed message being used twice', //User needs to sign different data each time they log-in, otherwise their signed message could be copied and used a second time by a hacker. This one-time-only-number should be generated in the back-end. The back-end will need to check that the correct nonce was signed. 
      value: '1337'
    }
  ]

  var from = web3.eth.accounts[0]

  console.log('CLICKED, Sending personal sign request')
  var params = [msgParams, from]

  var eth = new Eth(web3.currentProvider)

  eth.signTypedData(msgParams, from)
  .then((signed) => {
    console.log('Signed!  Result is: ', signed)
    document.getElementById("1").innerHTML = "Your signed message: " + signed;
    console.log('Recovering...')

    //This signed data should then be sent to the back-end for verification. Doing it all in browser here for demo.  

    const recovered = sigUtil.recoverTypedSignature({ data: msgParams, sig: signed })

    if (recovered === from ) {
      console.log('Successfully ecRecovered signer as ' + from);
      console.log('We can now send the user a token to keep them logged into this session');
      document.getElementById("user").innerHTML = "You've logged in successfully as " + from;
      
    } else {
      console.log('Failed to verify signer when comparing ' + signed + ' to ' + from)
      
    }

  })
})
