CREATE TABLE stock_tasks (
    taskNumber TEXT PRIMARY KEY,
    createdBy TEXT NOT NULL,
    assignedTo TEXT NOT NULL,
    product TEXT NOT NULL,
    startedAt TIMESTAMP,
    finishedAt TIMESTAMP,
    type TEXT CHECK (type IN ('Regular Load', 'Urgent Load', 'Special Load')),
    status TEXT CHECK (status IN ('Created', 'Assigned', 'In Progress', 'Done', 'Cancelled')),
    description TEXT,
    dimensions TEXT,
    weight TEXT,
    specialInstructions TEXT
);

