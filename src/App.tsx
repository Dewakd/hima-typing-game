import './App.css'
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Timer, Target, BookOpen } from 'lucide-react';
import type { 
  DifficultyLevel, 
  ThemeKey, 
  WordThemes, 
  GameStats,
} from './types';

const CampusTypingGame = () => {
  // Campus-themed word categories by major
  const wordThemes: WordThemes = {
    'Ekonomi dan Bisnis': {
      name: 'Economics & Business',
      easy: ['profit', 'market', 'sales', 'trade', 'money', 'bank', 'loan', 'debt', 'cash', 'cost'],
      medium: ['revenue', 'finance', 'budget', 'income', 'expense', 'accounting', 'business', 'economy', 'investment', 'company'],
      hard: ['management', 'marketing', 'economics', 'entrepreneur', 'financial', 'corporation', 'commercial', 'strategic', 'operations', 'administration']
    },
    'Teknik dan Informatika': {
      name: 'Engineering & IT',
      easy: ['code', 'data', 'wifi', 'tech', 'chip', 'app', 'web', 'file', 'loop', 'bug'],
      medium: ['python', 'software', 'hardware', 'database', 'network', 'program', 'system', 'computer', 'internet', 'digital'],
      hard: ['algorithm', 'programming', 'engineering', 'technology', 'architecture', 'development', 'cybersecurity', 'artificial', 'intelligence', 'electronics']
    },
    'Hukum': {
      name: 'Law',
      easy: ['law', 'rule', 'case', 'jury', 'judge', 'court', 'legal', 'crime', 'trial', 'fine'],
      medium: ['justice', 'lawyer', 'attorney', 'contract', 'lawsuit', 'evidence', 'statute', 'verdict', 'appeal', 'defense'],
      hard: ['constitution', 'legislation', 'jurisdiction', 'litigation', 'prosecution', 'jurisprudence', 'constitutional', 'administrative', 'criminal', 'civil']
    },
    'Ilmu Sosial dan Humaniora': {
      name: 'Social Sciences',
      easy: ['social', 'people', 'group', 'study', 'human', 'culture', 'society', 'history', 'art', 'book'],
      medium: ['psychology', 'sociology', 'anthropology', 'politics', 'research', 'community', 'behavior', 'language', 'literature', 'philosophy'],
      hard: ['humanities', 'civilization', 'methodology', 'theoretical', 'sociological', 'psychological', 'anthropological', 'philosophical', 'cultural', 'historical']
    },
    'Sekolah Pascasarjana': {
      name: 'Graduate School',
      easy: ['thesis', 'paper', 'study', 'grade', 'test', 'exam', 'class', 'book', 'note', 'quiz'],
      medium: ['research', 'academic', 'scholar', 'graduate', 'master', 'doctor', 'degree', 'seminar', 'journal', 'analysis'],
      hard: ['dissertation', 'methodology', 'publication', 'conference', 'postgraduate', 'supervision', 'academic', 'intellectual', 'scholarly', 'theoretical']
    },
    'Farmasi dan Ilmu Kesehatan': {
      name: 'Pharmacy & Health',
      easy: ['pill', 'drug', 'dose', 'sick', 'cure', 'pain', 'heal', 'care', 'aid', 'test'],
      medium: ['medicine', 'pharmacy', 'hospital', 'patient', 'treatment', 'therapy', 'health', 'clinical', 'medical', 'nursing'],
      hard: ['pharmaceutical', 'prescription', 'diagnosis', 'pathology', 'physiology', 'psychology', 'therapeutic', 'healthcare', 'pharmacology', 'rehabilitation']
    }
  };

  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | ''>('');
  const [gameStats, setGameStats] = useState<GameStats>({
    wordsCompleted: 0,
    totalTime: 0,
    averageWPM: 0
  });
  const [feedback, setFeedback] = useState('This is where the point will be shown');
  const [persistentFeedback, setPersistentFeedback] = useState('This is where the point will be shown');
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate a new word based on current theme and difficulty
  const generateNewWord = () => {
    if (!selectedTheme) return;
    const words = wordThemes[selectedTheme][difficulty];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setStartTime(Date.now());
  };

  // Calculate word complexity score
  const getComplexityScore = (word: string, difficulty: DifficultyLevel) => {
    const baseScores = {
      easy: 15,
      medium: 35,
      hard: 60
    };
    
    const lengthBonus = word.length * 3;
    return baseScores[difficulty] + lengthBonus;
  };

  // Calculate speed bonus
  const getSpeedBonus = (word: string, timeTaken: number) => {
    const targetWPM = 40;
    const wordLength = word.length;
    const targetTime = (wordLength / 5) * (60 / targetWPM) * 1000;
    
    if (timeTaken <= targetTime) {
      const speedRatio = targetTime / timeTaken;
      return Math.floor(speedRatio * 25);
    }
    return 0;
  };

  // Handle word completion
  const handleWordComplete = () => {
    const endTime = Date.now();
    const timeTaken = endTime - (startTime || 0);
    const complexityScore = getComplexityScore(currentWord, difficulty);
    const speedBonus = getSpeedBonus(currentWord, timeTaken);
    const streakBonus = streak * 8;
    
    const totalPoints = complexityScore + speedBonus + streakBonus;
    setScore(prev => prev + totalPoints);
    setStreak(prev => prev + 1);
    
    // Update stats
    setGameStats(prev => ({
      wordsCompleted: prev.wordsCompleted + 1,
      totalTime: prev.totalTime + timeTaken,
      averageWPM: Math.round(((prev.wordsCompleted + 1) * 5 * 60000) / (prev.totalTime + timeTaken))
    }));

    const wpm = Math.round((currentWord.length / 5) * (60000 / timeTaken));
    const pointsMessage = `+${totalPoints} pts! (${wpm} WPM)`;
    setFeedback(pointsMessage);
    setPersistentFeedback(pointsMessage);
    
    // Auto-advance difficulty
    if (streak > 0 && streak % 4 === 0 && wpm > 35) {
      const difficulties = ['easy', 'medium', 'hard'];
      const currentIndex = difficulties.indexOf(difficulty);
      if (currentIndex < difficulties.length - 1) {
        setDifficulty(difficulties[currentIndex + 1] as DifficultyLevel);
        const levelUpMessage = pointsMessage + ` Level up!`;
        setFeedback(levelUpMessage);
        setPersistentFeedback(levelUpMessage);
      }
    }

    generateNewWord();
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameOver) return;
    
    const value = e.target.value;
    setUserInput(value);

    if (value === currentWord) {
      handleWordComplete();
      setUserInput('');
    } else if (!currentWord.startsWith(value)) {
      setStreak(0);
    }
  };

  // Handle key press for Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (gameOver) return;
    
    if (e.key === 'Enter' && userInput === currentWord) {
      handleWordComplete();
      setUserInput('');
    }
  };

  // Start game
  const startGame = (theme: ThemeKey) => {
    setSelectedTheme(theme);
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setStreak(0);
    setDifficulty('easy');
    setGameStats({ wordsCompleted: 0, totalTime: 0, averageWPM: 0 });
    setTimeLeft(60);
    setTimeout(() => {
      generateNewWord();
      inputRef.current?.focus();
    }, 100);
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setUserInput('');
    setCurrentWord('');
    setFeedback('This is where the point will be shown');
    setPersistentFeedback('This is where the point will be shown');
    setSelectedTheme('');
    setTimeLeft(60);
  };

  // Countdown timer effect
  useEffect(() => {
    let interval: number;
    if (gameStarted && !gameOver) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true);
            setGameStarted(false);
            setFeedback('Time\'s up!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (gameStarted && selectedTheme && !currentWord) {
      generateNewWord();
    }
  }, [gameStarted, selectedTheme, difficulty]);

  useEffect(() => {
    if (gameStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWord, gameStarted]);

  // Calculate current typing accuracy
  const getTypingAccuracy = () => {
    if (!userInput || !currentWord) return 100;
    let correct = 0;
    for (let i = 0; i < Math.min(userInput.length, currentWord.length); i++) {
      if (userInput[i] === currentWord[i]) correct++;
    }
    return Math.round((correct / userInput.length) * 100);
  };

  const accuracy = getTypingAccuracy();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-2">
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-4 max-w-3xl w-full shadow-2xl border border-white/10 max-h-[95vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <BookOpen className="text-blue-400" />
            Campus Typing Challenge
          </h1>
          <p className="text-white/80">Choose your major theme and type for 60 seconds!</p>
        </div>

        {!gameStarted && !gameOver ? (
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-6 text-center">Choose Your Theme</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(wordThemes).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => startGame(key as ThemeKey)}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg text-left border border-white/20 hover:border-white/30"
                  >
                    <div className="text-lg font-bold mb-2">{theme.name}</div>
                    <div className="text-sm text-white/80">{key}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">How to Play</h3>
              <div className="text-white/90 space-y-2">
                <p>🎯 You have 60 seconds to type as many words as possible</p>
                <p>📚 Words are related to your chosen academic theme</p>
                <p>⚡ Type faster and build streaks for bonus points</p>
                <p>📈 Difficulty automatically increases with performance</p>
              </div>
            </div>
          </div>
        ) : gameOver ? (
          <div className="text-center space-y-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 space-y-4 border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-4">🎓 Final Results</h2>
              <div className="text-lg text-white/80 mb-4">
                Theme: {selectedTheme ? wordThemes[selectedTheme]?.name : ''}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-yellow-400">{score}</div>
                  <div className="text-white/70">Final Score</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-400">{gameStats.wordsCompleted}</div>
                  <div className="text-white/70">Words Completed</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-3xl font-bold text-blue-400">{gameStats.averageWPM}</div>
                  <div className="text-white/70">Average WPM</div>
                </div>
              </div>
              <button
                onClick={resetGame}
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg border border-white/20 hover:border-white/30"
              >
                Try Another Theme
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timer Display */}
            <div className="text-center">
              <div className={`inline-block px-6 py-3 rounded-2xl font-bold text-4xl ${
                timeLeft <= 10 ? 'bg-red-500/20 text-red-300 animate-pulse' :
                timeLeft <= 30 ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-green-500/20 text-green-300'
              }`}>
                <Timer className="inline w-8 h-8 mr-2" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>

            {/* Theme and Difficulty */}
            <div className="text-center space-y-2">
              <div className="text-white/80 text-sm">Current Theme:</div>
              <div className="text-white font-semibold text-lg">{selectedTheme ? wordThemes[selectedTheme]?.name : ''}</div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level
              </span>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-white">{score}</div>
                <div className="text-white/70 text-sm">Score</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-white">{streak}</div>
                <div className="text-white/70 text-sm">Streak</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">{gameStats.averageWPM}</div>
                <div className="text-white/70 text-sm">Avg WPM</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">{accuracy}%</div>
                <div className="text-white/70 text-sm">Accuracy</div>
              </div>
            </div>

            {/* Current Word Display */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/10">
              <div className="text-sm text-white/60 mb-2">Type this word:</div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-6 font-mono tracking-wider">
                {currentWord.split('').map((char, index) => (
                  <span
                    key={index}
                    className={
                      index < userInput.length
                        ? userInput[index] === char
                          ? 'text-green-400'
                          : 'text-red-400 bg-red-400/20'
                        : index === userInput.length
                        ? 'bg-white/30 animate-pulse'
                        : 'text-white/50'
                    }
                  >
                    {char}
                  </span>
                ))}
              </div>
              
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={gameOver}
                className={`w-full p-4 text-xl text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 ${
                  gameOver ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder={gameOver ? "Time's up!" : "Start typing..."}
                autoComplete="off"
                spellCheck="false"
              />
              
              <div className="mt-4 text-center">
                <div className="inline-block bg-white/10 backdrop-blur-md text-green-300 px-4 py-2 rounded-lg font-semibold border border-green-400/30 min-h-[2.5rem] flex items-center justify-center">
                   <span>
                     {persistentFeedback}
                   </span>
                 </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={resetGame}
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors border border-white/20 hover:border-white/30"
              >
                Change Theme
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusTypingGame;