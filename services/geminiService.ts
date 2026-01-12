import { GoogleGenAI } from "@google/genai";
import { Student, BehaviorIncident, ParticipationLog } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateStudentReport = async (
  student: Student,
  behaviorLogs: BehaviorIncident[],
  participationLogs: ParticipationLog[]
): Promise<string> => {
  const client = getClient();
  if (!client) return "API Key ist nicht konfiguriert.";

  const behaviorSummary = behaviorLogs
    .map(
      (log) =>
        `- ${new Date(log.timestamp).toLocaleDateString()}: [${log.category}] ${
          log.observation
        } (Wertung: ${log.severity}) ${log.notes ? `Notiz: ${log.notes}` : ""}`
    )
    .join("\n");

  const participationScore = participationLogs.reduce(
    (acc, log) => acc + log.score,
    0
  );

  const prompt = `
    Du bist ein erfahrener pädagogischer Assistent. Analysiere die folgenden Verhaltens- und Beteiligungsdaten für den Schüler/die Schülerin ${student.name}.
    
    Gesamte Mitarbeitspunktzahl: ${participationScore}
    
    Verhaltenseinträge:
    ${behaviorSummary || "Keine Einträge vorhanden."}
    
    Bitte erstelle eine prägnante, konstruktive Zusammenfassung in 3 Stichpunkten für die Lehrkraft (auf Deutsch):
    1. Identifiziere eine Stärke.
    2. Identifiziere einen Verbesserungsbereich.
    3. Schlage eine spezifische Strategie für den Unterricht vor, um diesen Schüler zu unterstützen.
    Halte den Ton professionell und ermutigend.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Bericht konnte nicht erstellt werden.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Fehler bei der Erstellung des Berichts. Bitte prüfen Sie Ihre Internetverbindung oder den API-Key.";
  }
};
