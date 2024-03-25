let achievements = [
    {
        color: "pink",
        hasWon: false,
        colorCode: "magenta",
        title: "the strategist",
        description: "eat 40 pink apples"
    },
    {
        color: "red",
        hasWon: false,
        colorCode: "red",
        title: "the picky eater",
        description: "eat 0 rotten apples out of a min 60"
    },
    {
        color: "brown",
        hasWon: false,
        colorCode: "#70200e",
        title: "the real human bin bag",
        description: "have 50% be rotten apples out of a min 40"
    },
    {
        color: "green",
        hasWon: false,
        colorCode: "#32cd44",
        title: "the environmentalist",
        description: "make 70% of the map green"
    },
    {
        color: "blue",
        hasWon: false,
        colorCode: "#0000ff",
        title: "the old school champion",
        description: "eat 80 apples with 80% being red"
    }
];

let hasOpenedWindow = false;
let achievementsButton;
let achievementsWindow;

document.addEventListener("DOMContentLoaded", () => {
    achievementsButton = document.getElementById("achievements-button");
    achievementsWindow = document.getElementById("achievements-window");

    achievementsButton.onclick = displayAchievements;
})

const displayAchievements = () => {
    if (!hasOpenedWindow && (!timerId || isPaused)) {
        achievementsWindow.classList.remove("hidden");
        hasOpenedWindow = true;
        achievementsWindow.innerHTML = "achievements";

        listAchievements();

        let closeBtn = document.createElement("p");
        closeBtn.innerHTML = "close";
        achievementsWindow.appendChild(closeBtn);

        closeBtn.onclick = () => {
            achievementsWindow.setAttribute("class", "hidden");
            hasOpenedWindow = false;
        }
    }
}

const listAchievements = () => {
    for (let i = 0; i < achievements.length; i++) {
        let achievement = document.createElement("div");
        achievement.setAttribute("class", "achievement-list-item");

        if (achievements[i].hasWon) {
            achievement.style.backgroundColor = achievements[i].colorCode;
        }

        let titleText = document.createElement("div");
        titleText.setAttribute("class", "achievement-title");
        titleText.innerHTML = achievements[i].title;

        let descriptionText = document.createElement("div");
        descriptionText.setAttribute("class", "achievement-desc");
        descriptionText.innerHTML = achievements[i].description;

        achievementsWindow.appendChild(achievement);
        achievement.appendChild(titleText);
        achievement.appendChild(descriptionText);
    }
}

const checkIfAchievementsWon = () => {
    hasWonPink();
    hasWonRed();
    hasWonBrown();
    hasWonGreen();
    hasWonBlue();
}

const hasWonPink = () => {
    if (score.bestApples >= 40) {
        achievements[0].hasWon = true;
    }
}

const hasWonRed = () => {
    const totalApples = +score.bestApples + +score.goodApples;
    if (score.rottenApples === 0 && totalApples >= 60) {
        achievements[1].hasWon = true;
    }
}

const hasWonBrown = () => {
    const rottenApples = score.rottenApples;
    const totalApples = +score.bestApples + +score.goodApples + +rottenApples;
    if ((rottenApples / totalApples) >= 0.5 && totalApples >= 40) {
        achievements[2].hasWon = true;
    }
}

const hasWonGreen = () => {
    const totalGreen = mx * my;
    console.log(score.land);
    if ((score.land / totalGreen) > 0.70) {
        achievements[3].hasWon = true;
    }
}

const hasWonBlue = () => {
    const goodApples = score.goodApples;
    const totalApples = +score.bestApples + +goodApples + +score.rottenApples;
    if (goodApples >= 80 && (goodApples / totalApples) >= 0.8) {
        achievements[4].hasWon = true;
    }
}
