const fs = require('fs');
const prompt = require("prompt-sync")();

function main(){
    //Ask user for the path of mapfile. If left empty, use "map.txt" as default.
    let path = prompt("What's the mapfile path ?")
    path = path === "" ? "./map.txt": path;
    //Read the file
    const rawMap = readMap(path);
    console.log("=================");
    console.log(rawMap);
    //Extract data out of the mapfile
    const mapProperties = getMapProperties(rawMap);
    console.log("=================");
    console.log(mapProperties);
    //From extracted data, create representative variables to then operate on
    const processedMap = createMapFromProperties(mapProperties);
    console.log("=================");
    console.log(processedMap);
    //From processed data, use the matrice to simulate explorers movements
    const [afterExplorerMovesMap, explorers] = executeExplorerMoves(processedMap, mapProperties.explorers);
    console.log("=================");
    console.log(afterExplorerMovesMap);
    console.log(explorers);
    //After explorer movements have been simulated, write the output textfile
    writeFinalStateMap(afterExplorerMovesMap, explorers);
}

function readMap(path){
    if(!fs.existsSync(path)){
        console.log('Map file not found');
        throw Error('Map file with path ' + path + " was not found");
    } else {
        const rawMap = fs.readFileSync(path,'utf-8')
        const mapLines = rawMap.split(' \r\n')
        return mapLines;
    }
}

function getMapProperties(mapLines){

    const map = {};
    const mountains = [];
    const treasures = []
    const explorers = {}

    mapLines.forEach(mapLine => {

        //Clean the raw data line into usable array.
        mapLine = mapLine.split(' - ')
        mapLine[0] = mapLine[0].substr(0, 1)
        mapLine.map(elem => elem.replace(new RegExp('\s'), ""));
        if(mapLine.some(elem => new RegExp('[\s-]').test(elem))){throw new Error('File is wrongly formatted')}
        console.log(mapLine)

        switch(mapLine[0]){
            case "C":
                mapLine[1] = parseInt(mapLine[1]);
                mapLine[2] = parseInt(mapLine[2]);
                if([mapLine[1], mapLine[2]].some(dimension => isNaN(dimension) || dimension > 100 || dimension < 1)){
                    throw new Error("Absurd: A map dimension is not a number, is in the negatives or is above 100.");
                }
                map['height'] = mapLine[1];
                map['width'] = mapLine[2];
                break;
            case "M":
                mapLine[1] = parseInt(mapLine[1]);
                mapLine[2] = parseInt(mapLine[2]);
                mountains.push({x: mapLine[1], y: mapLine[2]})
                break;
            case "T":
                mapLine[1] = parseInt(mapLine[1]);
                mapLine[2] = parseInt(mapLine[2]);
                mapLine[3] = parseInt(mapLine[3]);
                if(mapLine[3] < 1){ throw new Error('Absurd: A treasure tile has 0 treasure')}
                treasures.push({x: mapLine[1], y: mapLine[2], nb: mapLine[3]})
                break;      
            case "A":
                if(!new RegExp('^[a-zA-Z_]{2,}[a-zA-Z]*$').test(mapLine[1])){
                    throw new Error('Absurd: The name of an Adventurer was incorrect')
                }
                mapLine[2] = parseInt(mapLine[2]);
                mapLine[3] = parseInt(mapLine[3]);
                if(["N", "E", "S", "W"].indexOf(mapLine[4]) < 0){
                    throw new Error("Absurd: The orientation of an adventurer was not a cardinal direction.")
                }
                if(!new RegExp('^([ADG]+)$').test(mapLine[5])){
                    console.log(mapLine[5]) 
                    if(!isNaN(parseInt(mapLine[5][0]))){
                        throw Error("You may be using the result map textfile and not the starting one.")
                    }
                    throw new Error("Absurd: The movements of an adventurer contained a mistake")
                }
                explorers[mapLine[1]] = {
                    name: mapLine[1],
                    x: mapLine[2],
                    y: mapLine[3],
                    orientation: mapLine[4],
                    movements: mapLine[5].split(''),
                    foundTreasures: 0
                };
                break;
            case "#":
                console.log("comment : " + mapLine)
                break;
            case "":
                throw new Error('File is empty.')
                break;
            default:
                throw new Error('File contains unknown data')
        }
    });
    if(!map.height || !map.width || !Object.keys(explorers).length || !treasures.length){
        //console.log(!map.x, !map.y, Object.keys(explorers).length, treasures.length)
        throw new Error('File contains not enough data')
    }
    if([...mountains, ...treasures, ...Object.values(explorers)].some(tile => isNaN(tile.x) || isNaN(tile.y) || tile.x > map.height || tile.y > map.width)){
        //[...mountains, ...treasures, ...Object.values(explorers)].map(tile => console.log(tile.x, tile.y, tile.x > map.height, tile.y > map.width));
        throw new Error('Absurd: A tile was positioned out of the bounds of the map or one of its coordinates is NaN.')
    }
    return {
        map,
        mountains,
        treasures,
        explorers
    }
}

function createMapFromProperties(mapProperties){
    const {
        map,
        mountains,
        treasures,
        explorers
    } = mapProperties;
    //create a two-dimensionnal array from length and height properties and fill it with plains (of grass).
    const processedMap = Array.from({length: map.width}, e => Array.from({length: map.height}).fill("P"))
    //Attribute tiles for mountains and treasures.
    mountains.forEach(mountain => {
        processedMap[mountain.y][mountain.x] = "M"
    });
    treasures.forEach(treasure => {
        let tile = processedMap[treasure.y][treasure.x]
        //If a Treasure was already marked on this tile, just add the current number to the new one.
        if(tile.indexOf("T") > -1){
            let nbOfTreasures = parseInt(tile.slice(1))+treasure.nb;
            processedMap[treasure.y][treasure.x] = "T"+nbOfTreasures.toString();
        } else if(tile === "P"){
            processedMap[treasure.y][treasure.x] = "T"+treasure.nb.toString();
        //A treasure shouldn't be put onto a moutain.
        } else if(tile === "M"){
            throw new Error('A Treasure was put onto a mountain tile. Sneaky, but unfortunatly, adventurers will never be able to reach it.')
        }
    });
    Object.values(explorers).map(explorer => {
        let tile = processedMap[explorer.y][explorer.x];
        //An Adventurer shouldn't be put onto a moutain.
        if(tile === "M"){
            throw new Error('An Adventurer was placed onto a mountain tile. It cannot climb down! Help!')
        }
    })
    return processedMap;
}

function executeExplorerMoves(processedMap, explorers){
    console.log(processedMap);

    function getOrientation(turn, currentOrientation){
      const compass = ["N", "E", "S", "W"];
      const idx = compass.indexOf(currentOrientation);
      //If new index should be "out of index" of the compass array, just loop to the other side
      //Maybe there's a better way to do this.
      const newIdx = idx+turn === -1 ? 3 : idx+turn === 4 ? 0 : idx+turn;
      console.log("turned from " + currentOrientation + " to " + compass[newIdx])
      return compass[newIdx];
    }

    function advance(currX, currY, orientation){
        //depending on orientation, advance in a different direction 
        let [x, y] = [currX, currY];
        switch(orientation){
            case 'N': // ↑
                y--
                break;
            case 'S': // ↓
                y++
                break;
            case 'E': // ←
                x--
                break;
            case 'W': // →
                x++
                break;
        }
        const someoneAlreadyOccupiesThisTile = Object.values(explorers)
            .filter(otherExplorer => otherExplorer.x === x && otherExplorer.y === y)?.[0]?.name;
        //if(someoneAlreadyOccupiesThisTile){console.log(someoneAlreadyOccupiesThisTile + " already occupies this tile !")};

        //Depending on the destination, return it or don't advance and return the current tile.
        //If walking onto a treasure tile, decrement the nb of treasure on this tile
            //and increment the number of treasure found (on the main loop) through a bool
        if(processedMap?.[y]?.[x] && !someoneAlreadyOccupiesThisTile){
            console.log("destination is : " + processedMap[y][x])
            if(processedMap[y][x] === "P"){
                return [[x, y], false];
            } else if(processedMap[y][x].indexOf("T") > -1){
                let nbOfTreasuresLeft = parseInt(processedMap[y][x][1]);
                nbOfTreasuresLeft--;
                if(nbOfTreasuresLeft === 0){
                    processedMap[y][x] = "P"    
                } else {
                    processedMap[y][x] = "T"+nbOfTreasuresLeft;
                }
                return [[x, y], true];
            } else {
                return [[currX, currY], false];
            }
        } else {
            return [[currX, currY], false];
        }
    }

    //While any explorer has some movements left
    //Object.values(explorers).map((explorer => console.log(explorer.movements.length)));
    while(Object.values(explorers).map(explorer => explorer.movements.length).some(movements => movements > 0)){
        console.log("------------")
        //There is need to update the explorers from the original array in order to have easy access to the explorers position in the advance func.
            //In particular, for the "someoneAlreadyOccupiesThisTile" value
        Object.entries(explorers).map(([explorer_name, explorer]) => {
            switch(explorer.movements[0]){
                case 'A':
                    console.log(explorer_name + " was at " + explorer.x + " - " + explorer.y);
                    [[explorers[explorer_name].x, explorers[explorer_name].y], foundATreasure] = advance(explorer.x, explorer.y, explorer.orientation);
                    if(foundATreasure){
                        explorers[explorer_name].foundTreasures++;
                        console.log(explorer_name + " found a treasure !");
                    }
                    console.log("and stands on " + explorer.x + " - " + explorer.y);
                    break;
                case 'D':
                    explorers[explorer_name].orientation = getOrientation(-1, explorer.orientation)
                    break;
                case 'G':
                    explorers[explorer_name].orientation = getOrientation(1, explorer.orientation)
                    break;
            }
            //We've done this movement, now get rid of it.
            explorers[explorer_name].movements.shift();
        })
    }
    return [processedMap, Object.values(explorers)];
};

function writeFinalStateMap(finalMap, explorers){
    let text = "";

    // This func is made to mimic the original formatting of the input textfile.
    function addToFile(data){
        data.map(datum => {
            text+= datum+" - "
        });
        text = text.substring(0, text.lastIndexOf(" - ")) + " \r\n"
    }

    const mapSize = ["C", finalMap.length, finalMap[0].length]
    const mountains = [];
    const treasures = [];
    //Deconstruct the map into properties (reverse of func getMapProperties)
    finalMap.map((line, y) => {
        line.map((tile, x) => {
            if(tile === "M"){
                mountains.push({x, y})
            } else if(tile.indexOf("T") > -1){
                treasures.push({x, y, nb: parseInt(tile.slice(1))})
            }
        })
    })
    addToFile(mapSize);
    mountains.map(mountain => {
        addToFile(["M", mountain.x, mountain.y]);
    })
    treasures.map(treasure => {
        addToFile(["T", treasure.x, treasure.y, treasure.nb]);
    })
    explorers.map(explorer => {
        addToFile(["A", explorer.name, explorer.x, explorer.y, explorer.orientation, explorer.foundTreasures]);
    })
    fs.writeFileSync('./result.txt', text)
}

module.exports = {
    readMap,
    getMapProperties,
    createMapFromProperties,
    executeExplorerMoves,
    writeFinalStateMap,
};

//Just to have exaclty 300 lines of code.
main();