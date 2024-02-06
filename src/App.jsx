import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import "./App.css";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [data, setData] = useState([]);
  useEffect(() => {
    console.log(notes, "notes");

    fetch("http://localhost:3000/notes")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      });
  }, []);
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: "Note 1",
      completed: false,
      items: [
        {
          id: 1,
          value: "First item",
          order: 1,
          noteId: 1,
          completed: false,
          deleted: false,
        },
        {
          id: 2,
          value: "Second item",
          order: 2,
          noteId: 1,
          completed: false,
          deleted: false,
        },
      ],
      draftItem: "",
    },
    {
      id: 2,
      title: "Note 2",
      completed: true,
      items: [
        {
          id: 3,
          value: "Third item",
          order: 1,
          noteId: 2,
          completed: false,
          deleted: false,
        },
        {
          id: 4,
          value: "Last item",
          order: 2,
          noteId: 2,
          completed: false,
          deleted: false,
        },
      ],
      draftItem: "",
    },
  ]);

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

  const addNewItem = (noteId) => {
    const newState = notes.map((note, index) => {
      if (noteId === index) {
        return {
          ...note,
          items: [
            ...note.items,
            {
              id: note.items.length + 1,
              value: note.draftItem,
              order: note.items.length + 1,
              noteId: note.id,
              completed: false,
            },
          ],
          draftItem: "",
        };
      } else {
        return { ...note };
      }
    });
    setNotes(newState);
  };
  const handleInputChange = (e, indexToEdit) => {
    const newState = notes.map((note, index) => {
      if (indexToEdit === index) {
        return {
          ...note,
          draftItem: e.target.value,
        };
      } else {
        return { ...note };
      }
    });
    setNotes(newState);
  };

  const handleKeyPress = (e, index) => {
    if (e.key === "Enter") {
      addNewItem(index);
    }
  };

  const itemCompleted = (noteIndex, itemIndex) => {
    const newState = notes.map((note, index) => {
      if (index === noteIndex) {
        const updatedItems = note.items.map((item, i) => {
          if (i === itemIndex) {
            return {
              ...item,
              completed: !item.completed,
            };
          } else {
            return item;
          }
        });
        return {
          ...note,
          items: updatedItems,
        };
      } else {
        return note;
      }
    });
    setNotes(newState);
  };

  const deleteItem = (noteIndex, itemIndex) => {
    const newState = notes.map((note, index) => {
      if (index === noteIndex) {
        const updatedItems = note.items
          .map((item, i) => {
            if (i === itemIndex) {
              return {
                ...item,
                deleted: true,
              };
            } else {
              return item;
            }
          })
          .filter((item) => !item.deleted);
        return {
          ...note,
          items: updatedItems,
        };
      } else {
        return note;
      }
    });
    setNotes(newState);
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
    <>
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
                <p className="noteTitle">{highlightSearchTerm(note.title)}</p>
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
    </>
  );
};

export default App;
