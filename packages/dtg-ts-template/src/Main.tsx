import React, {CSSProperties} from 'react';
import {AddTodoPanel} from "./components/AddTodoPanel.jsx";
import {TodoList} from "./components/TodoList.jsx";


export const Main: React.FC = () => {
    return (
        <div style={styles.main}>
            <AddTodoPanel/>
            <TodoList/>
        </div>
    );
};

const styles: Record<string, CSSProperties> = {
    main: {
        backgroundColor: '#eee',
        height: '100%',
        padding: 30,
        textAlign: 'center'
    },
    header: {
        color: '#100e54'
    }
}


