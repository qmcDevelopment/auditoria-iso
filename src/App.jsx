import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Trophy, BookOpen, ArrowRight, ShieldCheck, Factory } from 'lucide-react';

// Datos del juego basados en ISO 19011:2018
const GAME_DATA = [
  {
    levelName: "Nivel 1: Los Actores",
    description: "Identifica quién es quién en el proceso de auditoría.",
    pairs: [
      { id: '1-1', term: "Auditor", def: "Persona que lleva a cabo una auditoría." },
      { id: '1-2', term: "Auditado", def: "Organización o parte de la misma que es auditada." },
      { id: '1-3', term: "Cliente de la auditoría", def: "Organización o persona que solicita una auditoría." },
      { id: '1-4', term: "Experto técnico", def: "Persona que aporta conocimientos o experiencia específicos al equipo auditor." }
    ]
  },
  {
    levelName: "Nivel 2: La Evidencia",
    description: "Distingue entre lo que buscas, lo que encuentras y contra qué comparas.",
    pairs: [
      { id: '2-1', term: "Criterios de auditoría", def: "Grupo de políticas, procedimientos o requisitos usados como referencia." },
      { id: '2-2', term: "Evidencia de la auditoría", def: "Registros, declaraciones de hechos o información verificable pertinente." },
      { id: '2-3', term: "Hallazgos de la auditoría", def: "Resultados de la evaluación de la evidencia recopilada frente a los criterios." },
      { id: '2-4', term: "Conclusiones de la auditoría", def: "Resultado de una auditoría, tras considerar los objetivos y hallazgos." }
    ]
  },
  {
    levelName: "Nivel 3: Conceptos Clave",
    description: "Conceptos fundamentales para la gestión del programa.",
    pairs: [
      { id: '3-1', term: "Sistema de Gestión", def: "Conjunto de elementos de una organización para establecer políticas, objetivos y procesos." },
      { id: '3-2', term: "Riesgo", def: "Efecto de la incertidumbre (disviación de lo esperado)." },
      { id: '3-3', term: "Conformidad", def: "Cumplimiento de un requisito." },
      { id: '3-4', term: "No conformidad", def: "Incumplimiento de un requisito." }
    ]
  }
];

// Función para mezclar arrays
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [gameState, setGameState] = useState('intro'); // intro, playing, levelComplete, gameComplete
  const [terms, setTerms] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedDef, setSelectedDef] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);

  // Inicializar nivel
  useEffect(() => {
    if (gameState === 'playing') {
      const levelData = GAME_DATA[currentLevelIndex];
      const pairs = levelData.pairs;
      
      const termsArray = pairs.map(p => ({ id: p.id, text: p.term }));
      const defsArray = pairs.map(p => ({ id: p.id, text: p.def }));

      setTerms(shuffleArray(termsArray));
      setDefinitions(shuffleArray(defsArray));
      setMatchedIds([]);
      setSelectedTerm(null);
      setSelectedDef(null);
    }
  }, [currentLevelIndex, gameState]);

  // Verificar coincidencia
  useEffect(() => {
    if (selectedTerm && selectedDef) {
      if (selectedTerm.id === selectedDef.id) {
        // Coincidencia correcta
        setMatchedIds(prev => [...prev, selectedTerm.id]);
        setScore(prev => prev + 100);
        setSelectedTerm(null);
        setSelectedDef(null);
      } else {
        // Error
        setMistakes(prev => prev + 1);
        setScore(prev => Math.max(0, prev - 20));
        
        // Breve retraso para mostrar error visual antes de deseleccionar
        const timer = setTimeout(() => {
          setSelectedTerm(null);
          setSelectedDef(null);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedTerm, selectedDef]);

  // Verificar fin de nivel (CORREGIDO: Limpieza de timer y condición estricta)
  useEffect(() => {
    if (gameState === 'playing' && matchedIds.length > 0 && matchedIds.length === GAME_DATA[currentLevelIndex].pairs.length) {
      const levelTimer = setTimeout(() => {
        if (currentLevelIndex < GAME_DATA.length - 1) {
          setGameState('levelComplete');
        } else {
          setGameState('gameComplete');
        }
      }, 500);
      return () => clearTimeout(levelTimer);
    }
  }, [matchedIds, currentLevelIndex, gameState]);

  const startGame = () => {
    setCurrentLevelIndex(0);
    setScore(0);
    setMistakes(0);
    setMatchedIds([]); // Asegura limpieza
    setGameState('playing');
  };

  const nextLevel = () => {
    // CORREGIDO: Limpieza preventiva de estados antes de avanzar
    setMatchedIds([]);
    setSelectedTerm(null);
    setSelectedDef(null);
    setCurrentLevelIndex(prev => prev + 1);
    setGameState('playing');
  };

  // Componentes de UI
  const Card = ({ item, type, isSelected, isMatched, onClick, isError }) => {
    if (isMatched) return <div className="invisible h-24" />; // Espacio vacío si ya se emparejó

    let bgClass = "bg-white hover:bg-blue-50 border-gray-200";
    if (isSelected) bgClass = "bg-blue-100 border-blue-500 ring-2 ring-blue-200";
    if (isError) bgClass = "bg-red-100 border-red-500 animate-pulse";

    return (
      <button
        // CORREGIDO: Previene clics si ya hay un error mostrándose
        onClick={() => !isError && onClick(item)}
        className={`w-full p-4 h-full min-h-[100px] flex items-center justify-center text-sm md:text-base border-2 rounded-xl shadow-sm transition-all duration-200 ${bgClass}`}
      >
        <span className="text-center font-medium text-slate-700">{item.text}</span>
      </button>
    );
  };

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-800 p-8 text-white text-center">
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
            <h1 className="text-3xl font-bold mb-2">La Matriz del Auditor</h1>
            <p className="text-slate-300">Dominando ISO 19011:2018</p>
          </div>
          <div className="p-8">
            <div className="space-y-4 text-slate-600 mb-8">
              <p>Bienvenido al simulador de entrenamiento para auditores internos.</p>
              <p>Tu misión es conectar correctamente los <strong>Términos</strong> con sus <strong>Definiciones</strong> oficiales.</p>
              <ul className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-500"/> 3 Niveles de dificultad</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-500"/> Terminología oficial ISO</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-500"/> Escenario industrial automotriz</li>
              </ul>
            </div>
            <button 
              onClick={startGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Iniciar Entrenamiento <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameComplete') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-500" />
          <h2 className="text-3xl font-bold text-slate-800 mb-2">¡Certificación Completada!</h2>
          <p className="text-slate-600 mb-6">Has dominado los términos clave de ISO 19011.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-100 p-4 rounded-lg">
              <div className="text-sm text-slate-500">Puntuación Final</div>
              <div className="text-2xl font-bold text-blue-600">{score}</div>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg">
              <div className="text-sm text-slate-500">Errores</div>
              <div className="text-2xl font-bold text-red-500">{mistakes}</div>
            </div>
          </div>

          <button 
            onClick={startGame}
            className="flex items-center justify-center gap-2 mx-auto text-blue-600 hover:text-blue-800 font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Volver a jugar
          </button>
        </div>
      </div>
    );
  }

  const currentLevel = GAME_DATA[currentLevelIndex];
  const isError = selectedTerm && selectedDef && selectedTerm.id !== selectedDef.id;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Factory className="w-6 h-6 text-slate-700" />
            <div>
              <h1 className="font-bold text-slate-800 text-sm md:text-base">Auditoría ISO 19011</h1>
              <div className="text-xs text-slate-500">Nivel {currentLevelIndex + 1} de {GAME_DATA.length}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
              Puntos: {score}
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
        
        {/* Level Intro / Overlay */}
        {gameState === 'levelComplete' ? (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-20 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold mb-2">¡Nivel Completado!</h2>
              <p className="text-slate-600 mb-6">Excelente trabajo asociando los conceptos.</p>
              <button 
                onClick={nextLevel}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl"
              >
                Siguiente Nivel
              </button>
            </div>
          </div>
        ) : null}

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-1">{currentLevel.levelName}</h2>
          <p className="text-slate-600 text-sm">{currentLevel.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Columna Términos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" /> Términos
            </div>
            <div className="space-y-3">
              {terms.map((item) => (
                <Card 
                  key={item.id} 
                  item={item} 
                  type="term"
                  isSelected={selectedTerm?.id === item.id}
                  isMatched={matchedIds.includes(item.id)}
                  isError={isError && selectedTerm?.id === item.id}
                  onClick={() => setSelectedTerm(item)}
                />
              ))}
            </div>
          </div>

          {/* Columna Definiciones */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
              <SearchIconWrapper /> Definiciones
            </div>
            <div className="space-y-3">
              {definitions.map((item) => (
                <Card 
                  key={item.id} 
                  item={item} 
                  type="def"
                  isSelected={selectedDef?.id === item.id}
                  isMatched={matchedIds.includes(item.id)}
                  isError={isError && selectedDef?.id === item.id}
                  onClick={() => setSelectedDef(item)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Feedback visual si hay error */}
        {isError && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg font-medium animate-bounce">
            ¡No coinciden! Intenta de nuevo.
          </div>
        )}

      </main>
    </div>
  );
}

// Icono auxiliar
const SearchIconWrapper = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);