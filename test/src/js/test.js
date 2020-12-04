//--
//-- Sheetworker constants
//--
function testSheet (){
    const results = {};
    const sheet = {
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
        ]
    }

    sheet.repeating_attrs = (()=>{
        let res = [];
        for (let i in sheet.respecs) {
            for (let j in sheet.attrs) {
                res.push(`repeating_${respecs[i]}_${attrs[j]}`);
            }
        }
        return res;
    })();

    //--
    //-- Events
    //--
    const repeating_attr_listener = (()=>{
        let res = "";
        for (let i of sheet.repsecs) {
            for (let j of sheet.attrs) {
                res += " change:repeating_"+i+':'+j;
            }
        }
        return res;
    })();

    const listener =
        "change:" + sheet.attrs.join(" change:") +
        repeating_attr_listener +
        "remove:repeating_" + sheet.repsecs.join(" remove:repeating_") +
        "sheet:opened" +
        "clicked:" + sheet.buttons.join(" clicked:");

    on(listener, (info)=>{
        results.events = results.events || [];
        results.events.push(info);
    });

    getAttrs(sheet.attrs.concat(sheet.repeating_attrs),(res)=>{
        if (!results["getAttrs"]) results["getAttrs"] = [];
        results["getAttrs"].push(res);
    })

    setAttrs((()=>{
        let newvals = {};
        for (let i in sheet.repsecs) {
            let id = generateRowID();
            for (let j in sheet.attrs) {
                newvals[sheet.attrs[j]] = j;
                newvals[`repeating_${sheet.repsecs[i]}_${sheet.attrs[j]}`] = `by sectionname: ${j}`;
                newvals[`repeating_${sheet.repsecs[i]}_${id}_${sheet.attrs[j]}`] = `by id: ${j}`;
            }
        }
        return newvals;
    })(),(res)=>{
        results.setAttrs = results.setAttrs || [];
        results.setAttrs.push(res);
    });

    getSectionIDs(sheet.repsecs[0], (sectionIDs)=>{
        results.getSectionIDs = results.getSectionIDs || [];
        results.getSectionIDs.push(sectionIDs);
        //get row specific attrs
        getAttrs((()=>{
            let _attrs = [];
            for (let i in sheet.repsecs) {
                for (let j in sheet.attrs) {
                    for (let k in sectionIDs) {
                        _attrs.push(`repeating_${sheet.repsecs[i]}_${sectionIDs[k]}_${sheet.attrs[j]}`);
                    }
                }
            }
            return _attrs;
        })(),(res)=>{
            results.getAttrs_repsecID = results.getAttrs_repsecID || [];
            results.getAttrs_repsecID.push(res);

            for (let i in sectionIDs) {
                removeRepeatingRow(`repeating_${sheet.repsecs[0]}_${sectionIDs[i]}`);
            }
        })
    });

    results.getTranslationByKey = getTranslationByKey("name");
    results.getTranslationLangauge = getTranslationLanguage();
    
    var default_attr = {};
    default_attr["width"] = 70;
    default_attr["height"] = 70;
    default_attr["bar1_value"] = 10;
    default_attr["bar1_max"] = 15;
    setDefaultToken(default_attr);

    console.log("RESULTS:",results);
}

on("sheet:opened", ()=>{
    //testSheet();
    testMancer();
});

if (mimic) {
    mimic.addRepeatingSections();
    mimic.triggerEvent("sheet:opened");
}