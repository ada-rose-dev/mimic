exports.init = function (self, globalEval, globalUnderscore) {
	"use strict";

	self._ = globalUnderscore;

	var _activeCharacterId = "(_activeCharacterId)";
	var _activeRepeatingField = false;
	var _activeTrigger = false;

	var _registeredCallbacks = {};
	var _translationStrings = {};
	var _translationLanguage = '';
	var _charmancerData = {};

	self.on = function(eventname, callback) {
		eventname = eventname.toLowerCase();
		var multievents = eventname.split(" ");
		for(var i=0; i < multievents.length; i++) {
			if(!_registeredCallbacks[multievents[i]]) {
				_registeredCallbacks[multievents[i]] = [];
			}
			_registeredCallbacks[multievents[i]].push(callback);
		}
	};

	self.trigger = function(eventinfo) {
		var finalattrname = eventinfo.eventname.toLowerCase();
		var triggername = eventinfo.eventname.toLowerCase();
		if(finalattrname.includes("repeating_") && !eventinfo.mancer) {
			var splitname = eventinfo.eventname.split("_");
			if(splitname.length > 2) {
				if(splitname.length > 3) {
					finalattrname = splitname[0] + "_" + splitname[1] + ":" + splitname.splice(3, splitname.length).join("_");
				}
				else {
					finalattrname = splitname[0] + "_" + splitname[1];
				}
				_activeRepeatingField = "repeating_" + splitname[1] + "_" + splitname[2];
			}
		}
		else {
			_activeRepeatingField = false;
		}

		if(eventinfo.mancer) {
			if(eventinfo.mancer == "page") {
				finalattrname = "page:" + finalattrname;
			}
			else if(eventinfo.mancer == "mancer") {
				finalattrname = "mancerchange:" + finalattrname;
			}
			else if(eventinfo.mancer == "finish") {
				finalattrname = "mancerfinish:" + finalattrname;
			}
			else if(eventinfo.mancer == "cancel") {
				finalattrname = "mancer:cancel";
			}
		}
		else if (finalattrname.substring(0, 8) === "clicked:" || finalattrname.substring(0, 11) === "mancerroll:") {
			finalattrname = finalattrname;
		}
		else if(finalattrname.substring(0, 6) !== "sheet:" && finalattrname.substring(0, 7) !== "remove:") {
			finalattrname = "change:" + finalattrname;
		}

		var subname = finalattrname;
		var info = {sourceAttribute: eventinfo.oattr, sourceType: eventinfo.sourcetype, triggerName: triggername};
		if(eventinfo.currentstep) {
			info["currentStep"] = eventinfo.currentstep;
		}
		if(eventinfo.previous_value) {
			info["previousValue"] = eventinfo.previous_value;
		}
		if(eventinfo.updated_value) {
			info["newValue"] = eventinfo.updated_value;
		}
		if(eventinfo.removed_info) {
			info["removedInfo"] = eventinfo.removed_info;
		}
		if(eventinfo.triggerType) {
			info["triggerType"] = eventinfo.triggerType;
		}
		if(eventinfo.sourceSection) {
			info["sourceSection"] = eventinfo.sourceSection;
		}
		if(eventinfo.mancer == "finish") {
			info = {data: eventinfo.data};
		}
		if(eventinfo.mancer == "cancel") {
			info = {value:eventinfo.eventname.toLowerCase()};
		}
		if(finalattrname.substring(0, 11) === "mancerroll:") {
			info.roll = eventinfo.data;
		}

		//console.log("Triggering for " + subname);

		_activeTrigger = subname.split(":")[1];

		if(_registeredCallbacks[subname]) {
			for(var j=0; j < _registeredCallbacks[subname].length; j++) {
				_registeredCallbacks[subname][j](info);
			}
		}
	};

	self.log = function(msg) {
		// postMessage({
		// 	type: "log",
		// 	msg: msg + ""
		// });
		console.log(msg);
	};

	var _waitingAttrRequests = {};

	var _generateAttrID = function() {
		return Math.random();
	};

	self.generateRowID = function() {
		return self.generateUUID().replace(/_/g, "Z");
	};

	self.generateUUID = function() {
		var a = 0, b = [];
		return function() {
			var c = (new Date).getTime() + 0, d = c === a;
			a = c;
			for (var e = Array(8), f = 7; 0 <= f; f--) e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64), c = Math.floor(c / 64);
			c = e.join("");
			if (d) {
				for (f = 11; 0 <= f && 63 === b[f]; f--) b[f] = 0;
				b[f]++;
			} else for (f = 0; 12 > f; f++) b[f] = Math.floor(64 * Math.random());
			for (f = 0; 12 > f; f++) c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
			return c;
		};
	}();

	self.getAttrs = function(arrayOfNames, callback) {

		if(_activeCharacterId === false) {
			console.log("Character Sheet Error: Trying to do getAttrs when no character is active in sandbox.");
			return;
		}

		var reqid = _activeCharacterId + "//" + _activeRepeatingField + "//" + _generateAttrID();
		_waitingAttrRequests[reqid] = callback;
		postMessage({
			type: 'attrreq',
			data: arrayOfNames,
			id: reqid
		});
	};

	self.setAttrs = function(values, options, callback) {

		if(_activeCharacterId === false) {
			console.log("Character Sheet Error: Trying to do setAttrs when no character is active in sandbox.");
			return;
		}

		if(callback == undefined && (typeof options == "function")) {
			callback = options;
			options = {};
		}

		var myopts = {};
		if(options && options.silent === true) {
			myopts.silent = true;
		}

		var reqid = _activeCharacterId + "//" + _activeRepeatingField + "//" + _generateAttrID();

		if(callback !== undefined) {
			_waitingAttrRequests[reqid] = callback;
		}

		postMessage({
			type: "setattrs",
			data: values,
			characterid: _activeCharacterId,
			repeatingfield: _activeRepeatingField,
			options: myopts,
			id: reqid
		});
	};

	self.getSectionIDs = function(sectionid, callback) {
		if(_activeCharacterId === false) {
			console.log("Character Sheet Error: Trying to do getSectionIDs when no character is active in sandbox.");
			return;
		}	

		var reqid = _activeCharacterId + "//" + _activeRepeatingField + "//" + _generateAttrID();
		_waitingAttrRequests[reqid] = callback;
		postMessage({
			type: 'attrlist',
			data: sectionid,
			id: reqid
		});
	};

	self.setSectionOrder = function(repeating_section, section_array, callback) {
		if(_activeCharacterId === false) {
			console.log("Character Sheet Error: Trying to do setSectionOrder when no character is active in sandbox.");
			return;
		}	

		var reqid = _activeCharacterId + "//" + repeating_section + "//" + _generateAttrID();
		_waitingAttrRequests[reqid] = callback;
		postMessage({
			type: 'setsectionorder',
			data: section_array,
			id: reqid
		});
	};

	self.getTranslationByKey = function(translationKey) {
		if(!_translationStrings[translationKey]) {
			console.log("Translation Error: the key [" + translationKey + "] is not in the translation object.")
			return false;
		}
		return _translationStrings[translationKey]
	}

	self.getTranslationLanguage = function() {
		return _translationLanguage;
	};

	self.removeRepeatingRow = function(rowid) {
		if(_activeCharacterId === false) {
			console.log("Character Sheet Error: Trying to do removeRepeatingRow when no character is active in sandbox.");
			return;
		}

		var reqid = _activeCharacterId + "//" + _activeRepeatingField + "//" + _generateAttrID();

		postMessage({
			type: 'removerepeatingrow',
			data: rowid,
			id: reqid
		});
	};

	self.forceSheetRender = function() {
		if(_activeCharacterId === false) {
			console.log("Character Sheet Error: Trying to do forceSheetRender when no character is active in sandbox.");
			return;
		}

		var reqid = _activeCharacterId + "//" + _activeRepeatingField + "//" + _generateAttrID();

		postMessage({
			type: 'forcerender',
			data: '',
			id: reqid
		});
	};

	self.getActiveCharacterId = function()  {
		return _activeCharacterId;
	};

	self.getActiveRepeatingField = function()  {
		return _activeRepeatingField;
	};

	self.setDefaultToken = function(values) {

		if(_activeCharacterId === false) {
			console.log("Character Sheet Error: Trying to do setDefaultToken when no character is active in sandbox.");
			return;
		}

		var reqid = _activeCharacterId + "//" + _generateAttrID();

		postMessage({
			type: "setdefaulttoken",
			data: values,
			characterid: _activeCharacterId,
			id: reqid
		});
	};

	self.getCompendiumPage = function(uniquePageName, savefields, callback) {
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
	}

	self.getCompendiumQuery = function(compendiumQuery, callback) {
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
	}

	self.dropCompendiumData = function(target_class, compendiumData, callback) {
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
	}

	self.startCharactermancer = function(buildType) {

		if(_activeCharacterId === false) {
			console.log("Character Sheet Error: Trying to start the Charactermancer when no character is active in sandbox.");
			return;
		}

		postMessage({
			type: 'startcharactermancer',
			data: buildType,
			id: _activeCharacterId
		});
	};

	self.changeCompendiumPage = function(target_class, uniquePageName, options) {
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
	};

	self.showChoices = function(class_array) {
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
	};

	self.hideChoices = function(class_array) {
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
	};

	self.setCharmancerText = function(updates) {
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
	};

	self.addRepeatingSection = function(target, section, name, callback) {
		if(_activeCharacterId === false) {
			console.log("Character Sheet Error: Trying to start the Charactermancer when no character is active in sandbox.");
			return;
		}

		if(!section || typeof section !== "string") {
			console.log("Character Sheet Error: Trying to insert a repeating section, but the section wasn't specified.");
			return;
		}

		if(!callback && typeof name === "function") {
			callback = name;
			name = false;
		}

		var reqid = _activeCharacterId + "//" + _generateAttrID();
		_waitingAttrRequests[reqid] = callback;

		postMessage({
			type: 'addrepeatingsection',
			target: target,
			section: section,
			name: name,
			charid: _activeCharacterId,
			id: reqid
		});
	};

	self.clearRepeatingSections = function(target, callback) {
		if(_activeCharacterId === false) {
			console.log("Character Sheet Error: Trying to start the Charactermancer when no character is active in sandbox.");
			return;
		}

		var reqid = _activeCharacterId + "//" + _generateAttrID();
		if(callback) {
			_waitingAttrRequests[reqid] = callback;
		}

		postMessage({
			type: 'clearrepeatingsections',
			target: target,
			charid: _activeCharacterId,
			id: reqid
		});
	};

	self.getRepeatingSections = function(target, callback) {
		if(_activeCharacterId === false) {
			console.log("Character Sheet Error: Trying to start the Charactermancer when no character is active in sandbox.");
			return;
		}

		if(!callback) {
			callback = target;
			target = false;
		}
		var reqid = _activeCharacterId + "//" + _generateAttrID();
		_waitingAttrRequests[reqid] = callback;

		postMessage({
			type: 'getrepeatingsections',
			target: target,
			charid: _activeCharacterId,
			id: reqid
		});
	};

	self.clearRepeatingSectionById = function(repids, callback) {
		if(_activeCharacterId === false) {
			console.log("Character Sheet Error: Trying to start the Charactermancer when no character is active in sandbox.");
			return;
		}

		if(repids === null) {
			console.log("Character Sheet Error: Trying to remove a repeating section, but no section was specified.");
			return;
		}

		if(typeof repids === "string") {
			repids = [repids];
		}

		var reqid = _activeCharacterId + "//" + _generateAttrID();
		if(callback) {
			_waitingAttrRequests[reqid] = callback;
		}

		postMessage({
			type: 'clearrepeatingsections',
			repids: repids,
			charid: _activeCharacterId,
			id: reqid
		});
	}

	self.setCharmancerOptions = function(target_class, select_options, options, callback) {
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
	};

	self.disableCharmancerOptions = function(target_class, disable, options) {
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
	};

	self.getCharmancerData = function() {
		if(_activeCharacterId === false) {
			console.log("Character Sheet Error: Trying to start the Charactermancer when no character is active in sandbox.");
			return;
		}
		delete _charmancerData[_activeCharacterId].undefined;
		return _charmancerData[_activeCharacterId];
	};

	self.deleteCharmancerData = function(pages, callback) {
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
	};

	self.changeCharmancerPage = function(page, callback) {
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
	}

	self.finishCharactermancer = function() {

		if(_activeCharacterId === false) {
			console.log("Character Sheet Error: Trying to do finishCharactermancer when no character is active in sandbox.");
			return;
		}

		postMessage({
			type: "finishcharactermancer",
			characterid: _activeCharacterId
		});
	};

	var _fullfillAttrReq = function(reqid, result) {
		if(_waitingAttrRequests[reqid]) {

			var prevCharacterId = _activeCharacterId;
			_activeCharacterId = reqid.split("//")[0];

			var prevActiveRepeatingField = _activeRepeatingField;
			var possibleRepeatingField = reqid.split("//")[1];
			if(possibleRepeatingField !== "false") {
				_activeRepeatingField = possibleRepeatingField;
			}
			else {
				_activeRepeatingField = false;
			}

			_waitingAttrRequests[reqid](result);

			_activeCharacterId = prevCharacterId;
			_activeRepeatingField = prevActiveRepeatingField;

			delete _waitingAttrRequests[reqid];
		}
	};

	//custom event for test handling - must not be passed into final sheet!
	var endTest = function() {

	}

	console.log("Starting up WEB WORKER");

	var postMessage   = self.postMessage,
	messageEventType  = "message",

	messageHandler = function (event) {
		var request = event.data,
		response = {
		};

		response.id = request.id;

		try {
			switch (request.type) {

				case "eval":
					globalEval(request.data);
					break;

				case "trigger":
					trigger(request.data);
					break;
				case "attrreqfulfilled":
					_fullfillAttrReq(request.id, request.data);
					break;
				case "attrlistreqfulfilled":
					_fullfillAttrReq(request.id, request.data);
					break;
				case "setattrreqfulfilled":
					_fullfillAttrReq(request.id, request.data);
					break;
				case "setActiveCharacter":
					_activeCharacterId = request.data;
					break;
				case "loadTranslationStrings":
					var translation = request.data;
					_translationStrings = translation.values;
					_translationLanguage = translation.lang;
					break;
				case "getCompendiumPage":
					_getCompendiumPage(request.id, request.data);
					break;
				case "setCharmancerData":
					_charmancerData[request.character] = request.data;
					if(request.callback) {
						_fullfillAttrReq(request.callback.id, request.callback.data);
					}
					break;
			}

		} catch (e) {
			console.log(e);
			console.log(e.stack);
		}

		delete self.input;
		if (self.onmessage) {
			delete self.onmessage; // in case the code defined it
		}
		//postMessage(response);
	};

	if (self.addEventListener) {
		self.addEventListener(messageEventType, messageHandler, false);
	} else if (self.attachEvent) { // for future compatibility with IE
		self.attachEvent("on" + messageEventType, messageHandler);
	}

	self.window = self; // provide a window object for scripts

	// dereference unsafe functions
	self.Worker              =
	self.addEventListener    =
	self.removeEventListener =
	self.importScripts       =
	self.XMLHttpRequest      =
	//self.postMessage         =
	//self.dispatchEvent       =
	// in case IE implements web workers
	self.attachEvent         =
	self.detachEvent         =
	self.ActiveXObject       =

	undefined;

}; //(self,eval,_)