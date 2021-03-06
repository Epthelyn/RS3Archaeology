# RS3Archaeology
Artefact restoration calculator for Runescape 3

https://epthelyn.github.io/RS3Archaeology/

# How to use
## Left - Input ##
Input the number of damaged and/or restored artefacts available in the list on the left. This can be done by entering the numbers manually or by using the +/- buttons to increment/decrement the number available. The yellow buttons are for damaged artefacts, the green for restored.
The "Show Materials" or "Show Artefacts" button switches between material and artefact display. The behaviour of the materials input is the same as the artefact input (although with one value instead of two). Entering material storage information here will allow the calculator to output how much you need to collect to restore artefacts. If unrestored artefacts are selected, rows will be highlighted green (if the material amount is enough to restore the selection) or red (if it is not).

The "Take" and "Remove" buttons in the materials view can be used to add or remove a specific number of materials from storage, based on the value in the number input.

With a collector selected, clicking on a row will highlight/unhighlight it to indicate than an artefact has been submitted to a collector. This has no current purpose beyond appearance, it's just easier than checking the in-game log.

## Centre - Sites and Collectors ##
The icons in the central divider can be used to turn on and off the display and calculation of artefacts from each of the excavation sites. Greyscale icons are disabled, coloured icons enabled. Shift-clicking a god icon will select only that item and deselect all others. Selecting a collector will divide the artefact list by collection, with headers providing the collection name, the one-time reward (in bold, if applicable) and the repeatable reward.
Using these icons also filters materials, causing the materials display to only show materials required for artefacts within the selected categories.

## Right - Output ##
Entering values into the items in the header will give the calculator extra information to calculate bonus experience. Arch Level recolours the levels in the artefact list based on whether an artefact is obtainable. Batteries/fragments include the 1.01x and 1.02x multipliers for 10 and 100 respectively.
The top section will display how much experience will be gained from restoring the artefacts, how many artefacts have been entered, and how many of each material is required to restore all damage artefacts, as well as indicating how many materials are missing compared to material input and (approximately) how much experience would be gained from gathering them.

The lower sections indicate the number of chronotes gained from turning artefacts into a collector or the museum, and which collections are partially or fully completed by the current selection. Note that the chronotes total **does not** include chronotes gained from the *completion* of a collection, only the value of the individual items.

# Additional notes
Entered values are saved (to localStorage) on input, so closing and reloading the calculator later will retain all information.
