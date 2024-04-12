import { useSelector } from 'react-redux';
import { getOfflineSyncOutbox } from '../slices/selectors';

export default function RequestsQueue() {
  const outbox = useSelector(getOfflineSyncOutbox);

  if (outbox?.length === 0) {
    return <p>There are no pending requests</p>;
  }

  return (
    <ul>
      {outbox?.map((action) => (
        <li key={action.meta.offlineSync.syncUuid}>
          <span>{action.type}</span>
          <span>#{action.meta.offlineSync.syncUuid}</span>
        </li>
      ))}
    </ul>
  );
}
