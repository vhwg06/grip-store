# Admin Profile Scenarios

## SC-APRO-01 Read Self Identity

- Given the current admin opens the self-profile surface
- When the system shows the current identity details
- Then the admin can confirm how the account is represented in operations

## SC-APRO-02 Change Display Identity

- Given the current admin wants to update display identity
- When the admin saves a new display identity
- Then the current admin profile reflects the new identity
- But the admin's permission posture does not change as a side effect

## SC-APRO-03 Review Security Posture

- Given the current admin needs to validate account safety
- When the system presents password, 2FA, and backup-method context
- Then the admin can judge whether the account remains trustworthy

## SC-APRO-04 Inspect Recent Access

- Given the current admin wants to check recent sessions
- When the system presents recent device and access context
- Then the admin can distinguish expected access from suspicious access
