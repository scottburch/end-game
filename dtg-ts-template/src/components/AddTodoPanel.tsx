import {useGraphPut} from "@end-game/react-graph";
import type {Todo} from "../types/Todo.jsx";
import {useState} from "react";
import React from 'react';

export const AddTodoPanel: React.FC = () => {
    const graphPut = useGraphPut<Todo>();
    const [values, setValues] = useState<Todo>();

    const addTodo = () => {
        graphPut('todo', '', values as Todo).subscribe();
    }

    return (
        <>
            <label>Task: </label>
            <input onBlur={ev => setValues({...values, task: ev.target.value})}/>
            <button onClick={addTodo}>Add Todo</button>
        </>
    );
}