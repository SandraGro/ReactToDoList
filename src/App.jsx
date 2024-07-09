import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEdit, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./App.css";

const App = () => {
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [originalNotes, setOriginalNotes] = useState([]);

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/notes")
      .then((response) => response.json())
      .then((notas) => {
        setNotes(notas);
        setOriginalNotes(notas.map((note) => ({ ...note })));
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    const filteredNotes = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.items.some((item) =>
          item.value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setSearchResults(filteredNotes);
  }, [searchTerm, notes]);

  const editNote = (noteIndex) => {
    setEditingNote(noteIndex);
  };

  const saveNote = async (noteIndex) => {
    try {
      const updatedNote = notes[noteIndex];
      console.log("Updating note:", noteIndex);

      const response = await fetch(
        `http://localhost:3001/api/notes/${updatedNote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedNote),
        }
      );

      if (response.ok) {
        const updatedNotes = [...notes];
        updatedNotes[noteIndex] = { ...updatedNote };
        setNotes(updatedNotes);
        setEditingNote(null);
      } else {
        console.error("Error updating note:", response.status);
      }
    } catch (error) {
      console.error("Error updating note:", error.message);
    }
  };


  const cancelEditNote = (noteIndex) => {
    const updatedNotes = [...notes];
    updatedNotes[noteIndex] = { ...originalNotes[noteIndex] };
    setNotes(updatedNotes);
    setEditingNote(null);
  };

  const handleEditNoteTitleChange = (e, noteIndex) => {
    const updatedNotes = [...notes];
    updatedNotes[noteIndex] = {
      ...updatedNotes[noteIndex],
      title: e.target.value,
    };
    setNotes(updatedNotes);
  };

  const handleInputChange = (e, noteIndex) => {
    const updatedNotes = [...notes];
    updatedNotes[noteIndex] = {
      ...updatedNotes[noteIndex],
      draftItem: e.target.value,
    };
    setNotes(updatedNotes);
  };

  const handleKeyPress = (e, noteIndex) => {
    if (e.key === "Enter") {
      addNewItem(noteIndex);
    }
  };

  const addNewItem = (noteIndex) => {
    const updatedNotes = [...notes];
    const noteToUpdate = { ...updatedNotes[noteIndex] };
    noteToUpdate.items.push({
      id: noteToUpdate.items.length + 1,
      value: noteToUpdate.draftItem,
      order: noteToUpdate.items.length + 1,
      noteId: noteToUpdate.id,
      completed: false,
    });
    noteToUpdate.draftItem = "";
    updatedNotes[noteIndex] = noteToUpdate;
    setNotes(updatedNotes);
  };

  const itemCompleted = (noteIndex, itemIndex) => {
    const updatedNotes = [...notes];
    updatedNotes[noteIndex].items[itemIndex].completed = !updatedNotes[noteIndex].items[itemIndex].completed;
    setNotes(updatedNotes);
  };

  const deleteItem = (noteIndex, itemIndex) => {
    const updatedNotes = [...notes];
    updatedNotes[noteIndex].items.splice(itemIndex, 1);
    setNotes(updatedNotes);
  };

  const highlightSearchTerm = (text) => {
    if (!searchTerm.trim()) {
      return text;
    }

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div>
      <h1>ToDo App</h1>
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search notes"
        />
      </div>
      <div>
        <ul>
          {searchResults.map((note, index) => (
            <li key={`Note-${note.id}`} className="note">
              <p className="noteTitle">
                {editingNote === index ? (
                  <input
                    type="text"
                    value={note.title}
                    onChange={(e) => handleEditNoteTitleChange(e, index)}
                  />
                ) : (
                  highlightSearchTerm(note.title)
                )}
                {editingNote === index ? (
                  <>
                    <button onClick={() => saveNote(index)}>
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button onClick={() => cancelEditNote(index)}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </>
                ) : (
                  <button onClick={() => editNote(index)}>
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                )}
              </p>
              <hr />
              <ul key={`Items-${note.id}`}>
                {note.items.map((item, itemIndex) => (
                  <li
                    key={`Items-${item.id}`}
                    className={`item ${item.completed ? "completed" : ""}`}
                  >
                    <label>
                      <input
                        type="checkbox"
                        onChange={() => itemCompleted(index, itemIndex)}
                        checked={item.completed}
                      />
                      {highlightSearchTerm(item.value)}
                    </label>
                    <button
                      className="close-btn"
                      onClick={() => deleteItem(index, itemIndex)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </li>
                ))}
                <input
                  type="text"
                  value={note.draftItem}
                  onChange={(e) => handleInputChange(e, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  placeholder="Add new item"
                />
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
