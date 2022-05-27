import BLOCKS from "./blocks.js";

// DOM

const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");
// setting
const GAME_ROWS = 20; //열
const GAME_COLS = 10; //행

// variables
let score = 0;
let duration = 500; //블록떨어지는시간
let downInterval;
let tempMovingItem; //다음블록을 실행하기 전 잠깐 담아두는 용도

const movingItem = {
  type: "",
  direction: 3, //화살표 위 방향키를 눌렀을때 좌우로 돌리는 역할의 지표
  top: 0, //좌표 기준으로 어디까지올라가고 내려가야 할지
  left: 0,
  // 다음블록들의 타입과 등등을 담아둔 변수
};

// 맨처음 20개의 줄 생성
init();
// functions
function init() {
  tempMovingItem = { ...movingItem }; // { ...movingItem } 는 스프레이트 오퍼레이트로 안에있는 값만 베끼고싶을때 사용한다.

  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine();
  }
  generateNewBlock();
}

function prependNewLine() {
  // li 20개 생성
  const li = document.createElement("li");
  const ul = document.createElement("ul");
  // 작은 네모 생성
  for (let j = 0; j < GAME_COLS; j++) {
    const matrix = document.createElement("li");
    ul.prepend(matrix);
  }
  // 생성된 10개의ul을 li에 넣기
  li.prepend(ul);
  playground.prepend(li);
}

// 블럭을 랜덤으로 랜더링
function renderBlocks(moveType = "") {
  const { type, direction, top, left } = tempMovingItem;
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((moving) => {
    moving.classList.remove(type, "moving");
  });

  BLOCKS[type][direction].some((block) => {
    const x = block[0] + left; //x값  ul안에 li의 값이 됨
    const y = block[1] + top; //y값   li의 row 값
    // 삼항연산자 : 조건 ? 참일경우 : 거짓일 경우
    const target = playground.childNodes[y]
      ? playground.childNodes[y].childNodes[0].childNodes[x]
      : null;
    const isAvailable = checkEmpty(target);
    // 재귀함수를 사용할땐 callstack maxium 같은 에러가 발생할수있음
    if (isAvailable) {
      target.classList.add(type, "moving");
    } else {
      tempMovingItem = { ...movingItem };
      if (moveType === "retry") {
        clearInterval(downInterval);
        showGameoverText();
      }
      setTimeout(() => {
        renderBlocks("retry");
        if (moveType === "top") {
          seizeBlock();
        }
      }, 0);
      return true;
    }
  });
  movingItem.left = left;
  movingItem.top = top;
  movingItem.direction = direction;
}
//끝에서 더이상 내려갈 곳이 없으면 색은 놔두고 무빙이라는 클래스를 뺀후에 새로운 블럭을 만듬
function seizeBlock() {
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((moving) => {
    moving.classList.remove("moving");
    moving.classList.add("seized");
  });
  checkMatch();
}

function checkMatch() {
  const childNodes = playground.childNodes;
  childNodes.forEach((child) => {
    let matched = true;
    child.children[0].childNodes.forEach((li) => {
      if (!li.classList.contains("seized")) {
        matched = false;
      }
    });
    if (matched) {
      child.remove();
      prependNewLine();
      score++;
      scoreDisplay.innerText = score;
    }
  });
  generateNewBlock();
}

function generateNewBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, duration);

  const blockArray = Object.entries(BLOCKS);
  const randomIndex = Math.floor(Math.random() * blockArray.length);

  movingItem.type = blockArray[randomIndex][0];
  movingItem.top = 0;
  movingItem.left = 5;
  movingItem.direction = 0;
  tempMovingItem = { ...movingItem };
  renderBlocks();
}

function checkEmpty(target) {
  if (!target || target.classList.contains("seized")) {
    return false;
  }
  return true;
}
function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount;
  renderBlocks(moveType);
}
// 삼항 연산자 활용
function changeDirection() {
  const direction = tempMovingItem.direction;
  direction === 3
    ? (tempMovingItem.direction = 0)
    : (tempMovingItem.direction += 1);
  renderBlocks();
}

function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, 20);
}
function showGameoverText() {
  gameText.style.display = "flex";
}
// event handling
document.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 39:
      moveBlock("left", 1);
      break;
    case 37:
      moveBlock("left", -1);
      break;

    case 40:
      moveBlock("top", 1);
      break;

    case 38:
      changeDirection();
      break;
    case 32:
      dropBlock();
    default:
      break;
  }
});
restartButton.addEventListener("click", () => {
  playground.innerHTML = "";
  gameText.style.display = "none";
  init();
});
