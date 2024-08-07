import React, { useEffect, useRef, useState } from "react";
import styles from "./game_page.module.css";
import { SLRdetect } from "../../utilities/detect.js";
import { letterImages, loadPromises } from "../../assets/const/asl_image.js";

const GamePage = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = 500;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    const colors = {
      gray: "#646464",
      green: "#4CD038",
      red: "#C80000",
      white: "#FFFFFF",
      yellow: "#FFE800",
    };

    const roadWidth = 200;
    const markerWidth = 10;
    const markerHeight = 50;

    const leftLane = 200;
    const rightLane = 300;
    const lanes = [leftLane, rightLane];

    const playerX = leftLane; // Start in the left lane
    const playerY = 400;
    const fps = 60;
    let gameover = true;
    let speed = 0.9;
    let score = 0;
    let lastTime = Date.now();

    const carImage = new Image();
    carImage.src = require("../../assets/imgs/game_imgs/car.png");

    const crashImage = new Image();
    crashImage.src = require("../../assets/imgs/game_imgs/crash.png");

    const vehicleImages = [
      require("../../assets/imgs/game_imgs/pickup_truck.png"),
      require("../../assets/imgs/game_imgs/semi_trailer.png"),
      require("../../assets/imgs/game_imgs/taxi.png"),
      require("../../assets/imgs/game_imgs/van.png"),
    ].map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const player = { x: playerX, y: playerY, width: 45, height: 90 };

    let vehicles = [];
    let laneMarkerMoveY = 0;
    let crashRect = { x: 0, y: 0, width: 0, height: 0 };

    const words = ["cat", "eat", "vet", "bat", "rat", "cow", "owl", "bee"];
    let currentWord = words[Math.floor(Math.random() * words.length)];
    let typedWord = "";

    function drawRoad() {
      ctx.fillStyle = "#17a1be";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = colors.gray;
      ctx.fillRect(150, 0, roadWidth, height);

      ctx.fillStyle = colors.white;
      ctx.fillRect(145, 0, markerWidth, height);
      ctx.fillRect(345, 0, markerWidth, height);
    }

    function drawLaneMarkers() {
      laneMarkerMoveY += speed * 2;
      if (laneMarkerMoveY >= markerHeight * 2) {
        laneMarkerMoveY = 0;
      }
      ctx.fillStyle = colors.yellow;
      for (let y = markerHeight * -2; y < height; y += markerHeight * 2) {
        ctx.fillRect(
          width / 2 - markerWidth / 2,
          y + laneMarkerMoveY,
          markerWidth,
          markerHeight
        );
      }
    }

    function drawPlayer() {
      ctx.drawImage(
        carImage,
        player.x - player.width / 2,
        player.y - player.height / 2,
        player.width,
        player.height
      );
    }

    function drawVehicles() {
      vehicles.forEach((vehicle) => {
        ctx.drawImage(
          vehicle.image,
          vehicle.x - vehicle.width / 2,
          vehicle.y - vehicle.height / 2,
          vehicle.width,
          vehicle.height
        );
      });
    }

    function drawScore() {
      ctx.font = "16px Arial";
      ctx.fillStyle = "#000000";
      ctx.fillText(`Score: ${Math.round(score * 100) / 100}`, 50, 50);
      ctx.fillText(`Speed: ${Math.round(speed * 100) / 100}`, 50, 70);
    }

    function drawWord() {
      ctx.font = "20px Arial";
      ctx.fillStyle = "#000000";
      ctx.fillText(`You need to type: ${currentWord}`, width / 2 - 80, 50);
    }

    function drawTypedWord() {
      ctx.font = "20px Arial";
      ctx.fillStyle = "#000000";
      ctx.fillText(`Your typing: ${typedWord}`, 20, 100);

      let xPos = 20;
      let nextCharacter = currentWord[typedWord.length];
      const image = letterImages[nextCharacter];
      ctx.drawImage(image, xPos, 120, 50, 50);
    }

    function drawGameOver() {
      ctx.drawImage(
        crashImage,
        crashRect.x - crashRect.width / 2,
        crashRect.y - crashRect.height / 2
      );
      ctx.fillStyle = colors.red;
      ctx.fillRect(0, 50, width, 100);
      ctx.fillStyle = "#fff";
      ctx.fillText(
        "You lose! Use the YES hand sign to start!",
        width / 2 - 200,
        110
      );
      const image = letterImages["yes"];
      ctx.drawImage(image, 180, 180, 80, 80);
    }

    function drawStartScreen() {
      ctx.fillStyle = colors.gray;
      ctx.fillRect(0, 0, width, height);
      ctx.font = "30px Arial";
      ctx.fillStyle = "#000000";
      ctx.clearRect(0, 0, width, height);
      drawRoad(ctx);
      drawLaneMarkers(ctx);
      drawPlayer(ctx);
      drawVehicles(ctx);
    }

    function gameBegin() {
      ctx.fillStyle = "#fff";
      ctx.fillRect(width / 2 - 250, 37, 500, 100);
      ctx.fillStyle = "#000";
      ctx.fillText("Use the YES hand sign to start!", width / 2 - 200, 100);
      ctx.fillStyle = "#fff";
      const image = letterImages["yes"];
      ctx.drawImage(image, 220, 180, 80, 80);
    }

    function updateVehicles() {
      if (vehicles.length < 2) {
        let addVehicle = true;
        for (let vehicle of vehicles) {
          if (vehicle.y < vehicle.height * 1.5) {
            addVehicle = false;
          }
        }
        if (addVehicle) {
          const lane = lanes[Math.floor(Math.random() * lanes.length)];
          const image =
            vehicleImages[Math.floor(Math.random() * vehicleImages.length)];
          vehicles.push({
            image,
            x: lane,
            y: -image.height / 2,
            width: 45,
            height: 90,
          });
        }
      }
      vehicles = vehicles
        .map((vehicle) => {
          vehicle.y += speed;
          return vehicle;
        })
        .filter((vehicle) => {
          if (vehicle.y >= height) {
            score++;
            if (score % 5 === 0) speed++;
            return false;
          }
          return true;
        });
    }
    function gameLoop() {
      ctx.clearRect(0, 0, width, height);
      drawRoad();
      drawLaneMarkers();
      drawPlayer();
      drawVehicles();
      drawScore();
      drawWord();
      drawTypedWord();

      if (checkCollisions()) {
        drawGameOver();
      } else {
        updateVehicles();
        requestAnimationFrame(gameLoop);
      }
    }

    function startGame() {
      gameover = false;
      score = 0;
      vehicles = [];
      player.x = leftLane;
      player.y = playerY;
      currentWord = words[Math.floor(Math.random() * words.length)];
      typedWord = "";
      requestAnimationFrame(gameLoop);
    }

    function gameAction(action) {
      if (gameover) {
        if (action === "y" || action === "Y") {
          startGame();
        } else if (action === "n" || action === "N") {
          gameover = false;
        }
      } else {
        if (action.length === 1 && /[a-zA-Z]/.test(action)) {
          typedWord += action.toLowerCase();
          if (typedWord === currentWord) {
            player.x = player.x === leftLane ? rightLane : leftLane;
            currentWord = words[Math.floor(Math.random() * words.length)];
            typedWord = "";
            if (speed < 2) speed += 0.01;
            score += 100 * speed;
          } else if (!currentWord.startsWith(typedWord)) {
            typedWord = typedWord.slice(0, -1);
          }
        }
      }
    }

    function checkCollisions() {
      for (let vehicle of vehicles) {
        if (
          Math.abs(vehicle.x - player.x) < player.width &&
          Math.abs(vehicle.y - player.y) < player.height
        ) {
          gameover = true;
          crashRect = {
            x: player.x,
            y: (player.y + vehicle.y) / 2,
            width: crashImage.width,
            height: crashImage.height,
          };
          return true;
        }
      }
      return false;
    }

    document.addEventListener("keydown", (event) => {
      gameAction(event.key);
    });

    ////
    const loadPromises = Object.values(vehicleImages).map((img) => {
      return new Promise((resolve) => {
        img.onload = resolve;
      });
    });

    Promise.all(loadPromises).then(() => {
      // Draw the start screen once all images are loaded
      drawStartScreen(ctx);
    });

    document.addEventListener("keydown", (event) => {
      gameAction(event.key);
    });

    //
    let detect = new SLRdetect();
    function callback(data) {
      if (data == "Y" || data == "Yes") gameAction("y");
      if (data == "n" || data == "No") gameAction("n");
      gameAction(data.toLowerCase());
    }
    detect.init(callback);

    const startBtn = document.getElementById("startBtn");
    const liveView = document.getElementById("liveView");

    startBtn.addEventListener("click", () => {
      console.log("click");
      liveView.style.display = "block";
      startBtn.style.display = "none";

      gameBegin(ctx);
    });
    //
  }, []);
  return (
    <div className={styles.mainContainer}>
      <>
        <p className={styles.instructionsTxt}>
          <b>HOW TO PLAY: </b>Press start, then use hand gestures in front of
          the camera to control the car!
        </p>
      </>
      <>
        <div className={styles.container}>
          <canvas ref={canvasRef} className={styles.gameCanvas} />
          <div id="liveView" className={styles.liveView}>
            {/* <div> */}
            <video id="webcam" className={styles.webcam} autoPlay playsInline />
            {/* <canvas
              id="output_canvas"
              className={styles.output_canvas}
              width="1280"
              height="720"
            /> */}
            {/* </div> */}
          </div>
        </div>
      </>

      <button id="startBtn" className={styles.startBtn}>
        Start
      </button>

      <>
        <div id="gesture_output" className={styles.gesture_output} />
      </>
    </div>
  );
};

export default GamePage;
