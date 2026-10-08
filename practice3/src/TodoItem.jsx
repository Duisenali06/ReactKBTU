import {useState} from "react";
export function TodoItem({
                      item,
                      hidden,
                      canMoveUp,
                      canMoveDown,
                      onToggle,
                      onRemove,
                      onEdit,
                      onMove,
                  }) {
    console.log('render TodoItem:', item.id, item.item)


    const [note, setNote] = useState('')
    const [showNote, setShowNote] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [draft, setDraft] = useState(item.item)

    const saveEdit = () => {
        if (draft.trim()) {
            onEdit(item.id, draft.trim())
            setIsEditing(false)
        }
    }


    const resetLocal = () => {
        setNote('')
        setShowNote(false)
        setIsEditing(false)
        setDraft(item.item)
    }

    return (
        <li className={`border rounded-lg p-3 ${hidden ? 'hidden' : ''}`}>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={item.status}
                    onChange={() => onToggle(item.id)}
                />

                {isEditing ? (
                    <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        className="border px-2 py-1 rounded flex-1"
                        autoFocus
                    />
                ) : (
                    <span className={`flex-1 ${item.status ? 'line-through text-gray-400' : ''}`}>
            {item.item}
          </span>
                )}

                <button
                    onClick={() => onMove(item.id, -1)}
                    disabled={!canMoveUp}
                    className="px-1 disabled:opacity-30"
                    title="Вверх"
                >
                    ↑
                </button>
                <button
                    onClick={() => onMove(item.id, 1)}
                    disabled={!canMoveDown}
                    className="px-1 disabled:opacity-30"
                    title="Вниз"
                >
                    ↓
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2 text-sm">
                {isEditing ? (
                    <button onClick={saveEdit} className="bg-black text-white px-2 py-1 rounded">
                        Save
                    </button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="border px-2 py-1 rounded">
                        Edit
                    </button>
                )}
                <button onClick={() => setShowNote((s) => !s)} className="border px-2 py-1 rounded">
                    {showNote ? 'Hide note' : 'Note'}
                </button>
                <button onClick={resetLocal} className="border px-2 py-1 rounded">
                    Reset local
                </button>
                <button onClick={() => onRemove(item.id)} className="border border-red-500 text-red-500 px-2 py-1 rounded ml-auto">
                    Remove
                </button>
            </div>

            {showNote && (
                <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Local note..."
                    className="border px-2 py-1 rounded w-full mt-2 text-sm"
                />
            )}
        </li>
    )
}