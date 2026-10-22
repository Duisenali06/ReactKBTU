import { useState } from 'react'
import {TodoItem} from './TodoItem'

function App() {
    console.log('render App')

    const [items, setItems] = useState([])
    const [input, setInput] = useState('')
    const [filter, setFilter] = useState('all') // 'all' | 'active' | 'done'

    const addItem = () => {
        if (input.trim()) {
            setItems([...items, { id: Date.now(), item: input.trim(), status: false }])
            setInput('')
        }
    }

    const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

    const toggleStatus = (id) =>
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: !i.status } : i)))

    const editItem = (id, newText) =>
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, item: newText } : i)))

    const reverseList = () => setItems((prev) => [...prev].reverse())

    const matchesFilter = (i) =>
        filter === 'all' || (filter === 'active' ? !i.status : i.status)


    const visibleIds = items.filter(matchesFilter).map((i) => i.id)

    const moveItem = (id, dir) => {
        const vIndex = visibleIds.indexOf(id)
        const neighborId = visibleIds[vIndex + dir]
        if (neighborId === undefined) return

        setItems((prev) => {
            const next = [...prev]
            const a = next.findIndex((i) => i.id === id)
            const b = next.findIndex((i) => i.id === neighborId)
            ;[next[a], next[b]] = [next[b], next[a]]
            return next
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md">
                <h1 className="text-3xl text-center font-bold mb-6">TO-DO</h1>

                <div className="flex mb-4">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addItem()}
                        className="border px-3 py-2 rounded-l-lg flex-1"
                        type="text"
                        placeholder="Add a new item"
                    />
                    <button onClick={addItem} className="bg-black text-white px-3 py-2 rounded-r-lg">
                        Add
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm">
                    {['all', 'active', 'done'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-full border ${
                                filter === f ? 'bg-black text-white' : ''
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                    <button onClick={reverseList} className="ml-auto border px-3 py-1 rounded-full">
                        Reverse
                    </button>
                </div>

                <ul className="space-y-2">
                    {items.map((i) => (
                        <TodoItem
                            key={i.id}
                            item={i}
                            hidden={!matchesFilter(i)}
                            canMoveUp={visibleIds.indexOf(i.id) > 0}
                            canMoveDown={visibleIds.indexOf(i.id) < visibleIds.length - 1}
                            onToggle={toggleStatus}
                            onRemove={removeItem}
                            onEdit={editItem}
                            onMove={moveItem}
                        />
                    ))}
                </ul>

                {visibleIds.length === 0 && (
                    <p className="text-center text-gray-400 mt-4">Nothing here yet</p>
                )}
            </div>
        </div>
    )
}

export default App