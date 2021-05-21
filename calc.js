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
        "General Bentnoze": false,
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
    let showOnlyNeededMaterials = false;

    const lampXP = [
        250, 276, 308, 340, 373, 416, 492, 508, 577, 614,						// 1 to 10
        680, 752, 822, 916, 1008, 1046, 1096, 1140, 1192, 1240,					//11 to 20
        1298, 1348, 1408, 1470, 1536, 1596, 1621, 1656, 1812, 1892,				//21 to 30
        1973, 2056, 2144, 2237, 2332, 2434, 2540, 2648, 2766, 2882,				//31 to 40
        3008, 3138, 3272, 3414, 3558, 3716, 3882, 4050, 4220, 4404, 			//41 to 50
        4593, 4800, 4998, 5218, 5448, 5688, 5940, 6184, 6466, 6737, 			//51 to 60
        7030, 7342, 7645, 8018, 8432, 8686, 9076, 9516, 9880, 10371,			//61 to 70
        10772, 11237, 11786, 12328, 12855, 13358, 13980, 14587, 15169, 15920,	//71 to 80
        16664, 17390, 18087, 19048, 19674, 20132, 21502, 22370, 23690, 24486,	//81 to 90
        25806, 26458, 27714, 28944, 30130, 32258, 33390, 34408					//91 to 98
    ];

    // const pylonXP = [
    //     0,3,3,3,4,4,5,6,6,7,7,8,9,10,11,12,13,13,14,14,15,16,16,17,18,19,19,20,20,22,23,24,25,26,
    //     27,29,30,31,33,34,36,37,39,40,42,44,46,48,50,52,55,57,60,62,65,68,71,74,77,80,84,87,91,95,100,104,108,
    //     113,118,123,129,134,140,147,154,160,166,174,182,189,199,208,217,226,238,245,257,268,279,296,306,322,330,346,361,376,403,417,430
    // ];

    let pylonXP = lampXP.map((xp,index) => {
        const level = Math.max(1,Math.min(98,index+1));
        const xpPer = 0.1*Math.floor(0.5*lampXP[index]);
        return Math.floor((xpPer*0.25*10)/10);
    });

    console.log(pylonXP);

    const tomeXP = [
        300,331.2,369.6,408,447.6,499.2,590.4,609.6,660,736.8,
        816,902.4,986.4,1099.2,1209.6,1255.2,1315.2,1368,1430.4,1488,
        1557.6,1617.6,1689.6,1764,1843.2,1915.2,1945.2,1987.2,2174.4,2270.4,
        2367.6,2467.2,2572.8,2684.4,2798.4,2920.8,3048,3177.6,3319.2,3458.4,
        3609.6,3765.6,3926.4,4096.8,4269.6,4459.2,4658.4,4860,5064,5284.8,
        5511.6,5760,5997.6,6261.6,6537.6,3825.6,7128,7240.8,7759.2,8084.4,
        8436,8810.4,9174,9621.6,10118.4,10423.2,11419.2,11856,12445.2,12926.4,
        13484.4,14143.2,14793.6,15426,16029.6,16776,17504.4,18202.8,19104,19996.8,
        20868,21704.4,22857.6,23608.8,24158.4,25802.4,26844,28428,29383.2,30968,
        31750,33257,34733,36156,38710,40068,41290,43299,45002,46704,
        48407,50110,51812,53515,55217,56920,58622,60325,62028,63730,
        65432,67135,68837,70539,72242,73944,75647,77351,80261,86561
    ];

    $(document).ready(function(){
        let savedInfo = localStorage.getItem('rs3arch_info');
        if(savedInfo){
            savedInfo = $.parseJSON(savedInfo);
            for(k in savedInfo){
                $(`#ii_${k}`).val(savedInfo[k]);
            }
        }

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
                //data = data.filter(d => d.type != "Special");
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

        $('.collectorContainer').on('click', function(){
            let coll = $(this).attr('collector');

            let enableSelf = !collectorsActive[coll];

            $('.collectorContainer').addClass('inactive');
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

            artifactData.forEach(artifact => {
                artifact.owned = 0;
                artifact.unrestored = 0;
            });

            calcTotals();
            generateTable();
        });

        $('.clearBtnMats').on('click', function(){
            if(!confirm("All material quantities will be reset.")) return;
            $('.matOwnedCountInput').val(0);

            materialData.forEach(material => {
                material.owned = 0;
            });
            calcTotals();
            generateTable();
        });

        $('.dispModeBtn').on('click', function(){
            if(listView == "ARTIFACTS"){
                $(this).val("Show Artefacts");
                listView = "MATERIALS";
            }
            else{
                $(this).val("Show Materials");
                listView = "ARTIFACTS";
            }

   
            generateTable();
        });

        
        $('.infoInput').on('change', function(){
            let info = {
                level: 1,
                batts: 0,
                tomes: 0,
                outfit: 0
            }

            for(k in info){
                info[k] = $(`#ii_${k}`).val();
            }

            localStorage.setItem('rs3arch_info',JSON.stringify(info));

            calcTotals();
        });

        $('#ii_level').on('change', generateTable);
    });

    function anythingInCollectionDisplayed(c){
     
        if(!c.artefacts) return false;
        
        for(let i=0; i<c.artefacts.length; i++){
            let aIndex = artifactData.indexOf(artifactData.filter(a => a.name == c.artefacts[i])[0]);
            //console.log(c.artefacts[i]);
            //console.log(aIndex);
            if(!artifactData[aIndex]) return false;
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
        tableMaterialData = [...tableMaterialData.filter(a => a.type != "Special"),...tableMaterialData.filter(a => a.type == "Special")];
        tableMaterialData = tableMaterialData.filter(material => sitesActive[material.type] || material.type == "Special" || material.type == "Agnostic");

        let anyColl = anyCollectorSelected();
        if(anyColl){
            let collMats = collectorMaterials(anyColl.collector);
            tableMaterialData = tableMaterialData.filter(material => collMats.has(material.name));
        }
        
        if($('.searchInput').val() && $('.searchInput').val().length){
            tableMaterialData = tableMaterialData.filter(material => material.name.toLowerCase().indexOf($('.searchInput').val().toLowerCase()) != -1);
        }
        // console.log(tableMaterialData);

        for(let i=0; i<tableData.length; i++){
            let rowClass = artifactData[i].site;
            let oi = tableData[i].originalIndex;
            //if($(`#art${i}`).val() > 0) rowClass += " active";

            let displayReqs = {
                siteActive: sitesActive[artifactData[oi].site],
                inSearch: inSearch(artifactData[oi]),
                forCollector: forSelectedCollector(artifactData[oi]).collectionIndex == Infinity
            }

            let rowDisplayed = !(!displayReqs.siteActive || !displayReqs.inSearch || displayReqs.forCollector);
            if(listView != "ARTIFACTS") rowDisplayed = false;

            if(listView == "ARTIFACTS" /*rowDisplayed*/){
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
                            let rr = "";
                            if(newColl.repeatableReward){
                                let rewards = [];
                                for(rewardKey in newColl.repeatableReward){
                                    rewards.push({reward: rewardKey, quantity: newColl.repeatableReward[rewardKey]});
                                }
                                rr = rewards.map(r => r.quantity + " " + r.reward).join(", ");
                            }
                            table += `<div class="row subHeader">
                                <div class="collectionHeaderName">
                                ${newColl.name}
                                </div>
                                <div class="collectionHeaderRewards">
                                    <b style="color: #D2D6DC;">${newColl.reward || ""}</b><br>
                                    ${rr}
                                </div>
                            </div>`;
                        }
                    }
                }
            }

            if(!rowDisplayed)
                table += `<div class="row" id="artRow${oi}" style="display: none;" class="${rowClass}">`;
            else
                table += `<div class="row" id="artRow${oi}" class="${rowClass}">`;
                table += `<div class="cell nameCell">
                    <div class="artefactName">
                    ${godImage(artifactData[oi].site)}&nbsp;
                    ${artifactData[oi].name}
                    </div>
                    <div class="artefactLocation">
                        ${artifactData[oi].location || ""}
                    </div>
                </div>`;
                table += `<div class="cell numberCell" ${artifactData[oi].level > $('#ii_level').val()?`style="color: red;"`:``}>
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
                    <input type="text" value=${artifactData[oi].owned || 0} class="artOwnedCountInput" target=${oi} id="artowned${oi}">
                </div>`;
                table += `<div class="cell numberCell right">
                    <input type="button" value="-" artTarget=${oi} class="artMod" action="minus" id="artminus${oi}">
                    <input type="button" value="+" artTarget=${oi} class="artMod" action="plus" id="artplus${oi}">
                </div>`;
                table += `<div class="cell numberCell right" style="text-align: center;">
                    <input type="text" value=${artifactData[oi].unrestored || 0} class="artCountInput" target=${oi} id="art${oi}">
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

            if(newMat !== null && newMat !== Infinity && !showOnlyNeededMaterials){
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
        
        $('.matOwnedMod').on('click', function(){
            let action = $(this).attr('action');
            let target = $(this).attr('matTarget');

            let currentValue = parseInt($(`#matowned${target}`).val());
            if(isNaN(currentValue)) currentValue = 0;

            switch(action){
                case "plus": currentValue++; break;
                case "minus": currentValue--; 
            }

            // if(currentValue < 0){
            //     currentValue = 0;
            //     $(`#matRow${target}`).removeClass('active');
            // }
            // else if(currentValue == 0){
            //     $(`#matRow${target}`).removeClass('active');
            // }
            // else if(currentValue == 1 && action == "plus"){
            //     $(`#matRow${target}`).addClass('active');
            // }

            $(`#matowned${target}`).val(currentValue);

            materialData[target].owned = currentValue;
            calcTotals();
        });

        $('.matOwnedCountInput').on('change', function(){
            let tar = $(this).attr('target');
            let val = parseInt($(this).val());
            if(!isNaN(val)){
                // if(val == 0) $(`#matRow${tar}`).removeClass('active');
                // else $(`#matRow${tar}`).addClass('active');
                materialData[tar].owned = val;
            }
            
            calcTotals();
        });

        $('.artCountInput').on('change', function(){
            let tar = $(this).attr('target');
            let val = parseInt($(this).val());
            if(!isNaN(val)){
                if(val == 0) $(`#artRow${tar}`).removeClass('part-active');
                else $(`#artRow${tar}`).addClass('part-active');
                artifactData[tar].unrestored = currentValue;
            }
            calcTotals();
        });

        $('.artOwnedCountInput').on('change', function(){
            let tar = $(this).attr('target');
            let val = parseInt($(this).val());
            if(!isNaN(val)){
                if(val == 0) $(`#artRow${tar}`).removeClass('active');
                else $(`#artRow${tar}`).addClass('active');
                artifactData[tar].owned = currentValue;
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

            artifactData[target].unrestored = currentValue;
            // console.log(artifactData);
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

            artifactData[target].owned = currentValue;
            calcTotals();
        });

        let saveData = localStorage.getItem("rs3archcalcData");
        if(saveData){
            saveData = $.parseJSON(saveData);
            for(let i=0; i<saveData.length; i++){
                $(`#art${saveData[i].i}`).val(saveData[i].n||0);
                $(`#artowned${saveData[i].i}`).val(saveData[i].nR||0);
                artifactData[saveData[i].i].unrestored = (saveData[i].n||0);
                artifactData[saveData[i].i].owned = (saveData[i].nR||0);
                if(saveData[i].n > 0){
                    $(`#artRow${saveData[i].i}`).addClass('part-active');
                }
                if(saveData[i].nR > 0){
                    $(`#artRow${saveData[i].i}`).addClass('active');
                }
            }
            
        }

        let saveData_materials = localStorage.getItem("rs3archcalcMaterials");
        if(saveData_materials){
            saveData_materials = $.parseJSON(saveData_materials);
            // console.log(saveData_materials);
            for(let i=0; i<saveData_materials.length; i++){
                $(`#matowned${saveData_materials[i].i}`).val(saveData_materials[i].n||0);
                materialData[saveData_materials[i].i].owned = (saveData_materials[i].n||0);
                if(saveData_materials[i].n > 0){
                    $(`#matRow${saveData_materials[i].i}`).addClass('active');
                }
            }
            // calcTotals();
        }

        calcTotals();
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
            if(collectorsActive[k]) return {
                collector: k
            };
        }

        return false;
    }

    function godImage(site){
        return `<img class="rowIcon" src="https://runescape.wiki/images/thumb/1/11/${site}_symbol.png/25px-${site}_symbol.png"></img>`;
    }

    function materialImage(mat){
        if(mat.indexOf('(3)')){ //Potion handling
            return `<img class="matImg" src="https://runescape.wiki/images/thumb/c/cf/${mat.replace(/\(3\)/gm,"")}_detail.png/100px-${mat}_detail.png">`;
        }
        else{
            return `<img class="matImg" src="https://runescape.wiki/images/thumb/c/cf/${mat}_detail.png/100px-${mat}_detail.png">`;
        }
        
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
        let saveData_materials = [];

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

        // console.log(totals.materials);
        materialData.forEach((material, index) => {
            let matOwnedQuantity = material.owned || 0; //parseInt($(`#matowned${index}`).val());
            if((isNaN(matOwnedQuantity))) return;
            if(matOwnedQuantity > 0)
                saveData_materials.push({i: index, n: matOwnedQuantity});

            let totalNeeded = totals.materials.filter(mat => mat.name == material.name)[0];
            if(totalNeeded){
                totalNeeded = totalNeeded.quantity;
                if(matOwnedQuantity >= totalNeeded){
                    $(`#matRow${index}`).addClass('active');
                    $(`#matRow${index}`).removeClass('inactive');
                }
                else{
                    $(`#matRow${index}`).addClass('inactive');
                    $(`#matRow${index}`).removeClass('active');
                }
            }
            else{
                $(`#matRow${index}`).removeClass('active');
                $(`#matRow${index}`).removeClass('inactive');
                if(showOnlyNeededMaterials)
                    $(`#matRow${index}`).css('display','none');
            }
        });
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

        // console.log(collectionsPossible);
        let chronotesFromCompleted = {
            restoredOnly: 0,
            any: 0
        }

        collectionsPossible.forEach(coll => {
            const ref = collectionData[coll.index];
            if(!ref.repeatableReward) return;
            if(!ref.repeatableReward.chronotes) return;
            
            if(coll.requirementsCheck.completeByDamaged){
                chronotesFromCompleted.any += ref.repeatableReward.chronotes;
                console.log(coll);
            }
            else if(coll.requirementsCheck.completeByRestored){
                // chronotesFromCompleted.any += ref.repeatableReward.chronotes;
                chronotesFromCompleted.restoredOnly += ref.repeatableReward.chronotes;
                console.log(coll);
            }
        });

        // console.log(chronotesFromCompleted);

        const archLevel = parseInt($('#ii_level').val());
        const tomes = parseInt($('#ii_tomes').val());
        const batts = parseInt($('#ii_batts').val());// + parseInt($('#ii_rex').val());
        const outfit = parseInt($('#ii_outfit').val());

        const outfitBonus = 1 + (outfit < 5?0.01*outfit:0.06);
        
        let totalTomeXP = 0;
        let totalBattXP = 0;

        if(!isNaN(archLevel)){
            if(!isNaN(tomes)){
                totalTomeXP = tomes*tomeXP[Math.min(120,Math.max(archLevel,1))];
            }
            if(!isNaN(batts)){
                totalBattXP = batts*pylonXP[Math.min(98,Math.max(archLevel,1))];
                if(batts >= 100){
                    totalBattXP*=1.2;
                   
                }
                else if(batts >= 10){
                    totalBattXP*=1.1;
                }
                totalBattXP = Math.floor(totalBattXP);
            }
        }

        //totalBattXP*=outfitBonus;
        //totalTomeXP*=outfitBonus;
        totals.xp*=outfitBonus;
        
        let totalCacheXP = 0;
        if(totals.materials.length){
            totals.materials.forEach(m => {
                const thisMat = materialData.filter(mat => m.name == mat.name)[0];
                const matIndex = materialData.indexOf(thisMat);
                const matDiff = Math.max(m.quantity - $(`#matowned${matIndex}`).val(),0);
                const xpGained = matDiff>0&&thisMat.cacheXP?(~~(matDiff*thisMat.cacheXP)):0;
                totalCacheXP += xpGained;
            });
        }

        totalCacheXP *= outfitBonus;

        let output = `<b>Artefact Experience: ${~~totals.xp}</b> from <b>${totals.count}</b> artefact${totals.count>1||totals.count==0?"s":""}. <br>`;
        if(totalTomeXP) output += `<b>Tome Experience:</b> ${~~totalTomeXP}<br>`;
        if(totalBattXP) output += `<b>Battery/Fragment Experience:</b> ${~~totalBattXP}<br>`;
        if(totalCacheXP) output += `<b>Cache Excavation Experience:</b> ${~~totalCacheXP}<br>`;
        output += `<b>Total Experience:</b> ${~~(totals.xp + totalTomeXP + totalBattXP + totalCacheXP)} ${outfitBonus>1?`(x${outfitBonus})`:``}<br>`;
        // output += materialImage("Chronotes") + "&nbsp;" + "Chronotes from collections" + ": " + totals.chronotes + "<br>";
        // output += materialImage("Chronotes") + "&nbsp;" + "Chronotes from museum" + ": " + (~~(totals.chronotes*0.4)) + "<br>";
        output += "<br><b>Material Summary</b>"
        output += `<br><label style="display: inline-block; padding-right: 10px; white-space: nowrap; margin-left: 0px;"><span style="vertical-align: middle;">Show only required in material view:</span> <input type="checkbox" id="mats_showOnlyReq" ${showOnlyNeededMaterials?'checked':''} style="vertical-align: middle; width: 20px; height: 20px;"></label><br>`;
        // console.log(totals.materials);
        if(!totals.materials.length){
            output += "No artefacts selected.<br>";
        }
        else{
            output += `<table class="materialOutputTable">`;
            output += `<tr>
                        <td colspan="2" class="materialOutputTableCell"><b>Material</b></td>
                        <td class="materialOutputTableCell"><b>Required</b></td>
                        <td class="materialOutputTableCell"><b>Owned</b></td>
                        <td class="materialOutputTableCell"><b>To collect</b></td>
                        <td class="materialOutputTableCell"><b>Collect XP</b></td>
                      </tr>`;
            output += totals.materials.map(m => {
                const thisMat = materialData.filter(mat => m.name == mat.name)[0];
                const matIndex = materialData.indexOf(thisMat);
                // console.log(matIndex);
                const matCount = thisMat.owned || 0;

                let matDiff = Math.max(m.quantity - matCount,0);
                if(isNaN(matDiff)) matDiff = 0;
                return `<tr>
                            <td style="height: 20px; line-height: 20px">${materialImage(m.name)}</td>
                            <td class="materialOutputTableCell">${m.name}</td>
                            <td class="materialOutputTableCell num">${m.quantity}</td>
                            <td class="materialOutputTableCell num">${matCount}</td>
                            <td class="materialOutputTableCell num" style="color: ${matDiff==0?"lime":"red"}">${matDiff}</td>
                            <td class="materialOutputTableCell num">${matDiff>0&&thisMat.cacheXP?(~~(matDiff*thisMat.cacheXP*outfitBonus)):""}</td>
                        </tr>`;
            }).join("");
            output += "</table>";

        }
        output += "<br><hr>";
        output += "<b><u>Including Damaged Artefacts</u></b><br>";
        output += materialImage("Chronotes") + "&nbsp;" + "Chronotes from collectors (exc. completion bonus)" + ": " + totals.chronotes + "<br>";
        output += materialImage("Chronotes") + "&nbsp;" + "Chronotes from museum bin (40%)" + ": " + (~~(totals.chronotes*0.4)) + "<br><br>";
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
        output += materialImage("Chronotes") + "&nbsp;" + "Chronotes from collectors (exc. completion bonus)" + ": " + totals.chronotesRestored + "<br>";
        output += materialImage("Chronotes") + "&nbsp;" + "Chronotes from museum bin (40%)" + ": " + (~~(totals.chronotesRestored*0.4)) + "<br><br>";
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
        saveData_materials = JSON.stringify(saveData_materials);
        // console.log(saveData_materials);
        localStorage.setItem("rs3archcalcData", saveData);
        localStorage.setItem("rs3archcalcMaterials", saveData_materials);

        $('#mats_showOnlyReq').on('change',function(e){
            showOnlyNeededMaterials = $(this).is(':checked');
            generateTable();
        });

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
        if(art.name.toLowerCase().includes(s)) return {found: "name"};
        if(art.location.toLowerCase().includes(s)) return {found: "location"};
        if(!isNaN(parseInt(searchFilter)) && art.level == parseInt(searchFilter)) return {found: "level"};

        const searchCollections = collectionData.filter(coll => coll.name.toLowerCase().includes(s) && coll.artefacts.includes(art.name));
        if(searchCollections.length) return {found: "collection"};

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

    function setListViewMode(mode){
        listView = mode;
        generateTable();
    }

    function collectorMaterials(collector){
        const collections = collectionData.filter(collection => collection.collector == collector);
        let artefacts = [];
        collections.forEach(collection => {
            artefacts.push(...collection.artefacts);
        });

        // console.log(artefacts);

        let materials = [];
        artefacts.forEach(artefact => {
            const a = artifactData.filter(art => art.name == artefact)[0];

            materials.push(...a.materials.map(mat => mat.name));
        });

        // console.log(materials);
        return new Set(materials);
    }

    // return{
    //     setListViewMode,
    //     collectorMaterials
    // }
}();