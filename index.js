#!/usr/bin/env node
//--
//-- simple code verifier
//-- created by phoenix ada rose mandala for roll20 user collaboration
//--
let mimic_img_64 = "                        yy■■■■■■■■■■■■■■yy                      \n                   yy■■yyyyyyyyyyyyyyyyyyyy■■■■y                \n              ■■yyyyyyyyyy          yyyyyyyyyyyy■■■■y           \n          ■■■■yyyyyyyyyy  ■■■■■■■■■■  yyyyyyyyyyyyyy■■y        \n       y■■yyyyyyyyyyyy  ■■■■      ■■■■  yyyyyyyyyyyyyy■■        \n     y■■yyyyyyyyyyyy  ■■■■          ■■■■  yyyyyyyyyyyyyy■■      \n    ■■yyyyyyyyyyyyyy  ■■■■■■      ■■■■■■  yyyyyyyyyyyyyy■■      \n  ■■yyyyyyyyyyyyyyyyyy  ■■■■■■■■■■■■    yyyyyyyyyyyyyyyy■■      \n  ■■yyyyyyyyyyyyyyyyyyyy                            yyyyyy      \n  ■■yyyyyyyyyyyyyyyy        ■■■■  ■■■■■■■■yy  ■■■■■■    yyyy    \n    ■■yyyyyyyy      ■■  ■■yy■■■■  ■■yy■■■■    ■■yy■■  yy        \n    yyyy      ■■■■■■    ■■yy■■■■    ■■■■        ■■■■  yy        \n    yy  yy■■■■yy■■■■      ■■yy■■    ■■    ■■    ■■              \n  yy  ■■■■  ■■yy■■          ■■          ■■■■        ■■          \n      ■■      ■■      ■■                ■■■■■■      ■■■■        \n          ■■  ■■    ■■■■                ■■yy■■    ■■yy■■yy      \n          ■■      ■■■■yy■■  ■■  yyyy  yy■■yyyy  ■■yyyy■■  yyyy  \n          ■■■■  ■■■■■■yy  ■■  yy■■■■yy                    yy    \n          ■■yy■■■■■■yy    ■■  yy■■■■■■    yyyyyyyyyyyyyyyyyy    \n        yy■■■■        yyyy  ■■  ■■■■■■■■  yyyyyyyyyyyyyyyy■■    \n              yyyyyyyyyyyyyy  ■■yy■■■■■■  yyyy    yyyyyyyy■■    \n        yyyyyyyyyyyyyyyyyyyy  ■■  yy■■■■■■    ■■■■  yyyy■■      \n      yyyy■■■■yyyyyyyyyyyyyyyy  ■■  yy■■■■■■■■  yy■■  yy■■      \n            ■■■■yyyyyyyyyyyyyyyy  ■■  yyyyyy  ■■        ■■      \n              ■■yyyyyyyyyyyyyyyyyy  ■■      ■■    ■■  ■■■■      \n              ■■yyyyyyyyyy            ■■■■■■      ■■      ■■    \n                ■■yyyy    ■■■■■■■■■■            ■■  yy          \n                ■■yy  ■■■■                      ■■yyyy          \n                ■■  ■■                          ■■yyyy          \n                ■■■■                              ■■            \n              ■■                                                ";
let mimic_img_32 = "       _.====~~~~===.._            \n    == ~~~~~~     ~~~ ===.       \n  = ~~~~~~~ ,■■■■■, ~~~~ ==.     \n = ~~~~~~~ ■■   . ■■ ~~~~~ ==.   \n ====.~~~~ ,■■   ■■, ~~~~~~~ =  \n //  `==== ~~~~~~~~~~~~~~~~~ .\n/   //  \\\\  \\\\   \\\\ `==========  \n   /      \\    \\   \\    \\\\   \\\\ \n \\    /    /        /    /\\  / \\\n \\\\  //  // /.***\\ //   //  //  \n ========= | .****\\ ~~~~~~~ =   \n = ~~~~~~~ | .******\\,** ~~ =.  \n = ~~~~~~~~ \\ .******/ ||~~~ = \n `= ~~~~~~~~~ \\ .***/  /\\ ~~ = \n  = ~~~~~~~~~~~~~~~~~ | *| ===\n  ============``       --      \n";
let title = "MIMIC v0.01";

//-- requires
//nodejs
const fs = require('fs');
const process = require('process');
const vm = require('vm');

//custom
const scraper = require('scraper');
const {Mimic, log} = require('./modules/mimic');

//external
const jsdom = require('jsdom');
console.log(title);
log("Starting up...");
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.sendTo(log);
const {JSDOM} = jsdom;
let jsdomOptions = {virtualConsole}
let dom = {};

//global variables
const comp = [];
const scripts = {};
const watched = {}; //name: fullname
const translations = {};
let HTMLname = "";
let comp_name = "";
let verbose = false;

//-- boot
(boot = () => {
    //cull node call and directory
    process.argv.shift();
    process.argv.shift();

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

        let mimic = new Mimic(dom, comp, translations);
        for (i in scripts) {
            vm.runInContext(scripts[i],mimic,i);
        }
        delete mimic;
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
                    await loadHTML();
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
            catch(e) {log("Error parsing translations.json:",e);}
            watched[name] = fullname;
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