const CONSONANTS = [
  "b",
  "c",
  "d",
  "f",
  "g",
  "h",
  "j",
  "k",
  "l",
  "m",
  "n",
  "p",
  "q",
  "r",
  "s",
  "t",
  "v",
  "w",
  "x",
  "y",
  "z"
]
const VOWELS = ["a", "e", "i", "o", "u"]

const words = []
let timer = null

const xhr = new XMLHttpRequest()
xhr.open("GET", "words.txt", true)
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4 && xhr.status === 200) {
    words.push(...xhr.responseText.split("\n"))
  }
}
xhr.send()

function handleEnterKey(event) {
  if (event.key === "Enter") {
    checkWord()
  }
}

let score = 0

function updateScore(points, bonusMessage) {
  score += points
  const scoreDisplay = document.getElementById("score-display")
  scoreDisplay.textContent = `Score: ${score}`

  // Display the bonus message
  const bonusMessageDisplay = document.getElementById("bonus-message-display")
  bonusMessageDisplay.textContent = bonusMessage
  setTimeout(() => {
    bonusMessageDisplay.textContent = ""
  }, 3000)
}

function startGame() {
  // Display the game container
  const gameContainer = document.getElementById("game-container")
  gameContainer.style.display = "block"

  // Hide the home menu
  const homeMenu = document.getElementById("home-menu")
  homeMenu.style.display = "none"

  // Generate the initial set of random letters
  displayRandomLetters()
}

function generateRandomLetters() {
  let letters = []
  for (let i = 0; i < 4; i++) {
    const randomVowel = VOWELS[Math.floor(Math.random() * VOWELS.length)]
    letters.push(randomVowel)
  }
  for (let i = 0; i < 6; i++) {
    const randomConsonant =
      CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)]
    letters.push(randomConsonant)
  }
  return letters
}

function displayRandomLetters() {
  const container = document.getElementById("random-letters-container")
  const randomLetters = generateRandomLetters()
  container.innerHTML = ""
  randomLetters.forEach(letter => {
    const miniBox = document.createElement("div")
    miniBox.classList.add("mini-box")
    miniBox.textContent = letter
    container.appendChild(miniBox)

    // Re-enable the input and "Check Word" button
    const wordInput = document.getElementById("word-input")
    wordInput.disabled = false
    const checkWordButton = document.querySelector(
      "button[onclick='checkWord()']"
    )
    checkWordButton.disabled = false
  })

  // Clear the suggestions container
  const suggestionsContainer = document.getElementById("suggestions-container")
  suggestionsContainer.innerHTML = ""
  suggestionsContainer.style.display = "none"

  // Clear the previous list items (words)
  const wordList = document.getElementById("word-list")
  wordList.innerHTML = ""

  // Start the timer
  if (timer) {
    clearTimeout(timer)
  }
  let timeRemaining = 60
  updateTimerDisplay(timeRemaining)
  timer = setInterval(() => {
    timeRemaining -= 1
    if (timeRemaining >= 0) {
      updateTimerDisplay(timeRemaining)
    } else {
      clearInterval(timer)
      timer = null
      revealAnswers()
    }
  }, 1000)
}

function revealAnswers() {
  clearInterval(timer)
  timer = null
  const timerDisplay = document.getElementById("timer-display")
  timerDisplay.textContent = ""
  suggestWords()
  const wordInput = document.getElementById("word-input")
  wordInput.disabled = true
  const checkWordButton = document.querySelector(
    "button[onclick='checkWord()']"
  )
  checkWordButton.disabled = true
}

function updateTimerDisplay(timeRemaining) {
  const timerDisplay = document.getElementById("timer-display")
  timerDisplay.textContent = `Time remaining: ${timeRemaining} seconds`
}

const submittedWords = []

function checkWord() {
  if (words.length === 0) {
    alert("Please wait for the word list to load before checking a word.")
    return
  }
  const wordInput = document.getElementById("word-input")
  const enteredWord = wordInput.value.toLowerCase()
  const randomLetters = document
    .getElementById("random-letters-container")
    .innerText.replace(/\s+/g, "")
    .toLowerCase()
    .split("")

  if (enteredWord === "") {
    alert("Please enter a word before checking.")
    return
  }

  let isValidWord = true
  for (let i = 0; i < enteredWord.length; i++) {
    const letterIndex = randomLetters.indexOf(enteredWord[i])
    if (letterIndex === -1) {
      isValidWord = false
      break
    } else {
      randomLetters.splice(letterIndex, 1)
    }
  }

  const wordList = document.getElementById("word-list")
  const wordListItem = document.createElement("li")
  wordListItem.textContent = enteredWord

  if (
    isValidWord &&
    words.includes(enteredWord) &&
    !submittedWords.includes(enteredWord)
  ) {
    wordListItem.style.color = "green"
    submittedWords.push(enteredWord)

    // Calculate bonus points and messages based on time
    const timeRemaining = parseInt(
      document.getElementById("timer-display").textContent.split(" ")[2]
    )
    let points = enteredWord.length
    let bonusMessage = ""

    if (timeRemaining >= 50) {
      points *= 3
      bonusMessage = "👏🏼 x3 First 10sec bonus!👏🏼"
    } else if (timeRemaining >= 40) {
      points *= 2
      bonusMessage = "👏🏼x2 bonus!👏🏼"
    }

    updateScore(points, bonusMessage)
  } else if (submittedWords.includes(enteredWord)) {
    // Do nothing if the word is already in the submittedWords array
    wordInput.value = ""
    return
  } else {
    wordListItem.style.color = "red"
  }

  wordList.appendChild(wordListItem)
  wordInput.value = ""
}

function suggestWords() {
  if (timer) {
    clearInterval(timer)
    timer = null
    const timerDisplay = document.getElementById("timer-display")
    timerDisplay.textContent = ""
  }
  const randomLetters = Array.from(document.querySelectorAll(".mini-box"))
    .map(box => box.textContent)
    .join("")
    .toLowerCase()

  const suggestions = words
    .filter(word => {
      const letters = randomLetters.split("")
      for (let i = 0; i < word.length; i++) {
        const letterIndex = letters.indexOf(word[i])
        if (letterIndex === -1) {
          return false
        } else {
          letters.splice(letterIndex, 1)
        }
      }
      return true
    })
    .sort((a, b) => b.length - a.length)
    .slice(0, 50)
    .sort((a, b) => b.length - a.length)
    .slice(0, 5)

  const suggestionList = document.createElement("ul")
  suggestionList.classList.add("suggestions-list")
  for (let i = 0; i < suggestions.length; i++) {
    const suggestion = document.createElement("li")
    suggestion.classList.add("suggestion")

    const suggestionText = document.createElement("span")
    suggestionText.classList.add("suggestion-text")
    suggestionText.textContent = suggestions[i]
    suggestion.appendChild(suggestionText)

    // Add the word length display
    const wordLengthDisplay = document.createElement("span")
    wordLengthDisplay.classList.add("word-length-display")
    wordLengthDisplay.textContent = ` (${suggestions[i].length} Points)`
    suggestion.appendChild(wordLengthDisplay)

    const suggestionLetters = document.createElement("span")
    suggestionLetters.classList.add("suggestion-letters")
    suggestion.appendChild(suggestionLetters)

    for (let j = 0; j < randomLetters.length; j++) {
      const suggestionLetter = document.createElement("span")
      suggestionLetter.classList.add("suggestion-letter")
      suggestionLetter.textContent = randomLetters[j]
      if (suggestions[i].includes(randomLetters[j])) {
        suggestionLetter.classList.add("highlighted")
      }
      suggestionLetters.appendChild(suggestionLetter)
    }

    suggestionList.appendChild(suggestion)
  }

  const helpMessage =
    suggestions.length > 0
      ? "Here are some words that can be formed using the given letters:"
      : "Sorry, no words can be formed from these letters."
  const container = document.getElementById("suggestions-container")
  container.innerHTML = ""
  container.style.display = "block"
  container.appendChild(document.createElement("hr"))
  container.appendChild(document.createTextNode(helpMessage))
  container.appendChild(document.createElement("br"))
  container.appendChild(suggestionList)
}

document
  .getElementById("word-input")
  .addEventListener("keydown", handleEnterKey)
