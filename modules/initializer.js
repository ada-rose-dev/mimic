//- requires
const _ = require('underscore');
const vm = require('vm');
const r20 = require('./r20workers');
const {definePostMessage, repeatingSection, repeatingData, attrs, repeatingSections, mancer, log} = require("./messageHandler");

//- consts
const mimic = {};


//-- Roll20 Context Initialization
function sanitizeHTML(){

}
function getElementAttrs(element, attrs){
    let found = element.querySelectorAll("[name*=attr_]");
    for (let i in found) {
        try {
            let node = found[i];
            if (node.getAttribute) {
                let name = node.getAttribute("name").replace("attr_","");
                let value = node.getAttribute("value");
                attrs[name] = value || "";
            }
        }
        catch(e) {
            console.warn(found[i],e);
        }
    }
    return attrs;
}
function registerEventListeners(){
    mimic.document.querySelectorAll("[type=action][name*=act_]").forEach((node)=>{
        if (node.getAttribute) {
            node.onclick = ()=>{
                let name = "clicked:" + node.getAttribute("name").replace("act_","");
                let message = {
                    eventname: name,
                    triggerType: "player",
                    oattr: node,
                    type: "act",
                    data: node.getAttribute("value")
                };
                mimic.postMessage(message);
            };
        }
    });
}
function loadTranslations(translations, lang="en"){
    //load translations
    if (translations) {
        if (this.verbose) log("Parsing translations");
        mimic.postMessage({
            type:"loadTranslationStrings",
            data:{values:translations[lang], lang:lang}
        });
    }
}
function createRepeatingRow(repdata_or_id){
    let repdata = repdata_or_id;
    if (typeof(repdata) === "string") {
        repdata = repeatingSections.find((data)=>{data.id == repdata})
    }

    let id = mimic.generateRowID();
    let document = mimic.document;
    let section = document.createElement("div");

    section.className = "repitem";
    section.setAttribute("data-reprow-id", id);
    section.innerHTML = repdata.fieldset.innerHTML;
    repdata.repcontainer.append(section);

    let repsec = new repeatingSection(id,section);
    section.querySelectorAll("[name*=attr_]").forEach((element)=>{
        let name = element.getAttribute("name").replace("attr_","");
        let value = element.getAttribute("value");
        repsec.attrs[name] = value;
    })
    repdata.repsecs.push(repsec);
}
function registerRepsecContainers(){
    let document = mimic.document;
    document.querySelectorAll("fieldset").forEach((fieldset)=>{
        let name = fieldset.className;
        if (fieldset.className.search("repeating_") != -1) {
            
            let container = document.createElement("div");
            container.className = "repcontainer";
            container.setAttribute("data-groupname",name);
            fieldset.after(container);
            
            let control = document.createElement("div");
            control.className = "repcontrol";
            control.setAttribute("data-groupname",name);
            container.after(control);
            
            let btn = document.createElement("button");
            btn.className = "btn repcontrol_edit";
            btn.innerHTML = "Modify";
            control.append(btn);
            btn = document.createElement("button");
            btn.className = "btn repcontrol_add";
            btn.innerHTML = "+Add";
            control.append(btn);

            let data = new repeatingData(name.replace("repeating_",""), fieldset, container);
            repeatingSections.push(data);
            btn.addEventListener("click",()=>{createRepeatingRow(data);});
        }
    })
    if (this.verbose) {
        log("Registered repeating sections:", repeatingSections);
        document.querySelectorAll("div.repcontainer").forEach((element)=>{console.log(element.outerHTML)});
        document.querySelectorAll("div.repcontrol").forEach((element)=>{console.log(element.outerHTML)});
    }
}

//Exported class
class Mimic {
    open(dom,comp,translations) {
        let context = {
            _:_,
            console:console,
            dom: dom,
            document: dom.window.document
        };
        Object.assign(mimic,context);

        //initialize context
        vm.createContext(mimic);
        mimic.postMessage = definePostMessage(mimic,comp,attrs);
        vm.runInContext(r20.init(mimic,eval,_),mimic);

        //subtasks
        attrs["character_name"] = "Character Name";
        mancer.data = {};
        getElementAttrs(mimic.document,attrs);
        loadTranslations(translations);
        registerEventListeners();
        registerRepsecContainers();

        return mimic;
    }

    static close() {
        Object.keys(attrs).forEach(k=>delete attrs[k]);
        Object.keys(mancer.data).forEach(k=>delete mancer.data[k]);
        //delete mimic;
    }
    constructor(dom, comp, translations) {
        return this.open(dom, comp, translations);
    }
}
module.exports = {Mimic: Mimic, log:log};
