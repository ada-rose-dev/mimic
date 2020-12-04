//-- Roll20 Context Initialization
//console.log("loading mimic environment...");
function initMimicEnvironment(self) {
    self.verbose = false;
    self.attrs = {
        "character_name": "MIMIC CHARACTER"
    };
    self.mancer = {
        active: false,
        current_page: "",
        pages: {},
        repeatingSections: [],
        get current_node() {return this.pages[this.current_page].node;},
        current_compendium_page: "",
        get current_compendium_data() {return comp[current_compendium_page];},
    };
    self.repeatingSections = [];

    (function getElementAttrs(element, attrs){
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
    })(document.firstElementChild,self.attrs);
    (function registerEventListeners(){
        document.querySelectorAll("[type=action][name*=act_]").forEach((node)=>{
            if (node.getAttribute) {
                node.onclick = ()=>{
                    let name = "clicked:" + node.getAttribute("name").replace("act_","");
                    let message = {
                        eventname: name,
                        triggerType: "player",
                        oattr: name.replace("clicked:",""),
                        type: "act",
                        data: node.getAttribute("value")
                    };
                    postMessage(message);
                };
            }
        });
    })();
    (function loadTranslations(translations, lang="en"){
        //load translations
        if (translations) {
            if (verbose) log("Parsing translations");
                window.postMessage({
                type:"loadTranslationStrings",
                data:{values:translations[lang]||translations.translations, lang:lang}
            });
        }
    })(self.translations);
    (function registerRepsecContainers(){
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

                let data = new RepeatingData(name.replace(/sheet-|repeating[-_]/gi,""), fieldset, container);
                repeatingSections.push(data);
                btn.addEventListener("click",()=>{generic.createRepeatingRow(data);});
            }
        })

        if (verbose) {
            log("Registered repeating sections:", repeatingSections);
            document.querySelectorAll("div.repcontainer").forEach((element)=>{log(element.outerHTML)});
            document.querySelectorAll("div.repcontrol").forEach((element)=>{log(element.outerHTML)});
        }
    })();

    self.verbose = verbose;

};