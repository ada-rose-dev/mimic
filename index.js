#!/usr/bin/env node
//--
//-- simple code verifier
//-- created by phoenix ada rose mandala for roll20 user collaboration
//--

//-- requires
const fs = require('fs');
const process = require('process');
const vm = require('vm');
const r20 = require('r20');
const _ = require('underscore');
const scraper = require('scraper');

const jsdom = require('jsdom');
const { dir } = require('console');
const { exit } = require('process');
const { isString } = require('r20/r20base');
const { captureRejectionSymbol } = require('events');
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.sendTo(console);
const {JSDOM} = jsdom;
const dom = new JSDOM(``, {virtualConsole});

const node_exe = process.argv.shift();
const thisdir = process.argv.shift();

const attrs = {};

//-- boot
var target_dir;
var watch;
var scrape;
const comp = [];
const mancer = {
    current_page: "",
    data: {}
};
var filenames = [];
for (var i = 0; i < process.argv.length; ++i) {
    if (process.argv[i] == "--watch") {
        watch = true;
    }
    else if (process.argv[i].search("--comp") !== -1) {
        var name = process.argv[i].substr(process.argv[i].search('=')).replace(/\=|\"|\'/gi,"").replace(" ","%20");
        loadCompendium(name,comp);
    }
    else if (process.argv[i] == "--scrape") {
        scrape = true;
        (async function () {
            await scraper.scrape(process.argv[++i],process.argv[++i],process.argv[++i]);
            log("Scrape finished.");
            process.exit(1);
        })();
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


//-- Main loop
function mainLoop(directory,filenames,watch) {
    console.log("\x1b[34mProcessing directory ",directory);
    if (filenames.length !== 0) {
        console.log("Verifying files:",...filenames,"\x1b[0m");
    }
    runScripts(loadFiles(directory,filenames));
    if (watch) {
        log("Watching for changes. Press ^C to exit.");
        var waiting = false;
        fs.watch(directory, (event, filename)=>{
            if(waiting) {return;}
            waiting = true;
            runScripts(loadFiles(directory,filenames));
            setTimeout(()=>{waiting = false;}, 1000);
        });
    }

}
function loadFiles(directory, filenames) {
    const scripts = {};
    if (filenames.length == 0) {
        try {
            filenames = fs.readdirSync(target_dir);
            log("Scraped filenames",filenames);
        }
        catch(e) {
            log("ERROR: Directory not found: ",target_dir);
            log(e);
            process.exit(1);
        }
    }
    for (i in filenames) {
        try {
            if (filenames[i].search(".js") > 0) {
                scripts[filenames[i]] = fs.readFileSync(directory + "/" + filenames[i]);
            }
        }
        catch (e) {
            log("ERROR LOADING FILE: ",filenames[i],"\n ERROR: ", e);
        }
    }
    if (!scripts) {
        log("No scripts found! Exiting.");
        process.exit(1);
    }
    return scripts;
}
function runScripts(scripts) {
    try {
        const contextobj = {
            _:_,
            console:console
        };
        vm.createContext(contextobj);
        Object.assign(contextobj,dom);
        Object.assign(contextobj,r20.api.api);
        contextobj.postMessage = definePostMessage(contextobj);
        vm.runInContext(r20.workers.init(contextobj,eval,_),contextobj);

        setDefaultAttrs();
        for (i in scripts) {
            vm.runInContext(scripts[i],contextobj,i);
        }
        resetAttrs();
    }
    catch (e) {
        log("ERROR:",e);
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
            "":"loadTranslationStrings",
            "":"setCharmancerData"
        }

        returned = {data: {id: message.id, type: typeMap[message.type]}};
        switch(message.type) {

            case("getcompendiumpage"):
            if (comp) {
                var arr = message.data;
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
                var data = message.data[0],
                    query = {},
                    matched_pages = [];

                if (typeof(data) === "string") {
                    data = data.split(" ");
                }
                for (i in data) {
                    var obj = data[i].split(":");
                    query[obj[0]] = new RegExp(obj[1],"i");    
                }
                try {
                    for (i in comp) {
                        var page = comp[i];
                        matched = false;
                        for (qkey in query) {
                            for (dkey in page.data) {
                                var val = page.data[dkey];
                                var regex = query[qkey];
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
    attrs["character_name"] = "Character Name";
    mancer.data = {};
}
function resetAttrs() {
    Object.keys(attrs).forEach(k=>delete attrs[k]);
    Object.keys(mancer.data).forEach(k=>delete mancer.data[k]);
}

async function loadCompendium(name,compendium) {
    log("Loading data for",name,"compendium...")
    try {
        var dir = fs.readdirSync(__dirname+"/scraper/cache/"+name);
        for(i in dir) {
            try {
                var page = fs.readFileSync(__dirname+"/scraper/cache/"+name+'/'+dir[i]);
                page = JSON.parse(page);
                compendium[page.name] = page;
            }
            catch (e) {
                console.warn("Unable to parse compendium entry: ",dir[i]);
            }
        }
    }
    catch(e) {
        console.warn("Unable to load compendium for",name);
        console.warn("Run `verifyjs --scrape username password",name,"` to download the compendium files.");
    }
}