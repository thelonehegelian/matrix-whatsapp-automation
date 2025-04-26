interface ParsedTask {
  taskName: string | null;
  taskDescription: string | null;
}

export const parseTaskAndDescription = (text: string): ParsedTask => {
  const taskMatch = text.match(/^Task:\s*(.*)$/im);
  const descriptionMatch = text.match(/^Description:\s*(.*)$/im);

  const taskName = taskMatch ? taskMatch[1].trim() : null;
  const taskDescription = descriptionMatch ? descriptionMatch[1].trim() : null;

  // Return null for both if neither is found, or adjust as needed
  if (!taskName && !taskDescription) {
    return { taskName: null, taskDescription: null };
  }

  return {
    taskName,
    taskDescription,
  };
};
