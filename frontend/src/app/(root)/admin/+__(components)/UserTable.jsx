export default function UserTable({ users, selectedIds, onSelect, onBlock, onUnblock, onReset, onView }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th><input type="checkbox" onChange={e => onSelect('all', e.target.checked)} /></th>
          <th>Name</th><th>Email</th><th>Status</th><th>KYC</th><th>Joined</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user._id}>
            <td>
              <input
                type="checkbox"
                checked={selectedIds.includes(user._id)}
                onChange={e => onSelect(user._id, e.target.checked)}
              />
            </td>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
              <span className={user.isBlocked ? 'text-red-600' : 'text-green-600'}>
                {user.isBlocked ? 'Blocked' : 'Active'}
              </span>
            </td>
            <td>{user.kyc_status}</td>
            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
              {user.isBlocked
                ? <button onClick={() => onUnblock(user._id)}>Unblock</button>
                : <button onClick={() => onBlock(user._id)}>Block</button>}
              <button onClick={() => onReset(user._id)}>Reset</button>
              <button onClick={() => onView(user._id)}>View</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}