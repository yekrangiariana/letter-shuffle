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

const FINNISH_CONSONANTS = [
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
  "r",
  "s",
  "t",
  "v",
  "x",
  "s"
]
const FINNISH_VOWELS = ["a", "e", "i", "o", "u", "y", "ä", "ö"]

let currentConsonants = CONSONANTS
let currentVowels = VOWELS
let currentWordsFile = "words.txt"

document.getElementById("start-again").addEventListener("click", startGame)
const wordInput = document.getElementById("word-input")

const words = []
let timer = null
let score = 0
const submittedWords = []
let timeoutID = null

const cacheBuster = new Date().getTime()
fetch(`${currentWordsFile}?_=${cacheBuster}`)
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

document.addEventListener("DOMContentLoaded", function () {
  const settingsCog = document.getElementById("settings-cog")
  const settingsModal = document.getElementById("settings-modal")
  const modalClose = document.querySelector(".modal-close")
  const languageSelection = document.getElementById("language-selection")

  loadWords("en") // Load English words by default

  settingsCog.addEventListener("click", () => {
    settingsModal.style.display = "block"
  })

  modalClose.addEventListener("click", () => {
    settingsModal.style.display = "none"
  })

  window.addEventListener("click", event => {
    if (event.target === settingsModal) {
      settingsModal.style.display = "none"
    }
  })

  // Load saved language preference
  const savedLanguage = localStorage.getItem("language")
  if (savedLanguage) {
    setLanguage(savedLanguage)
    languageSelection.value = savedLanguage
  } else {
    loadWords("en") // Load English words by default
  }

  languageSelection.addEventListener("change", event => {
    const selectedLanguage = event.target.value
    setLanguage(selectedLanguage)
    localStorage.setItem("language", selectedLanguage) // Save the language preference to the browser
    displayRandomLetters()
  })

  // Load saved dark mode preference
  const savedDarkMode = localStorage.getItem("darkMode")
  const darkModeToggle = document.getElementById("dark-mode-toggle")

  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode")
    localStorage.setItem("darkMode", darkModeToggle.checked) // Save the dark mode preference to the browser
  })

  if (savedDarkMode !== null) {
    const isDarkMode = JSON.parse(savedDarkMode) // Convert the saved string to a boolean value
    darkModeToggle.checked = isDarkMode
    if (isDarkMode) {
      document.body.classList.add("dark-mode")
    } else {
      document.body.classList.remove("dark-mode")
    }
  }
})

function loadWords(language) {
  if (language === "en") {
    currentConsonants = CONSONANTS
    currentVowels = VOWELS
    currentWordsFile = "words.txt"
  } else if (language === "fi") {
    currentConsonants = FINNISH_CONSONANTS
    currentVowels = FINNISH_VOWELS
    currentWordsFile = "wordsfin.txt"
  }

  // Fetch the words file
  const cacheBuster = new Date().getTime()
  fetch(`${currentWordsFile}?_=${cacheBuster}`)
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
      words.length = 0 // Clear the existing words array
      words.push(...filteredWords)
    })
    .catch(error => {
      console.error("There was a problem with the fetch operation:", error)
      alert("An error occurred while loading the word list. Please try again.")
    })
}

function startGame() {
  // Display the game container
  const gameContainer = document.getElementById("game-container")
  gameContainer.style.display = "block"

  // Hide the home menu
  const homeMenu = document.getElementById("home-menu")
  homeMenu.style.display = "none"

  displayRandomLetters()
  wordInput.focus()
}

function generateRandomLetters() {
  let letters = []
  for (let i = 0; i < 4; i++) {
    const randomVowel =
      currentVowels[Math.floor(Math.random() * currentVowels.length)]
    letters.push(randomVowel)
  }
  for (let i = 0; i < 6; i++) {
    const randomConsonant =
      currentConsonants[Math.floor(Math.random() * currentConsonants.length)]
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

  let timeRemaining = 60
  updateTimerDisplay(timeRemaining, revealAnswers)
}

function updateTimerDisplay(timeRemaining, onTimeOut) {
  const timerDisplay = document.getElementById("timer-display")
  timerDisplay.textContent = `⏰ ${timeRemaining}`

  if (timer) {
    clearTimeout(timer)
  }

  timer = setInterval(() => {
    timeRemaining -= 1
    if (timeRemaining >= 0) {
      timerDisplay.textContent = `⏰ ${timeRemaining}`
    } else {
      clearInterval(timer)
      timer = null
      if (onTimeOut) {
        onTimeOut()
      }
    }
  }, 1000)
}

function displayAndUpdateScore(
  points,
  correctGuessMessage,
  bonusMessage = null
) {
  if (points !== undefined) {
    score += points
    const scoreDisplay = document.getElementById("score-display")
    scoreDisplay.textContent = `${score}`
  }

  const messageDisplay = document.getElementById("message-display")
  messageDisplay.innerHTML = ""

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
    newGameButton.style.backgroundColor = "var(--color-accent)"
    newGameButton.style.color = "white"
  }
}

function revealAnswers() {
  clearInterval(timer)
  timer = null
  const timerDisplay = document.getElementById("timer-display")
  timerDisplay.textContent = ""
  suggestWords()
  wordInput.disabled = true
  const checkWordButton = document.querySelector(
    "button[onclick='checkWord()']"
  )
  checkWordButton.disabled = true
  toggleWordInputAndButtons(false)
}

function checkWord() {
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
    wordListItem.style.color = "var(--color-accent)"
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

    displayAndUpdateScore(points, correctGuessMessage, bonusMessage)
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
      errorMessage += `❌ You don't have: ${invalidLetters
        .map(letter => letter.toUpperCase())
        .join(", ")}`
    }

    displayAndUpdateScore(undefined, errorMessage)
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

function setLanguage(language) {
  if (language === "Finnish") {
    currentConsonants = FINNISH_CONSONANTS
    currentVowels = FINNISH_VOWELS
    currentWordsFile = "wordsfin.txt"
  } else {
    currentConsonants = CONSONANTS
    currentVowels = VOWELS
    currentWordsFile = "words.txt"
  }
  loadWords()
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
