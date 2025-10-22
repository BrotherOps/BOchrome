var token = "g0ptb6k6l5rjgaebcbfnq0xi4wx9ytxur-01vcw030xczpy5e0mgrip1crm5s1a3ah2b"
var botURL = "http://prem-eu1.bot-hosting.net:22412"

console.log("BOchrome has been turned ON!")
var currentState = 'ON'; // default
// Listen for state updates from background.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'STATE_UPDATE') {
    currentState = message.state;
    //console.log(message.state);
    // Delete BOchromeOverlay when turned off
    if(currentState === 'OFF') {
      const BOchromeWrapper = document.getElementById("BOchromeWrapper");
      BOchromeWrapper.remove();
    }
  }
});

// Only execute when plugin is enabled
if(currentState === 'ON') {
  // Add BOchromeWrapper
  var BOchromeWrapper = document.createElement('div');
  BOchromeWrapper.id = "BOchromeWrapper";
  document.body.appendChild(BOchromeWrapper);
  // Add BOchrome MenuBtn 
  var BOchromeMenuBtn = document.createElement('div');
  BOchromeMenuBtn.id = "BOchromeMenuBtn";
  BOchromeWrapper.appendChild(BOchromeMenuBtn);
  // Add BOchrome Overlay
  var BOchromeOverlay = document.createElement('div');
  BOchromeOverlay.id = "BOchromeOverlay";
  BOchromeOverlay.innerHTML = `<div id="BOchromeOverInner">BOchrome Menu</div>`;
  BOchromeWrapper.appendChild(BOchromeOverlay);
  // Add BOchrome OverStay
  var BOchromeOverStay = document.createElement('div');
  BOchromeOverStay.id = "BOchromeOverStay";
  BOchromeOverStay.innerHTML = `<div id="BOchromeOverStayInner"></div>`;
  BOchromeWrapper.appendChild(BOchromeOverStay);

  // Add BOchromeBlock
  var BOchromeBlock = document.createElement('div');
  BOchromeBlock.id = "BOchromeBlock";
  document.body.appendChild(BOchromeBlock);
  // CHECK activation and get all data
  fetch(`${botURL}/api/r3e/`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({token: token})
  })
    .then((response) => {
      if(response.status === 402) {
        console.log('Unauthorized')
        BOchromeBlock.style.display = 'block'
        BOchromeBlock.innerHTML = `<div id="BOchromeBlockInner"><h1>Unauthorized</h1><span>Your 1 week trial might have ended or it's time to renew your yearly activation.<br/><br/>To activate your server URL go to the BrotherOps discord. And use the activate button in the <a href="https://discord.gg/k5bMNKePWX" target="_new">activation channel</a>.</span></div>`;
        return 402
      } else if(response.status === 401) {
        console.log('Unauthorized')
        BOchromeBlock.style.display = 'block'
        BOchromeBlock.innerHTML = `<div id="BOchromeBlockInner"><h1>Unauthorized</h1><span>Invalid token.</span></div>`;
        return 401
      } else {
        return response.json();
      }
    })
    .then((data) => {
      if(data === 402) {
        console.log(402)
      } else if(data === 401) {
        console.log(401)
      } else {
        // ALLOWED ACCESS
        const settingsData = data[0]
        console.log(settingsData)

        // Click Events
        document.addEventListener("click", async (event) => {
          if(currentState === 'ON') {
            console.log(`Clicked element while state is ${currentState}`, event.target);
          
            if(event.target.id === 'BOchromeMenuBtn') {
              BOchromeOverlay.style.display = 'block'
            }
            if(event.target.id === 'BOchromeOverlay') {
              BOchromeOverlay.style.display = 'none'
            }
            if(event.target.getAttribute('name') === 'setReason') {
              if (event.target.checked) {
                document.getElementById("marshalReport").value = document.getElementById("marshalReport").value + event.target.value + `, `
              } else {
                let marshalReportVal = document.getElementById("marshalReport").value
                const newReportVal = marshalReportVal.replace(`${event.target.value}, `, "")
                document.getElementById("marshalReport").value = newReportVal
              }
            }
            if(event.target.classList.contains("kick-user")) { 
              const reactid = event.target.getAttribute("data-reactid")
              const search = reactid.match(/\$[^$]*\$(\d+)\./);
              const driverId = search ? search[1] : null;
              var userData = await fetch(`https://game.raceroom.com/utils/user-info/${driverId}`, {
                method: 'GET'
              }).then((R3Eresponse) => {
                if (!R3Eresponse.ok) {
                  //alert(`HTTP error! Status: ${R3Eresponse.status}`);
                  errorHandling(`HTTP error! Status: ${R3Eresponse.status}<br/>`);
                  console.log(R3Eresponse);
                }
                return R3Eresponse.json();
              }).then(function(R3Edata) {
                return R3Edata;
              });
              playerDataFullname = await userData.name;
              BOchromeOverStay.style.display = "block"
              BOchromeOverStay.innerHTML = `
                <div id="BOchromeOverStayInner">
                  <h1>Marshal report</h1>
                  <div id="kickBanSetEle">
                    <label><input type="checkbox" name="setReason" value="Bad language">Bad language</label> <label><input type="checkbox" name="setReason" value="Ramming">Ramming</label> <label><input type="checkbox" name="setReason" value="Standing still">Standing still</label> <label><input type="checkbox" name="setReason" value="Wrong way">Wrong way</label> <label><input type="checkbox" name="setReason" value="Invisible not responding">Invisible</label> <label><input type="checkbox" name="setReason" value="Unsafe rejoin">Unsafe rejoin</label> <label><input type="checkbox" name="setReason" value="Blocking">Blocking</label> <label><input type="checkbox" name="setReason" value="Drifting">Drifting</label><label><input type="checkbox" name="setReason" value="Burn out">Burn out</label> <label><input type="checkbox" name="setReason" value="Change name not responding">Change name</label>
                  </div>
                  <textarea id="marshalReport" name="textarea" rows="5" placeholder="Give your reason and feedback."></textarea>
                  <button class="sendReport" data-driverid="${driverId}" data-drivername="${playerDataFullname}">Send report</button>
                </div>
              `;
            }
            if(event.target.classList.contains("sendReport")) { 
              const driverid = event.target.getAttribute("data-driverid")
              const drivername = event.target.getAttribute("data-drivername")
              let marshalReportVal = document.getElementById("marshalReport").value
              
              fetch(`${botURL}/api/r3e/kick`, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({token: token, driverId: driverid, msg: `**${drivername}** `, report: marshalReportVal})
              }).then((response) => {
                console.log(response.status)
                if(response.status === 401) {
                  alert('401 Failed!')
                  return 401
                } else if(response.status === 200) {
                  alert('Kick submitted')
                  return 200
                } else {
                  return response.json();
                }
              }).then((data) => {
                if(data === 200) {
                  console.log(200)
                } else if(data === 401) {
                  console.log(401)
                } else {
                  const settingsData = data[0]
                  console.log(settingsData)
                }
              })
              // reset report field and OverStay
              document.getElementById("marshalReport").value = ""
              BOchromeOverStay.style.display = "none"
            }
          }
        });
      }
    })

}