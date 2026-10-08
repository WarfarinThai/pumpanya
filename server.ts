import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI client safely
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Clinical safety screening API endpoint
app.post("/api/simulate", async (req, res) => {
  try {
    const { profile, herb } = req.body;

    if (!profile || !herb) {
      return res.status(400).json({ error: "Missing health profile or herb selection" });
    }

    const sysInstruction = `You are an expert clinical pharmacologist, traditional Thai medicine pharmacist, and medical safety consultant.
Your role is to simulate the safety of using a specific Thai herb with a patient's customized digital health profile.

Assess these five core dimensions:
1. Symptom Fit: Check if the herb's known TTM (Traditional Thai Medicine) and modern pharmacological actions match their current symptoms.
2. Chronic Conditions: Analyze the safety, warnings, and precautions related to their specified chronic diseases.
3. Herb-Drug Interactions: Perform rigorous pharmacodynamic and pharmacokinetic screening against their current medications. Check CYP450 enzyme pathways, additive effect risks, or absorption disruption.
4. Special Populations: Assess safety for their specific age range, pregnancy, or other high-risk features.
5. Data Completeness: Note any unknown medications or missing data that limits the accuracy of this screening.

Generate a highly accurate, professional, yet understandable clinical report in Thai.
Ensure the questions for the pharmacist/doctor are practical and action-oriented.`;

    const prompt = `Health Profile:
- Age Range: ${profile.ageRange} (years)
- Gender: ${profile.gender}
- Weight: ${profile.weight} kg
- Pregnant/Lactating: ${profile.isPregnant ? "Yes" : "No"}
- Chronic Conditions: ${profile.chronicConditions?.join(", ") || "None reported"}
- Current Medications:
  ${profile.medications?.map((m: any) => `- ${m.name} (${m.dosage || 'unknown dosage'}), taken ${m.frequency || 'unknown frequency'}. ${m.isUnknown ? "[Warning: Name is unknown or described manually]" : ""}`).join("\n") || "None reported"}
- Allergy History: ${profile.allergies === 'has-allergy' ? `Yes: ${profile.allergyDetails}` : "No severe allergies reported"}
- Current Symptom to Address: ${profile.currentSymptoms?.join(", ") || "None"}
- TTM Elements: Heat=${profile.traditional?.heatLevel}, Wind=${profile.traditional?.windType}, Stool=${profile.traditional?.bowelHabit}, Sleep/Appetite=${profile.traditional?.sleepQuality}

Herb to Simulate:
- Name: ${herb.name} (${herb.botanicalName})
- Purpose: ${herb.purpose}
- Category: ${herb.category}
- Description: ${herb.description}

Evaluate this combination and return the results in JSON matching the requested schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: sysInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safetyScore: {
              type: Type.INTEGER,
              description: "Safety score of using this herb with current profile from 0 to 100."
            },
            safetyLevel: {
              type: Type.STRING,
              description: "Must be one of: 'safe', 'cautionary', 'warning', 'alert'"
            },
            safetyLevelText: {
              type: Type.STRING,
              description: "Safety badge text in Thai, e.g. 'ปลอดภัย', 'ควรระวัง', 'ควรเฝ้าระวังสูง', 'อันตราย'"
            },
            summary: {
              type: Type.STRING,
              description: "Concise Thai clinical safety summary."
            },
            completenessIndex: {
              type: Type.INTEGER,
              description: "Data completeness score based on profile inputs, 0-100."
            },
            completenessText: {
              type: Type.STRING,
              description: "Thai status text, e.g., 'สูง (98%)', 'ปานกลาง (80%)'"
            },
            dimensions: {
              type: Type.OBJECT,
              properties: {
                symptomFit: {
                  type: Type.OBJECT,
                  properties: {
                    status: { type: Type.STRING, description: "match, warning, info, or error" },
                    statusText: { type: Type.STRING, description: "Badge text in Thai, e.g. 'ตรงตามสรรพคุณ', 'ไม่สอดคล้อง'" },
                    title: { type: Type.STRING, description: "Dimension title in Thai" },
                    content: { type: Type.STRING, description: "Detailed clinical explanation in Thai" }
                  },
                  required: ["status", "statusText", "title", "content"]
                },
                chronicConditions: {
                  type: Type.OBJECT,
                  properties: {
                    status: { type: Type.STRING },
                    statusText: { type: Type.STRING },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING }
                  },
                  required: ["status", "statusText", "title", "content"]
                },
                interactions: {
                  type: Type.OBJECT,
                  properties: {
                    summary: { type: Type.STRING, description: "Summary of drug-herb interactions found" },
                    items: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          drugName: { type: Type.STRING },
                          severity: { type: Type.STRING, description: "safe, info, cautionary, warning, alert" },
                          severityText: { type: Type.STRING, description: "severity text in Thai" },
                          mechanism: { type: Type.STRING, description: "Pharmacokinetic/pharmacodynamic mechanism explanation" },
                          recommendation: { type: Type.STRING, description: "Specific guidance on timing, dose, or actions" }
                        },
                        required: ["drugName", "severity", "severityText", "mechanism", "recommendation"]
                      }
                    }
                  },
                  required: ["summary", "items"]
                },
                specialPopulations: {
                  type: Type.OBJECT,
                  properties: {
                    status: { type: Type.STRING },
                    statusText: { type: Type.STRING },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING }
                  },
                  required: ["status", "statusText", "title", "content"]
                },
                dataCompleteness: {
                  type: Type.OBJECT,
                  properties: {
                    status: { type: Type.STRING },
                    statusText: { type: Type.STRING },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING }
                  },
                  required: ["status", "statusText", "title", "content"]
                }
              },
              required: ["symptomFit", "chronicConditions", "interactions", "specialPopulations", "dataCompleteness"]
            },
            recommendedQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "At least 4 customized clinical questions for pharmacist/doctor in Thai."
            }
          },
          required: [
            "safetyScore",
            "safetyLevel",
            "safetyLevelText",
            "summary",
            "completenessIndex",
            "completenessText",
            "dimensions",
            "recommendedQuestions"
          ]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Simulation error:", error);
    res.status(500).json({ error: error.message || "Failed to run clinical safety simulation" });
  }
});

// FDA License & Traditional Medicine Registration Search API (Direct MOPH FDA Web Service)
app.post("/api/fda-check", async (req, res) => {
  try {
    const { query, operation = "GET_DATA_HERB" } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Missing search query" });
    }

    const cleanQuery = query.trim();
    const https = await import("https");

    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${operation} xmlns="http://tempuri.org/">
      <DATAS>${cleanQuery.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</DATAS>
    </${operation}>
  </soap:Body>
</soap:Envelope>`;

    const fdaReq = https.request("https://porta.fda.moph.go.th/FDA_SEARCH_ALL/WS_LICENSE_SEARCH.asmx", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": `"http://tempuri.org/${operation}"`,
        "Content-Length": Buffer.byteLength(soapBody),
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      timeout: 10000
    }, (fdaRes) => {
      let rawXml = "";
      fdaRes.on("data", (chunk) => { rawXml += chunk; });
      fdaRes.on("end", () => {
        const results: any[] = [];
        const tableMatches = rawXml.match(/<Table1[\s\S]*?<\/Table1>/g) || [];

        for (const table of tableMatches.slice(0, 15)) {
          const getTag = (tag: string) => {
            const m = table.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
            return m ? m[1].trim() : "";
          };

          const regNo = getTag("lcnno");
          const nameTh = getTag("productha");
          const nameEn = getTag("produceng");
          const status = getTag("cncnm");
          const applicant = getTag("licen");
          const manufacturer = getTag("thanm");
          const address = getTag("Addr");
          const fdaUrl = getTag("URLs");
          const newCode = getTag("Newcode");
          const type = getTag("typepro");

          if (regNo || nameTh || manufacturer) {
            results.push({
              regNo,
              nameTh,
              nameEn,
              status: status || "ไม่ระบุ",
              isValid: status.includes("คงอยู่") && !status.includes("ไม่ต่ออายุ"),
              isExpiredOrCanceled: status.includes("ยกเลิก") || status.includes("ไม่ต่ออายุ") || status.includes("สิ้นสภาพ"),
              applicant,
              manufacturer,
              address,
              fdaUrl,
              newCode,
              type: type || "ผลิตภัณฑ์สมุนไพร"
            });
          }
        }

        res.json({
          source: "FDA_MOPH_THAILAND",
          query: cleanQuery,
          total: results.length,
          results
        });
      });
    });

    fdaReq.on("error", (err) => {
      console.error("FDA Soap Request Error:", err);
      res.status(502).json({ error: "FDA Server unreachable", details: err.message });
    });

    fdaReq.on("timeout", () => {
      fdaReq.destroy();
      res.status(504).json({ error: "FDA Service timeout" });
    });

    fdaReq.write(soapBody);
    fdaReq.end();
  } catch (err: any) {
    console.error("FDA Endpoint Internal Error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Setup Vite Dev Server / Serve Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
