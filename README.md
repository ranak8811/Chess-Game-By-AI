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

## Advanced Game Logic and AI

The AI opponent in this chess game is designed to provide a challenging yet accessible experience. Its decision-making process is built upon a combination of fundamental chess principles and computational strategies, primarily implemented within `script.js`.

### AI Mechanics:

- **Move Generation:** The AI efficiently identifies all legal moves for its pieces, adhering to standard chess rules.
- **Heuristic-Based Evaluation:** Each potential move is assessed using a comprehensive evaluation function. This function assigns a score based on various strategic factors, including:
  - **Material Advantage:** Prioritizing the capture of opponent's pieces and the protection of its own valuable assets.
  - **Positional Control:** Favoring moves that establish control over key squares, especially central ones, and those that exert influence over the board.
  - **Threat Assessment:** Proactively identifying and mitigating immediate threats to its king and other critical pieces.
- **Simplified Minimax Algorithm:** To anticipate immediate player responses, the AI incorporates a simplified version of the Minimax algorithm. While not a full-depth search (due to the computational constraints of a browser-based environment), this allows the AI to look a few moves ahead, enhancing its strategic foresight.

**Note on Advanced Logic:** The current AI implementation provides a solid foundation for engaging gameplay. However, the development of more advanced game logic, including deeper search capabilities, refined evaluation functions, and complex tactical considerations, is an ongoing effort and represents a key area for future contributions. This project is intended to be open-source, encouraging community involvement in enhancing these advanced features.

## Live Demo

Experience the game live in your browser: [Live Demo Link] (https://ranak8811.github.io/Chess-Game-By-AI/)

## Contributing and Future Enhancements

This project is open-source and welcomes contributions from the community! The advanced game logic, including deeper AI capabilities and more complex tactical considerations, is currently under development. We invite developers to fork this repository, explore the existing codebase, and contribute to enhancing these features. Your insights and code can help make this chess game even more sophisticated and challenging.

## Support the Project

If you find this Chess Game enjoyable or useful, please consider giving it a star on GitHub! Your support helps motivate further development and improvements.

## About the Development

This Chess Game was developed with a unique approach, leveraging the power of Artificial Intelligence and what we like to call "vibe coding." The core structure and initial logic were generated through iterative prompting of AI models, allowing for rapid prototyping and exploration of different implementations. This method emphasizes intuitive development and creative problem-solving, resulting in a game built with a blend of AI assistance and human refinement.

## Technologies Used

- **HTML5:** For the structure of the game.
- **CSS3:** For styling the chess board and pieces.
- **JavaScript:** For game logic, piece movement, and interaction, including the AI implementation.

## License

This project is open source and available under the MIT License.
