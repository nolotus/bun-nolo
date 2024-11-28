//index.tsx
import React, { useState, useEffect } from "react";
import MoodNoteInput from "./MoodNoteInput";
import MoodNoteList from "./MoodNoteList";
import BioEditor from "./BioEditor";

const PageOne = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const storedNotes = localStorage.getItem("notes");
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
  }, []);

  const handleSend = (content: string, images: string[]) => {
    const newNote = { content, createdAt: Date.now(), images: images || [] };
    setNotes([newNote, ...notes]);
    localStorage.setItem("notes", JSON.stringify([newNote, ...notes]));
  };

  const handleDelete = (index: number) => {
    const newNotes = notes.filter((_, i) => i !== index);
    setNotes(newNotes);
    localStorage.setItem("notes", JSON.stringify(newNotes));
  };

  return (
    <div style={{ padding: 20 }}>
      <BioEditor />
      <MoodNoteInput onSend={handleSend} />
      <MoodNoteList notes={notes} onDelete={handleDelete} />
    </div>
  );
};

export default PageOne;
