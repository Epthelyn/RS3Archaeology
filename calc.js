let archCalc = function(){
    let artifactData = [];
    let collectionData = [];

    let totals = {
        xp: 0,
        materials: []
    }

    let sitesActive = {
        Zaros: true,
        Zamorak: true,
        Saradomin: true,
        Armadyl: true,
        Bandos: true
    }

    let searchFilter = null;

    $(document).ready(function(){
        $.ajax({
            url: 'collections.json',
            dataType: 'JSON',
            async: false,
            success: function(data){
                collectionData = data;
                //console.log(collectionData);
            },
            error: function(err){
                console.log(err);
            }
        });

        $.ajax({
            url: 'artefacts.json',
            dataType: 'JSON',
            async: false,
            success: function(data){
                artifactData = data;
                //console.log(artifactData);
                generateTable();
            },
            error: function(err){
                console.log(err);
            }
        });



        $('.siteFilterIcon').on('click', function(){
            let iconType = $(this).attr('site');
            sitesActive[iconType] = !sitesActive[iconType];
            if(sitesActive[iconType]){
                $(this).removeClass('inactive');
            }
            else{
                $(this).addClass('inactive');
            }

            generateTable();
        });

        $('.searchInput').on('input', function(){
            searchFilter = $(this).val();

            generateTable();
        });
    });

    function generateTable(){
        let table = `<div class="archTable">`;
        // table += `<div class="row headRow">
        //     <div class="cell nameCell">Artefact</div>
        //     <div class="cell numberCell">Level</div>
        //     <div class="cell bigNumberCell">Experience</div>
        //     <div class="cell bigNumberCell">Chronotes</div>
        //     <div class="cell numberCell"></div>
        // </div>`;

        for(let i=0; i<artifactData.length; i++){
            let rowClass = artifactData[i].site;
            //if($(`#art${i}`).val() > 0) rowClass += " active";
            if(!sitesActive[artifactData[i].site] || !inSearch(artifactData[i]))
                table += `<div class="row" id="artRow${i}" style="display: none;" class="${rowClass}">`;
            else
                table += `<div class="row" tr id="artRow${i}" class="${rowClass}">`;
                table += `<div class="cell nameCell">
                    ${godImage(artifactData[i].site)}&nbsp;
                    ${artifactData[i].name}
                </div>`;
                table += `<div class="cell numberCell">
                    ${artifactData[i].level}
                </div>`;
                    table += `<div class="cell bigNumberCell">
                    ${artifactData[i].xp}
                </div>`;
                table += `<div class="cell bigNumberCell">
                    ${artifactData[i].chronotes}
                </div>`;
                table += `<div class="cell numberCell right">
                    <input type="button" value="-" artTarget=${i} class="artOwnedMod" action="minus" id="artownedminus${i}">
                    <input type="button" value="+" artTarget=${i} class="artOwnedMod" action="plus" id="artownedplus${i}">
                    <input type="checkbox" class="artCheck" id="artcheck${i}">
                </div>`;
                table += `<div class="cell numberCell right" style="text-align: center;">
                    <input type="text" value=0 class="artOwnedCountInput" target=${i} id="artowned${i}">
                </div>`;
                table += `<div class="cell numberCell right">
                    <input type="button" value="-" artTarget=${i} class="artMod" action="minus" id="artminus${i}">
                    <input type="button" value="+" artTarget=${i} class="artMod" action="plus" id="artplus${i}">
                </div>`;
                table += `<div class="cell numberCell right" style="text-align: center;">
                    <input type="text" value=0 class="artCountInput" target=${i} id="art${i}">
                </div>`;
                // table += `<div class="cell">
                //     <input type="button" value="+" artTarget=${i} class="artMod" action="plus" id="artplus${i}">
                // </div>`;
                // table += `<div class="cell">
                //     <input type="checkbox" class="artCheck" id="artcheck${i}">
                // </div>`;
            table += "</div>";
        }

        table += "</div>";

        $('#table').html(table);

        $('.artCountInput').on('change', function(){
            let tar = $(this).attr('target');
            let val = parseInt($(this).val());
            if(!isNaN(val)){
                if(val == 0) $(`#artRow${tar}`).removeClass('part-active');
                else $(`#artRow${tar}`).addClass('part-active');
            }
            calcTotals();
        });

        $('.artOwnedCountInput').on('change', function(){
            let tar = $(this).attr('target');
            let val = parseInt($(this).val());
            if(!isNaN(val)){
                if(val == 0) $(`#artRow${tar}`).removeClass('active');
                else $(`#artRow${tar}`).addClass('active');
            }
            calcTotals();
        });

        $('.artCheck').on('change', function(){
            calcTotals();
        });

        $('.artMod').on('click', function(){
            let action = $(this).attr('action');
            let target = $(this).attr('artTarget');

            let currentValue = parseInt($(`#art${target}`).val());
            if(isNaN(currentValue)) currentValue = 0;

            switch(action){
                case "plus": currentValue++; break;
                case "minus": currentValue--; 
            }

            if(currentValue < 0){
                currentValue = 0;
                $(`#artRow${target}`).removeClass('part-active');
            }
            else if(currentValue == 0){
                $(`#artRow${target}`).removeClass('part-active');
            }
            else if(currentValue == 1 && action == "plus"){
                $(`#artRow${target}`).addClass('part-active');
            }

            $(`#art${target}`).val(currentValue);
            calcTotals();
        });

        $('.artOwnedMod').on('click', function(){
            let action = $(this).attr('action');
            let target = $(this).attr('artTarget');

            let currentValue = parseInt($(`#artowned${target}`).val());
            if(isNaN(currentValue)) currentValue = 0;

            switch(action){
                case "plus": currentValue++; break;
                case "minus": currentValue--; 
            }

            if(currentValue < 0){
                currentValue = 0;
                $(`#artRow${target}`).removeClass('active');
            }
            else if(currentValue == 0){
                $(`#artRow${target}`).removeClass('active');
            }
            else if(currentValue == 1 && action == "plus"){
                $(`#artRow${target}`).addClass('active');
            }

            $(`#artowned${target}`).val(currentValue);
            calcTotals();
        });

        let saveData = localStorage.getItem("rs3archcalcData");
        if(saveData){
            saveData = $.parseJSON(saveData);
            for(let i=0; i<saveData.length; i++){
                $(`#art${saveData[i].i}`).val(saveData[i].n||0);
                $(`#artowned${saveData[i].i}`).val(saveData[i].nR||0);
                if(saveData[i].n > 0){
                    $(`#artRow${saveData[i].i}`).addClass('part-active');
                }
                if(saveData[i].nR > 0){
                    $(`#artRow${saveData[i].i}`).addClass('active');
                }
            }
            calcTotals();
        }
    }

    function godImage(site){
        return `<img class="rowIcon" src="https://runescape.wiki/images/thumb/1/11/${site}_symbol.png/25px-${site}_symbol.png"></img>`;
    }

    function materialImage(mat){
        return `<img class="matImg" src="https://runescape.wiki/images/thumb/c/cf/${mat}_detail.png/100px-${mat}_detail.png">`;
    }

    function calcTotals(){
        totals = {
            xp: 0,
            count: 0,
            chronotes: 0,
            chronotesRestored: 0,
            chronotesDamaged: 0,
            materials: []
        };

        let saveData = [];

        let checksEnabled = false;
        for(let i=0; i<artifactData.length; i++){
            if($(`#artcheck${i}`).is(':checked')){
                checksEnabled = true;
                break;
            }
        }

        //console.log("Checks enabled: " + checksEnabled);

        let artifactsAvailable = [];
        let restoredArtifactsAvailable = [];

        for(let i=0; i<artifactData.length; i++){
            let artQuantity = parseInt($(`#art${i}`).val());
            let artOwnedQuantity = parseInt($(`#artowned${i}`).val());
            if((isNaN(artQuantity) || artQuantity == 0) && (isNaN(artOwnedQuantity) || artOwnedQuantity == 0))  continue;
            saveData.push({i: i, n: artQuantity, nR: artOwnedQuantity});
            if(!inSearch(artifactData[i])) continue;
            


            if(checksEnabled && !$(`#artcheck${i}`).is(':checked')) continue;
            if(!sitesActive[artifactData[i].site]) continue;

            totals.chronotes+=artifactData[i].chronotes*(artQuantity+artOwnedQuantity);

            if(artQuantity > 0){
                totals.count += artQuantity;
                artifactsAvailable.push(artifactData[i].name);
                totals.chronotesDamaged+=artifactData[i].chronotes*artQuantity;
                let artXP = artifactData[i].xp;
                totals.xp += artXP*artQuantity;

                let artMats = artifactData[i].materials;
                for(let j=0; j<artMats.length; j++){
                    let mat = totals.materials.filter(m => m.name == artMats[j].name);
                    if(!mat.length){
                        totals.materials.push({
                            name: artMats[j].name,
                            quantity: artMats[j].quantity*artQuantity
                        });
                    }
                    else{
                        let matIndex = totals.materials.indexOf(mat[0]);
                        totals.materials[matIndex].quantity += artMats[j].quantity*artQuantity;
                    }
                }
            }

            if(artOwnedQuantity > 0){
                restoredArtifactsAvailable.push(artifactData[i].name);
                totals.chronotesRestored+=artifactData[i].chronotes*artOwnedQuantity;
            }
        }
        //console.log(totals);
        //console.log(artifactsAvailable);

        let collectionsPossible = [];
        for(let i=0; i<collectionData.length; i++){
            let p = checkCollectionRequirements(collectionData[i],artifactsAvailable,restoredArtifactsAvailable);
            if(p.count > 0){
                collectionsPossible.push({
                    index: i,
                    collection: collectionData[i].name,
                    requirementsCheck: p
                });
            }
        }

        console.log(collectionsPossible);
        collectionsPossible = collectionsPossible.sort((a,b) => b.requirementsCheck.complete - a.requirementsCheck.complete);
        let completedCollections = collectionsPossible.filter(c => c.requirementsCheck.complete);
        let restoredCollections = collectionsPossible.filter(c => c.requirementsCheck.countOnlyRestored > 0);
        let completedRestoredCollections = collectionsPossible.filter(c => c.requirementsCheck.completeByRestored);


        let output = `<b>Total Experience: ${~~totals.xp}</b> from <b>${totals.count}</b> artefact${totals.count>1||totals.count==0?"s":""}. <br>`;
        // output += materialImage("Chronotes") + "&nbsp;" + "Chronotes from collections" + ": " + totals.chronotes + "<br>";
        // output += materialImage("Chronotes") + "&nbsp;" + "Chronotes from museum" + ": " + (~~(totals.chronotes*0.4)) + "<br>";
        output += "<br><b>Materials Required</b>:<br>";
        if(!totals.materials.length){
            output += "No artefacts selected.<br>";
        }
        for(let i=0; i<totals.materials.length; i++){
            output += materialImage(totals.materials[i].name) + "&nbsp;" + totals.materials[i].name + ": " + totals.materials[i].quantity + "<br>";
        }
        output += "<br><hr>";
        output += "<b><u>Including Damaged Artefacts</u></b><br>";
        output += materialImage("Chronotes") + "&nbsp;" + "Chronotes from collections" + ": " + totals.chronotes + "<br>";
        output += materialImage("Chronotes") + "&nbsp;" + "Chronotes from museum" + ": " + (~~(totals.chronotes*0.4)) + "<br><br>";
        output += "<b>Completed Collections</b>:<br>";
        if(!completedCollections.length){
            output += "No completed collections.<br>";
        }

        for(let i=0; i<collectionsPossible.length; i++){
            let p = collectionsPossible[i];
            if(!p.requirementsCheck.complete) continue;
            let c = collectionData[collectionsPossible[i].index];

            let spanOpacity = "100%";
            output += `<span style="opacity: ${spanOpacity}">${p.collection} for ${c.collector}: ${p.requirementsCheck.count}/${c.artefacts.length}</span><br>`;

        }

        output += "<br><b>Incomplete Collections</b>:<br>";
        if(!collectionsPossible.length){
            output += "No incomplete collections.<br>";
        }
        for(let i=0; i<collectionsPossible.length; i++){
            let p = collectionsPossible[i];
            if(p.requirementsCheck.complete) continue;
            let c = collectionData[collectionsPossible[i].index];
         
            let spanOpacity = p.requirementsCheck.complete?"100%":"50%";
            output += `<span style="opacity: ${spanOpacity}">${p.collection} for ${c.collector}: ${p.requirementsCheck.count}/${c.artefacts.length}</span><br>`;
        }
        output += "<br><hr>";
        output += "<b><u>Excluding Damaged Artefacts</u></b><br>";
        output += materialImage("Chronotes") + "&nbsp;" + "Chronotes from collections" + ": " + totals.chronotesRestored + "<br>";
        output += materialImage("Chronotes") + "&nbsp;" + "Chronotes from museum" + ": " + (~~(totals.chronotesRestored*0.4)) + "<br><br>";
        output += "<b>Restored Collections</b>:<br>";
        if(!completedRestoredCollections.length){
            output += "No restored collections.<br>";
        }

        for(let i=0; i<restoredCollections.length; i++){
            let p = restoredCollections[i];
            if(!p.requirementsCheck.complete) continue;
            let c = collectionData[restoredCollections[i].index];

            let spanOpacity = "100%";
            output += `<span style="opacity: ${spanOpacity}">${p.collection} for ${c.collector}: ${p.requirementsCheck.countOnlyRestored}/${c.artefacts.length}</span><br>`;

        }

        output += "<br><b>Partially Restored Collections</b>:<br>";
        if(!restoredCollections.length){
            output += "No partially restored collections.<br>";
        }
        for(let i=0; i<restoredCollections.length; i++){
            let p = restoredCollections[i];
            if(p.requirementsCheck.complete) continue;
            let c = collectionData[restoredCollections[i].index];
         
            let spanOpacity = p.requirementsCheck.complete?"100%":"50%";
            output += `<span style="opacity: ${spanOpacity}">${p.collection} for ${c.collector}: ${p.requirementsCheck.countOnlyRestored}/${c.artefacts.length}</span><br>`;
        }

        $('#output').html(output);

        saveData = JSON.stringify(saveData);
        localStorage.setItem("rs3archcalcData", saveData);

    }

    function checkCollectionRequirements(collection, damaged, restored){
        let count = 0;
        let countOnlyDamaged = 0;
        let countOnlyRestored = 0;
        let missing = [];
        for(let i=0; i<collection.artefacts.length; i++){
            if(damaged.includes(collection.artefacts[i]) || restored.includes(collection.artefacts[i])){
                count++;
                if(damaged.includes(collection.artefacts[i])) countOnlyDamaged++;
                if(restored.includes(collection.artefacts[i])) countOnlyRestored++;
            }
            else missing.push(collection.artefacts[i]);
        }

        return {
            complete: count==collection.artefacts.length,
            completeByDamaged: countOnlyDamaged==collection.artefacts.length,
            completeByRestored: countOnlyRestored==collection.artefacts.length,
            count: count,
            countOnlyDamaged: countOnlyDamaged,
            countOnlyRestored: countOnlyRestored,
            missing: missing
        }
    }

    function inSearch(art){
        if(!searchFilter || !searchFilter.length) return true;
        let s = searchFilter.toLowerCase();
        if(art.name.toLowerCase().includes(s)) return true;
        if(!isNaN(parseInt(searchFilter)) && art.level == parseInt(searchFilter)) return true;

        return false;
    }
}();