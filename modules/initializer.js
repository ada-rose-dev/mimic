//- requires
const _ = require('underscore');
const vm = require('vm');
const r20 = require('./r20workers');
const {postMessage, RepeatingSection, RepeatingData, log} = require("./messageHandler");
const testEnvironment = require("./testEnvironment");


//-- Roll20 Context Initialization
function sanitizeHTML(mimic){

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
function registerEventListeners(mimic){
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
function loadTranslations(mimic, translations, lang="en"){
    //load translations
    if (translations) {
        if (this.verbose) log("Parsing translations");
        mimic.postMessage({
            type:"loadTranslationStrings",
            data:{values:translations[lang], lang:lang}
        });
    }
}
function createRepeatingRow(mimic,repdata_or_id){
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

    let repsec = new RepeatingSection(id,section);
    section.querySelectorAll("[name*=attr_]").forEach((element)=>{
        let name = element.getAttribute("name").replace("attr_","");
        let value = element.getAttribute("value");
        repsec.attrs[name] = value;
    })
    repdata.repsecs.push(repsec);
}
function registerRepsecContainers(mimic,repeatingSections){
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

            let data = new RepeatingData(name.replace("repeating_",""), fieldset, container);
            repeatingSections.push(data);
            btn.addEventListener("click",()=>{createRepeatingRow(mimic,data);});
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
    attrs = {
        "character_name": "MIMIC CHARACTER"
    };
    mancer = {
        active: false,
        current_page: "",
        pages: {}
    };
    repeatingSections = [];

    open(dom,comp,translations) {
        
        //initialize vm context (this is sensitive, don't try to rearrange it)
        this.context = {
            _: _,
            console: console,
            dom: dom,
            window: dom.window,
            document: dom.window.document
        };
        vm.createContext(this.context);

        //initialize r20 context
        this.context.postMessage = postMessage(this,comp,translations);
        vm.runInContext(r20.init(this.context,eval,_),this.context);
        getElementAttrs(this.context.document,this.attrs);
        loadTranslations(this.context,translations);
        registerEventListeners(this.context);
        registerRepsecContainers(this.context,this.repeatingSections);

        this.context.mimic = testEnvironment(this.context);
        return this.context;
    }

    close() {
        Object.keys(this.attrs).forEach(k=>delete attrs[k]);
        Object.keys(this.mancer.pages).forEach(k=>delete mancer.pages[k]);
        //delete context;
    }
    constructor(dom, comp, translations) {
        return this.open(dom, comp, translations);
    }
}
module.exports = {Mimic: Mimic, log:log};
