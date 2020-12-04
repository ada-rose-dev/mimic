function testMancer() {
    console.log("TESTING MANCER...");
    let sheet = {
        attrs: [
            "span",
            "hidden",
            "checkbox",
            "textInput",
            "radioInput"
        ],
        repsecs: [
            "type1",
            "type2"
        ],
        buttons: [
            "button",
            "startMancer"
        ],
        pages: [
            "slide1",
            "slide2"
        ]
    };
    let results = {};

    on("page:slide1 page:slide2", (info)=>{
        addRepeatingSection("repeating","type1","addedType",(res)=>{
            results["addRepeatingSection"] = res;
            addRepeatingSection("repeating","type1",(res)=>{
                results["addRepeatingSectionAgain"] = res;
                getRepeatingSections("repeating",(res)=>{
                    results["getRepeatingSections"] = res;
                });
                getSectionIDs("type1",(res)=>{
                    setCharmancerText({"to-be-modified":"Hello, World!"});
                    changeCompendiumPage("iframe","Rules:Races");
            
                    setCharmancerOptions("mancer-select","Index:Equipment Type:PC%20Equipment", {
                        category: "Manual",
                        disable: ["b"],
                        selected: "c",
                        add: ["a","b","c"],
                        show_source: true
                    },(res)=>{
                        results["setCharmancerOptions"] = res;
                    })
                    disableCharmancerOptions("mancer-select",["a"]);
            
                    hideChoices(["example"]);
                    showChoices(["example"]);
            
                    getCompendiumPage("Rules:Races", (data)=>{results["getCompendiumPage"] = data;});
                    getCompendiumQuery("TODO", (data)=>{results["getCompendiumQuery"] = data;});

                    let newvals = {};
                    for (let i in sheet.repsecs) {
                        let id = generateRowID();
                        for (let j in sheet.attrs) {
                            newvals[sheet.attrs[j]] = j;
                            newvals[`repeating_${sheet.repsecs[i]}_${sheet.attrs[j]}`] = `by sectionname: ${j}`;
                            newvals[`repeating_${sheet.repsecs[i]}_${id}_${sheet.attrs[j]}`] = `by id: ${j}`;
                        }
                    }
                    setAttrs(newvals, (res)=>{
                        results["setAttrs"] = res;
                    });

                    clearRepeatingSectionById(res[0],(res)=>{results["clearRepeatingSectionByID"] = res;});
                    clearRepeatingSections("repeating",(res)=>{results["clearRepeatingSections"] = res;});
                    console.log(results);
                });
            });
        });

        getCharmancerData();
        deleteCharmancerData(["slide1"]);

        changeCharmancerPage("final");
    });
    on("page:final", (info)=>{
        results["page:final"] = info;
        finishCharactermancer();
    });

    startCharactermancer("slide1");
    console.log(results);
}

console.log("in testMancer.js ...");