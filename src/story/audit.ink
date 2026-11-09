// The Friday audit. An unseen Head office auditor phones in, and Pani Halina hovers nearby.
// The auditor is Head office, so its lines carry #speaker:headOffice. Every other line is Pani Halina's,
// except the Intern's choices, which the Intern says.
// Each answer carries its #audit: tag. The game applies the answer's effect after the scene ends.
// Every run reaches Wrong by Friday morning, so no line branches on tier().

=== audit ===
This is Head office. This call is recorded. And kept. #speaker:headOffice #id:audit.audit.1
Speak clearly. I am noting everything. For the file. #id:audit.audit.2
Audit of the Smart range. One question. #speaker:headOffice #id:audit.audit.3
Were any Smart range complaints received this week? #speaker:headOffice #id:audit.audit.4
Think carefully. The file will show what you say. Not what I say. #id:audit.audit.5
* [None worth mentioning. The launch is on track. #audit:bury #id:audit.audit.6]
    Noted. The Smart range thanks you. #speaker:headOffice #id:audit.audit.7
    Noted. The Intern said "none". In those words. #id:audit.audit.8
* [Yes. Many. We have them all in writing. #audit:escalate #id:audit.audit.9]
    Noted. Send the file. All of it. #speaker:headOffice #id:audit.audit.10
    It will be recorded that concerns were raised. The file has been ready for some time. #id:audit.audit.11
* [You would have to ask Pani Halina. #audit:deflect #id:audit.audit.12]
    Noted. Pani Halina will be asked. #speaker:headOffice #id:audit.audit.13
    That was not necessary. It will be noted that it was not necessary. #id:audit.audit.14
- Thank you. Head office is always listening. #speaker:headOffice #note:"Always listening" echoes the mission statement, "Listening to your body". Keep the echo. #id:audit.audit.15
-> END
