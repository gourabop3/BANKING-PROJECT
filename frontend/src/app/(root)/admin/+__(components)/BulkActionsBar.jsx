export default function BulkActionsBar({ selectedCount, onBulkBlock, onBulkUnblock }) {
  if (selectedCount === 0) return null;
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded px-6 py-3 flex gap-4 items-center z-40">
      <span>{selectedCount} selected</span>
      <button onClick={onBulkBlock} className="bg-red-600 text-white px-4 py-2 rounded">Block</button>
      <button onClick={onBulkUnblock} className="bg-green-600 text-white px-4 py-2 rounded">Unblock</button>
    </div>
  );
}