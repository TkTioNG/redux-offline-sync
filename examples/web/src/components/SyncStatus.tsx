import { useSelector } from 'react-redux';
import * as selectors from '../slices/selectors';

export default function SyncStatus() {
  const busy = useSelector(selectors.getOfflineSyncBusy);
  const retryScheduled = useSelector(selectors.getOfflineSyncRetryScheduled);
  const attempt = useSelector(selectors.getOfflineSyncRetryCount);

  if (!busy && !retryScheduled) {
    return <p>Synced</p>;
  } else if (busy) {
    return <p>Waiting on request - Attempt #{attempt}</p>;
  }
  return (
    <p>
      Waiting on retry: {'timer'}s - Attempt #{attempt}
    </p>
  );
}
