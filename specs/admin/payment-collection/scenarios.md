# Payment Collection Scenarios

## SC-PCOL-01 Read Available Collection Sources

- Given the finance operator opens the collection surface
- When the system presents configured payment collection sources
- Then the operator understands which receive-money sources are active or inactive

## SC-PCOL-02 Change Payee Identity

- Given the operator needs to update who receives funds
- When the operator saves a new payee identity
- Then the selected collection source reflects the new receive-money identity

## SC-PCOL-03 Update QR Or Transfer Setup

- Given the operator needs to update a QR or transfer instruction
- When the operator saves the collection setup
- Then the selected source becomes the new receive-money instruction
- But an invalid setup is blocked from acting as live configuration

## SC-PCOL-04 Review Readiness Before Live Use

- Given the operator wants to verify a collection source before live use
- When the system presents readiness signals and warnings
- Then the operator can distinguish ready sources from sources needing correction
