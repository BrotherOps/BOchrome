var token = `-`
var persToken = `-`
var botURL = "http://prem-eu1.bot-hosting.net:22412"
var version = `0.1.3`

// tokens system
chrome.storage.local.get('communityToken', function(result){
  if(Object.keys(result).length === 0) {
    chrome.storage.local.set({"communityToken": "-"}, function(){
      // Insert new communityToken success
    })
    chrome.storage.local.set({"personalToken": "-"}, function(){
      // Insert new personalToken success
    })
    init()
  } else {
    // get data
    token = result.communityToken
    chrome.storage.local.get('personalToken', function(perRes){
      if(Object.keys(perRes).length === 0) {
        chrome.storage.local.set({"personalToken": "-"}, function(){
          // Insert new personalToken success
        })
        init()
      } else {
        // get data
        persToken = perRes.personalToken
        init()
      }
    })
  }
})
// tokens system


console.log("BOchrome has been turned ON!")
var currentState = 'ON' // default
// Listen for state updates from background.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'STATE_UPDATE') {
    currentState = message.state
    //console.log(message.state)
    // Delete BOchromeOverlay when turned off
    if(currentState === 'OFF') {
      const BOchromeWrapper = document.getElementById("BOchromeWrapper")
      BOchromeWrapper.remove()

      document.querySelectorAll('.warn-user').forEach(function(el) {
        el.style.display = 'none'
      })
    }
  }
})

// Only execute when plugin is enabled
if(currentState === 'ON') {
  // Add BOchromeWrapper
  var BOchromeWrapper = document.createElement('div')
  BOchromeWrapper.id = "BOchromeWrapper"
  document.body.appendChild(BOchromeWrapper)
  // Add BOchrome MenuBtn 
  var BOchromeMenuBtn = document.createElement('div')
  BOchromeMenuBtn.id = "BOchromeMenuBtn"
  BOchromeMenuBtn.innerHTML = `v ${version}`
  BOchromeWrapper.appendChild(BOchromeMenuBtn)
  // Add BOchrome Overlay
  var BOchromeOverlay = document.createElement('div')
  BOchromeOverlay.id = "BOchromeOverlay"
  BOchromeOverlay.innerHTML = `<div id="BOchromeOverInner">BOchrome Menu</div>`
  BOchromeWrapper.appendChild(BOchromeOverlay)
  // Add BOchrome OverStay
  var BOchromeOverStay = document.createElement('div')
  BOchromeOverStay.id = "BOchromeOverStay"
  BOchromeOverStay.innerHTML = `<div id="BOchromeOverStayInner"></div>`
  BOchromeWrapper.appendChild(BOchromeOverStay)

  // Add BOchromeBlock
  var BOchromeBlock = document.createElement('div')
  BOchromeBlock.id = "BOchromeBlock"
  document.body.appendChild(BOchromeBlock)
  // init
  function init() {
  // CHECK activation and get all data
  fetch(`${botURL}/api/r3e/`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({token: token, perstoken: persToken})
  })
    .then((response) => {
      if(response.status === 402) {
        console.log('Unauthorized')
        BOchromeBlock.style.display = 'block'
        BOchromeBlock.innerHTML = `<div id="BOchromeBlockInner"><h1>Unauthorized</h1><span>Your 1 week trial might have ended or it's time to renew your yearly activation.<br/><br/>To activate your server URL go to the BrotherOps discord. And use the activate button in the <a href="https://discord.gg/k5bMNKePWX" target="_new">activation channel</a>.</span></div>`
        return 402
      } else if(response.status === 401) {
        console.log('Unauthorized')
        if(token === `-`) {
          var insertToken = ``
        } else {
          var insertToken = token
        }
        if(persToken === `-`) {
          var insertPersToken = ``
        } else {
          var insertPersToken = persToken
        }
        BOchromeBlock.style.display = 'block'
        BOchromeBlock.innerHTML = `
          <div id="BOchromeBlockInner">
            <h1>Unauthorized</h1><span>Invalid token.</span><br/>
            <form id="submitTokens">
            <input type="text" id="community" name="community" placeholder="Community token:" value="${insertToken}" required />
            <input type="text" id="personal" name="personal" placeholder="Personal token:" value="${insertPersToken}" required />
            <button type="submit">ENTER</button>
            </form>
          </div>`
        document.getElementById("submitTokens").addEventListener("submit", function(evt) {
          evt.preventDefault()
          var formData = new FormData(evt.target)
          // output as an object
          getData = Object.fromEntries(formData)
          chrome.storage.local.set({"communityToken": getData.community}, function(){
            // Insert new communityToken success
          })
          chrome.storage.local.set({"personalToken": getData.personal}, function(){
            // Insert new personalToken success
          })
        })
        return 401
      } else {
        return response.json()
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

        function getProcessId(inputString) {
          const search = inputString.match(/\$(\d+).*?\$(\d+)\./)
          const processId = search ? search[1] : null
          return processId
        }
        function getDriverId(inputString) {
          const search = inputString.match(/\$(\d+).*?\$(\d+)\./)
          const driverId = search ? search[2] : null
          return driverId
        }
        async function getDriverName(driverId) {
          var userData = await fetch(`https://game.raceroom.com/utils/user-info/${driverId}`, {
            method: 'GET'
          }).then((R3Eresponse) => {
            if (!R3Eresponse.ok) {
              //alert(`HTTP error! Status: ${R3Eresponse.status}`)
              errorHandling(`HTTP error! Status: ${R3Eresponse.status}<br/>`)
              console.log(R3Eresponse)
            }
            return R3Eresponse.json()
          }).then(function(R3Edata) {
            return R3Edata
          })
          playerDataFullname = await userData.name
          return playerDataFullname
        }
        function sendChat(processId, message) {
          fetch(`/chat/${processId}/admin/`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({Message: message})
          })
        }
        function changeuserlist() {
          if(currentState === 'ON') {
            document.querySelectorAll('.warn-user').forEach(function(el) {
              el.style.display = 'block'
            })
            var uidElements = document.getElementsByClassName("user-id")
            Array.from(uidElements).forEach(async (uidEl) => {
              // Do stuff here
              const getinfo = uidEl.getAttribute("data-reactid")
              const processId = getProcessId(getinfo)
              const driverId = getDriverId(getinfo)

              uidEl.innerHTML = `(<a href="https://game.raceroom.com/users/${driverId}" target="_new">${driverId}</a>)`
            })
            var metaElements = document.getElementsByClassName("meta")
            Array.from(metaElements).forEach(async (metaEl) => {
              // Do stuff here
              const getinfo = metaEl.getAttribute("data-reactid")
              metaEl.style.color = "#F00"
              const processId = getProcessId(getinfo)
              const driverId = getDriverId(getinfo)

              var warnBtn = document.createElement('div')
              warnBtn.classList.add("warn-user")
              warnBtn.innerHTML = 'Warn'
              warnBtn.setAttribute('data-processid', processId)
              warnBtn.setAttribute('data-driverid', driverId)
              if(metaEl.querySelector('.warn-user') === null) {
                metaEl.appendChild(warnBtn)
                //console.log(getinfo)
              }
            })
          }
        }
        changeuserlist()
        window.setInterval(changeuserlist, 3000)

        // Click Events
        if (!window.BOCHROME_LOADED) {
          window.BOCHROME_LOADED = true
        document.addEventListener("click", async (event) => {
          if(currentState === 'ON') {
            console.log(`Clicked element while state is ${currentState}`, event.target)
          
            if(event.target.id === 'BOchromeMenuBtn') {
              BOchromeOverlay.style.display = 'block'
              BOchromeOverlay.innerHTML = `<div id="BOchromeOverInner">MENU</div>`
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
            if(event.target.getAttribute('name') === 'warnthem') {
              if (event.target.checked) {
                const drivername = document.getElementById("sendWarn").getAttribute("data-drivername")
                document.getElementById("warningField").value = `🏳️${drivername}, ${event.target.value}`
              }
            }
            if(event.target.classList.contains("warn-user")) { 
              const processId = event.target.getAttribute("data-processid")
              const driverId = event.target.getAttribute("data-driverid")
              playerDataFullname = await getDriverName(driverId)

              BOchromeOverlay.style.display = "block"
              BOchromeOverlay.innerHTML = `
                <div id="BOchromeOverInner">
                  <h1>Warning</h1>
                  <div id="warnSetEle">
                    <label><input type="radio" name="warnthem" value="read the rules and tips on our discord or we give you time to read them.">Read rules</label> <label><input type="radio" name="warnthem" value="watch the language please.">Bad language</label> <label><input type="radio" name="warnthem" value="stop hitting others. Faster drivers need to overtake SAFELY (Do not hit others).">Ramming</label> <label><input type="radio" name="warnthem" value="do not stand still on track.">Standing still</label><br/><label><input type="radio" name="warnthem" value="stop driving the wrong way.">Wrong way</label> <label><input type="radio" name="warnthem" value="you are invisible hold ESC and respawn.">Invisible</label> <label><input type="radio" name="warnthem" value="you need to rejoin the track SAFELY. Please check our discord for some tips.">Unsafe rejoin</label> <label><input type="radio" name="warnthem" value="stop blocking other drivers.">Blocking</label> <label><input type="radio" name="warnthem" value="drifting is not allowed.">Drifting</label><br/><label><input type="radio" name="warnthem" value="stop the burn out and read the rules.">Burn out</label> <label><input type="radio" name="warnthem" value="go change your name. It is too long or inappropriate.">Change name</label> <label><input type="radio" name="warnthem" value="no crashing, wrecking, ramming, dive bombing, blocking, waving, driving wrong way, drifting or doing burn-outs.">#1</label> <label><input type="radio" name="warnthem" value="no stopping on or next to the track. Hold ESC key to return to the garage.">#2</label> <label><input type="radio" name="warnthem" value="faster drivers must overtake safely. Slower cars do not have to get out of the way.">#3</label> <label><input type="radio" name="warnthem" value="if you went off track, you must rejoin safely.">#4</label> <label><input type="radio" name="warnthem" value="when exiting the pitlane, keep to the side and let the cars that are already on track pass.">#5</label> <label><input type="radio" name="warnthem" value="no toxic language. Respect all drivers, regardless of skill level.">#6</label> <label><input type="radio" name="warnthem" value="type @report name reason in the game chat to notify the staff of any misbehavior.">#7</label>
                  </div>
                  <textarea id="warningField" name="textarea" rows="5" placeholder="Give your reason and feedback.">🏳️${playerDataFullname}, </textarea>
                  <button id="sendWarn" data-processid="${processId}" data-driverid="${driverId}" data-drivername="${playerDataFullname}">Send Warning</button>
                </div>
              `
            }
            if(event.target.id === 'sendWarn') {
              const processid = event.target.getAttribute("data-processid")
              const message = document.getElementById("warningField").value
              sendChat(processid, message)
              BOchromeOverlay.style.display = 'none'
            }
            // KICK
            if(event.target.classList.contains("kick-user")) { 
              const reactid = event.target.getAttribute("data-reactid")
              const processId = getProcessId(reactid)
              const driverId = getDriverId(reactid)

              playerDataFullname = await getDriverName(driverId)
              BOchromeOverStay.style.display = "block"
              BOchromeOverStay.innerHTML = `
                <div id="BOchromeOverStayInner">
                  <h1>Marshal report</h1>
                  <div id="kickBanSetEle">
                    <label><input type="checkbox" name="setReason" value="Bad language">Bad language</label> <label><input type="checkbox" name="setReason" value="Ramming">Ramming</label> <label><input type="checkbox" name="setReason" value="Standing still">Standing still</label> <label><input type="checkbox" name="setReason" value="Wrong way">Wrong way</label> <label><input type="checkbox" name="setReason" value="Invisible not responding">Invisible</label> <label><input type="checkbox" name="setReason" value="Unsafe rejoin">Unsafe rejoin</label> <label><input type="checkbox" name="setReason" value="Blocking">Blocking</label> <label><input type="checkbox" name="setReason" value="Drifting">Drifting</label><label><input type="checkbox" name="setReason" value="Burn out">Burn out</label> <label><input type="checkbox" name="setReason" value="Change name not responding">Change name</label>
                  </div>
                  <textarea id="marshalReport" name="textarea" rows="5" placeholder="Give your reason and feedback."></textarea>
                  <button class="sendReport" data-kickban="KICK" data-processid="${processId}" data-driverid="${driverId}" data-drivername="${playerDataFullname}">Send report</button>
                </div>
              `
            }
            if(event.target.classList.contains("sendReport")) { 
              const processid = event.target.getAttribute("data-processid")
              const driverid = event.target.getAttribute("data-driverid")
              const drivername = event.target.getAttribute("data-drivername")
              const kickban = event.target.getAttribute("data-kickban")
              var kbText = (kickban === 'BAN') ? 'banned' : 'kicked'
              let marshalReportVal = document.getElementById("marshalReport").value
              marshalReportVal = marshalReportVal.replace(/\,$/, '')
              sendChat(processid, `${drivername} got ${kbText} for ${marshalReportVal} 🏴`)
              
              fetch(`${botURL}/api/r3e/kick`, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({token: token, driverId: driverid, kickban: kickban, msg: `**${drivername}** `, report: marshalReportVal})
              }).then((response) => {
                console.log(response.status)
                if(response.status === 401) {
                  alert('401 Failed!')
                  return 401
                } else if(response.status === 200) {
                  alert('Kick submitted')
                  return 200
                } else {
                  return response.json()
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
            // BAN
            if(event.target.classList.contains("ban-user")) { 
              const reactid = event.target.getAttribute("data-reactid")
              const processId = getProcessId(reactid)
              const driverId = getDriverId(reactid)

              playerDataFullname = await getDriverName(driverId)
              BOchromeOverStay.style.display = "block"
              BOchromeOverStay.innerHTML = `
                <div id="BOchromeOverStayInner">
                  <h1>Marshal report</h1>
                  <div id="kickBanSetEle">
                    <label><input type="checkbox" name="setReason" value="Bad language">Bad language</label> <label><input type="checkbox" name="setReason" value="Ramming">Ramming</label> <label><input type="checkbox" name="setReason" value="Standing still">Standing still</label> <label><input type="checkbox" name="setReason" value="Wrong way">Wrong way</label> <label><input type="checkbox" name="setReason" value="Invisible not responding">Invisible</label> <label><input type="checkbox" name="setReason" value="Unsafe rejoin">Unsafe rejoin</label> <label><input type="checkbox" name="setReason" value="Blocking">Blocking</label> <label><input type="checkbox" name="setReason" value="Drifting">Drifting</label><label><input type="checkbox" name="setReason" value="Burn out">Burn out</label> <label><input type="checkbox" name="setReason" value="Change name not responding">Change name</label>
                  </div>
                  <textarea id="marshalReport" name="textarea" rows="5" placeholder="Give your reason and feedback."></textarea>
                  <button class="sendReport" data-kickban="BAN" data-processid="${processId}" data-driverid="${driverId}" data-drivername="${playerDataFullname}">Send report</button>
                </div>
              `
            }
          }
        })
        }
      }
    })
  } // init

}