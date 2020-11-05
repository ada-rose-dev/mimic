#!/usr/bin/env node
//--
//-- simple code verifier
//-- created by phoenix ada rose mandala for roll20 user collaboration
//--
const mimic = "                        yy■■■■■■■■■■■■■■yy                      \n                   yy■■yyyyyyyyyyyyyyyyyyyy■■■■y                \n              ■■yyyyyyyyyy          yyyyyyyyyyyy■■■■y           \n          ■■■■yyyyyyyyyy  ■■■■■■■■■■  yyyyyyyyyyyyyy■■y        \n       y■■yyyyyyyyyyyy  ■■■■      ■■■■  yyyyyyyyyyyyyy■■        \n     y■■yyyyyyyyyyyy  ■■■■          ■■■■  yyyyyyyyyyyyyy■■      \n    ■■yyyyyyyyyyyyyy  ■■■■■■      ■■■■■■  yyyyyyyyyyyyyy■■      \n  ■■yyyyyyyyyyyyyyyyyy  ■■■■■■■■■■■■    yyyyyyyyyyyyyyyy■■      \n  ■■yyyyyyyyyyyyyyyyyyyy                            yyyyyy      \n  ■■yyyyyyyyyyyyyyyy        ■■■■  ■■■■■■■■yy  ■■■■■■    yyyy    \n    ■■yyyyyyyy      ■■  ■■yy■■■■  ■■yy■■■■    ■■yy■■  yy        \n    yyyy      ■■■■■■    ■■yy■■■■    ■■■■        ■■■■  yy        \n    yy  yy■■■■yy■■■■      ■■yy■■    ■■    ■■    ■■              \n  yy  ■■■■  ■■yy■■          ■■          ■■■■        ■■          \n      ■■      ■■      ■■                ■■■■■■      ■■■■        \n          ■■  ■■    ■■■■                ■■yy■■    ■■yy■■yy      \n          ■■      ■■■■yy■■  ■■  yyyy  yy■■yyyy  ■■yyyy■■  yyyy  \n          ■■■■  ■■■■■■yy  ■■  yy■■■■yy                    yy    \n          ■■yy■■■■■■yy    ■■  yy■■■■■■    yyyyyyyyyyyyyyyyyy    \n        yy■■■■        yyyy  ■■  ■■■■■■■■  yyyyyyyyyyyyyyyy■■    \n              yyyyyyyyyyyyyy  ■■yy■■■■■■  yyyy    yyyyyyyy■■    \n        yyyyyyyyyyyyyyyyyyyy  ■■  yy■■■■■■    ■■■■  yyyy■■      \n      yyyy■■■■yyyyyyyyyyyyyyyy  ■■  yy■■■■■■■■  yy■■  yy■■      \n            ■■■■yyyyyyyyyyyyyyyy  ■■  yyyyyy  ■■        ■■      \n              ■■yyyyyyyyyyyyyyyyyy  ■■      ■■    ■■  ■■■■      \n              ■■yyyyyyyyyy            ■■■■■■      ■■      ■■    \n                ■■yyyy    ■■■■■■■■■■            ■■  yy          \n                ■■yy  ■■■■                      ■■yyyy          \n                ■■  ■■                          ■■yyyy          \n                ■■■■                              ■■            \n              ■■                                                ";
const title = "MIMIC v0.01";

//-- requires
//nodejs
const fs = require('fs');
const process = require('process');
const vm = require('vm');

//custom
const r20 = require('r20');
const scraper = require('scraper');

//external
const _ = require('underscore');
const jsdom = require('jsdom');
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.sendTo(console);
const {JSDOM} = jsdom;
let jsdomOptions = {virtualConsole}
let dom = {};

//global variables
const attrs = {};
const comp = [];
const mancer = {
    current_page: "",
    data: {}
};
const translations = {};
const scripts = {};
const watched = [];
let HTMLname = "";
let comp_name = "";
let verbose = false;

//-- boot
(boot = () => {
    console.log(mimic);
    console.log(title);
    //cull node call and directory
    process.argv.shift();
    process.argv.shift();

    //define variables
    let target_dir;
    let watch;
    let scrape;
    let filenames = [];

    //parse argvs
    for (let i = 0; i < process.argv.length; ++i) {
        if(process.argv[i][0] === "-") {
            if (process.argv[i] == "-v" || process.argv[i] == "--verbose") {
                verbose = true;
            }
            else if (process.argv[i] == "--watch") {
                watch = true;
            }
            else if (process.argv[i].search("--comp") !== -1) {
                let name = process.argv[i].substr(process.argv[i].search('=')).replace(/\=|\"|\'/gi,"").replace(" ","%20");
                loadCompendium(name);
            }
            else if (process.argv[i] == "--scrape") {
                scrape = true;
                (async function () {
                    await scraper.scrape(process.argv[++i],process.argv[++i],process.argv[++i]);
                    log("Scrape finished.");
                    process.exit(1);
                })();
            }
            else {
                console.warn("Unknown parameter passed:",process.argv[i]);
            }
        }
        else if (!target_dir) {
            target_dir = process.argv[i];
        }
        else {
            if (process.argv[i].search(".js") === 0) {
                filenames.push(process.argv[i]+".js");
            }
            else {
                filenames.push(process.argv[i]);
            }
        }
    }

    //route
    if (scrape) {
        //do nothing
    }
    else if (!target_dir) {
        log("No directory provided.");
        process.exit(1);
    }
    else {
        mainLoop(target_dir,filenames,watch);
    }
})();

//-- Main loop
async function mainLoop(directory,filenames,watch) {
    if (verbose) {
        log("Processing directory: ",directory);
        if (filenames.length !== 0) {
            log("Verifying files:",...filenames);
        }
    }
    log("Loading files...");
    let files = await loadFiles(directory,filenames);
    runScripts(files);
    if (watch) {
        log("Watching for changes. Press ^C to exit.");
        if (verbose) {
            log("watching the following files:",watched);
        }

        waiting = false;
        for (let i in watched) {
            fs.watch(watched[i], {persistent: true, interval: 1000}, (event, filename)=>{
                if (waiting) return;
                if (HTMLname.search(filename) != -1) loadHTML();
                else {
                    let f = watched[i];
                    let j = watched[i].lastIndexOf('/')+1;
                    loadFile(f.substring(j),f.substring(0,j));
                }
                runScripts();

                waiting = true;
                setTimeout(()=>{waiting = false},1000)
            });
        }
    }
}
async function runScripts() {
    if (!scripts) {
        log("No scripts found!");
        return;
    }
    log("Running scripts...");
    try {
        if (!dom) {
            log("NOTE: Running with empty DOM");
            dom = new JSDOM(``, jsdomOptions);
        }

        const contextobj = setDefaultAttrs();
        for (i in scripts) {
            vm.runInContext(scripts[i],contextobj,i);
        }
        resetAttrs(contextobj);
    }
    catch (e) {
        log("ERROR:",e);
    }
}

//-- Asset loading
async function loadHTML() {
    log("Parsing HTML...");
    let file = fs.readFileSync(HTMLname);
    let parsed = file.toString().replace(/<script.+>(\n|.)*<\/script>/gi,""); //strip scripts
    if (dom.window) dom.window.close();
    delete dom;
    dom = new JSDOM(parsed, jsdomOptions);
}
async function loadCompendium(name) {
    log("Loading data for",name,"compendium...")
    try {
        let dir = fs.readdirSync(__dirname+"/scraper/cache/"+name);
        for(i in dir) {
            try {
                let page = fs.readFileSync(__dirname+"/scraper/cache/"+name+'/'+dir[i]);
                page = JSON.parse(page);
                comp[page.name] = page;
            }
            catch (e) {
                console.warn("Unable to parse compendium entry: ",dir[i]);
            }
        }
    }
    catch(e) {
        console.warn("Unable to load compendium for",name);
        console.warn(`Run \`mimic --scrape \<username\> \<password\> \<compendium_name\>\` to download the compendium files.`);
    }
}
async function loadFile(dirent, directory) {
    let name = dirent.name || dirent;
    let fullname = (directory? directory+'/'+name : name).replace(/\/+/gi,"/");
    try {
        if (dirent.isDirectory && dirent.isDirectory()) {
            Object.assign(scripts,loadFiles(fullname));
        }
        else if (name.substring(name.length-3) === ".js") {
            if (scripts[name]) delete scripts[name];
            scripts[name] = fs.readFileSync(fullname);
            if (!watched[fullname])
                watched.push(fullname);
        }
        else if (name == "sheet.json") {
            let json = fs.readFileSync(fullname);
            try {
                let data = JSON.parse(json);
                HTMLnameprev = HTMLname;
                comp_name_prev = comp_name;
                HTMLname =  (directory + "/" + data.html).replace(/\/+/gi,'/');
                comp_name = comp_name || data.compendium;
                if (HTMLnameprev != HTMLname) {
                    if (HTMLnameprev)
                        watched.replace(HTMLnameprev,HTMLname);
                    else
                        watched.push(HTMLname);
                    await loadHTML();
                }
                if (comp_name_prev != comp_name) {
                    await loadCompendium(comp_name);
                }
            }
            catch(e) {log("Error parsing sheet.json:",e);}
            watched.push(fullname);
        }
        else if (name.substring(name.length-5) === ".json") {
            let json = fs.readFileSync(fullname);
            try {
                translations[name.substring(0,name.length-5)] = JSON.parse(json.toString());
            }
            catch(e) {log("Error parsing translations.json:",e);}
            watched.push(fullname);
        }
    }
    catch (e) {
        log("ERROR LOADING FILE: ",fullname,"\n ERROR: ", e);
    }
}
async function loadFiles(directory, filenames = []) {
    if (filenames.length == 0) {
        try {
            filenames = fs.readdirSync(directory, {withFileTypes:true});
            let names = [];
            filenames.forEach((filename)=>{names.push(filename.name)});
            if (verbose) log("Scraped filenames from dir:",directory,names);
        }
        catch(e) {
            log("ERROR: Directory not found: ",directory);
            log(e);
            process.exit(1);
        }
    }
    for (i in filenames) {
        loadFile(filenames[i], directory);
    }
}

//-- Roll20 Emulation
function definePostMessage(contextobj) {
    return function postMessage(message) {
        // TODO:
        // fill out this switch
        // return appropriate values to messageHandler
        // several front-end events can just be ignored (e.g. setCharmancerText)

        typeMap = {
            "eval": "eval",
            "trigger":"trigger",
            "attrreq":"attrreqfulfilled",
            "attrlist":"attrlistreqfulfilled",
            "setattrs":"setattrreqfulfilled",
            "getcompendiumpage":"attrreqfulfilled",
            "getcompendiumquery":"attrreqfulfilled",
            "":"setActiveCharacter",
            "loadTranslationStrings":"loadTranslationStrings",
            "":"setCharmancerData"
        }

        returned = {data: {id: message.id, type: typeMap[message.type]}};
        switch(message.type) {
            default: //passthrough
            returned.data.data = message.data;
                break;
            case("getcompendiumpage"):
            if (comp) {
                let arr = message.data;
                if (typeof(message.data) == "string") {
                    arr = [];
                    arr.push(message.data);
                }
                returned.data.data = {};
                for (i in arr) {
                    Object.assign(returned.data.data,(comp[message.data].data));
                    mancer.current_page = comp[message.data].data;
                }
            }
            else
                console.warn("Trying to get compendium page when no compendium has been set.");
            break;
            case("getcompendiumquery"):
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

                returned.data.data = matched_pages;
            }
            else
                console.warn("Trying to get compendium page when no compendium has been set.");
            break;
            case("setattrs"):
            let data = message.data;
            for (i in data) {
                let event = {};
                event.previous_value = attrs[i];
                event.updated_value = data[i];
                event.sourceSection = message.sourceSection || '';
                event.oattr = message.oattr || '';
                event.eventname = `${i}`;
                event.sourcetype = "worker";

                attrs[i] = data[i];
                let found = contextobj.dom.window.document.querySelectorAll(`[name=attr_${i}]`);

                found.forEach((node)=>{
                    node.setAttribute("value",i);
                    if (verbose)
                        log("HTML node updated",node.outerHTML);
                })

                if (!message.options || !message.options.silent) {
                    contextobj.trigger(event);
                }
            }
            break;
            case("attrreq"):
            case("attrlist"):
            returned.data.data = {};
            if (Array.isArray(message.data)) {
                for (i in message.data) {
                    returned.data.data[message.data[i]] = attrs[message.data[i]];
                }
            }
            break;
        }
        contextobj.messageHandler(returned);
    }
}
function setDefaultAttrs() {
    const contextobj = {
        _:_,
        console:console,
        dom: dom
    };

    vm.createContext(contextobj);
    Object.assign(contextobj,r20.api.api);
    contextobj.postMessage = definePostMessage(contextobj);
    vm.runInContext(r20.workers.init(contextobj,eval,_),contextobj);

    //load English translations by default
    if (translations) {
        if (verbose) log("Parsing translations");
        contextobj.postMessage({
            type:"loadTranslationStrings",
            data:{values:translations["en"], lang:"en"}
        });
    }
    attrs["character_name"] = "Character Name";
    mancer.data = {};
    let found = dom.window.document.querySelectorAll("[name*=attr_]");
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

     dom.window.document.querySelectorAll("[type=action][name*=act_]").forEach((node)=>{
        if (node.getAttribute) {
            node.onclick = ()=>{
                let name = "clicked:" + node.getAttribute("name").replace("act_","");
                let message = {
                    eventname: name,
                    triggerType: "player",
                    oattr: node
                };
                contextobj.trigger(message)
            };
        }
    });
    return contextobj;
}
function resetAttrs() {
    Object.keys(attrs).forEach(k=>delete attrs[k]);
    Object.keys(mancer.data).forEach(k=>delete mancer.data[k]);
    delete contextobj;
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