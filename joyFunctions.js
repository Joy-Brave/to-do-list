function getDateFormat(date) {
    let year = date.getFullYear()
    let month = ('0' + (date.getMonth() + 1))
    month = month.substring(month.length - 2, month.length)
    let day = '0' + date.getDate()
    day = day.substring(day.length - 2, day.length)
    return year + '-' + month + '-' + day
}
function heavisideFunc(x) {
    return x >= 0 ? 1 : -1;
}

class GoogleSheetAPI {
    constructor(url) {
        this.url = url;
    }
    async getMyData(date) {
        const formatDate = getDateFormat(date);
        const urlGet = this.url + '?myDate=' + formatDate;
        return await fetch(urlGet, { method: 'GET' }).then(result => result.json())
    }
    async sendMyData(data) {
        console.log((JSON.stringify(
            data
        )))
        return await $.ajax({
            type: "post",
            url: url,
            data: encodeURI(JSON.stringify(
                data
            )),
            dataType: "JSON",
            success: function (response) {
                alert('資料傳送成功！')
            }
        });

        /*
        fetch(this.url, {
            method: 'POST',
            body: encodeURI(JSON.stringify(
                data
            )),
            
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }

        })
        */
    }

}

function getHourSecondFromStr(date) {
    extendedStr = ('0' + date);
    return extendedStr.substring(extendedStr.length - 5, extendedStr.length)
}
function getHourSecondFromTime(date) {
    let hour = ('0' + date.getHours());
    let miniute = ('0' + date.getMinutes());
    hour = hour.substring(hour.length - 2, hour.length);
    miniute = miniute.substring(miniute.length - 2, miniute.length);
    return hour + ':' + miniute
}




function touchHandler(event) {
    const touch = event.changedTouches[0];

    const simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent({
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup"
    }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);

    touch.target.dispatchEvent(simulatedEvent);
    //event.preventDefault();
}

function init() {
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);
}