#!/usr/bin/env node
//--
//-- simple code verifier
//-- created by phoenix ada rose mandala for roll20 user collaboration
//--
let mimic_img_64 = "                        yy■■■■■■■■■■■■■■yy                      \n                   yy■■yyyyyyyyyyyyyyyyyyyy■■■■y                \n              ■■yyyyyyyyyy          yyyyyyyyyyyy■■■■y           \n          ■■■■yyyyyyyyyy  ■■■■■■■■■■  yyyyyyyyyyyyyy■■y        \n       y■■yyyyyyyyyyyy  ■■■■      ■■■■  yyyyyyyyyyyyyy■■        \n     y■■yyyyyyyyyyyy  ■■■■          ■■■■  yyyyyyyyyyyyyy■■      \n    ■■yyyyyyyyyyyyyy  ■■■■■■      ■■■■■■  yyyyyyyyyyyyyy■■      \n  ■■yyyyyyyyyyyyyyyyyy  ■■■■■■■■■■■■    yyyyyyyyyyyyyyyy■■      \n  ■■yyyyyyyyyyyyyyyyyyyy                            yyyyyy      \n  ■■yyyyyyyyyyyyyyyy        ■■■■  ■■■■■■■■yy  ■■■■■■    yyyy    \n    ■■yyyyyyyy      ■■  ■■yy■■■■  ■■yy■■■■    ■■yy■■  yy        \n    yyyy      ■■■■■■    ■■yy■■■■    ■■■■        ■■■■  yy        \n    yy  yy■■■■yy■■■■      ■■yy■■    ■■    ■■    ■■              \n  yy  ■■■■  ■■yy■■          ■■          ■■■■        ■■          \n      ■■      ■■      ■■                ■■■■■■      ■■■■        \n          ■■  ■■    ■■■■                ■■yy■■    ■■yy■■yy      \n          ■■      ■■■■yy■■  ■■  yyyy  yy■■yyyy  ■■yyyy■■  yyyy  \n          ■■■■  ■■■■■■yy  ■■  yy■■■■yy                    yy    \n          ■■yy■■■■■■yy    ■■  yy■■■■■■    yyyyyyyyyyyyyyyyyy    \n        yy■■■■        yyyy  ■■  ■■■■■■■■  yyyyyyyyyyyyyyyy■■    \n              yyyyyyyyyyyyyy  ■■yy■■■■■■  yyyy    yyyyyyyy■■    \n        yyyyyyyyyyyyyyyyyyyy  ■■  yy■■■■■■    ■■■■  yyyy■■      \n      yyyy■■■■yyyyyyyyyyyyyyyy  ■■  yy■■■■■■■■  yy■■  yy■■      \n            ■■■■yyyyyyyyyyyyyyyy  ■■  yyyyyy  ■■        ■■      \n              ■■yyyyyyyyyyyyyyyyyy  ■■      ■■    ■■  ■■■■      \n              ■■yyyyyyyyyy            ■■■■■■      ■■      ■■    \n                ■■yyyy    ■■■■■■■■■■            ■■  yy          \n                ■■yy  ■■■■                      ■■yyyy          \n                ■■  ■■                          ■■yyyy          \n                ■■■■                              ■■            \n              ■■                                                ";
let mimic_img_32 = "       _.====~~~~===.._            \n    == ~~~~~~     ~~~ ===.       \n  = ~~~~~~~ ,■■■■■, ~~~~ ==.     \n = ~~~~~~~ ■■   . ■■ ~~~~~ ==.   \n ====.~~~~ ,■■   ■■, ~~~~~~~ =  \n //  `==== ~~~~~~~~~~~~~~~~~ .\n/   //  \\\\  \\\\   \\\\ `==========  \n   /      \\    \\   \\    \\\\   \\\\ \n \\    /    /        /    /\\  / \\\n \\\\  //  // /.***\\ //   //  //  \n ========= | .****\\ ~~~~~~~ =   \n = ~~~~~~~ | .******\\,** ~~ =.  \n = ~~~~~~~~ \\ .******/ ||~~~ = \n `= ~~~~~~~~~ \\ .***/  /\\ ~~ = \n  = ~~~~~~~~~~~~~~~~~ | *| ===\n  ============``       --      \n";
console.log("MIMIC v0.01\nStarting up...");
//-- requires
//nodejs
const fs = require('fs');
const process = require('process');

//custom
const scraper = require('scraper');
const mimic = require('./modules/mimic');

//global variables
const comp = [];
const scripts = {};
const watched = {}; //name: fullname
const translations = {};
let HTMLname = "";
let comp_name = "";
let verbose = false;
let cwd = "";

debugger;
//-- boot
(boot = () => {
    //cull node call and directory
    process.argv.shift();
    cwd = process.argv.shift().replace("index.js","");

    //define variables
    let target_dir;
    let watch;
    let scrape;
    let filenames = [];
    let mimic_img = mimic_img_32;

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
            else if (process.argv[i] == "--noimg") {
                mimic_img = "";
            }
            else {
                console.warn("Unknown parameter passed:",process.argv[i]);
            }
        }
        else if (!target_dir) {
           target_dir = process.argv[i].replace("./",process.cwd());
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

    if (mimic_img) console.log(mimic_img);

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
//TODO: watch seems to be reloading files incorrectly - seems like it only gets partway through the new file before trying to execute it
async function mainLoop(directory,filenames,watch) {
    if (verbose) {
        log("Processing directory: ",directory);
        if (filenames.length !== 0) {
            log("Verifying files:",...filenames);
        }
    }
    log("Loading files...");
    await loadInternals();
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
        await mimic.open(cwd,HTMLname,comp,translations,verbose);
        for (let i in scripts) {
            mimic.run(scripts[i],i);
        }
        mimic.close();
    }
    catch (e) {
        log("MIMIC: ERROR RUNNING SCRIPT:",e);
        debugger;
    }
}

//-- Asset loading
async function loadCompendium(name) {
    log(`Loading data for ${name} compendium...`)
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
async function loadInternals() {
    loadFiles(cwd+"/modules/",[],true);
}
async function loadFile(dirent, directory, internal) {
    let name = dirent.name || dirent;
    let fullname = (directory? directory+'/'+name : name).replace(/\/+/gi,"/");
    try {
        if (dirent.isDirectory && dirent.isDirectory()) {
            Object.assign(scripts,loadFiles(fullname,[],internal));
        }
        else if (name.substring(name.length-3) === ".js") {
            if (!internal) {
                if (scripts[fullname]) delete scripts[fullname];
                scripts[fullname] = fs.readFileSync(fullname);
            }
            watched[name] = fullname;
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
                    watched["html"] = HTMLname;
                }
                if (comp_name_prev != comp_name) {
                    await loadCompendium(comp_name);
                }
            }
            catch(e) {log("Error parsing sheet.json:",e);}
            watched[name] = fullname;
        }
        else if (name.substring(name.length-5) === ".json") {
            let json = fs.readFileSync(fullname);
            try {
                translations[name.substring(0,name.length-5)] = JSON.parse(json.toString());
            }
            catch(e) {log("Error parsing translations.json:",e,json.toString());}
            watched[name] = fullname;
        }
    }
    catch (e) {
        log("ERROR LOADING FILE: ",fullname,"\n ERROR: ", e);
    }
}
async function loadFiles(directory, filenames = [], internal = false) {
    if (filenames.length == 0) {
        try {
            filenames = fs.readdirSync(directory, {withFileTypes:true});
            let names = [];
            filenames.forEach((filename)=>{names.push(filename.name)});
            if (verbose) {
                //log("Scraped filenames from dir:",directory,names);
            }
        }
        catch(e) {
            log("ERROR: Directory not found: ",directory);
            log(e);
            process.exit(1);
        }
    }
    for (i in filenames) {
        loadFile(filenames[i], directory, internal);
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