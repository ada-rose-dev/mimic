//--
//-- scraper
//-- basic compendium scraper for roll20
//-- downloads compendium JSON data
//--


const Nightmare = require('nightmare');
const nightmare = Nightmare({show:false});
const fs = require('fs');
/*
const prompt = require('prompt-sync')();
const process = require('process');

const node_exe = process.argv.shift();
const thisdir = process.argv.shift();
const email = process.argv.shift() || prompt("Please enter your email:");
const pass = process.argv.shift() || prompt("Please enter your password:");
const comp_name = process.argv.shift() || prompt("Please enter the name of the compendium:");
exports.scrape(email,pass,comp_name);
*/

//TODO: Multithread with workers
exports.scrape = async function (email, pass, comp_name, id_map = [], cache_dir = "") {
    //Set up
    comp_name = comp_name.toLowerCase();
    if (!cache_dir) cache_dir = __dirname + "\\cache\\" + comp_name+"\\";
    try {
        fs.mkdirSync(__dirname + "\\cache\\",()=>{});
    }
    catch(error) {}
    try {
        fs.mkdirSync(cache_dir,()=>{});
        console.log("made cache: ",cache_dir);
    }
    catch(error) {}

    //Scrape
    try {
        // Log in and get primary pages
        console.log("logging in...")
        await nightmare
            .goto('https://app.roll20.net/sessions/new')
            .wait("#signin")
            .insert("#email", email)
            .insert("#password", pass)
            .click("#login")
            .wait("div.profilemeta");
        console.log("success!");

        //Get compendium books
        console.log("scraping books...")
        var hrefs = await nightmare.goto(`https://roll20.net/compendium/${comp_name}/BookIndex`)
            .wait("#pagecontent")
            .evaluate(()=>{
                var links = document.querySelectorAll("#pagecontent div a");
                var hrefs = [];
                for (var i = 0; i < links.length; i++) {
                    hrefs[i] = links[i].href;
                }
                return hrefs;
            });
        console.log(hrefs);

        //asynchronously scrape the compendium items
        console.log("scraping links...")
        var links = [];
        for (var i in hrefs) {
            var pages = await nightmare.goto(hrefs[i])
                .wait("#pagecontent")
                .evaluate(()=>{
                    var links = document.querySelectorAll("#pagecontent div a");
                    var subpages = [];
                    for (var i = 0; i < links.length; i++) {
                        subpages.push(links[i].href);
                    }
                    return subpages;
                });
            links.push(pages);
            links = links.flat();
        }
        console.log("found",links.length,"pages");
        console.log("converting data...")
        for (var i in links) {
            if (!links[i]) {
                console.warn(`(${i}/${links.length})`, "(empty url)");
                continue;
            }
            try {
            var json = await nightmare.goto(links[i])
                .exists("#editAttrs")
                .click("#editAttrs > div > a") //risky - navigate to dataview page
                .evaluate(()=>{
                    return page;
                });
                try {
                    var filepath = cache_dir+json.name+".json";
                    id_map[json.name] = json.id;
                    json = JSON.stringify(json);
                    fs.writeFileSync(filepath, json,()=>{});
                    console.log(`(${i}/${links.length})`,"wrote ",filepath);
                }
                catch(e) {console.error(`(${i}/${links.length})`,"unable to parse JSON for page id ",json.id);}
            }
            catch(e) {
                console.warn(`(${i}/${links.length})`,"Unable to find attributes for URL",links[i]);
            }
        }
    }
    catch (error) {
        console.log("Unable to scrape compendium!")
        console.error(error);
    }

    try {
        fs.writeFile(cache_dir+"id_map.json",JSON.stringify(id_map),()=>{console.log("wrote",cache_dir+"id_map.json")});
    }
    catch(e) {
        console.warn("Unable to cache id_map!",e);
    }
    return id_map;
}
