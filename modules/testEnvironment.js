module.exports = function testEnvironment(context) {
    return {
        events: [],
        log: context.log,

        domEvent(type,...params) {
            return new context.dom.window[type](...params);
        },

        queueEvent(event, mancer = false) {
            if (typeof event === "string") {
                event = {
                    eventname: event,
                    mancer: mancer,
                    oattr: "",
                    sourcetype: "player"
                };
            }
            events.push(event);
        },
        updateEvents(){
            for (i in events) {
                trigger(events[i]);
            }
            events = [];
        },
        triggerEvent(event, mancer=false) {
            if (typeof event === "string") {
                event = {
                    eventname: event,
                    mancer: mancer,
                    oattr: "",
                    sourcetype: "player"
                };
            }
            context.trigger(event);
        },
        addRepeatingSections(id = ""){
            context.document.querySelectorAll(".btn.repcontrol_add").forEach((element)=>{element.dispatchEvent(this.domEvent("MouseEvent","click"));});
        }
    };
}