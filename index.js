const GameBoard = (() => {
    const squares = Array(9).fill(undefined); // we fill with undefined so that the Array.prototype.every method will scan the 'empty' squares
    const updateSquare = (index, value) => {
        if (0 <= index < 9){
            squares[index] = value;
        } else {
            new Error("index out of bounds");
        }
    }
    const checkForWinner = () => {
        // because there are only 9 things to check, we create a preset list of triples to check corresponding to rows, columns and diagonals.
        const indexTriples = [ [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6 ] ];

        const checkTriple = (indexTriple) => {
            let thereIsWinner = false;
            let winnerIs;

            const triple = indexTriple.map( index => squares[index]);
            const firstEntry = triple[0];

            // if firstEntry is undefined or falsy, then everyCallback returns false
            // if firstEntry is truthy, everyCallback checks whether the arrValue matches firstEntry 
            const everyCallback = arrValue => Boolean(firstEntry) && arrValue === firstEntry;

            // if thereIsWinner is true, we don't want to override that
            thereIsWinner = thereIsWinner || triple.every(everyCallback);
            if (thereIsWinner){
                winnerIs = winnerIs || firstEntry;
            }

            return {thereIsWinner, winnerIs};
        }

        const resultArr = indexTriples.map( checkTriple );

        return resultArr.find( result => result.thereIsWinner);
    }

    const checkForDraw = () => {
        const noEmptySquares = squares.every( value => value !== undefined );

        // if there are no empty squares and there is no winner, then we have a draw

        return noEmptySquares && !Boolean(checkForWinner());

    }

    const resetGame = () => {
        squares.fill(undefined);
    }

    return {squares, updateSquare, checkForWinner, checkForDraw, resetGame };

})();

const GameInstance = (() => {
    const gameBoard = GameBoard; //just a reference
    
    // internal state variables
    let _isXTurn = true;
    let _thereIsWinner;
    let _thereIsDraw;
    let _winnerIs;

    // internal private state variables with callbacks
    // because we want to return primitives from this module (js doesn't have references)
    const isXTurn = () => _isXTurn;
    const thereIsWinner = () => _thereIsWinner;
    const thereIsDraw = () => _thereIsDraw;
    const winnerIs = () => _winnerIs;

    function updateState({thereIsWinner, thereIsDraw, winnerIs, isXTurn}){
        _isXTurn = isXTurn;
        _thereIsWinner = thereIsWinner;
        _thereIsDraw = thereIsDraw;
        _winnerIs = winnerIs;
    }

    function takeTurn(index){
        // we deny further turns if there is a winner or a draw
        if (_thereIsWinner || _thereIsDraw ) return;
        
        //otherwise
        
        const currentPlayer = _isXTurn ? 'x':'o';

        gameBoard.updateSquare(index, currentPlayer);


        const winnerCheck = gameBoard.checkForWinner();
        const thereIsWinner = Boolean(winnerCheck);

        let winnerIs;
        if (thereIsWinner){
            winnerIs = winnerCheck.winnerIs
        }
        
        let thereIsDraw;
        if (!thereIsWinner) {
            thereIsDraw = gameBoard.checkForDraw();
        }

        let isXTurn = !_isXTurn;

        updateState({
            thereIsWinner, thereIsDraw, winnerIs, isXTurn
        });
    }

    return {isXTurn, thereIsWinner, thereIsDraw, winnerIs, gameBoard, takeTurn};

})();

const Player = (name,isX) => {
    isX = Boolean(isX);
    return {name, isX};
}

// handles Dom manipulation
const DisplayController = ( () => {
    const instance = GameInstance; // note, this is a living reference
    const board = instance.gameBoard; // note, this is a living reference

    const displaySquares = document.querySelectorAll(".square");
    const displayWinner = document.querySelector('h2#winner-is');

    function renderBoard(){
        const squares = board.squares;
        
        displaySquares.forEach( (square,index) => {    
            square.innerText = squares[index] || "";
            
        });

        const thereIsWinner = instance.thereIsWinner();
        if (thereIsWinner){
            
            const inputXName = document.querySelector('input[name="player-X"]').value;
            const inputOName = document.querySelector('input[name="player-O"]').value;
            const winnerName = instance.winnerIs() === 'x'
                ? inputXName || 'x'
                : inputOName || 'o'
            displayWinner.innerText = `${winnerName.toUpperCase()} WINS`;
        }
    }

    // set event checkers for squares
    displaySquares.forEach( square => {
        const clickHandler = e => {
            const index = e.target.dataset.index;
            instance.takeTurn(index);
            renderBoard();
        }
        square.addEventListener('click', clickHandler);
    })

    const resetBtn = document.querySelector('button#reset-game-btn');

    resetBtn.addEventListener('click', () => {
        board.resetGame();
        renderBoard();
        displayWinner.innerText="";
    })
    return {};
} )()