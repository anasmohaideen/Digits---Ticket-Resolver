import type { TicketDetailsTab } from '../types';

/**
 * Rich bodies for the regular tickets, so formatting, code, images, lists and
 * quotes appear across the prototype and not only in INC-4160. Each entry
 * extends one existing message: its plain text stays, and the HTML adds the
 * rich part. Keyed "CODE:message id".
 */

const SCREENSHOT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAADICAIAAABK7OzYAAACKUlEQVR42u3UoQ2AMBBA0RuGEZD1XR2NqesYgGQDkhMNobzkTfDFj2WtACkhAWAcgHEAxgEYB2AcAMYBGAdgHIBxAMYBYByAcQDGARgHYBwAxgEYB2AcgHEAxgEYB4BxAIPHsbcOkBLHeQGkGAdgHIBxAMYBGAdgHADGARgHYByAcQDGAWAcgHEAxgEYB2AcAMYBGAdgHIBxAMYBGIcKgHEAxgEYB2AcgHEAGAdgHIBxAMYBGAeAcQDGARgHYByAcQAYB2AcgHEAxgEYB2AcAMYBGAcw1Ti2UoAvMg7AOADjAIzDOMA4jAOMwzgA4wCMAzAO9cE4jAOMwzgA4wCMAzAOwDiMA4zDOADjAIwDMA7AOIwDjMM4wDiMAzAOwDgA4zAOMA7jAOMwDsA4AOMAjAMwDuMA4zAOwDgA4wCMAzAO4wDjMA7AOADjAIwDMA7jAOMwDjAO4wCMAzAOwDiMA4zDOMA4jAMwDsA4AOMAjMM4wDiMAzAOwDgA4wCMwzjAOIwDeHscwA8ZB2AcgHEAxgEYB2AcAMYBGAdgHIBxAMYBYByAcQDGARgHYBwAxgEYB2AcgHEAxgEYhwqAcQDGARgHYByAcQAYB2AcgHEAxgEYB4BxAMYBGAdgHIBxABgHYByAcQDGARgHYBwAxgEYB2AcgHEAxgFgHIBxAMYBGAdgHADGARgHYByAcQDGAWAcgHEAxgEYB2AcgHEAGAdgHIBxAMYBGAfAgxui9BPw7QYMqwAAAABJRU5ErkJggg==';
const esc = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const para = (text: string) => `<p>${esc(text)}</p>`;

const RICH: Record<string, (plain: string) => string> = {
  'INC-4127:m3': (plain) => `${para(plain)}<img src="${SCREENSHOT}" alt="Wi-Fi error on the 3rd floor">`,
  'INC-4127:n1': (plain) =>
    `${para(plain)}<p>Checked the adapter with <code>Get-NetAdapter</code>:</p><pre><code>Get-NetAdapter | Where-Object Status -eq 'Up' | Format-Table Name, InterfaceDescription, LinkSpeed</code></pre>`,
  'INC-4127:r1': (plain) =>
    `${para(plain)}<ol><li>Forget <b>Corp-Secure</b> in Wi-Fi settings</li><li>Restart the Wi-Fi service</li><li>Rejoin using the new profile from <a href="https://kb.acme.com/wifi-profile">the KB article</a></li></ol>`,
  'INC-4140:f5': (plain) =>
    `${para(plain)}<pre><code>$ curl -v https://expenses.acme.com\n* Trying 10.20.4.18:443...\n* connect to 10.20.4.18 port 443 failed: Connection timed out</code></pre>`,
  'INC-4142:i5': (plain) =>
    `${para(plain)}<ul><li>Zoom <i>and</i> Teams</li><li>Charging via the dock</li><li><s>Battery health</s> (checked, normal)</li></ul>`,
  'INC-4150:y2': (plain) =>
    `<blockquote><p>On Oct 19, Jordan Reyes wrote: Could you confirm which folders and device are affected?</p></blockquote>${para(plain)}`,
  'INC-4155:g5': (plain) =>
    `${para(plain)}<img src="https://cdn.acme.invalid/screens/salesforce-refused.png" alt="Salesforce sign-in refused">`,
  'SR-4128:m3': (plain) =>
    `${para(plain)}<table><thead><tr><th>Item</th><th>Detail</th></tr></thead><tbody><tr><td>Software</td><td>Illustrator</td></tr><tr><td>Dates</td><td>Austin, 27th to 29th</td></tr></tbody></table>`
};

type Node = Record<string, unknown>;

function walk(value: unknown, code: string): unknown {
  if (Array.isArray(value)) return value.map((item) => walk(item, code));
  if (value && typeof value === 'object') {
    const node = value as Node;
    const next: Node = {};
    for (const key of Object.keys(node)) next[key] = walk(node[key], code);
    const make = node.kind === 'message' && typeof node.id === 'string' ? RICH[`${code}:${node.id}`] : undefined;
    if (make && Array.isArray(node.body)) {
      const plain = (node.body as unknown[]).filter((part): part is string => typeof part === 'string').join('\n');
      next.html = make(plain);
    }
    return next;
  }
  return value;
}

export function withRichContent(code: string, tab: TicketDetailsTab): TicketDetailsTab {
  return walk(tab, code) as TicketDetailsTab;
}
