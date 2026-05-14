# AGENTS.md

## Overview

This document describes the AI agents and automated workflows configured for the Beacon project.

---

## Active Agents

### Factory Droid (Primary)

**Purpose:** General-purpose software engineering assistant for this repository.

**Capabilities:**
- Read, create, edit, and delete files in the repository
- Execute shell commands (read-only and destructive)
- Run git operations (commit, push, pull, etc.)
- Search codebase with grep/glob patterns
- Execute skills and sub-agents for specialized tasks
- Chrome DevTools automation for browser testing

**Usage:**
```
/droid [instruction]  - Invoke with a specific task
```

**Configuration:**
- Model: MiniMax-M2.7 (default)
- Location: Project-level agent (`/Users/praspitasawad/Beacon`)
- Git operations: Enabled via SSH remote

---

## Agent Workflows

### 1. Code Review
Runs on: Every pull request / on-demand

**Skill:** `review` - Reviews code changes and identifies high-confidence, actionable bugs.

**Process:**
1. Identify changed files
2. Analyze for correctness, security, performance
3. Surface findings with severity labels

### 2. Security Audit
Runs on: On-demand

**Skill:** `security-review` - Focused security review using STRIDE, OWASP Top 10, OWASP LLM Top 10.

**Process:**
1. Review PR/auth changes for vulnerabilities
2. Check for injection, auth, data exposure issues
3. Report findings

### 3. Task Tracking
The `tasks.md` file is the source of truth for project issues.

**Convention:**
- P0: Critical (security, reliability, data integrity)
- P1: High (significant functionality)
- P2: Medium (technical debt)
- P3: Low (nice-to-have)

---

## Repository Metadata

| Field | Value |
|-------|-------|
| Name | Beacon |
| Description | Financial data platform for US stock SEC EDGAR statements |
| Remote | git@github.com:praspit/Beacon.git |
| Language | Kotlin (Spring Boot) + TypeScript (React/Vite) + Python |
| Java Version | 17 |
| Node Version | (see frontend/package.json) |

---

## Quick Reference

| Action | Command |
|--------|---------|
| Ask for help | `@droid help` or describe your issue |
| Run tests | `droid exec ./gradlew test` |
| Lint | Check project scripts in package.json / build.gradle.kts |
| Deploy | Not configured yet |

---

## Adding New Agents

To add a custom agent for this repository:

1. Create agent definition in `.factory/droids/`
2. Configure tools and permissions
3. Reference in AGENTS.md with purpose and usage

---

*Last updated: 2025-05-14*
