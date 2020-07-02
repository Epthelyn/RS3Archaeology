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
                    <input type="button" value="-" artTarget=${i} class="artMod" action="minus" id="artminus${i}">
                    <input type="button" value="+" artTarget=${i} class="artMod" action="plus" id="artplus${i}">
                    <input type="checkbox" class="artCheck" id="artcheck${i}">
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
                $(`#artRow${target}`).removeClass('active');
            }
            else if(currentValue == 0){
                $(`#artRow${target}`).removeClass('active');
            }
            else if(currentValue == 1 && action == "plus"){
                $(`#artRow${target}`).addClass('active');
            }

            $(`#art${target}`).val(currentValue);
            calcTotals();
        });

        let saveData = localStorage.getItem("rs3archcalcData");
        if(saveData){
            saveData = $.parseJSON(saveData);
            for(let i=0; i<saveData.length; i++){
                $(`#art${saveData[i].i}`).val(saveData[i].n);
                if(saveData[i].n > 0){
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

        for(let i=0; i<artifactData.length; i++){
            let artQuantity = parseInt($(`#art${i}`).val());
            if(isNaN(artQuantity) || artQuantity == 0) continue;
            if(!inSearch(artifactData[i])) continue;
            

            saveData.push({i: i, n: artQuantity});
            if(checksEnabled && !$(`#artcheck${i}`).is(':checked')) continue;
            if(!sitesActive[artifactData[i].site]) continue;
            totals.count += artQuantity;
            artifactsAvailable.push(artifactData[i].name);
            totals.chronotes+=artifactData[i].chronotes*artQuantity;
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
        //console.log(totals);
        //console.log(artifactsAvailable);

        let collectionsPossible = [];
        for(let i=0; i<collectionData.length; i++){
            let p = checkCollectionRequirements(collectionData[i],artifactsAvailable);
            if(p.count > 0){
                collectionsPossible.push({
                    index: i,
                    collection: collectionData[i].name,
                    requirementsCheck: p
                });
            }
        }

        //console.log(collectionsPossible);
        collectionsPossible = collectionsPossible.sort((a,b) => b.requirementsCheck.complete - a.requirementsCheck.complete);

        let output = `<b>Total Experience: ${~~totals.xp} from ${totals.count} artefact${totals.count>1?"s":""}.</b> <br>`;
        output += materialImage("Chronotes") + "&nbsp;" + "Chronotes from collections" + ": " + totals.chronotes + "<br>";
        output += materialImage("Chronotes") + "&nbsp;" + "Chronotes from museum" + ": " + (~~(totals.chronotes*0.4)) + "<br>";
        output += "<br><b>Materials Required</b>:<br>";
        if(!totals.materials.length){
            output += "No artefacts selected.<br>";
        }
        for(let i=0; i<totals.materials.length; i++){
            output += materialImage(totals.materials[i].name) + "&nbsp;" + totals.materials[i].name + ": " + totals.materials[i].quantity + "<br>";
        }

        output += "<br><b>Collections</b>:<br>";
        if(!collectionsPossible.length){
            output += "No collections possible.<br>";
        }
        for(let i=0; i<collectionsPossible.length; i++){
            let c = collectionData[collectionsPossible[i].index];
            let p = collectionsPossible[i];
            
            let spanOpacity = p.requirementsCheck.complete?"100%":"50%";
            output += `<span style="opacity: ${spanOpacity}">${p.collection} for ${c.collector}: ${p.requirementsCheck.count}/${c.artefacts.length}</span><br>`;
        }

        $('#output').html(output);

        saveData = JSON.stringify(saveData);
        localStorage.setItem("rs3archcalcData", saveData);

    }

    function checkCollectionRequirements(collection, available){
        let count = 0;
        let missing = [];
        for(let i=0; i<collection.artefacts.length; i++){
            if(available.includes(collection.artefacts[i])) count++;
            else missing.push(collection.artefacts[i]);
        }

        return {
            complete: count==collection.artefacts.length,
            count: count,
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