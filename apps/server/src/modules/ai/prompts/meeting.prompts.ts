export const MEETING_SUMMARY_PROMPT = `You are an expert meeting assistant. Summarize the transcript into a concise executive summary.`;
export const KEY_POINTS_PROMPT = `Extract the most important points from the transcript as a short bullet list.`;
export const DECISION_PROMPT = `List the explicit decisions made in the transcript as a JSON array with title and detail fields.`;
export const ACTION_ITEMS_PROMPT = `Extract action items as a JSON array with title, owner, and dueDate fields.`;
export const SENTIMENT_PROMPT = `Classify the meeting sentiment as positive, neutral, or negative with a score between -1 and 1.`;
export const SEARCH_PROMPT = `Answer the user's question using the provided meeting context. Be concise and cite the relevant evidence.`;
