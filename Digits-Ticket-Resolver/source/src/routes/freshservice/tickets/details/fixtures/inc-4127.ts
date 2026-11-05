import type { TicketDetailsTab } from '../types';

/**
 * Main scenario: a Slack incident Ticket Resolver worked, then handed over as
 * Blocked. Adapted from `docs/tr-details-handoff/data/inc-4127.slack-handover.json`;
 * typing it as `TicketDetailsTab` is what keeps the contract honest.
 */
export const INC_4127: TicketDetailsTab = {
  "ticket": {
    "id": "INC-4127",
    "type": "incident",
    "subject": "Can’t connect to Corp-Secure Wi-Fi [BR1]",
    "source": "slack",
    "requester": {
      "kind": "requester",
      "id": "u-megan",
      "name": "Megan Brooks",
      "title": "Product Analyst · San Mateo HQ"
    },
    "assignee": {
      "kind": "agent",
      "id": "a-jordan",
      "name": "Jordan Reyes"
    },
    "createdBy": {
      "kind": "digit",
      "digit": "ticket-resolver",
      "name": "Ticket Resolver"
    }
  },
  "viewer": {
    "agent": {
      "kind": "agent",
      "id": "a-jordan",
      "name": "Jordan Reyes"
    }
  },
  "summary": {
    "state": "ready",
    "title": "Megan can’t join Corp-Secure Wi-Fi",
    "updatedAt": "2026-10-19T09:35:00-07:00",
    "updatedBy": {
      "kind": "digit",
      "digit": "ticket-resolver",
      "name": "Ticket Resolver"
    },
    "reason": "handover",
    "issue": [
      "Megan’s MacBook can’t join Corp-Secure Wi-Fi on the 3rd floor of San Mateo HQ and shows “Unable to join the network.” Guest Wi-Fi works. Only her laptop is affected."
    ],
    "tried": [
      [
        "Knowledge-base steps (forget the network, restart Wi-Fi, rejoin): didn’t help."
      ],
      [
        "Ticket Resolver found the cause and ran the certificate workflow after your approval. The last step failed."
      ]
    ],
    "standing": [
      "Handed over to the Network Team at 9:35 AM. Megan has a client demo at 11."
    ],
    "strip": "KB steps didn’t help. Ticket Resolver found the cause and ran the fix; the last step failed.",
    "basedOn": {
      "messages": 8,
      "actions": 19
    }
  },
  "rootCause": {
    "state": "found",
    "title": "Wi-Fi certificate not renewed after CHG-2187",
    "at": "2026-10-19T09:21:00-07:00",
    "by": {
      "kind": "digit",
      "digit": "ticket-resolver",
      "name": "Ticket Resolver"
    },
    "cause": [
      "Megan’s laptop most likely didn’t renew its Wi-Fi certificate after ",
      {
        "label": "CHG-2187",
        "to": {
          "type": "change",
          "id": "CHG-2187"
        }
      },
      " rotated the certificate authority in Intune on Fri, Oct 16, so Corp-Secure rejects it."
    ],
    "evidence": [
      [
        {
          "label": "7 similar tickets",
          "to": {
            "type": "related-tickets"
          }
        },
        " since Friday, all on Intune-managed Macs. 3 were fixed by re-issuing the certificate."
      ],
      [
        {
          "label": "CHG-2187",
          "to": {
            "type": "change",
            "id": "CHG-2187"
          }
        },
        " · certificate authority rotated in Intune on Fri, Oct 16."
      ],
      [
        "Megan said only her laptop is affected."
      ]
    ],
    "confidence": {
      "score": 0.84,
      "threshold": 0.75,
      "band": "high"
    },
    "reasoning": "All 7 similar tickets are on Intune-managed Macs and started after CHG-2187 rotated the certificate authority on Friday. 3 were fixed by re-issuing the certificate. Only Megan’s laptop is affected, so its certificate most likely didn’t renew.",
    "fix": {
      "title": "Re-issue Megan’s Wi-Fi certificate",
      "via": {
        "kind": "workflow",
        "name": "Re-issue Wi-Fi certificate (macOS)"
      },
      "recommended": [
        [
          "Assign the “Corp-Secure Wi-Fi (2026)” profile to ",
          { "label": "ASSET-2291", "to": { "type": "asset", "id": "ASSET-2291" } },
          " in Microsoft Intune."
        ],
        ["Ask Megan to restart her MacBook and rejoin Corp-Secure."],
        ["Confirm Jira and her other internal tools load."]
      ],
      "status": "blocked",
      "approver": {
        "kind": "agent",
        "id": "a-jordan",
        "name": "Jordan Reyes"
      },
      "steps": [
        {
          "label": "Approved by Jordan Reyes · 9:31 AM",
          "status": "done"
        },
        {
          "label": "Revoked the old certificate in Microsoft Intune",
          "status": "done"
        },
        {
          "label": "Assign the new Corp-Secure Wi-Fi profile",
          "status": "failed",
          "detail": "permission denied"
        },
        {
          "label": "Confirm the laptop checked in",
          "status": "skipped",
          "detail": "not run"
        }
      ],
      "nextStep": [
        "Assign the Corp-Secure Wi-Fi profile to ",
        {
          "label": "ASSET-2291",
          "to": {
            "type": "asset",
            "id": "ASSET-2291"
          }
        },
        " in Intune, then ask Megan to rejoin and confirm Jira loads."
      ],
      "eventId": "e-wf"
    }
  },
  "description": {
    "brief": "Megan can’t connect to Corp-Secure Wi-Fi on her MacBook. She’s on Guest Wi-Fi, so Jira and her other internal tools won’t load.",
    "origin": "From Megan’s first Slack message",
    "body": [
      "Hi, my laptop keeps dropping off Corp-Secure Wi-Fi on the 3rd floor. Now it just says “Unable to join the network.” Guest Wi-Fi works, but I can’t get into Jira or any internal tools."
    ],
    "attachments": [
      {
        "name": "wifi-error.png",
        "sizeLabel": "184 KB"
      }
    ]
  },
  "stream": [
    {
      "kind": "group",
      "id": "g-run",
      "level": "run",
      "actor": {
        "kind": "digit",
        "digit": "ticket-resolver",
        "name": "Ticket Resolver"
      },
      "title": "Ticket Resolver worked on this before you",
      "start": "2026-10-19T09:12:00-07:00",
      "end": "2026-10-19T09:35:00-07:00",
      "meta": "8 messages with Megan in Slack · 19 actions",
      "outcomes": [
        {
          "label": "Deflection · didn’t resolve",
          "tone": "neutral"
        },
        {
          "label": "Triage · 5 fields set",
          "tone": "neutral"
        },
        {
          "label": "Root cause · High",
          "tone": "success"
        },
        {
          "label": "Resolution · approved, then blocked",
          "tone": "warning"
        }
      ],
      "defaultOpen": false,
      "children": [
        {
          "kind": "group",
          "id": "p-before",
          "level": "phase",
          "actor": {
            "kind": "digit",
            "digit": "ticket-resolver",
            "name": "Ticket Resolver"
          },
          "title": "Before the ticket",
          "start": "2026-10-19T09:12:00-07:00",
          "end": "2026-10-19T09:17:00-07:00",
          "meta": "Slack conversation · 5 messages",
          "outcomes": [
            {
              "label": "Deflection didn’t resolve",
              "tone": "neutral"
            }
          ],
          "defaultOpen": false,
          "children": [
            {
              "kind": "message",
              "id": "m1",
              "at": "2026-10-19T09:12:00-07:00",
              "variant": "requester-reply",
              "channel": "slack",
              "actor": {
                "kind": "requester",
                "id": "u-megan",
                "name": "Megan Brooks"
              },
              "body": [
                "Hi, my laptop keeps dropping off Corp-Secure Wi-Fi on the 3rd floor. Now it just says “Unable to join the network.” Guest Wi-Fi works, but I can’t get into Jira or any internal tools."
              ],
              "attachments": [
                {
                  "name": "wifi-error.png",
                  "sizeLabel": "184 KB"
                }
              ]
            },
            {
              "kind": "message",
              "id": "m2",
              "at": "2026-10-19T09:12:30-07:00",
              "variant": "concierge-message",
              "channel": "slack",
              "via": "workplace-concierge",
              "actor": {
                "kind": "digit",
                "digit": "workplace-concierge",
                "name": "Workplace Concierge"
              },
              "body": [
                "Thanks, Megan. Quick check so I get this to the right place: is it only your laptop, or are people around you having trouble too?"
              ]
            },
            {
              "kind": "message",
              "id": "m3",
              "at": "2026-10-19T09:13:00-07:00",
              "variant": "requester-reply",
              "channel": "slack",
              "actor": {
                "kind": "requester",
                "id": "u-megan",
                "name": "Megan Brooks"
              },
              "body": [
                "Just me, I think. My teammates next to me are fine."
              ]
            },
            {
              "kind": "event",
              "id": "e-deleg",
              "intent": "Megan says only her laptop is affected. I should route this to Ticket Resolver and check the Wi-Fi guidance for a safe first fix.",
              "intentGroup": "initial-triage",
              "at": "2026-10-19T09:13:20-07:00",
              "type": "delegated",
              "actor": {
                "kind": "digit",
                "digit": "workplace-concierge",
                "name": "Workplace Concierge"
              },
              "data": {
                "target": {
                  "kind": "digit",
                  "digit": "ticket-resolver",
                  "name": "Ticket Resolver"
                }
              }
            },
            {
              "kind": "event",
              "id": "e-kb",
              "intentGroup": "initial-triage",
              "intent": "First, I should check the Wi-Fi guidance for a safe fix Megan can try herself.",
              "at": "2026-10-19T09:14:00-07:00",
              "type": "searched",
              "actor": {
                "kind": "digit",
                "digit": "ticket-resolver",
                "name": "Ticket Resolver"
              },
              "data": {
                "count": 1,
                "entity": "knowledge article",
                "results": [
                  {
                    "link": {
                      "label": "Can’t connect to Corp-Secure Wi-Fi",
                      "to": {
                        "type": "article",
                        "id": "KB-118"
                      }
                    },
                    "meta": "Knowledge base · Network"
                  }
                ]
              }
            },
            {
              "kind": "message",
              "id": "m4",
              "at": "2026-10-19T09:14:30-07:00",
              "variant": "digit-message",
              "channel": "slack",
              "via": "workplace-concierge",
              "actor": {
                "kind": "digit",
                "digit": "ticket-resolver",
                "name": "Ticket Resolver"
              },
              "body": [
                "Let’s try a quick fix: forget Corp-Secure, turn Wi-Fi off and on, then rejoin with your SSO account. ",
                {
                  "label": "Can’t connect to Corp-Secure Wi-Fi",
                  "to": {
                    "type": "article",
                    "id": "KB-118"
                  }
                }
              ]
            },
            {
              "kind": "message",
              "id": "m5",
              "at": "2026-10-19T09:17:00-07:00",
              "variant": "requester-reply",
              "channel": "slack",
              "actor": {
                "kind": "requester",
                "id": "u-megan",
                "name": "Megan Brooks"
              },
              "body": [
                "Tried all three. Same error."
              ],
              "attachments": [
                {
                  "name": "wifi-diagnostics.txt",
                  "sizeLabel": "2 KB",
                  "snippet": "Corp-Secure: association failed\nEAP-TLS: client certificate rejected (unknown CA)\nStatus: Unable to join the network"
                }
              ]
            }
          ]
        },
        {
          "kind": "event",
          "id": "e-created",
          "intent": "The first fix did not work. I should create an incident and classify it from Megan’s report so we can track the investigation.",
          "intentGroup": "incident-setup",
          "at": "2026-10-19T09:17:20-07:00",
          "type": "ticket-created",
          "actor": {
            "kind": "digit",
            "digit": "ticket-resolver",
            "name": "Ticket Resolver"
          },
          "data": {
            "target": {
              "kind": "requester",
              "id": "u-megan",
              "name": "Megan Brooks"
            },
            "details": [
              {
                "label": "Tried first",
                "value": [
                  {
                    "label": "Can’t connect to Corp-Secure Wi-Fi",
                    "to": {
                      "type": "article",
                      "id": "KB-118"
                    }
                  },
                  " (3 steps)"
                ]
              },
              {
                "label": "Source",
                "value": [
                  "Slack"
                ]
              }
            ]
          }
        },
        {
          "kind": "group",
          "id": "p-triage",
          "level": "phase",
          "actor": {
            "kind": "digit",
            "digit": "ticket-resolver",
            "name": "Ticket Resolver"
          },
          "title": "Triage",
          "start": "2026-10-19T09:17:20-07:00",
          "end": "2026-10-19T09:18:00-07:00",
          "meta": "5 fields set · summary added · told Megan the ticket number",
          "outcomes": [
            {
              "label": "5 fields set",
              "tone": "neutral"
            }
          ],
          "defaultOpen": false,
          "children": [
            {
              "kind": "event",
              "id": "e-props",
              "intentGroup": "incident-setup",
              "intent": "I should classify the incident using Megan’s report and the result of the first fix.",
              "at": "2026-10-19T09:17:40-07:00",
              "type": "properties-updated",
              "actor": {
                "kind": "digit",
                "digit": "ticket-resolver",
                "name": "Ticket Resolver"
              },
              "data": {
                "count": 5,
                "fields": [
                  {
                    "field": "Status",
                    "from": "Open",
                    "to": "In progress"
                  },
                  {
                    "field": "Category",
                    "from": "None",
                    "to": "Network"
                  },
                  {
                    "field": "Sub-category",
                    "from": "None",
                    "to": "Wireless"
                  },
                  {
                    "field": "Urgency",
                    "from": "Low",
                    "to": "High"
                  },
                  {
                    "field": "Priority",
                    "from": "Low",
                    "to": "Medium"
                  }
                ]
              },
              "why": "Forgetting and rejoining the network didn’t help, so this isn’t a cached Wi-Fi profile. Only Megan’s laptop is affected, so it’s a single-device authentication issue. Classifying as Network › Wireless."
            },
            {
              "kind": "event",
              "id": "e-sum-work",
              "at": "2026-10-19T09:17:48-07:00",
              "type": "digit-event",
              "actor": { "kind": "digit", "digit": "ticket-resolver", "name": "Ticket Resolver" },
              "data": { "verb": "summarised the conversation so far" },
              "intent": "I should write a short summary of what has been said so far, so whoever picks this up doesn’t have to read the whole conversation."
            },
            {
              "kind": "event",
              "id": "e-sum",
              "at": "2026-10-19T09:17:55-07:00",
              "type": "summary-updated",
              "actor": {
                "kind": "digit",
                "digit": "ticket-resolver",
                "name": "Ticket Resolver"
              },
              "data": {}
            }
          ]
        },
        {
          "kind": "group",
          "id": "p-rca",
          "level": "phase",
          "actor": {
            "kind": "digit",
            "digit": "ticket-resolver",
            "name": "Ticket Resolver"
          },
          "title": "Root cause",
          "start": "2026-10-19T09:19:00-07:00",
          "end": "2026-10-19T09:21:00-07:00",
          "meta": "3 searches",
          "outcomes": [
            {
              "label": "High · 0.84",
              "tone": "success"
            }
          ],
          "defaultOpen": false,
          "children": [
            {
              "kind": "event",
              "id": "e-s1",
              "intent": "I should compare similar tickets, recent changes, and Megan’s device record to find what is blocking Corp-Secure on her laptop.",
              "intentGroup": "investigation",
              "at": "2026-10-19T09:19:00-07:00",
              "type": "searched",
              "actor": {
                "kind": "digit",
                "digit": "ticket-resolver",
                "name": "Ticket Resolver"
              },
              "data": {
                "count": 7,
                "entity": "similar tickets",
                "results": [
                  {
                    "link": {
                      "label": "INC-4098",
                      "to": {
                        "type": "ticket",
                        "id": "INC-4098"
                      }
                    },
                    "meta": "Corp-Secure “unable to join” after the weekend · Resolved"
                  },
                  {
                    "link": {
                      "label": "INC-4103",
                      "to": {
                        "type": "ticket",
                        "id": "INC-4103"
                      }
                    },
                    "meta": "MacBook won’t connect to office Wi-Fi · Resolved"
                  },
                  {
                    "link": {
                      "label": "INC-4110",
                      "to": {
                        "type": "ticket",
                        "id": "INC-4110"
                      }
                    },
                    "meta": "Wi-Fi certificate error on Corp-Secure · Resolved"
                  },
                  {
                    "link": {
                      "label": "+4 more",
                      "to": {
                        "type": "related-tickets"
                      }
                    },
                    "meta": ""
                  }
                ]
              }
            },
            {
              "kind": "event",
              "id": "e-s2",
              "intentGroup": "investigation",
              "intent": "A recent change may explain the pattern. I should check what changed before the Wi-Fi failures.",
              "at": "2026-10-19T09:19:30-07:00",
              "type": "searched",
              "actor": {
                "kind": "digit",
                "digit": "ticket-resolver",
                "name": "Ticket Resolver"
              },
              "data": {
                "count": 1,
                "entity": "recent change",
                "object": [
                  {
                    "label": "CHG-2187",
                    "to": {
                      "type": "change",
                      "id": "CHG-2187"
                    }
                  }
                ]
              }
            },
            {
              "kind": "event",
              "id": "e-s3",
              "intentGroup": "investigation",
              "intent": "I should inspect Megan’s device record to narrow down which configuration is failing.",
              "at": "2026-10-19T09:20:00-07:00",
              "type": "searched",
              "actor": {
                "kind": "digit",
                "digit": "ticket-resolver",
                "name": "Ticket Resolver"
              },
              "data": {
                "verb": "looked up Megan’s device in the work graph",
                "object": [
                  {
                    "label": "ASSET-2291",
                    "to": {
                      "type": "asset",
                      "id": "ASSET-2291"
                    }
                  }
                ]
              }
            },
            {
              "kind": "event",
              "id": "e-rc-think",
              "at": "2026-10-19T09:20:30-07:00",
              "type": "thought",
              "actor": { "kind": "digit", "digit": "ticket-resolver", "name": "Ticket Resolver" },
              "data": { "seconds": 12 },
              "intent": "The similar tickets all started after CHG-2187 and involve the Wi-Fi certificate. Megan’s laptop shows the same certificate error, so the most likely cause is that the certificate wasn’t renewed after the change. I’ll check that against the change record before settling on it."
            },
            {
              "kind": "event",
              "id": "e-rc",
              "at": "2026-10-19T09:21:00-07:00",
              "type": "root-cause-added",
              "actor": {
                "kind": "digit",
                "digit": "ticket-resolver",
                "name": "Ticket Resolver"
              },
              "data": {},
              "why": "All 7 similar tickets are on Intune-managed Macs and started after CHG-2187 rotated the certificate authority on Friday. 3 were fixed by re-issuing the certificate. Only Megan’s laptop is affected, so its certificate most likely didn’t renew."
            }
          ]
        },
        {
          "kind": "group",
          "id": "p-res",
          "level": "phase",
          "actor": {
            "kind": "digit",
            "digit": "ticket-resolver",
            "name": "Ticket Resolver"
          },
          "title": "Resolution",
          "start": "2026-10-19T09:21:00-07:00",
          "end": "2026-10-19T09:35:00-07:00",
          "meta": "Approved by you at 9:31 · workflow ran, 1 of 3 steps failed",
          "outcomes": [
            {
              "label": "Blocked",
              "tone": "warning"
            }
          ],
          "defaultOpen": false,
          "children": [
            {
              "kind": "event",
              "id": "e-sw",
              "intent": "The certificate looks suspect. I should find a workflow to renew it and obtain approval before changing Intune settings.",
              "intentGroup": "fix-planning",
              "workOutcome": "Two fixes match. The re-issue workflow can apply the fix end to end, but it needs Network Team approval.",
              "at": "2026-10-19T09:21:30-07:00",
              "type": "searched",
              "actor": {
                "kind": "digit",
                "digit": "ticket-resolver",
                "name": "Ticket Resolver"
              },
              "data": {
                "count": 2,
                "entity": "workflows"
              },
              "why": "Two fixes match: resolution insights from the similar tickets, and the “Re-issue Wi-Fi certificate (macOS)” workflow. Choosing the workflow because it can apply the fix end to end. Certificate changes need Network team approval first."
            },
            {
              "kind": "event",
              "id": "e-ar",
              "intentGroup": "fix-planning",
              "intent": "The certificate workflow changes Intune settings. I need Network Team approval before running it.",
              "at": "2026-10-19T09:22:00-07:00",
              "type": "approval-requested",
              "actor": {
                "kind": "digit",
                "digit": "ticket-resolver",
                "name": "Ticket Resolver"
              },
              "data": {
                "target": {
                  "kind": "agent",
                  "id": "a-jordan",
                  "name": "Jordan Reyes"
                }
              }
            },
            {
              "kind": "approval",
              "id": "ap1",
              "at": "2026-10-19T09:22:00-07:00",
              "actor": {
                "kind": "digit",
                "digit": "ticket-resolver",
                "name": "Ticket Resolver"
              },
              "title": "Re-issue Megan’s Wi-Fi certificate",
              "what": [
                "Revoke the Wi-Fi certificate on ASSET-2291 and issue a new one. After approval, Ticket Resolver will run the “Re-issue Wi-Fi certificate (macOS)” workflow, which makes the change in Intune."
              ],
              "whyAction": [
                "The same fix resolved 3 of the 7 similar tickets since CHG-2187. Certificate changes need Network team approval."
              ],
              "comments": 3,
              "state": "approved",
              "decidedBy": {
                "kind": "agent",
                "id": "a-jordan",
                "name": "Jordan Reyes"
              },
              "decidedAt": "2026-10-19T09:31:00-07:00"
            },
            {
              "kind": "event",
              "id": "e-ad",
              "at": "2026-10-19T09:31:00-07:00",
              "type": "approval-decided",
              "actor": {
                "kind": "agent",
                "id": "a-jordan",
                "name": "Jordan Reyes"
              },
              "data": {
                "decision": "approved",
                "object": [
                  "Re-issue Megan’s Wi-Fi certificate"
                ]
              }
            },


            {
              "kind": "event",
              "id": "e-wf",
              "intent": "Approval is in place. I should run the certificate workflow and check each step’s result.",
              "intentGroup": "approved-workflow",
              "workOutcome": "The final Intune step failed because the connection cannot assign Wi-Fi profiles. The fix is blocked and needs a person to finish it.",
              "at": "2026-10-19T09:34:00-07:00",
              "type": "workflow-executed",
              "actor": {
                "kind": "digit",
                "digit": "ticket-resolver",
                "name": "Ticket Resolver"
              },
              "data": {
                "workflow": "Re-issue Wi-Fi certificate (macOS)",
                "steps": [
                  {
                    "label": "Revoked the old certificate in Microsoft Intune",
                    "status": "done"
                  },
                  {
                    "label": "Assign the new Corp-Secure Wi-Fi profile in Intune",
                    "status": "failed",
                    "detail": "permission denied"
                  },
                  {
                    "label": "Confirm the laptop checked in",
                    "status": "skipped",
                    "detail": "not run"
                  }
                ]
              },
              "why": "The workflow’s Intune connection isn’t allowed to assign Wi-Fi profiles, and no other workflow can. The cause is known but the fix can’t finish, so this is Blocked, not Inconclusive. Megan’s laptop has no valid certificate right now, so it needs a person quickly."
            }
          ]
        }
      ]
    },
    {
      "kind": "event",
      "id": "e-ho",
      "intentGroup": "approved-workflow",
      "at": "2026-10-19T09:35:40-07:00",
      "type": "handed-over",
      "actor": {
        "kind": "digit",
        "digit": "ticket-resolver",
        "name": "Ticket Resolver"
      },
      "data": {
        "target": {
          "kind": "agent",
          "id": "a-jordan",
          "name": "Jordan Reyes"
        },
        "reason": "blocked",
        "method": "round-robin",
        "routing": "Intelligent routing → Network Team",
        "details": [
          {
            "label": "Blocker",
            "value": [
              "Workflow step failed: Intune profile assignment denied"
            ]
          },
          {
            "label": "Diagnosis",
            "value": [
              "Wi-Fi certificate not renewed after CHG-2187"
            ]
          },
          {
            "label": "Tried",
            "value": [
              "KB steps; “Re-issue Wi-Fi certificate (macOS)” workflow"
            ]
          },
          {
            "label": "Routed by",
            "value": [
              "Intelligent routing → Network Team"
            ]
          }
        ]
      }
    },
    {
      "kind": "message",
      "id": "m9",
      "at": "2026-10-19T09:17:10-07:00",
      "variant": "digit-message",
      "channel": "slack",
      "via": "workplace-concierge",
      "actor": {
        "kind": "digit",
        "digit": "workplace-concierge",
        "name": "Workplace Concierge"
      },
      "body": [
        "Megan, I’ve created a ticket for this. It will be passed to a person on the Network team with everything we’ve tried, so you won’t need to repeat anything."
      ]
    }
  ],
  "engagedStream": [
    {
      "kind": "message",
      "id": "n1",
      "at": "2026-10-19T09:41:00-07:00",
      "variant": "private-note",
      "channel": "slack",
      "actor": {
        "kind": "agent",
        "id": "a-jordan",
        "name": "Jordan Reyes"
      },
      "body": [
        "Assigning the Corp-Secure profile manually in Intune. Also checking the 3 other open CHG-2187 tickets."
      ]
    },
    {
      "kind": "message",
      "id": "r1",
      "at": "2026-10-19T09:44:00-07:00",
      "variant": "reply",
      "channel": "slack",
      "actor": {
        "kind": "agent",
        "id": "a-jordan",
        "name": "Jordan Reyes"
      },
      "body": [
        "Hi Megan, sorry about the hassle before your demo. I’ve pushed the fix to your laptop. Could you rejoin Corp-Secure and let me know if it works?"
      ],
      "flags": {
        "draftedWithCopilot": "edited"
      }
    },
    {
      "kind": "message",
      "id": "m11",
      "at": "2026-10-19T09:46:00-07:00",
      "variant": "requester-reply",
      "channel": "slack",
      "actor": {
        "kind": "requester",
        "id": "u-megan",
        "name": "Megan Brooks"
      },
      "body": [
        "Working now. Thanks, Jordan!"
      ]
    }
  ]
};
