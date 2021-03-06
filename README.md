# TreasureMap, a simulator of adventurers exploring a map full of hidden treasures

Enter the conditions through a textfile and discover who got smart enough to uncover some treasure !

## Getting Started

1. Clone this project
2. ```npm install``` on the root folder of this project.
3. (optional) Create or modify the __map.txt__ as you see fit (rules explained below)
3. ```npm run explore```
4. Enter the name of your map file. If unchanged (__map.txt__), you can ignore.
5. Discover the result of the adventurers exploration on the result.txt !

## Testing

Once you have installed the packages, you can lauch the test suites with :
```npm run test```

## Rules

The map onto which your adventurers will explore is a squared-tiled map, akin to a board game.
On this map, there will be *P*lains, *M*ountains, *T*reasures and *A*dventurers.
The simulation will be turn-based.

### Lines of input file

Each line in the input file __map.txt__ corresponds to a property of your map.

#### C - n - n
Indicates the map (__C as in "Carte", french word for map__) dimensions.
- First number is the width of your map.
- Second will be the height.

#### M - n - n
Indicates a moutain tile.
- First number is the position on the horizontal axis.
- Second number is the position on the vertical axis.

#### T - n - n - n
Indicates a moutain tile.
- First number is the position on the horizontal axis.
- Second number is the position on the vertical axis.
- Third number is the number of riches this treasure holds.

#### A - s - n - n - s - s
Indicates a moutain tile.
- In first place is the name of the adventurer.
- First number is the position on the horizontal axis.
- Second number is the position on the vertical axis.
- In fourth place is the starting orientation of the adventurer
    - It takes the first letter of a cardinal direction ('__N__', '__E__', '__S__', '__W__')
- In fifth place is the movements the adventurer will make, turn after turn
    - Its mouvements can be one of 
        - Advance: '__A__' (for '__Avancer__')
        - Turn to the Right '__D__' (for '__Droite__')
        - Turn to the Left '__G__' (for '__Gauche__')

#### # ...
An octothorpe marks a comment, meaning any further content will be ignored.

### Additionnal rules

Only one map dimension should be specified.
If multiple map dimensions are specified, only the latter will be taken into account.

Maps dimensions cannot go over 100 for both width and height.
Mountains, Treasures and Adventurers placed out of the bounds of the map will throw an error.

A treasure cannot have 0 riches.

A treasure nor an adventurer cannot be placed on a moutain tile.
An adventurer put on a treasure tile as its starting position will not uncover any treasure unless it goes away then back to his starting tile.

Adventurers names can only be of letters and more than two of them.

In the end, an input map file must contain :
- Map dimensions
- At least one treasure
- At least one adventurer


