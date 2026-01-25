# Credentials Folder


This folder must contain all information required for authorized personnel, such as the CTO or designated team members, to securely access and manage the application infrastructure.

The contents of this folder are used for verification, grading, and system access. Accuracy and completeness are critical.

The **GitHub Master** is primarily responsible for maintaining this folder. The **Technical Writer** may assist with documentation, but ownership and correctness remain a team responsibility.

This folder must not be renamed.

---

## Required Contents

### SSH Access to Cloud Server
- Clear instructions for securely connecting to the cloud server via SSH.
- Details on key management, login procedures, PEM files if applicable, and common troubleshooting steps.

### SSH Access to Database
- Instructions for securely accessing the database server.
- Database connection details, access methods, and security best practices.
- Notes on how access is restricted and logged, if applicable.

### API Keys and Secrets Management
- Documentation on how API keys, tokens, and other secrets are stored and accessed.
- Description of the mechanism used, such as environment variables or secret managers.
- Guidance on rotating keys and updating credentials safely.

---

## Security Guidelines

### Access Control
- Only authorized individuals may access the information in this folder.
- Access permissions must be reviewed and updated as team roles change.

### Key and Credential Rotation
- SSH keys, API keys, and other credentials must follow reasonable rotation practices.
- Documentation must be updated immediately whenever credentials change.

### Incident Reporting
- Any suspected security issue or accidental exposure must be reported immediately.
- Follow the team’s defined incident response process and document corrective actions if needed.

---

## Contact and Responsibility

If access issues arise or credentials need to be updated, contact the Team Lead or the team member responsible for infrastructure management.

All communication related to credentials must be handled securely and professionally.

---

**Important:**  
This folder is a required part of the project infrastructure. Missing, outdated, incorrect, or insecure information in this folder may result in grading penalties or inability to evaluate the system.
