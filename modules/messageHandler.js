//console.log("loading message handler...");
function definePostMessage(self,comp) {
    "use strict"
    let mancer = self.mancer;
    let repeatingSections = self.repeatingSections;
    let attrs = self.attrs;
    let verbose = self.verbose;

    const typeMap = {
    
        // ATTRS
        "attrreq":"attrreqfulfilled",
        "attrlist":"attrlistreqfulfilled",
        "setattrs":"setattrreqfulfilled",
    
        // COMPENDIUM
        "changecompendiumpage": "attrreqfulfilled", //TODO
        "getcompendiumpage":"attrreqfulfilled",
        "getcompendiumquery":"attrreqfulfilled",
    
        // MANCER
        "startcharactermancer": "attrreqfulfilled",
        "finishcharactermancer": "attrreqfulfilled",
        "setcharmancertext": "attrreqfulfilled",
        "setcharmanceroptions": "attrreqfulfilled",
        "deletecharmancerdata": "attrreqfulfilled",
        "disablecharmanceroptions": "attrreqfulfilled",
        "showchoices": "attrreqfulfilled",
        "hidechoices": "attrreqfulfilled",
        "changecharmancerpage": "attrreqfulfilled",
        
        // REPEATING
        "removerepeatingrow": "attrreqfulfilled",
        "addrepeatingsection": "attrreqfulfilled",
        "getrepeatingsections": "attrreqfulfilled",
        "clearrepeatingsections": "attrreqfulfilled",
    
        // MISC
        "act": "act",
        "eval": "eval",
        "loadTranslationStrings":"loadTranslationStrings",
        "trigger":"trigger",
    };

    function compendiumSearch(queryString) {
        let data = queryString,
            query = {},
            matched_pages = [];

        if (typeof(data) === "string") {
            data = data.split(" ");
        }
        for (let i in data) {
            let obj = data[i].split(":");
            query[obj[0]] = decodeURI(obj[1]);
        }
        try {
            for (let i in comp) {
                let page = comp[i];
                for (let qkey in query) {
                    if (page.data[qkey]) {
                        let val = page.data[qkey];
                        if (val == (query[qkey]))
                            matched_pages.push(page);
                    }
                    else {
                        let val = page.data["Category"];
                        if (val === qkey && page.name == (query[qkey]))
                            matched_pages.push(page);
                    }
                }
            }
        }
        catch (e) {
            console.warn("unable to fetch compendium query: ",query);
            console.warn(e);
        }

        return matched_pages;
    }
    function reverseHTMLescape(s) {
            var entities = {
                    ['&' + '#42' + ';']:'*',
                    ['&' + 'amp' + ';']:'&',
                    ['&' + 'lt' + ';']:'<',
                    ['&' + 'gt' + ';']:'>',
                    ['&' + '#39' + ';']:"'",
                    ['&' + '#64' + ';']:'@',
                    ['&' + '#123' + ';']:'{',
                    ['&' + '#124' + ';']:'|',
                    ['&' + '#125' + ';']:'}',
                    ['&' + '#44' + ';']:',',
                    ['&' + '#91' + ';']:'[',
                    ['&' + '#93' + ';']:']',
                    ['&' + 'quot' + ';']:'"',
                    ['&' + '#58' + ';']:':',
                    ['&' + '#40' + ';']:'(',
                    ['&' + '#41' + ';']:')'
                };
            for (let i in entities) {
                s = s.replace(new RegExp(i,"gi"), entities[i]);
            }
            return s;
    }
    function loadMancerPage(data) {
        let page = "";
        for (let i in mancer.pages) {
            if (data == i) {page = i; break;}
        }
        if (page) {
            mancer.current_page = page;
            fillAcceptFields();
        }
        else {
            console.warn("mancer error: page \"",data,"\" not found!");
        }
        return page;
    }
    function fillAcceptFields() {

    }

    const handler = {

        // ATTRS [/]
        setattrs: (message, request, triggerevents) => {
            let data = message.data;
            let prefix = mancer.active ? "comp_" : "attr_";
            let attrCache = mancer.active? mancer.pages[mancer.current_page].data : attrs;

            if (mancer.active) {
                request.type = "setCharmancerData";
                request.data = mancer.pages;
                request.callback = {id: message.id, data:message.data}
                request.character = message.characterid;
                window._charmancerData = mancer.pages;
            }
    
            for (let dataProperty in data) {
                let previous_value;
                let parent = document;
                let attrName = dataProperty;
                let oattr = dataProperty;

                if (dataProperty.search("repeating_") != -1) {
                    let split = dataProperty.split("_");
                    let sectionName, sectionID;

                    if (split.length <= 3) {
                        attrName = split[2];
                        if (message.repeatingfield) {
                            split = message.repeatingfield.split("_");
                            sectionName = split[1];
                            sectionID = split[2];
                            oattr = message.repeatingfield + '_' + attrName;
                        }
                        else
                        {
                            log("SHEET WORKER ERROR: You attempted to set an attribute beginning with 'repeating_' but did not include a Row ID or Attribute Name in",attrName);
                            continue;
                        }

                    }
                    else {
                        attrName = split.splice(3, split.length).join("_");
                        sectionName = split[1];
                        sectionID = split[2];
                    }

                    let repsec = findRepeatingSection(repeatingSections,sectionName,"id",sectionID);
                    if (repsec) {
                        let repeatingCache = repsec.attrs;
                        parent = repsec.element;
                        previous_value = repeatingCache[dataProperty] || null;
                        repeatingCache[attrName] = data[dataProperty];
                    }
                }
                else {
                    previous_value = attrCache[dataProperty] || null;
                    attrCache[dataProperty] = data[dataProperty];
                }

                let found = parent.querySelectorAll(`[name=${prefix+attrName}]`);
                found.forEach((node)=>{
                    //check if this is contained in a repeating section or fieldset
                    let parent = node;
                    while (parent) {
                        if (parent.nodeName == "FIELDSET" || parent.nodeName == "CHARMANCER" || parent.className.includes("repcontainer")) {
                            return;
                        }
                        parent = parent.parentElement;
                    }

                    let node_previousvalue = node.outerHTML;
                    node.setAttribute("value",data[dataProperty]);
                    log(`HTML node for <${prefix+attrName}> updated`,`\n${node_previousvalue} ==> ${node.outerHTML}`);
                })
                if (found.length == 0) {
                    console.warn("Unable to find an HTML element for passed attribute: ",dataProperty);
                }
    
                if (!message.options || !message.options.silent) {
                    triggerevents.push({
                        previous_value : previous_value,
                        updated_value : data[dataProperty],
                        sourceSection : message.sourceSection,
                        oattr : oattr,
                        eventname : dataProperty,
                        sourcetype : "worker",
                        mancer: mancer.active ? "mancerchange" : ""
                    });
                }
            }
            return {request: request, triggerevents: triggerevents};
        },
        attrreq: (message, request, triggerevents) => {
            request.data = {};
            let attrreq = Array.isArray(message.data) ? message.data : [message.data];
            for (i in attrreq) {
                let attr = attrreq[i];
                if (attr.includes("repeating_")) {
                    let split = attr.split("_");
                    let sectionName, sectionID, attrName, repsec;

                    if(split.length > 3) {
                        attrName = split.splice(3, split.length).join("_");
                        sectionName = split[1];
                        sectionID = split[2];
                        repsec = findRepeatingSection(repeatingSectionssectionName,"id",sectionID);
                        if (!repsec) continue;
                    }
                    else {
                        attrName = split[2];
                        sectionName = split[1];
                        sectionID = _activeRepeatingField;
                        repsec = findRepeatingSection(repeatingSectionssectionName,"id",sectionID);
                        if (!repsec) {console.warn("Trying to get repeating value with no repeating section specified!"); continue;}
                    }
                    request.data[attr] = repsec.attrs[attrName];
                }
                else {
                    request.data[attr] = attrs[attr];
                }
            }
            return {request: request, triggerevents: triggerevents};
        },
        attrlist: (message, request, triggerevents) => {
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

        // COMPENDIUM [/]
        changecompendiumpage: (message, request, triggerevents) => {
            let page = compendiumSearch(message.data)[0];
            mancer.current_compendium_page = page.name;
            
            let target_node = mancer.current_node.querySelector(`.sheet-${message.target}`);
            target_node.innerHTML = reverseHTMLescape(page.cachedhtml);

            fillAcceptFields();

            return {request: request, triggerevents: triggerevents};
        },
        getcompendiumpage: (message, request, triggerevents)=> {
            if (comp) {
                let arr = message.data;
                if (typeof(message.data) == "string") {
                    arr = [];
                    arr.push(message.data);
                }
                request.data = {};
                for (let i in arr) {
                    Object.assign(request.data,compendiumSearch(arr[i]));
                }
            }
            else
                console.warn("Trying to get compendium page when no compendium has been set.");
            return {request: request, triggerevents: triggerevents};
        },
        getcompendiumquery: (message, request, triggerevents)=> {
            if (comp) {
                request.data = compendiumSearch(message.data[0]);;
            }
            else
                console.warn("Trying to get compendium page when no compendium has been set.");
                
            return {request: request, triggerevents: triggerevents};
        },

        // MANCER [-]
        changecharmancerpage: (message, request, triggerevents) => {
            let page = loadMancerPage(message.data);
            triggerevents.push({
                sourceSection: message.sourceSection || '',
                mancer: "page",
                eventname: page,
                sourcetype: "worker"
            });
            return {request: request, triggerevents: triggerevents,};
        },
        deletecharmancerdata: (message, request, triggerevents) => {
            if (message.data) {
                for (let i in message.data) {
                    if (mancer.pages[message.data[i]].data) delete mancer.pages[message.data[i]].data;
                }
            }
            else {
                for (let i in mancer.pages) {
                    delete mancer.pages[i].data;
                }
            }
            return {request: request, triggerevents: triggerevents};
        },
        finishcharactermancer: (message, request, triggerevents) => {
            triggerevents.push({
                sourceSection: message.sourceSection || '',
                sourcetype: "worker",
                mancer: "finish",
                eventname: message.data || "",
                data: mancer.pages
            })
            mancer.current_page = "final";
            mancer.active = false;
            delete mancer.pages;
            return {request: request, triggerevents: triggerevents};
        },
        hidechoices: (message, request, triggerevents) => {
            for(let i in message.data) {
                let name = message.data[i];
                mancer.current_node.querySelectorAll(`[class~=sheet-${name}].sheet-choice`).forEach((node)=>{
                    node.className = node.className.replace("sheet-choice","sheet-choice-hidden");
                    console.log("Choice hidden:",node.className);
                })
            }
            return {request: request, triggerevents: triggerevents,}
        },
        setcharmancertext: (message, request, triggerevents) => {
            for (let i in message.data) {
                mancer.current_node.querySelectorAll(`[class=sheet-${i}]`).forEach((node)=>{
                    node.innerHTML = message.data[i];
                    sanitizeHTML(node);
                    console.log(`Set text for class "${node.className}": "${node.innerHTML}"`);
                });
            }
            return {request: request, triggerevents: triggerevents}
        },
        showchoices: (message, request, triggerevents) =>{
            for(let i in message.data) {
                let name = message.data[i];
                mancer.current_node.querySelectorAll(`[class~=sheet-${name}].sheet-choice-hidden`).forEach((node)=>{
                    node.className = node.className.replace("sheet-choice-hidden","sheet-choice");
                    console.log("Choice showing:",node.className);
                })
            }
            return {request: request, triggerevents: triggerevents,}
        },
        startcharactermancer: (message, request, triggerevents) => {
            //load charmancer pages
            document.querySelectorAll("charmancer").forEach((node)=>{
                if (node.className.includes("sheet-charmancer")) {
                    let name = node.className.match(/sheet-charmancer-([^\s]+)/)[1];
                    mancer.pages[name] = {data: {}, values: {}, node: node};
                }
                else if (node.className.includes("repeating")) {
                    let name = node.className.match(/repeating-([^\s]+)/)[1];
                    mancer.repeatingSections.push(new RepeatingData(name.replace("repeating_",""),node));
                }
            });
    
            let page = loadMancerPage(message.data);
            if (!page) {
                return {request: request, triggerevents: triggerevents};
            }
    
            mancer.active = true;
            window._charmancerData = {};
            window._activeCharacterId = "(_activeCharacterId)";
            window._charmancerData[window._activeCharacterId] = mancer;

            triggerevents.push({
                sourceSection: message.sourceSection || '',
                mancer: "page",
                eventname: page,
                sourcetype: "worker"
            });
            return {request: request, triggerevents: triggerevents};
        },

            //      /------------------------- (.) -------------------------\
            // TODO vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
        setcharmanceroptions: (message, request, triggerevents) =>{
            let target = message.target,
                newopts = message.data,
                settings = message.options;

            debugger;
            if (typeof(newopts) === 'string') {
                let pages = compendiumSearch(newopts);
                newopts = pages.map(page => page.name + (settings.show_source? page.compendiumexpansion : ""));
            }
            if (settings.add) {newopts = newopts.concat(settings.add);}
            
            //could be select or radio
            mancer.current_node.querySelectorAll(`sheet-${target}`).forEach((node)=>{
                if (node.tagname === "SELECT") {
                    for (let i in newopts) {
                        let opt = document.createElement("option");
                        opt.innerHTML = newopts[i];
                        node.addChild(opt);
                    }
                    if (settings.disable)
                        for (let i in node.childNodes) {
                                for (let j in settings.disable) {
                                    if (node.childNodes[i].innerHTML === settings.disable[j]) {
                                        node.childNodes[i].setAttribute("disabled", "disabled");
                                    }
                                }
                        }
                }
                //wait is it supposed to look for spans or inputs??? 
                else if (node.tagname === "INPUT" && node.getAttribute("type") === "radio") {

                }
            });

            return {request: request, triggerevents: triggerevents,};
        },
        disablecharmanceroptions: (message, request, triggerevents) =>{
            return {request: request, triggerevents: triggerevents,};
        },
            // TODO ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            //      \-------------------------------------------------------/

        // REPEATING SECTIONS [/]
        addrepeatingsection: (message, request, triggerevents) => {
            //add charactermancer repeating section
            let target = message.target,
            section = message.section,
            name = message.name || message.section;
            request.data = {};
            request.type="attrreqfulfilled";

            let node = mancer.current_node.querySelector(`[class=sheet-${target}]`);
            let newRow = createRepeatingRow(repeatingSections,section,mancer,node);
            console.log(`Added repeating row to mancer page "${mancer.current_page}" with type "${section}" and id "${newRow.id}"`);
            request.data = newRow.id;
            return {request: request, triggerevents: triggerevents};
        },
        clearrepeatingsections: (message, request, triggerevents) => {
            //clearRepeatingSections
            if (message.target) {
                if (typeof(message.target) === 'string') {message.target = [message.target];}
                for (let i in message.target) {
                    let currentTarget = message.target[i];
                    mancer.current_node.querySelectorAll(`[class=sheet-${currentTarget}]`).forEach((node) => {
                        node.querySelectorAll("[data-repeating]").forEach((row) => {
                            let id = row.getAttribute("data-repeating").split("_")[1];
                            let found = false;
                            for (let j in repeatingSections) {
                                for (let k in repeatingSections[j].repsecs) {
                                    if (repeatingSections[j].repsecs[k].id == id) {
                                        delete repeatingSections[j].repsecs[k];
                                        found = true; break;
                                    }
                                }
                                if (found) {break;}
                            }
                            node.removeChild(row);
                        })
                    })
                }
            }
            //clearRepeatingSectionsById
            else if (message.repids) {
                for (let i in message.repids) {
                    let id = message.repids[i];
                    let node;
                    let found = false;
                    for (let j in repeatingSections) {
                        for (let k in repeatingSections[j].repsecs) {
                            if (repeatingSections[j].repsecs[k].id == id) {
                                node = repeatingSections[j].repsecs[k].element;
                                delete repeatingSections[j].repsecs[k];
                                found = true; break;
                            }
                        }
                        if (found) {break;}
                    }
                    node.parentElement.removeChild(node);
                }
            }
            return {request: request, triggerevents: triggerevents};
        },
        getrepeatingsections: (message, request, triggerevents) => {
            let target = message.target;
            for (let i in repeatingSections) {
                if (repeatingSections[i].id == target) {
                    request.data = repeatingSections[i].repsecs;
                    break;
                }
            }
            return {request: request, triggerevents: triggerevents};
        },
        removerepeatingrow: (message, request, triggerevents) => {
            let split = message.data.split("_");
            let sectionName = split[1];
            let id = split[2];
            let repcontainers = repeatingSections;
            for (let i in repcontainers) {
                if (repcontainers[i].id == sectionName) {
                    let repsecs = repcontainers[i].repsecs;
                    for (let j in repsecs) {
                        if (repsecs[j].id === id) {
                            repsecs[j].element.remove();
                            delete repcontainers[i].repsecs[j];
                            return {request: request, triggerevents: triggerevents};
                        }
                    }
                }
            }
            return {request: request, triggerevents: triggerevents};
        },

        // MISC [/]
        loadTranslationStrings: (message, request, triggerevents) => {
            return {request: request, triggerevents: triggerevents};
        },
        act: (message, request, triggerevents) => {
            if (mancer.active) {
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
    };

    // CALL HANDLER, PASS TO WORKERS
    self.postMessage = function(message) {
        let request = {id: message.id, type: typeMap[message.type], data:message.data};

        if (verbose) {
            log(`message: ${message.type}`,message);
        }
        let response;
        if (typeMap[message.type]) {
            response = handler[message.type](message,request,[]);
        }
        else {
            console.warn(`Unimplemented message type! ${message.type}`);
            return;
        }
        
        try {
            window.messageHandler({data: response.request});
            window._charmancerData = mancer;
            for (let i in response.triggerevents) {
                trigger(response.triggerevents[i]);
            }
        }
        catch(e) {
            console.log("MIMIC: ERROR HANDLING MESSAGE:\n",e,'\n',message,'\n',request,'\n',response);
            debugger;
        }
    }
}