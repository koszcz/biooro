// The test story: the whole game story plus one test knot for each kind of story.
// Only tests load it. The game loads main.ink, so these knots never ship.

INCLUDE main.ink

// A Colleague Conversation: one Pressure, at most 1 up or down, and at most one escalate().
=== test_colleague_conversation ===
{ tier() == "wrong":
    The coffee machine hums a hymn. #id:test.test_colleague_conversation.1
- else:
    Morning. Coffee? #id:test.test_colleague_conversation.2
}
* [Take the coffee #id:test.test_colleague_conversation.3]
    ~ adjust("sanity", 1)
    Thanks. #id:test.test_colleague_conversation.4
* [Ask about the launch #id:test.test_colleague_conversation.5]
    ~ adjust("launchTeam", 1)
    ~ set_flag("asked_about_launch")
    ~ escalate()
    Do not ask about the launch. #id:test.test_colleague_conversation.6
- -> END

// Lines for each speaker tag. Untagged lines belong to the Conversation partner.
=== test_speakers ===
Morning. #id:test.test_speakers.1
Morning, Wiola. #speaker:intern #id:test.test_speakers.2
Head office thanks you for your attendance. #speaker:headOffice #id:test.test_speakers.3
-> END

// A brush-off: one line for the current tier, with no choices and no writes.
=== test_brush_off ===
{ tier():
- "wrong": Not now. Not ever. #id:test.test_brush_off.1
- "odd": Not now. Something is off. #id:test.test_brush_off.2
- else: Not now, I am busy. #id:test.test_brush_off.3
}
-> END

// A hand-off line: what a Colleague says when the Intern delegates a Task.
=== test_hand_off ===
Fine. Leave it on my desk. #id:test.test_hand_off.1
-> END

// A scripted scene, such as the Monday onboarding. The caps do not apply.
=== test_onboarding ===
Welcome to the team. #id:test.test_onboarding.1
{ flag("asked_about_launch"):
    I hear you asked about the launch. #id:test.test_onboarding.2
}
* [Nod #id:test.test_onboarding.3]
    ~ adjust("performance", 1)
    Good. #id:test.test_onboarding.4
- -> END

// A Firing scene. It plays after the Firing, so its writes change nothing that matters.
=== test_firing ===
{ pressure("performance") == 0:
    Your performance has reached a natural conclusion. #id:test.test_firing.1
- else:
    We are letting you go. #id:test.test_firing.2
}
-> END

// The Friday audit, with its three answers.
=== test_audit ===
The auditor opens a folder. #id:test.test_audit.1
* [Bury it #id:test.test_audit.2]
* [Escalate it #id:test.test_audit.3]
* [Say nothing #id:test.test_audit.4]
- The auditor closes the folder. #id:test.test_audit.5
-> END

// A survival scene on Friday evening.
=== test_survival ===
{ day() == 5:
    You made it to Friday evening. #id:test.test_survival.1
}
-> END

// A scripted scene that can fire the Intern, for the Firing check tests.
=== test_scripted_drop ===
This is going badly. #id:test.test_scripted_drop.1
* [Make it worse #id:test.test_scripted_drop.2]
    ~ adjust("sanity", -10)
    It got worse. #id:test.test_scripted_drop.3
- Nobody saw this line. #id:test.test_scripted_drop.4
-> END
