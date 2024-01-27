import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('http://localhost:3000/notes').then(response => response.json()).then((data => { setData(data) }));
  }, [])
  console.log('data', data);
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: "Note 1",
      completed: false,
      items: [
        { id: 1, value: "First item", order: 1, noteId: 1, completed: false },
        { id: 2, value: "Second item", order: 2, noteId: 1, completed: false },
      ],
      draftItem: '',
    },
    {
      id: 2,
      title: "Note 2",
      completed: true,
      items: [
        { id: 3, value: "Third item", order: 1, noteId: 2, completed: false },
        { id: 4, value: "Last item", order: 2, noteId: 2, completed: false },
      ],
      draftItem: '',
    },
  ]);

  const addNewItem = (noteId) => {
    console.log(noteId, 'noteId');
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
          draftItem: ''
        }
      } else {
        return {...note}
      }
    })
    console.log(newState, 'new State');
    setNotes(newState);
  }
  const handleInputChange = (e, indexToEdit) => {
    console.log(indexToEdit, 'indexToEdit');
    const newState = notes.map((note, index) => {
      if(indexToEdit === index) {
        return {
          ...note,
          draftItem: e.target.value,

        }
      } else {
        return {...note}
      }
    })
    setNotes(newState);
  };
  console.log('notes: ', notes);

  const handleKeyPress = (e, index) => {
    console.log(index, 'index')
    if (e.key === 'Enter'){
      addNewItem(index);
    }
  }

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
    console.log(notes, 'notes');
  };


  return (
    <>
    <div>
      <h1>ToDo App</h1>
      <div>
        <ul>
          {notes.map((note, index) => (
            <li key={`Note-${note.id}`} className="note">
              <p className="noteTitle"> {note.title}</p>
              <hr/>
              <ul key={`Items-${note.id}`}>

                {note.items.map((item, itemIndex) => (
                  <li key={`Items-${item.id}`} className="item">
                    <label>
                      <input type="checkbox"
                      onChange={() => itemCompleted(index, itemIndex)}/>
                    </label>
                    {item.value}
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
}

export default App;
