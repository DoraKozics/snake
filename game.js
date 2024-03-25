const mx = 50;
const my = 50;

let canvas;
let ctx;
let startButton;
let pauseButton;

let timerId;
let appleTimer;
let gameSettings = {
    canPassWall: null,
    canPassSelf: null,
    canPlaceApple: null
};
let choice = null;
let isPaused = false;
let isGameOver = false;

let tail = [
    {x: 1, y: 1},
    {x: 2, y: 1},
    {x: 3, y: 1}
];

let direction = {
    dx: 0, dy: 1
};

let goodApples = [];
let rottenApples = [];
let deadlyApples = [];
let bestApples = [];
let land = [];

let score;
let highScore = 0;

const isSetToPlay = () => {
    return gameSettings.canPassWall != null
        && gameSettings.canPassSelf != null
        && gameSettings.canPlaceApple != null;
}

const setChoice = () => {
    if (gameSettings.canPassWall === null && choice != null) {
        gameSettings.canPassWall = choice;
        choice = null;
    }

    if (gameSettings.canPassSelf === null && choice != null) {
        gameSettings.canPassSelf = choice;
        choice = null;
    }

    if (gameSettings.canPlaceApple === null && choice != null) {
        gameSettings.canPlaceApple = choice;
        choice = null;
    }
}

const placeToStart = () => {
    tail = [
        {x: 1, y: 1},
        {x: 2, y: 1},
        {x: 3, y: 1}
    ];

    direction = {
        dx: 0, dy: 1
    };

    goodApples = [];
    rottenApples = [];
    deadlyApples = [];
    bestApples = [];
    land = [];

    score = {
        goodApples: 0,
        rottenApples: 0,
        bestApples: 0,
        land: 0
    };

    clearInterval(timerId);
    timerId = setInterval(move, 50);

    if (!gameSettings.canPlaceApple) {
        appleTimer = setInterval(placeApple, 750);
    }
}

const move = () => {
    const oldHead = tail[tail.length - 1];
    const newHead = {
        x: oldHead.x + direction.dx,
        y: oldHead.y + direction.dy
    };

    if (gameSettings.canPassWall) {
        passThroughWall(newHead);
    }

    if (!hasEatenAnApple(newHead)) {
        tail.push(newHead);
        tail.shift();
    }

    draw();

    if (hasInvalidCoord()) {
        endGame();
    }

    rankApples();
}

const passThroughWall = (newHead) => {
    if (newHead.x >= mx) {
        newHead.x = 0;
    }
    if (newHead.x < 0) {
        newHead.x = mx - 1;
    }
    if (newHead.y >= my) {
        newHead.y = 0;
    }
    if (newHead.y < 0) {
        newHead.y = my - 1;
    }
}

const placeApple = () => {
    const x = Math.floor(Math.random() * (mx));
    const y = Math.floor(Math.random() * (my));

    if (isOccupied(x, y)) {
        placeApple();
    } else {
        if (hasGivenCoord(land, x, y)) {
            bestApples.push({x: x, y: y, created: new Date()});
        } else {
            goodApples.push({x: x, y: y, created: new Date()});
        }
    }
}

const isOccupied = (paramX, paramY) => {
    return hasGivenCoord(tail, paramX, paramY)
        || hasGivenCoord(goodApples, paramX, paramY)
        || hasGivenCoord(rottenApples, paramX, paramY)
        || hasGivenCoord(deadlyApples, paramX, paramY)
        || hasGivenCoord(bestApples, paramX, paramY);

}

const hasEatenAnApple = (newHead) => {
    if (hasGivenCoord(goodApples, newHead.x, newHead.y)) {
        removeEatenApple(goodApples, newHead.x, newHead.y);
        tail.push(newHead);
        score.goodApples++;
        return true;
    } else if (hasGivenCoord(rottenApples, newHead.x, newHead.y)) {
        removeEatenApple(rottenApples, newHead.x, newHead.y);
        score.rottenApples++;
        return true;
    } else if (hasGivenCoord(bestApples, newHead.x, newHead.y)) {
        removeEatenApple(bestApples, newHead.x, newHead.y);
        tail.push(newHead);
        const finalX = newHead.x + direction.dx;
        const finalY = newHead.y + direction.dy;
        const finalHead = {
            x: finalX, y: finalY
        }
        tail.push(finalHead);
        score.bestApples++;
        return true;
    } else {
        return false;
    }
}

const hasGivenCoord = (list, paramX, paramY) => {
    for (let i = 0; i < list.length; i++) {
        if (list[i].x === paramX && list[i].y === paramY) {
            return true;
        }
    }
    return false;
}

const removeEatenApple = (list, headX, headY) => {
    for (let i = 0; i < list.length; i++) {
        if (list[i].x === headX && list[i].y === headY) {
            list.splice(i, 1);
        }
    }
}

const rankApples = () => {
    haveApplesChangeRank(goodApples, rottenApples, 5);
    haveApplesChangeRank(rottenApples, deadlyApples, 5);
    haveAppleTurnToLand(deadlyApples, land, 5);
    haveApplesChangeRank(bestApples, deadlyApples, 10);
}

const haveApplesChangeRank = (listBefore, listAfter, updateTime) => {
    const now = new Date();
    for (let i = 0; i < listBefore.length; i++) {
        const timePassed = (now - listBefore[i].created) / 1000;
        if (timePassed > updateTime) {
            const apple = listBefore[i];
            listBefore.splice(i, 1);
            apple.created = new Date();
            listAfter.push(apple);
        }
    }
}

const haveAppleTurnToLand = (deadlyApples, land, updateTime) => {
    const now = new Date();
    for (let i = 0; i < deadlyApples.length; i++) {
        const timePassed = (now - deadlyApples[i].created) / 1000;
        if (timePassed > updateTime) {
            const apple = deadlyApples[i];
            deadlyApples.splice(i, 1);

            if (!(hasGivenCoord(land, apple.x, apple.y))) {
                land.push(apple);
            }
        }
    }
}

const hasInvalidCoord = () => {
    const headX = tail[tail.length - 1].x;
    const headY = tail[tail.length - 1].y;

    if (!gameSettings.canPassWall) {
        if (!(headX >= 0 && headX <= mx) || !(headY >= 0 && headY < my)) {
            return true;
        }
    }

    if (!gameSettings.canPassSelf) {
        for (let i = 0; i < tail.length - 1; i++) {
            const bodyX = tail[i].x;
            const bodyY = tail[i].y;
            if (headX === bodyX && headY === bodyY) {
                return true;
            }
        }
    }

    if (hasGivenCoord(deadlyApples, headX, headY)) {
        removeEatenApple(deadlyApples, headX, headY);
        return true;
    }
    return false;
}

const endGame = () => {
    clearInterval(timerId);
    timerId = '';
    if (!gameSettings.canPlaceApple) {
        clearInterval(appleTimer);
    }
    isGameOver = true;
    score.land = land.length;

    checkIfAchievementsWon();
    displayEndScreen();
}

const calculateScore = () => {
    let finalScore = 0;
    finalScore += score.goodApples;
    finalScore += score.rottenApples / 2;
    finalScore += score.bestApples * 5;
    if (finalScore > highScore) {
        highScore = finalScore;
    }
    return finalScore;
}

const pauseGame = () => {
    if (timerId && !isPaused) {
        isPaused = true;
        clearInterval(timerId);
        if (!gameSettings.canPlaceApple) {
            clearInterval(appleTimer);
        }

        fadeCanvas();
        displayPauseButton();
    } else if (isPaused) {
        isPaused = false;
        timerId = setInterval(move, 50);
        if (!gameSettings.canPlaceApple) {
            appleTimer = setInterval(placeApple, 750);
        }
    }
}

const resetGameSettings = () => {
    isGameOver = false;
    gameSettings = {
        canPassWall: null,
        canPassSelf: null,
        canPlaceApple: null
    };
    choice = null;
    displaySettingScreen();
}

document.addEventListener("DOMContentLoaded", () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    startButton = document.getElementById("start-button");
    pauseButton = document.getElementById("pause-button");

    if (!score) {
        document.fonts.ready.then((fontFaceSet) => {
            const fontFaces = [...fontFaceSet];
            displaySettingScreen();
        });
    } else {
        displayStartScreen();
    }

    startButton.onclick = () => {
        if (isSetToPlay() && !timerId) {
            placeToStart();
            draw();
        }
    }
    pauseButton.onclick = () => {
       pauseGame();
    }
});

document.addEventListener("keydown", (event) => {
    console.log("Key pressed down:", event);
    if (event.code === "ArrowUp") {
        event.preventDefault();
        direction.dx = 0;
        direction.dy = -1;
    }
    if (event.code === "ArrowDown") {
        event.preventDefault();
        direction.dx = 0;
        direction.dy = 1;
    }
    if (event.code === "ArrowRight") {
        event.preventDefault();
        direction.dx = 1;
        direction.dy = 0;
    }
    if (event.code === "ArrowLeft") {
        event.preventDefault();
        direction.dx = -1;
        direction.dy = 0;
    }

    if (event.code === "KeyP" && timerId) {
        pauseGame();
    }

    if (event.code === "KeyA" && gameSettings.canPlaceApple) {
        placeApple();
    }

    if (event.code === "KeyS" && !timerId && isSetToPlay()) {
        placeToStart();
    }

    if (event.code === "Enter" && !timerId && isSetToPlay()) {
        event.preventDefault();
        displayStartScreen();
    }

    if (event.code === "KeyY") {
        choice = true;
        setChoice();
    }

    if (event.code === "KeyZ") {
        choice = true;
        setChoice();
    }

    if (event.code === "KeyN") {
        choice = false;
        setChoice();
    }

    if (event.code === "KeyR" && isGameOver) {
        resetGameSettings();
    }
});
