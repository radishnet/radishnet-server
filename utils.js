export function log(message) {
    console.log(`${getCurrentTime()} ${message}`)
}

function getCurrentTime() {
    const date = new Date()
    const time = `${date.getHours().pad(2)}:${date.getMinutes().pad(2)}:${date.getSeconds().pad(2)}`
    return time
}

Number.prototype.pad = function(length) {
    return (new Array(length + 1).join("0") + this).slice(-length)
}
