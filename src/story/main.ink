// The root Ink story. Other Ink files join it through INCLUDE.
// For now it holds one placeholder knot for each kind of story. The writing tickets replace them.

INCLUDE zbigniew.ink
INCLUDE halina.ink
INCLUDE ryszard.ink
INCLUDE wiola.ink
INCLUDE kamil.ink

EXTERNAL pressure(name)
EXTERNAL tier()
EXTERNAL flag(name)
EXTERNAL day()
EXTERNAL adjust(pressure, delta)
EXTERNAL set_flag(name)
EXTERNAL escalate()

-> DONE

// A Colleague Conversation: one Pressure, at most 1 up or down, and at most one escalate().
=== test_colleague_conversation ===
{ tier() == "wrong":
    The coffee machine hums a hymn. #id:main.test_colleague_conversation.1
- else:
    Morning. Coffee? #id:main.test_colleague_conversation.2
}
* [Take the coffee #id:main.test_colleague_conversation.3]
    ~ adjust("sanity", 1)
    Thanks. #id:main.test_colleague_conversation.4
* [Ask about the launch #id:main.test_colleague_conversation.5]
    ~ adjust("launchTeam", 1)
    ~ set_flag("asked_about_launch")
    ~ escalate()
    Do not ask about the launch. #id:main.test_colleague_conversation.6
- -> END

// A brush-off: one line for the current tier, with no choices and no writes.
=== test_brush_off ===
{ tier():
- "wrong": Not now. Not ever. #id:main.test_brush_off.1
- "odd": Not now. Something is off. #id:main.test_brush_off.2
- else: Not now, I am busy. #id:main.test_brush_off.3
}
-> END

// A hand-off line: what a Colleague says when the Intern delegates a Task.
=== test_hand_off ===
Fine. Leave it on my desk. #id:main.test_hand_off.1
-> END

// A scripted scene, such as the Monday onboarding. The caps do not apply.
=== test_onboarding ===
Welcome to the team. #id:main.test_onboarding.1
{ flag("asked_about_launch"):
    I hear you asked about the launch. #id:main.test_onboarding.2
}
* [Nod #id:main.test_onboarding.3]
    ~ adjust("performance", 1)
    Good. #id:main.test_onboarding.4
- -> END

// A Firing scene. It plays after the Firing, so its writes change nothing that matters.
=== test_firing ===
{ pressure("performance") == 0:
    Your performance has reached a natural conclusion. #id:main.test_firing.1
- else:
    We are letting you go. #id:main.test_firing.2
}
-> END

// The Friday audit, with its three answers.
=== test_audit ===
The auditor opens a folder. #id:main.test_audit.1
* [Bury it #id:main.test_audit.2]
* [Escalate it #id:main.test_audit.3]
* [Say nothing #id:main.test_audit.4]
- The auditor closes the folder. #id:main.test_audit.5
-> END

// A survival scene on Friday evening.
=== test_survival ===
{ day() == 5:
    You made it to Friday evening. #id:main.test_survival.1
}
-> END

// A scripted scene that can fire the Intern, for the Firing check tests.
=== test_scripted_drop ===
This is going badly. #id:main.test_scripted_drop.1
* [Make it worse #id:main.test_scripted_drop.2]
    ~ adjust("sanity", -10)
    It got worse. #id:main.test_scripted_drop.3
- Nobody saw this line. #id:main.test_scripted_drop.4
-> END
