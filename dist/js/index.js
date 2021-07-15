const BODY = document.querySelector('body')
const MODAL_WRAPPER = document.querySelector('#modal-wrapper')
const CLOSE_MODAL = document.querySelector('#close-modal')
const TOTAL_GUESSES = document.querySelector('#total-guesses')
const FINAL_MINUTES = document.querySelector('#final-minutes')
const FINAL_SECONDS = document.querySelector('#final-seconds')
const NAME_INPUT = document.querySelector('#name-input')
const NAME_FEEDBACK = document.querySelector('#name-feedback')
const TIMER = document.querySelector('#timer')
const TIMER_MINUTES = document.querySelector('#timer-minutes')
const TIMER_SECONDS = document.querySelector('#timer-seconds')
const GUESS_INPUT = document.querySelector('#guess-input')
const FEEDBACK = document.querySelector('#feedback')
const GUESSES = document.querySelector('#guesses')
const RESTART = document.querySelector('#restart')
const TABLE_BODY = document.querySelector('#table-body')

const FIREBASE_COLLECTION = 'scores'

let correctNumber = Math.round(Math.random() * 100)
let minutesCount = 0
let secondsCount = 0
let isPlaying = false
let isInitialGuess = true
let interval = null

const closeModal = () => {
    MODAL_WRAPPER.style.display = 'none'
    BODY.style.overflow = 'auto'
}

const runTimer = () => {
    let currentMinutes = '0'
    let currentSeconds = '0'

    secondsCount++

    if (secondsCount === 60) {
        minutesCount++
        secondsCount = 0
    }

    if (minutesCount < 10) currentMinutes += minutesCount
    else currentMinutes = minutesCount

    if (secondsCount < 10) currentSeconds += secondsCount
    else currentSeconds = secondsCount

    TIMER_MINUTES.textContent = currentMinutes
    TIMER_SECONDS.textContent = currentSeconds
}

const makeGuess = e => {
    console.log(correctNumber);
    const VALUE = parseInt(e.target.value)
    const IS_NUMBER = !isNaN(VALUE)
    const IS_GUESS_MADE = VALUE > 10 || e.key === 'Enter'

    if (IS_GUESS_MADE && isInitialGuess && IS_NUMBER) {
        TIMER.style.display = 'block'
        e.target.value = ''
        isPlaying = true
        isInitialGuess = false
        interval = setInterval(runTimer, 1000)
    }


    if (isPlaying) {
        if (VALUE !== '') FEEDBACK.textContent = ''

        if (IS_GUESS_MADE && IS_NUMBER) {
            if (VALUE > correctNumber) {
                FEEDBACK.textContent = 'Guess Too High'
                FEEDBACK.style.color = 'red'
                GUESSES.textContent = parseInt(GUESSES.textContent) + 1
            } else if (VALUE < correctNumber) {
                FEEDBACK.textContent = 'Guess Too Low'
                FEEDBACK.style.color = 'red'
                GUESSES.textContent = parseInt(GUESSES.textContent) + 1
            } else {
                FEEDBACK.textContent = 'Correct!!'
                FEEDBACK.style.color = 'green'
                RESTART.style.display = 'inline-block'
                GUESSES.textContent = parseInt(GUESSES.textContent) + 1
                isPlaying = false
                clearInterval(interval)
                isQualified(parseInt(GUESSES.textContent))
            }

            e.target.value = ''
        }
    }
}

const restart = () => {
    if (!isPlaying) {
        NAME_INPUT.value = ''
        TIMER.style.display = 'none'
        TIMER_MINUTES.textContent = '00'
        TIMER_SECONDS.textContent = '00'
        GUESS_INPUT.value = ''
        FEEDBACK.textContent = 'Enter Guess To Start'
        FEEDBACK.style.color = 'black'
        GUESSES.textContent = 0
        RESTART.style.display = 'none'
        correctNumber = Math.round(Math.random() * 100)
        minutesCount = 0
        secondsCount = 0
        isInitialGuess = true
    }
}

const isQualified = async guesses => {
    const RESPONSE = await DB.collection(FIREBASE_COLLECTION).get()
    const RESULT = await RESPONSE.docs

    let isPlayerQualified = false

    if (RESULT.length !== 3) {
        isPlayerQualified = true
    } else {
        RESULT.forEach(doc => {
            const DOC_DATA = doc.data()

            if (guesses < DOC_DATA.guesses) isPlayerQualified = true
        })
    }

    if (isPlayerQualified) {
        scrollTo(0, 0)
        BODY.style.overflow = 'hidden'
        MODAL_WRAPPER.style.display = 'block'
        TOTAL_GUESSES.textContent = GUESSES.textContent
        FINAL_MINUTES.textContent = minutesCount
        FINAL_SECONDS.textContent = secondsCount
    }
}

const addScore = (userName, userGuesses) => {
    const TR = document.createElement('tr')

    TR.innerHTML = `
        <td class="border-right">${userName}</td>
        <td>${userGuesses}</td>
    `

    TABLE_BODY.appendChild(TR)
}

const updateScores = async () => {
    const RESPONSE = await DB.collection(FIREBASE_COLLECTION)
        .orderBy('guesses', 'asc')
        .limit(3)
        .get()
    const RESULT = await RESPONSE.docs

    TABLE_BODY.innerHTML = ''

    RESULT.forEach(score => {
        const DOC_DATA = score.data()

        addScore(DOC_DATA.name, DOC_DATA.guesses)
    })

}

const updateFirebase = async e => {
    const RESPONSE = await DB.collection(FIREBASE_COLLECTION).get()
    const RESULT = await RESPONSE.docs

    const VALUE = e.target.value
    const IS_KEY_ENTER = e.key === 'Enter'

    let isNameAvailable = true

    if (RESULT.length !== 0) {
        RESULT.forEach(doc => VALUE == doc.data().name ? isNameAvailable = false : '')
    }

    if (VALUE !== '') NAME_FEEDBACK.style.display = 'none'

    if (IS_KEY_ENTER) {
        if (isNameAvailable) {
            DB.collection(FIREBASE_COLLECTION).add({ name: VALUE, guesses: parseInt(TOTAL_GUESSES.textContent) })
            closeModal()
        } else {
            NAME_FEEDBACK.style.display = 'block'
        }
    }
}

const addFirebaseListener = () => {
    DB.collection(FIREBASE_COLLECTION)
        .onSnapshot(snapshot => {
            const CHANGES = snapshot.docChanges()
            CHANGES.forEach(change => change.type === 'added' ? updateScores() : '')
        })
}

addFirebaseListener()

CLOSE_MODAL.addEventListener('click', closeModal)
NAME_INPUT.addEventListener('keyup', updateFirebase)
GUESS_INPUT.addEventListener('keyup', makeGuess)
RESTART.addEventListener('click', restart)
addEventListener('keyup', e => e.key === 'Escape' ? restart() : '')