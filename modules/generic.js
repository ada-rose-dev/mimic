
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
function sanitizeHTML(node) {
    if (!node.tagName) return;
    //console.log(node.tagName);
    if (node.tagName !== "CHARMANCER")
        node.className = node.className.replace(/([\w-_\d]+)/gi,"sheet-$1");
    for (let i in node.childNodes) {
        sanitizeHTML(node.childNodes[i]);
    }
}

//-- Repeating Sections
class RepeatingSection {
    constructor(id, element, attrs = {}) {
        this.id = id;                       
        this.element = element;
        this.attrs = attrs || getElementAttrs(element,this.attrs);
    }
}
class RepeatingData {
    constructor(id, fieldset, repcontainer = null, repsecs = []) {
        this.id = id;                       //string
        this.fieldset = fieldset;           //element
        this.repcontainer = repcontainer;   //element
        this.repsecs = repsecs;             //array of respec's
    }
}
function findRepeatingSection(repeatingSections, sectionName, propertyName, valueToMatch) {
    for (let i in repeatingSections) {
        if (repeatingSections[i].id == sectionName) {
            let repsecs = repeatingSections[i].repsecs;
            for (let j in repsecs) {
                if (repsecs[j][propertyName] == valueToMatch) {
                    return repsecs[j];
                }
            }
        }
    }
    log("Warning: Repeating section not found!", repeatingSections, sectionName, propertyName, valueToMatch);
}
function createRepeatingRow(repeatingSections,repdata_or_id,mancer=false,target_node=null){
    let repdata = repdata_or_id;
    if (typeof(repdata) === "string") {
        for (let i in repeatingSections) {
            if (repeatingSections[i].id == repdata) {
                repdata = repeatingSections[i]; break;
            }
        }
    }
    target_node = target_node || repdata.repcontainer;

    let id = window.generateRowID();
    let section = document.createElement("div");

    section.setAttribute("data-repeating", `repeating_${id}_${repdata.id}`);
    section.className = repdata.fieldset.className;
    section.innerHTML = repdata.fieldset.innerHTML;
    target_node.append(section);

    let repsec = new RepeatingSection(id,section);
    section.querySelectorAll("[name*=comp_]").forEach((element)=>{
        let name = element.getAttribute("name").replace("comp_","");
        let value = element.getAttribute("value");
        element.setAttribute("name",`repeating_${id}_${repdata.id}_${name}`);
        repsec.attrs[name] = value;
    })
    repdata.repsecs.push(repsec);
    return repsec;
}