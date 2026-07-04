import React, { createContext, useState, useContext, ReactNode } from 'react';

type BoardType = 'BRCA' | 'BSA';

interface BoardContextType {
  activeBoard: BoardType;
  setActiveBoard: (board: BoardType) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [activeBoard, setActiveBoard] = useState<BoardType>('BRCA');

  return (
    <BoardContext.Provider value={{ activeBoard, setActiveBoard }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
}
