//- class defs
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
        loadCharmancer(mimic);

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
        let mancer = mimic.mancer;
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
        if (Array.isArray(message.data)) {
            for (i in message.data) {
                request.data[message.data[i]] = attrs[message.data[i]];
            }
        }
        return {request: request, triggerevents: triggerevents};
    },
    attrlist: (mimic, message, request, triggerevents) => {

        //- # TODO: Fill this out #
        //- Need to parse HTML so we can add repeating sections.
        //- will need an object(?) to handle this; some place to store the repeating sections
        //-
        //- will need to store:
        //- * name of repeating section container
        //- * repeating section IDs
        //- * repeating section template HTML
        //- * repeating section attributes
        //-
        //- class repsec {id, attributes}
        //- class respec_container = {id, template, repeating_section[]}
        //- the template can contain a repsec_container - how to get tree structure?
        //- --> HTML parsed recursively to get repeating section structure
        //- must check for infinite loops!

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

        log("message: ",message.type);
        let response = handler[message.type](mimic,message,request,[]);

        mimic.messageHandler({data: response.request});
        for (let i in response.triggerevents) {
            mimic.trigger(response.triggerevents[i]);
        }
    }
}

//-- Helpers
function log(...params) {
    for (i in params) {
        if (typeof(params[i]) === "string") {
            params[i] = `\x1b[33m${params[i]}\x1b[0m`;
        }
    }
    console.log(...params);
}

module.exports = {
    definePostMessage: definePostMessage,
    repeatingData: repeatingData,
    repeatingSection: repeatingSection
};