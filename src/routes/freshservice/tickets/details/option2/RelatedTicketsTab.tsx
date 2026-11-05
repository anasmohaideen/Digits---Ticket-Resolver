import { Icon } from '@freshworks/dew-components';

/**
 * Option 2 · the Related tickets tab: one card per ticket the Digit compared
 * this one with, so "7 similar tickets" opens onto seven. The records are
 * sample data written to match each ticket's story.
 */

interface Related {
  code: string;
  subject: string;
  requester: string;
  when: string;
  status: 'Open' | 'Pending' | 'Resolved';
  agent: string;
  source: 'Slack' | 'Email' | 'Portal';
}

const RELATED: Record<string, Related[]> = {
  'INC-4127': [
    { code: 'INC-4098', subject: 'Corp-Secure says “certificate not trusted” on my MacBook', requester: 'Aisha Khan', when: '3 days ago', status: 'Resolved', agent: 'Jordan Reyes', source: 'Slack' },
    { code: 'INC-4101', subject: 'Can’t join Corp-Secure Wi-Fi since Friday [BR1]', requester: 'Liam Chen', when: '3 days ago', status: 'Resolved', agent: 'Sarah Kim', source: 'Email' },
    { code: 'INC-4105', subject: 'Wi-Fi keeps falling back to Guest on my work laptop', requester: 'Noor Rahman', when: '2 days ago', status: 'Resolved', agent: 'Jordan Reyes', source: 'Slack' },
    { code: 'INC-4112', subject: 'Intune certificate missing after macOS update', requester: 'Tomás Rivera', when: '2 days ago', status: 'Open', agent: 'Alex Patel', source: 'Portal' },
    { code: 'INC-4117', subject: 'Jira and Confluence unreachable on Guest Wi-Fi', requester: 'Hannah Lee', when: 'Yesterday', status: 'Pending', agent: 'Jordan Reyes', source: 'Slack' },
    { code: 'INC-4121', subject: 'Corp-Secure: “Unable to join the network” [BR2]', requester: 'Omar Haddad', when: 'Yesterday', status: 'Open', agent: 'Sarah Kim', source: 'Email' },
    { code: 'INC-4124', subject: 'Network profile not installed on new MacBook Pro', requester: 'Ines Duarte', when: '5 hours ago', status: 'Open', agent: 'Alex Patel', source: 'Slack' }
  ],
  'INC-4140': [
    { code: 'INC-4136', subject: 'Expense app times out from the San Mateo office', requester: 'Daniela Ruiz', when: '3 hours ago', status: 'Open', agent: 'Jordan Reyes', source: 'Slack' },
    { code: 'INC-4138', subject: 'Can’t submit expenses on office Wi-Fi, fine on my phone', requester: 'Kevin Park', when: '2 hours ago', status: 'Open', agent: 'Jordan Reyes', source: 'Email' },
    { code: 'INC-4139', subject: 'Expense app shows a gateway error at my desk', requester: 'Sara Idowu', when: '1 hour ago', status: 'Pending', agent: 'Alex Patel', source: 'Portal' }
  ],
  'INC-4150': [
    { code: 'INC-4077', subject: 'No access to the Legal shared drive after joining the team', requester: 'Amelia Cross', when: '5 weeks ago', status: 'Resolved', agent: 'Sarah Kim', source: 'Email' },
    { code: 'INC-4103', subject: 'Moved to Marketing, still can’t open the campaign folder', requester: 'Dev Malhotra', when: '2 weeks ago', status: 'Resolved', agent: 'Jordan Reyes', source: 'Email' }
  ],
  'INC-4155': [
    { code: 'INC-4091', subject: 'Locked out of Salesforce after a password reset', requester: 'Mei Tanaka', when: '3 weeks ago', status: 'Resolved', agent: 'Sarah Kim', source: 'Email' },
    { code: 'INC-4112', subject: 'Okta account locked, can’t reach the CRM', requester: 'Gabriel Santos', when: '12 days ago', status: 'Resolved', agent: 'Jordan Reyes', source: 'Slack' }
  ],
  'INC-4142': [
    { code: 'INC-3987', subject: 'MacBook Pro restarts when the dock is connected', requester: 'Chloe Martin', when: '3 weeks ago', status: 'Resolved', agent: 'Lena Brauer', source: 'Email' },
    { code: 'INC-4044', subject: 'Laptop reboots during Zoom with external monitors', requester: 'Ravi Patel', when: '9 days ago', status: 'Pending', agent: 'Lena Brauer', source: 'Slack' }
  ]
};

const SOURCE_ICON = { Slack: 'Conversation', Email: 'Email', Portal: 'Portal' } as const;

export default function RelatedTicketsTab({ ticketCode }: { ticketCode: string }) {
  const items = RELATED[ticketCode] ?? [];
  if (items.length === 0) {
    return (
      <div className="tr-o2-related-empty">
        <p>No related tickets found for this ticket.</p>
      </div>
    );
  }
  return (
    <div className="tr-o2-related">
      <h2 className="tr-o2-related-title">Related tickets ({items.length})</h2>
      <ul className="tr-o2-related-list">
        {items.map((item) => (
          <li key={item.code} className="tr-o2-related-card">
            <span className="tr-o2-related-tile" aria-hidden><Icon name="Tickets" size="md" color="var(--color-icon-semantic-info)" /></span>
            <div className="tr-o2-related-main">
              <div className="tr-o2-related-line">
                <span className="tr-o2-related-source" aria-label={`From ${item.source}`}><Icon name={SOURCE_ICON[item.source]} size="sm" color="var(--color-icon-semantic-success)" /></span>
                <span className="tr-o2-related-code">#{item.code}</span>
                <a className="tr-o2-related-subject" href="about:blank" target="_blank" rel="noopener noreferrer">{item.subject}</a>
              </div>
              <div className="tr-o2-related-sub">{item.requester}<span aria-hidden className="tr-o2-related-dot" />{item.when}</div>
            </div>
            <dl className="tr-o2-related-facts">
              <div><dt>Status</dt><dd>{item.status}</dd></div>
              <div><dt>Agent</dt><dd>{item.agent}</dd></div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
