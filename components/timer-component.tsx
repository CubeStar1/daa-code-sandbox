"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, TimerIcon as LucideTimerIcon, WatchIcon, ChevronLeft, Settings, ChevronDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TimerComponent: React.FC = () => {
  const [timeInSeconds, setTimeInSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'stopwatch' | 'timer'>('stopwatch');
  const [currentView, setCurrentView] = useState<'collapsed' | 'selectMode' | 'active' | 'collapsedActive'>('collapsed');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // State for timer inputs
  const [timerInputHours, setTimerInputHours] = useState("00");
  const [timerInputMinutes, setTimerInputMinutes] = useState("05");
  const [timerInputSeconds, setTimerInputSeconds] = useState("00");
  const [initialTimerDuration, setInitialTimerDuration] = useState(0); // Stores the duration set for the timer in seconds
  // const [showTimeInCollapsedActive, setShowTimeInCollapsedActive] = useState(false); // Removed for shadcn tooltip

  const LOCAL_STORAGE_KEY = 'timerComponentState_v1';

  const popoverVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -5 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: -5, transition: { duration: 0.15, ease: "easeIn" } },
  };

  const activeViewVariants = {
    hidden: { opacity: 0, width: "36px", transition: { duration: 0.2, ease: "easeIn" } }, // Start from icon width
    visible: { opacity: 1, width: "auto", transition: { duration: 0.3, ease: "easeOut" } }, // Expand to auto width
    exit: { opacity: 0, width: "36px", transition: { duration: 0.2, ease: "easeIn" } }, // Shrink back to icon width
  };

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedStateRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStateRaw) {
        const savedState = JSON.parse(savedStateRaw);
        let newTimeInSeconds = savedState.timeInSeconds;

        if (savedState.isRunning && savedState.lastSavedTimestamp) {
          const timeElapsedSinceSave = Math.floor((Date.now() - savedState.lastSavedTimestamp) / 1000);
          if (savedState.selectedMode === 'stopwatch') {
            newTimeInSeconds += timeElapsedSinceSave;
          } else { // Timer mode
            newTimeInSeconds -= timeElapsedSinceSave;
          }
        }

        if (savedState.selectedMode === 'timer' && newTimeInSeconds <= 0) {
          newTimeInSeconds = 0;
          setIsRunning(false); // Timer finished while page was closed
        } else {
          setIsRunning(savedState.isRunning);
        }

        setTimeInSeconds(newTimeInSeconds < 0 ? 0 : newTimeInSeconds);
        setSelectedMode(savedState.selectedMode || 'stopwatch');
        setCurrentView(savedState.currentView || (savedState.isRunning || savedState.timeInSeconds > 0 ? 'collapsedActive' : 'collapsed'));
        setTimerInputHours(savedState.timerInputHours || "00");
        setTimerInputMinutes(savedState.timerInputMinutes || "05");
        setTimerInputSeconds(savedState.timerInputSeconds || "00");
        setInitialTimerDuration(savedState.initialTimerDuration || 0);
      }
    } catch (error) {
      console.error("Failed to load timer state from localStorage:", error);
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const stateToSave = {
      timeInSeconds,
      isRunning,
      selectedMode,
      currentView,
      timerInputHours,
      timerInputMinutes,
      timerInputSeconds,
      initialTimerDuration,
      lastSavedTimestamp: isRunning ? Date.now() : null,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save timer state to localStorage:", error);
    }
  }, [timeInSeconds, isRunning, selectedMode, currentView, timerInputHours, timerInputMinutes, timerInputSeconds, initialTimerDuration]);

  // Core timer/stopwatch logic
  useEffect(() => {
    if (isRunning) { // Timer runs if isRunning is true, regardless of view
      timerRef.current = setInterval(() => {
        setTimeInSeconds(prevTime => {
          if (selectedMode === 'stopwatch') {
            return prevTime + 1;
          } else { // Timer mode
            if (prevTime <= 1) {
              clearInterval(timerRef.current!); // Stop interval immediately
              setIsRunning(false);              // Set isRunning to false
              // Optionally: play a sound or show notification, or change view
              return 0;                       // Return 0 for the time
            }
            return prevTime - 1; // Countdown
          }
        });
      }, 1000);
    } else { // If isRunning is false
      if (timerRef.current) {
        clearInterval(timerRef.current); // Clear interval if it exists
      }
    }
    return () => { // Cleanup function
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, selectedMode]); // Dependencies: only re-run if isRunning or selectedMode changes

  const handleStart = () => {
    if (selectedMode === 'timer') {
      const hours = parseInt(timerInputHours, 10) || 0;
      const minutes = parseInt(timerInputMinutes, 10) || 0;
      const seconds = parseInt(timerInputSeconds, 10) || 0;
      const totalDuration = hours * 3600 + minutes * 60 + seconds;
      if (totalDuration <= 0) {
        alert("Please set a valid timer duration.");
        return;
      }
      setTimeInSeconds(totalDuration);
      setInitialTimerDuration(totalDuration);
    } else {
      setTimeInSeconds(0);
      setInitialTimerDuration(0); // Reset for stopwatch mode
    }
    setIsRunning(true);
    setCurrentView('active');
  };

  const handleCollapseFromActive = () => {
    // When collapsing from active, go to 'collapsedActive' to show time and active state
    setCurrentView('collapsedActive');
  };

  const handleExpandFromCollapsedActive = () => {
    setCurrentView('active');
  };

  const handlePauseResume = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (selectedMode === 'timer') {
      setTimeInSeconds(initialTimerDuration > 0 ? initialTimerDuration : 0); // Reset timer to its initial set duration, or 0 if not set
    } else {
      setTimeInSeconds(0); // Reset stopwatch to 0
    }
    // After reset, go back to mode selection
    setCurrentView('selectMode');
  };

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const toggleSelectModePopover = () => {
    // This function now only toggles between 'selectMode' and 'collapsed'
    // 'collapsedActive' to 'active' is handled by handleExpandFromCollapsedActive
    setCurrentView(prev => prev === 'selectMode' ? 'collapsed' : 'selectMode');
  };

  const renderSelectModeView = () => (
    <motion.div
      className="absolute top-full right-0 mt-2 w-[300px] bg-popover text-popover-foreground rounded-lg shadow-xl border border-border p-4 z-50"
      variants={popoverVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Close button can be added here if needed, or rely on clicking the icon again */}
      {/* For simplicity, matching image which doesn't show an explicit close button inside popover */}
      
      <div className="flex gap-2 mb-4">
        {/* Stopwatch Button/Section */}
        <button
          onClick={() => setSelectedMode('stopwatch')}
          className={`flex-1 p-3 flex flex-col items-center justify-center rounded-lg border transition-all duration-150
            ${selectedMode === 'stopwatch' 
              ? 'bg-muted border-primary shadow-md' 
              : 'bg-background hover:bg-muted/50 border-border'}
          `}
        >
          <WatchIcon size={28} className={`${selectedMode === 'stopwatch' ? 'text-primary' : 'text-muted-foreground'}`} />
        </button>

        {/* Timer Button/Section */}
        <button
          onClick={() => setSelectedMode('timer')}
          className={`flex-1 p-3 flex flex-col items-center justify-center rounded-lg border transition-all duration-150
            ${selectedMode === 'timer' 
              ? 'bg-muted border-primary shadow-md' 
              : 'bg-background hover:bg-muted/50 border-border'}
          `}
        >
          <LucideTimerIcon size={28} className={`${selectedMode === 'timer' ? 'text-orange-500' : 'text-muted-foreground'}`} />
          {selectedMode === 'timer' && (
            <div className="flex items-end gap-1 mt-2">
              <div>
                <input 
                  type="text" 
                  value={timerInputHours}
                  onFocus={(e) => e.target.select()}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                    setTimerInputHours(val.padStart(2,'0'));
                  }}
                  className="w-10 p-1 text-center bg-transparent text-lg font-medium focus:outline-none"
                />
                <span className="text-xs text-muted-foreground block text-center">hr</span>
              </div>
              <div>
                <input 
                  type="text" 
                  value={timerInputMinutes}
                  onFocus={(e) => e.target.select()}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                    setTimerInputMinutes(val.padStart(2,'0'));
                  }}
                  className="w-10 p-1 text-center bg-transparent text-lg font-medium focus:outline-none"
                />
                <span className="text-xs text-muted-foreground block text-center">min</span>
              </div>
              {/* Seconds input can be added here if desired, image doesn't show it */}
            </div>
          )}
        </button>
      </div>

      <button
        onClick={handleStart}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <Play size={16} /> Start {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}
      </button>
    </motion.div>
  );

  const renderActiveView = () => (
    <motion.div 
      layout
      className="flex items-center bg-card text-card-foreground p-1.5 rounded-md shadow-sm border border-border overflow-hidden"
      variants={activeViewVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ minWidth: '36px' }} // Ensure it can shrink to icon size
    >
      <motion.button layout="position" title="Collapse Timer" onClick={handleCollapseFromActive} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
        <ChevronLeft size={16} />
      </motion.button>
      <motion.button layout="position" title={isRunning ? "Pause" : "Resume"} onClick={handlePauseResume} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
        {isRunning ? <Pause size={16} /> : <Play size={16} />}
      </motion.button>
      <motion.span layout="position" className="font-mono text-lg mx-2.5 select-none tabular-nums min-w-[70px] text-center whitespace-nowrap">
        {formatTime(timeInSeconds)}
      </motion.span>
      <motion.button layout="position" title="Reset Timer" onClick={handleReset} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
        <RotateCcw size={16} />
      </motion.button>
    </motion.div>
  );

  return (
    <div className="relative flex items-center min-h-[36px]"> {/* Parent container for positioning and consistent height */}
      <AnimatePresence mode="popLayout" initial={false}>
        {currentView === 'active' && (
          // Active view takes over the layout space
          <motion.div 
            key="active"
            layoutId="timer-widget" 
            className="flex items-center"
          >
            {renderActiveView()} {/* renderActiveView returns a motion.div with its own variants */}
          </motion.div>
        )}

        {currentView === 'selectMode' && (
          // In selectMode, the icon button has the layoutId, popover is a child
          <div key="select" className="relative flex items-center"> {/* Using a simple div for positioning context of the popover */}
            <motion.button
              layoutId="timer-widget"
              key="select-mode-icon-trigger"
              title="Timer Settings"
              onClick={toggleSelectModePopover} // Toggles popover visibility or collapses
              className={`p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground bg-muted`}
              whileTap={{ scale: 0.95 }}
              transition={{ layout: { duration: 0.3, type: "spring", stiffness: 500, damping: 30 } }}
            >
              <LucideTimerIcon size={20} />
            </motion.button>
            {/* renderSelectModeView returns the popover (a motion.div with its own variants) */}
            {/* It's animated by AnimatePresence because its parent ('select' div) is stable while popover appears/disappears if we were to toggle it internally */}
            {/* However, here the whole 'select' block appears/disappears, and renderSelectModeView has its own enter/exit */}
            {renderSelectModeView()} 
          </div>
        )}

        {currentView === 'collapsed' && (
          <motion.button
            key="collapsedButton"
            layoutId="timer-widget"
            title="Open Timer Settings"
            onClick={toggleSelectModePopover} // Opens the mode selection popover
            className={`flex items-center gap-1 p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground min-h-[36px]`}
            whileTap={{ scale: 0.95 }}
            transition={{ layout: { duration: 0.3, type: "spring", stiffness: 500, damping: 30 } }}
          >
            <LucideTimerIcon size={20} />
          </motion.button>
        )}

        {currentView === 'collapsedActive' && (isRunning || timeInSeconds > 0) && (
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <motion.button
                  key="collapsedActiveButton"
                  layoutId="timer-widget"
                  title="Expand Active Timer" // Tooltip for the button itself can be this
                  onClick={handleExpandFromCollapsedActive} // Expands to full active view
                  className={`flex items-center gap-1 p-2 hover:bg-muted rounded-md text-blue-500 hover:text-blue-600 min-h-[36px]`}
                  whileTap={{ scale: 0.95 }}
                  transition={{ layout: { duration: 0.3, type: "spring", stiffness: 500, damping: 30 } }}
                >
                  <LucideTimerIcon size={20} />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                <p className="font-mono text-sm select-none">{formatTime(timeInSeconds)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimerComponent;
