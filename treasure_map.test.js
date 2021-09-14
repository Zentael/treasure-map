const { describe } = require('jest-circus');
const {
    readMap,
    getMapProperties,
    createMapFromProperties,
    executeExplorerMoves,
    writeFinalStateMap
} = require('./treasure_map');

// I wasn't able to correctly write tests to mock fs and simulate reading files.

/*
jest.mock("fs", () => ({
    readFileSync: jest.fn(),
    writeFileSync: jest.fn()
}));

const NO_MAP_TO_BE_READ = {};
const MAP_TO_BE_READ = {
    "./map.txt": ""+    
        "C​ - 3 - 4\r\n"+
        "M​ - 1 - 0\r\n"+ 
        "M​ - 2 - 1\r\n"+ 
        "T​ - 0 - 3 - 2\r\n"+ 
        "T​ - 1 - 3 - 3\r\n"+ 
        "A​ - Lara - 1 - 1 - S - AADADAGGA\r\n"+ 
        "# A​ - Jack - 1 - 1 - S - AAGADDAAA\r\n" 
}

beforeEach(() => {jest.resetModules(); jest.resetAllMocks();})
*/
/*
describe("Read the file", () => {
    test('Finds no textfile map to be read', () => {
        fs.readFileSync.mockReturnValue('{ "test": 1 }');
        const result = fileReader.parseJSONFile("test.json");
        expect(spy.mock.calls).toEqual([['Map file not found']]);
        done();
    });

    test('Reads a map from textfile', () => {
        require("fs").__setMockFile(MAP_TO_BE_READ);
        expect(readMap()).toEqual([
            'C​ - 3 - 4',
            'M​ - 1 - 0',
            'M​ - 2 - 1',
            'T​ - 0 - 3 - 2',
            'T​ - 1 - 3 - 3',
            'A​ - Lara - 1 - 1 - S - AADADAGGA',  
            '# A​ - Jack - 1 - 1 - S - AAGADDAAA '
        ]);
        done();
    });
})
*/

describe("Extract data out of the mapfile.", () => {
    test('File is empty.', () => {
        const rawMap = [''];
        expect(() => getMapProperties(rawMap)).toThrowError('empty');
    });
    test('File is wrongly formatted.', () => {
        const rawMap = [
            'C​ - 3 - 4',
            'M - 1 -- 0', //error is here : there is a double hyphen before the '0'
            'M​ - 2 - 1',
            'T​ - 0 - 3 - 2',
            'T​ - 1 - 3 - 3',
            'A​ - Lara - 1 - 1 - S - AADADAGGA'
        ];
        expect(() => getMapProperties(rawMap)).toThrowError('wrongly formatted');
    });
    test('File contains unkwown tile.', () => {
        const rawMap = [
            'C​ - 3 - 4',
            'L - 1 - 0', //error is here : L is unknown and is probably a typo
            'M​ - 2 - 1',
            'T​ - 0 - 3 - 2',
            'T​ - 1 - 3 - 3',
            'A​ - Lara - 1 - 1 - S - AADADAGGA'
        ];
        expect(() => getMapProperties(rawMap)).toThrowError('unknown');
    });
    test('File contains absurd data.', () => {
        const rawMap = [
            'C​ - 1234 - 4', //maps can't go beyond 100x100
            'M - 101 - 0', //mountains & treasures coordinates can't be over 100
            'M​ - 102 - 8', //tiles can't be placed out of the bounds of the map 
            'T​ - 103 - 3 - 0', //Treasures can't contain 0 treasures
            //Name must be letters and numbers only and >2 letters.
            //Orientation must be a cardinal direction
            //Movements must be one of 'A', 'D', 'G'.
            'A​ - La?r@a - 1 - 1 - R - AADADFAGGA'
            
        ];
        expect(() => getMapProperties(rawMap)).toThrowError('Absurd');
    });
    test('File does not contain all information needed to proceed normally.', () => {
        const rawMap = [
            //There is no map data or no treasure or no adventurer
            'M - 1 - 0',
            'M​ - 2 - 1',            
        ];
        expect(() => getMapProperties(rawMap)).toThrowError('not enough');
    });
    test('File is usable.', () => {
        const rawMap = [
            'C​ - 3 - 4',
            'M - 1 - 0',
            'M​ - 2 - 1',
            'T​ - 0 - 3 - 2',
            'T​ - 1 - 3 - 3',
            'A​ - Lara - 1 - 1 - S - AADADAGGA'
        ];
        expect(getMapProperties(rawMap)).toHaveProperty('map.height', 3);
        expect(getMapProperties(rawMap)).toHaveProperty('map.width', 4);
        expect(getMapProperties(rawMap)).toHaveProperty('mountains', [{x: 1, y: 0}, {x: 2, y: 1}]);
        expect(getMapProperties(rawMap)).toHaveProperty('treasures', [{x: 0, y: 3, nb: 2}, {x: 1, y: 3, nb: 3}]);
        expect(getMapProperties(rawMap)).toHaveProperty('explorers',
        {"Lara": {x: 1, y: 1, name: "Lara", orientation: "S", movements: ['A', 'A', 'D', 'A', 'D', 'A', 'G', 'G', 'A'], foundTreasures: 0}});
    });
});



describe("From extracted data, create representative variables to then operate on.", () => {
    test('', () => {

    });
});

describe("From processed data, use the matrice to simulate explorers movements", () => {
    test('', () => {

    });
});

describe("After explorer movements have been simulated, write the output textfile", () => {
    test('', () => {

    });
});