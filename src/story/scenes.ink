// The scripted scenes: the Monday onboarding, the four Firings, the Friday audit and the three survival scenes.
// Placeholders until the scene writing tickets write them.
// A line tagged #speaker:intern is the Intern's. A line tagged #speaker:headOffice is Head office's.
// Every other line belongs to the scene's main person, listed above each knot.

// Pan Zbigniew. This is Ryszard's Monday Conversation too, so he has no Monday knot.
// The last line sets the "onboarded" flag. Without it, Continue replays the onboarding.
=== onboarding ===
Placeholder: Pan Zbigniew welcomes you to the team. #id:scenes.onboarding.1
Placeholder: Ryszard shows you how to make a Task look done. #id:scenes.onboarding.2
Placeholder: I will remember that. #speaker:intern #id:scenes.onboarding.3
~ set_flag("onboarded")
-> END

// Pan Zbigniew.
=== firing_performance ===
Placeholder: Pan Zbigniew fires you, serenely. #id:scenes.firing_performance.1
-> END

// Ryszard.
=== firing_launchTeam ===
Placeholder: Ryszard hands you a template dismissal letter. #id:scenes.firing_launchTeam.1
-> END

// Pani Halina.
=== firing_paperTrail ===
Placeholder: Pani Halina files you away. #id:scenes.firing_paperTrail.1
-> END

// The Intern.
=== firing_sanity ===
Placeholder: You stand up and walk out. #speaker:intern #id:scenes.firing_sanity.1
-> END

// Pani Halina hovers nearby. The auditor is Head office. Each answer carries its #audit: tag.
=== audit ===
Placeholder: Head office is on the line about Smart range complaints. #speaker:headOffice #id:scenes.audit.1
* [Placeholder: Bury it. #audit:bury #id:scenes.audit.2]
* [Placeholder: Escalate it. #audit:escalate #id:scenes.audit.3]
* [Placeholder: Deflect. #audit:deflect #id:scenes.audit.4]
- Placeholder: The auditor hangs up. #speaker:headOffice #id:scenes.audit.5
-> END

// Pan Zbigniew.
=== survival_launchTeam ===
Placeholder: Pan Zbigniew raises a glass to the Launch Team's new favourite. #id:scenes.survival_launchTeam.1
-> END

// Pani Halina.
=== survival_paperTrail ===
Placeholder: Pani Halina stamps your file "retained". #id:scenes.survival_paperTrail.1
-> END

// The Intern.
=== survival_equal ===
Placeholder: Nobody quite trusts you. You made it to Friday evening. #speaker:intern #id:scenes.survival_equal.1
-> END
