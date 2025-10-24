export function res402() {
  console.log('Unauthorized')
  BOchromeBlock.style.display = 'block'
  BOchromeBlock.innerHTML = `<div id="BOchromeBlockInner"><h1>Unauthorized</h1><span>Your 1 week trial might have ended or it's time to renew your yearly activation.<br/><br/>To activate your server URL go to the BrotherOps discord. And use the activate button in the <a href="https://discord.gg/k5bMNKePWX" target="_new">activation channel</a>.</span></div>`
  return 402
}
export function res409() {
  console.log('Unauthorized')
  BOchromeBlock.style.display = 'block'
  BOchromeBlock.innerHTML = `<div id="BOchromeBlockInner"><h1>409</h1><span>Your 1 week trial might have ended or it's time to renew your yearly activation.<br/><br/>To activate your server URL go to the BrotherOps discord. And use the activate button in the <a href="https://discord.gg/k5bMNKePWX" target="_new">activation channel</a>.</span></div>`
  return 402
}