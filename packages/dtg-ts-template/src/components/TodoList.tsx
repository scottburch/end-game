import {useGraphNodesByLabel} from "@end-game/react-graph";
import React from 'react';
import {Todo} from "../types/Todo.js";

export const TodoList: React.FC = () => {
    const todos = useGraphNodesByLabel<Todo>('todo');

    return (
        <>
            {todos?.map(todo => <div key={todo.nodeId}>{todo.props.task}</div>)}
        </>
    )
}