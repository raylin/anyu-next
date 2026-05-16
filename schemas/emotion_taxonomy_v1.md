# Emotion Taxonomy v1

This taxonomy initializes the emotional categories used by `signal_schema_v1.json`.

The categories are intentionally broad. Do not add, remove, rename, or split taxonomy categories without human approval and a schema or taxonomy decision log.

## Categories

### Relationship Anxiety

Fear, uncertainty, or distress related to romantic relationships, dating, attachment, rejection, communication, or commitment.

Common signals:

- fear of being ignored
- uncertainty about another person's intentions
- anxiety after conflict or silence
- comparison with other couples or dating norms

### Loneliness

Emotional pain from isolation, lack of connection, or feeling unseen.

Common signals:

- craving companionship
- feeling excluded
- having no one to talk to
- substituting digital interaction for closeness

### Social Pressure

Stress caused by perceived expectations from peers, family, coworkers, online audiences, or social groups.

Common signals:

- needing to appear successful
- fear of judgment
- pressure to conform
- performance of lifestyle or identity

### Identity Seeking

Exploration, confusion, or aspiration around who someone is, who they want to become, or how they want to be perceived.

Common signals:

- trying on labels or communities
- searching for purpose
- building a public persona
- seeking validation for a self-concept

### Productivity Stress

Pressure, guilt, or anxiety around work, output, time management, discipline, or achievement.

Common signals:

- feeling behind
- guilt while resting
- obsession with routines or tools
- fear of wasted potential

### Financial Anxiety

Stress or fear related to money, debt, income, affordability, career security, or economic status.

Common signals:

- fear of falling behind financially
- inability to afford milestones
- resentment about costs
- seeking side income or stability

### FOMO

Fear of missing out on experiences, trends, opportunities, relationships, purchases, or status markers.

Common signals:

- anxiety about not participating
- regret after seeing others' experiences
- compulsive checking
- urgency around limited windows

### Self-Worth Insecurity

Pain or doubt related to personal value, attractiveness, competence, status, or lovability.

Common signals:

- negative self-comparison
- shame about progress or appearance
- seeking reassurance
- interpreting outcomes as proof of inadequacy

## Scoring Guidance

Use `emotion_intensity` from 0 to 10. Scoring is directional and qualitative, not statistically precise.

- 0-2: almost no emotional signal
- 3-4: weak emotional signal
- 5-6: moderate emotional signal
- 7-8: strong emotional signal
- 9-10: very strong, repeated, or identity-level emotional signal
