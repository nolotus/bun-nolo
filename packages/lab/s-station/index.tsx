
import React, { useState, useEffect } from 'react';
import MoodNoteInput from './MoodNoteInput';
import MoodNoteList from './MoodNoteList';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    const storedNotes = localStorage.getItem('notes');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
  }, []);

  const handleSend = (content: string, images: string[]) => {
    const newNote = { content, createdAt: Date.now(), images: images || [] }; // 添加 images 属性
    setNotes([newNote, ...notes]);
    localStorage.setItem('notes', JSON.stringify([newNote, ...notes]));
  };

  return (
    <div style={{ padding: 20 }}>
      <MoodNoteInput onSend={handleSend} />
      <MoodNoteList notes={notes} />
    </div>
  );
};

export default App;