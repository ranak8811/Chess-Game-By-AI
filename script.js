document.addEventListener('DOMContentLoaded', () => {
    const boardContainer = document.getElementById('board-container');
    const turnIndicator = document.getElementById('turn-indicator');
    const statusMessage = document.getElementById('status-message');
    const resetButton = document.getElementById('reset-button');
    const undoButton = document.getElementById('undo-button');
    const resignButton = document.getElementById('resign-button');
    const offerDrawButton = document.getElementById('offer-draw-button');
    const drawOfferStatus = document.getElementById('draw-offer-status');
    const whiteMovesList = document.getElementById('white-moves-list');
    const blackMovesList = document.getElementById('black-moves-list');
    const gameModeSelect = document.getElementById('mode');

    const initialBoardState = [
        'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',  // Rank 8 (black pieces)
        'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',  // Rank 7 (black pawns)
        null, null, null, null, null, null, null, null, // Rank 6
        null, null, null, null, null, null, null, null, // Rank 5
        null, null, null, null, null, null, null, null, // Rank 4
        null, null, null, null, null, null, null, null, // Rank 3
        'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',  // Rank 2 (white pawns)
        'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'   // Rank 1 (white pieces)
    ];

    const SQUARES = 64;
    const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

    // Unicode characters for pieces
    const PIECES = {
        'K': { type: 'King', color: 'white', char: '\u2654' },   // White King
        'Q': { type: 'Queen', color: 'white', char: '\u2655' },  // White Queen
        'R': { type: 'Rook', color: 'white', char: '\u2656' },   // White Rook
        'B': { type: 'Bishop', color: 'white', char: '\u2657' }, // White Bishop
        'N': { type: 'Knight', color: 'white', char: '\u2658' }, // White Knight
        'P': { type: 'Pawn', color: 'white', char: '\u2659' },   // White Pawn
        'k': { type: 'King', color: 'black', char: '\u265A' },   // Black King
        'q': { type: 'Queen', color: 'black', char: '\u265B' },  // Black Queen
        'r': { type: 'Rook', color: 'black', char: '\u265C' },   // Black Rook
        'b': { type: 'Bishop', color: 'black', char: '\u265D' }, // Black Bishop
        'n': { type: 'Knight', color: 'black', char: '\u265E' }, // Black Knight
        'p': { type: 'Pawn', color: 'black', char: '\u265F' }    // Black Pawn
    };

    let boardState = []; // 1D array representing the board, 0-63
    let currentPlayer = 'white'; // 'white' or 'black'
    let selectedSquareIndex = -1; // Index of the currently selected square
    let validMoves = []; // Array of valid move indices for the selected piece
    let moveHistory = []; // Stores { piece, from, to, capturedPiece, notation, boardStateBeforeMove }
    let gameMode = 'pvp'; // 'pvp' or 'pva'
    let drawOfferedBy = null; // 'white', 'black', or null
    let gameOver = false;

    function initializeBoard() {
        boardState = [...initialBoardState];
        currentPlayer = 'white';
        selectedSquareIndex = -1;
        validMoves = [];
        moveHistory = [];
        whiteMovesList.innerHTML = '<h3>White\'s Moves:</h3>'; // Add header back
        blackMovesList.innerHTML = '<h3>Black\'s Moves:</h3>'; // Add header back
        gameMode = gameModeSelect.value;
        gameOver = false;
        drawOfferedBy = null;
        drawOfferStatus.textContent = '';

        renderBoard();
        updateGameInfo();
        statusMessage.textContent = "New game started. White to move.";
        enableControls();
        gameModeSelect.disabled = false; // Ensure game mode can be changed for a new game
    }

    function renderBoard() {
        boardContainer.innerHTML = ''; // Clear existing board
        for (let i = 0; i < SQUARES; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            const rank = Math.floor(i / 8);
            const file = i % 8;
            square.classList.add((rank + file) % 2 === 0 ? 'light' : 'dark');
            square.dataset.index = i;

            const pieceSymbol = boardState[i];
            if (pieceSymbol && PIECES[pieceSymbol]) {
                const pieceElement = document.createElement('span');
                pieceElement.classList.add('piece');
                pieceElement.classList.add(PIECES[pieceSymbol].color);
                pieceElement.textContent = PIECES[pieceSymbol].char;
                square.appendChild(pieceElement);
            }

            if (i === selectedSquareIndex) {
                square.classList.add('selected');
            }

            if (validMoves.includes(i)) {
                square.classList.add('valid-move');
            }

            square.addEventListener('click', () => handleSquareClick(i));
            boardContainer.appendChild(square);
        }
    }

    function updateGameInfo() {
        turnIndicator.textContent = currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1);
    }

    function handleSquareClick(index) {
        if (gameOver) return;
        // If it's AI's turn in Player vs AI mode, player cannot interact
        if (gameMode === 'pva' && currentPlayer === 'black') {
            statusMessage.textContent = "Waiting for AI's move...";
            return;
        }

        const clickedPieceSymbol = boardState[index];
        const clickedPiece = clickedPieceSymbol ? PIECES[clickedPieceSymbol] : null;

        if (selectedSquareIndex === -1) { // No piece selected yet
            if (clickedPiece && clickedPiece.color === currentPlayer) {
                selectedSquareIndex = index;
                validMoves = getValidMovesForPiece(index);
                if (validMoves.length === 0) {
                    statusMessage.textContent = `${clickedPiece.type} at ${squareToAlgebraic(index)} has no valid moves.`;
                    selectedSquareIndex = -1; // Deselect if no moves
                } else {
                    statusMessage.textContent = `Selected ${clickedPiece.type} at ${squareToAlgebraic(index)}. Choose a destination.`;
                }
            } else if (clickedPiece) {
                statusMessage.textContent = `Not your piece or not your turn. It's ${currentPlayer}'s turn.`;
            } else {
                statusMessage.textContent = `Empty square. Select one of your pieces.`;
            }
        } else { // A piece is already selected
            if (validMoves.includes(index)) { // Clicked on a valid move square
                movePiece(selectedSquareIndex, index);
                selectedSquareIndex = -1;
                validMoves = [];
                switchPlayer();
                // TODO: Check for check/checkmate/stalemate
                statusMessage.textContent = `Move successful. ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} to move.`;
                if (drawOfferedBy && drawOfferedBy !== currentPlayer) {
                    drawOfferStatus.textContent = `${drawOfferedBy.charAt(0).toUpperCase() + drawOfferedBy.slice(1)}'s draw offer declined by move.`;
                }
                drawOfferedBy = null; // Any move cancels/declines a draw offer
                enableControls();

                if (gameMode === 'pva' && currentPlayer === 'black' && !gameOver) {
                    statusMessage.textContent = "AI is thinking...";
                    disableControls(); // Disable player controls while AI thinks
                    setTimeout(makeAIMove, 700); // AI takes its turn after a short delay
                }

            } else if (clickedPiece && clickedPiece.color === currentPlayer) { // Clicked on another of own pieces
                selectedSquareIndex = index;
                validMoves = getValidMovesForPiece(index);
                if (validMoves.length === 0) {
                    statusMessage.textContent = `${clickedPiece.type} at ${squareToAlgebraic(index)} has no valid moves. Select another piece.`;
                    selectedSquareIndex = -1; // Deselect if no moves
                } else {
                    statusMessage.textContent = `Selected ${clickedPiece.type} at ${squareToAlgebraic(index)}. Choose a destination.`;
                }
            } else { // Clicked on an invalid square or opponent's piece (not a capture yet)
                const prevSelectedPieceSymbol = boardState[selectedSquareIndex];
                const prevSelectedPiece = prevSelectedPieceSymbol ? PIECES[prevSelectedPieceSymbol] : null;
                statusMessage.textContent = `Invalid move for ${prevSelectedPiece ? prevSelectedPiece.type : 'piece'} from ${squareToAlgebraic(selectedSquareIndex)} to ${squareToAlgebraic(index)}. ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} to move.`;
                selectedSquareIndex = -1; // Deselect
                validMoves = [];
            }
        }
        renderBoard(); // Re-render to show selection/valid moves
        updateGameInfo();
    }

    function squareToAlgebraic(index) {
        if (index < 0 || index > 63) return '';
        const file = FILES[index % 8];
        const rank = RANKS[Math.floor(index / 8)];
        return file + rank;
    }

    function recordMove(fromIndex, toIndex, pieceSymbol, capturedPieceSymbol) {
        const pieceName = PIECES[pieceSymbol].type.charAt(0);
        const fromAlg = squareToAlgebraic(fromIndex);
        const toAlg = squareToAlgebraic(toIndex);
        let notation = pieceName !== 'P' ? pieceName : ''; // Pawn notation doesn't usually include 'P'
        notation += fromAlg;
        notation += capturedPieceSymbol ? 'x' : '-'; // 'x' for capture, '-' for move
        notation += toAlg;
        // TODO: Add check (+) or checkmate (#) if applicable
        // TODO: Add castling notation (O-O, O-O-O)
        // TODO: Add pawn promotion notation (e.g., e8=Q)

        const boardStateBeforeMove = [...boardState]; // Shallow copy for undo

        moveHistory.push({
            piece: pieceSymbol,
            from: fromIndex,
            to: toIndex,
            capturedPiece: capturedPieceSymbol,
            notation: notation,
            boardStateBeforeMove: boardStateBeforeMove,
            player: currentPlayer
        });
        updateMoveHistoryDisplay();
    }

    function updateMoveHistoryDisplay() {
        whiteMovesList.innerHTML = '';
        blackMovesList.innerHTML = '';
        let moveNumber = 1;
        for (let i = 0; i < moveHistory.length; i++) {
            const move = moveHistory[i];
            const listItem = document.createElement('li');
            if (move.player === 'white') {
                listItem.textContent = `${moveNumber}. ${move.notation}`;
                whiteMovesList.appendChild(listItem);
            } else {
                listItem.textContent = `${move.notation}`;
                // Find the corresponding white move li to append to, or create a new one if it's black's first move in a pair
                if (whiteMovesList.children[moveNumber-1]) {
                    whiteMovesList.children[moveNumber-1].textContent += ` ${move.notation}`;
                }
                blackMovesList.appendChild(listItem); // Keep separate log for simplicity too
                moveNumber++;
            }
        }
        // Scroll to bottom
        whiteMovesList.scrollTop = whiteMovesList.scrollHeight;
        blackMovesList.scrollTop = blackMovesList.scrollHeight;
    }

    function movePiece(fromIndex, toIndex) {
        const pieceToMove = boardState[fromIndex];
        const capturedPiece = boardState[toIndex]; // Could be null

        recordMove(fromIndex, toIndex, pieceToMove, capturedPiece);

        // TODO: Handle pawn promotion, castling, en passant
        boardState[toIndex] = pieceToMove;
        boardState[fromIndex] = null;
    }

    function switchPlayer() {
        currentPlayer = (currentPlayer === 'white') ? 'black' : 'white';
    }

    function getValidMovesForPiece(pieceIndex) {
        const pieceSymbol = boardState[pieceIndex];
        if (!pieceSymbol) return [];

        const piece = PIECES[pieceSymbol];
        const moves = [];
        const currentRank = Math.floor(pieceIndex / 8);
        const currentFile = pieceIndex % 8;

        switch (piece.type) {
            case 'Pawn':
                getPawnMoves(pieceIndex, piece.color, currentRank, currentFile, moves);
                break;
            case 'Rook':
                getRookMoves(pieceIndex, piece.color, currentRank, currentFile, moves);
                break;
            case 'Knight':
                getKnightMoves(pieceIndex, piece.color, currentRank, currentFile, moves);
                break;
            case 'Bishop':
                getBishopMoves(pieceIndex, piece.color, currentRank, currentFile, moves);
                break;
            case 'Queen':
                getQueenMoves(pieceIndex, piece.color, currentRank, currentFile, moves);
                break;
            case 'King':
                getKingMoves(pieceIndex, piece.color, currentRank, currentFile, moves);
                break;
            default:
                // Fallback for pieces not yet implemented or simple pieces
                // This could be empty or a very basic move for testing
                break;
        }
        return moves.filter(move => move >= 0 && move < SQUARES);
    }

    function getPawnMoves(pieceIndex, color, currentRank, currentFile, moves) {
        const direction = color === 'white' ? -1 : 1;

        // Forward one step
        const oneStep = pieceIndex + (direction * 8);
        if (oneStep >= 0 && oneStep < SQUARES && !boardState[oneStep]) {
            moves.push(oneStep);
            // Initial two-step move
            if ((color === 'white' && currentRank === 6) || (color === 'black' && currentRank === 1)) {
                const twoSteps = pieceIndex + (direction * 16);
                if (!boardState[twoSteps]) {
                    moves.push(twoSteps);
                }
            }
        }

        // Diagonal captures
        const captureOffsets = [-1, 1];
        captureOffsets.forEach(offset => {
            const targetFile = currentFile + offset;
            if (targetFile >= 0 && targetFile < 8) {
                const captureIndex = pieceIndex + (direction * 8) + offset;
                if (captureIndex >=0 && captureIndex < SQUARES && boardState[captureIndex] && PIECES[boardState[captureIndex]].color !== color) {
                    moves.push(captureIndex);
                }
            }
        });
        // TODO: En passant, Pawn Promotion
    }

    function getRookMoves(pieceIndex, color, currentRank, currentFile, moves) {
        const directions = [
            { r: -1, f: 0 }, // Up
            { r: 1, f: 0 },  // Down
            { r: 0, f: -1 }, // Left
            { r: 0, f: 1 }   // Right
        ];

        directions.forEach(dir => {
            for (let i = 1; i < 8; i++) {
                const targetRank = currentRank + dir.r * i;
                const targetFile = currentFile + dir.f * i;

                if (targetRank >= 0 && targetRank < 8 && targetFile >= 0 && targetFile < 8) {
                    const targetIndex = targetRank * 8 + targetFile;
                    if (boardState[targetIndex] === null) { // Empty square
                        moves.push(targetIndex);
                    } else {
                        if (PIECES[boardState[targetIndex]].color !== color) { // Opponent's piece
                            moves.push(targetIndex); // Can capture
                        }
                        break; // Path blocked by own or opponent's piece
                    }
                } else {
                    break; // Off board
                }
            }
        });
    }

    function getQueenMoves(pieceIndex, color, currentRank, currentFile, moves) {
        // Queen moves like a rook and a bishop
        getRookMoves(pieceIndex, color, currentRank, currentFile, moves);
        getBishopMoves(pieceIndex, color, currentRank, currentFile, moves);
    }

    function getKingMoves(pieceIndex, color, currentRank, currentFile, moves) {
        const kingMoveOffsets = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        kingMoveOffsets.forEach(([rankOffset, fileOffset]) => {
            const targetRank = currentRank + rankOffset;
            const targetFile = currentFile + fileOffset;

            if (targetRank >= 0 && targetRank < 8 && targetFile >= 0 && targetFile < 8) {
                const targetIndex = targetRank * 8 + targetFile;
                // TODO: Add check to ensure king does not move into check
                if (!boardState[targetIndex] || (boardState[targetIndex] && PIECES[boardState[targetIndex]].color !== color)) {
                    moves.push(targetIndex);
                }
            }
        });
        // TODO: Implement Castling
    }

    function getBishopMoves(pieceIndex, color, currentRank, currentFile, moves) {
        const directions = [
            { r: -1, f: -1 }, // Up-Left
            { r: -1, f: 1 },  // Up-Right
            { r: 1, f: -1 },  // Down-Left
            { r: 1, f: 1 }   // Down-Right
        ];

        directions.forEach(dir => {
            for (let i = 1; i < 8; i++) {
                const targetRank = currentRank + dir.r * i;
                const targetFile = currentFile + dir.f * i;

                if (targetRank >= 0 && targetRank < 8 && targetFile >= 0 && targetFile < 8) {
                    const targetIndex = targetRank * 8 + targetFile;
                    if (boardState[targetIndex] === null) { // Empty square
                        moves.push(targetIndex);
                    } else {
                        if (PIECES[boardState[targetIndex]].color !== color) { // Opponent's piece
                            moves.push(targetIndex); // Can capture
                        }
                        break; // Path blocked by own or opponent's piece
                    }
                } else {
                    break; // Off board
                }
            }
        });
    }

    function getQueenMoves(pieceIndex, color, currentRank, currentFile, moves) {
        // Queen moves like a rook and a bishop
        getRookMoves(pieceIndex, color, currentRank, currentFile, moves);
        getBishopMoves(pieceIndex, color, currentRank, currentFile, moves);
    }

    function getKingMoves(pieceIndex, color, currentRank, currentFile, moves) {
        const kingMoveOffsets = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        kingMoveOffsets.forEach(([rankOffset, fileOffset]) => {
            const targetRank = currentRank + rankOffset;
            const targetFile = currentFile + fileOffset;

            if (targetRank >= 0 && targetRank < 8 && targetFile >= 0 && targetFile < 8) {
                const targetIndex = targetRank * 8 + targetFile;
                // TODO: Add check to ensure king does not move into check
                if (!boardState[targetIndex] || (boardState[targetIndex] && PIECES[boardState[targetIndex]].color !== color)) {
                    moves.push(targetIndex);
                }
            }
        });
        // TODO: Implement Castling
    }

    function getKnightMoves(pieceIndex, color, currentRank, currentFile, moves) {
        const knightMoveOffsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        knightMoveOffsets.forEach(([rankOffset, fileOffset]) => {
            const targetRank = currentRank + rankOffset;
            const targetFile = currentFile + fileOffset;

            if (targetRank >= 0 && targetRank < 8 && targetFile >= 0 && targetFile < 8) {
                const targetIndex = targetRank * 8 + targetFile;
                if (!boardState[targetIndex] || (boardState[targetIndex] && PIECES[boardState[targetIndex]].color !== color)) {
                    moves.push(targetIndex);
                }
            }
        });
    }

    function getQueenMoves(pieceIndex, color, currentRank, currentFile, moves) {
        // Queen moves like a rook and a bishop
        getRookMoves(pieceIndex, color, currentRank, currentFile, moves);
        getBishopMoves(pieceIndex, color, currentRank, currentFile, moves);
    }

    function getKingMoves(pieceIndex, color, currentRank, currentFile, moves) {
        const kingMoveOffsets = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        kingMoveOffsets.forEach(([rankOffset, fileOffset]) => {
            const targetRank = currentRank + rankOffset;
            const targetFile = currentFile + fileOffset;

            if (targetRank >= 0 && targetRank < 8 && targetFile >= 0 && targetFile < 8) {
                const targetIndex = targetRank * 8 + targetFile;
                // TODO: Add check to ensure king does not move into check
                if (!boardState[targetIndex] || (boardState[targetIndex] && PIECES[boardState[targetIndex]].color !== color)) {
                    moves.push(targetIndex);
                }
            }
        });
        // TODO: Implement Castling
    }

    function getBishopMoves(pieceIndex, color, currentRank, currentFile, moves) {
        const directions = [
            { r: -1, f: -1 }, // Up-Left
            { r: -1, f: 1 },  // Up-Right
            { r: 1, f: -1 },  // Down-Left
            { r: 1, f: 1 }   // Down-Right
        ];

        directions.forEach(dir => {
            for (let i = 1; i < 8; i++) {
                const targetRank = currentRank + dir.r * i;
                const targetFile = currentFile + dir.f * i;

                if (targetRank >= 0 && targetRank < 8 && targetFile >= 0 && targetFile < 8) {
                    const targetIndex = targetRank * 8 + targetFile;
                    if (boardState[targetIndex] === null) { // Empty square
                        moves.push(targetIndex);
                    } else {
                        if (PIECES[boardState[targetIndex]].color !== color) { // Opponent's piece
                            moves.push(targetIndex); // Can capture
                        }
                        break; // Path blocked by own or opponent's piece
                    }
                } else {
                    break; // Off board
                }
            }
        });
    }

    function getQueenMoves(pieceIndex, color, currentRank, currentFile, moves) {
        // Queen moves like a rook and a bishop
        getRookMoves(pieceIndex, color, currentRank, currentFile, moves);
        getBishopMoves(pieceIndex, color, currentRank, currentFile, moves);
    }

    function getKingMoves(pieceIndex, color, currentRank, currentFile, moves) {
        const kingMoveOffsets = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        kingMoveOffsets.forEach(([rankOffset, fileOffset]) => {
            const targetRank = currentRank + rankOffset;
            const targetFile = currentFile + fileOffset;

            if (targetRank >= 0 && targetRank < 8 && targetFile >= 0 && targetFile < 8) {
                const targetIndex = targetRank * 8 + targetFile;
                // TODO: Add check to ensure king does not move into check
                if (!boardState[targetIndex] || (boardState[targetIndex] && PIECES[boardState[targetIndex]].color !== color)) {
                    moves.push(targetIndex);
                }
            }
        });
        // TODO: Implement Castling
    }

    function disableControls() {
        // Could disable board clicks too if needed
        undoButton.disabled = true;
        resignButton.disabled = true;
        offerDrawButton.disabled = true;
        // gameModeSelect.disabled = true; // Keep mode selectable for new game
    }

    function enableControls() {
        undoButton.disabled = moveHistory.length === 0 || gameOver;
        resignButton.disabled = gameOver;
        offerDrawButton.disabled = gameOver || (drawOfferedBy === currentPlayer); // Disable if player already offered
        // gameModeSelect.disabled = gameOver; // Allow changing mode to start new game
    }

    function handleUndoMove() {
        if (gameOver) return;
        if (moveHistory.length > 0) {
            const lastMove = moveHistory.pop();
            boardState = lastMove.boardStateBeforeMove; // Restore previous board state
            currentPlayer = lastMove.player; // Revert to the player who made the undone move
            
            selectedSquareIndex = -1;
            validMoves = [];
            drawOfferedBy = null; // Cancel any pending draw offer
            drawOfferStatus.textContent = '';

            renderBoard();
            updateGameInfo();
            updateMoveHistoryDisplay();
            statusMessage.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} to move. Last move undone.`;
            enableControls();

            // If AI was the one whose move was undone, and it's now AI's turn again in PVA mode
            if (gameMode === 'pva' && currentPlayer === 'black' && moveHistory.length > 0) {
                // Potentially make AI re-evaluate, or just wait for player
                // For simplicity, we'll just let it be player's turn if white, or AI's turn if black
                // If we undo AI's move, it becomes player's turn. If we undo player's move, it becomes AI's turn.
                // The current logic correctly sets currentPlayer, so AI will move if it's its turn.
            } 
            // If it's AI's turn now after undoing player's move in PVA
            else if (gameMode === 'pva' && currentPlayer === 'black') {
                 setTimeout(makeAIMove, 500); // AI takes its turn
            }
        }
    }

    resetButton.addEventListener('click', initializeBoard);
    function handleResign() {
        if (gameOver) return;
        gameOver = true;
        statusMessage.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} resigned. ${currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
        disableControlsOnGameOver();
    }

    function handleOfferDraw() {
        if (gameOver) return;
        if (drawOfferedBy && drawOfferedBy !== currentPlayer) {
            // Opponent offered a draw, current player accepts
            gameOver = true;
            statusMessage.textContent = `Draw accepted. The game is a draw.`;
            drawOfferStatus.textContent = 'Draw agreed!';
            disableControlsOnGameOver();
            drawOfferedBy = null; // Reset draw offer
        } else if (!drawOfferedBy) {
            drawOfferedBy = currentPlayer;
            drawOfferStatus.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} offered a draw. Opponent can accept.`;
            statusMessage.textContent = `Draw offered. Opponent's turn to respond or move.`;
            // Note: The game continues, opponent can make a move (which declines the draw) or accept.
        } else if (drawOfferedBy === currentPlayer) {
            // Player already offered a draw, can't offer again until opponent moves or responds
            statusMessage.textContent = `You already offered a draw. Waiting for opponent.`;
        }
        enableControls(); // Update button states if needed (e.g. disable offer draw if one is pending)
    }

    function disableControlsOnGameOver() {
        undoButton.disabled = true;
        resignButton.disabled = true;
        offerDrawButton.disabled = true;
        // gameModeSelect.disabled = false; // Keep enabled to start a new game
    }

    undoButton.addEventListener('click', handleUndoMove);
    resignButton.addEventListener('click', handleResign);
    offerDrawButton.addEventListener('click', handleOfferDraw);

    gameModeSelect.addEventListener('change', () => {
        gameMode = gameModeSelect.value;
        initializeBoard(); // Reset game when mode changes
    });

    // Initial setup
    initializeBoard();

    // --- AI Logic (Basic) ---
    function makeAIMove() {
    if (gameOver || currentPlayer !== 'black') return; // AI is always black for now

    const aiPieces = [];
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] && PIECES[boardState[i]].color === 'black') {
            aiPieces.push(i);
        }
    }

    let bestMove = null;
    let maxCaptureValue = -1; // Prioritize captures
    let possibleMoves = [];

    for (const pieceIndex of aiPieces) {
        const moves = getValidMovesForPiece(pieceIndex);
        for (const targetIndex of moves) {
            const move = { from: pieceIndex, to: targetIndex, piece: boardState[pieceIndex] };
            possibleMoves.push(move);
            const capturedPieceSymbol = boardState[targetIndex];
            if (capturedPieceSymbol) {
                // Simple value: Pawn=1, N/B=3, R=5, Q=9. King capture = game over (handled elsewhere)
                let value = 0;
                const type = PIECES[capturedPieceSymbol].type;
                if (type === 'Pawn') value = 1;
                else if (type === 'Knight' || type === 'Bishop') value = 3;
                else if (type === 'Rook') value = 5;
                else if (type === 'Queen') value = 9;
                
                if (value > maxCaptureValue) {
                    maxCaptureValue = value;
                    bestMove = move;
                }
            }
        }
    }

    if (!bestMove && possibleMoves.length > 0) { // If no capture, pick a random move
        bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    if (bestMove) {
        movePiece(bestMove.from, bestMove.to);
        switchPlayer();
        statusMessage.textContent = `AI moved ${PIECES[bestMove.piece].type} from ${squareToAlgebraic(bestMove.from)} to ${squareToAlgebraic(bestMove.to)}. White to move.`;
        // TODO: Check for check/checkmate by AI
    } else {
        // This case means AI has no valid moves (stalemate or checkmate for AI)
        // This should be handled by a proper game over check
        statusMessage.textContent = "AI has no valid moves. Game might be over.";
        gameOver = true; // Simplistic game over
    }

    renderBoard();
    updateGameInfo();
    enableControls(); // Re-enable player controls
    }
});