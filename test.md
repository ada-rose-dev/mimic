
# Events to test:
* [/] change:<attr>
* [/] remove:repeating_<groupname>
* [/] sheet:opened
* [/] clicked:<btn>

# Functions to test:
* [/] getAttrs()
* [/] setAttrs()
* [/] getSectionIDs()
* [/] generateRowID()
* [/] removeRepeatingRow()
* [/] getTranslationByKey()
* [/] getTranslationLanguage()
* [x] setDefaultToken() - won't do

-------------------------------------------------

# Charactermancer Events to test:
* [ ] mancerchange:<attr>
* [ ] page:<page>
* [ ] mancerroll:<btn>
* [ ] mancer:cancel
* [ ] mancerfinish:<name>

# Charactermancer Attributes to test:
* [ ] Next Button
* [ ] Previous Button
* [ ] Cancel Button
* [ ] Finish Button
* [ ] "required" attribute
* [ ] "sheet-choice" class - won't do - CSS

# Charmancer Functions to test:
* [/] startCharactermancer()
* [/] setCharmancerText()
* [-] changeCompendiumPage()
* [-] changeCharmancerPage()
* [-] setAttrs() - should scrub checkbox and radio inputs if value is unmatched
* [-] setCharmancerOptions() - TODO - will need to rework compendium scraper (why?)
* [-] disableCharmancerOptions()
* [-] showChoices()
* [-] hideChoices()
* [-] getCompendiumPage()
* [-] getCompendiumQuery()
* [-] getCharmancerData()
* [-] deleteCharmancerData()
* [/] finishCharactermancer()
* [-] setSectionOrder()
* [-] addRepeatingSection() - TODO: need to return ID only. How to do this?
* [-] clearRepeatingSections()
* [-] clearRepeatingSectionById()
* [-] getRepeatingSections()

# Internal Functions
* [/] sanitizeHTML
* [/] use JSDOM environment to run code