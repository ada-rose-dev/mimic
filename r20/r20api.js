//-------------------------------------------------------------------------------------------------
//-- Documented API.js
//-- Phoenix Mandala
//-------------------------------------------------------------------------------------------------
//-- This sheet lists all the relevant API calls available in SheetsAndBoxWorkers.js.
//-- Every function in this sheet is available to call without any prior setup.
//-------------------------------------------------------------------------------------------------
//-- ABOUT: postMessage()
//-- Messages are passed between the d20 system and the iframe containing the charmancer or custom sheet.
//-- For general info about how messages work, see:
//-- [https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage]
//-- For information on how passed messages are interpreted, see `Documented Source.js`
//-------------------------------------------------------------------------------------------------

exports.api = {
    //-------------------------------------------------------------------------------------------------
    //-- CHARMANCER API
    //-------------------------------------------------------------------------------------------------
    //void startCharactermancer(initial_page_name)
    startCharactermancer: function(buildType) {

        if(_activeCharacterId === false) {
            console.log("Character Sheet Error: Trying to start the Charactermancer when no character is active in sandbox.");
            return;
        }

        postMessage({
            type: 'startcharactermancer',
            data: buildType,
            id: _activeCharacterId
        });
    },

    //void setCharmancerText(updates)
    setCharmancerText: function(updates) {
        if(_activeCharacterId === false) {
            console.log("Character Sheet Error: Trying to start the Charactermancer when no character is active in sandbox.");
            return;
        }

        if(updates === null || typeof updates !== 'object' || Object.keys(updates).length < 1) {
            console.log("Character Sheet Error: Trying to set charactermancer text but no updates were provided.");
            return;
        }

        postMessage({
            type: 'setcharmancertext',
            data: updates,
            id: _activeCharacterId
        });
    },

    //void setCharmancerOptions(target_class, select_options, <options>, <callback()>)
    setCharmancerOptions: function(target_class, select_options, options, callback) {
        if(_activeCharacterId === false) {
            console.log("Character Sheet Error: Trying to start the Charactermancer when no character is active in sandbox.");
            return;
        }

        options = options || {};

        var reqid = _activeCharacterId + "//" + target_class + "//" + _generateAttrID();
        _waitingAttrRequests[reqid] = callback;
        postMessage({
            type: 'setcharmanceroptions',
            data: select_options,
            options: options,
            target: target_class,
            id: _activeCharacterId,
            reqid: reqid
        });
    },

    //void disableCharmancerOptions(target_class, data_to_disable, options)
    disableCharmancerOptions: function(target_class, disable, options) {
        if(_activeCharacterId === false) {
            console.log("Character Sheet Error: Trying to start the Charactermancer when no character is active in sandbox.");
            return;
        }

        options = options || {};

        postMessage({
            type: 'disablecharmanceroptions',
            data: disable,
            options: options,
            target: target_class,
            id: _activeCharacterId
        });
    },

    //object getCharmancerData()
    getCharmancerData: function() {
        if(_activeCharacterId === false) {
            console.log("Character Sheet Error: Trying to start the Charactermancer when no character is active in sandbox.");
            return;
        }
        delete _charmancerData[_activeCharacterId].undefined;
        return _charmancerData[_activeCharacterId];
    },

    //void deleteCharmancerData(pages[], <callback()>)
    deleteCharmancerData: function(pages, callback) {
        if(_activeCharacterId === false) {
            console.log("Character Sheet Error: Trying to start the Charactermancer when no character is active in sandbox.");
            return;
        }

        // if(callback == undefined) {
        // 	callback = pages;
        // 	pages = [];
        // }

        var reqid = _activeCharacterId + "//false//" + _generateAttrID();
        _waitingAttrRequests[reqid] = callback;

        postMessage({
            type: 'deletecharmancerdata',
            data: pages,
            id: _activeCharacterId,
            reqid: reqid
        });
    },

    changeCharmancerPage: function(page, callback) {
        if(_activeCharacterId === false) {
            console.log("Character Sheet Error: Trying to change the Charactermancer slide no character is active in sandbox.");
            return;
        }

        if(!page) {
            console.log("You must specify a page to switch to.");
            return;
        }

        var reqid = _activeCharacterId + "//" + _generateAttrID();
        if(callback) {
            _waitingAttrRequests[reqid] = callback;
        }

        postMessage({
            type: 'changecharmancerpage',
            data: page,
            id: _activeCharacterId,
            reqid: reqid
        });
    },

    finishCharactermancer: function() {

        if(_activeCharacterId === false) {
            console.log("Character Sheet Error: Trying to do finishCharactermancer when no character is active in sandbox.");
            return;
        }

        postMessage({
            type: "finishcharactermancer",
            characterid: _activeCharacterId
        });
    },

    //void showChoices(string classes_to_show[])
    showChoices: function(class_array) {
        if(_activeCharacterId === false) {
            console.log("Character Sheet Error: Trying to start the Charactermancer when no character is active in sandbox.");
            return;
        }

        if(!Array.isArray(class_array) || class_array.length < 1) {
            console.log("Character Sheet Error: Trying to show choices but no choices were provided.");
            return;
        }

        postMessage({
            type: 'showchoices',
            data: class_array,
            id: _activeCharacterId
        });
    },

    hideChoices: function(class_array) {
        if(_activeCharacterId === false) {
            console.log("Character Sheet Error: Trying to start the Charactermancer when no character is active in sandbox.");
            return;
        }

        if((!Array.isArray(class_array) || class_array.length < 1) && class_array != undefined) {
            console.log("Character Sheet Error: Trying to hide choices but no choices were provided.");
            return;
        }

        postMessage({
            type: 'hidechoices',
            data: class_array,
            id: _activeCharacterId
        });
    },

    //-------------------------------------------------------------------------------------------------
    //-- COMPENDIUM API
    //-------------------------------------------------------------------------------------------------

    getCompendiumPage: function(uniquePageName, savefields, callback) {
        if(_activeCharacterId === false) {
            console.log("Character Sheet Error: Trying to do get a Compendium page when no character is active in sandbox.");
            return;
        }
        if(_activeTrigger === false) {
            console.log("Character Sheet Error: Cannot get a Compendium page without an event trigger.");
            return;
        }
        if(!uniquePageName || uniquePageName == "") {
            uniquePageName = "";
            console.log("Trying to fetch Compendium page, but no page specified.");
        }

        if(callback == undefined) {
            callback = savefields;
            savefields = [];
        }

        var reqid = _activeCharacterId + "//" + uniquePageName + "//" + _generateAttrID();
        _waitingAttrRequests[reqid] = callback;
        postMessage({
            type: 'getcompendiumpage',
            data: uniquePageName,
            savefields: savefields,
            field: _activeTrigger,
            charid: _activeCharacterId,
            id: reqid
        });
    },

    getCompendiumQuery: function(compendiumQuery, callback) {
        if(_activeCharacterId === false) {
            console.log("Character Sheet Error: Trying to do get a Compendium page when no character is active in sandbox.");
            return;
        }
        if(!compendiumQuery || compendiumQuery == "") {
            console.log("Trying to query the Compendium, but no page was given.");
            return;
        }
        if(typeof compendiumQuery == "string") {
            compendiumQuery = [compendiumQuery];
        }

        var reqid = _activeCharacterId + "//" + compendiumQuery + "//" + _generateAttrID();
        _waitingAttrRequests[reqid] = callback;
        postMessage({
            type: 'getcompendiumquery',
            data: compendiumQuery,
            charid: _activeCharacterId,
            id: reqid
        });
    },

    dropCompendiumData: function(target_class, compendiumData, callback) {
        if(_activeCharacterId === false) {
            console.log("Character Sheet Error: Trying to drop Compendium data when no character is active in sandbox.");
            return;
        }
        if(!compendiumData || compendiumData === null || typeof compendiumData !== 'object') {
            console.log("Trying to drop Compendium data, but data is not valid.");
            return;
        }

        if(!target_class || target_class == "") {
            console.log("Trying to drop Compendium data, but no compendium drop target was specified.");
            return;
        }

        var reqid = _activeCharacterId + "//" + target_class + "//" + _generateAttrID();
        _waitingAttrRequests[reqid] = callback;
        postMessage({
            type: 'dropcompendiumdata',
            data: compendiumData,
            id: reqid
        });
    },

    changeCompendiumPage: function(target_class, uniquePageName, options) {
        if(_activeCharacterId === false) {
            console.log("Character Sheet Error: Trying to display a compendium page when no character is active in sandbox.");
            return;
        }

        postMessage({
            type: 'changecompendiumpage',
            data: uniquePageName,
            target: target_class,
            options: options,
            id: _activeCharacterId
        });
    }
}