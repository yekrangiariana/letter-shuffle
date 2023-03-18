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
let score = 0
const submittedWords = []
let timeoutID = null

const cacheBuster = new Date().getTime()
fetch(`words.txt?_=${cacheBuster}`)
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }
    return response.text()
  })
  .then(data => {
    const filteredWords = data.split("\n").filter(word => {
      // Remove words that have only one letter
      if (word.length <= 1) return false

      // Remove words with three repeated letters
      const charCount = Array.from(new Set(word)).length
      return !(word.length === 3 && charCount === 1)
    })
    words.push(...filteredWords)
  })
  .catch(error => {
    console.error("There was a problem with the fetch operation:", error)
    alert("An error occurred while loading the word list. Please try again.")
  })

document.getElementById("start-again").addEventListener("click", startGame)

function startGame() {
  // Display the game container
  const gameContainer = document.getElementById("game-container")
  gameContainer.style.display = "block"

  // Hide the home menu
  const homeMenu = document.getElementById("home-menu")
  homeMenu.style.display = "none"

  // Generate the initial set of random letters
  displayRandomLetters()

  // Focus the input element
  const wordInput = document.getElementById("word-input")
  wordInput.focus()
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

function shuffle(array) {
  const newArray = array.slice()
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

function updateScore(points, bonusMessage, correctGuessMessage) {
  score += points
  const scoreDisplay = document.getElementById("score-display")
  scoreDisplay.textContent = `${score}`

  const messageDisplay = document.getElementById("message-display")
  messageDisplay.innerHTML = "" // Clear the previous content
  messageDisplay.style.textAlign = "center" // Center the messages

  if (bonusMessage) {
    const bonusMessageElement = document.createElement("div")
    bonusMessageElement.textContent = bonusMessage
    bonusMessageElement.classList.add("message-button")
    messageDisplay.appendChild(bonusMessageElement)
  }

  const correctGuessMessageElement = document.createElement("div")
  correctGuessMessageElement.textContent = correctGuessMessage
  correctGuessMessageElement.classList.add("message-button")
  messageDisplay.appendChild(correctGuessMessageElement)

  if (timeoutID !== null) {
    clearTimeout(timeoutID)
  }
  timeoutID = setTimeout(() => {
    messageDisplay.textContent = ""
  }, 3000)
}

function displayMessage(message, color) {
  const messageDisplay = document.getElementById("message-display")
  messageDisplay.innerHTML = "" // Clear the previous content
  messageDisplay.style.color = color

  const messageElement = document.createElement("div")
  messageElement.textContent = message
  messageElement.classList.add("message-button")
  messageDisplay.appendChild(messageElement)

  if (timeoutID !== null) {
    clearTimeout(timeoutID)
  }
  timeoutID = setTimeout(() => {
    messageDisplay.textContent = ""
  }, 3000)
}

function displayRandomLetters() {
  const container = document.getElementById("random-letters-container")
  const randomLetters = generateRandomLetters()
  const shuffledLetters = shuffle(randomLetters)
  container.innerHTML = ""
  shuffledLetters.forEach(letter => {
    const miniBox = document.createElement("div")
    miniBox.classList.add("mini-box")
    miniBox.textContent = letter.toUpperCase()
    container.appendChild(miniBox)

    // Re-enable the input and "Check Word" button
    const wordInput = document.getElementById("word-input")
    wordInput.disabled = false
    const checkWordButton = document.querySelector(
      "button[onclick='checkWord()']"
    )
    checkWordButton.disabled = false
    toggleWordInputAndButtons(true)
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

function updateTimerDisplay(timeRemaining) {
  const timerDisplay = document.getElementById("timer-display")
  timerDisplay.textContent = `⏰ ${timeRemaining}`
}

function toggleWordInputAndButtons(show) {
  const wordInputSection = document.querySelector(".word-input")
  const buttonsSection = document.querySelector(".buttons")
  const newGameButton = document.getElementById("start-again")

  if (show) {
    wordInputSection.style.display = "block"
    buttonsSection.style.display = "flex"
    newGameButton.style.backgroundColor = ""
    newGameButton.style.color = "#333"
  } else {
    wordInputSection.style.display = "none"
    buttonsSection.style.display = "none"
    newGameButton.style.backgroundColor = "green"
    newGameButton.style.color = "white"
  }
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
  toggleWordInputAndButtons(false)
}

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

  const isWordInDictionary = word => {
    return words.includes(word)
  }

  const getInvalidLetters = (word, letters) => {
    const invalidLetters = []

    for (const letter of word) {
      const letterIndex = letters.indexOf(letter)

      if (letterIndex === -1) {
        invalidLetters.push(letter)
      } else {
        letters.splice(letterIndex, 1)
      }
    }

    return invalidLetters
  }

  const invalidLetters = getInvalidLetters(enteredWord, [...randomLetters])

  const wordList = document.getElementById("word-list")
  const wordListItem = document.createElement("li")
  wordListItem.textContent = enteredWord

  if (
    invalidLetters.length === 0 &&
    isWordInDictionary(enteredWord) &&
    !submittedWords.includes(enteredWord)
  ) {
    wordListItem.style.color = "green"
    submittedWords.push(enteredWord)

    // Calculate bonus points and messages based on time
    const timeRemaining = parseInt(
      document.getElementById("timer-display").textContent.split(" ")[1]
    )

    let points = enteredWord.length
    let bonusMessage = ""
    let correctGuessMessage = `✅ ${enteredWord.length} letters`

    if (timeRemaining >= 50) {
      points *= 3
      bonusMessage = "👏 x3 First 10sec bonus!"
    } else if (timeRemaining >= 40) {
      points *= 2
      bonusMessage = "👏 x2 bonus!"
    }

    updateScore(points, bonusMessage, correctGuessMessage)
  } else if (submittedWords.includes(enteredWord)) {
    // Do nothing if the word is already in the submittedWords array
    wordInput.value = ""
    return
  } else {
    wordListItem.style.color = "red"
    let errorMessage = ""

    if (!isWordInDictionary(enteredWord)) {
      errorMessage += "❌ Not a word! "
    }

    if (invalidLetters.length > 0) {
      errorMessage += `❌ ${invalidLetters
        .map(letter => letter.toUpperCase())
        .join(", ")} do not exist!`
    }

    displayMessage(errorMessage, "red")
  }

  wordList.appendChild(wordListItem)
  wordInput.value = ""
}

function displayErrorMessage(message) {
  const messageDisplay = document.getElementById("message-display")
  messageDisplay.style.color = "red"
  messageDisplay.textContent = message
  setTimeout(() => {
    messageDisplay.textContent = ""
  }, 2000)
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
    toggleWordInputAndButtons(false)
  }

  const helpMessage =
    suggestions.length > 0
      ? "Longest words from the given letters 👇"
      : "Wow! No words can be formed."
  const container = document.getElementById("suggestions-container")
  container.innerHTML = ""
  container.style.display = "block"
  container.appendChild(document.createElement("hr"))
  container.appendChild(document.createTextNode(helpMessage))
  container.appendChild(document.createElement("br"))
  container.appendChild(suggestionList)
}

document.addEventListener("keydown", function (event) {
  if (event.metaKey && event.key === "k") {
    document.getElementById("start-again").click()
  }
})

function handleEnterKey(event) {
  if (event.key === "Enter") {
    checkWord()
  }
}

document
  .getElementById("word-input")
  .addEventListener("keydown", function (event) {
    handleEnterKey(event)
    if (event.metaKey && event.key === "k") {
      event.preventDefault() // prevent the default behavior of the shortcut key
    }
  })
