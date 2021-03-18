let archCalc = function(){
    let artifactData = [];
    let collectionData = [];
    let materialData = [];

    let totals = {
        xp: 0,
        materials: []
    }

    let sitesActive = {
        Zaros: true,
        Zamorak: true,
        Saradomin: true,
        Armadyl: true,
        Bandos: true,
        Dragonkin: true
    }

    let collectorsActive = {
        "Art Critic Jacques": false,
        "Chief Tess": false,
        "General Bentnose": false,
        "General Wartface": false,
        "Isaura": false,
        "Lowse": false,
        "Sir Atcha": false,
        "Soran": false,
        "Velucia": false,
        "Wise Old Man": false,
        "Giles": false,
        "Sharrigan": false
    }

    let searchFilter = null;

    let listView = "ARTIFACTS";

    $(document).ready(function(){
        $.ajax({
            url: 'collections.json',
            dataType: 'JSON',
            async: false,
            success: function(data){
                collectionData = data;
                console.log(collectionData);
            },
            error: function(err){
                console.log(err);
            }
        });

        $.ajax({
            url: 'materials.json',
            dataType: 'JSON',
            async: false,
            success: function(data){
                data = data.filter(d => d.type != "Special");
                materialData = data;
                console.log(materialData);
                for(let i=0; i<materialData.length; i++){
                    materialData[i].originalIndex = i;
                }
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
                for(let i=0; i<artifactData.length; i++){
                    artifactData[i].originalIndex = i;
                }
                console.log(artifactData);
                generateTable();
            },
            error: function(err){
                console.log(err);
            }
        });

        //console.log(JSON.stringify(getMaterialsDataFromArtifactData()));



        $('.siteFilterIcon').on('click', function(e){
            let iconType = $(this).attr('site');
            console.log(e);
            if(e.shiftKey){
                $('.siteFilterIcon').addClass('inactive');
                for(k in sitesActive){
                    sitesActive[k] = false;
                }

                sitesActive[iconType] = true;
                $(this).removeClass('inactive');
            }
            else{
                sitesActive[iconType] = !sitesActive[iconType];
                if(sitesActive[iconType]){
                    $(this).removeClass('inactive');
                }
                else{
                    $(this).addClass('inactive');
                }
            }

            generateTable();
        });

        $('.collectorFilterIcon').on('click', function(){
            let coll = $(this).attr('collector');

            let enableSelf = !collectorsActive[coll];

            $('.collectorFilterIcon').addClass('inactive');
            for(k in collectorsActive){
                collectorsActive[k] = false;
            }

            if(enableSelf){
                $(this).removeClass('inactive');
                collectorsActive[coll] = true;
            }

            generateTable();
        });

        $('.searchInput').on('input', function(){
            searchFilter = $(this).val();

            generateTable();
        });

        $('.clearBtn').on('click', function(){
            if(!confirm("All artefact quantities will be reset.")) return;
            $('.artCountInput').val(0);
            $('.artOwnedCountInput').val(0);

            calcTotals();
            generateTable();
        });
    });

    function anythingInCollectionDisplayed(c){
     
        if(!c.artefacts) return false;
        
        for(let i=0; i<c.artefacts.length; i++){
            let aIndex = artifactData.indexOf(artifactData.filter(a => a.name == c.artefacts[i])[0]);
            //console.log(c.artefacts[i]);
            //console.log(aIndex);
            let displayed = !(!sitesActive[artifactData[aIndex].site] || !inSearch(artifactData[aIndex]) || forSelectedCollector(artifactData[aIndex]).collectionIndex == Infinity);
            if(displayed) return true;
        }

        return false;
    }
    function generateTable(){
        let table = `<div class="archTable">`;
        // table += `<div class="row headRow">
        //     <div class="cell nameCell">Artefact</div>
        //     <div class="cell numberCell">Level</div>
        //     <div class="cell bigNumberCell">Experience</div>
        //     <div class="cell bigNumberCell">Chronotes</div>
        //     <div class="cell numberCell"></div>
        // </div>`;

        $('#headrow_materials').css('display', listView=="MATERIALS"?"block":"none");
        $('#headrow_artifacts').css('display', listView=="ARTIFACTS"?"block":"none");

        let tableData = JSON.parse(JSON.stringify(artifactData));
        if(anyCollectorSelected){
            //tableData = tableData.filter(t => forSelectedCollector(t));

            tableData = tableData.sort((a,b) => forSelectedCollector(a).collectionIndex - forSelectedCollector(b).collectionIndex);
        }

        let tableMaterialData = JSON.parse(JSON.stringify(materialData));
        tableMaterialData = tableMaterialData.sort((a,b) => a.type.localeCompare(b.type));
        console.log(tableMaterialData);

        for(let i=0; i<tableData.length; i++){
            let rowClass = artifactData[i].site;
            let oi = tableData[i].originalIndex;
            //if($(`#art${i}`).val() > 0) rowClass += " active";
            let rowDisplayed = !(!sitesActive[artifactData[oi].site] || !inSearch(artifactData[oi]) || forSelectedCollector(artifactData[oi]).collectionIndex == Infinity);
            if(listView != "ARTIFACTS") rowDisplayed = false;

            if(true /*rowDisplayed*/){
                if(anyCollectorSelected()){
                    let newColl = null;
                    if(i>0 && forSelectedCollector(tableData[i-1]).collectionIndex != forSelectedCollector(tableData[i]).collectionIndex){
                        newColl = forSelectedCollector(tableData[i]).collectionIndex;
                    }
                    else if(i===0){
                        newColl = forSelectedCollector(tableData[i]).collectionIndex;
                    }

                    if(newColl !== null && newColl !== Infinity){
                        if(anythingInCollectionDisplayed(collectionData[newColl])){
                            newColl = collectionData[newColl];
                            table += `<div class="row subHeader">${newColl.name}</div>`;
                        }
                    }
                }
            }

            if(!rowDisplayed)
                table += `<div class="row" id="artRow${oi}" style="display: none;" class="${rowClass}">`;
            else
                table += `<div class="row" id="artRow${oi}" class="${rowClass}">`;
                table += `<div class="cell nameCell">
                    ${godImage(artifactData[oi].site)}&nbsp;
                    ${artifactData[oi].name}
                </div>`;
                table += `<div class="cell numberCell">
                    ${artifactData[oi].level}
                </div>`;
                    table += `<div class="cell bigNumberCell">
                    ${artifactData[oi].xp}
                </div>`;
                table += `<div class="cell bigNumberCell">
                    ${artifactData[oi].chronotes}
                </div>`;
                table += `<div class="cell numberCell right">
                    <input type="button" value="-" artTarget=${oi} class="artOwnedMod" action="minus" id="artownedminus${oi}">
                    <input type="button" value="+" artTarget=${oi} class="artOwnedMod" action="plus" id="artownedplus${oi}">
                    
                </div>`;
                //<input type="checkbox" class="artCheck" id="artcheck${oi}">
                table += `<div class="cell numberCell right" style="text-align: center;">
                    <input type="text" value=0 class="artOwnedCountInput" target=${oi} id="artowned${oi}">
                </div>`;
                table += `<div class="cell numberCell right">
                    <input type="button" value="-" artTarget=${oi} class="artMod" action="minus" id="artminus${oi}">
                    <input type="button" value="+" artTarget=${oi} class="artMod" action="plus" id="artplus${oi}">
                </div>`;
                table += `<div class="cell numberCell right" style="text-align: center;">
                    <input type="text" value=0 class="artCountInput" target=${oi} id="art${oi}">
                </div>`;
                // table += `<div class="cell">
                //     <input type="button" value="+" artTarget=${i} class="artMod" action="plus" id="artplus${i}">
                // </div>`;
                // table += `<div class="cell">
                //     <input type="checkbox" class="artCheck" id="artcheck${i}">
                // </div>`;
            table += "</div>";
        }

        for(let i=0; i<tableMaterialData.length; i++){
            let oi = tableMaterialData[i].originalIndex;
            let rowDisplayed = listView=="MATERIALS";

            let newMat = null;
            if(i>0 && tableMaterialData[i-1].type != tableMaterialData[i].type){
                newMat = tableMaterialData[i].type;
            }
            else if(i===0){
                newMat = tableMaterialData[i].type;
            }

            if(newMat !== null && newMat !== Infinity){
                if(rowDisplayed){
                    table += `<div class="row subHeader">${newMat}</div>`;
                }
            }

            if(!rowDisplayed)
                table +=  `<div class="row" id="matRow${oi}" style="display: none;">`;
            else
                table +=  `<div class="row" id="matRow${oi}">`;

            table += `
                <div class="cell nameCell">${materialImage(tableMaterialData[i].name)}&nbsp;${tableMaterialData[i].name}</div>
                <div class="cell numberCell">${tableMaterialData[i].type}</div>
                <div class="cell numberCell right">
                    <input type="button" value="-" matTarget=${oi} class="matOwnedMod" action="minus" id="matownedminus${oi}">
                    <input type="button" value="+" matTarget=${oi} class="matOwnedMod" action="plus" id="matownedplus${oi}">
                </div>
                <div class="cell numberCell right">
                    <input type="text" value=0 class="matOwnedCountInput" target=${oi} id="matowned${oi}">
                </div>
            `
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

    function forSelectedCollector(art){
        let sel;
        for(k in collectorsActive){
            if(collectorsActive[k]) sel = k;
        }

        if(!sel) return {collectionIndex: -1};

        let aName = art.name;
        let collectorCollections = collectionData.filter(c => c.collector == sel);
        if(!collectorCollections.length) return {collectionIndex: Infinity};

        for(let i=0; i<collectorCollections.length; i++){
            for(let j=0; j<collectorCollections[i].artefacts.length; j++){
                if(aName == collectorCollections[i].artefacts[j]){
                    let dataColl = collectionData.filter(c => c.name == collectorCollections[i].name)[0];
                    return {collectionIndex: collectionData.indexOf(dataColl)};

                }
            }
        }

        return {collectionIndex: Infinity};
    }

    function anyCollectorSelected(){
        for(k in collectorsActive){
            if(collectorsActive[k]) return true;
        }

        return false;
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
            if(forSelectedCollector(artifactData[i]).collectionIndex == Infinity) continue;


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

    function getMaterialsDataFromArtifactData(){
        let mats = [];
        let matsRecorded = [];
        for(let i=0; i<artifactData.length; i++){
            let a = artifactData[i];
            for(let j=0; j<a.materials.length; j++){
                let m = a.materials[j].name;
                if(!matsRecorded.includes(m)){
                    mats.push({
                        name: m,
                        type: a.site
                    });
                    matsRecorded.push(m);
                }
                else{
                    let c = mats.filter(x => x.name == m)[0];
                    if(c.type != a.site) c.type = "Agnostic";
                }
            }
        }

        return mats;
    }
}();
