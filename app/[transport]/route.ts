// app/api/mcp/route.ts
// Self-contained MCP server for Cheer Pal on Vercel

import { NextRequest } from "next/server";

// Minimal MCP server implementation
type Tool = {
  name: string;
  description: string;
  inputSchema: any;
  execute: (input: any) => Promise<any>;
};

const tools: Tool[] = [
  {
    name: "check_subscription",
    description: "Checks if a user has an active subscription (stub for now).",
    inputSchema: {
      type: "object",
      properties: { user_id: { type: "string", description: "email or app user id" } },
      required: ["user_id"]
    },
    execute: async (input) => {
      const renewsOn = new Date();
      renewsOn.setMonth(renewsOn.getMonth() + 1);
      return {
        content: [{
          type: "json",
          json: {
            active: true,
            plan: "Pro-Monthly",
            renews_on: renewsOn.toISOString().slice(0, 10)
          }
        }]
      };
    }
  },
  {
    name: "get_practice_plan",
    description: "Returns a practice plan by age band, level, and time.",
    inputSchema: {
      type: "object",
      properties: {
        age_band: { type: "string", examples: ["5-7","8-11","12-14","15-18"] },
        level: { type: "string", examples: ["1","2","3","4"] },
        minutes: { type: "number", minimum: 5, maximum: 60 }
      },
      required: ["age_band","level","minutes"]
    },
    execute: async (input) => {
      const { age_band, level, minutes } = input;
      const warmup = ["Light jog 2 min","Arm circles x20","Neck rolls x10"];
      const skills = level === "1"
        ? ["Toe touch drills x10","High V / Low V x10","Clap & clean x10"]
        : ["Jumps combo x12","T motions x12","Core holds 30s x3"];
      const cooldown = ["Hamstring stretch 30s x2","Quad stretch 30s x2","Deep breaths 1 min"];
      return {
        content: [{
          type: "json",
          json: {
            title: `Level ${level} — ${minutes} min plan (ages ${age_band})`,
            sections: [
              { name: "Warm-up", items: warmup },
              { name: "Skills", items: skills },
              { name: "Cool-down", items: cooldown }
            ],
            badges: ["Consistency-Star"]
          }
        }]
      };
    }
  },
  {
    name: "get_media",
    description: "Return video/PDF/image links for a topic and age-band.",
    inputSchema: {
      type: "object",
      properties: {
        role: { type: "string", examples: ["cheerleader","mom"] },
        age_band: { type: "string", examples: ["5-7","8-11","12-14","15-18"] },
        topic: { type: "string", examples: ["toe-touch","stretching","competition-prep"] }
      },
      required: ["role","age_band","topic"]
    },
    execute: async () => {
      const base = process.env.PUBLIC_BASE_MEDIA_URL || "https://example.com";
      const TEST_VIDEO_ID = "M7lc1UVf-VE";
      const embed_url = `https://www.youtube.com/embed/${TEST_VIDEO_ID}`;
      const watch_url = `https://www.youtube.com/watch?v=${TEST_VIDEO_ID}`;
      return {
        content: [{
          type: "json",
          json: {
            items: [
              {
                id: `yt_${TEST_VIDEO_ID}`,
                type: "video",
                title: "Toe Touch (Demo Video)",
                embed_url,
                watch_url,
                duration_sec: 18
              },
              {
                id: "pdf_checklist_01",
                type: "pdf",
                title: "Toe Touch Checklist",
                url: `${base}/docs/toe_touch_checklist.pdf`
              },
              {
                id: "img_form_cues_01",
                type: "image",
                title: "Form Cues",
                url: `${base}/images/form_cues.png`
              }
            ]
          }
        }]
      };
    }
  },
  {
    name: "list_media",
    description: "Lists media topics available by role and age band.",
    inputSchema: {
      type: "object",
      properties: {
        role: { type: "string" },
        age_band: { type: "string" }
      },
      required: ["role","age_band"]
    },
    execute: async () => {
      return {
        content: [{
          type: "json",
          json: { topics: ["toe-touch","stretching","competition-prep"] }
        }]
      };
    }
  },
  {
    name: "log_progress",
    description: "Logs a skill completion (stub).",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        skill: { type: "string" },
        outcome: { type: "string", examples: ["completed","partial","skipped"] }
      },
      required: ["user_id","skill","outcome"]
    },
    execute: async (input) => {
      const earned = input.outcome === "completed";
      return {
        content: [{
          type: "json",
          json: { ok: true, streak_days: earned ? 1 : 0, earned_badge: earned ? "Toe-Touch-Novice" : null }
        }]
      };
    }
  }
];

// Handle POST requests from MCP client
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tool, input } = body;

  const found = tools.find(t => t.name === tool);
  if (!found) {
    return new Response(JSON.stringify({ error: "Tool not found" }), { status: 404 });
  }

  try {
    const result = await found.execute(input);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// For MCP discovery
export async function GET() {
  return new Response(JSON.stringify({
    name: "Cheer Pal MCP Server",
    tools: tools.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema
    }))
  }), { status: 200 });
}



