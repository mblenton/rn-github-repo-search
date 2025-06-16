import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function formatLastUpdated(isoString: string): string {
  const date = dayjs(isoString);

  if (!date.isValid()) {
    return 'Date unavailable';
  }

  return `Updated ${date.fromNow()}`;
}
