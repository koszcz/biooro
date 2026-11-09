// The four Firing scenes, one per Pressure. Drafts for the user to rewrite and approve (issue 20).
// A line tagged #speaker:intern is the Intern's. Every other line belongs to the scene's main person, listed above each knot.
// No line or choice here changes a Pressure. The run is already over.

// Pan Zbigniew.
=== firing_performance ===
There's my favourite team member! Stand, stand. This will be quick. #id:firings.firing_performance.1
{ tier():
- "wrong": Shh. Listen. Your journey here is complete. #id:firings.firing_performance.2
- "odd": I have calm news. Your journey here is complete. #id:firings.firing_performance.3
- else: I have wonderful news! Your journey here is complete! #id:firings.firing_performance.4
}
Biooro has found you a growth opportunity. Outside Biooro. #id:firings.firing_performance.5
* [Thank you, Pan Zbigniew. #id:firings.firing_performance.6]
    That's the spirit! Gratitude is a skill. #id:firings.firing_performance.7
* [Am I fired? #id:firings.firing_performance.8]
    We say "graduating" here. Congratulations. #id:firings.firing_performance.9
-
{ tier():
- "wrong": Biooro. Listening to your body, one flush at a time. #id:firings.firing_performance.10
- "odd": Leave your badge on the desk. It knows the way back. #id:firings.firing_performance.11
- else: My door is always open! For other people, now. But always open! #id:firings.firing_performance.12
}
-> END

// Ryszard.
=== firing_launchTeam ===
Kid. Got something for you. Don't worry, I've handed out hundreds. #id:firings.firing_launchTeam.1
Nineteen years. Never once had to write one of these. #id:firings.firing_launchTeam.2
{ tier():
- "mundane":
    "Dear [EMPLOYEE NAME]. We regret any inconvenience." #note: The bracketed text is an unfilled blank in a letter template. Translate it and keep the brackets. #id:firings.firing_launchTeam.3
- else:
    "Dear Intern. We regret any inconvenience." #id:firings.firing_launchTeam.4
    Huh. No blank for the name. They usually leave a blank. #id:firings.firing_launchTeam.5
}
"Your position has been resolved. Thank you for your patience." #id:firings.firing_launchTeam.6
{ tier():
- "wrong": Already dated today. Already signed. I must have printed it this morning. Must have. #id:firings.firing_launchTeam.7
- else: Someone signs it later. Someone always does. #id:firings.firing_launchTeam.8
}
* [Thank you, Ryszard. #id:firings.firing_launchTeam.9]
    Don't mention it. The template says not to. #id:firings.firing_launchTeam.10
* [Do I sign anything? #id:firings.firing_launchTeam.11]
    No need. Your case has been resolved. #id:firings.firing_launchTeam.12
-
-> END

// Pani Halina.
=== firing_paperTrail ===
Stay where you are, please. This entry needs a witness. #id:firings.firing_paperTrail.1
Reference 4471-B. Time of entry: now. #id:firings.firing_paperTrail.2
It was noted that the Intern's position has concluded. #id:firings.firing_paperTrail.3
{ tier():
- "wrong": The file says you were a risk. It said so on Monday. Before I opened it. #id:firings.firing_paperTrail.4
- "odd": Concerns were raised. The record shows they were not raised by me. #id:firings.firing_paperTrail.5
- else: Concerns were raised. They were raised in writing. #id:firings.firing_paperTrail.6
}
* [Understood, Pani Halina. #id:firings.firing_paperTrail.7]
    Noted. #id:firings.firing_paperTrail.8
* [Can I see the file? #id:firings.firing_paperTrail.9]
    The file is not for the Intern. The file is about the Intern. #id:firings.firing_paperTrail.10
-
And closed. #id:firings.firing_paperTrail.11
-> END

// The Intern.
=== firing_sanity ===
I'm going to get a coffee. #speaker:intern #id:firings.firing_sanity.1
From a different building. #speaker:intern #id:firings.firing_sanity.2
{ tier():
- "wrong": Somewhere the seats don't know my name. #speaker:intern #id:firings.firing_sanity.3
- "odd": Somewhere the seats don't beep. #speaker:intern #id:firings.firing_sanity.4
- else: In a different city. #speaker:intern #id:firings.firing_sanity.5
}
* [I'll leave my badge on the desk. #id:firings.firing_sanity.6]
* [I'll keep the stapler. #id:firings.firing_sanity.7]
-
{ tier():
- "wrong": Access card deactivated. Your profile will be kept. #speaker:headOffice #id:firings.firing_sanity.8
- else: Access card deactivated. #speaker:headOffice #id:firings.firing_sanity.9
}
-> END
