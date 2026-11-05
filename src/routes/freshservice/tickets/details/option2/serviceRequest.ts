import type { AttachmentRecord } from '../AttachmentsSection';
import type { RequestedItem } from '../RequestedItems';

/**
 * SR-4128's own catalog items and files, so the requested-items table, the
 * attachments and the conversation all describe the same three requests.
 * Option 1's defaults are left as they were.
 */

export const SR_ITEMS: RequestedItem[] = [
  { id: 'illustrator', name: 'Adobe Illustrator CC', artwork: 'Ai', artworkLabel: 'Adobe Illustrator', stage: 'Fulfilled' },
  { id: 'cash-request', name: 'Advance Cash Request', artwork: '\u{1FA99}', artworkLabel: 'Cash advance', stage: 'In progress' },
  { id: 'benefits-change', name: 'Benefits Change Request', artwork: '\u{1F3DD}\uFE0F', artworkLabel: 'Benefits change', stage: 'Requested' }
];

export const SR_ATTACHMENTS: AttachmentRecord[] = [
  {
    id: 'offsite-itinerary',
    name: 'offsite-itinerary.pdf',
    sizeLabel: '96 KB',
    at: '2026-10-19T09:05:00-07:00',
    attachedBy: 'Megan Brooks'
  },
  {
    id: 'licence-approval',
    name: 'Illustrator licence approval.pdf',
    sizeLabel: '48 KB',
    at: '2026-10-19T09:31:00-07:00',
    attachedBy: 'System',
    restricted: true
  },
  {
    id: 'advance-form',
    name: 'Travel advance claim form.pdf',
    sizeLabel: '112 KB',
    at: '2026-10-19T09:36:00-07:00',
    attachedBy: 'Ticket Resolver'
  }
];
