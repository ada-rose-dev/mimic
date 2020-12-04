//- requires
const fs = require('fs');
const _ = require('underscore');
const log = console.log;
const vm = require('vm');

//jsdom
const jsdom = require('jsdom');
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.sendTo(log);
const {JSDOM} = jsdom;
let jsdomOptions = {resources: "usable", runScripts: "dangerously"}
let dom = {}, window= {}, document = {}, script = "";

async function open(cwd,HTMLname,comp,translations,verbose) {
    verbose = verbose;

    log("Parsing HTML...");

    if (dom.window) dom.window.close();
    delete dom;

    let file = fs.readFileSync(HTMLname).toString().replace("<script type=\"text/worker\"","<script");
    let split = file.split(/\<\/?script>/);
    file = split[0];
    script = split[1];

    dom = new JSDOM(file, jsdomOptions);
    window = dom.window;
    document = window.document;
    
    function eval(name) {
        let pathname = `${cwd}/modules/${name}.js`;
        vm.runInContext(fs.readFileSync(pathname), dom.getInternalVMContext(), pathname);
    }

    eval("generic");
    window.sanitizeHTML(document.firstElementChild);
    //log("HTML Sanitized:",document.firstElementChild.outerHTML);
    eval("mimicEnvironment");
    window.initMimicEnvironment(window);
    eval("messageHandler");
    window.definePostMessage(window,comp);
    eval("r20workers");
    window.initR20(window,eval,_);
    eval("testEnvironment");
}

function run(script,name) {
    log(`\n${name}`);
    log("/-------------(.)-------------\\\nvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv")
    vm.runInContext(script, dom.getInternalVMContext(), name);
    log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n\\-----------------------------/")
}

function close() {
}

module.exports = {
    open: open,
    close: close,
    run: run,
}