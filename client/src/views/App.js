import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ErrorBoundary from "../components/ErrorBoundary";
import useUnsavedChangesWarning from "../hooks/warnTheUserBeforeClosing";
import trashIcon from "../assets/img/trashIcon.png";
import newNote from "../assets/img/newNote.png";

const App = () => {
  const [Prompt, setNotSaved, setPristine] = useUnsavedChangesWarning();
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({});
  const [showGreenPulse, setShowGreenPulse] = useState(false);
  const [showRedPulse, setShowRedPulse] = useState(false);
  const textAreaRef = useRef(null);

  useEffect(() => {
    axios
      .get("/api/notes")
      .then((res) => {
        setNotes(res.data.data);
        setCurrentNote(res.data.data.length > 0 && res.data.data[0]);
      })
      .catch((err) => {
        // console.log(err)
      });
  }, []);

  const handleChange = async (event, currentNote) => {
    if (Object.keys(currentNote).length !== 0) {
      const allNotes = [...notes];
      const index = allNotes.findIndex((e) => {
        return e._id === currentNote._id;
      });

      allNotes[index].content = event.target.value;
      setNotes(allNotes);

      try {
        await axios.post("/api/update", { id: currentNote._id, order: currentNote.order, content: event.target.value });
        setShowRedPulse(false);
        setShowGreenPulse(true);
        setPristine();
      } catch (error) {
        setShowGreenPulse(false);
        setShowRedPulse(true);
        setNotSaved();
        // console.log(error)
      }
    }
  };

  const handleDelete = async () => {
    if (Object.keys(currentNote).length !== 0) {
      await axios.delete(`/api/delete/${currentNote._id}`);
      const allNotes = [...notes];
      const index = allNotes.findIndex((e) => {
        return e._id === currentNote._id;
      });
      allNotes.splice(index, 1);
      setNotes(allNotes);
      setShowGreenPulse(false);
      setShowRedPulse(false);
      if (allNotes.length !== 0) {
        setCurrentNote(allNotes[0]);
      } else {
        setCurrentNote({});
      }
    }
  };

  const createNewNote = async () => {
    const { data } = await axios.post("/api/create", { order: notes.length, content: "" });
    const allNotes = [...notes];
    allNotes.push(data.data);
    setNotes(allNotes);
    setCurrentNote(data.data);
    setShowGreenPulse(false);
    setShowRedPulse(false);
    textAreaRef.current.focus();
  };

  const handleDragEnd = async (res) => {
    if (!res.destination) return;
    const items = Array.from(notes);
    const [reorderedItem] = items.splice(res.source.index, 1);
    items.splice(res.destination.index, 0, reorderedItem);
    let newNotes = items.map((e, index) => {
      return { ...e, order: index };
    });
    const indexOfCurrentNote = newNotes.findIndex((e) => {
      return e._id === currentNote._id;
    });
    setNotes(newNotes);
    setCurrentNote(newNotes[indexOfCurrentNote]);
    try {
      await axios.post("/api/updateall", newNotes);
    } catch (error) {
      // console.log(error)
    }
  };

  return (
    <ErrorBoundary>
      <div className='container vh-100 mt-5'>
        <div className='mb-1 d-flex align-items-center justify-content-between' style={{ height: "42px" }}>
          <div role='button' onClick={createNewNote} className='d-flex justify-content-between'>
            <img src={newNote} alt='new-note' width='24' height='24' />
            <span>New note</span>
          </div>
          <div>
            {showGreenPulse && (
              <div className='d-flex align-items-center'>
                <div className='green-blob'></div> <span>Server is listening!</span>
              </div>
            )}
            {showRedPulse && (
              <div className='d-flex align-items-center'>
                {" "}
                <div className='red-blob'> </div>
                <span>Server is down!</span>
              </div>
            )}
          </div>
        </div>
        <div className='row h-75 border border-2 rounded'>
          <div className='col-4 col-md-3 border-end border-2 p-2 h-100 overflow-scroll'>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId='notes-list'>
                {(provided) => (
                  <ul className='m-0 p-0' {...provided.droppableProps} ref={provided.innerRef}>
                    {notes
                      .sort((a, b) => {
                        if (a.order < b.order) return -1;
                        else if (b.order < a.order) return 1;
                        else return 0;
                      })
                      .map((e, index) => {
                        return (
                          <Draggable key={e._id} draggableId={e._id} index={index}>
                            {(provided) => (
                              <li
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                                {...provided.dragHandleProps}
                                className={e._id === currentNote._id ? "active" : ""}
                                onClick={() => {
                                  setCurrentNote(e);
                                }}
                              >
                                {e.content}
                              </li>
                            )}
                          </Draggable>
                        );
                      })}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          <div className='col-5 col-md-6 p-2 h-100 overflow-scroll'>
            <div className='d-flex justify-content-between' role='button' onClick={handleDelete}>
              {notes.length !== 0 && (
                <div>
                  <img src={trashIcon} alt='trash-icon' />
                </div>
              )}
              <small>{currentNote.createdAt?.replace(/T/, " / ").replace(/\..+/, "")}</small>
            </div>
            <textarea name='content' ref={textAreaRef} value={currentNote.content ?? ""} onChange={(e) => handleChange(e, currentNote)}></textarea>
          </div>
          <div className='col-3 border-start border-2 p-2 h-100 overflow-scroll'>
            <h6 className='text-center'>Markdown live previewer</h6>
            <ReactMarkdown remarkPlugins={[gfm]} children={currentNote.content ?? ""} />
          </div>
        </div>
        <h4 className='lead text-center mt-3'>Developed by Kushtrim Bytyqi</h4>
      </div>
      {Prompt}
    </ErrorBoundary>
  );
};

export default App;
