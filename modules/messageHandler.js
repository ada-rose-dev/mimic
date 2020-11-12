//- class defs
"use strict"
class repeatingSection {
    constructor(id, element, attrs = {}) {
        this.id = id;                       
        this.element = element;
        this.attrs = attrs || getElementAttrs(element,this.attrs);
    }
}
class repeatingData {
    constructor(id, fieldset, repcontainer, repsecs = []) {
        this.id = id;                       //string
        this.fieldset = fieldset;           //element
        this.repcontainer = repcontainer;   //element
        this.repsecs = repsecs;             //array of respec's
    }
}

//-- Message Handling
const comp = {};
const attrs = {};
const repeatingSections = [];
const mancer = {
    active: false,
    current_page: "",
    pages: {}
};
const verbose = false;

const handler = {
    act: (mimic, message, request, triggerevents) => {
        if (mimic.mancer.active) {
            if (message.name = "act_finish") {
                message.mancer = "finish";
                mancer.current_page = "final";
            }
            if (message.name = "act_cancel") {
                message.mancer = "cancel";
            }
        }
        triggerevents.push(message);

        return {request: request, triggerevents: triggerevents};
    },
    startcharactermancer: (mimic, message, request, triggerevents) => {
        //load charmancer pages
        mimic.document.querySelectorAll("charmancer[class*=sheet-charmancer-").forEach((node)=>{
            let name = node.className.match(/sheet-charmancer-([^\s]+)/)[1];
            mancer.pages[name] = {data: {}, values: {}};
            //mancer.pages[name].getNode = ()=>{return contextobj.document.querySelectorAll("charmancer [name=sheet-charmancer-"+name+'-')};
        });

        let page = "";
        for (let i in mimic.mancer.pages) {
            if (message.data == i) {page = i; break;}
        }
        if (!page) {
            console.warn("mancer error: page \"",message.data,"\" not found!");
            return {request: request, triggerevents: triggerevents};
        }

        mimic.mancer.active = true;
        mimic.mancer.current_page = message.data;

        triggerevents.push({
            sourceSection: message.sourceSection || '',
            oattr: message.oattr || '',
            eventname: page,
            sourcetype: "worker"
        });
        return {request: request, triggerevents: triggerevents};
    },
    finishcharactermancer: (mimic, message, request, triggerevents) => {
        triggerevents.push({
            sourceSection: message.sourceSection || '',
            oattr: message.oattr || '',
            sourcetype: "worker",
            mancer: "finish",
            eventname: message.data || "",
            data: mancer.pages
        })
        mimic.mancer.current_page = "final";
        mimic.mancer.active = false;
        delete mimic.mancer.pages;
        return {request: request, triggerevents: triggerevents};
    },
    getcompendiumpage: (mimic, message, request, triggerevents)=> {
        if (comp) {
            let arr = message.data;
            if (typeof(message.data) == "string") {
                arr = [];
                arr.push(message.data);
            }
            request.data = {};
            for (i in arr) {
                Object.assign(request.data,(comp[message.data].data));
                mimic.mancer.current_page = comp[message.data].data;
            }
        }
        else
            console.warn("Trying to get compendium page when no compendium has been set.");
        return {request: request, triggerevents: triggerevents};
    },
    getcompendiumquery: (mimic, message, request, triggerevents)=> {
        if (comp) {
            let data = message.data[0],
                query = {},
                matched_pages = [];

            if (typeof(data) === "string") {
                data = data.split(" ");
            }
            for (i in data) {
                let obj = data[i].split(":");
                query[obj[0]] = new RegExp(obj[1],"i");    
            }
            try {
                for (i in comp) {
                    let page = comp[i];
                    matched = false;
                    for (qkey in query) {
                        for (dkey in page.data) {
                            let val = page.data[dkey];
                            let regex = query[qkey];
                            if (dkey == qkey && val.match(regex)) {
                                matched = true;
                                break;
                            }
                        }
                    }
                    if (matched) {
                        matched_pages.push(page.data);
                    }
                }
            }
            catch (e) {
                console.warn("unable to fetch compendium query: ",query);
                console.warn(e);
            }

            request.data = matched_pages;
        }
        else
            console.warn("Trying to get compendium page when no compendium has been set.");
            
        return {request: request, triggerevents: triggerevents};
    },
    setattrs: (mimic, message, request, triggerevents) => {
        let data = message.data;
        let prefix = mancer.active ? "comp_" : "attr_";
        let attrCache = mancer.active ? mancer.pages[mancer.current_page].data : attrs;

        if (mancer.active) {
            request.type = "setCharmancerData";
            request.data = mancer.pages;
            request.callback = {id: message.id, data:message.data}
            request.character = message.characterid;
            mimic._charmancerData = mancer.pages;
        }

        for (i in data) {
            attrCache[i] = data[i];
            let found = mimic.dom.window.document.querySelectorAll(`[name=${prefix}${i}]`);

            found.forEach((node)=>{
                node.setAttribute("value",i);
                if (verbose)
                    log("HTML node updated",node.outerHTML);
            })

            if (!message.options || !message.options.silent) {
                triggerevents.push({
                    previous_value : attrCache[i],
                    updated_value : data[i],
                    sourceSection : message.sourceSection || '',
                    oattr : message.oattr || '',
                    eventname : `${i}`,
                    sourcetype : "worker",
                    mancer: mancer.active ? "mancerchange" : ""
                });
            }
        }
        return {request: request, triggerevents: triggerevents};
    },
    attrreq: (mimic, message, request, triggerevents) => {
        request.data = {};
        let attrreq = message.data;
        if (Array.isArray(attrreq)) {
            for (i in attrreq) {
                let attr = attrreq[i];
                if (attr.includes("repeating_")) {
                    let split = attr.split("_");
                    let sectionName = split[1];
                    let sectionID = split[2];
                    let parsedAttr = attr.replace(`repeating_${sectionName}_${sectionID}_`,"");
                    for (let j in repeatingSections) {
                        if (repeatingSections[j].id == sectionName) {
                            for (let k in repeatingSections[j].repsecs) {
                                let repsec = repeatingSections[j].repsecs[k];
                                if (repsec.id == sectionID) {
                                    request.data[attr] = repsec.attrs[parsedAttr];
                                }
                            }
                        }
                    }
                }
                else {
                    request.data[attr] = attrs[attr];
                }
            }
        }
        return {request: request, triggerevents: triggerevents};
    },
    attrlist: (mimic, message, request, triggerevents) => {
        let sectionName = message.data.replace("repeating_","");
        let ids = [];
        for (let i in repeatingSections) {
            if (repeatingSections[i].id == sectionName) {
                let repsecs = repeatingSections[i].repsecs;
                for (let j in repsecs) {
                    ids.push(repsecs[j].id);
                }
            }
        }
        request.data = ids;
        return {request: request, triggerevents: triggerevents};
    },
    addrepeatingsection: (mimic, message, request, triggerevents) => {
        //add charactermancer repeating section
        message.target;
        message.section;
        message.name;
    },
    loadTranslationStrings: (mimic, message, request, triggerevents) => {
        return {request: request, triggerevents: triggerevents};
    }
}

function definePostMessage(mimic, _comp, _attrs) {
    Object.assign(comp,_comp);
    Object.assign(attrs,_comp);
    return function postMessage(message) {
        const typeMap = {
            "eval": "eval",
            "trigger":"trigger",
            "attrreq":"attrreqfulfilled",
            "attrlist":"attrlistreqfulfilled",
            "setattrs":"setattrreqfulfilled",
            "getcompendiumpage":"attrreqfulfilled",
            "getcompendiumquery":"attrreqfulfilled",
            "loadTranslationStrings":"loadTranslationStrings",
        }

        let request = {id: message.id, type: typeMap[message.type], data:message.data};

        if (verbose) {
            log(`message: ${message.type}`,message);
        }
        let response = handler[message.type](mimic,message,request,[]);

        mimic.messageHandler({data: response.request});
        for (let i in response.triggerevents) {
            mimic.trigger(response.triggerevents[i]);
        }
    }
}

//-- Helpers
function log(...params) {
    for (let i in params) {
        if (typeof(params[i]) === "string") {
            params[i] = `\x1b[33m${params[i]}\x1b[0m`;
        }
        else if (typeof(params[i] === "object")) {
            let newparams = [params[i], `\x1b[0m`];
            params.splice(i,0,newparams);
            params[i] = `\x1b[2m\x1B[35m`
        }
        else if (typeof(params[i] === "array")) {
            let newparams = [params[i], `\x1b[0m`];
            params.splice(i,0,newparams);
            params[i] = `\x1b[2m\x1B[36m`
        }
        else if (typeof(params[i] === "number")) {
            params[i] = `\x1B[37m${params[i]}\x1b[0m`;
        }
    }
    if (params.length > 1) {
        console.log(params[0]);
        console.groupCollapsed("...");
        console.log(...params);
        console.groupEnd();
    }
    else console.log(...params);
}

module.exports = {
    definePostMessage: definePostMessage,
    repeatingData: repeatingData,
    repeatingSection: repeatingSection,
    comp: comp,
    repeatingSections: repeatingSections,
    mancer: mancer,
    attrs: attrs,
    log: log
};