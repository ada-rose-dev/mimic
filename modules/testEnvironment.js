//console.log("loading test environment");
self.mimic = {
    events: [],

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
        trigger(event);
    },
    addRepeatingSections(id = ""){
        document.querySelectorAll(".btn.repcontrol_add").forEach((element)=>{element.dispatchEvent(new MouseEvent("clicked"));});
    }
}