const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const tile = 40;

let player, enemy, maze, currentLevel = 1;
let gameRunning = false, safeMode = false;
let fCount = 0;
let lives = 3;
let playerImg = new Image();
let enemyImg = new Image();
enemyImg.src = 'https://i.pinimg.com/736x/d7/a5/c1/d7a5c1400f6ae3428e309800072af3de.jpg';
let castleImg = new Image();
castleImg.src = 'https://i.pinimg.com/736x/fd/06/70/fd0670acc022effbdf8a093736d02893.jpg';

let startTime;
let timerInterval;

const mazes = [
    [[1,1,1,1,1,1,1,1,1,1],[1,0,0,0,1,0,0,0,0,1],[1,0,1,0,1,0,1,1,0,1],[1,0,1,0,0,0,0,1,0,1],[1,0,1,1,1,1,0,1,0,1],[1,0,0,0,0,1,0,0,0,1],[1,1,1,1,0,1,1,1,0,1],[1,0,0,0,0,0,0,1,0,1],[1,0,1,1,1,1,0,0,0,1],[1,1,1,1,1,1,1,1,1,1]],
    [[1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,1,0,0,0,0,1],[1,0,1,1,1,0,1,0,1,1,0,1],[1,0,1,0,0,0,0,0,0,1,0,1],[1,0,1,0,1,1,1,1,0,1,0,1],[1,0,0,0,1,0,0,1,0,0,0,1],[1,1,1,0,1,0,0,1,1,1,0,1],[1,0,0,0,0,0,1,0,0,1,0,1],[1,0,1,1,1,0,1,0,0,0,0,1],[1,0,1,0,0,0,1,1,1,1,0,1],[1,0,0,0,1,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1]],
    [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,1,0,0,0,0,0,0,0,1,0,1],[1,0,1,0,1,0,1,1,1,1,1,0,1,0,1],[1,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],[1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],[1,1,1,0,1,1,1,1,1,1,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],[1,0,1,0,1,0,0,0,0,0,1,0,1,0,1],[1,0,0,0,1,0,1,1,1,0,0,0,1,0,1],[1,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]
];

function startGame(url) {
    playerImg.src = url;
    playerImg.onload = () => {
        document.getElementById("selection-screen").style.display = "none";
        document.getElementById("game-container").style.display = "flex";
        lives = 3;
        updateHeartsUI();
        loadLevel(1);
        gameLoop();
    };
}

function updateHeartsUI() {
    let heartStr = "";
    for(let i=0; i<3; i++) heartStr += (i < lives) ? "❤️" : "🖤";
    document.getElementById("hearts-container").innerText = heartStr;
}

function startTimer() {
    clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(() => {
        if (gameRunning) {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            document.getElementById("time-val").innerText = elapsedTime;
        }
    }, 1000);
}

function loadLevel(lvl) {
    currentLevel = lvl;
    maze = mazes[lvl - 1];
    canvas.width = maze[0].length * tile;
    canvas.height = maze.length * tile;
    player = { x: 1, y: 1 };
    let ex = (lvl === 3) ? 13 : (lvl === 2 ? 10 : 8);
    enemy = { x: ex, y: 1 };
    document.getElementById("lvl-num").innerText = lvl;
    startTimer();
    safeMode = true;
    setTimeout(() => safeMode = false, 1500);
    gameRunning = true;
}

function moveEnemy() {
    if(!gameRunning || safeMode) return;
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let mx = (Math.abs(dx) > Math.abs(dy)) ? (dx > 0 ? 1 : -1) : 0;
    let my = (mx === 0) ? (dy > 0 ? 1 : -1) : 0;
    if (maze[enemy.y + my][enemy.x + mx] === 0) {
        enemy.x += mx; enemy.y += my;
    } else if (mx !== 0 && maze[enemy.y][enemy.x + mx] === 0) {
        enemy.x += mx;
    } else if (my !== 0 && maze[enemy.y + my][enemy.x] === 0) {
        enemy.y += my;
    }
    if(enemy.x === player.x && enemy.y === player.y) handleDeath();
}

function handleDeath() {
    lives--;
    updateHeartsUI();
    gameRunning = false;
    if (lives > 0) {
        alert("The Dragon hit you! Hearts remaining: " + lives);
        loadLevel(currentLevel);
    } else {
        alert("Game over! You ran out of hearts.");
        location.reload();
    }
}

function gameLoop() {
    if (gameRunning) {
        fCount++;
        let speed = (currentLevel === 3) ? 8 : (currentLevel === 2 ? 12 : 20);
        if(fCount % speed === 0) moveEnemy();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let y=0; y<maze.length; y++) {
        for(let x=0; x<maze[0].length; x++) {
            if(maze[y][x] === 1) {
                ctx.fillStyle = "#3d2b1f";
                ctx.fillRect(x*tile, y*tile, tile, tile);
                ctx.strokeStyle = "#ffd700";
                ctx.strokeRect(x*tile, y*tile, tile, tile);
            }
        }
    }
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(castleImg, (maze[0].length-2)*tile+4, (maze.length-2)*tile+4, tile-8, tile-8);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = safeMode ? 0.5 : 1.0;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(playerImg, player.x*tile+4, player.y*tile+4, tile-8, tile-8);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(enemyImg, enemy.x*tile+4, enemy.y*tile+4, tile-8, tile-8);
    ctx.globalCompositeOperation = 'source-over';
}

document.addEventListener("keydown", (e) => {
    if(!gameRunning) return;
    let nx = player.x, ny = player.y;
    if(e.key === "ArrowUp") ny--;
    if(e.key === "ArrowDown") ny++;
    if(e.key === "ArrowLeft") nx--;
    if(e.key === "ArrowRight") nx++;
    if(maze[ny] && maze[ny][nx] === 0) {
        player.x = nx; player.y = ny;
        if(nx === maze[0].length-2 && ny === maze.length-2) {
            gameRunning = false;
            if(currentLevel < 3) {
                alert("Quest Completed! Onward to the next level.");
                loadLevel(currentLevel + 1);
            } else {
                alert("CONGRATULATIONS! You have escaped the Great Maze!");
                location.reload();
            }
        }
    }
});