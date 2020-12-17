
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
* [/] mancerchange:<attr>
* [/] page:<page>
* [/] mancerroll:<btn>
* [/] mancer:cancel
* [/] mancerfinish:<name>

# Charactermancer Attributes to test:
* [/] Next Button
* [/] Previous Button
* [/] Cancel Button
* [/] Finish Button
* [/] Roll Button
* [/] "required" attribute
* [/] "accepts" attribute

# Charmancer Functions to test:
* [/] startCharactermancer()
* [/] setCharmancerText()
* [/] changeCompendiumPage()
* [/] changeCharmancerPage()
* [/] setAttrs()
* [/] setCharmancerOptions()
* [/] disableCharmancerOptions()
* [/] showChoices()
* [/] hideChoices()
* [/] getCompendiumPage()
* [/] getCompendiumQuery()
* [/] getCharmancerData()
* [/] deleteCharmancerData()
* [/] finishCharactermancer()
* [/] setSectionOrder()
* [/] addRepeatingSection()
* [/] clearRepeatingSections()
* [/] clearRepeatingSectionById()
* [/] getRepeatingSections()

# Internal Functions
* [/] sanitizeHTML
* [/] use JSDOM environment to run code