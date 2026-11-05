import type { Actor, MessageNode, RootCauseCard, SummaryCard, TicketDetailsTab } from '../types';

/**
 * INC-4160 · rich content cases. One message per case, so each can be read on
 * its own: formatted text, code, images, tables, pasted mail, quoted chains,
 * long and international text, and what happens when content is unsafe or broken.
 * Every body is HTML, shown through the sanitiser in a neutral content well.
 */

const PRIYA: Actor = { kind: 'requester', id: 'u-priya', name: 'Priya Nair', title: 'Data Engineer · Chennai' };
const JORDAN: Actor = { kind: 'agent', id: 'a-jordan', name: 'Jordan Reyes' };

const SCREENSHOT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAADICAIAAABK7OzYAAACKUlEQVR42u3UoQ2AMBBA0RuGEZD1XR2NqesYgGQDkhMNobzkTfDFj2WtACkhAWAcgHEAxgEYB2AcAMYBGAdgHIBxAMYBYByAcQDGARgHYBwAxgEYB2AcgHEAxgEYB4BxAIPHsbcOkBLHeQGkGAdgHIBxAMYBGAdgHADGARgHYByAcQDGAWAcgHEAxgEYB2AcAMYBGAdgHIBxAMYBGIcKgHEAxgEYB2AcgHEAGAdgHIBxAMYBGAeAcQDGARgHYByAcQAYB2AcgHEAxgEYB2AcAMYBGAcw1Ti2UoAvMg7AOADjAIzDOMA4jAOMwzgA4wCMAzAO9cE4jAOMwzgA4wCMAzAOwDiMA4zDOADjAIwDMA7AOIwDjMM4wDiMAzAOwDgA4zAOMA7jAOMwDsA4AOMAjAMwDuMA4zAOwDgA4wCMAzAO4wDjMA7AOADjAIwDMA7jAOMwDjAO4wCMAzAOwDiMA4zDOMA4jAMwDsA4AOMAjMM4wDiMAzAOwDgA4wCMwzjAOIwDeHscwA8ZB2AcgHEAxgEYB2AcAMYBGAdgHIBxAMYBYByAcQDGARgHYBwAxgEYB2AcgHEAxgEYhwqAcQDGARgHYByAcQAYB2AcgHEAxgEYB4BxAMYBGAdgHIBxABgHYByAcQDGARgHYBwAxgEYB2AcgHEAxgFgHIBxAMYBGAdgHADGARgHYByAcQDGAWAcgHEAxgEYB2AcgHEAGAdgHIBxAMYBGAfAgxui9BPw7QYMqwAAAABJRU5ErkJggg==';
const LOG = `2026-10-19 08:10:00 INFO  sync-agent[3100] heartbeat ok latency=20ms\n2026-10-19 08:10:07 INFO  sync-agent[3101] heartbeat ok latency=21ms\n2026-10-19 08:10:14 INFO  sync-agent[3102] heartbeat ok latency=22ms\n2026-10-19 08:10:21 INFO  sync-agent[3103] heartbeat ok latency=23ms\n2026-10-19 08:10:28 INFO  sync-agent[3104] heartbeat ok latency=24ms\n2026-10-19 08:10:35 INFO  sync-agent[3105] heartbeat ok latency=25ms\n2026-10-19 08:11:42 INFO  sync-agent[3106] heartbeat ok latency=26ms\n2026-10-19 08:11:49 INFO  sync-agent[3107] heartbeat ok latency=27ms\n2026-10-19 08:11:56 INFO  sync-agent[3108] heartbeat ok latency=28ms\n2026-10-19 08:11:03 INFO  sync-agent[3109] heartbeat ok latency=20ms\n2026-10-19 08:11:10 INFO  sync-agent[3110] heartbeat ok latency=21ms\n2026-10-19 08:11:17 INFO  sync-agent[3111] heartbeat ok latency=22ms\n2026-10-19 08:12:24 INFO  sync-agent[3112] heartbeat ok latency=23ms\n2026-10-19 08:12:31 INFO  sync-agent[3113] heartbeat ok latency=24ms\n2026-10-19 08:12:38 INFO  sync-agent[3114] heartbeat ok latency=25ms\n2026-10-19 08:12:45 INFO  sync-agent[3115] heartbeat ok latency=26ms\n2026-10-19 08:12:52 INFO  sync-agent[3116] heartbeat ok latency=27ms\n2026-10-19 08:12:59 INFO  sync-agent[3117] heartbeat ok latency=28ms\n2026-10-19 08:13:06 INFO  sync-agent[3118] heartbeat ok latency=20ms\n2026-10-19 08:13:13 INFO  sync-agent[3119] heartbeat ok latency=21ms\n2026-10-19 08:13:20 INFO  sync-agent[3120] heartbeat ok latency=22ms\n2026-10-19 08:13:27 INFO  sync-agent[3121] heartbeat ok latency=23ms\n2026-10-19 08:13:34 INFO  sync-agent[3122] heartbeat ok latency=24ms\n2026-10-19 08:13:41 INFO  sync-agent[3123] heartbeat ok latency=25ms\n2026-10-19 08:14:48 INFO  sync-agent[3124] heartbeat ok latency=26ms\n2026-10-19 08:14:55 INFO  sync-agent[3125] heartbeat ok latency=27ms\n2026-10-19 08:14:02 INFO  sync-agent[3126] heartbeat ok latency=28ms\n2026-10-19 08:14:09 INFO  sync-agent[3127] heartbeat ok latency=20ms\n2026-10-19 08:14:16 INFO  sync-agent[3128] heartbeat ok latency=21ms\n2026-10-19 08:14:23 INFO  sync-agent[3129] heartbeat ok latency=22ms\n2026-10-19 08:15:30 INFO  sync-agent[3130] heartbeat ok latency=23ms\n2026-10-19 08:15:37 INFO  sync-agent[3131] heartbeat ok latency=24ms\n2026-10-19 08:15:44 INFO  sync-agent[3132] heartbeat ok latency=25ms\n2026-10-19 08:15:51 INFO  sync-agent[3133] heartbeat ok latency=26ms\n2026-10-19 08:15:58 INFO  sync-agent[3134] heartbeat ok latency=27ms\n2026-10-19 08:15:05 INFO  sync-agent[3135] heartbeat ok latency=28ms\n2026-10-19 08:16:12 INFO  sync-agent[3136] heartbeat ok latency=20ms\n2026-10-19 08:16:19 INFO  sync-agent[3137] heartbeat ok latency=21ms\n2026-10-19 08:16:26 INFO  sync-agent[3138] heartbeat ok latency=22ms\n2026-10-19 08:16:33 INFO  sync-agent[3139] heartbeat ok latency=23ms\n2026-10-19 08:16:40 INFO  sync-agent[3140] heartbeat ok latency=24ms\n2026-10-19 08:16:47 INFO  sync-agent[3141] heartbeat ok latency=25ms\n2026-10-19 08:17:54 INFO  sync-agent[3142] heartbeat ok latency=26ms\n2026-10-19 08:17:01 INFO  sync-agent[3143] heartbeat ok latency=27ms\n2026-10-19 08:17:08 INFO  sync-agent[3144] heartbeat ok latency=28ms\n2026-10-19 08:17:15 INFO  sync-agent[3145] heartbeat ok latency=20ms\n2026-10-19 08:17:22 INFO  sync-agent[3146] heartbeat ok latency=21ms\n2026-10-19 08:17:29 INFO  sync-agent[3147] heartbeat ok latency=22ms`;

const msg = (
  id: string,
  minutes: number,
  variant: MessageNode['variant'],
  actor: Actor,
  plain: string,
  html: string
): MessageNode => ({
  kind: 'message',
  id,
  at: `2026-10-19T09:${String(minutes).padStart(2, '0')}:00-07:00`,
  variant,
  channel: 'email',
  actor,
  ...(variant === 'reply' ? { to: ['priya.nair@acme.com'] } : {}),
  body: [plain],
  html
});

export const INC_4160: TicketDetailsTab = {
  ticket: {
    id: 'INC-4160',
    type: 'incident',
    subject: 'Nightly sync job fails with a certificate error (rich content cases)',
    source: 'email',
    requester: PRIYA,
    assignee: JORDAN
  },
  viewer: { agent: JORDAN, lastSeenAt: '2026-10-19T09:00:00-07:00' },
  summary: { state: 'not-generated' },
  rootCause: { state: 'not-analyzed' },
  description: {
    body: ['Our nightly data sync has failed three nights in a row with a TLS error. Logs and a screenshot of the scheduler are in the messages below.'],
    attachments: [{ name: 'sync-agent.log', sizeLabel: '212 KB', snippet: LOG.split('\n').slice(0, 6).join('\n') }]
  },
  stream: [
    msg('r1', 5, 'requester-reply', PRIYA, 'Formatted text: steps, emphasis, links',
      `<p>Hi team, here is exactly what I did:</p>
<h3>Steps I tried</h3>
<ol><li>Restarted the <b>sync-agent</b> service</li><li>Re-ran the job with <i>verbose</i> logging</li><li>Checked the certificate in <a href="https://wiki.acme.com/pki/renewals">the PKI renewals page</a>
<ul><li>Expiry shows <u>Oct 18</u></li><li>Renewal ticket: <a href="https://acme.freshservice.com/tickets/CHG-2041">CHG-2041</a></li></ul></li></ol>
<blockquote>Note: it worked on Friday, so this looks like an expiry, not a config change.</blockquote>
<p>Anything strikethrough was already ruled out: <s>DNS</s>, <s>proxy</s>.</p>`),
    msg('a1', 12, 'reply', JORDAN, 'Code snippets: inline and a block with a long line',
      `<p>Thanks, Priya. Could you run <code>openssl s_client -connect sync.acme.com:443</code> and send the result? To check the agent's trust store:</p>
<pre><code>$store = "Cert:\\LocalMachine\\Root"
Get-ChildItem $store | Where-Object { $_.NotAfter -lt (Get-Date) } | Select-Object Subject, NotAfter, Thumbprint | Format-Table -AutoSize | Out-String -Width 4096
if ($LASTEXITCODE -ne 0) { Write-Error "Trust store check failed with exit code $LASTEXITCODE; see sync-agent.log for the full certificate chain" }</code></pre>
<p>The block keeps its spacing and scrolls sideways; the Copy button copies it exactly.</p>`),
    msg('r2', 20, 'requester-reply', PRIYA, 'Image: inline screenshot, and one that fails to load',
      `<p>Here is the scheduler screen when it fails:</p>
<img src="{SHOT}" alt="Scheduler showing a red error band">
<p>And the one from the monitoring dashboard (the link seems to be dead):</p>
<img src="https://monitoring.invalid/screens/sync-0431.png" alt="Monitoring dashboard 04:31">`.replace('{SHOT}', SCREENSHOT)),
    msg('n1', 26, 'private-note', JORDAN, 'Table: wide table inside a note',
      `<p>Failures so far (scrolls sideways if the card is narrow):</p>
<table><thead><tr><th>Night</th><th>Start</th><th>Duration</th><th>Records synced</th><th>Error</th><th>Retries</th><th>Host</th></tr></thead>
<tbody><tr><td>Oct 16</td><td>02:00</td><td>41 min</td><td>1,204,330</td><td>none</td><td>0</td><td>sync-01.acme.com</td></tr>
<tr><td>Oct 17</td><td>02:00</td><td>2 min</td><td>0</td><td>TLS: certificate has expired</td><td>3</td><td>sync-01.acme.com</td></tr>
<tr><td>Oct 18</td><td>02:00</td><td>2 min</td><td>0</td><td>TLS: certificate has expired</td><td>3</td><td>sync-01.acme.com</td></tr></tbody></table>`),
    msg('r3', 33, 'requester-reply', PRIYA, 'Pasted from Outlook: foreign colours, fonts and scripts are removed',
      `<div style="background:#1b1b1b;color:#ffffff;font-family:'Comic Sans MS';font-size:11px"><font color="#00ff00" face="Papyrus"><p style="color:white;background:black">Forwarding what our vendor sent:</p>
<p><span style="color:#ff00ff;font-size:28px">Your certificate expires soon!</span></p>
<p>Click <a href="javascript:alert(1)">here</a> or open <a href="https://vendor.example.com/renew">the renewal portal</a>.</p></font></div>
<script>alert('x')</script><img src="x" onerror="alert(1)"><iframe src="https://evil.example"></iframe>`),
    msg('r4', 41, 'requester-reply', PRIYA, 'Quoted email chain, long unbroken strings',
      `<p>Adding the thread from our vendor below.</p>
<blockquote><p><b>From:</b> support@certvendor.com<br><b>Sent:</b> Oct 17, 2026</p><p>Your order was received. Reference: ORD-7f3c9a1e5b2d4c6f8a0e1b3d5f7a9c2e4b6d8f0a1c3e5a7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c2e4b6d8f0a</p>
<blockquote><p>On Oct 15, Priya Nair wrote: Please renew the certificate for sync.acme.com.</p></blockquote></blockquote>`),
    msg('a2', 48, 'reply', JORDAN, 'Emoji, right-to-left text, nested lists and a rule',
      `<p>Thanks for the details 🙏 — the cause is confirmed ✅</p>
<p dir="rtl">شكرًا لك، تم تحديث الشهادة وإعادة تشغيل الخدمة.</p>
<p>Next:</p>
<ul><li>Renew certificate
<ol><li>Request from PKI</li><li>Install on <code>sync-01</code></li></ol></li><li>Re-run tonight's job</li></ul>
<hr>
<p>日本語のテキストも正しく表示されます。</p>`),
    msg('n2', 55, 'private-note', JORDAN, 'Large log excerpt: tall code is capped and scrolls',
      `<p>Full log excerpt (capped at a fixed height, scrolls in the block):</p><pre><code>${LOG.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code></pre>`)
  ]
};

export const INC_4160_SUMMARY: SummaryCard = {
  state: 'ready',
  title: 'Priya’s nightly sync fails on an expired certificate',
  reason: 'on-demand',
  updatedBy: { kind: 'copilot', name: 'Agent Concierge' },
  issue: ['The nightly data sync has failed three nights in a row with a TLS “certificate has expired” error. Priya shared logs, a scheduler screenshot and a vendor email.'],
  tried: [
    ['Priya restarted the sync-agent service and re-ran the job with verbose logging.'],
    ['Jordan asked for the openssl output and a trust-store check.']
  ],
  standing: ['Certificate renewal (CHG-2041) is pending; the next run is tonight at 02:00.'],
  strip: 'Nightly sync fails on an expired certificate. Renewal CHG-2041 is pending.',
  basedOn: { messages: 8, actions: 0 }
};

export const INC_4160_ROOT_CAUSE: RootCauseCard = {
  state: 'found',
  title: 'The sync certificate expired on Oct 18',
  reasoning: 'The logs show “certificate has expired” from Oct 17, and the PKI page lists the renewal as open.',
  cause: ['The TLS certificate for sync.acme.com expired and the renewal in CHG-2041 was not completed.'],
  evidence: [['Three failed runs with the same TLS error.'], ['The PKI renewals page lists CHG-2041 as open.']],
  confidence: { score: 0.91, threshold: 0.75, band: 'high' },
  fix: {
    title: 'Complete the certificate renewal and re-run the job',
    via: { kind: 'workflow', name: 'Renew certificate (PKI)' },
    status: 'proposed',
    nextStep: ['Ask PKI to finish CHG-2041, install the certificate on sync-01, then re-run the job.'],
    recommended: [['Finish CHG-2041.'], ['Install the certificate on sync-01.'], ['Re-run the nightly job.']]
  }
};
