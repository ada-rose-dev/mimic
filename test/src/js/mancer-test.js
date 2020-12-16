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

    on("mancerchange:checkbox mancerroll:button remove:repeating_type1 remove:repeating_type2",(info) => {
        results[info.sourceAttribute] = results[info.sourceAttribute] || [];
        results[info.sourceAttribute].push(info);
    })
    on("mancer:cancel",(info) => {
        console.log("mancer:cancel",info);
        startCharactermancer("slide2");
    });

    on("page:slide1", (info)=>{results
        let selectors = [
            "button[type=action][name*=act_]",
            "button[type=roll][name*=roll_]",
            "button[type=submit]",
            "button[type=back]",
            "button[type=cancel]",
        ];
        document.querySelectorAll(selectors.join()).forEach((node)=>{
            node.dispatchEvent(new MouseEvent('click'));
        });})

    on("page:slide2", (info)=>{
        addRepeatingSection("repeating","type1","addedType",(res)=>{
            results["addRepeatingSection"] = res;
            addRepeatingSection("repeating","type1",(res)=>{
                results["addRepeatingSectionAgain"] = res;
                getRepeatingSections("repeating",(res)=>{
                    results["getRepeatingSections"] = res;
                    let order = [res.list[0], res.list[1]];
                    setSectionOrder("repeating",order,(res)=>{
                        results["setSectionOrder"] = res;
                    })
                });

                getSectionIDs("type1",(res)=>{
                    setCharmancerText({"to-be-modified":"Hello, World!"});

                    changeCompendiumPage("iframe","Rules:Races");
            
                    setCharmancerOptions("mancer-select","Category:Equipment Type:PC%20Equipment", {
                        category: "Manual",
                        disable: ["b"],
                        selected: "c",
                        add: ["a","b","c"],
                        show_source: true
                    },(res)=>{
                        results["setCharmancerOptions"] = res;
                    })

                    disableCharmancerOptions("mancer-select",["a"]);
                    disableCharmancerOptions("mancer-select",[]);
            
                    hideChoices(["example"]);
                    showChoices(["example"]);
            
                    getCompendiumPage("Rules:Races", (data)=>{results["getCompendiumPage"] = data;});
                    getCompendiumQuery("Class:Solarian", (data)=>{results["getCompendiumQuery"] = data;});

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

                    
                    getCharmancerData();
                    deleteCharmancerData(["slide1"]);
                    document.querySelector("button[type='finish']").dispatchEvent(new MouseEvent("click"));
                });
            });
        });

    });
    on("mancerfinish:test", (info)=>{
        results["page:final"] = info;
        finishCharactermancer();
        console.log(results);
    });

    startCharactermancer("slide1");
}

console.log("in testMancer.js ...");