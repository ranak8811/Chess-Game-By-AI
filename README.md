# Chess Game

This is a simple, interactive Chess game implemented using HTML, CSS, and JavaScript. It provides a basic platform to play chess in a web browser.

## Features

- **Interactive Board:** A visually appealing chess board with draggable pieces.
- **Piece Movement:** Basic rules for moving chess pieces (Pawn, Rook, Knight, Bishop, Queen, King).
- **Turn Management:** Alternating turns for White and Black players.
- **Game Over Conditions:** Detection for checkmate and stalemate (basic implementation).
- **Reset Game:** Option to reset the game and start a new one.
- **AI Opponent:** Play against an AI opponent.

## How to Play

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/ranak8811/Chess-Game-By-AI.git
    cd Chess-Game-By-AI
    ```
2.  **Open `index.html`:** Simply open the `index.html` file in your web browser.
3.  **Start Playing:** The game will load, and you can start moving pieces.
4.  **Move Pieces:** Click and drag a piece to its desired valid square.
5.  **Turns:** White moves first, then Black, and so on.
6.  **Reset:** If you want to start a new game, refresh the page.

## How AI Playing Works

The AI in this chess game operates based on a simplified decision-making process. It evaluates possible moves and selects one based on a set of predefined rules and heuristics. The AI's logic is implemented in `script.js` and primarily focuses on:

- **Basic Move Generation:** The AI can identify all legal moves for its pieces.
- **Simple Evaluation Function:** Each potential move is assigned a score based on factors like:
  - **Material Advantage:** Prioritizing capturing opponent's pieces and protecting its own.
  - **Positional Control:** Favoring moves that control central squares or attack key positions.
  - **Threat Assessment:** Avoiding immediate threats to its own king or valuable pieces.
- **Minimax (Simplified):** A rudimentary form of minimax algorithm might be used to look a few moves ahead, though not a full-depth search due to computational complexity for a browser-based game. This helps the AI anticipate immediate responses from the player.

The AI's strength is limited by the depth of its search and the complexity of its evaluation function. It's designed to be a challenging but not unbeatable opponent for casual play.

## Live Page

[Live Page URL will be added here later]

## Technologies Used

- **HTML5:** For the structure of the game.
- **CSS3:** For styling the chess board and pieces.
- **JavaScript:** For game logic, piece movement, and interaction, including the AI implementation.

## License

This project is open source and available under the MIT License.
