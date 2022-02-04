import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css'
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import useLocalStorageState from 'use-local-storage-state'

export default function Home() {

  const [globalTodaysWord, setGlobalTodaysWord] = useState('')

  const checkIfSameToTodaysWord = async (word) => {
    const today = new Date();
    const req = await fetch(`api/${today.getUTCFullYear().toString() + ("00" + (today.getUTCMonth() + 1)).slice(-2) + ("00" + today.getUTCDate()).slice(-2)}`)
    const todaysWord = await req.json();
    return word.toUpperCase() === todaysWord.data.toUpperCase()
  }
  const [wordId, setWordId] = useState(0)

  const [wordsArray, setWords] = useState([
    [' ', ' ', ' ', ' ', ' ',],
    [' ', ' ', ' ', ' ', ' ',],
    [' ', ' ', ' ', ' ', ' ',],
    [' ', ' ', ' ', ' ', ' ',],
    [' ', ' ', ' ', ' ', ' ',],
  ]);
  const [completedArray, setCompletedArray] = useState([
    false, false, false, false, false
  ])
  const [ended, setEnded] = useState(false);

  const [defaultLatestWord, setDefaultLatestWord, { isPersistent }] = useLocalStorageState('latestWord', { latestWord: undefined });
  const [defaultWordsArray, setDefaultWordsArray] = useLocalStorageState('wordsArray', wordsArray);
  const [defaultCompletedArray, setDefaultCompletedArray] = useLocalStorageState('completedArray', completedArray);
  const [defaultEnded, setDefaultEnded] = useLocalStorageState('ended', ended);

  const refreshDefault = (val) => {
    const conf = val.conf;
    if (conf === 'wordsArray') {
      setWords(val.val);
      setDefaultWordsArray(val.val);
    } else if (conf === 'completedArray') {
      setCompletedArray(val.val)
      setDefaultCompletedArray(val.val);
    } else if (conf === 'ended') {
      setEnded(val.val)
      setDefaultEnded(val.val);
    }
  }

  const handleEnter = async (i, todaysWord) => {
    if (i === undefined) return
    const word = i.join('');
    if (word.includes(' ')) return
    if (word !== '     ') {
      if (await checkIfSameToTodaysWord(word) === true) {
        const abc = [...document.getElementsByClassName('tile-container')[0].children];
        var texts = []
        abc.forEach(ele => {
          const childs = [...ele.children]
          var text = ''
          childs.forEach(child => {
            text += child.innerText

          })
          texts.push(text)
        })
        for (const text of texts) {
          if (await checkIfSameToTodaysWord(text)) {
            [...abc[texts.indexOf(text)].children].forEach(child => {
              child.classList.remove('Home_word_input_empty__FybGD')
              child.classList.add('Home_word_input_correct__5FNJ6')
              refreshDefault({ conf: 'ended', val: true })
              const cloned_completedArray = []
              completedArray.forEach(ele => { cloned_completedArray.push(ele) })
              cloned_completedArray[texts.indexOf(text)] = true
              refreshDefault({ conf: 'completedArray', val: cloned_completedArray })
            })
          }
        }
        return
      } else {
        if (!await checkIfWordValid(word)) {
          const cloned = []
          defaultWordsArray.forEach(i => cloned.push(i));
          cloned[defaultWordsArray.indexOf(i)] = [' ', ' ', ' ', ' ', ' ',];
          refreshDefault({ conf: 'wordsArray', val: cloned });
          return
        } else {
          const splitedTodaysWord = todaysWord.toUpperCase().split('')
          const abc = [...document.getElementsByClassName('tile-container')[0].children];
          var eles = [];
          abc.forEach(ele => {
            const childs = [...ele.children]
            eles.push(childs)
          })
          eles[defaultWordsArray.indexOf(i)].forEach(ele => {
            if (ele.innerText === splitedTodaysWord[eles[defaultWordsArray.indexOf(i)].indexOf(ele)]) {
              ele.classList.remove('Home_word_input_empty__FybGD')
              ele.classList.add('Home_word_input_correct__5FNJ6')
            } else if (splitedTodaysWord.includes(ele.innerText)) {
              ele.classList.remove('Home_word_input_empty__FybGD')
              ele.classList.add('Home_word_input_wrong_place__8492H')
            } else {
              ele.classList.remove('Home_word_input_empty__FybGD')
              ele.classList.add('Home_word_input_wrong__BJ0QI')
            }
          })
          const cloned_completedArray = []
          completedArray.forEach(yes => cloned_completedArray.push(yes))
          cloned_completedArray[defaultWordsArray.indexOf(i)] = true
          refreshDefault({ conf: 'completedArray', val: cloned_completedArray })
        }
      }
    }
  }

  const checkIfConfigAxist = async (todaysWord) => {
    if (!isPersistent) setDefaultLatestWord(todaysWord);
    else if (defaultLatestWord === undefined) {
      setDefaultLatestWord(todaysWord)
    } else if (defaultLatestWord === todaysWord) {
      setWords(defaultWordsArray);
      setCompletedArray(defaultCompletedArray);
      setEnded(defaultEnded);
      const newWordsArray = [...defaultWordsArray].filter(word => word.join('') !== '     ').reverse();
      for (const array of newWordsArray) {
        await handleEnter(array, todaysWord)
      }
      if (!isPersistent) {
        setDefaultWordsArray(wordsArray);
      } else { setWords(defaultWordsArray) }
    }
  }


  useEffect(() => {
    const todaysWord = async () => {
      const today = new Date();
      fetch(`api/${today.getUTCFullYear().toString() + ("00" + (today.getUTCMonth() + 1)).slice(-2) + ("00" + today.getUTCDate()).slice(-2)}`)
        .then(req => req.json())
        .then((res) => {
          setGlobalTodaysWord(res.data);
          checkIfConfigAxist(res.data);
        })
    }
    todaysWord();
  }, [wordId])

  const onKeyPress = async (button) => {
    if (ended) return
    if (button === "{enter}") {
      handleEnter();
    } else if (button === "{bksp}") {
      var newWordsArray = wordsArray.filter(word => word.join("") !== '     ').filter(word => word.join("") != '     ')
      newWordsArray = newWordsArray[newWordsArray.length - 1]
      if (newWordsArray === undefined) return
      const remove = newWordsArray.filter(word => word !== ' ')
      if (completedArray[wordsArray.indexOf(newWordsArray)] === true) return
      remove.reverse()
      remove.shift();
      remove.reverse()
      for (const i = remove.length; i < 5; i++) {
        remove.push(' ');
      }
      const cloned = []
      wordsArray.forEach(i => cloned.push(i));
      cloned[wordsArray.indexOf(newWordsArray)] = remove;
      refreshDefault({ conf: 'wordsArray', val: cloned });
    } else {
      for (const i of wordsArray) {
        if (i.includes(' ') && wordsArray.indexOf(i) !== 0) {
          if (completedArray[wordsArray.indexOf(i) - 1] === false) return
          const cloned = []
          wordsArray.forEach(i => cloned.push(i));
          cloned[wordsArray.indexOf(i)][i.indexOf(' ')] = button;
          refreshDefault({ conf: 'wordsArray', val: cloned });
          return
        } else if (i.includes(' ')) {
          const cloned = []
          wordsArray.forEach(i => cloned.push(i));
          cloned[wordsArray.indexOf(i)][i.indexOf(' ')] = button;
          refreshDefault({ conf: 'wordsArray', val: cloned });
          return
        }
      }
    }
  }

  const checkIfWordValid = async (word) => {
    const req = await fetch(`/api/checkIfWordValid/${word}`)
    const res = await req.json();
    if (res.code === 200) {
      return true
    } else {
      return false
    }
  }

  return (
    <div className="max-w-[500px] flex flex-col justify-center mx-auto my-0">
      <header className='flex flex-col border-b-4 border-[#595959]'>
        <div className='flex justify-center'>
          <a>This is a Malay version of Worlde!</a>
        </div>
        <div className={"flex " + styles.control_bar}>
          <a className='flex-1'>
            {/* <i className="bi bi-question-circle"></i> */}
          </a>
          <a className='flex-1 text-center'>
            MALAYLE
          </a>
          <div className='flex-1 text-right'>
            <a className='m-2'><i className="bi bi-bar-chart"></i></a>
            {/* <a className=''><i className="bi bi-gear"></i></a> */}
          </div>
        </div>
      </header>
      <div className='flex-col flex gap-2 mx-8 my-4 tile-container'>
        <div className='flex-1/5 grid grid-cols-5 gap-[5px]'>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[0][0]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[0][1]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[0][2]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[0][3]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[0][4]}</div>
        </div>
        <div className='flex-1/5 grid grid-cols-5 gap-[5px]'>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[1][0]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[1][1]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[1][2]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[1][3]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[1][4]}</div>
        </div>
        <div className='flex-1/5 grid grid-cols-5 gap-[5px]'>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[2][0]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[2][1]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[2][2]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[2][3]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[2][4]}</div>
        </div>
        <div className='flex-1/5 grid grid-cols-5 gap-[5px]'>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[3][0]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[3][1]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[3][2]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[3][3]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[3][4]}</div>
        </div>
        <div className='flex-1/5 grid grid-cols-5 gap-[5px]'>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[4][0]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[4][1]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[4][2]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[4][3]}</div>
          <div className={`inline-block ${styles.word_input_empty} ${styles.word_input} flex-1/5`}>{wordsArray[4][4]}</div>
        </div>
      </div>
      <div className='keyboard-container h-[100%] my-auto'>
        <Keyboard
          baseClass={'h-[100%]'}
          onKeyPress={onKeyPress}
          layout={{
            'default': [
              'Q W E R T Y U I O P',
              'A S D F G H J K L',
              '{enter} Z X C V B N M {bksp}',
            ]
          }}
          display={
            {
              '{enter}': 'ENTER',
              '{bksp}': 'BKSP'
            }
          }
        />
      </div>
      <div className='flex text-white justify-center'>
        <div className='block'>
          Made by<a target="_blank" href="https://github.com/FlyingShuriken"> FlyingShuriken</a>
        </div>
      </div>
    </div>
  )
}
